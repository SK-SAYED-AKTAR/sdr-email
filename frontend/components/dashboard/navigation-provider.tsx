"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const SIDEBAR_EXPANDED_WIDTH = 272;
export const SIDEBAR_COLLAPSED_WIDTH = 84;
export const SIDEBAR_MARGIN = 12;

type NavigationContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <NavigationContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => setCollapsed((c) => !c),
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within a NavigationProvider");
  return ctx;
}

/** Space reserved in the main layout for the fixed, floating sidebar. */
export function sidebarContentOffset(collapsed: boolean) {
  return (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH) + SIDEBAR_MARGIN * 2;
}
