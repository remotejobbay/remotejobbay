export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  logo: string;
  datePosted: string;
  category: string;
  salary: string;
  salaryType: 'hourly' | 'yearly';
  applyUrl?: string; // ✅ Optional apply URL
  slug: string;      // ✅ Added slug field for SEO URLs
};
