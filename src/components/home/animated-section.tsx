"use client";

import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PremiumDivider } from "@/components/home/premium-sparkles";
import { TypewriterText } from "@/components/home/typewriter-text";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  badgeVariant?: "default" | "secondary";
  centered?: boolean;
  showDivider?: boolean;
  sparkle?: boolean;
  headerClassName?: string;
  className?: string;
  contained?: boolean;
  as?: "section" | "div";
  children: ReactNode;
  contentClassName?: string;
}

export function AnimatedSection({
  id,
  eyebrow,
  title,
  description,
  badgeVariant = "default",
  centered = true,
  showDivider = true,
  sparkle = true,
  headerClassName,
  className,
  contained = true,
  as: Tag = "section",
  children,
  contentClassName,
}: AnimatedSectionProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [typingDone, setTypingDone] = useState(false);

  return (
    <div ref={ref}>
      <Tag
        id={id}
        className={cn(contained && "mx-auto max-w-7xl px-4 sm:px-6", className)}
      >
      <div
        className={cn(
          centered ? "mx-auto max-w-2xl text-center" : "text-left max-w-none",
          "mb-10 space-y-3",
          headerClassName
        )}
      >
        <Badge
          variant={badgeVariant}
          className={cn(
            "mb-1 transition-opacity duration-500",
            centered && "mx-auto",
            inView ? "opacity-100" : "opacity-0"
          )}
        >
          {sparkle ? (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 animate-sparkle-pulse text-blaze" />
              {eyebrow}
            </span>
          ) : (
            eyebrow
          )}
        </Badge>

        <h2 className="font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
          <TypewriterText
            text={title}
            active={inView}
            onComplete={() => setTypingDone(true)}
          />
        </h2>

        {description ? (
          <p
            className={cn(
              "text-sm leading-relaxed text-muted transition-all duration-700 ease-out",
              typingDone
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            {description}
          </p>
        ) : null}

        {sparkle && showDivider ? (
          <div
            className={cn(
              "transition-opacity duration-700 delay-150",
              typingDone ? "opacity-100" : "opacity-0"
            )}
          >
            <PremiumDivider />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "transition-all duration-700 ease-out",
          typingDone
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0",
          contentClassName
        )}
      >
        {children}
      </div>
    </Tag>
    </div>
  );
}
