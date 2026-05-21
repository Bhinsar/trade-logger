"use client";

import React from 'react';
import { GraphTradeResponse } from '@/src/actions/trades/trade.interface';
import { cn } from '@/src/lib/utils';

interface DayCellData {
  dayNumber: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateKey: string;
}

interface CalendarDayCellProps {
  cell: DayCellData;
  dayTrades: GraphTradeResponse[] | undefined;
  index: number;
  formatPnl: (val: number, isCompact?: boolean) => string;
}

export default function CalendarDayCell({
  cell,
  dayTrades,
  index,
  formatPnl,
}: CalendarDayCellProps) {
  const hasTrades = cell.isCurrentMonth && dayTrades && dayTrades.length > 0;
  
  let dayPnl = 0;
  let isProfitable = false;
  let isLoss = false;

  if (hasTrades && dayTrades) {
    dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl_nominal, 0);
    isProfitable = dayPnl > 0;
    isLoss = dayPnl < 0;
  }

  // Determine tooltip placement based on cell position in the grid
  const isFirstRows = index < 14;
  const isLeftEdge = index % 7 === 0;
  const isRightEdge = index % 7 === 6;

  return (
    <div
      className={cn(
        "relative group/cell min-h-[68px] sm:min-h-[85px] p-2 flex flex-col justify-between border rounded-lg transition-all duration-200 select-none",
        !cell.isCurrentMonth
          ? "bg-[#141824]/20 border-white/[0.01] text-gray-700 pointer-events-none"
          : !hasTrades
          ? "bg-[#141824]/40 border-white/5 text-gray-400 hover:bg-[#1c2132] cursor-pointer"
          : isProfitable
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 cursor-pointer shadow-sm shadow-emerald-500/5"
          : isLoss
          ? "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/15 cursor-pointer shadow-sm shadow-red-500/5"
          : "bg-gray-500/10 border-gray-500/25 text-gray-300 hover:bg-gray-500/15 cursor-pointer"
      )}
    >
      {/* Day number */}
      <div className="flex justify-between items-start">
        <span className={cn(
          "text-xs font-bold sm:text-sm", 
          !cell.isCurrentMonth ? "text-gray-700" : hasTrades ? "text-white" : "text-gray-400"
        )}>
          {cell.dayNumber}
        </span>
        {hasTrades && dayTrades && (
          <span className="text-[9px] px-1 bg-white/5 rounded-sm text-gray-400 font-semibold uppercase">
            {dayTrades.length}t
          </span>
        )}
      </div>

      {/* Day P&L */}
      {hasTrades && (
        <div className={cn(
          "text-[10px] sm:text-[11px] font-bold text-left truncate mt-1 tracking-tight",
          isProfitable ? "text-emerald-400" : isLoss ? "text-red-400" : "text-gray-300"
        )}>
          {formatPnl(dayPnl, true)}
        </div>
      )}

      {/* Rich Hover Tooltip */}
      {hasTrades && dayTrades && (
        <div className={cn(
          "absolute z-50 w-72 bg-[#141824] border border-white/10 rounded-xl p-4 shadow-2xl pointer-events-auto hidden group-hover/cell:flex flex-col text-left text-xs font-normal",
          isFirstRows 
            ? "top-full mt-2 before:absolute before:content-[''] before:inset-x-0 before:-top-2 before:h-2" 
            : "bottom-full mb-2 before:absolute before:content-[''] before:inset-x-0 before:-bottom-2 before:h-2",
          isLeftEdge ? "left-0 translate-x-0" : isRightEdge ? "right-0 left-auto translate-x-0" : "left-1/2 -translate-x-1/2"
        )}>
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2.5">
            <span className="font-bold text-gray-300">
              {new Date(cell.year, cell.month, cell.dayNumber).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className={cn(
              "font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded-sm",
              isProfitable ? "bg-emerald-500/10 text-emerald-400" : isLoss ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-300"
            )}>
              {dayTrades.length} {dayTrades.length === 1 ? 'Trade' : 'Trades'}
            </span>
          </div>

          {/* Summary Stats */}
          <div className="flex justify-between items-center mb-2.5 bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Net P&L</span>
            <span className={cn(
              "font-bold text-sm",
              isProfitable ? "text-emerald-400" : isLoss ? "text-red-400" : "text-gray-300"
            )}>
              {formatPnl(dayPnl)}
            </span>
          </div>

          {/* Trades Details List */}
          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
            {dayTrades.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div>
                  <p className="text-white font-bold text-xs">{t.symbol}</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t.side}</p>
                </div>
                <div className={cn(
                  "text-xs font-bold",
                  t.pnl_nominal > 0 ? "text-emerald-400" : t.pnl_nominal < 0 ? "text-red-400" : "text-gray-300"
                )}>
                  {formatPnl(t.pnl_nominal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
