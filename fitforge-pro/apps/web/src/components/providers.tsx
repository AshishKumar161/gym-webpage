"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { MouseGlow } from "@/components/ui/mouse-glow";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SmoothScrollProvider>
          <ScrollProgress />
          <MouseGlow />
          {children}
        </SmoothScrollProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
