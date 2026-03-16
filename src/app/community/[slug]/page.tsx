/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCommunityArticleBySlug, getCommunityArticles } from '../data';

type Props = {
  params: Promise<{ slug: string }>;
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'R';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getCommunityArticleBySlug(resolvedParams.slug);
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
          url: article.imageUrl || 'https://www.remotejobbay.com/default-logo.png',
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
      images: [article.imageUrl || 'https://www.remotejobbay.com/default-logo.png'],
    },
  };
}

export const revalidate = 300;

export default async function CommunityArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const article = await getCommunityArticleBySlug(resolvedParams.slug);
  if (!article) return notFound();

  const allArticles = await getCommunityArticles();
  const related = allArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const galleryImages = article.galleryImages ?? [];

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
    <main className="bg-background-light text-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-10 lg:px-12 py-10">
        <div className="space-y-8">
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.featuredImageAlt || article.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/70 via-slate-200 to-white" />
            )}
            <div className="absolute bottom-0 left-0 p-6 md:p-12 z-20 max-w-3xl">
              <span className="inline-block bg-amber-400 text-slate-900 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4">
                {article.category}
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                {article.title}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <article className="lg:col-span-8 flex flex-col gap-8">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center border border-amber-200">
                  {getInitials(article.author)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{article.author}</p>
                  <p className="text-slate-500 text-sm">
                    {article.date} • {article.readTime}
                  </p>
                </div>
              </div>

              <div className="article-content text-lg leading-relaxed">
                {article.bodyHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
                ) : (
                  article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                )}
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={imageUrl}
                        alt={`${article.title} gallery ${index + 1}`}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <aside className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  RemoteJobBay Digest
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  Get the latest remote jobs and guides delivered to your inbox weekly.
                </p>
                <form className="flex flex-col gap-3" action="/" method="get">
                  <input
                    className="rounded-lg bg-slate-100 border-none focus:ring-2 focus:ring-amber-400 text-sm py-3 px-4"
                    placeholder="Your email address"
                    type="email"
                  />
                  <button className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-lg hover:opacity-90 transition-opacity" type="submit">
                    Subscribe Now
                  </button>
                </form>
              </div>

              {related.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2">Popular Posts</h3>
                  <div className="space-y-6">
                    {related.map((item) => (
                      <Link key={item.slug} href={`/community/${item.slug}`} className="group flex gap-4">
                        <div className="h-16 w-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.featuredImageAlt || item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
                              RB
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-bold group-hover:text-amber-700 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{item.readTime}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
