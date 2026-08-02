import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-5xl uppercase text-ink">404</h1>
      <p className="mt-3 text-ink/60">That trail doesn’t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-blaze px-4 py-2 text-sm font-semibold text-white"
      >
        Back home
      </Link>
    </div>
  );
}
