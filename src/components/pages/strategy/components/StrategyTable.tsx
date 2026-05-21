"use client";

import { Lightbulb, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { strategy } from "@/src/actions/strategies/strategie.interface";
import { PAGE_LIMIT, formatDate } from "./types";

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      <td className="px-4 py-3.5 w-1/4">
        <div className="h-4 rounded-md bg-white/5 w-2/3" />
      </td>
      <td className="px-4 py-3.5 w-1/2">
        <div className="h-4 rounded-md bg-white/5 w-5/6" />
      </td>
      <td className="px-4 py-3.5 w-1/4">
        <div className="h-4 rounded-md bg-white/5 w-1/2" />
      </td>
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  hasActiveFilters: boolean;
  onAddStrategy: () => void;
}

function EmptyState({ hasActiveFilters, onAddStrategy }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-[#6b7094]">
          <div className="size-12 rounded-full bg-white/5 flex items-center justify-center">
            <Lightbulb className="size-6 text-yellow-500/40" />
          </div>
          <p className="font-semibold text-[#c8ccd8]">No strategies found</p>
          <p className="text-xs max-w-xs">
            {hasActiveFilters
              ? "Try adjusting your search query."
              : "Add your first strategy to get started."}
          </p>
          {!hasActiveFilters && (
            <Button
              size="sm"
              onClick={onAddStrategy}
              className="mt-1 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="size-3.5" />
              Add Strategy
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Strategy Row ─────────────────────────────────────────────────────────────
interface StrategyRowProps {
  strategy: strategy;
  index: number;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

function StrategyRow({ strategy, index, onEditClick, onDeleteClick }: StrategyRowProps) {
  const strategyId = strategy.id || strategy._id || "";

  return (
    <tr
      className={cn(
        "border-b border-white/5 transition-colors duration-100 hover:bg-white/5 group",
        index % 2 === 0 ? "bg-transparent" : "bg-white/1.5",
      )}
    >
      {/* Title */}
      <td className="px-4 py-3.5 font-semibold text-[#c8ccd8] group-hover:text-white transition-colors align-top w-1/4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-yellow-500/10 flex items-center justify-center text-[10px] text-yellow-400 font-bold shrink-0">
            ST
          </div>
          <span className="truncate max-w-50" title={strategy.title}>
            {strategy.title}
          </span>
        </div>
      </td>

      {/* Description */}
      <td className="px-4 py-3.5 text-xs text-[#6b7094] group-hover:text-[#c8ccd8] transition-colors align-top w-1/2 whitespace-pre-wrap">
        {strategy.description || "—"}
      </td>

      {/* Created Date + action buttons */}
      <td className="px-4 py-3.5 text-left text-[#6b7094] text-xs whitespace-nowrap align-top w-1/4">
        <div className="flex items-center justify-between gap-2">
          <span>{strategy.created_at ? formatDate(strategy.created_at) : "—"}</span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); if (strategyId) onEditClick(strategyId); }}
              title="Edit Strategy"
              className="p-1 rounded text-[#6b7094] hover:text-emerald-400 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (strategyId) onDeleteClick(strategyId); }}
              title="Delete Strategy"
              className="p-1 rounded text-[#6b7094] hover:text-red-400 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Table Header ─────────────────────────────────────────────────────────────
function TableHeader() {
  const thBase = "px-4 py-3 text-xs font-semibold text-[#6b7094] uppercase tracking-wider whitespace-nowrap bg-[#13141f] border-b border-white/8";
  return (
    <thead>
      <tr>
        <th className={cn(thBase, "text-left w-1/4")}>Strategy Name</th>
        <th className={cn(thBase, "text-left w-1/2")}>Description</th>
        <th className={cn(thBase, "text-left w-1/4")}>Created At</th>
      </tr>
    </thead>
  );
}

// ─── Strategy Table (Main Export) ─────────────────────────────────────────────
interface StrategyTableProps {
  strategies: strategy[];
  loading: boolean;
  hasActiveFilters: boolean;
  onAddStrategy: () => void;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export function StrategyTable({
  strategies,
  loading,
  hasActiveFilters,
  onAddStrategy,
  onEditClick,
  onDeleteClick,
}: StrategyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <TableHeader />
        <tbody>
          {loading ? (
            [...Array(PAGE_LIMIT)].map((_, i) => <SkeletonRow key={i} />)
          ) : strategies.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onAddStrategy={onAddStrategy} />
          ) : (
            strategies.map((strategy, i) => (
              <StrategyRow
                key={strategy.id || i}
                strategy={strategy}
                index={i}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

