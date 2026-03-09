'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { supabase } from '@/utils/supabase/supabaseClient';
import { FaRocket, FaCheckCircle } from 'react-icons/fa';

// Tell TypeScript about PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

// EXCHANGE RATE SETTINGS
const USD_PRICE = 70;
const EXCHANGE_RATE = 15; 
const GHS_AMOUNT = USD_PRICE * EXCHANGE_RATE; 
const PAYSTACK_AMOUNT_IN_PESEWAS = GHS_AMOUNT * 100; 

export default function PostJobPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    job_title: '',
    location: '',
    salary: '',
    description: '',
    application_url: '',
    contact_email: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Handle the Paystack Inline Popup
  const handlePayment = () => {
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: formData.contact_email || 'fallback@example.com',
      amount: PAYSTACK_AMOUNT_IN_PESEWAS,
      currency: 'GHS',
      ref: new Date().getTime().toString(), // Generate a random reference
      callback: async function (response: any) {
        // Payment successful!
        try {
          const { error } = await supabase.from('jobs').insert([
            {
              company: formData.company,
              title: formData.job_title,
              location: formData.location,
              salary_text: formData.salary,
              description: formData.description,
              apply_url: formData.application_url,
              contact_email: formData.contact_email,
              post_to_site: false, // Pending review
            },
          ]);

          if (error) throw error;
          setSuccess(true);
        } catch (error) {
          console.error('Error saving job:', error);
          alert('Payment successful, but we had trouble saving the job. Please contact support.');
        } finally {
          setIsSubmitting(false);
        }
      },
      onClose: function () {
        // User closed the modal
        setIsSubmitting(false);
        alert('Payment was cancelled. Your job has not been posted.');
      },
    });

    handler.openIframe();
  };

  // 2. Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if Paystack script has loaded
    if (typeof window !== 'undefined' && window.PaystackPop) {
      handlePayment();
    } else {
      setIsSubmitting(false);
      alert('Payment system is currently loading. Please try again in a second.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (success) {
    return (
      <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-2xl shadow-xl max-w-lg text-center border border-gray-100">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for posting! Your job has been securely saved and is currently <strong>pending review</strong>. It will be featured on the site shortly for one month.
          </p>
          <button onClick={() => router.push('/')} className="bg-[#2563eb] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors">
            Return to Job Board
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <>
      {/* Load Paystack's official JS SDK */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <main className="min-h-screen bg-[#f3f4f6] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <FaRocket className="text-5xl text-[#2563eb] mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Post a Job on <span className="text-[#2563eb]">RemoteJobBay</span>
            </h1>
            <p className="text-lg text-gray-600">
              Reach thousands of top-tier remote professionals. Fill out the details below to get featured for one month (${USD_PRICE}).
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                  <input required type="text" name="job_title" value={formData.job_title} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="e.g. Senior Frontend Engineer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="e.g. Worldwide, US Only" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Salary Range</label>
                  <input type="text" name="salary" value={formData.salary} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="e.g. $80k - $120k" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Application URL or Email <span className="text-red-500">*</span></label>
                <input required type="text" name="application_url" value={formData.application_url} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="https://your-site.com/apply or jobs@acme.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Contact Email <span className="text-red-500">*</span></label>
                <input required type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all" placeholder="For receipt and communications" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Description <span className="text-red-500">*</span></label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-all resize-y" placeholder="Describe the role, responsibilities, and requirements..."></textarea>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <FaCheckCircle className="text-[#2563eb] mt-1 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <strong>Premium Feature Included:</strong> Your job will be pinned to the top of the board for maximum visibility for 30 days. Payment is processed securely via Paystack.
                  <p className="mt-1 text-xs opacity-80">* Note: You will be billed the equivalent of ${USD_PRICE} in Ghana Cedis (approx. GH₵ {GHS_AMOUNT}) at checkout.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#2563eb] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1d4ed8] shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Pay $${USD_PRICE} & Submit Job`
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </>
  );
}