from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Restrict CORS origins for production safety.
def parse_cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "https://www.remotejobbay.com,https://remotejobbay.com,http://localhost:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "EchoJobs backend is running"}


@app.get("/jobs")
def get_jobs():
    file_path = os.path.join(os.path.dirname(__file__), "remote_jobs.json")

    if not os.path.exists(file_path):
        return {"error": "Jobs file not found."}

    with open(file_path, "r", encoding="utf-8") as file:
        jobs = json.load(file)
    return jobs


@app.get("/jobs/{job_id}")
def get_job_by_id(job_id: int):
    file_path = os.path.join(os.path.dirname(__file__), "remote_jobs.json")

    if not os.path.exists(file_path):
        return {"error": "Jobs file not found."}

    with open(file_path, "r", encoding="utf-8") as file:
        jobs = json.load(file)

    for job in jobs:
        if str(job.get("id")) == str(job_id):
            return job

    return {"error": "Job not found"}
