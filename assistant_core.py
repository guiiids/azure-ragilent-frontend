
import os
import openai
from openai import AzureOpenAI
import logging
import traceback
import datetime
import json
from rag_assistant import AzureRAGAssistant
from vote_manager import init_db, record_vote



# Removed basicConfig call to avoid conflicts with api.py logging

openai.log = "debug"

# Import config values
from config import *
print(f"Config values: {OPENAI_ENDPOINT}, {OPENAI_KEY}, {EMBEDDING_DEPLOYMENT}, {CHAT_DEPLOYMENT}")

# Config values (directly from config.py / .env)
endpoint = OPENAI_ENDPOINT
deployment = CHAT_DEPLOYMENT
subscription_key = OPENAI_KEY
api_version = "2024-12-01-preview" # Or fetch from config if defined there

# Log the configuration being used
logging.info(f"Using endpoint: {endpoint}")
logging.info(f"Using deployment: {deployment}")
logging.info(f"API key set: {'Yes' if subscription_key else 'No'}")

# Ensure endpoint starts with https:// (Optional: Add check if needed, but assume .env is correct)
# if endpoint and not endpoint.startswith(('http://', 'https://')):
#     logging.warning(f"Endpoint '{endpoint}' is missing protocol. Prepending 'https://'.")
#     endpoint = f"https://{endpoint}"

# Initialize Azure Client
try:
    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint, # Use endpoint directly from config
        api_key=subscription_key, # Use key directly from config
    )
    logging.info("AzureOpenAI client initialized successfully.")
except Exception as e:
    logging.error("Failed to initialize AzureOpenAI client", exc_info=True)
    raise

rag_assistant = AzureRAGAssistant(client)


def run_chat(query):
    try:
        logging.info(f"Starting run_chat with query: {query}")
        
        # Grab context manually from rag_assistant
        logging.info("Searching knowledge base...")
        search_results = rag_assistant.search_knowledge_base(query)
        logging.info(f"Found {len(search_results)} search results")
        
        logging.info("Preparing context from search results...")
        context, source_map = rag_assistant._prepare_context(search_results)
        logging.info(f"Context prepared with {len(source_map)} sources")
        
        logging.info("Generating answer...")
        answer = rag_assistant._generate_answer(query, context, source_map)
        logging.info(f"Answer generated: {answer[:100]}...")  # Log first 100 chars
        
        logging.info("Filtering cited sources...")
        cited_sources = rag_assistant._filter_cited_sources(answer, source_map)
        logging.info(f"Found {len(cited_sources)} cited sources")
        
        logging.info("Getting recommendations...")
        recommendations = rag_assistant.get_recommendations(search_results)
        
        # ----- Evaluate the interaction -----
        # Evaluation step using the actual context
        logging.info("Starting evaluation...")
        evaluation_system_prompt = """
You are a forensic LLM evaluator. Your job is to assess whether the model's answer is factually supported by the provided context.

You must be STRICT. The model's answer should ONLY include facts that are clearly and explicitly stated in the context.

For every factual claim made by the model, find the exact supporting sentence in the context. If no such sentence exists, mark the claim as unsupported.

If even ONE claim is not supported, mark the answer as factually incorrect.

---

Instructions:

1. For each key fact or claim made in the model’s answer, show:
   - The **claim**
   - The **matching sentence** from the context (verbatim), OR mark it as ❌ not found

2. Then rate the overall answer quality:
   - Did the model understand the user’s intent?
   - Did it cite the right things?
   - Did it miss anything important?

3. Be ruthless but fair. Do not assume or imagine context.

---

Return ONLY the following JSON structure — no Markdown, no formatting:

{
  "user_question": "<...>",
  "bot_understood_question": "<Yes/No>",
  "response_type": "<Task-based | Informational>",
  "response_effectiveness": "<Fully | Mostly | Partially | Not at all>",
  "factually_correct": "<Yes/No>",
  "engagement_proactiveness": "<Excellent | Good | Minimal | None>",
  "confidence_in_evaluation": "<1/5-5/5>",
  "context_utilization": "<Fully | Partially | Not at all>",
  "context_matches": [
    {
      "claim": "<quoted part of the bot's answer>",
      "match": "<verbatim matching line from the context OR ❌ Not found>"
    }
  ],
  "issues_identified": [
    "<bullet-style issues>"
  ],
  "suggested_improvements": [
    "<bullet-style improvements>"
  ]
}
"""

        evaluation_messages = [
    {
        "role": "system",
        "content": evaluation_system_prompt.strip()
    },
    {
        "role": "user",
        "content": f"Context:\n{context}\n\nUser Question: {query}\n\nModel Answer: {answer}"
    }
]

        logging.info("Sending evaluation request to Azure OpenAI...")
        try:
            eval_response = client.chat.completions.create(
                model=deployment,
                messages=evaluation_messages,
                temperature=0.1,
                max_tokens=800
            )
            logging.info("Received evaluation response")
            eval_text = eval_response.choices[0].message.content.strip()
            logging.debug(f"Evaluation text: {eval_text[:200]}...")  # Log first 200 chars
            
            try:
                logging.info("Parsing evaluation JSON...")
                evaluation = json.loads(eval_text)
                logging.info("Evaluation JSON parsed successfully")
            except json.JSONDecodeError as json_err:
                logging.error(f"Failed to parse evaluation JSON: {str(json_err)}")
                logging.error(f"Raw evaluation text: {eval_text}")
                evaluation = {"raw_text": eval_text, "error": f"Failed to parse evaluation JSON: {str(json_err)}"}
        except Exception as eval_err:
            logging.error(f"Error during evaluation request: {str(eval_err)}")
            evaluation = {"error": f"Evaluation failed: {str(eval_err)}"}

        result = {
            "answer": answer,
            "sources": cited_sources,
            "recommendations": recommendations,
            "evaluation": evaluation,
            "context": context
        }
        
        logging.info("run_chat completed successfully")
        return result

    except Exception as e:
        logging.error("❌ Error in run_chat: Connection error or processing failure.")
        logging.error(f"Exception type: {type(e).__name__}")
        logging.error(f"Exception args: {e.args}")
        logging.error("Stack trace:\n" + traceback.format_exc())
        return {"error": str(e)}

if __name__ == "__main__":
    # Initialize database first
    init_db()

    # Run the chat
    result = run_chat("I need help changing the financial contact in one of the labs")

    # Record the vote + comment
    record_vote("yes", "Clear answer, thanks!", "No issues found", "yes", "Great response!")

    # Display output
    if "error" in result:
        print("❌ Error:\n", result["error"])
    else:
        print("✅ Answer:\n", result["answer"])
        print("\n📚 Sources:\n", [s["title"] for s in result["sources"]])
        print("\n🧪 Evaluation:\n", result["evaluation"])
