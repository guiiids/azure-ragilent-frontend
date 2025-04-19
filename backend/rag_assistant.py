import logging
from datetime import datetime
from typing import List, Dict, Tuple, Optional

from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from config import (
    OPENAI_ENDPOINT,
    OPENAI_KEY,
    EMBEDDING_DEPLOYMENT,
    CHAT_DEPLOYMENT,
    SEARCH_ENDPOINT,
    SEARCH_INDEX,
    SEARCH_KEY,
    VECTOR_FIELD,
)

today = datetime.today().strftime("%B %d, %Y")
logger = logging.getLogger(__name__)

class AzureRAGAssistant:
    def __init__(self, client):
        self.client = client
        self.chat_deployment = CHAT_DEPLOYMENT
        self.embedding_deployment = EMBEDDING_DEPLOYMENT
        self.search_endpoint = SEARCH_ENDPOINT
        self.search_index = SEARCH_INDEX
        self.search_key = SEARCH_KEY
        self.vector_field = VECTOR_FIELD

    def generate_embedding(self, text: str) -> Optional[List[float]]:
        if not text:
            logger.warning("Empty text provided for embedding generation")
            return None
        try:
            response = self.client.embeddings.create(
                input=[text.strip()],
                model=self.embedding_deployment
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            return None

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        try:
            if len(vec1) != len(vec2):
                raise ValueError("Vectors must have the same dimension")
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            magnitude1 = sum(a * a for a in vec1) ** 0.5
            magnitude2 = sum(b * b for b in vec2) ** 0.5
            if magnitude1 * magnitude2 == 0:
                return 0
            return dot_product / (magnitude1 * magnitude2)
        except Exception as e:
            logger.error(f"Cosine similarity calculation error: {e}")
            return 0

    def filter_results(self, results: List[Dict], query: str, similarity_threshold: float = 0.7) -> List[Dict]:
        filtered_results = []
        query_embedding = self.generate_embedding(query)
        if not query_embedding:
            return []
        for result in results:
            content = result.get('chunk', '')
            content_embedding = self.generate_embedding(content)
            if content_embedding:
                similarity = self.cosine_similarity(query_embedding, content_embedding)
                if similarity > similarity_threshold:
                    result['relevance'] = similarity
                    filtered_results.append(result)
        return sorted(filtered_results, key=lambda x: x['relevance'], reverse=True)

    def search_knowledge_base(self, query: str) -> List[Dict]:
        try:
            search_client = SearchClient(
                endpoint=f"https://{self.search_endpoint}.search.windows.net",
                index_name=self.search_index,
                credential=AzureKeyCredential(self.search_key)
            )
            query_embedding = self.generate_embedding(query)
            if not query_embedding:
                return []
            vector_query = VectorizedQuery(
                vector=query_embedding,
                k_nearest_neighbors=10,
                fields=self.vector_field
            )
            results = search_client.search(
                search_text=query,
                vector_queries=[vector_query],
                top=10,
                select=["chunk", "title"]
            )
            processed_results = []
            for result in results:
                title = result.get("title", "Untitled Document")
                chunk = result.get("chunk", "")
                processed_results.append({
                    "chunk": chunk.strip(),
                    "title": title,
                    "relevance": 1.0
                })
            return processed_results
        except Exception as e:
            logger.error(f"Knowledge base search error: {e}")
            return []

    def validate_citations(self, answer: str, source_map: Dict) -> bool:
        return any(f"[{key}]" in answer for key in source_map)

    def _prepare_context(self, search_results: List[Dict]) -> Tuple[str, Dict]:
        context_entries = []
        source_map = {}
        for i, result in enumerate(search_results[:5], 1):
            source_id = f"Source_{i}"
            chunk = result.get('chunk', '').strip()
            if chunk:
                context_entries.append(f"{source_id}: {chunk}")
                source_map[source_id] = {
                    'title': result.get('title', f'Document {i}'),
                    'content': chunk,
                    'url': result.get('url', '#'),
                    'category': result.get('category', 'Uncategorized')
                }
        context = "\n\n".join(context_entries)
        return context, source_map

    def _generate_answer(self, query: str, context: str, source_map: Dict) -> str:
        system_prompt = f"""
You are a factual, grounded AI assistant. Today is {today}. Your job is to answer questions strictly based on the provided context.

⏳ Temporal Awareness:
If the user's question involves **time, dates, or version status**, you must:
- Identify date-like strings (e.g., "Oct 2025", "10/2025", "October 1, 2024", "03/23", etc.).
- Convert them into actual datetime objects.
- Compare those dates against today's date ({today}) to determine if they are in the past or future.
- Then re-check the user’s original question: Were they asking about the current status, a past time, or a future event?
- Ensure your response aligns with the user's **temporal intent** and not just static facts.

🔒 Strict Rules:
0. For OpenLab CDS support questions:
   - If both the 'End of Active Support' and 'End of Limited Support' are before today → mark as OUT OF SUPPORT.
   - If 'End of Active Support' is before today but 'End of Limited Support' is still in the future → mark as LIMITED SUPPORT.
   - If 'End of Active Support' is in the future → mark as SUPPORTED.
   Use these date rules only. Do not rely on phrases like "Active Support" unless backed by clear dates.
   If any necessary date is missing, you must say: "The document does not provide a definitive answer."

1. Use only information explicitly stated in the context.
2. Do not add assumptions or generalizations.
3. Cite all claims using numbered sources like [Source_1].

💡 Format:
- Briefly restate the user’s question.
- Organize your answer in categories: SUPPORTED, LIMITED SUPPORT, OUT OF SUPPORT, and Not Determinable (if dates are missing).
- Include versions, relevant dates, and status.
- Make your reasoning traceable and clear.
"""

        user_prompt = f"""
### Context:
{context}

### Question:
{query}
Also, confirm today’s date as given in your system instructions.
### Answer:
"""

        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.chat_deployment,
                messages=messages,
                temperature=0.2,
                max_tokens=800
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}", exc_info=True)
            return "An error occurred while generating the answer."

    def _filter_cited_sources(self, answer: str, source_map: Dict) -> List[Dict]:
        cited_sources_list = []
        added_titles = set() # Keep track of titles already added
        for source_id, source_info in source_map.items():
            if f"[{source_id}]" in answer:
                title = source_info.get('title')
                # Only add if the title exists and hasn't been added yet
                if title and title not in added_titles:
                    cited_sources_list.append(source_info)
                    added_titles.add(title)
        return cited_sources_list

    def get_recommendations(self, search_results: List[Dict], user_preferences: Optional[Dict] = None) -> List[Dict]:
        recommendations = []
        for result in search_results[1:6]:
            recommendations.append({
                "title": result.get('title', 'Untitled'),
                "snippet": result.get('chunk', '')[:150] + "...",
                "score": round(result.get('relevance', 1.0) * 10, 2)
            })
        return recommendations

    def generate_rag_response(self, query: str) -> Tuple[str, List[Dict], List[Dict]]:
        try:
            search_results = self.search_knowledge_base(query)
            context, source_map = self._prepare_context(search_results)
            answer = self._generate_answer(query, context, source_map)
            cited_sources = self._filter_cited_sources(answer, source_map)
            recommendations = self.get_recommendations(search_results)
            return answer, cited_sources, recommendations
        except Exception as e:
            logger.error(f"RAG response generation error: {e}")
            return "Sorry, I encountered an error.", [], []
