"""Fetch Ritvik's Strava running totals into strava.json for the home page.

One-time setup (connects your Strava account; reuses RunTitle's Strava app):
  python3 tools/strava_stats.py auth          prints a link; approve it in the browser
  python3 tools/strava_stats.py code <CODE>   the code from the localhost address bar;
                                              saves STRAVA_REFRESH_TOKEN into .env

Then, whenever (or daily from GitHub Actions):
  python3 tools/strava_stats.py               writes strava.json

Reads STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN from the
environment, falling back to a .env file next to the site. Standard library only.
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(ROOT, ".env")
OUT_FILE = os.path.join(ROOT, "strava.json")
ATHLETE_ID = 191169905


def load_env():
    env = {}
    if os.path.exists(ENV_FILE):
        for line in open(ENV_FILE):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                env[k] = v
    env.update({k: v for k, v in os.environ.items() if k.startswith("STRAVA_")})
    return env


def post(url, data):
    body = urllib.parse.urlencode(data).encode()
    with urllib.request.urlopen(urllib.request.Request(url, body), timeout=30) as r:
        return json.load(r)


def get(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def token(env, **grant):
    return post(
        "https://www.strava.com/oauth/token",
        {"client_id": env["STRAVA_CLIENT_ID"], "client_secret": env["STRAVA_CLIENT_SECRET"], **grant},
    )


def save_refresh_token(value):
    lines = [l for l in open(ENV_FILE).read().splitlines() if not l.startswith("STRAVA_REFRESH_TOKEN=")]
    lines.append(f"STRAVA_REFRESH_TOKEN={value}")
    with open(ENV_FILE, "w") as f:
        f.write("\n".join(lines) + "\n")
    os.chmod(ENV_FILE, 0o600)


def summary(stats, today):
    """Strava's raw totals -> the three numbers the page shows."""
    ytd = stats["ytd_run_totals"]
    return {
        "year": today.year,
        "km": round(ytd["distance"] / 1000),
        "runs": ytd["count"],
        "hours": round(ytd["moving_time"] / 3600),
        "updated": today.isoformat(),
    }


def main(argv):
    env = load_env()
    if argv[:1] == ["auth"]:
        q = urllib.parse.urlencode({
            "client_id": env["STRAVA_CLIENT_ID"],
            "redirect_uri": "http://localhost",  # Strava always allows localhost
            "response_type": "code",
            "approval_prompt": "force",
            "scope": "read,activity:read",
        })
        print(f"Open this, approve, then copy the code= part of the localhost address:\n"
              f"https://www.strava.com/oauth/authorize?{q}")
    elif argv[:1] == ["code"]:
        t = token(env, code=argv[1], grant_type="authorization_code")
        save_refresh_token(t["refresh_token"])
        print(f"Connected as {t['athlete']['firstname']}. Refresh token saved to .env (not printed).")
    else:
        # ponytail: uses the stored refresh token as-is; if Strava ever rotates it, re-run `auth` + `code`
        access = token(env, refresh_token=env["STRAVA_REFRESH_TOKEN"], grant_type="refresh_token")["access_token"]
        stats = get(f"https://www.strava.com/api/v3/athletes/{ATHLETE_ID}/stats", access)
        data = summary(stats, date.today())
        with open(OUT_FILE, "w") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        print(f"strava.json: {data['km']} km, {data['runs']} runs, {data['hours']} h in {data['year']}")


def check():
    """Self-check for the unit conversion: python3 tools/strava_stats.py check"""
    s = {"ytd_run_totals": {"distance": 1234567.8, "count": 120, "moving_time": 342000}}
    got = summary(s, date(2026, 11, 19))
    assert got == {"year": 2026, "km": 1235, "runs": 120, "hours": 95, "updated": "2026-11-19"}, got
    print("ok")


if __name__ == "__main__":
    check() if sys.argv[1:2] == ["check"] else main(sys.argv[1:])
