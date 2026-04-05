import Link from 'next/link';

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
          🍽 Meal Planner
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            History
          </Link>
          <Link
            href="/new"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            + New Plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
