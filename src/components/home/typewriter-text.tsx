"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  active?: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  active = true,
  speed = 42,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [length, setLength] = useState(0);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setLength(0);
      setDone(false);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLength(text.length);
      setDone(true);
      onCompleteRef.current?.();
      return;
    }

    setLength(0);
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setLength(i);
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => window.clearInterval(id);
  }, [active, text, speed]);

  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      {text.slice(0, length)}
      {active && !done ? (
        <span
          aria-hidden
          className="ml-0.5 inline-block w-[2px] animate-pulse bg-blaze align-middle"
          style={{ height: "0.85em" }}
        />
      ) : null}
    </span>
  );
}
