import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PremiumDivider } from "@/components/home/premium-sparkles";
import { cn } from "@/lib/utils";

interface PremiumSectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  badgeVariant?: "default" | "secondary";
  centered?: boolean;
  sparkle?: boolean;
  showDivider?: boolean;
  className?: string;
}

export function PremiumSectionHeader({
  eyebrow,
  title,
  description,
  badgeVariant = "default",
  centered = true,
  sparkle = true,
  showDivider = true,
  className,
}: PremiumSectionHeaderProps) {
  return (
    <div
      className={cn(
        centered ? "text-center max-w-2xl mx-auto" : "",
        "mb-10 space-y-3",
        className
      )}
    >
      <Badge variant={badgeVariant} className={cn("mb-1", centered && "mx-auto")}>
        {sparkle ? (
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-blaze animate-sparkle-pulse" />
            {eyebrow}
          </span>
        ) : (
          eyebrow
        )}
      </Badge>
      <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      ) : null}
      {sparkle && showDivider ? <PremiumDivider /> : null}
    </div>
  );
}
