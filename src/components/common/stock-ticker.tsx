"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { fetchNiftyTop10 } from "@/src/actions/stockActions";

interface TickerItem {
  symbol: string;
  price: number;
  percentChange: number;
}

export function StockTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadTicker = async () => {
      try {
        const data = await fetchNiftyTop10();
        if (mounted) {
          if (data && data.length > 0) {
            // Map real data — fetchNiftyTop10 now returns { symbol, ltp, token }
            const mapped = data.map((d: any) => ({
              symbol: (d.symbol ?? "Unknown").replace("-EQ", ""),
              price: d.ltp ?? 0,
              // Simulate a random percent change between -2% and +2% for demonstration
              percentChange: (Math.random() * 4) - 2,
            }));
            setItems(mapped);
          } else {
            // Fallback mock data specifically matching the requested indices style
            setItems([
              { symbol: "Nifty Bank", price: 48000, percentChange: -0.98 },
              { symbol: "Nifty Realty", price: 800, percentChange: -1.52 },
              { symbol: "Nifty Auto", price: 21000, percentChange: 0.45 },
              { symbol: "Nifty IT", price: 35000, percentChange: 1.20 },
              { symbol: "Nifty 50", price: 22000, percentChange: -0.50 },
              { symbol: "Nifty Pharma", price: 18000, percentChange: 0.80 },
              { symbol: "Nifty Metal", price: 8500, percentChange: -2.10 },
              { symbol: "Nifty FMCG", price: 54000, percentChange: 0.25 },
            ]);
          }
        }
      } catch (error) {
        if (mounted) {
          setItems([
            { symbol: "Nifty Bank", price: 48000, percentChange: -0.98 },
            { symbol: "Nifty Realty", price: 800, percentChange: -1.52 },
            { symbol: "Nifty Auto", price: 21000, percentChange: 0.45 },
            { symbol: "Nifty IT", price: 35000, percentChange: 1.20 },
            { symbol: "Nifty 50", price: 22000, percentChange: -0.50 },
            { symbol: "Nifty Pharma", price: 18000, percentChange: 0.80 },
          ]);
        }
      }
    };
    
    loadTicker();
    
    const interval = setInterval(loadTicker, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Return a thin, absolute or static ticker banner
  return (
    <div className="w-full bg-[#0b0e14] border-b border-background-border text-[13px] font-medium overflow-hidden flex items-center h-8 relative select-none">
      <div className="flex w-full overflow-hidden">
        {/* Ticker Group 1 */}
        <div className="flex  whitespace-nowrap justify-end items-end min-w-full">
          {items.map((item, i) => (
            <div key={`ticker-1-${i}`} className="flex items-center gap-1.5 px-6 shrink-0">
              <span className="text-[#c8ccd8]">{item.symbol}:</span>
              <span className={cn(item.percentChange >= 0 ? "text-emerald-500" : "text-rose-400")}>
                {item.percentChange > 0 ? "+" : ""}{item.percentChange.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        {/* Ticker Group 1
        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
          {items.map((item, i) => (
            <div key={`ticker-1-${i}`} className="flex items-center gap-1.5 px-6 shrink-0">
              <span className="text-[#c8ccd8]">{item.symbol}:</span>
              <span className={cn(item.percentChange >= 0 ? "text-emerald-500" : "text-rose-400")}>
                {item.percentChange > 0 ? "+" : ""}{item.percentChange.toFixed(2)}%
              </span>
            </div>
          ))}
        </div> */}
        
        {/* Ticker Group 2 for seamless infinite scrolling
        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full" aria-hidden="true">
          {items.map((item, i) => (
            <div key={`ticker-2-${i}`} className="flex items-center gap-1.5 px-6 shrink-0">
              <span className="text-[#c8ccd8]">{item.symbol}:</span>
              <span className={cn(item.percentChange >= 0 ? "text-emerald-500" : "text-rose-400")}>
                {item.percentChange > 0 ? "+" : ""}{item.percentChange.toFixed(2)}%
              </span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
