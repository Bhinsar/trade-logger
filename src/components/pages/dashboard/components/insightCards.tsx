"use client";
import React, { useEffect, useState } from "react";
import {
  Flame,
  Target,
  ShieldAlert,
  TrendingUp,
  Clock,
  BarChart3,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { getInsightStats, InsightStats } from "@/src/actions/trade";
import { useDashboardRefresh } from "../dashboardRefreshContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMinutes = (mins: number) => {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const INR = (v: number) =>
  `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-3 mb-8">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-[#1e2330] rounded-xl p-6 border border-white/5 animate-pulse h-[220px]"
      />
    ))}
  </div>
);

// ─── Card 1: Streak & Consistency ────────────────────────────────────────────
const StreakCard = ({ stats }: { stats: InsightStats }) => {
  const isWinStreak = stats.currentStreak > 0;
  const isLossStreak = stats.currentStreak < 0;
  const streakAbs = Math.abs(stats.currentStreak);

  const streakColor = isWinStreak
    ? "text-emerald-400"
    : isLossStreak
    ? "text-red-400"
    : "text-gray-400";

  const streakBg = isWinStreak
    ? "bg-emerald-500/10"
    : isLossStreak
    ? "bg-red-500/10"
    : "bg-gray-500/10";

  const streakBorder = isWinStreak
    ? "hover:shadow-emerald-500/10"
    : isLossStreak
    ? "hover:shadow-red-500/10"
    : "hover:shadow-gray-500/10";

  const streakLabel = isWinStreak
    ? "Win Streak 🔥"
    : isLossStreak
    ? "Loss Streak 📉"
    : "No Active Streak";

  return (
    <div
      className={`bg-[#1e2330] rounded-xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${streakBorder} group`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            Streak & Consistency
          </p>
          <p className={`text-[13px] font-semibold ${streakColor}`}>
            {streakLabel}
          </p>
        </div>
        <div
          className={`${streakBg} p-2.5 rounded-xl transition-colors duration-300`}
        >
          <Flame
            className={`w-5 h-5 ${streakColor}`}
          />
        </div>
      </div>

      {/* Current streak big number */}
      <div className="flex items-end gap-2 mb-5">
        <span className={`text-5xl font-extrabold tracking-tight ${streakColor}`}>
          {streakAbs}
        </span>
        <span className="text-gray-500 text-sm mb-1 font-medium">
          consecutive {isLossStreak ? "losses" : "wins"}
        </span>
      </div>

      {/* Sub-stats */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Best Win Run
          </p>
          <p className="text-emerald-400 font-bold text-lg">
            {stats.longestWinStreak}
            <span className="text-gray-500 text-xs font-normal ml-1">trades</span>
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Worst Loss Run
          </p>
          <p className="text-red-400 font-bold text-lg">
            {stats.longestLossStreak}
            <span className="text-gray-500 text-xs font-normal ml-1">trades</span>
          </p>
        </div>
      </div>

      {/* Avg hold time pill */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
        <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>
          Avg. hold time:{" "}
          <span className="text-blue-300 font-semibold">
            {formatMinutes(stats.avgHoldMinutes)}
          </span>
        </span>
      </div>
    </div>
  );
};

// ─── Card 2: Most Traded Symbols ──────────────────────────────────────────────
const SymbolCard = ({ stats }: { stats: InsightStats }) => {
  const maxTrades = stats.topSymbols[0]?.trades ?? 1;

  return (
    <div className="bg-[#1e2330] rounded-xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            Symbol Breakdown
          </p>
          <p className="text-blue-300 text-[13px] font-semibold">
            Most Traded Symbols
          </p>
        </div>
        <div className="bg-blue-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-blue-500/20">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Symbol list */}
      {stats.topSymbols.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          No trades logged yet.
        </p>
      ) : (
        <div className="space-y-3">
          {stats.topSymbols.map((sym) => {
            const barWidth = Math.round((sym.trades / maxTrades) * 100);
            const winColor =
              sym.winRate >= 60
                ? "text-emerald-400"
                : sym.winRate >= 40
                ? "text-yellow-400"
                : "text-red-400";
            const barColor =
              sym.winRate >= 60
                ? "bg-emerald-500"
                : sym.winRate >= 40
                ? "bg-yellow-400"
                : "bg-red-500";

            return (
              <div key={sym.symbol}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {sym.symbol}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {sym.trades} trade{sym.trades > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${winColor}`}>
                    {sym.winRate}% WR
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip */}
      {stats.topSymbols.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">
          <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Focus on your high-win-rate symbols to maximise returns.</span>
        </div>
      )}
    </div>
  );
};

// ─── Card 3: Loss Recovery Insights ──────────────────────────────────────────
const LossRecoveryCard = ({ stats }: { stats: InsightStats }) => {
  const pfColor =
    stats.profitFactor >= 2
      ? "text-emerald-400"
      : stats.profitFactor >= 1
      ? "text-yellow-400"
      : "text-red-400";

  const pfLabel =
    stats.profitFactor >= 2
      ? "Excellent"
      : stats.profitFactor >= 1.5
      ? "Good"
      : stats.profitFactor >= 1
      ? "Break-even zone"
      : "Needs improvement";

  const pfBg =
    stats.profitFactor >= 2
      ? "bg-emerald-500/10"
      : stats.profitFactor >= 1
      ? "bg-yellow-500/10"
      : "bg-red-500/10";

  // How many average losses does biggest loss represent?
  const recoveryTrades =
    stats.avgLoss > 0
      ? Math.ceil(stats.biggestLoss / (stats.avgLoss * (stats.profitFactor > 0 ? stats.profitFactor : 1)))
      : 0;

  return (
    <div className="bg-[#1e2330] rounded-xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            Loss Recovery Insights
          </p>
          <p className="text-orange-300 text-[13px] font-semibold">
            Risk & Drawdown Analysis
          </p>
        </div>
        <div className="bg-orange-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-orange-500/20">
          <ShieldAlert className="w-5 h-5 text-orange-400" />
        </div>
      </div>

      {/* Profit Factor — big focal number */}
      <div className={`${pfBg} rounded-xl p-4 mb-4 text-center`}>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">
          Profit Factor
        </p>
        <p className={`text-4xl font-extrabold tracking-tight ${pfColor}`}>
          {stats.profitFactor >= 999
            ? "∞"
            : stats.profitFactor.toFixed(2)}
        </p>
        <p className={`text-xs font-semibold mt-1 ${pfColor}`}>{pfLabel}</p>
      </div>

      {/* Sub metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Avg. Loss
          </p>
          <p className="text-red-400 font-bold text-base">
            {stats.avgLoss > 0 ? INR(stats.avgLoss) : "—"}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Biggest Loss
          </p>
          <p className="text-red-500 font-bold text-base">
            {stats.biggestLoss > 0 ? INR(stats.biggestLoss) : "—"}
          </p>
        </div>
      </div>

      {/* Recovery tip */}
      {recoveryTrades > 0 && (
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
          <span>
            Your biggest loss needs ~
            <span className="text-yellow-300 font-semibold">
              {recoveryTrades} winning trade{recoveryTrades > 1 ? "s" : ""}
            </span>{" "}
            to recover at your current profit factor.
          </span>
        </div>
      )}

      {/* Motivation when clean */}
      {stats.biggestLoss === 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 rounded-lg px-3 py-2">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>No losses yet — keep up the discipline!</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const InsightCards = () => {
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useDashboardRefresh();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getInsightStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to load insight stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshKey]);

  if (loading) return <Skeleton />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-3 mb-8">
      <StreakCard stats={stats} />
      <SymbolCard stats={stats} />
      <LossRecoveryCard stats={stats} />
    </div>
  );
};

export default InsightCards;
