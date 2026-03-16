import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCommunityArticleBySlug } from '../data';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getCommunityArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.title} | RemoteJobBay`,
    description: article.excerpt,
    alternates: {
      canonical: `/community/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://www.remotejobbay.com/community/${article.slug}`,
      siteName: 'RemoteJobBay',
      images: [
        {
          url: 'https://www.remotejobbay.com/default-logo.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: ['https://www.remotejobbay.com/default-logo.png'],
    },
  };
}

export const revalidate = 300;

export default async function CommunityArticlePage({ params }: Props) {
  const article = await getCommunityArticleBySlug(params.slug);
  if (!article) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.publishedAt ?? undefined,
    mainEntityOfPage: `https://www.remotejobbay.com/community/${article.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'RemoteJobBay',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.remotejobbay.com/default-logo.png',
      },
    },
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <Link href="/community" className="text-sm text-amber-700 font-semibold">
          Back to Community
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700">
            {article.category}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>{article.date}</span>
            <span>{article.readTime}</span>
            <span>By {article.author}</span>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-slate-700 leading-relaxed">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {article.tags.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-[0.2em]">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
          >
            Browse remote jobs
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-amber-700 text-amber-800 font-semibold hover:bg-amber-50 transition-colors"
          >
            Share feedback
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
