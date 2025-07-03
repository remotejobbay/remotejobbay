import requests

SUPABASE_URL = "https://ozwpvhnivymheuhgleqx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3B2aG5pdnltaGV1aGdsZXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcyNDk4OCwiZXhwIjoyMDY2MzAwOTg4fQ.1jAER03nl-dXyYO3GdlEx8aRA6sBorAxz09n3-XkS64"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def insert_job(job):
    # Default values
    job['type'] = job.get('type') or 'Full-time'
    job['category'] = job.get('category') or 'Engineering'
    job['salaryType'] = job.get('salaryType') or 'Negotiable'
    job['logo'] = job.get('logo') or 'https://example.com/default-logo.png'
    job['location'] = job.get('location') or 'Remote'
    job['description'] = job.get('description') or 'No description provided'

    # Ensure salary is numeric
    try:
        job['salary'] = float(job['salary'])
    except (TypeError, ValueError):
        job['salary'] = 0

    response = requests.post(f"{SUPABASE_URL}/rest/v1/jobs", headers=HEADERS, json=job)

    if response.status_code >= 400:
        print(f"❌ Failed to upload: {job.get('title', 'No title')} - {response.status_code}")
        print("Response:", response.text)
    else:
        print(f"✅ Uploaded: {job.get('title', 'No title')} - {response.status_code}")
