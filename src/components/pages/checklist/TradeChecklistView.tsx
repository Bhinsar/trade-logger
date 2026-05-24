"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Header from "@/src/components/common/header";
import { ChecklistItemResponse } from "@/src/actions/checklist/checklist.interface";
import {
  getChecklistItems,
  syncSessionsAndArchive,
  updateTodaySession,
  archiveSessionAction,
  clearChecklistHistoryAction,
} from "@/src/actions/checklist/checklist";

// Sub-components
import ChecklistHeader from "./components/ChecklistHeader";
import ChecklistSessionFlow from "./components/ChecklistSessionFlow";
import { HistoryRecord } from "../checklistHistory/components/ChecklistHistory";

export default function TradeChecklistView() {
  const [items, setItems] = useState<ChecklistItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily session checklist completion state (Fetched and synced with DB)
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [lastLoadedDateStr, setLastLoadedDateStr] = useState<string>("");

  // Sync today's session state and history logs
  const syncSessionAndLogs = useCallback(async (todayStr: string) => {
    try {
      const res = await syncSessionsAndArchive(todayStr);
      setCompletedItemIds(res.completed_ids || []);
      // Map Date objects to date strings for HistoryRecord interface compatibility
      const historyList: HistoryRecord[] = (res.history || []).map((h) => ({
        date: new Date(h.date).toDateString(),
        total: h.total,
        completed: h.completed,
        percentage: h.percentage,
        items: h.items,
      }));
      setHistory(historyList);
    } catch {
      toast.error("Failed to sync checklist data with server");
    }
  }, []);

  // Fetch active items from database
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChecklistItems();
      setItems(data);

      const todayStr = new Date().toDateString();
      setLastLoadedDateStr(todayStr);
      await syncSessionAndLogs(todayStr);
    } catch {
      toast.error("Failed to load checklist items");
    } finally {
      setLoading(false);
    }
  }, [syncSessionAndLogs]);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle midnight reset & archiving (Background timer)
  useEffect(() => {
    if (loading || !lastLoadedDateStr) return;

    const interval = setInterval(async () => {
      const checkToday = new Date().toDateString();
      if (lastLoadedDateStr !== checkToday) {
        setLoading(true);
        try {
          await syncSessionAndLogs(checkToday);
          setLastLoadedDateStr(checkToday);
          toast.info("A new day has started! Your checklist has been reset.");
        } finally {
          setLoading(false);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [loading, lastLoadedDateStr, syncSessionAndLogs]);

  // Handle checking checklist item (Updates DB session state)
  const handleToggleCheck = async (id: string) => {
    let updated: string[];
    if (completedItemIds.includes(id)) {
      updated = completedItemIds.filter((itemId) => itemId !== id);
    } else {
      updated = [...completedItemIds, id];
    }

    // Optimistic local state update
    setCompletedItemIds(updated);

    // Save to DB
    const todayStr = new Date().toDateString();
    const success = await updateTodaySession(todayStr, updated);
    if (!success) {
      toast.error("Failed to save checked status");
      // Revert on failure
      setCompletedItemIds(completedItemIds);
    }
  };

  // Reset daily session checks (Updates DB session state)
  const handleResetSession = async () => {
    const prev = [...completedItemIds];
    setCompletedItemIds([]);

    const todayStr = new Date().toDateString();
    const success = await updateTodaySession(todayStr, []);
    if (success) {
      toast.success("Trading session checklist reset!");
    } else {
      toast.error("Failed to reset checklist on database");
      setCompletedItemIds(prev);
    }
  };

  // Manual archive (Archives current state, resets daily session in DB)
  const handleArchiveSession = async () => {
    const todayStr = new Date().toDateString();
    setLoading(true);
    try {
      const record = await archiveSessionAction(todayStr, completedItemIds);
      if (record) {
        setCompletedItemIds([]);
        // Refresh items and sync logs
        await syncSessionAndLogs(todayStr);
        toast.success("Trading checklist archived successfully!");
      } else {
        toast.error("Failed to archive checklist session");
      }
    } catch {
      toast.error("An error occurred during archiving");
    } finally {
      setLoading(false);
    }
  };

  // Clear history logs in DB
  const handleClearHistory = async () => {
    const ok = await clearChecklistHistoryAction();
    if (ok) {
      setHistory([]);
      toast.success("Checklist history logs cleared.");
    } else {
      toast.error("Failed to clear checklist history");
    }
  };

  // Computed states
  const activeItems = items.filter((it) => it.is_active);
  const totalActive = activeItems.length;
  const completedActiveCount = activeItems.filter((it) =>
    completedItemIds.includes(it.id),
  ).length;
  const completionPercentage =
    totalActive > 0 ?
      Math.round((completedActiveCount / totalActive) * 100)
    : 0;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-primary">
      <Header title="Daily Trading Checklist" />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <ChecklistHeader
          totalCount={items.length}
          totalActive={totalActive}
          completedActiveCount={completedActiveCount}
          completionPercentage={completionPercentage}
          onResetSession={handleResetSession}
        />

        {loading ?
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <span className="text-sm text-[#6b7094]">
              Loading checklist database...
            </span>
          </div>
        : <div className="space-y-8">
            <ChecklistSessionFlow
              activeItems={activeItems}
              completedItemIds={completedItemIds}
              onToggleCheck={handleToggleCheck}
              onManageClick={() => {
                window.location.href = "/rules";
              }}
              completionPercentage={completionPercentage}
            />

            {/* Manual Archive Trigger */}
            {completedActiveCount > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleArchiveSession}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Archive & Reset Session
                </button>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
}
