from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from pymongo import DESCENDING
from pymongo.errors import DuplicateKeyError

from ..db import get_db
from ..github_client import GitHubClient, GitHubError
from ..sync import sync_user

bp = Blueprint("api", __name__, url_prefix="/api")

LEADERBOARD_METRICS = {
    "commits_last_30_days", "total_commits", "longest_streak", "current_streak", "active_days",
}


def _db():
    return get_db(current_app)


def _gh():
    # Tests can drop a fake client into app.extensions.
    return current_app.extensions.get("github_client") or GitHubClient(
        current_app.config["GITHUB_TOKEN"], current_app.config["GITHUB_API_URL"]
    )


def _clean(doc):
    """Make a Mongo doc JSON-friendly."""
    if isinstance(doc, list):
        return [_clean(d) for d in doc]
    if isinstance(doc, dict):
        return {k: _clean(v) for k, v in doc.items() if k != "_id"}
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc


def _error(message, status):
    return jsonify({"error": message}), status


@bp.errorhandler(GitHubError)
def _github_error(exc):
    status = 404 if exc.status == 404 else 502
    return _error(str(exc), status)


@bp.get("/health")
def health():
    _db().command("ping")
    return {"status": "ok"}


# ---- users ---------------------------------------------------------------

@bp.get("/users")
def list_users():
    return jsonify(_clean(list(_db().users.find().sort("username"))))


@bp.post("/users")
def add_user():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    if not username:
        return _error("'username' is required", 400)

    profile = _gh().get_user(username)  # 404s if the account doesn't exist
    username = profile["login"]  # normalise casing
    try:
        _db().users.insert_one({
            "username": username,
            "name": profile.get("name"),
            "avatar_url": profile.get("avatar_url"),
            "added_at": datetime.now(timezone.utc),
            "last_synced_at": None,
        })
    except DuplicateKeyError:
        return _error(f"{username} is already tracked", 409)

    result = {"username": username}
    if request.args.get("sync", "true").lower() != "false":
        result["sync"] = sync_user(_db(), _gh(), username, current_app.config["INITIAL_SYNC_DAYS"])
    return jsonify(result), 201


@bp.delete("/users/<username>")
def delete_user(username):
    db = _db()
    if db.users.delete_one({"username": username}).deleted_count == 0:
        return _error("user not found", 404)
    db.commits.delete_many({"username": username})
    db.stats.delete_one({"username": username})
    db.teams.update_many({}, {"$pull": {"members": username}})
    return "", 204


@bp.post("/users/<username>/sync")
def sync_one(username):
    if not _db().users.find_one({"username": username}):
        return _error("user not found", 404)
    return jsonify(sync_user(_db(), _gh(), username, current_app.config["INITIAL_SYNC_DAYS"]))


@bp.get("/users/<username>/stats")
def user_stats(username):
    stats = _db().stats.find_one({"username": username})
    if not stats:
        return _error("no stats yet - add the user and sync first", 404)
    return jsonify(_clean(stats))


# ---- teams ---------------------------------------------------------------

@bp.get("/teams")
def list_teams():
    return jsonify(_clean(list(_db().teams.find().sort("name"))))


@bp.post("/teams")
def create_team():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    members = body.get("members") or []
    if not name:
        return _error("'name' is required", 400)
    if not isinstance(members, list):
        return _error("'members' must be a list of usernames", 400)
    unknown = [m for m in members if not _db().users.find_one({"username": m})]
    if unknown:
        return _error(f"add these users first: {', '.join(unknown)}", 400)
    try:
        _db().teams.insert_one({"name": name, "members": sorted(set(members))})
    except DuplicateKeyError:
        return _error(f"team {name!r} already exists", 409)
    return jsonify({"name": name, "members": sorted(set(members))}), 201


@bp.get("/teams/<name>")
def get_team(name):
    team = _db().teams.find_one({"name": name})
    return jsonify(_clean(team)) if team else _error("team not found", 404)


@bp.post("/teams/<name>/members")
def add_member(name):
    username = ((request.get_json(silent=True) or {}).get("username") or "").strip()
    if not _db().users.find_one({"username": username}):
        return _error("add the user first", 400)
    result = _db().teams.update_one({"name": name}, {"$addToSet": {"members": username}})
    return ("", 204) if result.matched_count else _error("team not found", 404)


@bp.delete("/teams/<name>/members/<username>")
def remove_member(name, username):
    result = _db().teams.update_one({"name": name}, {"$pull": {"members": username}})
    return ("", 204) if result.matched_count else _error("team not found", 404)


@bp.delete("/teams/<name>")
def delete_team(name):
    if _db().teams.delete_one({"name": name}).deleted_count == 0:
        return _error("team not found", 404)
    return "", 204


# ---- leaderboard ---------------------------------------------------------

@bp.get("/leaderboard")
def leaderboard():
    metric = request.args.get("metric", "commits_last_30_days")
    if metric not in LEADERBOARD_METRICS:
        return _error(f"metric must be one of {sorted(LEADERBOARD_METRICS)}", 400)
    limit = min(max(request.args.get("limit", 25, type=int), 1), 100)

    query = {}
    team_name = request.args.get("team")
    if team_name:
        team = _db().teams.find_one({"name": team_name})
        if not team:
            return _error("team not found", 404)
        query["username"] = {"$in": team["members"]}

    projection = {"_id": 0, "username": 1, "total_commits": 1, "commits_last_30_days": 1,
                  "longest_streak": 1, "current_streak": 1, "active_days": 1,
                  "most_productive_day": 1, "languages": {"$slice": 3}}
    rows = list(_db().stats.find(query, projection)
                .sort([(metric, DESCENDING), ("username", 1)]).limit(limit))
    for rank, row in enumerate(rows, start=1):
        row["rank"] = rank
    return jsonify({"metric": metric, "team": team_name, "leaderboard": rows})
