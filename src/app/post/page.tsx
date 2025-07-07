'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUser } from '@/context/UserContext';
import {
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaDollarSign,
  FaAlignLeft, FaPaperPlane
} from 'react-icons/fa';
import { MdCategory, MdAccessTime } from 'react-icons/md';

export default function PostJobForm() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: 'Worldwide',
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

    const { error } = await supabase.from('jobs').insert([{
      ...form,
      location: form.location || 'Worldwide',
      logo,
      user_id: user.id,
      datePosted: new Date().toISOString(),
    }]);

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
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-800">
        🚀 Post a Remote Job on RemoteJobBay
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-100 transition-all"
      >
        {[
          { icon: <FaBriefcase />, name: 'title', placeholder: 'Job Title', type: 'text' },
          { icon: <FaBuilding />, name: 'company', placeholder: 'Company Name', type: 'text' },
          { icon: <FaMapMarkerAlt />, name: 'location', placeholder: 'Location (e.g. Worldwide)', type: 'text' },
        ].map(({ icon, name, placeholder, type }) => (
          <div className="flex items-center gap-3" key={name}>
            <div className="text-blue-600">{icon}</div>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              required
              value={(form as any)[name]}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <MdAccessTime className="text-blue-600" />
          <select
            name="type"
            required
            value={form.type}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select Job Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <MdCategory className="text-blue-600" />
          <select
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select Category</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="Product">Product</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <FaDollarSign className="text-blue-600" />
          <input
            type="number"
            name="salary"
            placeholder="Salary (e.g. 5000)"
            required
            value={form.salary}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <FaDollarSign className="text-blue-600" />
          <select
            name="salaryType"
            required
            value={form.salaryType}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Select Salary Type</option>
            <option value="hourly">Hourly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="flex items-start gap-3">
          <FaAlignLeft className="text-blue-600 mt-2" />
          <textarea
            name="description"
            placeholder="Job Description"
            required
            value={form.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg h-36 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          <FaPaperPlane className="text-white" />
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </main>
  );
}
