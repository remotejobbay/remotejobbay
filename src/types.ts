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
    applyUrl?: string; // ✅ Add this line

};
