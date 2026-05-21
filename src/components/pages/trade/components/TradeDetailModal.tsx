"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { getTradeById, deleteTrade } from "@/src/actions/trades/trade";
import { TradeDetail } from "@/src/actions/trades/trade.interface";
import { cn } from "@/src/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileIcon,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  Star,
  Brain,
  BookOpen,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, holdDuration } from "./types";
import { DeleteConfirmDialog } from "@/src/components/common/deleteModel";

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "profit" | "loss" | "neutral";
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#6b7094] font-semibold">{label}</span>
      <span
        className={cn(
          "text-sm font-bold font-mono",
          accent === "profit" && "text-emerald-400",
          accent === "loss" && "text-red-400",
          !accent && "text-[#c8ccd8]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Rating bar ───────────────────────────────────────────────────────────────
function RatingBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#6b7094]">{label}</span>
        <span className="text-[#c8ccd8] font-semibold">{value}/10</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Doc card ─────────────────────────────────────────────────────────────────
function DocCard({ url, index }: { url: string; index: number }) {
  const isPdf = url.toLowerCase().includes("pdf");
  const cleanUrl = url.split("?")[0]; // strip query params for display

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="group flex flex-col items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 p-3 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-150 text-center w-28"
    >
      {isPdf ? (
        <FileIcon className="size-8 text-red-400" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Doc ${index + 1}`}
          className="w-16 h-16 object-cover rounded-md"
        />
      )}
      <span className="text-[10px] text-[#6b7094] group-hover:text-emerald-400 truncate w-full transition-colors">
        {isPdf ? "PDF" : `Image ${index + 1}`}
      </span>
      <Download className="size-3 text-[#6b7094] group-hover:text-emerald-400 transition-colors" />
    </a>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────


// ─── Main Component ───────────────────────────────────────────────────────────
interface TradeDetailModalProps {
  tradeId: string | null;
  onClose: () => void;
  onEdit: (trade: TradeDetail) => void;
  onDeleted: () => void;
}

export function TradeDetailModal({
  tradeId,
  onClose,
  onEdit,
  onDeleted,
}: TradeDetailModalProps) {
  const [trade, setTrade] = useState<TradeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch on open
  useEffect(() => {
    if (!tradeId) { setTrade(null); return; }
    setLoading(true);
    getTradeById(tradeId)
      .then(setTrade)
      .finally(() => setLoading(false));
  }, [tradeId]);

  const handleDelete = async () => {
    if (!trade) return;
    setIsDeleting(true);
    try {
      const ok = await deleteTrade(trade.id);
      if (ok) {
        toast.success(`${trade.symbol} deleted successfully`);
        setShowDeleteConfirm(false);
        onClose();
        onDeleted();
      } else {
        toast.error("Failed to delete trade");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isProfit = (trade?.pnl_nominal ?? 0) >= 0;

  return (
    <>
      <Dialog open={!!tradeId} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-[90vw] sm:max-w-170 max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-4 pb-3 flex items-start justify-between gap-4">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
                {loading ? (
                  <>
                    <span className="sr-only">Loading trade details...</span>
                    <div className="h-6 w-48 rounded-md bg-white/8 animate-pulse" />
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        isProfit ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
                      )}
                    >
                      {trade?.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    {trade?.symbol}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isProfit ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
                      )}
                    >
                      {trade?.side}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/8 text-[#6b7094]">
                      {trade?.asset_class}
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {/* Action buttons */}
            {!loading && trade && (
              <div className="flex items-center gap-1.5 shrink-0 pr-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(trade)}
                  className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 text-[#c8ccd8]"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-1.5 border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : trade ? (
              <>
                {/* ── Stat grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatTile label="P&L" value={formatCurrency(trade.pnl_nominal)} accent={isProfit ? "profit" : "loss"} />
                  <StatTile label="P&L %" value={`${isProfit ? "+" : ""}${trade.pnl_percentage.toFixed(2)}%`} accent={isProfit ? "profit" : "loss"} />
                  <StatTile label="Entry Price" value={`₹${trade.entry_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                  <StatTile label="Exit Price" value={`₹${trade.exit_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                  <StatTile label="Quantity" value={trade.quantity.toLocaleString("en-IN")} />
                  <StatTile label="Hold Duration" value={holdDuration(trade.entry_time, trade.exit_time)} />
                  <StatTile label="Entry Time" value={formatDate(trade.entry_time)} />
                  <StatTile label="Exit Time" value={formatDate(trade.exit_time)} />
                </div>

                {/* ── Psychology ── */}
                {(trade.entry_confidence || trade.satisfaction_rating) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7094] flex items-center gap-1.5">
                        <Brain className="size-3.5" /> Psychology
                      </h3>
                      <div className="grid gap-2.5">
                        {trade.entry_confidence && (
                          <RatingBar label="Entry Confidence" value={trade.entry_confidence} />
                        )}
                        {trade.satisfaction_rating && (
                          <RatingBar label="Satisfaction Rating" value={trade.satisfaction_rating} />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Notes ── */}
                {trade.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7094] flex items-center gap-1.5">
                        <BookOpen className="size-3.5" /> Notes
                      </h3>
                      <p className="text-sm text-[#c8ccd8] leading-relaxed whitespace-pre-wrap bg-white/3 rounded-lg p-3 border border-white/8">
                        {trade.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* ── Mistakes ── */}
                {trade.mistakes_made && trade.mistakes_made.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7094] flex items-center gap-1.5">
                        <X className="size-3.5 text-red-400" /> Mistakes Made
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {trade.mistakes_made.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Lessons ── */}
                {trade.lessons_learned && trade.lessons_learned.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7094] flex items-center gap-1.5">
                        <Star className="size-3.5 text-emerald-400" /> Lessons Learned
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {trade.lessons_learned.map((l) => (
                          <span
                            key={l}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Documents ── */}
                {trade.trade_doc_url && trade.trade_doc_url.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7094] flex items-center gap-1.5">
                        <Download className="size-3.5" /> Trade Documents
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {trade.trade_doc_url.map((url, i) => (
                          <DocCard key={i} url={url} index={i} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#6b7094] gap-2">
                <AlertTriangle className="size-8 text-red-400/40" />
                <p className="text-sm">Trade not found</p>
              </div>
            )}
          </div>

          {/* Footer timestamp */}
          {!loading && trade && (
            <>
              <Separator />
              <div className="px-6 py-2 flex items-center gap-1.5 text-xs text-[#6b7094]">
                <Clock className="size-3" />
                Entry: {formatDate(trade.entry_time)} → Exit: {formatDate(trade.exit_time)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        symbol={trade?.symbol ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Trade"
        description={`Are you sure you want to delete the ${trade?.symbol} trade? This action cannot be undone.`}
      />
    </>
  );
}
