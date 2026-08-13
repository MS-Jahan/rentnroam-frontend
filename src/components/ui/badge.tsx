import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-blaze/15 text-blaze border-blaze/20",
    secondary: "bg-moss/15 text-moss dark:text-fern border-moss/20",
    outline: "bg-transparent text-ink border-line",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
    danger: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blaze/30",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
