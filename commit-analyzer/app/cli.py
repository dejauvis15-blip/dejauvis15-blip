"""`flask sync` / `flask sync <username>` - handy for system crontab:

    0 * * * *  cd /path/to/commit-analyzer && .venv/bin/flask --app app sync
"""
import json

import click

from .db import get_db
from .github_client import GitHubClient
from .sync import sync_all, sync_user


def register_cli(app):
    @app.cli.command("sync")
    @click.argument("username", required=False)
    def sync_command(username):
        """Sync one user, or every tracked user."""
        gh = GitHubClient(app.config["GITHUB_TOKEN"], app.config["GITHUB_API_URL"])
        db = get_db(app)
        days = app.config["INITIAL_SYNC_DAYS"]
        result = sync_user(db, gh, username, initial_days=days) if username else sync_all(db, gh, initial_days=days)
        click.echo(json.dumps(result, indent=2, default=str))
