"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { PAGE_LIMIT } from "./types";

interface StrategyPaginationProps {
  page: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StrategyPagination({
  page,
  totalCount,
  totalPages,
  onPageChange,
}: StrategyPaginationProps) {
  if (totalCount === 0) return null;

  // Compute up to 5 visible page numbers centered around current page
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/8 bg-white/[0.015]">
      {/* Result range label */}
      <p className="text-xs text-[#6b7094]">
        Showing{" "}
        <span className="font-semibold text-[#c8ccd8]">
          {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, totalCount)}
        </span>{" "}
        of <span className="font-semibold text-[#c8ccd8]">{totalCount}</span>
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <Button
          id="prev-page"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-[#c8ccd8] disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {visiblePages.map((pg) => (
          <button
            key={pg}
            id={`page-btn-${pg}`}
            onClick={() => onPageChange(pg)}
            className={cn(
              "size-7 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer",
              pg === page
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-[#6b7094] hover:bg-white/8 hover:text-[#c8ccd8]",
            )}
          >
            {pg}
          </button>
        ))}

        <Button
          id="next-page"
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-[#c8ccd8] disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
