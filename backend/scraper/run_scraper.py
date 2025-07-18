#!/usr/bin/env python3
"""
Master scraper runner for Remote Job Bay
"""

from remoteok import scrape_remoteok           # already working
from weworkremotely import scrape_wwr          # already working
# from remotive import scrape_remotive        # SSL 526 issue – disabled for now
from inclusivelyremote import fetch_jobs as scrape_inclusivelyremote  # NEW

from utils import insert_job

def main() -> None:
    print("📡 Starting scrapers...")

    all_jobs = []

    # RemoteOK
    print("  • RemoteOK …", end=" ", flush=True)
    all_jobs += scrape_remoteok()
    print("done.")

    # WeWorkRemotely
    print("  • WeWorkRemotely …", end=" ", flush=True)
    all_jobs += scrape_wwr()
    print("done.")

    # InclusivelyRemote
    print("  • InclusivelyRemote …", end=" ", flush=True)
    all_jobs += scrape_inclusivelyremote()
    print("done.")

    # Remotive (disabled)
    # print("  • Remotive …", end=" ", flush=True)
    # all_jobs += scrape_remotive()
    # print("done.")

    print(f"🔎 Parsed {len(all_jobs)} jobs. Uploading to Supabase…")

    for job in all_jobs:
        insert_job(job)

    print("✅ Finished!")

if __name__ == "__main__":
    main()
