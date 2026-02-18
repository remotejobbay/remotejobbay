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

# --- 2. CONFIG: THE MEGA LIST ---
RSS_FEEDS = [
    # --- The Originals ---
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely", "domain": "weworkremotely.com"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK", "domain": "remoteok.com"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive", "domain": "remotive.com"},
    {"url": "https://www.workingnomads.com/jobs?rss=1", "source": "WorkingNomads", "domain": "workingnomads.com"},
    
    # --- The New Additions ---
    {"url": "https://jobspresso.co/feed/", "source": "Jobspresso", "domain": "jobspresso.co"},
    {"url": "https://nodesk.co/feed", "source": "NoDesk", "domain": "nodesk.co"},
    {"url": "https://dailyremote.com/feed", "source": "DailyRemote", "domain": "dailyremote.com"},
    {"url": "https://remote.co/feed/", "source": "Remote.co", "domain": "remote.co"},
]

# --- 3. HELPER FUNCTIONS ---

def clean_html(html_content):
    if not html_content: return "No description"
    if not isinstance(html_content, str): return str(html_content)
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ")[:600].strip()

def get_logo_url(company_name, source_domain):
    """
    1. Tries to find the Company Logo via Hunter.io
    2. If Company is 'Unknown', falls back to the Job Board's Logo via Hunter.io
    """
    # 1. Try Company Name
    if company_name and company_name.lower() != "unknown":
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
        if clean_name:
            return f"https://logos.hunter.io/{clean_name}.com"
    
    # 2. Fallback: Use the Job Board's Domain (e.g., weworkremotely.com)
    return f"https://logos.hunter.io/{source_domain}"

def get_category(title):
    title = title.lower()
    if any(x in title for x in ["developer", "engineer", "software", "react", "node", "python"]): return "Development"
    if any(x in title for x in ["design", "ui", "ux", "artist", "creative"]): return "Design"
    if any(x in title for x in ["marketing", "seo", "sales", "growth"]): return "Marketing"
    return "Other"

# --- 4. MAIN SCRAPER LOOP ---
def process_feeds():
    print("\n" + "="*40)
    print("🚀 MEGA SCRAPER: 8 SOURCES") 
    print("   (With Hunter.io Intelligent Fallbacks)")
    print("="*40 + "\n")
    
    total_new_jobs = 0

    for feed_source in RSS_FEEDS:
        print(f"📥 Checking {feed_source['source']}...")
        try:
            feed = feedparser.parse(feed_source['url'])
        except Exception as e:
            print(f"   ❌ Failed to read feed: {e}")
            continue
        
        total_entries = len(feed.entries)
        if total_entries == 0:
            print(f"   ⚠️ No entries found (or blocked).")
            continue
            
        print(f"   Found {total_entries} entries. Processing...")
        new_count = 0
        skip_count = 0

        # LOOP THROUGH ALL ENTRIES
        for i, entry in enumerate(feed.entries): 
            try:
                # Extract Data
                title = getattr(entry, 'title', 'No Title')
                link = getattr(entry, 'link', '')
                external_id = getattr(entry, 'id', link)
                
                # Heuristic for finding Company Name
                company = getattr(entry, 'author', 'Unknown')
                if company == "Unknown" and ":" in title:
                    parts = title.split(":")
                    if len(parts) > 1:
                        company = parts[0].strip()
                
                # Check Duplicates
                existing = supabase.table("potential_jobs").select("external_id").eq("external_id", external_id).execute()
                
                if existing.data:
                    skip_count += 1
                    print(".", end="", flush=True) 
                    continue 

                # Generate Smart Logo
                # We pass the job board domain (feed_source['domain']) as the backup!
                logo_url = get_logo_url(company, feed_source['domain'])

                # Prepare Data
                job_data = {
                    "external_id": str(external_id),
                    "title": str(title),
                    "company": str(company),
                    "location": "Remote",
                    "description": clean_html(getattr(entry, 'summary', getattr(entry, 'content', [{'value': ''}])[0].get('value', ''))),
                    "salary_text": "Not Listed",   
                    "apply_url": str(link),
                    "logo": logo_url,
                    "category": get_category(title),
                    "source_url": str(link),
                    "source": feed_source['source'],
                    "status": "pending"
                }

                # Insert
                supabase.table("potential_jobs").insert(job_data).execute()
                new_count += 1
                total_new_jobs += 1
                print(f"\n      ✅ Saved: {company}")

            except Exception as e:
                # print(f"\n      ❌ Error: {e}") 
                pass 

        print(f"\n   ✅ Added: {new_count} | Skipped: {skip_count}\n")

    print(f"\n✨ DONE! Total new jobs added: {total_new_jobs}")

if __name__ == "__main__":
    process_feeds()