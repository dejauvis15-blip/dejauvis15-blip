import mongomock
import pytest

from app import create_app
from app.github_client import GitHubError


def raw_commit(sha, iso_date, message="work"):
    return {"sha": sha, "commit": {"author": {"date": iso_date}, "message": message}}


class FakeGitHub:
    """Stands in for GitHubClient so tests never hit the network."""

    def __init__(self):
        self.users = {"octocat": {"login": "octocat", "name": "The Octocat", "avatar_url": ""},
                      "hubot": {"login": "hubot", "name": "Hubot", "avatar_url": ""}}
        self.repos = {
            "octocat": [{"name": "api", "full_name": "octocat/api", "owner": {"login": "octocat"},
                         "language": "Python", "pushed_at": "2026-10-12T00:00:00Z", "fork": False}],
            "hubot": [{"name": "bot", "full_name": "hubot/bot", "owner": {"login": "hubot"},
                       "language": "JavaScript", "pushed_at": "2026-10-12T00:00:00Z", "fork": False}],
        }
        self.languages = {"octocat/api": {"Python": 900, "HTML": 100}, "hubot/bot": {"JavaScript": 1000}}
        self.commits = {
            # Mon 5th, Tue 6th, Wed 7th (3-day streak), gap, Sun 11th, Mon 12th (current streak 2)
            "octocat/api": [raw_commit("a1", "2026-10-05T09:00:00Z"), raw_commit("a2", "2026-10-05T10:30:00Z"),
                            raw_commit("a3", "2026-10-06T09:15:00Z"), raw_commit("a4", "2026-10-07T22:00:00Z"),
                            raw_commit("a5", "2026-10-11T09:00:00Z"), raw_commit("a6", "2026-10-12T09:00:00Z")],
            "hubot/bot": [raw_commit("b1", "2026-10-01T12:00:00Z")],
        }

    def get_user(self, username):
        if username.lower() not in self.users:
            raise GitHubError(404, "Not Found")
        return self.users[username.lower()]

    def list_repos(self, username):
        return iter(self.repos.get(username, []))

    def list_commits(self, owner, repo, author, since=None):
        return iter(c for c in self.commits.get(f"{owner}/{repo}", [])
                    if since is None or c["commit"]["author"]["date"] >= since)

    def get_languages(self, owner, repo):
        return self.languages.get(f"{owner}/{repo}", {})


@pytest.fixture
def fake_gh():
    return FakeGitHub()


@pytest.fixture
def app(fake_gh):
    app = create_app({"TESTING": True, "mongo_client": mongomock.MongoClient(),
                      "MONGO_DB": "test", "INITIAL_SYNC_DAYS": 3650})
    app.extensions["github_client"] = fake_gh
    return app


@pytest.fixture
def client(app):
    return app.test_client()
