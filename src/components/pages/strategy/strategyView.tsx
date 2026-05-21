"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import Header from "@/src/components/common/header";
import { AddStrategyModel } from "@/src/components/addStrategy/addStrategyModel";
import { getAllStrategies, deleteStrategy } from "@/src/actions/strategies/strategie";
import { toast } from "sonner";
import { strategy } from "@/src/actions/strategies/strategie.interface";

import { StrategyTopBar } from "./components/StrategyTopBar";
import { StrategyTable } from "./components/StrategyTable";
import { StrategyPagination } from "./components/StrategyPagination";
import { Filters, PAGE_LIMIT, defaultFilters } from "./components/types";
import { DeleteConfirmDialog } from "../../common/deleteModel";

function StrategyView() {
  const [strategies, setStrategies] = useState<strategy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pendingSearch, setPendingSearch] = useState("");

  const [isAddStrategyOpen, setIsAddStrategyOpen] = useState(false);
  const [editStrategy, setEditStrategy] = useState<strategy | null>(null);
  const [deleteStrategyItem, setDeleteStrategyItem] = useState<strategy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

  const hasActiveFilters = Boolean(filters.search);

  const fetchStrategies = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const result = await getAllStrategies({
        page: p,
        limit: PAGE_LIMIT,
        search: f.search || undefined,
      });
      if (result) {
        setStrategies(result.strategies);
        setTotalCount(result.totalCount);
      } else {
        setStrategies([]);
        setTotalCount(0);
      }
    } catch (e) {
      toast.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies(filters, page);
  }, [filters, page, fetchStrategies]);

  const handleSearchChange = (val: string) => {
    setPendingSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: val }));
    }, 400);
  };

  const refresh = useCallback(() => {
    setPage(1);
    fetchStrategies(filters, 1);
  }, [filters, fetchStrategies]);

  const handleEditClick = (id: string) => {
    const item = strategies.find((s) => (s.id === id || s._id === id));
    if (item) setEditStrategy(item);
  };

  const handleDeleteClick = (id: string) => {
    const item = strategies.find((s) => (s.id === id || s._id === id));
    if (item) setDeleteStrategyItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteStrategyItem) return;
    const targetId = deleteStrategyItem.id || deleteStrategyItem._id;
    if (!targetId) return;

    setIsDeleting(true);
    try {
      const ok = await deleteStrategy(targetId);
      if (ok) {
        toast.success("Strategy deleted successfully");
        setDeleteStrategyItem(null);
        refresh();
      } else {
        toast.error("Failed to delete strategy");
      }
    } catch (e) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-[#191a29]">
        <Header title="Strategies" />

        <div className="flex-1 p-4 md:p-6 space-y-4">
          <StrategyTopBar
            totalCount={totalCount}
            searchValue={pendingSearch}
            onSearchChange={handleSearchChange}
            onAddStrategy={() => setIsAddStrategyOpen(true)}
          />

          <div className="rounded-xl border border-white/8 bg-[#13141f] overflow-hidden">
            <StrategyTable
              strategies={strategies}
              loading={loading}
              hasActiveFilters={hasActiveFilters}
              onAddStrategy={() => setIsAddStrategyOpen(true)}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
            <StrategyPagination
              page={page}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Add Strategy modal (create mode) */}
      <AddStrategyModel
        isOpen={isAddStrategyOpen}
        onClose={() => setIsAddStrategyOpen(false)}
        onSuccess={() => {
          toast.success("Strategy created successfully");
          refresh();
        }}
      />

      {/* Add Strategy modal (edit mode) */}
      <AddStrategyModel
        isOpen={!!editStrategy}
        onClose={() => setEditStrategy(null)}
        editData={editStrategy}
        strategyId={editStrategy?.id || editStrategy?._id || ""}
        onSuccess={() => {
          toast.success("Strategy updated successfully");
          setEditStrategy(null);
          refresh();
        }}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteStrategyItem}
        symbol={deleteStrategyItem?.title ?? ""}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteStrategyItem(null)}
        title="Delete Strategy"
        description={`Are you sure you want to delete the strategy "${deleteStrategyItem?.title}"? This action cannot be undone.`}
      />

      {loading && strategies.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#13141f] border border-white/10 shadow-2xl text-xs text-[#c8ccd8]">
          <Loader2 className="size-3.5 animate-spin text-emerald-400" />
          Loading…
        </div>
      )}
    </>
  );
}

export default StrategyView;