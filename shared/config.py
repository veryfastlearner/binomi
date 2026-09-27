# config.py
# Binomi configuration - environment variables and constants

import os
from dotenv import load_dotenv

load_dotenv()

# Data directory for JSON file storage
DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"))

# LLM (Groq)
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Backend
BACKEND_HOST = os.getenv("BACKEND_HOST", "localhost")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
BACKEND_URL = f"http://{BACKEND_HOST}:{BACKEND_PORT}"
WS_URL = f"ws://{BACKEND_HOST}:{BACKEND_PORT}"

# Frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

# Debug / Logging
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Tunisia Localization
CURRENCY = "TND"
CURRENCY_SYMBOL = "د.ت"
CURRENCY_CODE = "TND"

TUNISIA_CITIES = [
    "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes", "Ariana",
    "Gafsa", "Monastir", "Ben Arous", "Kasserine", "Medenine", "Nabeul",
    "Jendouba", "Kef", "Siliana", "Mahdia", "Tataouine", "Tozeur", "Zaghouan",
]

TUNISIA_NEIGHBORHOODS = {
    "Tunis": ["La Marsa", "Carthage", "Sidi Bou Said", "El Menzah", "El Manar", "Ennasr", "Berges du Lac", "Centre Ville", "Bab Souika", "Halfaouine"],
    "Sfax": ["Centre Ville", "Route de Tunis", "Route de Gabes", "El Ain", "Thyna", "Sakiet Ezzit"],
    "Sousse": ["Centre Ville", "Khezama", "Riadh", "Hammam Sousse", "Akouda", "Kantaoui"],
    "Kairouan": ["Centre Ville", "Sbikha", "Haffouz", "El Oueslatia"],
    "Bizerte": ["Centre Ville", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Utique"],
    "Gabes": ["Centre Ville", "Mareth", "El Hamma", "Metouia"],
    "Ariana": ["Ariana Ville", "Raoued", "Soukra", "Ezzahra", "Borj Touil"],
    "Gafsa": ["Centre Ville", "Metlaoui", "Redeyef", "Mdhilla"],
    "Monastir": ["Centre Ville", "Sayada", "Bembla", "Teboulba", "Ksar Hellal"],
    "Ben Arous": ["Ben Arous Ville", "Radès", "Hammam Lif", "Hammam Chatt", "Ezzahra"],
    "Kasserine": ["Centre Ville", "Sbeitla", "Feriana", "Thala"],
    "Medenine": ["Centre Ville", "Djerba", "Zarzis", "Ben Gardane"],
    "Nabeul": ["Centre Ville", "Hammamet", "Kelibia", "Menzel Temime", "Korba"],
    "Jendouba": ["Centre Ville", "Tabarka", "Ain Draham", "Fernana"],
    "Kef": ["Centre Ville", "Tajerouine", "Jerissa", "Kalaat Senan"],
    "Siliana": ["Centre Ville", "Makthar", "Rouhia", "Gaafour"],
    "Mahdia": ["Centre Ville", "Chebba", "Melloulèche", "El Jem", "Ksour Essef"],
    "Tataouine": ["Centre Ville", "Ghomrassen", "Remada", "Dehiba"],
    "Tozeur": ["Centre Ville", "Nefta", "Tamerza", "Hazoua"],
    "Zaghouan": ["Centre Ville", "Fahs", "Nadhour", "Saouaf"],
}

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "flag": "🇺🇸"},
    "fr": {"name": "French", "native": "Français", "flag": "🇫🇷"},
    "ar": {"name": "Arabic", "native": "العربية", "flag": "🇹🇳"},
}

DEFAULT_LANGUAGE = "fr"

# Budget ranges in TND (monthly rent per person)
BUDGET_MIN_TND = 200
BUDGET_MAX_TND = 2000
BUDGET_DEFAULT_MIN = 400
BUDGET_DEFAULT_MAX = 1000