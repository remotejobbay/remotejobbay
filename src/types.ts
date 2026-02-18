// types.ts

export type Job = {
  // ✅ Supports UUIDs (string) from scrapers and Integers (number) from manual entries
  id: string | number; 
  
  title: string;
  company: string;
  location: string;
  
  // e.g., "Full-time", "Contract", "Freelance"
  type: string; 
  
  // ✅ Optional: List views usually don't need the full text, only the Job Detail page does
  description?: string; 
  
  // ✅ Optional: Default to a placeholder icon if the scraper fails to find a logo
  logo?: string; 
  
  // Usually an ISO date string from Supabase
  datePosted: string; 
  category: string;
  
  // ✅ Optional: Not all companies are transparent about pay
  salary?: string; 
  salaryType?: 'hourly' | 'yearly' | string; 
  
  // URL for the 'Apply' button
  applyUrl?: string; 
  
  // SEO friendly URL (e.g., /jobs/senior-react-developer)
  slug?: string; 

  // --- DATABASE SPECIFIC FIELDS ---
  
  // ✅ CRITICAL: Used to filter jobs on the homepage (approved vs pending)
  status?: 'pending' | 'approved' | 'rejected'; 
  
  // Timestamp from Supabase
  created_at?: string; 
  
  // Useful for user-facing links
  company_website?: string; 
};