import logging

from flask import Flask

from .config import Config
from .db import ensure_indexes, get_db


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

    if "mongo_client" in app.config:  # lets tests inject a mongomock client
        app.extensions["mongo_client"] = app.config["mongo_client"]
    ensure_indexes(get_db(app))

    from .routes.api import bp as api_bp
    from .routes.web import bp as web_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(web_bp)

    from .cli import register_cli
    register_cli(app)

    if app.config["SCHEDULER_ENABLED"] and not app.config["TESTING"]:
        from .scheduler import start_scheduler
        start_scheduler(app)

    return app
