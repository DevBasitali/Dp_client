"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: PaginationBarProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  /* ── Compute visible page numbers (max 5) ── */
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  const btnBase =
    "h-9 min-w-[36px] px-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none";
  const activeBtn =
    "bg-[#1B2A4A] text-white border-[#1B2A4A]";
  const inactiveBtn =
    "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
  const disabledBtn =
    "bg-white text-gray-300 border-gray-100 cursor-not-allowed";

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      {/* ── Mobile: Prev / Page X of Y / Next ── */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={() => hasPrev && onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={`${btnBase} ${hasPrev ? inactiveBtn : disabledBtn} flex items-center gap-1 px-3`}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => hasNext && onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`${btnBase} ${hasNext ? inactiveBtn : disabledBtn} flex items-center gap-1 px-3`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Desktop: numbered pages + result count ── */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          {/* Prev arrow */}
          <button
            onClick={() => hasPrev && onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            className={`${btnBase} ${hasPrev ? inactiveBtn : disabledBtn}`}
          >
            <ChevronLeft className="w-4 h-4 mx-auto" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`${btnBase} ${p === currentPage ? activeBtn : inactiveBtn}`}
              >
                {p}
              </button>
            )
          )}

          {/* Next arrow */}
          <button
            onClick={() => hasNext && onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={`${btnBase} ${hasNext ? inactiveBtn : disabledBtn}`}
          >
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Showing {start}–{end} of {totalItems} results
        </p>
      </div>
    </div>
  );
}
