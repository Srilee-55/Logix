"""
LOGIX Firebase Firestore Configuration Module
Initializes Firebase Admin SDK using GOOGLE_APPLICATION_CREDENTIALS,
environment service account credentials, or local mock store for local development.
"""

import os
import sys
from pathlib import Path

_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent
if str(_parent_dir) not in sys.path:
    sys.path.insert(0, str(_parent_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

from dotenv import load_dotenv
load_dotenv(_current_dir / ".env", override=True)

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_ADMIN_INSTALLED = True
except ImportError:
    FIREBASE_ADMIN_INSTALLED = False

def get_firestore_client():
    if not FIREBASE_ADMIN_INSTALLED:
        try:
            from db.local_store import LocalFirestoreStore
        except ImportError:
            from backend.db.local_store import LocalFirestoreStore
        return LocalFirestoreStore()

    if firebase_admin._apps:
        return firestore.client()

    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")
    project_id = os.getenv("FIREBASE_PROJECT_ID", "logix-74013")
    emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST")

    # 1. Firestore Emulator
    if emulator_host:
        os.environ["FIRESTORE_EMULATOR_HOST"] = emulator_host
        firebase_admin.initialize_app(options={"projectId": project_id})
        return firestore.client()

    # 2. Secret file (Render: /etc/secrets/firebase-service-account.json)
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {"projectId": project_id})
        return firestore.client()

    # 3. Environment Variables (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY)
    if client_email and private_key:
        formatted_key = private_key.replace("\\n", "\n")
        cred_dict = {
            "type": "service_account",
            "project_id": project_id,
            "client_email": client_email,
            "private_key": formatted_key,
        }
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred, {"projectId": project_id})
        return firestore.client()

    # 4. Fallback to LocalFirestoreStore for local offline development
    try:
        from db.local_store import LocalFirestoreStore
    except ImportError:
        from backend.db.local_store import LocalFirestoreStore
    return LocalFirestoreStore()

db = get_firestore_client()
