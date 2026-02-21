"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

type SWRProviderProps = {
  children: ReactNode;
};

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
