'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUser } from '@/context/UserContext';
import PaystackInlineButton from '@/components/PaystackInlineButton';
import {
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaDollarSign,
  FaAlignLeft, FaPaperPlane,
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
  const [draftId, setDraftId] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  /* Step 1 – save draft */
  const saveDraft = async () => {
    if (!user) return alert('Please log in.');

    setLoading(true);
    const logo =
      `https://logo.clearbit.com/${form.company.trim().toLowerCase().replace(/\s+/g, '')}.com`;

    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        ...form,
        location: form.location || 'Worldwide',
        logo,
        user_id: user.id,
        datePosted: new Date().toISOString(),
        published: false,
      }])
      .select('id')
      .single();

    setLoading(false);
    if (error) return alert('Error saving draft job.');
    setDraftId(data.id);
  };

  /* After webhook publishes */
  const handleSuccessPopup = () => {
    alert('✅ Payment made! Your job will appear once Paystack confirms.');
    router.push('/');
  };

  if (!user) return <div className="p-6">Please log in to post a job.</div>;

  /* Step 2 – show payment button */
  if (draftId) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-center text-blue-800">
          Pay $100 to Publish Your Job
        </h2>

        <PaystackInlineButton
          email={user.email}
          jobId={draftId}
          onSuccess={handleSuccessPopup}
          onClose={() => alert('Payment window closed')}
        />
      </div>
    );
  }

  /* Form to create draft */
  return (
    <main className="max-w-2xl mx-auto p-6 animate-fadeInUp">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-800">
        🚀 Post a Remote Job on RemoteJobBay
      </h1>

      <form
        onSubmit={(e) => { e.preventDefault(); saveDraft(); }}
        className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-100"
      >
        {loading && <p className="text-sm text-gray-500">Saving draft…</p>}

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
          {loading ? 'Saving…' : 'Continue to Payment'}
        </button>
      </form>
    </main>
  );
}
