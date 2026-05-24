"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Header from "@/src/components/common/header";
import {
  syncSessionsAndArchive,
  clearChecklistHistoryAction,
  getChecklistItems,
} from "@/src/actions/checklist/checklist";
import ChecklistHeader from "../checklist/components/ChecklistHeader";
import ChecklistHistory, { HistoryRecord } from "./components/ChecklistHistory";
import { Calendar, Award, FilterX, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function TradeChecklistHistoryView() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Header progress stats
  const [totalCount, setTotalCount] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [completedActiveCount, setCompletedActiveCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Filter States
  const [selectedDate, setSelectedDate] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchHistoryAndSync = useCallback(async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toDateString();
      const res = await syncSessionsAndArchive(todayStr);

      const historyList: HistoryRecord[] = (res.history || []).map((h) => ({
        date: new Date(h.date).toDateString(),
        total: h.total,
        completed: h.completed,
        percentage: h.percentage,
        items: h.items,
      }));
      setHistory(historyList);
      setTotalCount(res.history?.length || 0);

      const activeList = await getChecklistItems();
      const active = activeList.filter((it) => it.is_active);

      setTotalActive(active.length);
      const count = active.filter((it) =>
        res.completed_ids.includes(it.id),
      ).length;
      setCompletedActiveCount(count);
      setCompletionPercentage(
        active.length > 0 ? Math.round((count / active.length) * 100) : 0,
      );
    } catch {
      toast.error("Failed to load checklist history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryAndSync();
  }, [fetchHistoryAndSync]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, scoreFilter]);

  const handleClearHistory = async () => {
    const ok = await clearChecklistHistoryAction();
    if (ok) {
      setHistory([]);
      setTotalCount(0);
      toast.success("History logs cleared successfully");
    } else {
      toast.error("Failed to clear checklist history");
    }
  };

  const handleClearFilters = () => {
    setSelectedDate("");
    setScoreFilter("all");
  };

  // Filter Logic
  const filteredHistory = history.filter((record) => {
    let matchesDate = true;
    if (selectedDate !== "") {
      const d = new Date(record.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const recordDateStr = `${year}-${month}-${day}`;
      matchesDate = recordDateStr === selectedDate;
    }

    let matchesScore = true;
    if (scoreFilter === "100") {
      matchesScore = record.percentage === 100;
    } else if (scoreFilter === "70-99") {
      matchesScore = record.percentage >= 70 && record.percentage < 100;
    } else if (scoreFilter === "under-70") {
      matchesScore = record.percentage < 70;
    }

    return matchesDate && matchesScore;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilters = selectedDate !== "" || scoreFilter !== "all";

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-primary">
      <Header title="Checklist Session History" />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <ChecklistHeader
          totalCount={totalCount}
          totalActive={totalActive}
          completedActiveCount={completedActiveCount}
          completionPercentage={completionPercentage}
        />

        {/* Filter Panel */}
        <div className="rounded-xl border border-white/5 bg-background-secondary p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Score filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="h-8 bg-white/5 border-white/10 text-[#c8ccd8] w-full">
                <Award className="size-3.5 text-[#6b7094] shrink-0" />
                <SelectValue placeholder="Completion Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="100">100% Completed</SelectItem>
                <SelectItem value="70-99">Partially Completed (70% - 99%)</SelectItem>
                <SelectItem value="under-70">Under 70% Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Specific Date input */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6b7094] pointer-events-none z-10" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 h-8 bg-white/5 border-white/10 text-[#c8ccd8] [color-scheme:dark] w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#6b7094]">
                Found {filteredHistory.length} matching logs
              </span>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-[#6b7094] hover:text-red-400 hover:border-red-500/30 transition-all duration-150 cursor-pointer"
              >
                <FilterX className="size-3" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <span className="text-sm text-[#6b7094]">Loading history logs...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ChecklistHistory
              history={paginatedHistory}
              onClearHistory={handleClearHistory}
            />

            {/* Pagination Controls */}
            {filteredHistory.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border border-white/5 bg-background-secondary rounded-xl">
                <span className="text-xs text-[#6b7094]">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredHistory.length)}
                  </span>{" "}
                  of <span className="font-semibold text-white">{filteredHistory.length}</span> logs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs text-[#6b7094]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
