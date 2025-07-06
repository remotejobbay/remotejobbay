'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-sm rounded-xl p-6 md:p-8 text-[15px] md:text-base leading-relaxed"
      >
        <h1 className="text-3xl font-bold mb-6 text-blue-700">🌍 About RemoteJobBay</h1>

        <p className="mb-4">
          Welcome to <span className="font-semibold text-blue-600">RemoteJobBay</span> — your trusted hub for discovering 
          <span className="font-semibold text-green-600"> high-quality, fully remote jobs </span> 
          that you can do from <span className="underline decoration-pink-400 underline-offset-2">anywhere in the world</span>.
        </p>

        <p className="mb-4">
          We understand the frustration of searching for remote jobs, only to realize they are limited to specific countries like 
          <span className="text-red-500 font-medium"> the US, UK, or Canada</span>. 
          At <span className="font-semibold text-blue-600">RemoteJobBay</span>, we do things <span className="italic text-yellow-500">differently</span>.
        </p>

        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-700">💡 Why RemoteJobBay Was Created</h2>
        <p className="mb-4">
          Too often, job seekers come across <span className="text-red-500">misleading "remote" jobs</span> that require relocation or are limited to select regions.
          <strong className="text-blue-700"> We built RemoteJobBay to eliminate that confusion.</strong>
        </p>

        <p className="mb-4">
          Whether you live in <span className="text-green-700">Accra, Delhi, Manila, Lagos</span>, or anywhere else — 
          you deserve access to opportunities that support <span className="font-semibold text-pink-600">true global flexibility</span>.
        </p>

        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-700">🚀 What We Offer</h2>
        <p className="mb-4">We feature <span className="text-green-700 font-medium">handpicked, premium listings</span> across roles like:</p>

        <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
          <li>🖥️ <span className="font-medium">Software Development</span></li>
          <li>💬 <span className="font-medium">Customer Support</span></li>
          <li>📈 <span className="font-medium">Marketing & Sales</span></li>
          <li>🎨 <span className="font-medium">Design & UI/UX</span></li>
          <li>✍️ <span className="font-medium">Writing & Content Creation</span></li>
          <li>📊 <span className="font-medium">Data & Analytics</span></li>
          <li>🗂️ <span className="font-medium">Project Management</span></li>
          <li>...and more</li>
        </ul>

        <p className="mb-4 font-medium text-blue-700">✅ Every job is verified to ensure it:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
          <li>✔️ Is <span className="text-green-600 font-semibold">100% remote</span></li>
          <li>✔️ Offers <span className="text-green-600 font-semibold">fair pay</span> and flexibility</li>
          <li>✔️ Comes from <span className="text-green-600 font-semibold">trusted companies</span></li>
          <li>✔️ Is <span className="text-green-600 font-semibold">currently hiring</span></li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-700">🎯 Our Mission</h2>
        <p className="mb-4 text-base">
          <strong className="text-blue-600">To connect global talent with real remote opportunities — no matter where you live.</strong>
        </p>
        <p className="mb-4">
          We believe that <span className="font-bold text-pink-600">talent is everywhere</span>, and so should opportunity. 
          RemoteJobBay helps bridge the gap between skilled professionals and companies that embrace <span className="italic text-blue-700">true remote collaboration</span>.
        </p>

        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-700">🌐 Who It's For</h2>
        <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
          <li>🌎 Freelancers seeking remote-first work</li>
          <li>✈️ Digital nomads</li>
          <li>💼 Skilled professionals in emerging markets</li>
          <li>📅 Anyone who values <span className="text-green-600 font-semibold">freedom & flexibility</span></li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-purple-700">📢 Stay Connected</h2>
        <p className="mb-4">
          We constantly update our job listings with fresh opportunities. 
          <span className="font-semibold text-blue-600"> Subscribe to job alerts</span> to stay ahead of the curve.
        </p>

        <p className="mb-4">
          Are you hiring for remote roles? 
          <span className="font-semibold text-green-600"> Post your job</span> and reach thousands of global candidates.
        </p>

        <div className="mt-10 border-l-4 border-yellow-400 pl-4 text-base font-semibold text-gray-900">
          RemoteJobBay is more than a job board —
          <br />
          <span className="text-blue-700">It’s a platform built on a promise:</span>
          <br />
          <span className="text-pink-600">To make global remote work truly accessible.</span>
        </div>

        <p className="mt-8 text-blue-700 font-semibold text-lg">Welcome aboard 👋</p>
      </motion.div>
    </main>
  );
}
