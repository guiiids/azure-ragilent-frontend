import os
from dataclasses import dataclass, field
from typing import Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

@dataclass
class AppConfig:
    # Azure OpenAI Configuration
    OPENAI_ENDPOINT: str = os.getenv("OPENAI_ENDPOINT", "")
    OPENAI_KEY: str = os.getenv("OPENAI_KEY", "")
    EMBEDDING_DEPLOYMENT: str = os.getenv("EMBEDDING_DEPLOYMENT", "embedding01")
    CHAT_DEPLOYMENT: str = os.getenv("CHAT_DEPLOYMENT", "deployment02")

    # Azure Cognitive Search Configuration
    SEARCH_ENDPOINT: str = os.getenv("SEARCH_ENDPOINT", "")
    SEARCH_INDEX: str = os.getenv("SEARCH_INDEX", "")
    SEARCH_KEY: str = os.getenv("SEARCH_KEY", "")
    VECTOR_FIELD: str = os.getenv("VECTOR_FIELD", "text_vector")

    # Field Mappings
    FIELD_MAPPINGS: Dict[str, str] = field(default_factory=lambda: {
        "id": "chunk_id",
        "content": "chunk",
        "title": "title",
        "text_vector": "text_vector",
    })

    # Application Settings
    FEEDBACK_DIR: str = "feedback_data"

# Create a global instance of the config
config = AppConfig()

# For backward compatibility, expose the variables at module level
OPENAI_ENDPOINT = config.OPENAI_ENDPOINT
OPENAI_KEY = config.OPENAI_KEY
EMBEDDING_DEPLOYMENT = config.EMBEDDING_DEPLOYMENT
CHAT_DEPLOYMENT = config.CHAT_DEPLOYMENT
SEARCH_ENDPOINT = config.SEARCH_ENDPOINT
SEARCH_INDEX = config.SEARCH_INDEX
SEARCH_KEY = config.SEARCH_KEY
VECTOR_FIELD = config.VECTOR_FIELD
FIELD_MAPPINGS = config.FIELD_MAPPINGS
FEEDBACK_DIR = config.FEEDBACK_DIR

# Export the config instance
__all__ = ['config', 'AppConfig',
           'OPENAI_ENDPOINT', 'OPENAI_KEY', 'EMBEDDING_DEPLOYMENT', 'CHAT_DEPLOYMENT',
           'SEARCH_ENDPOINT', 'SEARCH_INDEX', 'SEARCH_KEY', 'VECTOR_FIELD',
           'FIELD_MAPPINGS', 'FEEDBACK_DIR']
