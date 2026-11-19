"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/data/types";

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSettings yalnız SettingsProvider daxilində işləyir");
  return s;
}
