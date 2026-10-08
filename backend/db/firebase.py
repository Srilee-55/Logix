import os
import sys
from pathlib import Path

from backend.config import (
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    GOOGLE_APPLICATION_CREDENTIALS,
    FIRESTORE_EMULATOR_HOST,
)
from backend.db.local_store import LocalFirestoreStore

db_instance = None
db_mode = "unknown"

def get_db():
    global db_instance, db_mode
    if db_instance is not None:
        return db_instance, db_mode

    # 1. Check for Firestore Emulator
    if FIRESTORE_EMULATOR_HOST:
        os.environ["FIRESTORE_EMULATOR_HOST"] = FIRESTORE_EMULATOR_HOST
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            app = firebase_admin.initialize_app(
                options={"projectId": FIREBASE_PROJECT_ID}
            )
        db_instance = firestore.client()
        db_mode = "emulator"
        print(f"[LOGIX DB] Connected to Firestore Emulator at {FIRESTORE_EMULATOR_HOST}")
        return db_instance, db_mode

    # 2. Check for environment credentials (CLIENT_EMAIL & PRIVATE_KEY)
    if FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY:
        import firebase_admin
        from firebase_admin import credentials, firestore

        private_key = FIREBASE_PRIVATE_KEY.replace("\\n", "\n")
        cred_dict = {
            "type": "service_account",
            "project_id": FIREBASE_PROJECT_ID,
            "client_email": FIREBASE_CLIENT_EMAIL,
            "private_key": private_key,
        }

        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})

        db_instance = firestore.client()
        db_mode = "firestore_env"
        print(f"[LOGIX DB] Connected to Cloud Firestore via env credentials (Project: {FIREBASE_PROJECT_ID})")
        return db_instance, db_mode

    # 3. Check for service account JSON file
    if GOOGLE_APPLICATION_CREDENTIALS:
        cred_path = Path(GOOGLE_APPLICATION_CREDENTIALS)
        if not cred_path.exists():
            error_msg = (
                f"\n=======================================================\n"
                f"[FIREBASE CONFIG ERROR] GOOGLE_APPLICATION_CREDENTIALS is set to '{GOOGLE_APPLICATION_CREDENTIALS}', "
                f"but file was NOT found!\n"
                f"Action required: Provide a valid Firebase service account JSON file, "
                f"or set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env, "
                f"or set FIRESTORE_EMULATOR_HOST=localhost:8080.\n"
                f"=======================================================\n"
            )
            print(error_msg, file=sys.stderr)
            raise RuntimeError(error_msg)

        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})

        db_instance = firestore.client()
        db_mode = "firestore_json"
        print(f"[LOGIX DB] Connected to Cloud Firestore via service account JSON (Project: {FIREBASE_PROJECT_ID})")
        return db_instance, db_mode

    # 4. Fallback to Local Firestore Store
    db_instance = LocalFirestoreStore()
    db_mode = "local_mock"
    print("[LOGIX DB] Operating in Local Firestore Mock mode (No cloud credentials / emulator specified).")
    return db_instance, db_mode
