from remoteok import scrape_remoteok
from remotive import scrape_remotive
from weworkremotely import scrape_wwr
from utils import insert_job

all_jobs = scrape_remoteok() + scrape_wwr()
# scrape_remotive() is skipped due to SSL error 526
print(f"Scraped {len(all_jobs)} jobs")

for job in all_jobs:
    insert_job(job)
