import requests
import urllib3
from supabase import create_client, Client

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Supabase config
SUPABASE_URL = "https://ozwpvhnivymheuhgleqx.supabase.co"
SUPABASE_KEY = "your_key_here"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_remotive_jobs():
    url = "https://remotive.io/api/remote-jobs"
    try:
        response = requests.get(url, verify=False)  # 👈 disable SSL verification
        if response.status_code != 200:
            print(f"❌ Failed to fetch jobs. Status code: {response.status_code}")
            return []

        data = response.json()
        jobs = []

        for job in data.get("jobs", []):
            jobs.append({
                "title": job.get("title", "No title"),
                "company": job.get("company_name", "Unknown"),
                "location": job.get("candidate_required_location", "Remote"),
                "type": job.get("job_type", "Full-time"),
                "category": job.get("category", "General"),
                "salary": job.get("salary", "Not specified"),
                "logo": job.get("company_logo_url", ""),
                "description": job.get("description", "")[:1000],
                "applyUrl": job.get("url", ""),
                "datePosted": job.get("publication_date", ""),
            })

        return jobs

    except Exception as e:
        print("❌ Error fetching from Remotive API:", e)
        return []

if __name__ == "__main__":
    jobs = fetch_remotive_jobs()
    if jobs:
        try:
            supabase.table("jobs").insert(jobs).execute()
            print(f"✅ Inserted {len(jobs)} jobs into Supabase.")
        except Exception as e:
            print("❌ Failed to insert jobs into Supabase:", e)
    else:
        print("❌ No valid jobs to insert.")
