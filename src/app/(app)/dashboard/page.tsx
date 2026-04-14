"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, ShoppingCart, Store, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardStats {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  todaysSales: number;
  activeBranches: number;
}

interface BranchSalesRow {
  branchId: string;
  branchName: string;
  todaySales: number;
  thisMonthSales: number;
  thisMonthBachat: number | null;
  monthStatus: "open" | "closed";
}

interface VendorOutstandingRow {
  vendorId: string;
  vendorName: string;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
}

interface DashboardData {
  stats: DashboardStats;
  branchSalesOverview: BranchSalesRow[];
  vendorOutstanding: VendorOutstandingRow[];
}

const formatMoney = (amount: number) =>
  `Rs. ${Number(amount).toLocaleString("en-PK")}`;

function SkeletonCard() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard-owner"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/owner");
      return data.data as DashboardData;
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const hasAnyData =
    data &&
    (data.branchSalesOverview.length > 0 || data.vendorOutstanding.length > 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Owner Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || "Admin"}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Outstanding
                </CardTitle>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    (data?.stats.totalOutstanding ?? 0) > 0
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {formatMoney(data?.stats.totalOutstanding ?? 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Across all vendors</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Paid This Month
                </CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(data?.stats.totalPaidThisMonth ?? 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Sum of payments</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-[#1B2A4A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Today&apos;s Sales
                </CardTitle>
                <ShoppingCart className="w-4 h-4 text-[#1B2A4A]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1B2A4A]">
                  {formatMoney(data?.stats.todaysSales ?? 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">All branches</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-[#F0A500]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Branches
                </CardTitle>
                <Store className="w-4 h-4 text-[#F0A500]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A1A2E]">
                  {data?.stats.activeBranches ?? 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">Managed locations</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Loading state for tables */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center justify-center h-32 text-red-500">
            Failed to load dashboard data. Please refresh the page.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && !hasAnyData && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-48 text-gray-400 text-center gap-2">
            <Store className="w-12 h-12 text-gray-200" />
            <p className="font-medium">No data yet.</p>
            <p className="text-sm">
              Add branches and start recording daily closings to see your
              dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tables */}
      {!isLoading && !isError && hasAnyData && (
        <div className="space-y-6">
          {/* Branch Sales Overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Branch Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.branchSalesOverview.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                  No branch data available.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Branch</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Today&apos;s Sales</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">This Month Sales</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">This Month Bachat</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.branchSalesOverview.map((row) => (
                          <TableRow key={row.branchId} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-[#1A1A2E]">{row.branchName}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-gray-700">{formatMoney(row.todaySales)}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-gray-700">{formatMoney(row.thisMonthSales)}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-gray-700">
                              {row.thisMonthBachat !== null ? formatMoney(row.thisMonthBachat) : <span className="text-gray-400">—</span>}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.monthStatus === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {row.monthStatus === "open" ? "Open" : "Closed"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="block md:hidden p-4 space-y-3">
                    {data.branchSalesOverview.map((row) => (
                      <div key={row.branchId} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-[#1B2A4A]">{row.branchName}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${row.monthStatus === "closed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {row.monthStatus === "closed" ? "Closed" : "Open"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Today</p>
                            <p className="font-medium">{formatMoney(row.todaySales)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">This Month</p>
                            <p className="font-medium">{formatMoney(row.thisMonthSales)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Bachat</p>
                            <p className="font-medium text-green-600">
                              {row.thisMonthBachat !== null ? formatMoney(row.thisMonthBachat) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vendor Outstanding */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Vendor Outstanding</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.vendorOutstanding.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                  No vendor data available.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Total Billed</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Total Paid</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.vendorOutstanding.map((row) => (
                          <TableRow key={row.vendorId} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-[#1A1A2E]">{row.vendorName}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-gray-700">{formatMoney(row.totalBilled)}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-gray-700">{formatMoney(row.totalPaid)}</TableCell>
                            <TableCell className={`text-right font-mono text-sm font-semibold ${row.outstandingBalance > 0 ? "text-red-600" : "text-gray-700"}`}>
                              {formatMoney(row.outstandingBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="block md:hidden p-4 space-y-3">
                    {data.vendorOutstanding.map((row) => (
                      <div key={row.vendorId} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-[#1B2A4A]">{row.vendorName}</h3>
                          <span className="text-red-600 font-bold text-sm">{formatMoney(row.outstandingBalance)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>Billed: {formatMoney(row.totalBilled)}</div>
                          <div>Paid: {formatMoney(row.totalPaid)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
