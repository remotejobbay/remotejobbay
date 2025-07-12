#!/usr/bin/env python3
"""
Utility helpers for inserting jobs into Supabase
without hard‑coding credentials.
"""

import os
import requests
from dotenv import load_dotenv

# ── Load credentials from .env ────────────────────────────────────────────────
load_dotenv()  # reads .env / .env.local

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # server‑side key

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Missing Supabase env vars (URL or SERVICE_ROLE_KEY)")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}

# ── Public helper ─────────────────────────────────────────────────────────────
def insert_job(job: dict) -> None:
    """Insert or upsert a job row into Supabase."""
    # Default values
    job.setdefault("type", "Full‑Time")
    job.setdefault("category", "General")
    job.setdefault("salaryType", "Negotiable")
    job.setdefault("logo", "https://example.com/default-logo.png")
    job.setdefault("location", "Worldwide")
    job.setdefault("description", "No description provided")

    # Ensure salary is numeric
    try:
        job["salary"] = float(job.get("salary", 0))
    except (TypeError, ValueError):
        job["salary"] = 0

    # Upsert (on_conflict=applyUrl) via Supabase REST
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/jobs?on_conflict=applyUrl",
        headers=HEADERS,
        json=[job],
        timeout=30,
    )

    if resp.status_code >= 400:
        print(f"❌ Failed: {job.get('title','(no title)')} — {resp.status_code}")
        print("Response:", resp.text)
    else:
        print(f"✅ Uploaded: {job.get('title','(no title)')}")
