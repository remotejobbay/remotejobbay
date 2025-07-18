'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUser } from '@/context/UserContext';
import PaystackInlineButton from '@/components/PaystackInlineButton';

import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaAlignLeft,
  FaPaperPlane,
} from 'react-icons/fa';
import { MdCategory, MdAccessTime } from 'react-icons/md';

export default function PostJobPage() {
  const { user } = useUser();
  const router = useRouter();

  const [paymentOk, setPaymentOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paystackJobId] = useState<number>(() => Date.now()); // ✅ CHANGED to number

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePaySuccess = () => {
    setPaymentOk(true);
  };

  const publishJob = async () => {
    if (!user) return alert('Please log in.');

    setLoading(true);

    const logo = `https://logo.clearbit.com/${form.company
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')}.com`;

    const jobData = {
      ...form,
      location: form.location || 'Worldwide',
      logo,
      user_id: user.id,
      datePosted: new Date().toISOString(),
      paid: true,
      published: true,
      paystack_ref: paystackJobId.toString(), // ✅ convert to string before insert
    };

    console.log('📤 Inserting job data:', jobData);

    const { error } = await supabase.from('jobs').insert([jobData]);

    setLoading(false);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return alert('Error posting job. Please check the form and try again.');
    }

    alert('✅ Job posted successfully!');
    router.push('/');
  };

  if (!user) return <p className="p-6">Please log in to post a job.</p>;

  if (!paymentOk) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-extrabold text-blue-800">
          Pay $100 to Post Your Job
        </h1>

        <PaystackInlineButton
          jobId={paystackJobId} // ✅ now a number
          email={user.email}
          onSuccess={handlePaySuccess}
          onClose={() => alert('Payment window closed.')}
        />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 animate-fadeInUp">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-800">
        🚀 Post a Remote Job on RemoteJobBay
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          publishJob();
        }}
        className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-100"
      >
        {loading && <p className="text-sm text-gray-500">Posting job…</p>}

        {[
          { icon: <FaBriefcase />, name: 'title', placeholder: 'Job Title' },
          { icon: <FaBuilding />, name: 'company', placeholder: 'Company Name' },
          { icon: <FaMapMarkerAlt />, name: 'location', placeholder: 'Location (e.g. Worldwide)' },
        ].map(({ icon, name, placeholder }) => (
          <div className="flex items-center gap-3" key={name}>
            <span className="text-blue-600">{icon}</span>
            <input
              type="text"
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
          <FaPaperPlane />
          {loading ? 'Posting…' : 'Publish Job'}
        </button>
      </form>
    </main>
  );
}
