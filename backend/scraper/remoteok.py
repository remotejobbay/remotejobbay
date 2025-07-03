from bs4 import BeautifulSoup
import requests

def scrape_remoteok():
    url = "https://remoteok.com/remote-dev-jobs"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")

    jobs = []
    for job in soup.find_all("tr", class_="job"):
        title = job.find("h2", itemprop="title")
        company = job.find("h3", itemprop="name")
        date = job.find("time")
        if title and company and date:
            jobs.append({
                "title": title.get_text(strip=True),
                "company": company.get_text(strip=True),
                "datePosted": date["datetime"],
                "location": "Remote",
                "type": "Full-Time",
                "category": "Development",
                "salary": "Not specified",
                "salaryType": "yearly",
                "logo": "",
                "description": "",
            })
    return jobs
