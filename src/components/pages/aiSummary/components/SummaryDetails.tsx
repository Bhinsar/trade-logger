"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Percent,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
} from "lucide-react";
import { TradingReview } from "@/src/actions/aiSummary/aiSummary";

interface SummaryDetailsProps {
  summary: any | null;
  isGenerating: boolean;
}

export default function SummaryDetails({
  summary,
  isGenerating,
}: SummaryDetailsProps) {
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Scanning trade history...",
    "Calculating win rate and profit factor...",
    "Evaluating entry confidence and satisfaction ratings...",
    "Detecting behavioral mistakes and patterns...",
    "Formulating action items and coaching insights...",
  ];

  useEffect(() => {
    if (!isGenerating) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Tiny inline formatter for basic markdown (**bold**)
  const renderText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (isGenerating) {
    return (
      <div className="bg-background-secondary border border-white/5 rounded-xl p-10 flex flex-col items-center justify-center min-h-112.5 space-y-6 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="size-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
          <Sparkles className="size-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-xs">
          <h4 className="text-white font-bold text-sm">
            AI Performance Analyst
          </h4>
          <p className="text-xs text-[#6b7094] min-h-8 transition-all duration-300 animate-pulse">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-background-secondary border border-white/5 rounded-xl p-10 flex flex-col items-center justify-center min-h-112.5 space-y-4 shadow-xl text-center">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#6b7094]">
          <Activity className="size-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-white font-bold text-base">
            Select Date Range to Start
          </h3>
          <p className="text-xs text-[#6b7094]">
            Choose a time period on the left and click "Generate AI Summary" to
            query the performance coach.
          </p>
        </div>
      </div>
    );
  }

  const parsedText: TradingReview = summary.summary_text;
  const stats = summary.stats;
  const pnl = stats?.total_pnl ?? 0;
  const isProfit = pnl >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-background-secondary border border-white/5 p-4 rounded-xl shadow-md">
        <div>
          <h2 className="text-white font-bold text-base md:text-lg">
            {summary.title}
          </h2>
          <p className="text-[10px] text-[#6b7094]">Generated just now</p>
        </div>
        <div
          className={`text-xs px-4 py-3 rounded-full text-center items-center font-bold uppercase ${isProfit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"}`}
        >
          {isProfit ? "Profit Session" : "Loss Session"}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Trades",
            value: stats?.total_trades || 0,
            icon: <Activity className="size-4 text-blue-400" />,
          },
          {
            label: "Win Rate",
            value: `${stats?.win_rate || 0}%`,
            icon: <Percent className="size-4 text-orange-400" />,
          },
          {
            label: "Net PnL",
            value: formatPnL(pnl),
            icon: <DollarSign className="size-4 text-emerald-400" />,
            colored: true,
          },
          {
            label: "Profit Factor",
            value: stats?.profit_factor || 0,
            icon: <TrendingUp className="size-4 text-purple-400" />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-background-secondary border border-white/5 p-4 rounded-xl space-y-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between text-[#6b7094]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
              {item.icon}
            </div>
            <p
              className={`text-lg font-bold ${
                item.colored ?
                  isProfit ? "text-emerald-400"
                  : "text-red-400"
                : "text-white"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Overview */}
      <div className="bg-background-secondary border border-white/5 p-5 rounded-xl space-y-3 shadow-md">
        <h3 className="text-white font-bold text-sm border-b border-white/5 pb-2">
          Session Overview
        </h3>
        <p className="text-xs text-[#c8ccd8] leading-relaxed whitespace-pre-line">
          {renderText(parsedText.performanceOverview)}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-background-secondary border border-white/5 p-5 rounded-xl space-y-3 shadow-md">
          <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
            <CheckCircle2 className="size-4" />
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {parsedText.strengths?.map((str, i) => (
              <li
                key={i}
                className="text-xs text-[#c8ccd8] flex items-start gap-2"
              >
                <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                <span>{renderText(str)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-background-secondary border border-white/5 p-5 rounded-xl space-y-3 shadow-md">
          <h3 className="text-orange-400 font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
            <AlertTriangle className="size-4" />
            Areas for Review
          </h3>
          <ul className="space-y-2">
            {parsedText.weaknesses?.map((weak, i) => (
              <li
                key={i}
                className="text-xs text-[#c8ccd8] flex items-start gap-2"
              >
                <span className="text-orange-400 mt-0.5 font-bold">•</span>
                <span>{renderText(weak)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mistakes & Psychology Analysis */}
      <div className="bg-background-secondary border border-white/5 p-5 rounded-xl space-y-3 shadow-md">
        <h3 className="text-white font-bold text-sm border-b border-white/5 pb-2">
          Behavioral & Mistake Analysis
        </h3>
        <p className="text-xs text-[#c8ccd8] leading-relaxed whitespace-pre-line">
          {renderText(parsedText.mistakesAnalysis)}
        </p>
      </div>

      {/* Actionable Advice */}
      <div className="bg-background-secondary border border-white/5 p-5 rounded-xl space-y-4 shadow-md">
        <h3 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
          <Zap className="size-4 text-purple-400" />
          Actionable Coaching Advice
        </h3>
        <div className="space-y-3">
          {parsedText.actionableAdvice?.map((advice, i) => (
            <div
              key={i}
              className="flex gap-3 items-start bg-white/2 border border-white/5 p-3 rounded-lg"
            >
              <span className="flex items-center justify-center size-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-xs text-[#c8ccd8] leading-relaxed">
                {renderText(advice)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatPnL(val: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
  return val >= 0 ? `+${formatted}` : formatted;
}
