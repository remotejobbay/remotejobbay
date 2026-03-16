import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <section className="bg-white shadow-sm rounded-xl p-6 md:p-10 text-[15px] md:text-base leading-relaxed">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">About RemoteJobBay</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
          Remote work without location limits
        </h1>
        <p className="mt-5 text-slate-600">
          RemoteJobBay is a curated remote job board built for professionals who want true location
          flexibility. We focus on roles that are fully remote and clear about eligibility, so you
          can apply with confidence instead of guessing.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-slate-900">Why we exist</h2>
            <p className="mt-3 text-slate-600">
              Too many &quot;remote&quot; listings still require specific countries or relocation. We built
              RemoteJobBay to surface roles that are clear, transparent, and truly remote.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-slate-900">What you can expect</h2>
            <p className="mt-3 text-slate-600">
              Curated listings, clear role details, and fast application links. We aim to reduce
              noise and help you focus on the roles that fit.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Our standards</h2>
          <ul className="mt-4 list-disc list-inside text-slate-600 space-y-2">
            <li>Remote-first roles with clear location eligibility.</li>
            <li>Transparent job details and compensation info when available.</li>
            <li>Direct application links to hiring teams.</li>
            <li>Continuous removal of expired or misleading listings.</li>
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Who we serve</h2>
          <p className="mt-3 text-slate-600">
            RemoteJobBay supports global talent, digital nomads, and distributed teams. Whether you
            are early in your career or leading teams, we want you to find a role that respects your
            location and lifestyle.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Stay close to new roles</h2>
          <p className="mt-3 text-slate-700">
            New jobs are added regularly. If you want alerts or have hiring needs, we are ready to
            help.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse remote jobs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-blue-600 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
