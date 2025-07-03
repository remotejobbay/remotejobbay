'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUser } from '@/context/UserContext';
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaAlignLeft } from 'react-icons/fa';
import { MdCategory, MdAccessTime } from 'react-icons/md';

export default function PostJobForm() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Anywhere',
    type: '',
    category: '',
    salary: '',
    salaryType: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to post a job.');
      return;
    }

    setLoading(true);

    const domain = form.company.trim().toLowerCase().replace(/\s+/g, '') + '.com';
    const logo = `https://logo.clearbit.com/${domain}`;

    const { error } = await supabase.from('jobs').insert([
      {
        ...form,
        location: form.location || 'Anywhere',
        logo,
        user_id: user.id,
        datePosted: new Date().toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Error posting job:', error);
      alert('Something went wrong while posting the job.');
    } else {
      alert('✅ Job posted successfully!');
      router.push('/');
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 animate-fadeInUp">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        🚀 Post a Remote Job Opportunity
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex items-center gap-2">
          <FaBriefcase className="text-blue-600" />
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaBuilding className="text-blue-600" />
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            required
            value={form.company}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" />
          <input
            type="text"
            name="location"
            placeholder="Location (default: Anywhere)"
            value={form.location}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <MdAccessTime className="text-blue-600" />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select Job Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <MdCategory className="text-blue-600" />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select Category</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="Product">Product</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <FaDollarSign className="text-blue-600" />
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            required
            value={form.salary}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaDollarSign className="text-blue-600" />
          <select
            name="salaryType"
            value={form.salaryType}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Salary Type</option>
            <option value="hourly">Hourly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="flex items-start gap-2">
          <FaAlignLeft className="text-blue-600 mt-2" />
          <textarea
            name="description"
            placeholder="Job Description"
            required
            value={form.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded h-36 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-300 font-semibold"
        >
          {loading ? 'Posting...' : '✅ Post Job'}
        </button>
      </form>
    </main>
  );
}
