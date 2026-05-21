"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, BarChart2, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Trade } from "@/src/actions/trades/trade.interface";
import { PAGE_LIMIT, SortDir, SortField, formatCurrency, formatDate, holdDuration } from "./types";

// ─── Sort Button ──────────────────────────────────────────────────────────────
interface SortBtnProps {
  field: SortField;
  active: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
}

function SortBtn({ field, active, dir, onClick }: SortBtnProps) {
  const isActive = field === active;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(field); }}
      className={cn(
        "inline-flex items-center gap-1 transition-colors duration-150",
        isActive ? "text-emerald-400" : "text-[#6b7094] hover:text-[#c8ccd8]",
      )}
    >
      {isActive ? (
        dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5" />
      )}
    </button>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 rounded-md bg-white/5" style={{ width: `${60 + (i * 13) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  hasActiveFilters: boolean;
  onAddTrade: () => void;
}

function EmptyState({ hasActiveFilters, onAddTrade }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={9} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-[#6b7094]">
          <div className="size-12 rounded-full bg-white/5 flex items-center justify-center">
            <BarChart2 className="size-6 text-emerald-500/40" />
          </div>
          <p className="font-semibold text-[#c8ccd8]">No trades found</p>
          <p className="text-xs max-w-xs">
            {hasActiveFilters
              ? "Try adjusting your filters or clearing them."
              : "Add your first trade to get started."}
          </p>
          {!hasActiveFilters && (
            <Button
              size="sm"
              onClick={onAddTrade}
              className="mt-1 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="size-3.5" />
              Add Trade
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Trade Row ────────────────────────────────────────────────────────────────
interface TradeRowProps {
  trade: Trade;
  index: number;
  onRowClick: (id: string) => void;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

function TradeRow({ trade, index, onRowClick, onEditClick, onDeleteClick }: TradeRowProps) {
  const isProfit = trade.pnl_nominal >= 0;

  return (
    <tr
      onClick={() => onRowClick(trade.id)}
      className={cn(
        "border-b border-white/5 transition-colors duration-100 hover:bg-white/5 group cursor-pointer",
        index % 2 === 0 ? "bg-transparent" : "bg-white/1.5",
      )}
    >
      {/* Symbol */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "size-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
              isProfit ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
            )}
          >
            {trade.symbol.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-[#c8ccd8] group-hover:text-white transition-colors">
            {trade.symbol}
          </span>
        </div>
      </td>

      {/* Side / Class */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
              trade.side === "Long"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400",
            )}
          >
            {trade.side}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/8 text-[#6b7094]">
            {trade.asset_class}
          </span>
        </div>
      </td>

      {/* Entry Price */}
      <td className="px-4 py-3.5 text-right font-mono text-[#c8ccd8] text-xs">
        ₹{trade.entry_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      {/* Exit Price */}
      <td className="px-4 py-3.5 text-right font-mono text-[#c8ccd8] text-xs">
        ₹{trade.exit_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      {/* Qty */}
      <td className="px-4 py-3.5 text-right font-mono text-[#c8ccd8] text-xs">
        {trade.quantity.toLocaleString("en-IN")}
      </td>

      {/* Hold duration */}
      <td className="px-4 py-3.5 text-right text-[#6b7094] text-xs font-mono">
        {holdDuration(trade.entry_time, trade.exit_time)}
      </td>

      {/* P&L Nominal */}
      <td className="px-4 py-3.5 text-right">
        <span className={cn("font-semibold font-mono text-xs", isProfit ? "text-emerald-400" : "text-red-400")}>
          {formatCurrency(trade.pnl_nominal)}
        </span>
      </td>

      {/* P&L % */}
      <td className="px-4 py-3.5 text-right">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold font-mono",
            isProfit ? "text-emerald-400" : "text-red-400",
          )}
        >
          {isProfit ? <TrendingUp className="size-3 shrink-0" /> : <TrendingDown className="size-3 shrink-0" />}
          {isProfit ? "+" : ""}{trade.pnl_percentage.toFixed(2)}%
        </span>
      </td>

      {/* Entry Date + hover actions */}
      <td className="px-4 py-3.5 text-left text-[#6b7094] text-xs whitespace-nowrap">
        <div className="flex items-center justify-between gap-2">
          <span>{formatDate(trade.entry_time)}</span>
          {/* Row action icons — visible on row hover only */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEditClick(trade.id); }}
              title="Edit"
              className="p-1 rounded text-[#6b7094] hover:text-emerald-400 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(trade.id); }}
              title="Delete"
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
interface TableHeaderProps {
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}

function TableHeader({ sortField, sortDir, onSort }: TableHeaderProps) {
  const thBase = "px-4 py-3 text-xs font-semibold text-[#6b7094] uppercase tracking-wider whitespace-nowrap";
  return (
    <thead>
      <tr className="border-b border-white/8 bg-white/3">
        <th className={`${thBase} text-left`}>
          <div className="flex items-center gap-2">
            Symbol
            <SortBtn field="symbol" active={sortField} dir={sortDir} onClick={onSort} />
          </div>
        </th>
        <th className={`${thBase} text-left`}>Side / Class</th>
        <th className={`${thBase} text-right`}>Entry</th>
        <th className={`${thBase} text-right`}>Exit</th>
        <th className={`${thBase} text-right`}>Qty</th>
        <th className={`${thBase} text-right`}>Hold</th>
        <th className={`${thBase} text-right`}>
          <div className="flex items-center justify-end gap-2">
            P&amp;L
            <SortBtn field="pnl_nominal" active={sortField} dir={sortDir} onClick={onSort} />
          </div>
        </th>
        <th className={`${thBase} text-right`}>
          <div className="flex items-center justify-end gap-2">
            %
            <SortBtn field="pnl_percentage" active={sortField} dir={sortDir} onClick={onSort} />
          </div>
        </th>
        <th className={`${thBase} text-left`}>
          <div className="flex items-center gap-2">
            Entry Date
            <SortBtn field="entry_time" active={sortField} dir={sortDir} onClick={onSort} />
          </div>
        </th>
      </tr>
    </thead>
  );
}

// ─── Trade Table (main export) ────────────────────────────────────────────────
interface TradeTableProps {
  trades: Trade[];
  loading: boolean;
  hasActiveFilters: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  onAddTrade: () => void;
  onRowClick: (id: string) => void;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export function TradeTable({
  trades,
  loading,
  hasActiveFilters,
  sortField,
  sortDir,
  onSort,
  onAddTrade,
  onRowClick,
  onEditClick,
  onDeleteClick,
}: TradeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <TableHeader sortField={sortField} sortDir={sortDir} onSort={onSort} />
        <tbody>
          {loading ? (
            [...Array(PAGE_LIMIT)].map((_, i) => <SkeletonRow key={i} />)
          ) : trades.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onAddTrade={onAddTrade} />
          ) : (
            trades.map((trade, i) => (
              <TradeRow
                key={trade.id}
                trade={trade}
                index={i}
                onRowClick={onRowClick}
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
