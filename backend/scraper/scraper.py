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
# Load environment variables from .env.local if present
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")
    exit(1)

# Expanded List of RSS Feeds
RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive"},
    {"url": "https://www.realworkfromanywhere.com/rss.xml", "source": "RealWorkFromAnywhere"},
    {"url": "https://www.workingnomads.com/jobs?rss=1", "source": "WorkingNomads"},
    {"url": "https://jobspresso.co/feed/", "source": "Jobspresso"},
    {"url": "https://justremote.co/remote-jobs.rss", "source": "JustRemote"},
    {"url": "http://europeremotely.com/rss", "source": "EuropeRemotely"},
]

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Browser Headers to avoid getting blocked
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def resolve_direct_link(job_board_url, source):
    """
    Follows redirects and ATS patterns (Greenhouse, Lever, etc.) 
    to find the FINAL application page.
    """
    print(f"      🔎 Resolving direct link for {source}...")
    try:
        # Sleep to be polite
        time.sleep(random.uniform(2, 4))
        
        # Request the URL
        response = requests.get(job_board_url, headers=HEADERS, timeout=15, allow_redirects=True)
        
        if response.status_code != 200:
            return job_board_url 
            
        soup = BeautifulSoup(response.content, 'html.parser')
        all_links = soup.find_all('a', href=True)
        
        # 1. Known ATS Domains (The "Gold Standard" links)
        ats_keywords = ['greenhouse.io', 'lever.co', 'workable.com', 'bamboohr.com', 'apply.workable', 'ashbyhq.com', 'smartrecruiters.com']
        
        for a in all_links:
            href = a['href']
            if any(ats in href.lower() for ats in ats_keywords):
                return href

        # 2. Aggressive "Apply" Button Search
        for a in all_links:
            text = a.get_text().strip().lower()
            href = a['href']
            
            # Look for buttons that say "Apply" or "Go to"
            if any(word in text for word in ["apply", "go to", "external", "application"]):
                # Ensure it's a valid link and not pointing back to the same site
                if href.startswith("http") and source.lower() not in href.lower():
                    try:
                        # Follow one more time to handle "redirector" links
                        final_check = requests.head(href, allow_redirects=True, timeout=5)
                        return final_check.url
                    except:
                        return href

        return response.url # Fallback: Return the URL we ended up on
    except Exception as e:
        print(f"      ⚠️ Resolve Error: {e}")
        return job_board_url

def get_logo_url(entry, company_name):
    """
    Tries to find a logo using Hunter.io
    """
    # 1. Try to find image in feed entry
    if 'media_thumbnail' in entry and len(entry.media_thumbnail) > 0:
        return entry.media_thumbnail[0]['url']
    
    # 2. Fallback: Use Hunter.io Logo API
    if company_name and company_name.lower() != "unknown":
        # Guess the domain: "Red Hat" -> "redhat.com"
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
        
        # Use Hunter.io (Replaced Clearbit)
        return f"https://logos.hunter.io/{clean_name}.com"
    
    # Return a generic placeholder if nothing found
    return "https://logos.hunter.io/google.com"

def get_category(title, entry):
    """
    Categorizes the job based on Title keywords or RSS tags.
    """
    # Define your standard categories and keywords
    categories = {
        "Development": ["engineer", "developer", "software", "full stack", "backend", "frontend", "web", "react", "node", "python", "java", "golang", "devops"],
        "Design": ["design", "ui/ux", "graphic", "creative", "art", "illustrator", "animator", "product designer"],
        "Marketing": ["marketing", "seo", "social media", "content", "copywriter", "growth", "advertising"],
        "Sales": ["sales", "account executive", "sdr", "business development", "closer"],
        "Support": ["support", "customer", "service", "success", "community"],
        "Product": ["product manager", "project manager", "owner", "scrum", "agile"],
        "Data": ["data", "analyst", "scientist", "machine learning", "ai", "artificial intelligence"]
    }

    title_lower = title.lower()

    # 1. Check Title First (Highest Priority)
    for category, keywords in categories.items():
        if any(keyword in title_lower for keyword in keywords):
            return category

    # 2. Check RSS Tags (If Title didn't match)
    if 'tags' in entry:
        for tag in entry.tags:
            tag_text = tag.term.lower()
            for category, keywords in categories.items():
                if any(keyword in tag_text for keyword in keywords):
                    return category

    return "Other" # Default fallback

