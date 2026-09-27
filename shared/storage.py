# shared/storage.py
# JSON file-based storage with atomic write-then-rename and file locking

import os
import json
import uuid
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from contextlib import contextmanager

from .config import DATA_DIR, DEBUG

DATA_FILES = {
    "users": "users.json",
    "questionnaires": "questionnaires.json",
    "matches": "matches.json",
    "negotiation_logs": "negotiation_logs.json",
}

_file_locks: Dict[str, threading.Lock] = {}
_locks_lock = threading.Lock()


def _get_lock(filename: str) -> threading.Lock:
    with _locks_lock:
        if filename not in _file_locks:
            _file_locks[filename] = threading.Lock()
        return _file_locks[filename]


@contextmanager
def _file_lock(filename: str):
    lock = _get_lock(filename)
    lock.acquire()
    try:
        yield
    finally:
        lock.release()


def _get_data_path(filename: str) -> Path:
    return Path(DATA_DIR) / filename


def _atomic_write(path: Path, data: Any) -> None:
    temp_path = path.with_suffix(".tmp")
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(temp_path, path)


def _read_json(filename: str) -> Dict:
    path = _get_data_path(filename)
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            if DEBUG:
                print(f"[STORAGE] Corrupt JSON in {filename}, returning empty dict")
            return {}


def _write_json(filename: str, data: Dict) -> None:
    path = _get_data_path(filename)
    _atomic_write(path, data)


def read_all(entity: str) -> Dict:
    if entity not in DATA_FILES:
        raise ValueError(f"Unknown entity: {entity}")
    with _file_lock(DATA_FILES[entity]):
        return _read_json(DATA_FILES[entity])


def write_all(entity: str, data: Dict) -> None:
    if entity not in DATA_FILES:
        raise ValueError(f"Unknown entity: {entity}")
    with _file_lock(DATA_FILES[entity]):
        _write_json(DATA_FILES[entity], data)


def get_by_id(entity: str, id_key: str, record_id: str) -> Optional[Dict]:
    data = read_all(entity)
    return data.get(record_id)


def get_by_field(entity: str, field: str, value: Any) -> List[Dict]:
    data = read_all(entity)
    return [record for record in data.values() if record.get(field) == value]


def upsert(entity: str, id_key: str, record: Dict) -> Dict:
    if id_key not in record:
        record[id_key] = str(uuid.uuid4())
    data = read_all(entity)
    data[record[id_key]] = record
    write_all(entity, data)
    return record


def delete(entity: str, id_key: str, record_id: str) -> bool:
    data = read_all(entity)
    if record_id in data:
        del data[record_id]
        write_all(entity, data)
        return True
    return False


def find_one(entity: str, query: Dict) -> Optional[Dict]:
    data = read_all(entity)
    for record in data.values():
        match = True
        for k, v in query.items():
            if record.get(k) != v:
                match = False
                break
        if match:
            return record
    return None


def find_many(entity: str, query: Dict) -> List[Dict]:
    data = read_all(entity)
    results = []
    for record in data.values():
        match = True
        for k, v in query.items():
            if record.get(k) != v:
                match = False
                break
        if match:
            results.append(record)
    return results


def generate_id() -> str:
    return str(uuid.uuid4())


def get_timestamp() -> str:
    return datetime.utcnow().isoformat()