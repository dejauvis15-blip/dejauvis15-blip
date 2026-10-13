from flask import Blueprint, render_template

bp = Blueprint("web", __name__)


@bp.get("/")
def index():
    return render_template("leaderboard.html")


@bp.get("/u/<username>")
def dashboard(username):
    return render_template("dashboard.html", username=username)
