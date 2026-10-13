"""Pulls commits from GitHub into MongoDB and refreshes the cached stats."""
import logging
from datetime import datetime, timedelta, timezone

from pymongo.errors import BulkWriteError

from .analytics import refresh_stats

log = logging.getLogger(__name__)


def _parse_ts(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def commit_doc(username, repo_full_name, raw):
    ts = _parse_ts(raw["commit"]["author"]["date"]).astimezone(timezone.utc)
    return {
        "username": username,
        "sha": raw["sha"],
        "repo": repo_full_name,
        "message": ((raw["commit"].get("message") or "").splitlines() or [""])[0][:200],
        "timestamp": ts,
        # Pre-computed so Mongo aggregations stay simple $group stages.
        "date": ts.date().isoformat(),
        "weekday": ts.weekday(),  # 0 = Monday
        "hour": ts.hour,
    }


def _insert_new(db, docs):
    """Insert commits, silently skipping ones we already have (the unique
    (username, sha) index rejects them). Returns how many were new."""
    if not docs:
        return 0
    try:
        return len(db.commits.insert_many(docs, ordered=False).inserted_ids)
    except BulkWriteError as exc:
        if any(err["code"] != 11000 for err in exc.details["writeErrors"]):
            raise  # something other than a duplicate key went wrong
        return exc.details["nInserted"]


def sync_user(db, gh, username, initial_days=365, now=None):
    """Incrementally sync one user. Returns a summary dict."""
    now = now or datetime.now(timezone.utc)
    user = db.users.find_one({"username": username})
    if user is None:
        raise ValueError(f"unknown user {username!r}")

    last = user.get("last_synced_at")
    if last is not None and last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)  # Mongo returns naive UTC datetimes
    # Overlap by a day so commits pushed late (with older author dates) aren't missed;
    # the unique (username, sha) index makes re-inserting them a no-op.
    since = (last - timedelta(days=1)) if last else now - timedelta(days=initial_days)
    since_iso = since.strftime("%Y-%m-%dT%H:%M:%SZ")

    repos_scanned = new_commits = 0
    for repo in gh.list_repos(username):
        pushed_at = repo.get("pushed_at")
        if pushed_at and _parse_ts(pushed_at) < since:
            continue  # nothing new in this repo since our window starts
        repos_scanned += 1
        owner, name = repo["owner"]["login"], repo["name"]

        db.repos.update_one(
            {"full_name": repo["full_name"]},
            {"$set": {
                "full_name": repo["full_name"],
                "primary_language": repo.get("language"),
                "languages": gh.get_languages(owner, name),
                "updated_at": now,
            }},
            upsert=True,
        )

        docs = [commit_doc(username, repo["full_name"], c)
                for c in gh.list_commits(owner, name, author=username, since=since_iso)]
        new_commits += _insert_new(db, docs)

    db.users.update_one({"username": username}, {"$set": {"last_synced_at": now}})
    stats = refresh_stats(db, username, today=now.date())
    summary = {
        "username": username,
        "repos_scanned": repos_scanned,
        "new_commits": new_commits,
        "total_commits": stats["total_commits"],
        "synced_at": now.isoformat(),
    }
    log.info("synced %s", summary)
    return summary


def sync_all(db, gh, initial_days=365):
    results = []
    for user in db.users.find({}, {"username": 1}):
        try:
            results.append(sync_user(db, gh, user["username"], initial_days=initial_days))
        except Exception as exc:  # one bad user shouldn't stop the whole run
            log.exception("sync failed for %s", user["username"])
            results.append({"username": user["username"], "error": str(exc)})
    return results
