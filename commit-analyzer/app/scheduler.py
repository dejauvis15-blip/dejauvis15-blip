"""In-process cron job (APScheduler) that re-syncs every tracked user."""
import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .db import get_db
from .github_client import GitHubClient
from .sync import sync_all

log = logging.getLogger(__name__)


def run_sync_job(app):
    with app.app_context():
        gh = GitHubClient(app.config["GITHUB_TOKEN"], app.config["GITHUB_API_URL"])
        results = sync_all(get_db(app), gh, initial_days=app.config["INITIAL_SYNC_DAYS"])
        log.info("scheduled sync finished for %d user(s)", len(results))


def start_scheduler(app):
    # With `flask run --debug` the reloader starts the app twice; only schedule
    # in the child process that actually serves requests.
    if app.debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return None
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        run_sync_job,
        CronTrigger.from_crontab(app.config["SYNC_CRON"], timezone="UTC"),
        args=[app],
        id="sync_all_users",
        max_instances=1,      # never overlap two syncs
        coalesce=True,        # if runs were missed, run once, not N times
        replace_existing=True,
    )
    scheduler.start()
    app.extensions["scheduler"] = scheduler
    log.info("scheduler started with cron %r", app.config["SYNC_CRON"])
    return scheduler
