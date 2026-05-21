"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getCalendarTrades } from '@/src/actions/trades/trade';
import { GraphTradeResponse } from '@/src/actions/trades/trade.interface';
import { cn } from '@/src/lib/utils';
import CalendarHeader from './calendarHeader';
import CalendarDayCell from './calendarDayCell';
import MonthSummarySidebar from './monthSummarySidebar';

interface TradingCalendarProps {
  mini?: boolean;
}

interface DayCell {
  dayNumber: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateKey: string;
}

export default function TradingCalendar({ mini = false }: TradingCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [trades, setTrades] = useState<GraphTradeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trades for the selected month
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const data = await getCalendarTrades(currentYear, currentMonth);
        setTrades(data);
      } catch (error) {
        console.error('Failed to fetch calendar trades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  }, [currentYear, currentMonth]);

  // Generate calendar days grid (42 days)
  const calendarCells = useMemo(() => {
    const cells: DayCell[] = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 1. Previous month days (padding)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        dayNumber: prevDay,
        month: prevMonthIdx,
        year: prevYearVal,
        isCurrentMonth: false,
        dateKey: `${prevYearVal}-${prevMonthIdx}-${prevDay}`
      });
    }

    // 2. Current month days
    for (let i = 1; i <= daysInCurrMonth; i++) {
      cells.push({
        dayNumber: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateKey: `${currentYear}-${currentMonth}-${i}`
      });
    }

    // 3. Next month days (padding to complete 42 cells)
    const nextMonthDaysNeeded = 42 - cells.length;
    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({
        dayNumber: i,
        month: nextMonthIdx,
        year: nextYearVal,
        isCurrentMonth: false,
        dateKey: `${nextYearVal}-${nextMonthIdx}-${i}`
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Group trades by exit date
  const tradesByDate = useMemo(() => {
    const map = new Map<string, GraphTradeResponse[]>();
    for (const t of trades) {
      if (!t.exit_time) continue;
      const date = new Date(t.exit_time);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      const existing = map.get(key) || [];
      existing.push(t);
      map.set(key, existing);
    }
    return map;
  }, [trades]);

  // Calculate statistics for the current month
  const stats = useMemo(() => {
    let totalPnl = 0, winCount = 0, lossCount = 0, grossProfit = 0, grossLoss = 0;
    let greenDays = 0, redDays = 0, flatDays = 0;
    let bestDayPnl = -Infinity, worstDayPnl = Infinity;
    let bestDayDate: string | null = null, worstDayDate: string | null = null;

    // Daily analysis
    for (let day = 1; day <= 31; day++) {
      const key = `${currentYear}-${currentMonth}-${day}`;
      const dayTrades = tradesByDate.get(key);
      if (dayTrades && dayTrades.length > 0) {
        const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl_nominal, 0);
        if (dayPnl > 0) greenDays++;
        else if (dayPnl < 0) redDays++;
        else flatDays++;

        const dateStr = new Date(currentYear, currentMonth, day).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });

        if (dayPnl > bestDayPnl) {
          bestDayPnl = dayPnl;
          bestDayDate = dateStr;
        }
        if (dayPnl < worstDayPnl) {
          worstDayPnl = dayPnl;
          worstDayDate = dateStr;
        }
      }
    }

    // Trade-by-trade analysis
    for (const t of trades) {
      totalPnl += t.pnl_nominal;
      if (t.pnl_nominal > 0) {
        winCount++;
        grossProfit += t.pnl_nominal;
      } else if (t.pnl_nominal < 0) {
        lossCount++;
        grossLoss += Math.abs(t.pnl_nominal);
      }
    }

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.9 : 0);

    return {
      totalPnl,
      totalTrades,
      winRate,
      profitFactor,
      greenDays,
      redDays,
      flatDays,
      bestDay: bestDayDate ? { date: bestDayDate, pnl: bestDayPnl } : null,
      worstDay: worstDayDate ? { date: worstDayDate, pnl: worstDayPnl } : null
    };
  }, [trades, tradesByDate, currentYear, currentMonth]);

  // Format currency
  const formatPnl = (val: number, isCompact = false) => {
    const prefix = val > 0 ? '+' : val < 0 ? '-' : '';
    const absVal = Math.abs(val);
    const currencySign = '₹';
    
    if (isCompact && absVal >= 1000) {
      return `${prefix}${currencySign}${(absVal / 1000).toFixed(1)}K`;
    }
    return `${prefix}${currencySign}${absVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className={cn("w-full select-none", mini ? "mt-4" : "p-4")}>
      <div className={cn("grid grid-cols-1 gap-6", mini ? "" : "lg:grid-cols-4")}>
        
        {/* ── Calendar Grid Card ─────────────────────────────────────── */}
        <div className={cn(
          "bg-[#1e2330] rounded-xl border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between",
          mini ? "w-full" : "lg:col-span-3"
        )}>
          
          <CalendarHeader
            monthName={monthName}
            currentYear={currentYear}
            loading={loading}
            onToday={handleToday}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col">
            {/* Weekdays Headers */}
            <div className="grid grid-cols-7 mb-2 border-b border-white/5 pb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarCells.map((cell, index) => (
                <CalendarDayCell
                  key={index}
                  cell={cell}
                  dayTrades={tradesByDate.get(cell.dateKey)}
                  index={index}
                  formatPnl={formatPnl}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Month Summary Sidebar ──────────────────────────────────── */}
        {!mini && (
          <MonthSummarySidebar
            stats={stats}
            monthName={monthName}
            formatPnl={formatPnl}
          />
        )}

      </div>
    </div>
  );
}
