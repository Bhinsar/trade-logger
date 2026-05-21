"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Trophy, Scale, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DayBreakdown {
  date: string;
  pnl: number;
}

interface MonthStats {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  greenDays: number;
  redDays: number;
  flatDays: number;
  bestDay: DayBreakdown | null;
  worstDay: DayBreakdown | null;
}

interface MonthSummarySidebarProps {
  stats: MonthStats;
  monthName: string;
  formatPnl: (val: number) => string;
}

export default function MonthSummarySidebar({
  stats,
  monthName,
  formatPnl,
}: MonthSummarySidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      
      {/* Net P&L Summary Card */}
      <div className="bg-[#1e2330] rounded-xl border border-white/5 p-5 flex flex-col justify-between shadow-lg">
        <div>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Month realized P&L</span>
          <h3 className={cn(
            "text-3xl font-extrabold tracking-tight mt-1 mb-2",
            stats.totalPnl > 0 ? "text-emerald-400" : stats.totalPnl < 0 ? "text-red-400" : "text-gray-300"
          )}>
            {formatPnl(stats.totalPnl)}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            Across <span className="text-white font-semibold">{stats.totalTrades}</span> trades closed in {monthName}.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gray-500" /> Activity
          </span>
          <span className="text-xs text-white font-bold">
            {stats.greenDays + stats.redDays + stats.flatDays} Active Days
          </span>
        </div>
      </div>

      {/* Performance Stats Card */}
      <div className="bg-[#1e2330] rounded-xl border border-white/5 p-5 flex flex-col gap-4 shadow-lg">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
          Performance Stats
        </h4>

        {/* Win Rate */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-500" /> Win Rate
          </span>
          <span className="text-sm text-blue-400 font-extrabold">
            {stats.winRate.toFixed(1)}%
          </span>
        </div>

        {/* Profit Factor */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" /> Profit Factor
          </span>
          <span className="text-sm text-purple-400 font-extrabold">
            {stats.profitFactor === 99.9 ? 'N/A' : stats.profitFactor.toFixed(2)}
          </span>
        </div>

        {/* Trading Days Breakdown */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Trading Days Breakdown</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
            <div className="bg-emerald-500/10 border border-emerald-500/10 rounded-lg p-2 flex flex-col">
              <span className="text-emerald-400 font-extrabold text-sm">{stats.greenDays}</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Green</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/10 rounded-lg p-2 flex flex-col">
              <span className="text-red-400 font-extrabold text-sm">{stats.redDays}</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Red</span>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/10 rounded-lg p-2 flex flex-col">
              <span className="text-gray-300 font-extrabold text-sm">{stats.flatDays}</span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Flat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best / Worst Days Card */}
      {(stats.bestDay || stats.worstDay) && (
        <div className="bg-[#1e2330] rounded-xl border border-white/5 p-5 flex flex-col gap-4 shadow-lg">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Extreme Days
          </h4>
          
          {stats.bestDay && (
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Best Trading Day
                </span>
                <span className="text-[10px] text-gray-500 font-medium ml-5">{stats.bestDay.date}</span>
              </div>
              <span className="text-sm text-emerald-400 font-bold">
                {formatPnl(stats.bestDay.pnl)}
              </span>
            </div>
          )}

          {stats.worstDay && (
            <div className="flex justify-between items-center pt-1">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Worst Trading Day
                </span>
                <span className="text-[10px] text-gray-500 font-medium ml-5">{stats.worstDay.date}</span>
              </div>
              <span className="text-sm text-red-400 font-bold">
                {formatPnl(stats.worstDay.pnl)}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
