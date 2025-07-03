'use client';

import Link from 'next/link';
import { Job } from '@/types';

type Props = {
  job: Job;
};

export default function JobCard({ job }: Props) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition">
        <div className="flex items-center gap-4">
          <img
            src={job.logo?.trim() ? job.logo : '/default-logo.png'}
            alt={job.company}
            className="w-14 h-14 object-contain bg-white border rounded"
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{job.title}</h3>
            <p className="text-gray-500">{job.company}</p>
            <div className="flex gap-2 text-sm text-gray-400 mt-1">
              <span>🌍 Anywhere</span>
              <span>💰 {job.salaryType === 'hourly' ? `$${job.salary}/hr` : `$${job.salary}/yr`}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
