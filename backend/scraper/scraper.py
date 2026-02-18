import os
import feedparser
import re
import time
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv
from postgrest.exceptions import APIError
from bs4 import BeautifulSoup 

# --- 1. SETUP & AUTH ---
env_file = find_dotenv('.env.local') or find_dotenv('.env')
print(f"📂 Loading environment variables from: {env_file}")
load_dotenv(env_file)

# Load Keys
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing credentials. Check .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized.")

# --- 2. CONFIG ---
RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive"},
    {"url": "https://www.workingnomads.com/jobs?rss=1", "source": "WorkingNomads"},
]

# --- 3. HELPER FUNCTIONS ---

def clean_html(html_content):
    if not html_content: return "No description"
    if not isinstance(html_content, str): return str(html_content)
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ")[:600].strip()

def get_logo_url(company_name):
    if not company_name or company_name.lower() == "unknown":
        return "https://via.placeholder.com/150"
    clean_name = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
    if not clean_name:
        return "https://via.placeholder.com/150"
    return f"https://logos.hunter.io/{clean_name}.com"

def get_category(title):
    title = title.lower()
    if any(x in title for x in ["developer", "engineer", "software", "react", "node", "python"]): return "Development"
    if any(x in title for x in ["design", "ui", "ux", "artist", "creative"]): return "Design"
    if any(x in title for x in ["marketing", "seo", "sales", "growth"]): return "Marketing"
    return "Other"

# --- 4. MAIN SCRAPER LOOP ---
def process_feeds():
    print("\n" + "="*40)
    print("🚀 VERSION: UNLIMITED PRODUCTION") 
    print("   (Scraping ALL jobs from feeds)")
    print("="*40 + "\n")
    
    for feed_source in RSS_FEEDS:
        print(f"📥 Checking {feed_source['source']}...")
        feed = feedparser.parse(feed_source['url'])
        
        total_entries = len(feed.entries)
        if total_entries == 0:
            print(f"   ⚠️ No entries found.")
            continue
            
        print(f"   Found {total_entries} jobs. Processing...")
        new_count = 0
        skip_count = 0

        # LOOP THROUGH ALL ENTRIES (No limit)
        for i, entry in enumerate(feed.entries): 
            try:
                # Extract Data
                title = getattr(entry, 'title', 'No Title')
                link = getattr(entry, 'link', '')
                external_id = getattr(entry, 'id', link)
                company = getattr(entry, 'author', 'Unknown')
                
                # Check Duplicates
                existing = supabase.table("potential_jobs").select("external_id").eq("external_id", external_id).execute()
                
                if existing.data:
                    skip_count += 1
                    print(".", end="", flush=True) # Print dot for skipped
                    continue 

                # Prepare Data
                job_data = {
                    "external_id": str(external_id),
                    "title": str(title),
                    "company": str(company),
                    "location": "Remote",
                    "description": clean_html(getattr(entry, 'summary', '')),
                    "salary_text": "Not Listed",   
                    "apply_url": str(link),
                    "logo": get_logo_url(company),
                    "category": get_category(title),
                    "source_url": str(link),
                    "source": feed_source['source'],
                    "status": "pending"
                }

                # Insert
                supabase.table("potential_jobs").insert(job_data).execute()
                new_count += 1
                print(f"\n      ✅ [{i+1}/{total_entries}] Saved: {company}")

            except Exception as e:
                print(f"\n      ❌ Error: {e}")

        print(f"\n   ✅ Added: {new_count} | Skipped: {skip_count}\n")

if __name__ == "__main__":
    process_feeds()