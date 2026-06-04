import type { AppMode } from "../types";
import type { Lang } from "../i18n";

export interface StatEvent {
  ts: number;          // unix ms
  mode: AppMode;
  lang: Lang;
  docType?: string;    // invoice / quote / receipt etc.
}

const KEY = "billify_stats_v1";

export function trackDownload(event: StatEvent): void {
  if (typeof window === "undefined") return;
  try {
    const list: StatEvent[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    list.push(event);
    // keep last 2000 events
    const trimmed = list.length > 2000 ? list.slice(-2000) : list;
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch { /* storage full or unavailable */ }
}

export function loadEvents(): StatEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
