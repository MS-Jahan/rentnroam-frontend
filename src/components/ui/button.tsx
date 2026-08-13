import { cn, tapPress } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  disabled,
  ...props
}: Props) {
  const variants = {
    primary: "bg-blaze text-white hover:bg-blaze/90",
    secondary: "bg-moss text-white hover:bg-fern",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-ink hover:bg-moss/5 border border-moss/15",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        tapPress,
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
