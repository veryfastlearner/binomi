# database.py
# JSON file-based storage for user data (replaces MongoDB)

from datetime import datetime
from typing import Optional
from .storage import (
    read_all, write_all, get_by_id, upsert, delete, find_one, find_many,
    generate_id, get_timestamp, DATA_FILES
)
from .config import DEBUG

USERS_FILE = DATA_FILES["users"]
QUESTIONNAIRES_FILE = DATA_FILES["questionnaires"]
MATCHES_FILE = DATA_FILES["matches"]
NEGOTIATION_LOGS_FILE = DATA_FILES["negotiation_logs"]
INTERACTIONS_FILE = "interactions.json"


def _ensure_interactions_file():
    """Ensure interactions.json exists"""
    import os
    from .config import DATA_DIR
    path = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump({}, f)


def save_user(
    user_id: str,
    name: str,
    questionnaire: dict,
    photos: list = None,
    profile_picture: str = None,
) -> bool:
    """Save or update user data based on user_id (email)."""
    import json
    import os
    from .config import DATA_DIR
    
    data = read_all("users")
    now = get_timestamp()
    existing = data.get(user_id)
    
    doc = {
        "user_id": user_id,
        "name": name,
        "questionnaire": questionnaire,
        "updated_at": now,
    }
    
    if photos:
        doc["photos"] = photos
    if profile_picture:
        doc["profile_picture_url"] = profile_picture
    if existing:
        doc["created_at"] = existing.get("created_at", now)
    else:
        doc["created_at"] = now
    
    data[user_id] = doc
    write_all("users", data)
    
    if DEBUG and questionnaire:
        print(f"[DB] Questionnaire saved for {user_id}")
    return True


def get_user(user_id: str) -> Optional[dict]:
    """Retrieve user by user_id (email)."""
    user = get_by_id("users", "user_id", user_id)
    return user


def get_all_users() -> list:
    """Get all users."""
    data = read_all("users")
    return list(data.values())


def user_exists(user_id: str) -> bool:
    """Check if a user exists."""
    return get_by_id("users", "user_id", user_id) is not None


def save_match_to_db(record: dict) -> bool:
    """Persist a match record to JSON."""
    match_id = record.get("match_id") or generate_id()
    record["match_id"] = match_id
    data = read_all("matches")
    data[match_id] = record
    write_all("matches", data)
    return True


def get_matches_for_user_from_db(user_id: str, include_incompatible: bool = False) -> list:
    """Fetch all matches involving a user from JSON."""
    data = read_all("matches")
    matches = []
    for match in data.values():
        if match.get("user_a_id") == user_id or match.get("user_b_id") == user_id:
            if not include_incompatible and match.get("status") == "incompatible":
                continue
            matches.append(match)
    matches.sort(key=lambda m: m.get("created_at", ""), reverse=True)
    return matches


def get_match_by_id_from_db(match_id: str) -> Optional[dict]:
    """Fetch a single match by match_id."""
    return get_by_id("matches", "match_id", match_id)


def get_match_counts_for_user(user_id: str) -> dict:
    """Return a summary count of match statuses for a user."""
    matches = get_matches_for_user_from_db(user_id, include_incompatible=True)
    counts = {"strong": 0, "conditional": 0, "incompatible": 0}
    for m in matches:
        status = m.get("status")
        if status in counts:
            counts[status] += 1
    counts["total"] = sum(counts.values())
    return counts


def save_interaction(user_id: str, target_id: str, action: str) -> bool:
    """Save a like/pass interaction."""
    import json
    import os
    from .config import DATA_DIR
    
    _ensure_interactions_file()
    path = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    key = f"{user_id}:{target_id}"
    data[key] = {
        "user_id": user_id,
        "target_id": target_id,
        "action": action,
        "timestamp": get_timestamp(),
    }
    
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return True


def get_interacted_ids(user_id: str) -> set:
    """Return set of user_ids the user has already liked or passed."""
    import json
    import os
    from .config import DATA_DIR
    
    _ensure_interactions_file()
    path = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return {v["target_id"] for v in data.values() if v["user_id"] == user_id}


def has_interaction(user_id: str, target_id: str) -> bool:
    """Check if an interaction already exists between two users."""
    import json
    import os
    from .config import DATA_DIR
    
    _ensure_interactions_file()
    path = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    key = f"{user_id}:{target_id}"
    return key in data


def save_photos_for_user(user_id: str, photo_urls: list) -> bool:
    """Save photo URLs for a user (max 2)."""
    user = get_user(user_id)
    if not user:
        return False
    user["photos"] = photo_urls[:2]
    user["updated_at"] = get_timestamp()
    data = read_all("users")
    data[user_id] = user
    write_all("users", data)
    return True


def get_user_photos(user_id: str) -> list:
    """Get photo URLs for a user."""
    user = get_user(user_id)
    if user:
        return user.get("photos", [])
    return []


def save_negotiation_log(match_id: str, conversation: list, analysis: dict, outcome: dict) -> bool:
    """Save the full negotiation conversation log."""
    log = {
        "log_id": generate_id(),
        "match_id": match_id,
        "conversation": conversation,
        "analysis": analysis,
        "outcome": outcome,
        "created_at": get_timestamp(),
    }
    data = read_all("negotiation_logs")
    data[log["log_id"]] = log
    write_all("negotiation_logs", data)
    return True


def get_negotiation_log(match_id: str) -> Optional[dict]:
    """Get negotiation log for a match."""
    logs = find_many("negotiation_logs", {"match_id": match_id})
    if logs:
        return logs[0]
    return None