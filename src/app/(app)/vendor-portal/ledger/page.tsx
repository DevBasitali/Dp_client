"use client";

import { useAuthStore } from "@/store/authStore";
import { useVendorLedger } from "@/hooks/useVendors";
import { BookOpen, Loader2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";

const formatMoney = (amount: number) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

export default function VendorLedgerPage() {
  const { user } = useAuthStore();
  const vendorId = user?.vendorId ?? "";

  const { data, isLoading, isError } = useVendorLedger(vendorId);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  /* ── Error ── */
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-red-500 font-medium">Failed to load ledger.</p>
        <p className="text-sm text-gray-400 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  /* ── Derived numbers ── */
  const totalBilled = data.ledger
    .filter((r) => r.type === "INVENTORY")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPaid = data.ledger
    .filter((r) => r.type === "PAYMENT")
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = data.outstandingBalance;

  /* ── Empty state ── */
  if (data.ledger.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <PageHeader />
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <BookOpen className="w-14 h-14 text-gray-200 mb-4" />
          <p className="text-base font-semibold text-gray-500">No transactions yet.</p>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xs">
            Your ledger will appear here once your owner records deliveries and payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <PageHeader />

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Billed */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            Total Billed
          </p>
          <p className="text-sm font-bold text-[#1B2A4A] leading-tight">
            {formatMoney(totalBilled)}
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            Total Paid
          </p>
          <p className="text-sm font-bold text-green-600 leading-tight">
            {formatMoney(totalPaid)}
          </p>
        </div>

        {/* Balance Remaining */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            Balance
          </p>
          <p className="text-sm font-bold text-red-600 leading-tight">
            {formatMoney(balance)}
          </p>
        </div>
      </div>

      {/* ── Transaction list ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
          Transactions
        </h2>

        {data.ledger.map((row, idx) => {
          const isInventory = row.type === "INVENTORY";
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              {/* Top row: date + type badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {format(new Date(row.date), "d MMM yyyy")}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isInventory
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isInventory ? "Inventory" : "Payment"}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm font-medium text-[#1B2A4A] mb-1 leading-snug">
                {row.description}
              </p>

              {/* Branch name */}
              {row.branch?.name && (
                <p className="text-[11px] text-gray-400 mb-2">{row.branch.name}</p>
              )}

              {/* Bottom row: amount + source badge + running balance */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isInventory ? "text-[#1B2A4A]" : "text-green-600"
                    }`}
                  >
                    {isInventory ? "+" : "−"} {formatMoney(row.amount)}
                  </span>

                  {/* Source badge (payments only) */}
                  {!isInventory && row.source && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        row.source === "FROM_SALE"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {row.source === "FROM_SALE" ? "FROM SALE" : "FROM CAL"}
                    </span>
                  )}
                </div>

                {/* Running balance */}
                <span className="text-[11px] text-gray-400 font-medium">
                  Bal:{" "}
                  <span className={row.runningBalance > 0 ? "text-red-500" : "text-green-600"}>
                    {formatMoney(row.runningBalance)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center gap-2">
        <BookOpen className="text-[#F0A500]" />
        My Ledger
      </h1>
      <p className="text-gray-500 text-sm mt-0.5">
        Your delivery and payment history with outstanding balance.
      </p>
    </div>
  );
}
