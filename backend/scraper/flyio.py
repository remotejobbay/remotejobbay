import requests
from bs4 import BeautifulSoup
from datetime import datetime, UTC
from supabase import create_client, Client
import uuid

# Supabase credentials
SUPABASE_URL = "https://ozwpvhnivymheuhgleqx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3B2aG5pdnltaGV1aGdsZXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjQ5ODgsImV4cCI6MjA2NjMwMDk4OH0.t-hUeveenPH6isaOXeo67vHvDoaAkUUv17UOEkupqvs"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

URL = "https://fly.io/jobs/"

def scrape_flyio_jobs():
    print("🔎 Scraping Fly.io jobs...")
    response = requests.get(URL, timeout=30)
    soup = BeautifulSoup(response.text, "html.parser")

    jobs = []
    headings = soup.find_all("h3")

    for h3 in headings:
        title = h3.get_text(strip=True)

        # Skip fake or utility titles
        skip_keywords = ["rss", "read more", "jobs"]
        if any(keyword in title.lower() for keyword in skip_keywords):
            continue

        job = {
            "id": str(uuid.uuid4()),
            "title": title,
            "company": "Fly.io",
            "location": "Remote",
            "description": "No description provided",
            "type": "Full-Time",
            "category": "Engineering",
            "salary": 0,
            "salaryType": "Negotiable",
            "logo": "https://avatars.githubusercontent.com/u/37707033?s=200&v=4",
            "applyUrl": URL + "#" + title.replace(" ", "-").lower(),
            "datePosted": datetime.now(UTC).isoformat(),
        }

        jobs.append(job)

    print(f"📄 Found {len(jobs)} valid jobs.")
    return jobs

def upload_jobs_to_supabase(jobs):
    print("⬆️ Uploading to Supabase...")
    for job in jobs:
        existing = supabase.table("jobs").select("id").eq("applyUrl", job["applyUrl"]).execute()
        if existing.data:
            print(f"🔁 Skipping existing job: {job['title']}")
            continue
        supabase.table("jobs").insert(job).execute()
        print(f"✅ Uploaded: {job['title']}")
    print("✅ Done.")

if __name__ == "__main__":
    jobs = scrape_flyio_jobs()
    if jobs:
        upload_jobs_to_supabase(jobs)
    else:
        print("⚠️ No jobs to upload.")
