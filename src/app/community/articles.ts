export type CommunityArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Guides' | 'Advice' | 'Hiring' | 'Career' | 'Tools';
  readTime: string;
  date: string;
  author: string;
  body: string[];
  tags: string[];
};

export const communityArticles: CommunityArticle[] = [
  {
    slug: 'remote-job-search-strategy',
    title: 'A practical remote job search strategy that works in 2026',
    excerpt:
      'A step-by-step approach to finding remote roles faster, from narrowing your target to tracking outreach.',
    category: 'Advice',
    readTime: '6 min read',
    date: 'March 10, 2026',
    author: 'RemoteJobBay Team',
    tags: ['job search', 'remote', 'strategy'],
    body: [
      'Remote roles get a lot of applicants. The best way to stand out is to narrow your focus and apply with intent.',
      'Start by choosing a clear role target and a short list of companies you want to work for. Align your resume and portfolio to that target and remove anything that does not support it.',
      'Use a weekly system to track applications, follow-ups, and outcomes. This keeps momentum high and makes it easier to see what is working.',
      'Finally, prioritize roles that list timezone or location eligibility clearly. This reduces the risk of applying to jobs that will not consider your location.',
    ],
  },
  {
    slug: 'remote-interview-prep',
    title: 'Remote interview prep: how to show up with confidence',
    excerpt:
      'From your workspace setup to async communication, here is a complete checklist for remote interviews.',
    category: 'Career',
    readTime: '5 min read',
    date: 'March 5, 2026',
    author: 'RemoteJobBay Team',
    tags: ['interviews', 'remote work', 'career'],
    body: [
      'Remote interviews are about clarity and reliability. Clean audio, strong lighting, and a focused background matter.',
      'Treat async communication as a skill. Practice concise writing, clear status updates, and structured answers.',
      'Prepare stories that show how you work without constant supervision: examples of autonomy, ownership, and results.',
    ],
  },
  {
    slug: 'global-remote-compensation',
    title: 'Global remote compensation: what candidates should know',
    excerpt:
      'Understand location-based pay, ranges, and how to evaluate offers across regions.',
    category: 'Guides',
    readTime: '7 min read',
    date: 'February 26, 2026',
    author: 'RemoteJobBay Team',
    tags: ['salary', 'offers', 'global'],
    body: [
      'Many companies use location-based pay bands. Ask about how the range is set and what factors are considered.',
      'Compare offers using cost of living, tax impact, and benefits. A lower base can still be competitive if total value is strong.',
      'If a range is missing, request it early. It saves time for both you and the hiring team.',
    ],
  },
  {
    slug: 'how-we-curate-remote-jobs',
    title: 'How we curate remote job listings at RemoteJobBay',
    excerpt:
      'A transparent look at how we review roles, verify details, and keep listings clean.',
    category: 'Hiring',
    readTime: '4 min read',
    date: 'February 18, 2026',
    author: 'RemoteJobBay Team',
    tags: ['quality', 'hiring', 'trust'],
    body: [
      'We focus on roles that are clearly labeled as remote and provide a direct path to the employer.',
      'Listings with unclear location requirements or outdated information are removed or updated quickly.',
      'Our goal is to reduce noise so job seekers spend time on roles that are truly viable.',
    ],
  },
  {
    slug: 'remote-work-tools-stack',
    title: 'The remote work tools stack we recommend',
    excerpt:
      'A simple, modern toolkit for async communication, documentation, and focus.',
    category: 'Tools',
    readTime: '5 min read',
    date: 'February 10, 2026',
    author: 'RemoteJobBay Team',
    tags: ['tools', 'productivity', 'remote work'],
    body: [
      'A good stack keeps teams aligned. Start with a reliable chat tool, a documentation hub, and a project tracker.',
      'Avoid tool overload. Choose tools that integrate well and keep your workflow simple.',
      'For personal focus, use a calendar block system and a short daily planning ritual.',
    ],
  },
];

export const communityCategories: CommunityArticle['category'][] = [
  'Guides',
  'Advice',
  'Hiring',
  'Career',
  'Tools',
];

export const findCommunityArticle = (slug: string) =>
  communityArticles.find((article) => article.slug === slug);
