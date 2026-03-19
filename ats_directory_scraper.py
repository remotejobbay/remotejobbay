import os
import re
import time
import json
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv

# --- 1. SETUP & AUTH ---
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT})

# Load .env.local or .env
env_file = find_dotenv('.env.local') or find_dotenv('.env')
print(f"Loading environment variables from: {env_file}")
load_dotenv(env_file)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials. Check .env.local")
    raise SystemExit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabase client initialized.")

# --- 2. CONFIG ---
MAX_COMPANIES_PER_ATS = int(os.environ.get("ATS_MAX_COMPANIES", "150"))
MAX_JOBS_PER_COMPANY = int(os.environ.get("ATS_MAX_JOBS_PER_COMPANY", "200"))
REQUEST_TIMEOUT = int(os.environ.get("ATS_REQUEST_TIMEOUT", "20"))
SLEEP_BETWEEN_REQUESTS = float(os.environ.get("ATS_SLEEP_SECONDS", "0.3"))

ATS_CONFIG = {
    "greenhouse": {
        "name": "Greenhouse",
        "sitemap": "https://boards.greenhouse.io/sitemap.xml",
        "company_regex": re.compile(r"boards\.greenhouse\.io/([^/]+)/"),
        "jobs_api": "https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true",
        "source_domain": "greenhouse.io",
    },
    "lever": {
        "name": "Lever",
        "sitemap": "https://jobs.lever.co/sitemap.xml",
        "company_regex": re.compile(r"jobs\.lever\.co/([^/]+)/"),
        "jobs_api": "https://api.lever.co/v0/postings/{company}?mode=json",
        "source_domain": "lever.co",
    },
    "workable": {
        "name": "Workable",
        "sitemap": "https://apply.workable.com/sitemap.xml",
        "company_regex": re.compile(r"apply\.workable\.com/([^/]+)/"),
        "jobs_api": "https://apply.workable.com/api/v3/accounts/{company}/jobs",
        "source_domain": "workable.com",
    },
}

# --- 3. HELPERS ---

def fetch(url, params=None):
    try:
        resp = SESSION.get(url, params=params, timeout=REQUEST_TIMEOUT)
        if resp.status_code >= 400:
            return None, resp.status_code
        return resp, resp.status_code
    except Exception:
        return None, 0


def parse_sitemap_urls(xml_text):
    soup = BeautifulSoup(xml_text, "xml")
    locs = [loc.get_text(strip=True) for loc in soup.find_all("loc")]
    return locs


def discover_companies_from_sitemap(ats_key):
    cfg = ATS_CONFIG[ats_key]
    sitemap_url = cfg["sitemap"]
    regex = cfg["company_regex"]

    companies = set()

    resp, code = fetch(sitemap_url)
    if not resp:
        print(f"  - Could not fetch sitemap: {sitemap_url} (status={code})")
        return companies

    locs = parse_sitemap_urls(resp.text)

    # If this is a sitemap index, follow a limited number of child sitemaps
    if any(".xml" in loc for loc in locs):
        # Try to detect sitemapindex by checking if many locs end with .xml
        xml_locs = [loc for loc in locs if loc.endswith(".xml")]
        if xml_locs:
            for child in xml_locs[:10]:
                child_resp, child_code = fetch(child)
                if not child_resp:
                    continue
                child_locs = parse_sitemap_urls(child_resp.text)
                for url in child_locs:
                    m = regex.search(url)
                    if m:
                        companies.add(m.group(1).strip())
                        if len(companies) >= MAX_COMPANIES_PER_ATS:
                            return companies
                time.sleep(SLEEP_BETWEEN_REQUESTS)
            return companies

    # Otherwise treat as a direct sitemap of URLs
    for url in locs:
        m = regex.search(url)
        if m:
            companies.add(m.group(1).strip())
            if len(companies) >= MAX_COMPANIES_PER_ATS:
                break

    return companies


