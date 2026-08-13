"use client";

import { cn, tapPress } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h2 className="font-display text-3xl uppercase text-ink">Something went wrong</h2>
      <p className="mt-3 text-ink/60">{error.message || "Unexpected error"}</p>
      <button
        type="button"
        onClick={reset}
        className={cn("mt-6 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white", tapPress)}
      >
        Try again
      </button>
    </div>
  );
}
