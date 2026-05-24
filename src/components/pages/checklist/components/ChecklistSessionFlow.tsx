"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  ChecklistItemResponse,
  ChecklistCategory,
  ChecklistPriority,
} from "@/src/actions/checklist/checklist.interface";

interface ChecklistSessionFlowProps {
  activeItems: ChecklistItemResponse[];
  completedItemIds: string[];
  onToggleCheck: (id: string) => void;
  onManageClick: () => void;
  completionPercentage: number;
}

export default function ChecklistSessionFlow({
  activeItems,
  completedItemIds,
  onToggleCheck,
  onManageClick,
  completionPercentage,
}: ChecklistSessionFlowProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);

  const categoriesList = Object.values(ChecklistCategory);

  const filteredSessionItems = selectedCategoryFilter === "all"
    ? activeItems
    : activeItems.filter((it) => it.category === selectedCategoryFilter);

  const toggleExpandDescription = (id: string) => {
    if (expandedItemIds.includes(id)) {
      setExpandedItemIds(expandedItemIds.filter((itemId) => itemId !== id));
    } else {
      setExpandedItemIds([...expandedItemIds, id]);
    }
  };

  const getPriorityColor = (priority: ChecklistPriority) => {
    switch (priority) {
      case ChecklistPriority.Critical:
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case ChecklistPriority.High:
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case ChecklistPriority.Medium:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case ChecklistPriority.Low:
        return "bg-[#22253a] text-gray-400 border border-white/5";
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className="bg-background-secondary border border-white/5 rounded-xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
          <Info className="size-6 text-[#6b7094]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white font-semibold">No Checklist Items Configured</h3>
          <p className="text-sm text-[#6b7094] max-w-sm mx-auto">
            Go to the rules management section to configure active items for your daily checklist.
          </p>
        </div>
        <Button onClick={onManageClick} variant="default">
          Create Checklist Rule
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center bg-background-secondary border border-white/5 p-2 rounded-xl">
        <button
          onClick={() => setSelectedCategoryFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedCategoryFilter === "all"
              ? "bg-background-primary text-emerald-400 border border-emerald-500/20"
              : "text-[#6b7094] hover:text-white"
          }`}
        >
          All Categories
        </button>
        {categoriesList.map((cat) => {
          const count = activeItems.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategoryFilter === cat
                  ? "bg-background-primary text-emerald-400 border border-emerald-500/20"
                  : "text-[#6b7094] hover:text-white"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Render Checklist Items Grouped by Category */}
      <div className="space-y-8">
        {categoriesList.map((cat) => {
          const catItems = filteredSessionItems.filter((it) => it.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2 pl-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400/90">
                  {cat}
                </h3>
                <span className="text-xs text-[#6b7094]">
                  ({catItems.filter((i) => completedItemIds.includes(i.id)).length}/{catItems.length})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {catItems.map((item) => {
                  const isCompleted = completedItemIds.includes(item.id);
                  const isExpanded = expandedItemIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`group rounded-xl border transition-all duration-200 ${
                        isCompleted
                          ? "bg-emerald-950/10 border-emerald-500/20 opacity-80"
                          : "bg-background-secondary border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="p-4 flex items-start gap-4">
                        {/* Interactive Checkbox */}
                        <button
                          onClick={() => onToggleCheck(item.id)}
                          className={`mt-0.5 size-5 shrink-0 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-background-secondary"
                              : "border-[#6b7094]/40 bg-transparent hover:border-emerald-500/70"
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="size-4 stroke-3" />}
                        </button>

                        {/* Title & Notes Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => onToggleCheck(item.id)}
                              className={`text-sm font-semibold cursor-pointer select-none leading-none ${
                                isCompleted ? "text-[#c8ccd8] line-through" : "text-white"
                              }`}
                            >
                              {item.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold select-none ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                          </div>

                          {item.description && (
                            <div className="pt-1">
                              <button
                                onClick={() => toggleExpandDescription(item.id)}
                                className="text-xs text-[#6b7094] hover:text-white flex items-center gap-0.5"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="size-3" /> Hide notes
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="size-3" /> View notes
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <p className="mt-2 text-xs text-[#c8ccd8] leading-relaxed bg-background-primary/60 p-2.5 rounded-lg border border-white/5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Start Trading Completion Banner */}
        {completionPercentage === 100 && (
          <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="size-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <CheckCircle2 className="size-6 text-background-secondary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">All Pre-Trade Checks Complete!</h4>
                <p className="text-sm text-[#c8ccd8]">
                  Your checklist is fully checked off. You are ready to open trades with a clean mindset.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/trades";
              }}
              variant="default"
              className="bg-emerald-500 text-black hover:bg-emerald-600 border-0"
            >
              <Play className="size-4 mr-1.5" /> Start Trading
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
