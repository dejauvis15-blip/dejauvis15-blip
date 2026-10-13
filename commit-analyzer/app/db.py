"""MongoDB connection and index setup.

Collections:
  users    - one doc per tracked GitHub user ({username, added_at, last_synced_at})
  commits  - one doc per (username, sha), with pre-computed date/weekday/hour fields
  repos    - one doc per repo, with its language byte breakdown
  stats    - one cached analytics snapshot per user (what the leaderboard reads)
  teams    - {name, members: [usernames]}
"""
from pymongo import ASCENDING, DESCENDING, MongoClient


def get_db(app):
    client = app.extensions.get("mongo_client")
    if client is None:
        client = MongoClient(app.config["MONGO_URI"])
        app.extensions["mongo_client"] = client
    return client[app.config["MONGO_DB"]]


def ensure_indexes(db):
    db.users.create_index("username", unique=True)
    db.commits.create_index([("username", ASCENDING), ("sha", ASCENDING)], unique=True)
    db.commits.create_index([("username", ASCENDING), ("date", ASCENDING)])
    db.repos.create_index("full_name", unique=True)
    db.stats.create_index("username", unique=True)
    db.stats.create_index([("total_commits", DESCENDING)])
    db.teams.create_index("name", unique=True)
