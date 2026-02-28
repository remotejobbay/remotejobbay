import os
import feedparser
import re
import traceback # Added for detailed error tracking
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv
from bs4 import BeautifulSoup 

# --- 1. SETUP & AUTH ---
env_file = find_dotenv('.env.local') or find_dotenv('.env')
print(f"📂 Loading environment variables from: {env_file}")
load_dotenv(env_file)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing credentials. Check .env.local")
    exit(1)

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized.")
    
    # TEST CONNECTION IMMEDIATELY
    print("🔎 Testing Supabase Connection...")
    # Just try to fetch 1 row to see if we have permission
    test = supabase.table("potential_jobs").select("id").limit(1).execute()
    print("✅ Connection Successful! Table 'potential_jobs' found.")
except Exception as e:
    print(f"\n🛑 CRITICAL DATABASE ERROR: Could not connect to Supabase.")
    print(f"Error details: {e}")
    print("Double check your SUPABASE_URL and KEY in .env.local")
    exit(1)

# --- 2. CONFIG ---
RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely", "domain": "weworkremotely.com"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK", "domain": "remoteok.com"},
]

# --- 3. HELPER FUNCTIONS ---
def get_summary_safe(entry):
    # Safer way to get description without crashing
    if hasattr(entry, 'summary'): 
        return entry.summary
    if hasattr(entry, 'content') and len(entry.content) > 0:
        return entry.content[0].get('value', '')
    return 'No description provided.'

def clean_html(html_content):
    if not html_content: return "No description"
    if not isinstance(html_content, str): return str(html_content)
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text(separator=" ")[:5000].strip()
    except:
        return str(html_content)[:5000]

def get_logo_url(company_name, source_domain):
    if company_name and company_name.lower() != "unknown":
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
        if clean_name:
            return f"https://logos.hunter.io/{clean_name}.com"
    return f"https://logos.hunter.io/{source_domain}"

def get_category(title):
    title = title.lower()
    if any(x in title for x in ["developer", "engineer", "software", "react", "node"]): return "Development"
    if any(x in title for x in ["design", "ui", "ux", "creative"]): return "Design"
    if any(x in title for x in ["marketing", "seo", "sales"]): return "Marketing"
    return "Other"

# --- 4. MAIN LOOP ---
def process_feeds():
    print("\n🚀 STARTING DEBUG SCRAPER...") 
    
    total_new_jobs = 0

    for feed_source in RSS_FEEDS:
        print(f"\n📥 Checking {feed_source['source']}...")
        try:
            feed = feedparser.parse(feed_source['url'])
        except Exception as e:
            print(f"   ❌ Failed to read feed: {e}")
            continue
        
        print(f"   Found {len(feed.entries)} entries.")
        new_count = 0
        skip_count = 0

        for i, entry in enumerate(feed.entries): 
            try:
                # print(f"Processing item {i+1}...", end="\r") # Progress indicator
                
                title = getattr(entry, 'title', 'No Title')
                link = getattr(entry, 'link', '')
                external_id = getattr(entry, 'id', link)
                
                # Check Duplicates
                existing = supabase.table("potential_jobs").select("external_id").eq("external_id", external_id).execute()
                
                if existing.data:
                    skip_count += 1
                    continue 

                # Company Name Logic
                company = getattr(entry, 'author', 'Unknown')
                if company == "Unknown" and ":" in title:
                    parts = title.split(":")
                    if len(parts) > 1: company = parts[0].strip()

                job_data = {
                    "external_id": str(external_id),
                    "title": str(title),
                    "company": str(company),
                    "location": "Remote",
                    "description": clean_html(get_summary_safe(entry)),
                    "salary_text": "Not Listed",   
                    "apply_url": str(link),
                    "logo": get_logo_url(company, feed_source['domain']),
                    "category": get_category(title),
                    "source_url": str(link),
                    "source": feed_source['source'],
                    "status": "pending"
                }

                # Attempt Insert
                supabase.table("potential_jobs").insert(job_data).execute()
                
                new_count += 1
                total_new_jobs += 1
                print(f"   ✅ Saved: {title[:40]}...")

            except Exception as e:
                print(f"\n❌ ERROR on item {i}: {e}")
                # This prints the specific line number that failed
                traceback.print_exc()
                # We break after one error so you can read it, remove 'break' to continue
                break 

        print(f"   Summary: Added {new_count} | Skipped {skip_count}")

    print(f"\n✨ DONE! Total new jobs: {total_new_jobs}")

if __name__ == "__main__":
    process_feeds()