def clean_html(html_content):
    if not html_content:
        return "No description"
    if not isinstance(html_content, str):
        return str(html_content)
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text(separator=" ")[:5000].strip()
    except Exception:
        return str(html_content)[:5000]


def get_logo_url(company_name, source_domain):
    if company_name and company_name.lower() != "unknown":
        clean_name = re.sub(r"[^a-zA-Z0-9]", "", company_name).lower()
        if clean_name:
            return f"https://logos.hunter.io/{clean_name}.com"
    return f"https://logos.hunter.io/{source_domain}"


def get_category(title):
    title = (title or "").lower()
    if any(x in title for x in ["developer", "engineer", "software", "react", "node", "python"]):
        return "Development"
    if any(x in title for x in ["design", "ui", "ux", "artist", "creative"]):
        return "Design"
    if any(x in title for x in ["marketing", "seo", "sales", "growth"]):
        return "Marketing"
    return "Other"


def is_remote_anywhere(title, location, description):
    text = f"{title} {location} {description}".lower()

    restricted_phrases = [
        "us only", "usa only", "united states only", "united kingdom only", "uk only", "eu only",
        "europe only", "emea only", "apac only", "canada only", "australia only", "new zealand only",
        "india only", "philippines only", "latin america only", "latam only", "north america only",
        "south america only", "africa only", "middle east only", "remote - us", "remote (us)",
        "remote - uk", "remote - eu", "remote - canada", "remote - europe", "remote - emea",
        "must be located in", "must reside in", "must live in", "eligible to work in",
        "work authorization", "work authorisation", "citizen only",
    ]

    if any(phrase in text for phrase in restricted_phrases):
        return False

    positive_keywords = [
        "remote anywhere", "work from anywhere", "worldwide", "global", "anywhere", "distributed",
        "remote (global)", "remote - global", "remote - worldwide",
    ]

    explicit = any(k in text for k in positive_keywords)
    if explicit:
        return True

    remote_flag = "remote" in text or "work from home" in text or "distributed" in text
    location_clean = (location or "").strip().lower()
    location_empty = location_clean == "" or location_clean in ["remote", "worldwide", "global", "anywhere"]

    if remote_flag and location_empty:
        return True

    return False


def already_exists(external_id):
    try:
        existing = supabase.table("jobs").select("external_id").eq("external_id", external_id).execute()
        return bool(existing.data)
    except Exception:
        return False


def save_job(job_data):
    try:
        supabase.table("jobs").insert(job_data).execute()
        return True
    except Exception as e:
        print(f"  - Database error: {e}")
        return False

# --- 4. ATS FETCHERS ---

def fetch_greenhouse_jobs(company):
    url = ATS_CONFIG["greenhouse"]["jobs_api"].format(company=company)
    resp, code = fetch(url)
    if not resp:
        return []
    try:
        data = resp.json()
    except Exception:
        return []

    jobs = []
    for job in data.get("jobs", []):
        title = job.get("title")
        location = (job.get("location") or {}).get("name", "")
        description = job.get("content") or ""
        apply_url = job.get("absolute_url")
        job_id = job.get("id")

        jobs.append({
            "external_id": f"greenhouse:{company}:{job_id}",
            "title": title,
            "company": company,
            "location": location,
            "description": clean_html(description),
            "apply_url": apply_url,
            "source_url": apply_url,
            "source": "Greenhouse",
            "logo": get_logo_url(company, ATS_CONFIG["greenhouse"]["source_domain"]),
        })

    return jobs


def fetch_lever_jobs(company):
    url = ATS_CONFIG["lever"]["jobs_api"].format(company=company)
    resp, code = fetch(url)
    if not resp:
        return []
    try:
        data = resp.json()
    except Exception:
        return []

    jobs = []
    for job in data:
        title = job.get("text")
        categories = job.get("categories", {})
        location = categories.get("location", "")
        description = job.get("descriptionPlain") or job.get("description") or ""
        apply_url = job.get("hostedUrl")
        job_id = job.get("id")

        jobs.append({
            "external_id": f"lever:{company}:{job_id}",
            "title": title,
            "company": company,
            "location": location,
            "description": clean_html(description),
            "apply_url": apply_url,
            "source_url": apply_url,
            "source": "Lever",
            "logo": get_logo_url(company, ATS_CONFIG["lever"]["source_domain"]),
        })

    return jobs


