"use client";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/types";

type Props = {
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ meta, page, onPageChange, className }: Props) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-center gap-3 ${className || ""}`}
    >
      <Button
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Previous
      </Button>
      <span className="text-sm text-ink/60">
        Page {meta.page} of {meta.totalPages}
        <span className="ml-1 text-ink/40">({meta.total} total)</span>
      </span>
      <Button
        variant="ghost"
        disabled={page >= meta.totalPages}
        onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
      >
        Next
      </Button>
    </div>
  );
}
