import os
from dotenv import load_dotenv

load_dotenv(".env")
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
print("CRED PATH:", cred_path)
print("EXISTS:", os.path.exists(cred_path) if cred_path else "NO")

from firebase_config import get_firestore_client
db = get_firestore_client()
print("DB:", db)
print("HAS _data:", hasattr(db, "_data"))
