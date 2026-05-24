"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Calendar } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface SummaryFormProps {
  onGenerate: (startDate: string, endDate: string) => void;
  isGenerating: boolean;
}

export default function SummaryForm({ onGenerate, isGenerating }: SummaryFormProps) {
  const [preset, setPreset] = useState("this-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getPresetDates = (selectedPreset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (selectedPreset) {
      case "today":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case "yesterday":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        break;
      case "this-week": {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(today.getFullYear(), today.getMonth(), diff);
        break;
      }
      case "last-7-days":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        break;
      case "this-month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "last-30-days":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        break;
      default:
        return null;
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    const dates = getPresetDates(preset);
    if (dates) {
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, [preset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onGenerate(startDate, endDate);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background-secondary border border-white/5 rounded-xl p-4 md:p-5 space-y-4 shadow-xl"
    >
      <div className="space-y-1">
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-400 animate-pulse" />
          Generate AI Review
        </h3>
        <p className="text-xs text-[#6b7094]">
          Get instant, psychology-backed summaries of your trades.
        </p>
      </div>

      <div className="space-y-3">
        {/* Preset Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6b7094]">
            Time Period
          </label>
          <Select value={preset} onValueChange={setPreset} disabled={isGenerating}>
            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-[#c8ccd8] w-full">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Dates Inputs */}
        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#6b7094]">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-[#6b7094] pointer-events-none z-10" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isGenerating}
                  className="pl-8 h-8 bg-white/5 border-white/10 text-xs text-[#c8ccd8] [color-scheme:dark] w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#6b7094]">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-[#6b7094] pointer-events-none z-10" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isGenerating}
                  className="pl-8 h-8 bg-white/5 border-white/10 text-xs text-[#c8ccd8] [color-scheme:dark] w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isGenerating || !startDate || !endDate}
        className="w-full h-9 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center gap-1.5 transition-all font-semibold text-xs cursor-pointer shadow-lg disabled:opacity-50"
      >
        <Sparkles className="size-3.5" />
        {isGenerating ? "Analyzing trades..." : "Generate AI Summary"}
      </Button>
    </form>
  );
}
