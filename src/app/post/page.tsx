'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import { FaRocket, FaPaperPlane, FaGlobe, FaStar, FaCheckCircle } from 'react-icons/fa';

const CONTACT_EMAIL = 'barnwool@yahoo.com';

export default function PostJobPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 min-h-screen"
    >
      <section className="text-center mb-12 bg-gradient-to-br from-white to-blue-50 p-10 rounded-3xl shadow-xl border border-blue-100">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-block"
        >
          <FaRocket className="text-6xl text-blue-600 mb-6" />
        </motion.div>

        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">
          Post Your Job on <span className="text-blue-600">RemoteJobBay</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Attract top-tier global talent. Send us your role details by email and we will review and publish your listing.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <FaGlobe className="text-blue-500" /> Global Reach
          </div>
          <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <FaStar className="text-yellow-500" /> Premium Listing
          </div>
          <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <FaCheckCircle className="text-green-500" /> Fast Review
          </div>
        </div>

        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Post%20a%20Job%20on%20RemoteJobBay`}
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <FaPaperPlane />
          Email to Post Job
        </a>
        <p className="mt-4 text-sm text-gray-400">
          Contact us at <span className="font-mono text-gray-500">{CONTACT_EMAIL}</span>
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: FaGlobe, title: 'Global Talent Pool', desc: 'Connect with skilled professionals from every corner of the world.' },
          { icon: FaStar, title: 'Premium Visibility', desc: 'Your listing is reviewed and published for quality visibility on the platform.' },
          { icon: FaPaperPlane, title: 'Simple Process', desc: 'Email us your job details and we will review and publish quickly.' },
        ].map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <item.icon className="text-3xl text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="text-center bg-blue-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to hire your next star?</h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">
            Send your role details today and we will help you reach remote talent worldwide.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Post%20a%20Job%20on%20RemoteJobBay`}
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </motion.main>
  );
}
