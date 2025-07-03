import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Supabase config
SUPABASE_URL = "https://ozwpvhnivymheuhgleqx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_remote_jobs():
    url = "https://remoteok.com/remote-dev-jobs"
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Failed to fetch jobs:", response.status_code)
        return

    soup = BeautifulSoup(response.content, "html.parser")
    jobs_data = []

    for job in soup.find_all("tr", class_="job"):
        title = job.find("h2", itemprop="title")
        company = job.find("h3", itemprop="name")
        date = job.find("time")
        link = job.get("data-href")

        if title and company and date and link:
            job_url = f"https://remoteok.com{link}"
            job_desc = fetch_description(job_url)

            if not job_desc or len(job_desc) < 50:
                print(f"❌ Skipped: {title.get_text(strip=True)} — No valid description")
                continue

            job_data = {
                "title": title.get_text(strip=True),
                "company": company.get_text(strip=True),
                "location": "Remote",
                "type": "Full-time",
                "category": "Development",
                "salary": "Not specified",
                "logo": "",
                "description": job_desc,
                "applyUrl": job_url,
                "datePosted": date["datetime"],
            }

            jobs_data.append(job_data)

    if jobs_data:
        try:
            supabase.table("jobs").insert(jobs_data).execute()
            print(f"✅ Inserted {len(jobs_data)} jobs into Supabase.")
        except Exception as e:
            print("❌ Error posting to Supabase:", e)
    else:
        print("❌ No valid jobs with descriptions found.")

def fetch_description(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers)
        if res.status_code != 200:
            return ""

        soup = BeautifulSoup(res.content, "html.parser")

        # First try: .html inside .description
        parent = soup.find("div", class_="description")
        if parent:
            desc_elem = parent.find("div", class_="html")
        else:
            # Fallback: just find .html anywhere
            desc_elem = soup.find("div", class_="html")

        return desc_elem.get_text(separator="\n", strip=True) if desc_elem else ""
    except Exception as e:
        print("Error fetching description:", e)
        return ""

if __name__ == "__main__":
    scrape_remote_jobs()
