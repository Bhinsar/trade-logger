"use client";

import React from "react";
import { RefreshCw, ListTodo, Settings, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface ChecklistHeaderProps {
  totalCount: number;
  totalActive: number;
  completedActiveCount: number;
  completionPercentage: number;
  onResetSession?: () => void;
}

export default function ChecklistHeader({
  totalCount,
  totalActive,
  completedActiveCount,
  completionPercentage,
  onResetSession,
}: ChecklistHeaderProps) {
  const pathname = usePathname();
  const isSession = pathname === "/trades-checklist";
  const isHistory = pathname === "/trades-checklist/history";
  const isRules = pathname === "/rules";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 bg-background-secondary border border-white/5 rounded-xl p-4">
      {/* Navigation tabs */}
      <div className="flex gap-2 shrink-0">
        <Link
          href="/trades-checklist"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            isSession
              ? "bg-primary text-primary-foreground shadow-lg shadow-emerald-500/10"
              : "bg-background-primary text-[#6b7094] border border-white/5 hover:text-white"
          }`}
        >
          <ListTodo className="size-4" />
          Daily Flow
        </Link>
        <Link
          href="/trades-checklist/history"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            isHistory
              ? "bg-primary text-primary-foreground shadow-lg shadow-emerald-500/10"
              : "bg-background-primary text-[#6b7094] border border-white/5 hover:text-white"
          }`}
        >
          <Calendar className="size-4" />
          History Log
        </Link>
        <Link
          href="/rules"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            isRules
              ? "bg-primary text-primary-foreground shadow-lg shadow-emerald-500/10"
              : "bg-background-primary text-[#6b7094] border border-white/5 hover:text-white"
          }`}
        >
          <Settings className="size-4" />
          Rules ({totalCount})
        </Link>
      </div>

      {/* Progress Block (Compact layout) */}
      <div className="flex items-center gap-4 bg-background-primary/30 border border-white/5 rounded-lg p-2.5 px-4">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#6b7094] uppercase tracking-wider font-semibold">
            Today's Progress
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white">
              {completedActiveCount}
            </span>
            <span className="text-sm text-[#6b7094]">/{totalActive}</span>
            <span className="text-xs text-emerald-400 ml-2 font-medium">({completionPercentage}%)</span>
          </div>
          {completionPercentage > 0 && onResetSession && (
            <button
              onClick={onResetSession}
              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="size-2.5" />
              Reset Checks
            </button>
          )}
        </div>

        {/* Small Progress Radial */}
        <div className="relative size-12 flex items-center justify-center shrink-0">
          <svg className="size-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#191a29"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke={completionPercentage === 100 ? "#10b981" : "var(--primary)"}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 * (1 - completionPercentage / 100)}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-white">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
