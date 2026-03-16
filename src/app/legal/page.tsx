import Link from 'next/link';

export default function LegalPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <section className="bg-white shadow-sm rounded-xl p-6 md:p-8 text-[15px] md:text-base leading-relaxed">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms and Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective date: March 16, 2026</p>

        <div className="space-y-6">
          <p>
            Welcome to RemoteJobBay (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By using
            <Link href="https://www.remotejobbay.com" className="text-blue-600 underline mx-1" target="_blank">
              www.remotejobbay.com
            </Link>
            you agree to the Terms and Privacy Policy below.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-10">1. Terms</h2>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.1 Acceptance</h3>
            <p>
              By accessing the site, you agree to comply with these terms and all applicable laws. If you
              do not agree, please do not use the site.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.2 What we provide</h3>
            <p>
              RemoteJobBay is a global remote job board focused on fully remote opportunities. We are
              not an employer and do not guarantee employment.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.3 Job listings</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>We review listings to improve quality and reduce misleading posts.</li>
              <li>We cannot guarantee the accuracy of third-party listings.</li>
              <li>Applicants should verify details before applying.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.4 User responsibilities</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the site lawfully and respectfully.</li>
              <li>Do not post false or misleading content.</li>
              <li>Do not scrape or republish content without permission.</li>
              <li>Do not attempt to disrupt site operations.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.5 Intellectual property</h3>
            <p>
              Site content, branding, and design are owned by RemoteJobBay and protected by applicable
              copyright and trademark laws.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.6 Limitation of liability</h3>
            <p>
              The site is provided as-is. We are not liable for job application outcomes, third-party
              actions, or service interruptions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.7 External links</h3>
            <p>
              We may link to third-party websites. We are not responsible for their content or privacy
              practices.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.8 Changes</h3>
            <p>
              We may update these terms at any time. Continued use of the site means you accept the
              updated terms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">1.9 Governing law</h3>
            <p>These terms are governed by the laws of Ghana.</p>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 mt-10">2. Privacy</h2>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.1 Information we collect</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Name and email when you subscribe or contact us.</li>
              <li>Basic device and browser information for security and analytics.</li>
              <li>Any information you submit through forms or job postings.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.2 How we use information</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Send job alerts or service updates (if you opt in).</li>
              <li>Improve the site experience and content quality.</li>
              <li>Respond to requests and support inquiries.</li>
              <li>Protect the site from abuse or fraud.</li>
            </ul>
            <p>We do not sell personal information.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.3 Cookies</h3>
            <p>
              We use cookies for basic site functionality and analytics. You can disable cookies in
              your browser settings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.4 Third-party services</h3>
            <p>
              We may use third-party tools for analytics or email delivery. These providers have their
              own privacy policies.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.5 Data security</h3>
            <p>
              We take reasonable steps to protect your data, but no online service is completely
              secure.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700">2.6 Your choices</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Request access or deletion of your data.</li>
              <li>Unsubscribe from emails at any time.</li>
              <li>Contact us with privacy questions.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 mt-10">3. Contact</h2>
          <p className="mb-2">Questions about these terms or privacy practices?</p>
          <p>
            Email:{' '}
            <a className="text-blue-600 underline" href="mailto:support@remotejobbay.com">
              support@remotejobbay.com
            </a>
          </p>
          <p className="mt-4 text-sm text-gray-500">Thank you for trusting RemoteJobBay.</p>
        </div>
      </section>
    </main>
  );
}
