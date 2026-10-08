import os
import sys
from pathlib import Path

_current_dir = Path(__file__).resolve().parent.parent
_parent_dir = _current_dir.parent
if str(_parent_dir) not in sys.path:
    sys.path.insert(0, str(_parent_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

try:
    from config import (
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
        GOOGLE_APPLICATION_CREDENTIALS,
        FIRESTORE_EMULATOR_HOST,
    )
    from db.local_store import LocalFirestoreStore
except ImportError:
    from backend.config import (
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
        GOOGLE_APPLICATION_CREDENTIALS,
        FIRESTORE_EMULATOR_HOST,
    )
    from backend.db.local_store import LocalFirestoreStore



try:
    from firebase_config import get_firestore_client
except ImportError:
    from backend.firebase_config import get_firestore_client

db_instance = None
db_mode = "unknown"

def get_db():
    global db_instance, db_mode
    if db_instance is not None:
        return db_instance, db_mode

    db_instance = get_firestore_client()
    db_mode = "firestore" if not hasattr(db_instance, "_data") else "local_mock"
    print(f"[LOGIX DB] Initialized database mode: {db_mode}")
    return db_instance, db_mode

