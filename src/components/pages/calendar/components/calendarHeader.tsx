"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarHeaderProps {
  monthName: string;
  currentYear: number;
  loading: boolean;
  onToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({
  monthName,
  currentYear,
  loading,
  onToday,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#1c273c] p-2 rounded-lg border border-white/5">
          <CalendarIcon className="w-5 h-5 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">
          {monthName} <span className="text-gray-500 text-sm font-semibold">{currentYear}</span>
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin mr-2" />}
        <button
          onClick={onToday}
          className="px-3 py-1.5 bg-white/5 text-[#c8ccd8] hover:bg-white/10 hover:text-white border border-white/5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        >
          Today
        </button>
        <div className="flex bg-[#141824] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={onPrevMonth}
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
