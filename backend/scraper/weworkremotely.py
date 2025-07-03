import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Supabase config
SUPABASE_URL = "https://ozwpvhnivymheuhgleqx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3B2aG5pdnltaGV1aGdsZXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcyNDk4OCwiZXhwIjoyMDY2MzAwOTg4fQ.1jAER03nl-dXyYO3GdlEx8aRA6sBorAxz09n3-XkS64"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_wwr():
    url = "https://weworkremotely.com/categories/remote-programming-jobs"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("❌ Failed to fetch jobs. Status code:", response.status_code)
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    jobs = []

    for section in soup.select("section.jobs"):
        for li in section.select("li:not(.view-all)"):
            title = li.select_one("span.title")
            company = li.select_one("span.company")
            link = li.find("a")

            if title and company and link:
                job_url = f"https://weworkremotely.com{link['href']}"
                jobs.append({
                    "title": title.text.strip(),
                    "company": company.text.strip(),
                    "location": "Remote",
                    "type": "Full-time",
                    "category": "Development",
                    "salary": "Not specified",
                    "logo": "",
                    "description": f"Visit job post: {job_url}",
                    "applyUrl": job_url,
                    "datePosted": "2024-01-01"
                })

    return jobs

if __name__ == "__main__":
    jobs = scrape_wwr()
    if jobs:
        try:
            supabase.table("jobs").insert(jobs).execute()
            print(f"✅ Inserted {len(jobs)} jobs into Supabase.")
        except Exception as e:
            print("❌ Failed to insert jobs into Supabase:", e)
    else:
        print("❌ No valid jobs to insert.")
