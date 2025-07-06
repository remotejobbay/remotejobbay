'use client';

import { motion } from 'framer-motion';

export default function LegalPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-sm rounded-xl p-6 md:p-8 text-[15px] md:text-base leading-relaxed"
      >
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Terms and Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: July 1, 2025</p>

        <section className="space-y-6 text-gray-800">
          <p>
            Welcome to <strong>RemoteJobBay</strong> (“we,” “us,” “our,” or “the Site”). By accessing or using 
            <a href="https://www.remotejobbay.com" className="text-blue-600 underline mx-1" target="_blank">www.remotejobbay.com</a>, 
            you agree to the following Terms and Conditions and Privacy Policy. Please read this page carefully to understand your rights and obligations while using our website.
          </p>

          <h2 className="text-2xl font-semibold text-blue-800 mt-10">1. Terms and Conditions</h2>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.1 Acceptance of Terms</h3>
            <p>
              By using RemoteJobBay, you agree to comply with these terms and all applicable laws and regulations. If you do not agree, please do not use our site.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.2 Purpose of the Site</h3>
            <p>
              RemoteJobBay is a global remote job board focused on publishing fully remote jobs that can be done from any country. We aim to help job seekers find high-quality, location-independent job opportunities.
            </p>
            <p>
              <strong>Note:</strong> We do not guarantee employment or serve as an employer for any job posted.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.3 Job Listings</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>We strive to ensure every listing is legitimate, premium, and fully remote.</li>
              <li>We do not guarantee the accuracy or authenticity of third-party job listings.</li>
              <li>We are not responsible for any actions or decisions made by third-party employers.</li>
              <li>Users should conduct their own research before applying.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.4 User Responsibilities</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the website lawfully and respectfully</li>
              <li>Not post false or misleading information</li>
              <li>Not scrape, copy, or republish our content without permission</li>
              <li>Not misuse, hack, or interfere with the site’s operations</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.5 Intellectual Property</h3>
            <p>
              All content on RemoteJobBay — including logos, designs, text, and listings — is the property of RemoteJobBay and is protected by copyright laws. Unauthorized use is prohibited.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.6 Limitation of Liability</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Interactions with third-party job listings</li>
              <li>Technical errors, site downtime, or data issues</li>
              <li>Job rejections or application outcomes</li>
            </ul>
            <p>You use the site at your own risk.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.7 External Links</h3>
            <p>
              RemoteJobBay may contain links to third-party websites. We are not responsible for their content, accuracy, or privacy practices. Use them at your discretion.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.8 Changes to Terms</h3>
            <p>
              We reserve the right to update these terms at any time. Changes will be posted on this page with an updated effective date. Continued use of the site means you accept the new terms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.9 Termination</h3>
            <p>
              We may suspend or terminate your access to RemoteJobBay at any time if you violate our terms or misuse the platform.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">1.10 Governing Law</h3>
            <p>
              These terms are governed by the laws of Ghana. Any disputes will be handled by the appropriate courts within this jurisdiction.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-blue-800 mt-10">2. Privacy Policy</h2>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.1 Information We Collect</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your name and email (when subscribing to alerts or contacting us)</li>
              <li>Your IP address and browser/device information (for security and analytics)</li>
              <li>Any information you submit through forms or job postings</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.2 How We Use Your Information</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Send you job alerts or updates (if subscribed)</li>
              <li>Improve the functionality and content of our website</li>
              <li>Respond to inquiries or support requests</li>
              <li>Monitor and protect the site from abuse</li>
            </ul>
            <p>We do not sell or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.3 Cookies</h3>
            <p>
              RemoteJobBay uses cookies to enhance your browsing experience and analyze site traffic. You can disable cookies in your browser settings if you prefer.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.4 Third-Party Services</h3>
            <p>
              We may use third-party tools (like Google Analytics or email services) that process basic usage data. These tools have their own privacy policies, and we strive to work only with reputable providers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.5 Data Security</h3>
            <p>
              We implement security measures to protect your data, but no method of online transmission is 100% secure. You use the site at your own risk.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">2.6 Your Rights</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Access, update, or delete your personal information</li>
              <li>Unsubscribe from email communications at any time</li>
              <li>Contact us with any privacy concerns or questions</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-blue-800 mt-10">3. Contact Us</h2>
          <p className="mb-2">For any questions regarding these terms or our privacy practices, please contact us at:</p>
          <p className="ml-4">
            📧 Email: <span className="text-blue-600">[your email address]</span> <br />
            🌐 Website: <a href="https://www.remotejobbay.com" className="text-blue-600 underline" target="_blank">https://www.remotejobbay.com</a>
          </p>

          <p className="mt-10 text-sm text-gray-500">Thank you for trusting RemoteJobBay.</p>
        </section>
      </motion.div>
    </main>
  );
}
