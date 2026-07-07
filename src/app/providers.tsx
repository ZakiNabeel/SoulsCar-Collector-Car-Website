"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "@/lib/currency-context";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <CurrencyProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </CurrencyProvider>
  );
}
