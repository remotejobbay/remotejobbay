import Link from 'next/link';

export default function CategoriesPage() {
  const categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Product'];
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Job Categories</h1>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <li key={cat}>
            <Link
              href={`/jobs?category=${encodeURIComponent(cat)}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              {cat}
            </Link>
          </li>
        ))}
      </ul>
    </main>
);
}