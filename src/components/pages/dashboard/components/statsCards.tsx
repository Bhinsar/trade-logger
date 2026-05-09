"use client";
import React, { useEffect, useState } from 'react';
import { Wallet, Trophy, Scale, BarChart2 } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/src/actions/trade';

const StatsCards = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 p-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1e2330] rounded-xl p-5 border border-white/5 animate-pulse h-[140px]">
            <div className="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-white/5 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/5 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 p-3">
      {/* Highest P&L */}
      <div className="bg-[#1e2330] rounded-xl p-5 border border-white/5 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 group">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Highest P&L</span>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-emerald-500/20">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-emerald-400 mb-1 tracking-tight">
            ₹{stats.highestPnl.toLocaleString('en-IN')}
          </h2>
          <div className="text-[11px] text-gray-500 font-medium">
            <span className={stats.highestPnlChange && stats.highestPnlChange > 0 ? "text-emerald-500" : stats.highestPnlChange && stats.highestPnlChange < 0 ? "text-red-500" : ""}>
              {stats.highestPnlChange ? `${stats.highestPnlChange > 0 ? '+' : ''}${stats.highestPnlChange.toFixed(1)}%` : 'null%'}
            </span>
            {' vs last 30 days'}
          </div>
        </div>
        <div className="mt-5 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500/80 rounded-full w-[70%]" />
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[#1e2330] rounded-xl p-5 border border-white/5 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 group">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Win Rate</span>
            <div className="bg-blue-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-blue-500/20">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-blue-400 mb-1 tracking-tight">
            {stats.winRate.toFixed(1)}%
          </h2>
          <div className="text-[11px] text-gray-500 font-medium">
            <span className={stats.winRateChange && stats.winRateChange > 0 ? "text-emerald-500" : stats.winRateChange && stats.winRateChange < 0 ? "text-red-500" : ""}>
              {stats.winRateChange ? `${stats.winRateChange > 0 ? '+' : ''}${stats.winRateChange.toFixed(1)}%` : '0%'}
            </span>
            {' vs last 30 days'}
          </div>
        </div>
        <div className="mt-5 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500/80 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.winRate}%` }} />
        </div>
      </div>

      {/* Avg. Risk/Reward */}
      <div className="bg-[#1e2330] rounded-xl p-5 border border-white/5 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 group">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Avg. Risk/Reward</span>
            <div className="bg-purple-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-purple-500/20">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-purple-400 mb-1 tracking-tight">
            {stats.avgRiskReward}
          </h2>
          <div className="text-[11px] text-gray-500 font-medium">
            <span className={stats.avgRiskRewardChange && stats.avgRiskRewardChange > 0 ? "text-emerald-500" : stats.avgRiskRewardChange && stats.avgRiskRewardChange < 0 ? "text-red-500" : ""}>
              {stats.avgRiskRewardChange ? `${stats.avgRiskRewardChange > 0 ? '+' : ''}${stats.avgRiskRewardChange.toFixed(2)}%` : '0%'}
            </span>
            {' vs last 30 days'}
          </div>
        </div>
        <div className="mt-5 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-400/80 rounded-full w-[40%]" />
        </div>
      </div>

      {/* Trades This Month */}
      <div className="bg-[#1e2330] rounded-xl p-5 border border-white/5 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 group">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Trades This Month</span>
            <div className="bg-orange-500/10 p-2.5 rounded-xl transition-colors duration-300 group-hover:bg-orange-500/20">
              <BarChart2 className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-orange-400 mb-1 tracking-tight">
            {stats.tradesThisMonth}
          </h2>
          <div className="text-[11px] text-gray-500 font-medium">
            <span className={stats.tradesThisMonthChange && stats.tradesThisMonthChange > 0 ? "text-emerald-500" : stats.tradesThisMonthChange && stats.tradesThisMonthChange < 0 ? "text-red-500" : ""}>
              {stats.tradesThisMonthChange ? `${stats.tradesThisMonthChange > 0 ? '+' : ''}${stats.tradesThisMonthChange}` : '0'}
            </span>
            {' vs last 30 days'}
          </div>
        </div>
        <div className="mt-5 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500/80 rounded-full w-[15%]" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
