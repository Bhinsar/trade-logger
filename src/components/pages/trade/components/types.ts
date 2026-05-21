// ─── Constants ────────────────────────────────────────────────────────────────
export const PAGE_LIMIT = 10;

export const ASSET_OPTIONS = [
  { label: "All Assets", value: "all" },
  { label: "Equity", value: "Equity" },
  { label: "Crypto", value: "Crypto" },
  { label: "Forex", value: "Forex" },
  { label: "Options", value: "Options" },
] as const;

// ─── Filter Types ─────────────────────────────────────────────────────────────
export type SortField = "entry_time" | "pnl_nominal" | "symbol" | "pnl_percentage";
export type SortDir = "asc" | "desc";

export interface Filters {
  search: string;
  asset_class: string;
  profit: boolean;
  loss: boolean;
  entry_time: string;
  exit_time: string;
  sort_field: SortField;
  sort_dir: SortDir;
}

export const defaultFilters: Filters = {
  search: "",
  asset_class: "",
  profit: false,
  loss: false,
  entry_time: "",
  exit_time: "",
  sort_field: "entry_time",
  sort_dir: "desc",
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────
export function formatCurrency(val: number): string {
  return (
    (val >= 0 ? "+" : "") +
    "₹" +
    Math.abs(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function holdDuration(entry: Date, exit: Date): string {
  const ms = new Date(exit).getTime() - new Date(entry).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24) return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return remHrs > 0 ? `${days}d ${remHrs}h` : `${days}d`;
}
