import JobDetailClient from './JobDetailClient';

// In Next.js 15, params must be typed as a Promise
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function JobDetailPage({ params }: Props) {
  // We must 'await' the params before we can read the slug
  const resolvedParams = await params;
  
  return <JobDetailClient slug={resolvedParams.slug} />;
}