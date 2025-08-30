'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { FaRocket, FaPaperPlane, FaGlobe, FaStar } from 'react-icons/fa';

export default function PostJobPage() {
  const { user } = useUser();
  const router = useRouter();

  // Optional: Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-lg text-gray-600">Please log in to post a job.</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 animate-fadeInUp">
      {/* Hero Section */}
      <section className="text-center mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 p-10 rounded-2xl shadow-xl border border-blue-100">
        <FaRocket className="text-5xl text-blue-600 mx-auto mb-6 animate-bounce" />
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
          Post Your Job on RemoteJobBay
        </h1>
        <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
          RemoteJobBay is the premier destination for connecting with top-tier
          remote talent from around the world. Our platform attracts skilled
          professionals seeking flexible, location-independent opportunities,
          making it the go-to site for employers like you. For just{' '}
          <span className="font-bold text-blue-600">$70</span>, your job listing
          will be prominently highlighted at the top of our page for a full week,
          ensuring maximum visibility and engagement with the best candidates.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FaGlobe className="text-blue-500" />
            <span>Reach a global pool of talented professionals</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaStar className="text-blue-500" />
            <span>Highlighted listing at the top of our page for 7 days</span>
          </div>
          <a
            href="mailto:barnwool@yahoo.com?subject=Post%20a%20Job%20on%20RemoteJobBay"
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition transform hover:scale-105"
          >
            <FaPaperPlane />
            Contact Us at barnwool@yahoo.com
          </a>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="text-center mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          Why Choose RemoteJobBay?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaGlobe className="text-3xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">
              Global Talent Pool
            </h3>
            <p className="text-gray-600">
              Connect with skilled professionals from every corner of the world,
              ready to bring their expertise to your team, no matter their
              location.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaStar className="text-3xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">
              Premium Visibility
            </h3>
            <p className="text-gray-600">
              Your job listing will shine at the top of our platform for a week,
              capturing the attention of top candidates.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaPaperPlane className="text-3xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">
              Simple Process
            </h3>
            <p className="text-gray-600">
              Email us your job details at{' '}
              <a
                href="mailto:barnwool@yahoo.com"
                className="text-blue-500 hover:underline"
              >
                barnwool@yahoo.com
              </a>
              . Once the $70 payment is confirmed, we’ll post your job promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-blue-800 text-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Find Your Next Star Hire?
        </h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Don’t miss out on the opportunity to tap into a worldwide pool of talent.
          Contact us today to post your job and attract the best remote
          professionals.
        </p>
        <a
          href="mailto:barnwool@yahoo.com?subject=Post%20a%20Job%20on%20RemoteJobBay"
          className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition transform hover:scale-105"
        >
          <FaPaperPlane />
          Get Started Now
        </a>
      </section>
    </main>
  );
}