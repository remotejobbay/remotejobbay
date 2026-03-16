import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remote Jobs Worldwide | RemoteJobBay',
  description:
    'Browse curated remote jobs across engineering, design, marketing, product, support, and more. Find global, location-flexible roles and apply in minutes.',
  alternates: {
    canonical: '/remote-jobs',
  },
  openGraph: {
    title: 'Remote Jobs Worldwide | RemoteJobBay',
    description:
      'Curated remote jobs across top categories. Find global, location-flexible roles and apply today.',
    url: 'https://www.remotejobbay.com/remote-jobs',
    siteName: 'RemoteJobBay',
    images: [
      {
        url: 'https://www.remotejobbay.com/default-logo.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote Jobs Worldwide | RemoteJobBay',
    description:
      'Curated remote jobs across top categories. Find global, location-flexible roles and apply today.',
    images: ['https://www.remotejobbay.com/default-logo.png'],
  },
};

const categories = [
  { name: 'Fullstack', href: '/?category=Fullstack' },
  { name: 'Frontend', href: '/?category=Frontend' },
  { name: 'Backend', href: '/?category=Backend' },
  { name: 'Design', href: '/?category=Design' },
  { name: 'Product', href: '/?category=Product' },
  { name: 'Marketing', href: '/?category=Marketing' },
  { name: 'Customer Support', href: '/?category=Customer%20Support' },
  { name: 'Data Science', href: '/?category=Data%20Science' },
  { name: 'DevOps', href: '/?category=DevOps' },
  { name: 'Sales', href: '/?category=Sales' },
  { name: 'Writing', href: '/?category=Writing' },
  { name: 'Project Management', href: '/?category=Project%20Management' },
];

const faqs = [
  {
    q: 'Are these jobs fully remote?',
    a: 'Yes. We focus on roles that are location-flexible and clearly labeled as remote.',
  },
  {
    q: 'Do you list global roles?',
    a: 'Yes. We highlight jobs that are open to multiple countries and time zones whenever possible.',
  },
  {
    q: 'How often are jobs updated?',
    a: 'New roles are added frequently as we curate and verify listings.',
  },
  {
    q: 'Is it free to browse and apply?',
    a: 'Yes. Job seekers can browse and apply at no cost.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function RemoteJobsLandingPage() {
  return (
    <main className="bg-gradient-to-b from-amber-50 via-white to-slate-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 uppercase mb-4">
              Remote jobs worldwide
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Find vetted remote roles that fit your skills and time zone
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              RemoteJobBay curates high-quality, fully remote roles across engineering, design,
              marketing, product, and support. We focus on real opportunities with clear
              requirements, global eligibility, and fast application links.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
              >
                Explore open roles
              </Link>
              <Link
                href="/post"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
              >
                Post a remote job
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-700">
              <div className="bg-white rounded-lg border border-amber-100 px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900">Curated listings</p>
                <p className="text-slate-600 mt-1">Only roles marked remote.</p>
              </div>
              <div className="bg-white rounded-lg border border-amber-100 px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900">Global focus</p>
                <p className="text-slate-600 mt-1">Open across regions.</p>
              </div>
              <div className="bg-white rounded-lg border border-amber-100 px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900">Fast apply</p>
                <p className="text-slate-600 mt-1">Direct links to employers.</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-900">Top categories hiring now</h2>
            <p className="text-sm text-slate-600 mt-2">
              Jump into the most active remote categories and start applying today.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:border-amber-500 hover:text-amber-800 transition-colors bg-slate-50"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="mt-6 text-xs text-slate-500">
              Looking for something else? Browse all roles on the main job board.
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Search smarter',
              body: 'Filter by category, salary, and job type. Save your search and apply in minutes.',
            },
            {
              title: 'Trust the details',
              body: 'We highlight role requirements, location notes, and company context.',
            },
            {
              title: 'Stay in the loop',
              body: 'Subscribe to alerts and get fresh remote listings as they launch.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">Remote hiring that respects location</h2>
              <p className="mt-4 text-slate-200">
                RemoteJobBay prioritizes listings that are clear about time zones, compensation,
                and eligibility. That means fewer dead ends and more real opportunities.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
              >
                Talk to our team
              </Link>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-sm text-slate-200">
              <p className="font-semibold text-white">Who uses RemoteJobBay?</p>
              <ul className="mt-4 space-y-2">
                <li>Remote-first startups hiring globally</li>
                <li>Distributed teams expanding across time zones</li>
                <li>Professionals seeking location-flexible careers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Remote job FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-amber-100 border border-amber-200 rounded-2xl px-8 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Ready to find your next remote role?
          </h2>
          <p className="mt-3 text-slate-700">
            Browse vetted listings, save your favorites, and apply directly to hiring teams.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center mt-6 px-7 py-3 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
          >
            Start browsing remote jobs
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
