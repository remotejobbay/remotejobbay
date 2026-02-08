import os
import feedparser
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import time
import random
import re
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found.")
    exit(1)

RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive"},
    {"url": "https://www.realworkfromanywhere.com/rss.xml", "source": "RealWorkFromAnywhere"},
]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def resolve_direct_link(job_board_url, source):
    """Follows redirects and ATS patterns to find the FINAL application page."""
    print(f"      🔎 Resolving direct link for {source}...")
    try:
        time.sleep(random.uniform(2, 4))
        # We allow redirects here so we follow the 'hop' to the final site
        response = requests.get(job_board_url, headers=HEADERS, timeout=15, allow_redirects=True)
        
        if response.status_code != 200:
            return job_board_url 
            
        soup = BeautifulSoup(response.content, 'html.parser')
        all_links = soup.find_all('a', href=True)
        
        ats_keywords = ['greenhouse.io', 'lever.co', 'workable.com', 'bamboohr.com', 'apply.workable', 'ashbyhq.com', 'smartrecruiters.com']
        
        for a in all_links:
            href = a['href']
            # If the link is already an ATS, follow it to ensure it's the direct version
            if any(ats in href.lower() for ats in ats_keywords):
                return href

        # Aggressive Button Search
        for a in all_links:
            text = a.get_text().strip().lower()
            href = a['href']
            if any(word in text for word in ["apply", "go to", "external", "application"]):
                if href.startswith("http") and source.lower() not in href.lower():
                    # Follow one more time to see if this is a redirector link
                    try:
                        final_check = requests.head(href, allow_redirects=True, timeout=5)
                        return final_check.url
                    except:
                        return href

        return response.url # Return the final URL we ended up on
    except Exception as e:
        print(f"      ⚠️ Resolve Error: {e}")
        return job_board_url

def is_worldwide(title, location):
    text = (str(title) + " " + str(location)).lower()
    restricted = ["us only", "usa only", "north america", "europe only", "uk only", "canada", "united states", "restricted"]
    if any(word in text for word in restricted): return False
    accepted = ["worldwide", "anywhere", "global", "remote (worldwide)", "international"]
    return any(word in text for word in accepted)

def process_feeds():
    print("🚀 Starting Powerful Scraper...")
    for feed_source in RSS_FEEDS:
        print(f"📥 Checking {feed_source['source']}...")
        feed = feedparser.parse(feed_source['url'])
        
        for entry in feed.entries:
            try:
                title = entry.title
                link = entry.link
                
                # --- SMARTER COMPANY EXTRACTION ---
                company = entry.get("author", "")
                
                # If author is missing, try to split from title (e.g., "Developer at Google")
                if not company or company.lower() == "unknown":
                    if " at " in title:
                        company = title.split(" at ")[-1].split("(")[0].strip()
                    elif ":" in title:
                        company = title.split(":")[0].strip()
                
                if not company: company = "Unknown Company"

                # --- CLEANING DESCRIPTION ---
                soup_desc = BeautifulSoup(entry.get("description", ""), "html.parser")
                clean_description = soup_desc.get_text(separator=' ').strip()
                
                salary_match = re.search(r'\$\d+[\d,kK\s\-]*', title + " " + clean_description)
                salary = salary_match.group(0) if salary_match else "Not Listed"

                location = "Worldwide" 
                if "(" in title and ")" in title:
                    location = title.split("(")[-1].replace(")", "")
                
                if is_worldwide(title, location):
                    existing = supabase.table("potential_jobs").select("id").eq("source_url", link).execute()
                    if existing.data: continue 

                    print(f"   ✨ Found Global Job: {title[:40]}... (Company: {company})")
                    real_apply_url = resolve_direct_link(link, feed_source['source'])

                    job_data = {
                        "external_id": link,
                        "title": title,
                        "company": company,
                        "location": location,
                        "salary": salary,
                        "description": clean_description[:1500],
                        "apply_url": real_apply_url,
                        "source_url": link,
                        "source": feed_source['source'],
                        "status": "pending"
                    }

                    supabase.table("potential_jobs").insert(job_data).execute()
                    print(f"      ✅ Saved: {company}")

            except Exception as e:
                print(f"Error: {e}")
                continue

if __name__ == "__main__":
    process_feeds()