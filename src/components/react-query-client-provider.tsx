"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isServer = typeof window === "undefined";

  const ls = isServer ? null : window.localStorage;

  const persister = createSyncStoragePersister({
    storage: ls,
  });
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000,
        },
      },
    });
    // 🚨 never unsubscribes from syncing
    return client;
  });

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
