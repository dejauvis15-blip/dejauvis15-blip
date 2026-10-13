from datetime import date

from app.analytics import compute_streaks


def test_empty():
    assert compute_streaks([]) == (0, 0)


def test_longest_and_current():
    days = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-07", "2026-10-08"]
    assert compute_streaks(days, today=date(2026, 10, 9)) == (3, 2)


def test_current_streak_broken_if_no_commit_yesterday_or_today():
    days = ["2026-10-01", "2026-10-02"]
    assert compute_streaks(days, today=date(2026, 10, 5)) == (2, 0)


def test_duplicates_and_order_do_not_matter():
    days = ["2026-10-02", "2026-10-01", "2026-10-02"]
    assert compute_streaks(days, today=date(2026, 10, 2)) == (2, 2)
