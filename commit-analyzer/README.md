# GitHub Commit Analyzer

A Flask + MongoDB backend that pulls your commit history from the GitHub API, works out
**when you're most productive**, **which languages you use**, and **your longest coding
streak**, then ranks you on a **personal or team leaderboard**. A cron job keeps it fresh.

| Concept   | Where to look |
|-----------|---------------|
| GitHub API (auth, pagination, rate limits) | `app/github_client.py` |
| MongoDB (unique indexes, bulk inserts, aggregation pipelines) | `app/db.py`, `app/sync.py`, `app/analytics.py` |
| Cron jobs (APScheduler in-process, or system crontab) | `app/scheduler.py`, `app/cli.py` |
| Flask (app factory, blueprints, JSON API, Jinja templates) | `app/__init__.py`, `app/routes/` |

## How it works

```
 GitHub REST API ──► sync.py ──► MongoDB ──► analytics.py ──► stats collection ──► /api/leaderboard
        ▲            (incremental,  commits      ($group by weekday,   (cached snapshot     /u/<user> dashboard
        │             since last    repos        hour, date; streaks)   per user)
   cron job (hourly)  sync)         users/teams
```

1. **Add a user** → the API checks the account exists on GitHub, stores it, and runs a first sync.
2. **Sync** lists the user's non-fork repos, skips any not pushed to since the last sync,
   pulls commits authored by that user (`?author=&since=`), and fetches each repo's language
   breakdown. Commits are stored with pre-computed `date`, `weekday` and `hour` fields.
   A unique `(username, sha)` index makes re-syncing idempotent.
3. **Analytics** run Mongo aggregation pipelines over those fields, compute streaks in Python,
   and save a snapshot to `stats`, which is what the leaderboard sorts on.
4. **The cron job** re-syncs every tracked user on the `SYNC_CRON` schedule (hourly by default).

## Run it

```bash
cp .env.example .env          # add a GITHUB_TOKEN: https://github.com/settings/tokens (no scopes needed for public repos)
```

**With Docker** (starts MongoDB too):
```bash
docker compose up --build
```

**Without Docker** (needs MongoDB running locally, e.g. `brew install mongodb-community` or Atlas free tier):
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
flask --app app run --debug
```

Open http://localhost:5000, type your GitHub username, and click **Track user**.

## API

| Method | Path | What it does |
|--------|------|--------------|
| GET    | `/api/health` | Pings MongoDB |
| GET    | `/api/users` | Tracked users |
| POST   | `/api/users` `{"username": "..."}` | Track a user and sync them (`?sync=false` to skip) |
| DELETE | `/api/users/<username>` | Stop tracking and delete their data |
| POST   | `/api/users/<username>/sync` | Sync now |
| GET    | `/api/users/<username>/stats` | Totals, streaks, by-weekday, by-hour, languages, daily activity |
| GET    | `/api/teams` · `/api/teams/<name>` | List / view teams |
| POST   | `/api/teams` `{"name": "...", "members": [...]}` | Create a team |
| POST   | `/api/teams/<name>/members` `{"username": "..."}` | Add a member |
| DELETE | `/api/teams/<name>/members/<username>` · `/api/teams/<name>` | Remove a member / team |
| GET    | `/api/leaderboard?metric=&team=&limit=` | Ranked users. `metric` is one of `commits_last_30_days` (default), `total_commits`, `current_streak`, `longest_streak`, `active_days` |

```bash
curl -X POST localhost:5000/api/users -H 'Content-Type: application/json' -d '{"username":"dejauvis15-blip"}'
curl -X POST localhost:5000/api/teams -H 'Content-Type: application/json' -d '{"name":"utk","members":["dejauvis15-blip"]}'
curl 'localhost:5000/api/leaderboard?metric=longest_streak&team=utk'
```

Pages: `/` (leaderboard) and `/u/<username>` (dashboard with heatmap and charts).

## Cron jobs, two ways

- **In-process (default):** APScheduler runs `sync_all` on `SYNC_CRON`. `max_instances=1` stops
  runs overlapping; `coalesce=True` collapses missed runs into one.
- **System cron:** set `SCHEDULER_ENABLED=false` and add a crontab line:
  ```
  0 * * * *  cd /path/to/commit-analyzer && .venv/bin/flask --app app sync >> sync.log 2>&1
  ```
  `flask --app app sync <username>` syncs a single user.

## Tests

```bash
pytest
```
Tests use `mongomock` and a fake GitHub client, so they need neither a database nor network.

## Limitations / ideas for next steps

- Times are bucketed in **UTC**. Storing each user's timezone and shifting `weekday`/`hour` would make "most productive hour" more accurate.
- Only public, non-fork repos the user **owns** are scanned. Commits to org repos or other people's projects aren't counted; the GraphQL `contributionsCollection` API is a good way to add them.
- Language share is estimated by weighting each repo's language bytes by your commit count in it.
- **GitHub OAuth login** ("Sign in with GitHub") would replace typing a username and unlock private repos.
- Move the first sync into a background job queue (RQ/Celery) so `POST /api/users` returns instantly for big accounts.
