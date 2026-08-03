import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-footer text-footer-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl uppercase tracking-wide">
            Gear<span className="text-blaze">Up</span>
          </p>
          <p className="mt-1 text-sm text-footer-text/70">
            Rent sports & outdoor gear instantly.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-footer-text/80">
          <Link href="/gear" className="hover:text-footer-text">
            Browse
          </Link>
          <Link href="/auth/register" className="hover:text-footer-text">
            Join
          </Link>
          <a
            href="https://gearup-api.vercel.app/api/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-footer-text"
          >
            API Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
