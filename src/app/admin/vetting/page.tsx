'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';
import landingFilters from '@/data/landing-filters.json';

type ScrapedJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  post_to_site?: boolean | null;
  experience_level?: string | null;
  skills?: string[] | string | null;
};

export default function VettingPage() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [jobMeta, setJobMeta] = useState<Record<number, { experience_level: string; skills: string }>>({});

  useEffect(() => {
    fetchScrapedJobs();
  }, []);

  async function fetchScrapedJobs() {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('post_to_site', false)
      .order('created_at', { ascending: false });
    if (data) {
      const parsed = data as ScrapedJob[];
      setJobs(parsed);
      setJobMeta((prev) => {
        const next = { ...prev };
        parsed.forEach((job) => {
          if (!next[job.id]) {
            next[job.id] = {
              experience_level: job.experience_level || 'entry',
              skills: Array.isArray(job.skills)
                ? job.skills.join(', ')
                : typeof job.skills === 'string'
                  ? job.skills
                  : '',
            };
          }
        });
        return next;
      });
    }
  }

  const normalizeSkills = (raw: string) => {
    const tokens = raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .map((value) =>
        value
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      )
      .filter(Boolean);

    return Array.from(new Set(tokens));
  };

  async function handleApprove(id: number) {
    const meta = jobMeta[id] || { experience_level: 'entry', skills: '' };
    const skillSlugs = normalizeSkills(meta.skills);

    const { error } = await supabase
      .from('jobs')
      .update({
        experience_level: meta.experience_level,
        skills: skillSlugs,
        post_to_site: true,
      })
      .eq('id', id);

    if (!error) {
      setJobs(jobs.filter((job) => job.id !== id));
      alert('Job Approved and Moved to Live!');
    }
  }

  async function handleReject(id: number) {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) setJobs(jobs.filter((job) => job.id !== id));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vetting Room ({jobs.length})</h1>
      {jobs.map((job) => (
        <div key={job.id} className="border p-4 mb-4 rounded shadow bg-white space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-bold text-lg">{job.title}</h2>
              <p className="text-gray-600">{job.company} - {job.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(job.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(job.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
              <select
                value={jobMeta[job.id]?.experience_level || 'entry'}
                onChange={(e) =>
                  setJobMeta((prev) => ({
                    ...prev,
                    [job.id]: { ...(prev[job.id] || { skills: '' }), experience_level: e.target.value },
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                value={jobMeta[job.id]?.skills || ''}
                onChange={(e) =>
                  setJobMeta((prev) => ({
                    ...prev,
                    [job.id]: { ...(prev[job.id] || { experience_level: 'entry' }), skills: e.target.value },
                  }))
                }
                placeholder="e.g. python, data-science, aws"
                list="skills-list"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <datalist id="skills-list">
                {landingFilters.skills.map((skill) => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated skill slugs. These power SEO landing pages.
              </p>
            </div>
          </div>
        </div>
      ))}
      {jobs.length === 0 && <p>No jobs to vet. Take a break!</p>}
    </div>
  );
}
