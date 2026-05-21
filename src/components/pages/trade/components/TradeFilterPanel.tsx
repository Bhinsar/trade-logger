"use client";

import { Calendar, FilterX, Search, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { ASSET_OPTIONS, Filters } from "./types";

interface TradeFilterPanelProps {
  filters: Filters;
  pendingSearch: string;
  isOpen: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (val: string) => void;
  onFilterChange: <K extends keyof Filters>(key: K, val: Filters[K]) => void;
  onToggleProfitLoss: (type: "profit" | "loss") => void;
  onClearFilters: () => void;
}

export function TradeFilterPanel({
  filters,
  pendingSearch,
  isOpen,
  hasActiveFilters,
  onSearchChange,
  onFilterChange,
  onToggleProfitLoss,
  onClearFilters,
}: TradeFilterPanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <div className="rounded-xl border border-white/8 bg-[#13141f] p-4 space-y-4">
        {/* Row 1: search, asset class, date range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Symbol search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6b7094] pointer-events-none" />
            <Input
              id="trade-search"
              placeholder="Search symbol…"
              value={pendingSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-8 bg-white/5 border-white/10 text-[#c8ccd8] placeholder:text-[#6b7094] focus-visible:border-emerald-500/50"
            />
          </div>

          {/* Asset class */}
          <Select
            value={filters.asset_class || "all"}
            onValueChange={(v) => onFilterChange("asset_class", v === "all" ? "" : v)}
          >
            <SelectTrigger
              id="asset-class-filter"
              className="h-8 bg-white/5 border-white/10 text-[#c8ccd8] data-placeholder:text-[#6b7094] w-full"
            >
              <Tag className="size-3.5 text-[#6b7094] shrink-0" />
              <SelectValue placeholder="Asset class" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date from */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6b7094] pointer-events-none" />
            <Input
              id="entry-date-from"
              type="date"
              value={filters.entry_time}
              onChange={(e) => onFilterChange("entry_time", e.target.value)}
              className="pl-9 h-8 bg-white/5 border-white/10 text-[#c8ccd8] [color-scheme:dark]"
            />
          </div>

          {/* Date to */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6b7094] pointer-events-none" />
            <Input
              id="entry-date-to"
              type="date"
              value={filters.exit_time}
              onChange={(e) => onFilterChange("exit_time", e.target.value)}
              className="pl-9 h-8 bg-white/5 border-white/10 text-[#c8ccd8] [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Row 2: Profit / Loss toggles + Clear */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#6b7094] font-medium">Show:</span>

          <button
            id="filter-profit"
            onClick={() => onToggleProfitLoss("profit")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
              filters.profit
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 text-[#6b7094] hover:text-[#c8ccd8] hover:border-white/20",
            )}
          >
            <TrendingUp className="size-3" />
            Profit
          </button>

          <button
            id="filter-loss"
            onClick={() => onToggleProfitLoss("loss")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
              filters.loss
                ? "bg-red-500/15 border-red-500/40 text-red-400"
                : "bg-white/5 border-white/10 text-[#6b7094] hover:text-[#c8ccd8] hover:border-white/20",
            )}
          >
            <TrendingDown className="size-3" />
            Loss
          </button>

          {hasActiveFilters && (
            <button
              id="clear-filters"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 ml-auto px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-[#6b7094] hover:text-red-400 hover:border-red-500/30 transition-all duration-150"
            >
              <FilterX className="size-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
