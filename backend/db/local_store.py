import json
from pathlib import Path
from typing import Dict, List, Any, Optional

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "local_db.json"

class DocumentSnapshot:
    def __init__(self, doc_id: str, data: Optional[Dict[str, Any]]):
        self.id = doc_id
        self._data = data or {}

    @property
    def exists(self) -> bool:
        return bool(self._data)

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data)

class DocumentReference:
    def __init__(self, collection: "CollectionReference", doc_id: str):
        self.collection = collection
        self.id = doc_id

    def get(self) -> DocumentSnapshot:
        data = self.collection.store._data.get(self.collection.name, {}).get(self.id)
        return DocumentSnapshot(self.id, data)

    def set(self, data: Dict[str, Any], merge: bool = False):
        coll_data = self.collection.store._data.setdefault(self.collection.name, {})
        if merge and self.id in coll_data:
            coll_data[self.id].update(data)
        else:
            coll_data[self.id] = dict(data)
        self.collection.store._save()

    def update(self, data: Dict[str, Any]):
        coll_data = self.collection.store._data.setdefault(self.collection.name, {})
        if self.id in coll_data:
            coll_data[self.id].update(data)
            self.collection.store._save()
        else:
            self.set(data)

    def delete(self):
        coll_data = self.collection.store.get(self.collection.name, {})
        if self.id in coll_data:
            del coll_data[self.id]
            self.collection.store._save()

class CollectionReference:
    def __init__(self, store: "LocalFirestoreStore", name: str):
        self.store = store
        self.name = name

    def document(self, doc_id: str) -> DocumentReference:
        return DocumentReference(self, doc_id)

    def get(self) -> List[DocumentSnapshot]:
        docs = self.store._data.get(self.name, {})
        return [DocumentSnapshot(doc_id, data) for doc_id, data in docs.items()]

    def stream(self) -> List[DocumentSnapshot]:
        return self.get()

    def where(self, field: str, op: str, value: Any) -> "QueryReference":
        return QueryReference(self, [(field, op, value)])

class QueryReference:
    def __init__(self, collection: CollectionReference, filters: List[tuple]):
        self.collection = collection
        self.filters = filters

    def where(self, field: str, op: str, value: Any) -> "QueryReference":
        return QueryReference(self.collection, self.filters + [(field, op, value)])

    def stream(self) -> List[DocumentSnapshot]:
        docs = self.collection.get()
        result = []
        for doc in docs:
            d = doc.to_dict()
            match = True
            for field, op, val in self.filters:
                doc_val = d.get(field)
                if op == "==":
                    if doc_val != val: match = False
                elif op == "!=":
                    if doc_val == val: match = False
                elif op == ">":
                    if not (doc_val is not None and doc_val > val): match = False
                elif op == "<":
                    if not (doc_val is not None and doc_val < val): match = False
                elif op == "in":
                    if doc_val not in val: match = False
            if match:
                result.append(doc)
        return result

    def get(self) -> List[DocumentSnapshot]:
        return self.stream()

class LocalFirestoreStore:
    def __init__(self, file_path: Path = DB_FILE):
        self.file_path = file_path
        self.file_path.parent.mkdir(exist_ok=True)
        self._data: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._dirty_count = 0
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = {}

    def _save(self, force: bool = False):
        self._dirty_count += 1
        if force or self._dirty_count >= 50:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
            self._dirty_count = 0

    def flush(self):
        self._save(force=True)

    def collection(self, name: str) -> CollectionReference:
        return CollectionReference(self, name)

