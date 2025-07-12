#!/usr/bin/env python3
"""Scrape RemoteOK developer jobs and upload to Supabase."""

import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# ── Load credentials from .env ────────────────────────────────────────────────
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")   # server‑side key

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Supabase env vars missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Constants ────────────────────────────────────────────────────────────────
REMOTEOK_URL = "https://remoteok.com/remote-dev-jobs"
HEADERS = {"User-Agent": "Mozilla/5.0"}

# ── Helpers ──────────────────────────────────────────────────────────────────
def fetch_description(url: str) -> str:
    try:
        res = requests.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        soup = BeautifulSoup(res.content, "html.parser")

        parent = soup.find("div", class_="description")
        desc_elem = parent.find("div", class_="html") if parent else soup.find("div", class_="html")
        return desc_elem.get_text("\n", strip=True) if desc_elem else ""
    except Exception as err:
        print("⚠️  Desc fetch error:", err)
        return ""

# ── Scrape jobs ──────────────────────────────────────────────────────────────
def scrape_remote_jobs() -> list[dict]:
    res = requests.get(REMOTEOK_URL, headers=HEADERS, timeout=30)
    if res.status_code != 200:
        print("❌ RemoteOK fetch failed:", res.status_code)
        return []

    soup = BeautifulSoup(res.content, "html.parser")
    jobs: list[dict] = []

    for row in soup.find_all("tr", class_="job"):
        title = row.find("h2", itemprop="title")
        company = row.find("h3", itemprop="name")
        date = row.find("time")
        link = row.get("data-href")

        if not (title and company and date and link):
            continue

        job_url = f"https://remoteok.com{link}"
        desc = fetch_description(job_url)

        if len(desc) < 50:
            print(f"🔁 Skipped (desc too short): {title.get_text(strip=True)}")
            continue

        jobs.append({
            "title": title.get_text(strip=True),
            "company": company.get_text(strip=True),
            "location": "Remote",
            "type": "Full‑Time",
            "category": "Development",
            "salary": "Not specified",
            "salaryType": "Negotiable",
            "logo": "",
            "description": desc,
            "applyUrl": job_url,
            "datePosted": date["datetime"],
            "published": True,      # or False if you review first
        })

    print(f"📄 Collected {len(jobs)} valid jobs.")
    return jobs

# ── Upload to Supabase ────────────────────────────────────────────────────────
def upload_jobs(jobs: list[dict]) -> None:
    if not jobs:
        print("⚠️  No jobs to upload.")
        return
    try:
        res = supabase.table("jobs").insert(jobs).execute()
        print(f"✅ Inserted {len(res.data or [])} jobs.")
    except Exception as err:
        print("❌ Supabase insert error:", err)

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    upload_jobs(scrape_remote_jobs())
