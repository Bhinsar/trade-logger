"use client";
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import {  GraphTradeResponse, getTradeResponse } from '@/src/actions/trades/trade.interface';
import { getGraphTrades, getTrades } from '@/src/actions/trades/trade';
import { useDashboardRefresh } from '../dashboardRefreshContext';

const PerformanceAndTopTrades = () => {
  const [graphTrades, setGraphTrades] = useState<GraphTradeResponse[]>([]);
  const [topTrades, setTopTrades] = useState<getTradeResponse[]>([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [filter, setFilter] = useState<'M' | 'W' | 'D'>('M');
  const { refreshKey } = useDashboardRefresh();

  useEffect(() => {
    const fetchTopTrades = async () => {
      try {
        const topTradesData = await getTrades({
          page: 1,
          limit: 5,
          sort: 'pnl_nominal:desc',
          profit: true
        });
        setTopTrades(topTradesData);
      } catch (error) {
        console.error("Failed to load top trades", error);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTopTrades();
  }, [refreshKey]);

  useEffect(() => {
    const fetchGraphTrades = async () => {
      try {
        setLoadingGraph(true);
        const graphData = await getGraphTrades(filter);
        setGraphTrades(graphData);
      } catch (error) {
        console.error("Failed to load graph trades", error);
      } finally {
        setLoadingGraph(false);
      }
    };
    fetchGraphTrades();
  }, [filter, refreshKey]);

  // Prepare chart data (Cumulative P&L)
  // Step 1: Aggregate P&L per date so multiple trades on the same day become one point
  const dailyPnlMap = new Map<string, { label: string; pnl: number }>();
  for (const t of graphTrades) {
    const d = new Date(t.exit_time);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const label = `${d.getDate()} ${d.toLocaleDateString('en-IN', { month: 'short' })}`;
    const existing = dailyPnlMap.get(dateKey);
    if (existing) {
      existing.pnl += t.pnl_nominal;
    } else {
      dailyPnlMap.set(dateKey, { label, pnl: t.pnl_nominal });
    }
  }

  // Step 2: Build cumulative series from the aggregated daily totals (Map preserves insertion order)
  let cumulativePnl = 0;
  let chartData = [...dailyPnlMap.values()].map(({ label, pnl: dayPnl }) => {
    cumulativePnl += dayPnl;
    return {
      date: label,
      pnl: Number(cumulativePnl.toFixed(2)),
    };
  });

  /** 
   * FIX: Baseline injection
   * If there's only one point, the area chart looks like a vertical line (image_936c8c.png).
   * We add a 0 baseline to create the "slope" seen in image_937abb.png.
   */
  if (chartData.length === 1) {
    chartData = [{ date: '', pnl: 0 }, ...chartData];
  }

  const finalPnl = chartData.length > 0 ? chartData[chartData.length - 1].pnl : 0;
  const chartColor = finalPnl < 0 ? '#ef4444' : '#10b981';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 mx-3 mb-8">
      <div className="lg:col-span-2 bg-[#1e2330] rounded-xl p-6 h-full border border-white/5 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#1c273c] p-2 rounded-lg border border-white/5">
              <LineChartIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Cumulative P&L</h2>
          </div>
          <div className="flex space-x-1 bg-[#141824] p-1 rounded-xl border border-white/5">
            {['D', 'W', 'M'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filter === f ? 'bg-[#3B82F6] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[250px] w-full grow">
          {loadingGraph ? (
            <div className="w-full h-full bg-white/5 animate-pulse rounded-lg"></div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {/* Updated Gradient for richer glow */}
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.6}/>
                    <stop offset="60%" stopColor={chartColor} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#718096" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  // padding moves the line to the edges
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  stroke="#718096" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value}`}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', borderRadius: '8px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                  formatter={(value: any) => [`₹${value}`, 'Cumulative P&L']}
                />
                <Area 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke={chartColor} 
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                  strokeWidth={3} // Thicker line like the reference
                  // Final point dot styling
                  dot={(props: any) => {
                    const { cx, cy, index } = props;
                    if (index === chartData.length - 1) {
                      return <circle key={index} cx={cx} cy={cy} r={5} fill="#fff" stroke={chartColor} strokeWidth={3} />;
                    }
                    return <></>;
                  }}
                  activeDot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: chartColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No trades found for this period.
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Trades Card */}
      <div className="bg-[#1e2330] rounded-xl p-6 border border-white/5 flex flex-col h-full min-h-[350px]">
        <h2 className="text-xl font-bold text-white tracking-wide mb-6">Top Trades</h2>
        <div className="space-y-4 flex-grow">
          {loadingTop ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 animate-pulse h-[60px]"></div>
            ))
          ) : topTrades.length > 0 ? (
            topTrades.map((trade, i) => (
            <div key={trade.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  #{i + 1}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{trade.symbol}</p>
                  <p className="text-gray-400 text-xs">{new Date(trade.entry_time).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-sm">
                  +₹{trade.pnl_nominal.toLocaleString('en-IN')}
                </p>
                <p className="text-gray-500 text-xs uppercase">{trade.side}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            Log some trades to see your best performers!
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAndTopTrades;