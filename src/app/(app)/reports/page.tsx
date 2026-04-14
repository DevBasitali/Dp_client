"use client";

import { useState } from "react";
import { useVendorOutstanding } from "@/hooks/useReports";
import { useDailyClosings } from "@/hooks/useDailyClosings";
import { useMonthlyClosings } from "@/hooks/useMonthlyClosings";
import { useBranches } from "@/hooks/useBranches";
import { useVendors, useVendorLedger, LedgerRow } from "@/hooks/useVendors";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Loader2, TrendingDown, CalendarDays, CalendarCheck, Receipt,
} from "lucide-react";
import { format } from "date-fns";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];
const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const filterSelect =
  "border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B2A4A]";

export default function ReportsPage() {
  const formatMoney = (amount: number | null | undefined) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

  const getMonthName = (m: number) =>
    new Date(0, m - 1).toLocaleString("default", { month: "long" });

  // ── Report 2 filters ──────────────────────────────────────────
  const [dailyBranch, setDailyBranch] = useState("");
  const [dailyMonth, setDailyMonth] = useState(CURRENT_MONTH);
  const [dailyYear, setDailyYear] = useState(CURRENT_YEAR);

  // ── Report 4 filters ──────────────────────────────────────────
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── Data ──────────────────────────────────────────────────────
  const { data: outstanding, isLoading: loadingOutstanding } = useVendorOutstanding();
  const { data: branches } = useBranches();
  const { data: dailyClosings, isLoading: loadingDaily } = useDailyClosings({
    branchId: dailyBranch || undefined,
    month: dailyMonth,
    year: dailyYear,
  });
  const { data: monthlyData, isLoading: loadingMonthly } = useMonthlyClosings();
  const { data: vendors } = useVendors();
  const { data: vendorLedger, isLoading: loadingLedger } = useVendorLedger(selectedVendorId);

  // Filter payment rows from ledger
  const paymentRows: LedgerRow[] = (vendorLedger?.ledger || [])
    .filter((r) => r.type === "PAYMENT")
    .filter((r) => {
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <BarChart3 className="mr-2 text-[#F0A500]" />
          Reports
        </h1>
        <p className="text-gray-500 text-sm">Financial reports and data exports.</p>
      </div>

      {/* ── Report 1: Vendor Outstanding ────────────────────────── */}
      <Card className="shadow-sm border-0 border-t-4 border-t-[#F0A500]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#F0A500]" />
            Vendor Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingOutstanding ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
            </div>
          ) : !outstanding?.length ? (
            <p className="text-center py-8 text-gray-400 text-sm">No outstanding balances.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Total Billed</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Total Paid</TableHead>
                    <TableHead className="text-right font-semibold text-red-600">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding.map((v) => (
                    <TableRow key={v.vendorId} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-[#1A1A2E]">{v.vendorName}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{v.category || "—"}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(v.totalInventory)}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(v.totalPaid)}</TableCell>
                      <TableCell className="text-right font-bold text-red-600 bg-red-50/40">
                        {formatMoney(v.outstandingBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Report 2: Daily Closings ────────────────────────────── */}
      <Card className="shadow-sm border-0 border-t-4 border-t-[#1B2A4A]">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#1B2A4A]" />
              Daily Closings Report
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <select
                className={filterSelect}
                value={dailyBranch}
                onChange={(e) => setDailyBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <select
                className={filterSelect}
                value={dailyMonth}
                onChange={(e) => setDailyMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                className={filterSelect}
                value={dailyYear}
                onChange={(e) => setDailyYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingDaily ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
            </div>
          ) : !dailyClosings?.length ? (
            <p className="text-center py-8 text-gray-400 text-sm">No daily closings for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Branch</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Cash</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">EasyPaisa</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Register</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Physical to Box</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyClosings.map((dc) => (
                    <TableRow key={dc.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-[#1A1A2E] whitespace-nowrap">
                        {format(new Date(dc.closingDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-600">{dc.branch?.name || "—"}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(dc.cashSales)}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(dc.easypaisaSales)}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(dc.registerTotal)}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(dc.physicalToBox)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Report 3: Monthly Bachat ────────────────────────────── */}
      <Card className="shadow-sm border-0 border-t-4 border-t-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-green-600" />
            Monthly Bachat Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingMonthly ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
            </div>
          ) : !monthlyData?.closings?.length ? (
            <p className="text-center py-8 text-gray-400 text-sm">No monthly closings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Month</TableHead>
                    <TableHead className="font-semibold text-gray-700">Branch</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Total Sales</TableHead>
                    <TableHead className="text-right font-semibold text-red-600">Expenses</TableHead>
                    <TableHead className="text-right font-semibold text-green-700">Net Bachat</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.closings.map((mc) => (
                    <TableRow key={mc.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-[#1A1A2E] whitespace-nowrap">
                        {getMonthName(mc.month)} {mc.year}
                      </TableCell>
                      <TableCell className="text-gray-600">{mc.branch?.name || "—"}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(mc.totalSales)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatMoney(mc.totalExpenses)}</TableCell>
                      <TableCell className="text-right font-bold text-green-700 bg-green-50/30">
                        {formatMoney(mc.netBachat)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          CLOSED
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Report 4: Vendor Payment History ───────────────────── */}
      <Card className="shadow-sm border-0 border-t-4 border-t-purple-500">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-600" />
              Vendor Payment History
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <select
                className={filterSelect}
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
              >
                <option value="">Select Vendor</option>
                {vendors?.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <input
                type="date"
                className={filterSelect}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From"
              />
              <input
                type="date"
                className={filterSelect}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedVendorId ? (
            <p className="text-center py-8 text-gray-400 text-sm">Select a vendor to view payment history.</p>
          ) : loadingLedger ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
            </div>
          ) : !paymentRows.length ? (
            <p className="text-center py-8 text-gray-400 text-sm">No payments recorded for this vendor.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Branch</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Source</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRows.map((row, i) => (
                    <TableRow key={i} className="hover:bg-slate-50">
                      <TableCell className="whitespace-nowrap text-gray-600">
                        {format(new Date(row.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {vendorLedger?.vendor.name}
                      </TableCell>
                      <TableCell className="text-gray-600">{row.branch?.name || "—"}</TableCell>
                      <TableCell className="text-right font-medium text-green-700">
                        {formatMoney(row.amount)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{row.source || "—"}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{row.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
