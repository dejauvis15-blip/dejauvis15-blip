"""Turns stored commits into stats. Pure-ish: everything here takes a db handle
and returns plain dicts, so it is easy to test with mongomock."""
from datetime import date, datetime, timedelta, timezone

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def compute_streaks(day_strings, today=None):
    """Given ISO dates ('YYYY-MM-DD') with at least one commit, return
    (longest_streak, current_streak). The current streak is still alive if the
    last commit was today or yesterday."""
    days = sorted({date.fromisoformat(d) for d in day_strings})
    if not days:
        return 0, 0
    longest = run = 1
    for prev, cur in zip(days, days[1:]):
        run = run + 1 if cur - prev == timedelta(days=1) else 1
        longest = max(longest, run)
    today = today or datetime.now(timezone.utc).date()
    current = run if (today - days[-1]).days <= 1 else 0
    return longest, current


def productive_days(db, username):
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {"_id": "$weekday", "commits": {"$sum": 1}}},
    ]
    counts = {row["_id"]: row["commits"] for row in db.commits.aggregate(pipeline)}
    return [{"day": name, "commits": counts.get(i, 0)} for i, name in enumerate(WEEKDAYS)]


def productive_hours(db, username):
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {"_id": "$hour", "commits": {"$sum": 1}}},
    ]
    counts = {row["_id"]: row["commits"] for row in db.commits.aggregate(pipeline)}
    return [{"hour": h, "commits": counts.get(h, 0)} for h in range(24)]


def daily_activity(db, username):
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {"_id": "$date", "commits": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    return [{"date": row["_id"], "commits": row["commits"]} for row in db.commits.aggregate(pipeline)]


def languages(db, username):
    """Language share, weighted by how many of the user's commits landed in
    each repo (so a repo you committed to 200 times counts more than one you
    touched once)."""
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {"_id": "$repo", "commits": {"$sum": 1}}},
    ]
    commits_per_repo = {row["_id"]: row["commits"] for row in db.commits.aggregate(pipeline)}
    totals = {}
    for repo in db.repos.find({"full_name": {"$in": list(commits_per_repo)}}):
        langs = repo.get("languages") or {}
        repo_bytes = sum(langs.values())
        if not repo_bytes:
            continue
        for lang, size in langs.items():
            totals[lang] = totals.get(lang, 0) + commits_per_repo[repo["full_name"]] * size / repo_bytes
    grand = sum(totals.values()) or 1
    ranked = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)
    return [{"language": lang, "percent": round(100 * w / grand, 1)} for lang, w in ranked]


def build_stats(db, username, today=None):
    today = today or datetime.now(timezone.utc).date()
    activity = daily_activity(db, username)
    longest, current = compute_streaks([a["date"] for a in activity], today=today)
    by_day = productive_days(db, username)
    by_hour = productive_hours(db, username)
    cutoff = (today - timedelta(days=29)).isoformat()
    total = sum(a["commits"] for a in activity)
    return {
        "username": username,
        "total_commits": total,
        "commits_last_30_days": sum(a["commits"] for a in activity if a["date"] >= cutoff),
        "active_days": len(activity),
        "longest_streak": longest,
        "current_streak": current,
        "most_productive_day": max(by_day, key=lambda d: d["commits"])["day"] if total else None,
        "most_productive_hour": max(by_hour, key=lambda h: h["commits"])["hour"] if total else None,
        "by_weekday": by_day,
        "by_hour": by_hour,
        "languages": languages(db, username),
        "daily_activity": activity,
        "computed_at": datetime.now(timezone.utc),
    }


def refresh_stats(db, username, today=None):
    stats = build_stats(db, username, today=today)
    db.stats.replace_one({"username": username}, stats, upsert=True)
    return stats
