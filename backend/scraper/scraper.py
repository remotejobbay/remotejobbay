import os
import feedparser
import re
import requests
from datetime import datetime
from urllib.parse import urljoin, urlparse
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv
from bs4 import BeautifulSoup 

# --- 1. SETUP & AUTH ---
# This automatically finds your .env file
env_file = find_dotenv('.env.local') or find_dotenv('.env')
print(f"📂 Loading environment variables from: {env_file}")
load_dotenv(env_file)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing credentials. Check .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized.")

# --- 2. CONFIG: THE MEGA LIST ---
RSS_FEEDS = [
    {"url": "https://weworkremotely.com/remote-jobs.rss", "source": "WeWorkRemotely", "domain": "weworkremotely.com"},
    {"url": "https://remoteok.com/rss", "source": "RemoteOK", "domain": "remoteok.com"},
    {"url": "https://remotive.com/remote-jobs/feed", "source": "Remotive", "domain": "remotive.com"},
    {"url": "https://www.workingnomads.com/jobs?rss=1", "source": "WorkingNomads", "domain": "workingnomads.com"},
    {"url": "https://jobspresso.co/feed/", "source": "Jobspresso", "domain": "jobspresso.co"},
    {"url": "https://nodesk.co/feed", "source": "NoDesk", "domain": "nodesk.co"},
    {"url": "https://dailyremote.com/feed", "source": "DailyRemote", "domain": "dailyremote.com"},
    {"url": "https://remote.co/feed/", "source": "Remote.co", "domain": "remote.co"},
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# --- 3. HELPER FUNCTIONS ---

def clean_html(html_content):
    if not html_content: return "No description"
    if not isinstance(html_content, str): return str(html_content)
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        text = soup.get_text(separator="\n")
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()
    except:
        return str(html_content)

def get_entry_html(entry):
    if hasattr(entry, "content") and len(entry.content) > 0:
        return entry.content[0].get("value", "")
    return getattr(entry, "summary", "")

def strip_weworkremotely_boilerplate(text):
    text = re.sub(
        r"^\s*Headquarters:\s*.*?\bURL:\s*\S+\s*",
        "",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r"\s*To apply:\s*\S+\s*$",
        "",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return text.strip()

def fetch_job_page(url):
    if not url:
        return None
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print(f"   ⚠️ Could not fetch job page: {e}")
        return None

def remove_page_noise(soup):
    for selector in ["script", "style", "noscript", "nav", "footer", "header"]:
        for node in soup.select(selector):
            node.decompose()

def extract_full_description_html(soup, source):
    if not soup:
        return ""

    remove_page_noise(soup)

    selectors_by_source = {
        "WeWorkRemotely": [
            "#job-listing-show-container .listing-container",
            "#job-listing-show-container",
            ".listing-container",
        ],
        "RemoteOK": [".description", ".job-description", "td.company_and_position"],
        "Remotive": [".job-description", ".job-description-content", "article"],
        "WorkingNomads": [".job-description", ".job-content", "article"],
        "Jobspresso": [".job_description", ".job-description", "article"],
        "NoDesk": [".job-content", ".job-description", "article"],
        "DailyRemote": [".job-description", ".job-detail", "article"],
        "Remote.co": [".job_description", ".job-description", "article"],
    }

    generic_selectors = [
        "[class*='job-description']",
        "[class*='job_description']",
        "[class*='job-detail']",
        "[class*='job-content']",
        "article",
        "main",
    ]

    for selector in selectors_by_source.get(source, []) + generic_selectors:
        container = soup.select_one(selector)
        if container and len(container.get_text(" ", strip=True)) > 120:
            return container.decode_contents().strip()

    return ""

def is_same_domain_or_subdomain(url, domain):
    if not url or not domain:
        return False
    host = urlparse(url).netloc.lower()
    domain = domain.lower()
    return host == domain or host.endswith(f".{domain}")

def follow_redirect(url):
    if not url:
        return ""
    try:
        response = requests.get(url, headers=HEADERS, allow_redirects=True, timeout=20)
        return response.url or url
    except Exception:
        return url

def resolve_direct_apply_url(job_board_url, soup, source_domain):
    if not job_board_url:
        return ""

    if not soup:
        return follow_redirect(job_board_url)

    apply_selectors = [
        "a#job-cta-alt[href]",
        "a#job-cta-alt-2[href]",
        "a.apply_button[href]",
        "a.apply-button[href]",
        "a.apply-now[href]",
        "a[href*='apply'][href]",
        "a[href*='greenhouse.io'][href]",
        "a[href*='lever.co'][href]",
        "a[href*='workable.com'][href]",
        "a[href*='ashbyhq.com'][href]",
        "a[href*='bamboohr.com'][href]",
        "a[href*='smartrecruiters.com'][href]",
        "a[href*='jobvite.com'][href]",
    ]

    candidates = []
    for selector in apply_selectors:
        for anchor in soup.select(selector):
            href = anchor.get("href")
            if not href:
                continue
            text = anchor.get_text(" ", strip=True).lower()
            absolute_url = urljoin(job_board_url, href)
            if "apply" in text or "apply" in absolute_url.lower():
                candidates.append(absolute_url)

    if not candidates:
        for anchor in soup.find_all("a", href=True):
            text = anchor.get_text(" ", strip=True).lower()
            href = anchor.get("href", "")
            if any(word in text for word in ["apply", "apply now", "submit application"]):
                candidates.append(urljoin(job_board_url, href))

    for candidate in candidates:
        resolved = follow_redirect(candidate)
        if resolved and not is_same_domain_or_subdomain(resolved, source_domain):
            return resolved

    if candidates:
        return follow_redirect(candidates[0])

    return follow_redirect(job_board_url)

def get_logo_url(company_name, source_domain):
    if company_name and company_name.lower() != "unknown":
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
        if clean_name:
            return f"https://logos.hunter.io/{clean_name}.com"
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
    print("🚀 PRODUCTION SCRAPER") 
    print("   (Jobs will be Hidden & Pending)")
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
            print(f"   ⚠️ No entries found.")
            continue
            
        new_count = 0
        skip_count = 0

        for i, entry in enumerate(feed.entries): 
            try:
                title = getattr(entry, 'title', 'No Title')
                link = getattr(entry, 'link', '')
                external_id = getattr(entry, 'id', link)
                
                # Check Duplicates
                existing = supabase.table("potential_jobs").select("external_id").eq("external_id", external_id).execute()
                
                if existing.data:
                    skip_count += 1
                    continue 

                # Company Logic
                company = getattr(entry, 'author', 'Unknown')
                if company == "Unknown" and ":" in title:
                    parts = title.split(":")
                    if len(parts) > 1: company = parts[0].strip()

                job_page_soup = fetch_job_page(link)
                direct_apply_url = resolve_direct_apply_url(
                    link,
                    job_page_soup,
                    feed_source["domain"],
                )

                # Get description safely. Prefer the job page HTML when available,
                # because RSS summaries often include board boilerplate.
                feed_html = get_entry_html(entry)
                page_html = extract_full_description_html(job_page_soup, feed_source["source"])
                desc_html = page_html or feed_html
                desc_text = clean_html(desc_html)
                if feed_source["source"] == "WeWorkRemotely":
                    desc_text = strip_weworkremotely_boilerplate(desc_text)

                # Prepare Data
                job_data = {
                    "external_id": str(external_id),
                    "title": str(title),
                    "company": str(company),
                    "location": "Remote",
                    "description": desc_text,
                    "description_html": desc_html or None,
                    "salary_text": "Not Listed",   
                    "apply_url": str(direct_apply_url or link),
                    "logo": get_logo_url(company, feed_source['domain']),
                    "category": get_category(title),
                    "source_url": str(link),
                    "source": feed_source['source'],
                    
                    # --- VETTING LOCKS ---
                    "status": "pending",     # 1. Needs manual approval
                    "post_to_site": False    # 2. Hidden from website
                }

                supabase.table("potential_jobs").insert(job_data).execute()
                new_count += 1
                total_new_jobs += 1
                print(f"   ✅ Saved (Hidden): {title[:30]}...")

            except Exception as e:
                # print(f"   ❌ Error: {e}") 
                pass 

        print(f"   ✅ Added: {new_count} | Skipped: {skip_count}\n")

    print(f"\n✨ DONE! Total new jobs in vetting queue: {total_new_jobs}")

if __name__ == "__main__":
    process_feeds()
