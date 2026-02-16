export type Job = {
  id: string | number;         // ✅ Changed: Supports UUIDs (string) and Integers (number)
  title: string;
  company: string;
  location: string;
  type: string;                // e.g., "Full-time", "Contract"
  description?: string;        // ✅ Optional: List views might not have the full description
  logo?: string;               // ✅ Optional: Scraper jobs might miss the logo
  datePosted: string;
  category: string;
  salary?: string;             // ✅ Optional: Not all jobs list a salary
  salaryType?: 'hourly' | 'yearly' | string; // ✅ Optional & Flexible
  applyUrl?: string;           
  slug?: string;               // ✅ Optional: We fallback to 'id' if slug is missing
};