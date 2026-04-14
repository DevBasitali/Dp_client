"use client";

import { useState, useEffect } from "react";
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
import PaginationBar from "@/components/ui/pagination-bar";

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

  // ── Pagination states ─────────────────────────────────────────
  const ITEMS_PER_PAGE = 10;
  const [outstandingPage, setOutstandingPage] = useState(1);
  const [dailyPage, setDailyPage] = useState(1);
  const [monthlyPage, setMonthlyPage] = useState(1);

  useEffect(() => { setDailyPage(1); }, [dailyBranch, dailyMonth, dailyYear]);
  useEffect(() => { setOutstandingPage(1); }, []);
  useEffect(() => { setMonthlyPage(1); }, []);

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
    <div className="space-y-8 lg:p-4 pb-24 md:pb-24">
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                    {outstanding.slice((outstandingPage - 1) * ITEMS_PER_PAGE, outstandingPage * ITEMS_PER_PAGE).map((v) => (
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

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {outstanding.slice((outstandingPage - 1) * ITEMS_PER_PAGE, outstandingPage * ITEMS_PER_PAGE).map((vendor) => (
                  <div key={vendor.vendorId} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#1B2A4A] text-sm">{vendor.vendorName}</h3>
                        <p className="text-gray-400 text-xs">{vendor.category || "—"}</p>
                      </div>
                      <span className="text-red-600 font-bold text-sm">{formatMoney(vendor.outstandingBalance)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
                      <div>
                        <p className="text-gray-400 text-xs">Total Billed</p>
                        <p className="text-sm font-medium">{formatMoney(vendor.totalInventory)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Total Paid</p>
                        <p className="text-sm font-medium text-green-600">{formatMoney(vendor.totalPaid)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-2">
                <PaginationBar
                  currentPage={outstandingPage}
                  totalItems={outstanding.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setOutstandingPage}
                />
              </div>
            </>
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
                className={`${filterSelect} w-full md:w-auto`}
                value={dailyBranch}
                onChange={(e) => setDailyBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <select
                className={`${filterSelect} w-full md:w-auto`}
                value={dailyMonth}
                onChange={(e) => setDailyMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                className={`${filterSelect} w-full md:w-auto`}
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                    {dailyClosings.slice((dailyPage - 1) * ITEMS_PER_PAGE, dailyPage * ITEMS_PER_PAGE).map((dc) => (
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

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {dailyClosings.slice((dailyPage - 1) * ITEMS_PER_PAGE, dailyPage * ITEMS_PER_PAGE).map((closing) => (
                  <div key={closing.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-[#1B2A4A] text-sm">{closing.branch?.name || "—"}</p>
                        <p className="text-gray-400 text-xs">
                          {format(new Date(closing.closingDate), "d MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Physical to Box</p>
                        <p className="font-bold text-green-600 text-sm">{formatMoney(closing.physicalToBox)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                      <div>
                        <p className="text-gray-400 text-xs">Cash</p>
                        <p className="text-xs font-medium">{formatMoney(closing.cashSales)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">EasyPaisa</p>
                        <p className="text-xs font-medium">{formatMoney(closing.easypaisaSales)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Register</p>
                        <p className="text-xs font-medium">{formatMoney(closing.registerTotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-2">
                <PaginationBar
                  currentPage={dailyPage}
                  totalItems={dailyClosings.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setDailyPage}
                />
              </div>
            </>
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                    {monthlyData.closings.slice((monthlyPage - 1) * ITEMS_PER_PAGE, monthlyPage * ITEMS_PER_PAGE).map((mc) => (
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

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {monthlyData.closings.slice((monthlyPage - 1) * ITEMS_PER_PAGE, monthlyPage * ITEMS_PER_PAGE).map((mc) => (
                  <div key={mc.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-[#1B2A4A] text-sm">{mc.branch?.name || "—"}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(mc.year, mc.month - 1).toLocaleDateString("en-PK", {
                            month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Closed
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                      <div>
                        <p className="text-gray-400 text-xs">Sales</p>
                        <p className="text-xs font-medium">{formatMoney(mc.totalSales)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Expenses</p>
                        <p className="text-xs font-medium">{formatMoney(mc.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Bachat</p>
                        <p className="text-xs font-bold text-green-600">{formatMoney(mc.netBachat)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-2">
                <PaginationBar
                  currentPage={monthlyPage}
                  totalItems={monthlyData.closings.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setMonthlyPage}
                />
              </div>
            </>
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
                className={`${filterSelect} w-full md:w-auto`}
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
                className={`${filterSelect} w-full md:w-auto`}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From"
              />
              <input
                type="date"
                className={`${filterSelect} w-full md:w-auto`}
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {paymentRows.map((row, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-[#1B2A4A] text-sm">{vendorLedger?.vendor.name}</p>
                        <p className="text-gray-400 text-xs">{row.branch?.name || "—"}</p>
                      </div>
                      <span className="text-green-700 font-bold text-sm">{formatMoney(row.amount)}</span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2 leading-snug">{row.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-400 text-xs">
                        {format(new Date(row.date), "d MMM yyyy")}
                      </span>
                      {row.source && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600">
                          {row.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
