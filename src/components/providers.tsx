"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useThemeStore } from "@/store/theme";

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );
  const theme = useThemeStore((s) => s.theme);

  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      {children}
      <Toaster
        richColors
        position="top-right"
        closeButton
        theme={theme === "dark" ? "dark" : "light"}
      />
    </QueryClientProvider>
  );
}
