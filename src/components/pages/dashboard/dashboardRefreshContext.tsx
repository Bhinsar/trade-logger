"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface DashboardRefreshCtx {
  /** Increment this value in useEffect deps to trigger a re-fetch */
  refreshKey: number;
  /** Call this after a trade is saved */
  triggerRefresh: () => void;
}

const DashboardRefreshContext = createContext<DashboardRefreshCtx>({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function DashboardRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <DashboardRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}

export function useDashboardRefresh() {
  return useContext(DashboardRefreshContext);
}
