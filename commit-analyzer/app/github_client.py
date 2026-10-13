"""Thin wrapper around the GitHub REST API.

Handles auth, pagination (via the `Link` header) and rate limiting.
"""
import time

import requests


class GitHubError(Exception):
    def __init__(self, status, message):
        super().__init__(f"GitHub API {status}: {message}")
        self.status = status


class GitHubClient:
    def __init__(self, token=None, base_url="https://api.github.com", session=None):
        self.base_url = base_url.rstrip("/")
        self.session = session or requests.Session()
        self.session.headers.update({
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "commit-analyzer",
        })
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"

    def _request(self, url, params=None):
        while True:
            resp = self.session.get(url, params=params, timeout=30)
            # Primary rate limit: wait until the reset time, then retry.
            if resp.status_code in (403, 429) and resp.headers.get("X-RateLimit-Remaining") == "0":
                reset = int(resp.headers.get("X-RateLimit-Reset", time.time() + 60))
                time.sleep(max(reset - time.time(), 1) + 1)
                continue
            # 409 = empty repository; treat it as "no data" rather than an error.
            if resp.status_code == 409:
                return resp, []
            if resp.status_code >= 400:
                try:
                    message = resp.json().get("message", resp.text)
                except ValueError:
                    message = resp.text
                raise GitHubError(resp.status_code, message)
            return resp, resp.json()

    def _paginate(self, path, params=None):
        url = f"{self.base_url}{path}"
        params = {**(params or {}), "per_page": 100}
        while url:
            resp, data = self._request(url, params=params)
            yield from data
            url = resp.links.get("next", {}).get("url")
            params = None  # the "next" URL already carries the query string

    def get_user(self, username):
        _, data = self._request(f"{self.base_url}/users/{username}")
        return data

    def list_repos(self, username):
        """Public repos the user owns (forks excluded)."""
        for repo in self._paginate(f"/users/{username}/repos", {"type": "owner", "sort": "pushed"}):
            if not repo.get("fork"):
                yield repo

    def list_commits(self, owner, repo, author, since=None):
        params = {"author": author}
        if since:
            params["since"] = since
        yield from self._paginate(f"/repos/{owner}/{repo}/commits", params)

    def get_languages(self, owner, repo):
        _, data = self._request(f"{self.base_url}/repos/{owner}/{repo}/languages")
        return data or {}