def is_worldwide(title, location):
    """Filters jobs to ensure they are truly global/worldwide."""
    text = (str(title) + " " + str(location)).lower()
    
    # Negative Keywords (Reject these)
    restricted = ["us only", "usa only", "north america", "europe only", "uk only", "canada", "united states", "restricted", "timezone", "latam", "emea", "apac"]
    if any(word in text for word in restricted): return False
    
    # Positive Keywords (Keep these)
    accepted = ["worldwide", "anywhere", "global", "remote (worldwide)", "international", "distributed team"]
    return any(word in text for word in accepted)

def process_feeds():
    print("🚀 Starting Powerful Scraper (Hunter Logos + Categories)...")
    
    for feed_source in RSS_FEEDS:
        print(f"📥 Checking {feed_source['source']}...")
        feed = feedparser.parse(feed_source['url'])
        
        for entry in feed.entries:
            try:
                title = entry.title
                link = entry.link
                external_id = entry.id if 'id' in entry else link
                
                # --- SMARTER COMPANY EXTRACTION ---
                company = entry.get("author", "")
                
                if not company or company.lower() == "unknown":
                    if " at " in title:
                        company = title.split(" at ")[-1].split("(")[0].strip()
                    elif ":" in title:
                        company = title.split(":")[0].strip()
                
                if not company: company = "Unknown Company"

                # --- CLEANING DESCRIPTION & SALARY ---
                soup_desc = BeautifulSoup(entry.get("description", ""), "html.parser")
                clean_description = soup_desc.get_text(separator=' ').strip()
                
                # Try to grab salary from text
                salary_match = re.search(r'\$\d+[\d,kK\s\-]*', title + " " + clean_description)
                salary = salary_match.group(0) if salary_match else "Not Listed"

                # Extract Location
                location = "Worldwide" 
                if "(" in title and ")" in title:
                    location = title.split("(")[-1].replace(")", "")
                
                # --- FILTERING ---
                if is_worldwide(title, location):
                    
                    # Check for duplicates
                    existing = supabase.table("potential_jobs").select("id").eq("external_id", external_id).execute()
                    if existing.data: 
                        continue 

                    # Resolve Links & Logo & Category
                    real_apply_url = resolve_direct_link(link, feed_source['source'])
                    logo_url = get_logo_url(entry, company)
                    category = get_category(title, entry) # <--- NEW CATEGORY LOGIC

                    print(f"   ✨ Found: {title[:30]}... [{category}] at {company}")

                    # Prepare Data
                    job_data = {
                        "external_id": external_id,
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": clean_description[:1500],
                        "salary_text": salary,   
                        "apply_url": real_apply_url,
                        "logo": logo_url,
                        "category": category, # <--- Saving the category
                        "source_url": link,
                        "source": feed_source['source'],
                        "status": "pending"
                    }

                    # --- INSERT WITH ERROR CHECKING ---
                    try:
                        response = supabase.table("potential_jobs").insert(job_data).execute()
                        
                        if response.data:
                            print(f"      ✅ Saved: {company}")
                        else:
                            print(f"      ❌ Supabase rejected the insert! (Check RLS/Permissions)")
                            
                    except Exception as insert_error:
                        print(f"      ❌ Database Error: {insert_error}")
                        continue

            except Exception as e:
                print(f"Error processing entry: {e}")
                continue

if __name__ == "__main__":
    process_feeds()