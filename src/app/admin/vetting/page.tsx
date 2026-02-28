'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function VettingPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchScrapedJobs();
  }, []);

  async function fetchScrapedJobs() {
    const { data } = await supabase.from('scraped_jobs').select('*');
    if (data) setJobs(data);
  }

  async function handleApprove(id: number) {
    const { error } = await supabase.rpc('approve_scraped_job', { job_id: id });
    if (!error) {
      setJobs(jobs.filter(job => job.id !== id));
      alert("Job Approved and Moved to Live!");
    }
  }

  async function handleReject(id: number) {
    const { error } = await supabase.from('scraped_jobs').delete().eq('id', id);
    if (!error) setJobs(jobs.filter(job => job.id !== id));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vetting Room ({jobs.length})</h1>
      {jobs.map((job) => (
        <div key={job.id} className="border p-4 mb-4 rounded shadow flex justify-between items-center bg-white">
          <div>
            <h2 className="font-bold text-lg">{job.title}</h2>
            <p className="text-gray-600">{job.company} • {job.location}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleApprove(job.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Approve ✅
            </button>
            <button 
              onClick={() => handleReject(job.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reject ❌
            </button>
          </div>
        </div>
      ))}
      {jobs.length === 0 && <p>No jobs to vet. Take a break! ☕</p>}
    </div>
  );
}