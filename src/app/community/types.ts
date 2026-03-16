export type CommunityArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: string | null;
  author: string;
  body: string[];
  tags: string[];
  imageUrl?: string | null;
};
