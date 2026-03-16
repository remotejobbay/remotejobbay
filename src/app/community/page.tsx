import Link from 'next/link';
import type { Metadata } from 'next';
import { getCommunityArticles } from './data';

export const metadata: Metadata = {
  title: 'Remote Work Community and Blog | RemoteJobBay',
  description:
    'Articles, guides, and advice on remote work, hiring, and global careers. Learn how to find better remote jobs and grow your career.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Remote Work Community and Blog | RemoteJobBay',
    description: 'Remote work guides, advice, and hiring insights for global professionals.',
    url: 'https://www.remotejobbay.com/community',
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
    title: 'Remote Work Community and Blog | RemoteJobBay',
    description: 'Remote work guides, advice, and hiring insights for global professionals.',
    images: ['https://www.remotejobbay.com/default-logo.png'],
  },
};

export const revalidate = 300;

export default async function CommunityPage() {
  const articles = await getCommunityArticles();
  const categories = Array.from(new Set(articles.map((article) => article.category)));

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-amber-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 uppercase">Remote work community</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Guides, advice, and stories for remote careers
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Practical articles on finding remote jobs, building remote-first skills, and hiring
                globally. New posts are added regularly to support your next move.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
              >
                Submit a topic
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
              >
                Browse jobs
              </Link>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {articles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            No community posts yet. Add your first article in Supabase to get started.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/community/${article.slug}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-[0.2em]">
                  {article.category}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-slate-900 text-white rounded-2xl px-8 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Want weekly remote work insights?</h2>
          <p className="mt-3 text-slate-200">
            Subscribe to job alerts and community updates from RemoteJobBay.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center mt-6 px-7 py-3 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
          >
            Subscribe on the home page
          </Link>
        </div>
      </section>
    </main>
  );
}
