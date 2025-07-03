from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Enable CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root test route
@app.get("/")
def read_root():
    return {"message": "EchoJobs backend is running 🎉"}

# Serve all jobs
@app.get("/jobs")
def get_jobs():
    file_path = os.path.join(os.path.dirname(__file__), "remote_jobs.json")
    
    if not os.path.exists(file_path):
        return {"error": "Jobs file not found."}

    with open(file_path, "r") as file:
        jobs = json.load(file)
    return jobs

# Serve a specific job by ID
@app.get("/jobs/{job_id}")
def get_job_by_id(job_id: int):
    file_path = os.path.join(os.path.dirname(__file__), "remote_jobs.json")

    if not os.path.exists(file_path):
        return {"error": "Jobs file not found."}

    with open(file_path, "r") as file:
        jobs = json.load(file)

    for job in jobs:
        if str(job.get("id")) == str(job_id):  # Convert both to string to ensure match
            return job

    return {"error": "Job not found"}