def fetch_workable_jobs(company):
    url = ATS_CONFIG["workable"]["jobs_api"].format(company=company)
    resp, code = fetch(url, params={"state": "published"})
    if not resp:
        return []

    try:
        data = resp.json()
    except Exception:
        return []

    jobs_raw = []
    if isinstance(data, dict):
        if "results" in data:
            jobs_raw = data.get("results", [])
        elif "jobs" in data:
            jobs_raw = data.get("jobs", [])
        else:
            # Unknown response shape
            return []
    elif isinstance(data, list):
        jobs_raw = data

    jobs = []
    for job in jobs_raw:
        title = job.get("title")
        loc = job.get("location")
        if isinstance(loc, dict):
            location = loc.get("city") or loc.get("country") or loc.get("region") or loc.get("name") or ""
        else:
            location = loc or ""

        description = job.get("description") or ""
        apply_url = job.get("shortlink") or job.get("url")
        job_id = job.get("id") or job.get("shortcode")

        jobs.append({
            "external_id": f"workable:{company}:{job_id}",
            "title": title,
            "company": company,
            "location": location,
            "description": clean_html(description),
            "apply_url": apply_url,
            "source_url": apply_url,
            "source": "Workable",
            "logo": get_logo_url(company, ATS_CONFIG["workable"]["source_domain"]),
        })

    return jobs

# --- 5. MAIN ---

def process_ats(ats_key):
    cfg = ATS_CONFIG[ats_key]
    print(f"\n=== {cfg['name']} ===")

    companies = discover_companies_from_sitemap(ats_key)
    if not companies:
        print(f"No companies discovered for {cfg['name']}.")
        return 0

    print(f"Discovered {len(companies)} companies. Fetching jobs...")

    total_saved = 0
    for i, company in enumerate(sorted(companies)):
        if i >= MAX_COMPANIES_PER_ATS:
            break

        if ats_key == "greenhouse":
            jobs = fetch_greenhouse_jobs(company)
        elif ats_key == "lever":
            jobs = fetch_lever_jobs(company)
        else:
            jobs = fetch_workable_jobs(company)

        if not jobs:
            time.sleep(SLEEP_BETWEEN_REQUESTS)
            continue

        for job in jobs[:MAX_JOBS_PER_COMPANY]:
            if not job.get("apply_url"):
                continue

            if not is_remote_anywhere(job.get("title"), job.get("location"), job.get("description")):
                continue

            external_id = job.get("external_id")
            if already_exists(external_id):
                continue

            job_data = {
                "external_id": str(external_id),
                "title": str(job.get("title") or ""),
                "company": str(job.get("company") or "Unknown"),
                "location": "Remote",
                "description": job.get("description") or "No description",
                "salary_text": "Not Listed",
                "apply_url": str(job.get("apply_url")),
                "logo": job.get("logo"),
                "category": get_category(job.get("title")),
                "source_url": str(job.get("source_url")),
                "source": job.get("source"),
                "status": "pending",
                "post_to_site": False,
            }

            if save_job(job_data):
                total_saved += 1

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    print(f"Saved {total_saved} jobs for {cfg['name']}.")
    return total_saved


def main():
    print("\nATS Directory Scraper (Remote Anywhere)\n")
    total = 0

    # Only the requested subset: Greenhouse, Lever, Workable
    for ats_key in ["greenhouse", "lever", "workable"]:
        total += process_ats(ats_key)

    print(f"\nDone. Total new jobs saved: {total}\n")


if __name__ == "__main__":
    main()
