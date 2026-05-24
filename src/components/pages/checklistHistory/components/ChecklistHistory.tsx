"use client";

import React, { useState } from "react";
import { Calendar, Trash2, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export interface HistoryRecord {
  date: string;
  total: number;
  completed: number;
  percentage: number;
  items: string[];
}

interface ChecklistHistoryProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export default function ChecklistHistory({
  history,
  onClearHistory,
}: ChecklistHistoryProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  const toggleExpand = (date: string) => {
    if (expandedDates.includes(date)) {
      setExpandedDates(expandedDates.filter((d) => d !== date));
    } else {
      setExpandedDates([...expandedDates, date]);
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-background-secondary border border-white/5 rounded-xl p-8 text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
          <Calendar className="size-5 text-[#6b7094]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-semibold text-sm">No Checklist History</h4>
          <p className="text-xs text-[#6b7094] max-w-xs mx-auto">
            Completed checklists will be archived here daily at 12:00 AM or when you finalize a session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart2 className="size-4 text-emerald-400" />
          <h3 className="text-white font-bold text-base">Checklist History Log</h3>
        </div>
        <Button
          onClick={onClearHistory}
          variant="destructive"
          size="xs"
          className="text-xs"
        >
          <Trash2 className="size-3 mr-1" /> Clear Logs
        </Button>
      </div>

      <div className="bg-background-secondary border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-background-primary/50 text-[#6b7094] text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4">Session Date</th>
                <th className="p-3 text-center">Completed</th>
                <th className="p-3">Score</th>
                <th className="p-3 text-right pr-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => {
                const isExpanded = expandedDates.includes(record.date);
                const scoreColor =
                  record.percentage === 100
                    ? "text-emerald-400"
                    : record.percentage >= 70
                    ? "text-blue-400"
                    : "text-orange-400";

                return (
                  <React.Fragment key={record.date}>
                    <tr className="border-b border-white/5 text-sm hover:bg-background-primary/20 transition-colors">
                      {/* Date */}
                      <td className="p-3 pl-4 font-medium text-white">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Completed Ratio */}
                      <td className="p-3 text-center text-[#c8ccd8] font-mono">
                        {record.completed}/{record.total}
                      </td>

                      {/* Score percentage bar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-background-primary rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${record.percentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${scoreColor}`}>
                            {record.percentage}%
                          </span>
                        </div>
                      </td>

                      {/* Expander button */}
                      <td className="p-3 text-right pr-4">
                        <button
                          onClick={() => toggleExpand(record.date)}
                          className="p-1 hover:text-emerald-400 hover:bg-white/5 rounded-md text-[#6b7094] transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Hide <ChevronUp className="size-3" />
                            </>
                          ) : (
                            <>
                              View Items <ChevronDown className="size-3" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable item details */}
                    {isExpanded && (
                      <tr className="bg-background-primary/30">
                        <td colSpan={4} className="p-4 pl-6 border-b border-white/5">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-[#6b7094] uppercase tracking-wider">
                              Completed Items:
                            </h5>
                            {record.items.length === 0 ? (
                              <p className="text-xs text-[#6b7094] italic">
                                No items were completed in this session.
                              </p>
                            ) : (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 list-disc list-inside">
                                {record.items.map((title, idx) => (
                                  <li key={idx} className="text-xs text-[#c8ccd8]">
                                    {title}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
