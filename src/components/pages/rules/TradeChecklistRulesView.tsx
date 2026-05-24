"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Header from "@/src/components/common/header";
import { ChecklistItemResponse } from "@/src/actions/checklist/checklist.interface";
import {
  getChecklistItems,
  toggleChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  syncSessionsAndArchive,
} from "@/src/actions/checklist/checklist";
import ChecklistDialog from "@/src/components/pages/rules/components/ChecklistDialog";
import { DeleteConfirmDialog } from "@/src/components/common/deleteModel";
import ChecklistManageRules from "./components/ChecklistManageRules";
import ChecklistHeader from "../checklist/components/ChecklistHeader";

export default function RulesView() {
  const [items, setItems] = useState<ChecklistItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog / Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItemResponse | null>(null);
  const [deleteItem, setDeleteItem] = useState<ChecklistItemResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch completed items from database for progress ring in header
  const [completedActiveCount, setCompletedActiveCount] = useState(0);

  // Fetch all items from database
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChecklistItems();
      setItems(data);
      
      const todayStr = new Date().toDateString();
      const res = await syncSessionsAndArchive(todayStr);
      const activeIds = data.filter((it) => it.is_active).map((it) => it.id);
      const count = (res.completed_ids || []).filter((id) => activeIds.includes(id)).length;
      setCompletedActiveCount(count);
    } catch {
      toast.error("Failed to load checklist items");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Toggle rule active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const success = await toggleChecklistItem(id, !currentStatus);
      if (success) {
        toast.success(`Rule set to ${!currentStatus ? "active" : "inactive"}`);
        setItems(
          items.map((it) =>
            it.id === id ? { ...it, is_active: !currentStatus } : it
          )
        );
      } else {
        toast.error("Failed to toggle rule status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  // Trigger delete operation
  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const ok = await deleteChecklistItem(deleteItem.id);
      if (ok) {
        toast.success("Checklist item deleted");
        setDeleteItem(null);
        fetchItems();
      } else {
        toast.error("Failed to delete checklist item");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  // Move / sort rules
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const listCopy = [...items];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    setItems(listCopy);

    try {
      const orderedIds = listCopy.map((it) => it.id);
      const success = await reorderChecklistItems(orderedIds);
      if (!success) {
        toast.error("Failed to save order index");
        fetchItems();
      }
    } catch {
      toast.error("Error saving checklist order");
      fetchItems();
    }
  };

  const activeItems = items.filter((it) => it.is_active);
  const totalActive = activeItems.length;
  const completionPercentage = totalActive > 0
    ? Math.round((completedActiveCount / totalActive) * 100)
    : 0;

  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-background-primary">
        <Header title="Manage Checklist Rules" />

        <div className="flex-1 p-4 md:p-6 space-y-6">
          <ChecklistHeader
            totalCount={items.length}
            totalActive={totalActive}
            completedActiveCount={completedActiveCount}
            completionPercentage={completionPercentage}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <span className="text-sm text-[#6b7094]">Loading checklist rules...</span>
            </div>
          ) : (
            <ChecklistManageRules
              items={items}
              onToggleActive={handleToggleActive}
              onEditClick={(item) => {
                setEditingItem(item);
                setIsDialogOpen(true);
              }}
              onDeleteClick={(item) => setDeleteItem(item)}
              onMove={handleMove}
              onAddClick={() => setIsDialogOpen(true)}
            />
          )}
        </div>
      </div>

      <ChecklistDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        onSuccess={fetchItems}
        editItem={editingItem}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        symbol={deleteItem?.title ?? ""}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
        title="Delete Rule"
        description={`Are you sure you want to delete "${deleteItem?.title}" from templates? This action cannot be undone.`}
      />
    </>
  );
}
