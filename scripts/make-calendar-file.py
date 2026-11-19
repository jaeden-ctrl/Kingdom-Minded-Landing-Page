#!/usr/bin/env python3
"""Build assets/kingdom-minded-prayer-call.ics, the calendar file behind the
"Apple Calendar" and "Outlook" buttons on /prayer/.

Run this again whenever the Zoom link, meeting ID, passcode, or schedule
changes (keep it in sync with PRAYER_CONFIG / SCHEDULE in assets/js/prayer.js):

    python3 scripts/make-calendar-file.py
"""
from datetime import datetime, timezone
from pathlib import Path

ZOOM_URL = "https://us02web.zoom.us/j/85109728119?pwd=tylfVJQszbCKIA0H7IIbz378LQSD8e.1"
MEETING_ID = "851 0972 8119"
PASSCODE = "177576"
DIAL_IN = "+1 669 900 9128"
PAGE_URL = "https://kingdommindedrl.netlify.app/prayer/"

TITLE = "Kingdom Minded Prayer Call"
FIRST_CALL = "20261207"          # Monday, Dec 7, 2026
START, END = "093000", "100000"  # Pacific time
WEEKS = 110                      # matches the Zoom recurring series

DESCRIPTION = (
    "Thirty minutes of prayer, Scripture, and declarations for people in real estate and mortgage.\n\n"
    f"Join on Zoom: {ZOOM_URL}\n"
    f"Meeting ID: {MEETING_ID}\n"
    f"Passcode: {PASSCODE}\n"
    f"Dial in: {DIAL_IN}\n\n"
    f"{PAGE_URL}"
)


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")


def fold(line: str) -> str:
    """Fold to 75-octet lines, as the iCalendar spec requires."""
    out, cur = [], b""
    for ch in line:
        b = ch.encode("utf-8")
        if len(cur) + len(b) > (75 if not out else 74):
            out.append(cur.decode("utf-8"))
            cur = b""
        cur += b
    out.append(cur.decode("utf-8"))
    return "\r\n ".join(out)


stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Revival Lending//Kingdom Minded Prayer Call//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", f"X-WR-CALNAME:{TITLE}",
    "BEGIN:VTIMEZONE", "TZID:America/Los_Angeles",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0800", "TZOFFSETTO:-0700", "TZNAME:PDT",
    "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:-0700", "TZOFFSETTO:-0800", "TZNAME:PST",
    "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:kingdom-minded-prayer-call-weekly@kingdommindedrl.netlify.app",
    f"DTSTAMP:{stamp}",
    f"DTSTART;TZID=America/Los_Angeles:{FIRST_CALL}T{START}",
    f"DTEND;TZID=America/Los_Angeles:{FIRST_CALL}T{END}",
    f"RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT={WEEKS}",
    f"SUMMARY:{esc(TITLE)}",
    f"DESCRIPTION:{esc(DESCRIPTION)}",
    f"LOCATION:{esc(ZOOM_URL)}",
    f"URL:{ZOOM_URL}",
    "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT10M",
    f"DESCRIPTION:{esc(TITLE)} starts in 10 minutes", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
]
out = Path(__file__).resolve().parent.parent / "assets" / "kingdom-minded-prayer-call.ics"
out.write_bytes(("\r\n".join(fold(l) for l in lines) + "\r\n").encode("utf-8"))
print(f"Wrote {out}")
