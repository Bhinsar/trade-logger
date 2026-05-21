"use client";

import { BarChart2, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface TradeTopBarProps {
  totalCount: number;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
  onAddTrade: () => void;
}

export function TradeTopBar({
  totalCount,
  showFilters,
  hasActiveFilters,
  onToggleFilters,
  onAddTrade,
}: TradeTopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Trade count badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm text-[#c8ccd8]">
        <BarChart2 className="size-3.5 text-emerald-400" />
        <span className="font-semibold text-white">{totalCount.toLocaleString()}</span>
        <span className="text-[#6b7094]">trades</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={cn(
            "gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-[#c8ccd8]",
            showFilters && "bg-white/10 border-emerald-500/30 text-emerald-400",
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-0.5 size-1.5 rounded-full bg-emerald-400 inline-block" />
          )}
        </Button>

        <Button
          size="sm"
          onClick={onAddTrade}
          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0"
        >
          <Plus className="size-3.5" />
          Add Trade
        </Button>
      </div>
    </div>
  );
}
