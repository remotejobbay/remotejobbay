import feedparser
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import time
import random
import re

# --- CONFIGURATION ---
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY" # Use Service Role Key

RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive"},
]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Headers to look like a real browser (prevents blocking)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def resolve_direct_link(job_board_url, source):
    """
    Visits the job board page and scrapes the REAL application link.
    """
    print(f"      🔎 Resolving direct link for {source}...")
    try:
        # Sleep briefly to be polite to the server
        time.sleep(random.uniform(1, 2))
        
        response = requests.get(job_board_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        direct_url = None

        # --- LOGIC FOR WEWORKREMOTELY ---
        if source == "WeWorkRemotely":
            # WWR usually has a big 'Apply for this position' button
            apply_btn = soup.select_one("#job-listing-show-container a#job-cta-alt")
            if not apply_btn: 
                apply_btn = soup.select_one("#job-listing-show-container a#job-cta-alt-2")
            if apply_btn: direct_url = apply_btn.get('href')

        # --- LOGIC FOR REMOTEOK ---
        elif source == "RemoteOK":
            # RemoteOK uses a redirect link often found in a button with class 'prevent_default' or 'apply_button'
            # We look for the button that says "Apply"
            buttons = soup.find_all("a", href=True)
            for btn in buttons:
                if "apply" in btn.text.lower() and "remoteok.com/l/" in btn['href']:
                    # Found the redirect link! Now we must follow it to get the final URL.
                    redirect_link = btn['href']
                    if not redirect_link.startswith("http"):
                        redirect_link = "https://remoteok.com" + redirect_link
                    
                    # Follow the redirect
                    resp2 = requests.head(redirect_link, headers=HEADERS, allow_redirects=True, timeout=5)
                    direct_url = resp2.url
                    break

        # --- LOGIC FOR REMOTIVE ---
        elif source == "Remotive":
            # Remotive usually has a "Apply for this job" button
            apply_btn = soup.select_one(".apply-wrapper a")
            if apply_btn: direct_url = apply_btn.get('href')

        # --- FALLBACK (If specific logic fails) ---
        if not direct_url:
            # Look for any link with text "Apply" that goes to a different domain
            for a in soup.find_all('a', href=True):
                if "apply" in a.text.lower() and len(a.text) < 30:
                    if source.lower() not in a['href']: # Ensure it's not a self-link
                        direct_url = a['href']
                        break

        return direct_url if direct_url else job_board_url

    except Exception as e:
        print(f"      ⚠️ Could not resolve link: {e}")
        return job_board_url # Fallback to original link if extraction fails

def is_worldwide(title, location):
    text = (str(title) + " " + str(location)).lower()
    # Reject restricted
    restricted = ["us only", "usa only", "north america", "europe only", "uk only", "canada", "united states"]
    for word in restricted:
        if word in text: return False
    # Accept explicit worldwide
    accepted = ["worldwide", "anywhere in the world", "global", "remote (worldwide)"]
    for word in accepted:
        if word in text: return True
    return False

def process_feeds():
    print("🚀 Starting Powerful Scraper...")
    
    for feed_source in RSS_FEEDS:
        print(f"📥 Checking {feed_source['source']}...")
        feed = feedparser.parse(feed_source['url'])
        
        for entry in feed.entries:
            try:
                title = entry.title
                link = entry.link
                external_id = entry.id if 'id' in entry else link
                description = entry.description if 'description' in entry else ""
                
                # Check location tag
                location = "Unknown"
                if "(" in title and ")" in title:
                    location = title.split("(")[-1].replace(")", "")
                
                # 1. Check if Worldwide
                if is_worldwide(title, location):
                    
                    # 2. Check if we already have this job (Save time/resources)
                    existing = supabase.table("potential_jobs").select("id").eq("external_id", external_id).execute()
                    if existing.data:
                        continue # Skip if exists

                    print(f"   Found: {title[:40]}...")
                    
                    # 3. RESOLVE THE REAL URL (The heavy lifting)
                    real_apply_url = resolve_direct_link(link, feed_source['source'])

                    # 4. Save to Supabase
                    job_data = {
                        "external_id": external_id,
                        "title": title,
                        "company": entry.get("author", "Unknown"),
                        "location": location,
                        "description": description,
                        "apply_url": real_apply_url, # <--- The direct link
                        "source_url": link,
                        "source": feed_source['source'],
                        "status": "pending"
                    }

                    supabase.table("potential_jobs").insert(job_data).execute()
                    print(f"      ✅ Saved with link: {real_apply_url[:30]}...")

            except Exception as e:
                print(f"Error: {e}")
                continue

if __name__ == "__main__":
    process_feeds()