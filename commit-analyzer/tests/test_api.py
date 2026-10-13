from datetime import date, datetime, timezone
from unittest.mock import patch

NOW = datetime(2026, 10, 12, 18, 0, tzinfo=timezone.utc)


def add(client, username):
    with patch("app.sync.datetime") as dt:
        dt.now.return_value = NOW
        dt.fromisoformat = datetime.fromisoformat
        return client.post("/api/users", json={"username": username})


def test_add_user_syncs_and_computes_stats(client):
    res = add(client, "octocat")
    assert res.status_code == 201
    assert res.json["sync"]["new_commits"] == 6

    stats = client.get("/api/users/octocat/stats").json
    assert stats["total_commits"] == 6
    assert stats["longest_streak"] == 3
    assert stats["current_streak"] == 2
    assert stats["most_productive_day"] == "Monday"   # 5th (x2) and 12th
    assert stats["most_productive_hour"] == 9
    assert stats["languages"][0] == {"language": "Python", "percent": 90.0}


def test_resync_does_not_duplicate_commits(client, app):
    add(client, "octocat")
    res = client.post("/api/users/octocat/sync")
    assert res.status_code == 200
    assert res.json["total_commits"] == 6


def test_unknown_github_user_is_404(client):
    assert add(client, "nobody-here").status_code == 404


def test_duplicate_user_is_409(client):
    add(client, "octocat")
    assert add(client, "octocat").status_code == 409


def test_leaderboard_and_teams(client):
    add(client, "octocat")
    add(client, "hubot")

    board = client.get("/api/leaderboard?metric=total_commits").json["leaderboard"]
    assert [r["username"] for r in board] == ["octocat", "hubot"]
    assert board[0]["rank"] == 1

    assert client.post("/api/teams", json={"name": "bots", "members": ["hubot"]}).status_code == 201
    board = client.get("/api/leaderboard?team=bots").json["leaderboard"]
    assert [r["username"] for r in board] == ["hubot"]

    assert client.post("/api/teams/bots/members", json={"username": "octocat"}).status_code == 204
    assert client.get("/api/teams/bots").json["members"] == ["hubot", "octocat"]


def test_bad_metric_is_400(client):
    assert client.get("/api/leaderboard?metric=lines_of_code").status_code == 400


def test_team_requires_known_members(client):
    res = client.post("/api/teams", json={"name": "x", "members": ["ghost"]})
    assert res.status_code == 400


def test_delete_user_removes_data(client, app):
    add(client, "octocat")
    client.post("/api/teams", json={"name": "t", "members": ["octocat"]})
    assert client.delete("/api/users/octocat").status_code == 204
    assert client.get("/api/users/octocat/stats").status_code == 404
    assert client.get("/api/teams/t").json["members"] == []


def test_pages_render(client):
    assert client.get("/").status_code == 200
    assert client.get("/u/octocat").status_code == 200
