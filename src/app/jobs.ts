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
  salaryType: 'hourly' | 'annually'; // ✅ NEW FIELD
};

export const jobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "OpenAI",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Build interfaces using React, TypeScript, and Tailwind CSS.",
    logo: "https://logo.clearbit.com/openai.com",
    category: "Frontend",
    salary: "80,000 - 100,000",
    salaryType: "annually", // ✅
    datePosted: "2025-06-15"
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Google",
    location: "Remote (Global)",
    type: "Part-time",
    description: "Develop server-side applications with Node.js and Python.",
    logo: "https://logo.clearbit.com/google.com",
    category: "Backend",
    salary: "40,000 - 85,000",
    salaryType: "annually", // ✅
    datePosted: "2025-06-20"
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Microsoft",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Create user-centered design systems and flows.",
    logo: "https://logo.clearbit.com/microsoft.com",
    category: "Design",
    salary: "80,000 - 120,000",
    salaryType: "annually", // ✅
    datePosted: "2025-06-21"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Amazon",
    location: "Remote (Global)",
    type: "Contract",
    description: "Maintain CI/CD pipelines and cloud infrastructure.",
    logo: "https://logo.clearbit.com/amazon.com",
    category: "DevOps",
    salary: "40 - 60",
    salaryType: "hourly", // ✅ Hourly job
    datePosted: "2025-06-14"
  },
  {
    id: 5,
    title: "Product Manager",
    company: "Netflix",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Manage product lifecycle and team coordination.",
    logo: "https://logo.clearbit.com/netflix.com",
    category: "Product",
    salary: "65,000 - 100,000",
    salaryType: "annually", // ✅
    datePosted: "2025-06-01"
  }
];
