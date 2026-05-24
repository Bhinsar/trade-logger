"use client";

import React from "react";
import { Plus, Info, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  ChecklistItemResponse,
  ChecklistPriority,
} from "@/src/actions/checklist/checklist.interface";

interface ChecklistManageRulesProps {
  items: ChecklistItemResponse[];
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onEditClick: (item: ChecklistItemResponse) => void;
  onDeleteClick: (item: ChecklistItemResponse) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onAddClick: () => void;
}

export default function ChecklistManageRules({
  items,
  onToggleActive,
  onEditClick,
  onDeleteClick,
  onMove,
  onAddClick,
}: ChecklistManageRulesProps) {
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

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-white/5 rounded-xl p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
          <Info className="size-6 text-[#6b7094]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white font-semibold">No Rules Configured</h3>
          <p className="text-sm text-[#6b7094] max-w-xs mx-auto">
            Create checklist items to populate your daily pre-trading list.
          </p>
        </div>
        <Button onClick={onAddClick} variant="default">
          Add First Rule
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h3 className="text-white font-bold text-lg">Rule Templates</h3>
          <p className="text-xs text-[#6b7094]">
            Add, edit, delete, or change order of rules. Order determines layout sorting.
          </p>
        </div>
        <Button onClick={onAddClick} variant="default">
          <Plus className="size-4 mr-1.5" /> Add Rule
        </Button>
      </div>

      <div className="bg-background-secondary border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-background-primary/50 text-[#6b7094] text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 w-12 text-center">Order</th>
                <th className="p-4">Title / Note</th>
                <th className="p-4 w-40">Category</th>
                <th className="p-4 w-28">Priority</th>
                <th className="p-4 w-24">Status</th>
                <th className="p-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 text-sm hover:bg-background-primary/30 transition-colors ${
                    !item.is_active && "opacity-50"
                  }`}
                >
                  {/* Reordering controls */}
                  <td className="p-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => onMove(index, "up")}
                        className="p-1 hover:text-emerald-400 text-[#6b7094] hover:bg-white/5 rounded-md disabled:opacity-30 disabled:hover:text-[#6b7094] disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        disabled={index === items.length - 1}
                        onClick={() => onMove(index, "down")}
                        className="p-1 hover:text-emerald-400 text-[#6b7094] hover:bg-white/5 rounded-md disabled:opacity-30 disabled:hover:text-[#6b7094] disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Title & description */}
                  <td className="p-4 max-w-sm">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-white truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-[#6b7094] line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="text-xs bg-background-primary border border-white/5 px-2.5 py-1 rounded-md text-white">
                      {item.category}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* Toggle active button */}
                  <td className="p-4">
                    <button
                      onClick={() => onToggleActive(item.id, item.is_active)}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        item.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Edit/Delete Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEditClick(item)}
                        className="p-1.5 hover:text-emerald-400 hover:bg-white/5 rounded-md text-[#6b7094] transition-colors"
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(item)}
                        className="p-1.5 hover:text-red-400 hover:bg-white/5 rounded-md text-[#6b7094] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
