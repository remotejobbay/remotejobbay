# inclusivelyremote.py
"""
Scraper for https://inclusivelyremote.com
Compatible with the existing Remote Job Bay scraper framework.

Functions
---------
fetch_jobs(limit=None) -> List[dict]
    Crawl InclusivelyRemote, parse each job, and return a clean list of job dicts.
"""

import re, time, uuid, math
from datetime import datetime, timezone
from typing import List, Dict, Optional

import requests
from bs4 import BeautifulSoup

BASE = "https://inclusivelyremote.com"
INDEX_URLS = [
    f"{BASE}/job-location/worldwide/",
    f"{BASE}/job-type/full-time/",
    f"{BASE}/job-type/contract/",
    f"{BASE}/job-type/part-time/",
]  # You can add or trim categories here.

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; RemoteJobBayBot/1.0; +https://remotejobbay.com/bot)"
    )
}

MIN_DESC_LEN = 120  # characters


def _get_soup(url: str) -> BeautifulSoup:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")


def _parse_job_card(card) -> Dict[str, str]:
    a = card.select_one("h3 a")
    url = a["href"]
    title = a.get_text(strip=True)

    company_elem = card.select_one(".company-name") or card.select_one(".company")
    company = company_elem.get_text(strip=True) if company_elem else "Unknown"

    loc_elem = card.select_one(".job-location") or card.select_one(".location")
    location = (
        "Remote"
        if not loc_elem
        else f"Remote – {loc_elem.get_text(strip=True).replace('Remote Jobs', '').strip()}"
    )

    salary_elem = card.select_one(".job-salary, .salary")
    salary = salary_elem.get_text(strip=True) if salary_elem else None

    date_elem = card.select_one("time")
    if date_elem and date_elem.has_attr("datetime"):
        published_at = datetime.fromisoformat(
            date_elem["datetime"].replace("Z", "+00:00")
        )
    else:
        # Fallback to current UTC time
        published_at = datetime.now(timezone.utc)

    # Build the slug‑based ID so we don’t clash with other sources
    job_id = "ir_" + url.rstrip("/").split("/")[-1]

    return dict(
        id=job_id,
        url=url,
        title=title,
        company=company,
        location=location,
        salary=salary,
        published_at=published_at.isoformat(),
    )


def _get_full_description(url: str) -> str:
    soup = _get_soup(url)
    body = soup.select_one(".job-detail") or soup.select_one(".job-overview")
    return body.decode_contents() if body else ""


def fetch_jobs(limit: Optional[int] = None) -> List[Dict]:
    """
    Crawl inclusivelyremote.com and return a list of unique job records.
    Set `limit` to cap the number of jobs (useful for testing).
    """
    jobs: List[Dict] = []
    seen_ids = set()

    for index in INDEX_URLS:
        page = 1
        while True:
            url = index if page == 1 else f"{index.rstrip('/')}/page/{page}/"
            soup = _get_soup(url)
            cards = soup.select(".job-listings .job-block")  # selector for job cards
            if not cards:
                break

            for card in cards:
                meta = _parse_job_card(card)
                if meta["id"] in seen_ids:
                    continue  # duplicates across indexes
                desc_html = _get_full_description(meta["url"])
                if len(desc_html) < MIN_DESC_LEN:
                    continue  # skip empty listings
                meta["description_html"] = desc_html
                jobs.append(meta)
                seen_ids.add(meta["id"])
                if limit and len(jobs) >= limit:
                    return jobs

            page += 1
            time.sleep(1.2)  # be polite

    return jobs


# For CLI testing
if __name__ == "__main__":
    import json, sys

    n = int(sys.argv[1]) if len(sys.argv) > 1 else None
    data = fetch_jobs(limit=n)
    print(json.dumps(data[:5], indent=2))
    print(f"Fetched {len(data)} jobs.")
