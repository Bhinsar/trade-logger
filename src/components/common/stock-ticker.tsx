"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/src/lib/utils";
import { fetchNiftyTop10 } from "@/src/actions/stocks/stockActions";

interface TickerItem {
  symbol: string;
  price: number;
  prevPrice: number | null;
  percentChange: number;
}

const REFRESH_INTERVAL_MS = 15_000;

function mapFetched(raw: any[], prev: TickerItem[]): TickerItem[] {
  return raw.map((d: any, i: number) => ({
    symbol: (d.symbol ?? "Unknown").replace("-EQ", ""),
    price: d.ltp ?? 0,
    prevPrice: prev[i]?.price ?? null,
    percentChange: d.percentChange ?? 0,
  }));
}

export function StockTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  // const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [flashClasses, setFlashClasses] = useState<string[]>([]);
  const prevItemsRef = useRef<TickerItem[]>([]);

  const applyFlash = useCallback((next: TickerItem[]) => {
    const classes = next.map((item, i) => {
      const prev = prevItemsRef.current[i];
      if (!prev || prev.price === 0 || item.prevPrice === null) return "";
      if (item.price > prev.price) return "ticker-flash-up";
      if (item.price < prev.price) return "ticker-flash-down";
      return "";
    });
    setFlashClasses(classes);
    setTimeout(() => setFlashClasses([]), 900);
  }, []);

  const loadTicker = useCallback(async () => {
    try {
      const data = await fetchNiftyTop10();
      if (data && data.length > 0) {
        const next = mapFetched(data, prevItemsRef.current);
        applyFlash(next);
        prevItemsRef.current = next;
        setItems(next);
        // setIsLive(true);
        setLoading(false);
      }
    } catch {
      // silently fail — keep whatever data we have
    }
    setLastUpdated(new Date());
  }, [applyFlash]);

  useEffect(() => {
    loadTicker();
    // const interval = setInterval(loadTicker, REFRESH_INTERVAL_MS);
    // return () => clearInterval(interval);
  }, [loadTicker]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full bg-[#0b0e14] border-b border-[#1e2030] h-8 flex items-center px-4 gap-6 overflow-hidden select-none">
        <div className="shrink-0 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2a2d3e] animate-pulse" />
          <span className="text-[10px] tracking-widest text-[#3a3d50] uppercase font-semibold">Loading</span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div className="h-2.5 w-16 rounded bg-[#1e2030] animate-pulse" />
            <div className="h-2.5 w-12 rounded bg-[#1a1c29] animate-pulse" />
            <div className="h-2.5 w-10 rounded bg-[#1a1c29] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // ── No data ────────────────────────────────────────────────────────────────
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full bg-[#0b0e14] border-b border-[#1e2030] text-[12px] font-medium overflow-hidden flex items-center h-8 relative select-none",
        paused && "ticker-paused"
      )}
      title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* LIVE badge
      <div className="shrink-0 flex items-center gap-1.5 px-3 border-r border-[#1e2030] h-full bg-[#0d0f18]">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
          style={{ animation: isLive ? "live-pulse 1.5s ease-in-out infinite" : "none" }}
        />
        <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-semibold">Live</span>
      </div> */}

      {/* Scrolling wrapper — both strips share this parent for unified pause */}
      <div className="flex overflow-hidden flex-1">
        <div className="flex animate-marquee whitespace-nowrap items-center shrink-0">
          {items.map((item, i) => (
            <TickerCell key={`t1-${i}`} item={item} flashClass={flashClasses[i] ?? ""} />
          ))}
        </div>
        <div className="flex animate-marquee whitespace-nowrap items-center shrink-0" aria-hidden="true">
          {items.map((item, i) => (
            <TickerCell key={`t2-${i}`} item={item} flashClass={flashClasses[i] ?? ""} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────

function TickerCell({ item, flashClass }: { item: TickerItem; flashClass: string }) {
  const up = item.percentChange >= 0;
  return (
    <div className={cn("flex items-center gap-1.5 px-5 shrink-0 h-8 rounded", flashClass)}>
      <span className="text-[#8b92b3] font-medium">{item.symbol}</span>
      <span className="text-[#dde1f0] tabular-nums">
        ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={cn("tabular-nums flex items-center gap-0.5", up ? "text-emerald-400" : "text-rose-400")}>
        {up ? "▲" : "▼"}
        {Math.abs(item.percentChange).toFixed(2)}%
      </span>
    </div>
  );
}
