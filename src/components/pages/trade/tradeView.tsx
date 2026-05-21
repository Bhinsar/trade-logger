"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import Header from "@/src/components/common/header";
import { AddTradeModel } from "@/src/components/addTrade/addTradeModel";
import { getTrades, getTradeById, deleteTrade } from "@/src/actions/trades/trade";
import { toast } from "sonner";
import { Trade, TradeDetail } from "@/src/actions/trades/trade.interface";

import { TradeTopBar } from "./components/TradeTopBar";
import { TradeFilterPanel } from "./components/TradeFilterPanel";
import { TradeTable } from "./components/TradeTable";
import { TradePagination } from "./components/TradePagination";
import { TradeDetailModal } from "./components/TradeDetailModal";
import { Filters, PAGE_LIMIT, defaultFilters, SortField } from "./components/types";
import { DeleteConfirmDialog } from "../../common/deleteModel";

function TradeView() {
  // ── List state ─────────────────────────────────────────────────────────────
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pendingSearch, setPendingSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [detailTradeId, setDetailTradeId] = useState<string | null>(null);
  /** When set the AddTradeModel opens in edit mode */
  const [editTrade, setEditTrade] = useState<TradeDetail | null>(null);
  const [deleteTradeItem, setDeleteTradeItem] = useState<Trade | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.asset_class && filters.asset_class !== "all") ||
    filters.profit ||
    filters.loss ||
    filters.entry_time ||
    filters.exit_time,
  );

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchTrades = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const result = await getTrades({
        page: p,
        limit: PAGE_LIMIT,
        sort: `${f.sort_field}:${f.sort_dir}`,
        search: f.search || undefined,
        asset_class: f.asset_class && f.asset_class !== "all" ? f.asset_class : undefined,
        profit: f.profit || undefined,
        loss: f.loss || undefined,
        entry_time: f.entry_time ? new Date(f.entry_time) : undefined,
        exit_time: f.exit_time ? new Date(f.exit_time) : undefined,
      });
      setTrades(result.trades);
      setTotalCount(result.totalCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades(filters, page);
  }, [filters, page, fetchTrades]);

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setPendingSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: val }));
    }, 400);
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, val: Filters[K]) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleToggleProfitLoss = (type: "profit" | "loss") => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSort = (field: SortField) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      sort_field: field,
      sort_dir: prev.sort_field === field && prev.sort_dir === "desc" ? "asc" : "desc",
    }));
  };

  const handleClearFilters = () => {
    setPendingSearch("");
    setPage(1);
    setFilters(defaultFilters);
  };

  /** Shared refresh — called after add, edit, or delete */
  const refresh = useCallback(() => {
    setPage(1);
    fetchTrades(filters, 1);
  }, [filters, fetchTrades]);

  const handleEditClick = async (id: string) => {
    try {
      const trade = await getTradeById(id);
      if (trade) setEditTrade(trade);
    } catch (e) {
      toast.error("Failed to load trade details");
    }
  };

  const handleDeleteClick = (id: string) => {
    const trade = trades.find((t) => t.id === id);
    if (trade) setDeleteTradeItem(trade);
  };

  const confirmDelete = async () => {
    if (!deleteTradeItem) return;
    setIsDeleting(true);
    try {
      const ok = await deleteTrade(deleteTradeItem.id);
      if (ok) {
        toast.success("Trade deleted successfully");
        setDeleteTradeItem(null);
        refresh();
      } else {
        toast.error("Failed to delete trade");
      }
    } catch (e) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-[#191a29]">
        <Header title="Trades" />

        <div className="flex-1 p-4 md:p-6 space-y-4">
          <TradeTopBar
            totalCount={totalCount}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters}
            onToggleFilters={() => setShowFilters((s) => !s)}
            onAddTrade={() => setIsAddTradeOpen(true)}
          />

          <TradeFilterPanel
            filters={filters}
            pendingSearch={pendingSearch}
            isOpen={showFilters}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onToggleProfitLoss={handleToggleProfitLoss}
            onClearFilters={handleClearFilters}
          />

          <div className="rounded-xl border border-white/8 bg-[#13141f] overflow-hidden">
            <TradeTable
              trades={trades}
              loading={loading}
              hasActiveFilters={hasActiveFilters}
              sortField={filters.sort_field}
              sortDir={filters.sort_dir}
              onSort={handleSort}
              onAddTrade={() => setIsAddTradeOpen(true)}
              onRowClick={(id) => setDetailTradeId(id)}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
            <TradePagination
              page={page}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Add Trade (create) */}
      <AddTradeModel
        isVisible={isAddTradeOpen}
        setIsVisible={setIsAddTradeOpen}
        onTradeAdded={refresh}
      />

      {/* Add Trade reused for Edit — active when editTrade is set */}
      <AddTradeModel
        isVisible={!!editTrade}
        setIsVisible={(open) => { if (!open) setEditTrade(null); }}
        editData={editTrade}
        tradeId={editTrade?.id}
        onTradeAdded={() => { setEditTrade(null); refresh(); }}
      />

      {/* Trade detail modal — triggers edit by setting editTrade */}
      <TradeDetailModal
        tradeId={detailTradeId}
        onClose={() => setDetailTradeId(null)}
        onEdit={(trade) => {
          setDetailTradeId(null); // close detail first
          setEditTrade(trade);    // then open edit
        }}
        onDeleted={refresh}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTradeItem}
        symbol={deleteTradeItem?.symbol ?? ""}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTradeItem(null)}
        title="Delete Trade"
        description={`Are you sure you want to delete the ${deleteTradeItem?.symbol} trade? This action cannot be undone.`}
      />

      {/* Page-transition loading indicator */}
      {loading && trades.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#13141f] border border-white/10 shadow-2xl text-xs text-[#c8ccd8]">
          <Loader2 className="size-3.5 animate-spin text-emerald-400" />
          Loading…
        </div>
      )}
    </>
  );
}

export default TradeView;