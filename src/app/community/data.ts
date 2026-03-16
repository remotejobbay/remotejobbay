import { createClient } from '@supabase/supabase-js';
import type { CommunityArticle } from './types';

type RawArticle = {
  id?: string | number;
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  read_time?: string;
  published_at?: string;
  author?: string;
  body?: string | string[];
  body_html?: string;
  tags?: string[] | string;
  image_url?: string;
  cover_image?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formatDate = (dateValue?: string) => {
  if (!dateValue) return 'Unpublished';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Unpublished';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const normalizeBody = (body?: string | string[]) => {
  if (!body) return [];
  if (Array.isArray(body)) return body.filter((p) => p.trim().length > 0);
  return body.split('\n').map((p) => p.trim()).filter(Boolean);
};

const normalizeTags = (tags?: string[] | string) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
};

const estimateReadTime = (body: string[]) => {
  const words = body.join(' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
};

const resolveImageUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${supabaseUrl}/storage/v1/object/public/${value.replace(/^\//, '')}`;
};

const normalizeArticle = (raw: RawArticle): CommunityArticle => {
  const body = normalizeBody(raw.body);
  const publishedAt = raw.published_at ?? null;
  const imageUrl = resolveImageUrl(raw.image_url ?? raw.cover_image ?? null);

  return {
    id: String(raw.id ?? raw.slug ?? Math.random()),
    slug: raw.slug ?? 'article',
    title: raw.title ?? 'Untitled article',
    excerpt: raw.excerpt ?? body[0] ?? 'No summary available yet.',
    category: raw.category ?? 'Guides',
    readTime: raw.read_time ?? estimateReadTime(body),
    date: formatDate(publishedAt ?? undefined),
    publishedAt,
    author: raw.author ?? 'RemoteJobBay Team',
    body,
    bodyHtml: raw.body_html ?? null,
    tags: normalizeTags(raw.tags),
    imageUrl,
  };
};

export const getCommunityArticles = async () => {
  const { data, error } = await supabase
    .from('community_articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to load community articles:', error?.message);
    return [] as CommunityArticle[];
  }

  return (data as RawArticle[]).map(normalizeArticle);
};

export const getCommunityArticleBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('community_articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('Failed to load community article:', error.message);
    }
    return null;
  }

  return normalizeArticle(data as RawArticle);
};
