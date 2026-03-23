'use client';

import { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';

export default function BookmarkButton({ jobId }: { jobId: string | number }) {
  const { user } = useUser();
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedJobs');
    if (saved) {
      try {
        setBookmarked(JSON.parse(saved));
      } catch {
        setBookmarked([]);
      }
    }
  }, []);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save jobs.');
      return;
    }
    const idStr = String(jobId);
    const next = bookmarked.includes(idStr)
      ? bookmarked.filter((b) => b !== idStr)
      : [...bookmarked, idStr];
    setBookmarked(next);
    localStorage.setItem('bookmarkedJobs', JSON.stringify(next));
  };

  const isBookmarked = bookmarked.includes(String(jobId));

  return (
    <button
      onClick={toggleBookmark}
      className={`text-xl transition-colors ${
        isBookmarked ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
      }`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? <FaStar /> : <FaRegStar />}
    </button>
  );
}
