// ─── Constants ────────────────────────────────────────────────────────────────
export const PAGE_LIMIT = 10;

// ─── Filter Types ─────────────────────────────────────────────────────────────
export interface Filters {
  search: string;
}

export const defaultFilters: Filters = {
  search: "",
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}
