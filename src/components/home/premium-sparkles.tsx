"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SparkleVariant = "hero" | "band" | "section";

interface PremiumSparklesProps {
  variant?: SparkleVariant;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  hue: "blaze" | "gold" | "fern" | "white";
}

const VARIANT_CONFIG: Record<
  SparkleVariant,
  { count: number; speed: number; size: [number, number] }
> = {
  hero: { count: 48, speed: 0.35, size: [0.6, 2.4] },
  band: { count: 28, speed: 0.22, size: [0.5, 1.8] },
  section: { count: 16, speed: 0.18, size: [0.4, 1.4] },
};

const HUES: Record<Particle["hue"], [number, number, number]> = {
  blaze: [232, 93, 4],
  gold: [255, 214, 120],
  fern: [45, 106, 79],
  white: [255, 255, 255],
};

function pickHue(variant: SparkleVariant): Particle["hue"] {
  const roll = Math.random();
  if (variant === "hero") {
    if (roll < 0.42) return "blaze";
    if (roll < 0.68) return "gold";
    if (roll < 0.86) return "white";
    return "fern";
  }
  if (roll < 0.5) return "gold";
  if (roll < 0.8) return "white";
  return "blaze";
}

function createParticles(
  width: number,
  height: number,
  variant: SparkleVariant
): Particle[] {
  const { count, speed, size } = VARIANT_CONFIG[variant];
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: size[0] + Math.random() * (size[1] - size[0]),
    speed: speed * (0.6 + Math.random() * 0.8),
    drift: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
    hue: pickHue(variant),
  }));
}

export function PremiumSparkles({
  variant = "hero",
  className,
}: PremiumSparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let start = performance.now();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height, variant);
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        const [r, g, b] = HUES[p.hue];
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(now: number) {
      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        const twinkle = 0.35 + 0.65 * Math.sin(t * p.speed * 4 + p.phase) ** 2;
        const y = (p.y - t * p.speed * 18 + height) % (height + 24) - 12;
        const x = p.x + Math.sin(t * p.speed * 2 + p.phase) * 12 * p.drift;
        const [r, g, b] = HUES[p.hue];

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${twinkle * 0.85})`;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * (0.7 + twinkle * 0.5), 0, Math.PI * 2);
        ctx!.fill();

        if (p.size > 1.2 && twinkle > 0.72) {
          ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${twinkle * 0.35})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(x - p.size * 2.2, y);
          ctx!.lineTo(x + p.size * 2.2, y);
          ctx!.moveTo(x, y - p.size * 2.2);
          ctx!.lineTo(x, y + p.size * 2.2);
          ctx!.stroke();
        }
      }

      if (!reducedMotion) {
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    if (reducedMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      cancelAnimationFrame(raf);
      if (reducedMotion) {
        drawStatic();
      } else {
        start = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-[1]", className)}
    />
  );
}

export function PremiumGlowOrbs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden z-0", className)}
    >
      <div className="premium-orb premium-orb-blaze absolute -left-16 top-1/4 h-72 w-72 rounded-full blur-3xl" />
      <div className="premium-orb premium-orb-fern absolute right-0 top-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="premium-orb premium-orb-gold absolute bottom-0 left-1/3 h-56 w-56 rounded-full blur-3xl" />
    </div>
  );
}

export function ShimmerText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("premium-shimmer-text relative inline-block", className)}>
      {children}
    </span>
  );
}

export function PremiumDivider() {
  return (
    <div
      aria-hidden
      className="relative mx-auto my-2 flex max-w-md items-center justify-center gap-3 py-2"
    >
      <span className="premium-spark-line h-px flex-1" />
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="premium-spark-core absolute h-1.5 w-1.5 rounded-full bg-blaze" />
        <span className="premium-spark-ring absolute h-5 w-5 rounded-full border border-blaze/30" />
      </span>
      <span className="premium-spark-line h-px flex-1" />
    </div>
  );
}
