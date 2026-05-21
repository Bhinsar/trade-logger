"use client";

import { Lightbulb, Plus, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface StrategyTopBarProps {
  totalCount: number;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onAddStrategy: () => void;
}

export function StrategyTopBar({
  totalCount,
  searchValue,
  onSearchChange,
  onAddStrategy,
}: StrategyTopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13141f] p-4 rounded-xl border border-white/8">
      {/* Strategy count badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm text-[#c8ccd8] self-start sm:self-auto">
        <Lightbulb className="size-3.5 text-yellow-400 animate-pulse" />
        <span className="font-semibold text-white">{totalCount.toLocaleString()}</span>
        <span className="text-[#6b7094]">strategies</span>
      </div>

      {/* Search Input & Action button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:justify-end">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6b7094]" />
          <Input
            type="text"
            placeholder="Search strategies..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[#191a29] border-white/10 text-white placeholder:text-[#6b7094] focus-visible:ring-emerald-500/50"
          />
        </div>

        <Button
          size="sm"
          onClick={onAddStrategy}
          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0 h-9 shrink-0 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Add Strategy
        </Button>
      </div>
    </div>
  );
}
