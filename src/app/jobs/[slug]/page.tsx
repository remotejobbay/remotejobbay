import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/utils/supabase/supabaseClient';
import JobDetailClient from './JobDetailClient';

type Props = {
  params: { slug: string }
}

// 1. THIS IS THE SEO MAGIC FOR GOOGLE & SOCIAL MEDIA PREVIEWS
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const isNumericId = !isNaN(Number(slug));

  let query = supabase.from('jobs').select('title, company, description, logo').eq('post_to_site', true);
  
  if (isNumericId) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data: job } = await query.maybeSingle();

  if (!job) {
    return { title: 'Job Not Found | RemoteJobBay' }
  }

  const cleanDescription = job.description 
    ? job.description.substring(0, 160).replace(/\n/g, ' ') + '...' 
    : `Apply for the ${job.title} position at ${job.company} on RemoteJobBay.`;

  return {
    title: `${job.title} at ${job.company} | RemoteJobBay`,
    description: cleanDescription,
    openGraph: {
      title: `${job.title} at ${job.company} | RemoteJobBay`,
      description: cleanDescription,
      images: [job.logo || '/default-logo.jpg'], 
      type: 'website',
    }
  }
}

// 2. THIS PASSES THE SLUG TO YOUR INTERACTIVE UI
export default function JobPage({ params }: Props) {
  return <JobDetailClient slug={params.slug} />;
}