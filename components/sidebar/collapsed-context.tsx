"use client";

import { createContext, useContext } from "react";

const SidebarCollapsedContext = createContext(false);

export function useSidebarCollapsed() {
  return useContext(SidebarCollapsedContext);
}

export function SidebarCollapsedProvider({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      {children}
    </SidebarCollapsedContext.Provider>
  );
}
