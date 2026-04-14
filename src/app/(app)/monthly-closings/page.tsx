"use client";

import { useState } from "react";
import { useMonthlyClosings, useCloseMonth, BranchMonthStatus } from "@/hooks/useMonthlyClosings";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MonthlyClosingsPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  const isOwner = user?.role === "owner";

  const { data, isLoading, isError } = useMonthlyClosings();
  const closeMonth = useCloseMonth();

  const [confirmBranch, setConfirmBranch] = useState<BranchMonthStatus | null>(null);

  const formatMoney = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "—";
    return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
  };

  const getMonthName = (m: number) =>
    new Date(0, m - 1).toLocaleString("default", { month: "long" });

  const currentMonthLabel = data?.currentMonth
    ? `${getMonthName(data.currentMonth.month)} ${data.currentMonth.year}`
    : "";

  const handleCloseMonth = () => {
    if (!confirmBranch || !data?.currentMonth) return;
    closeMonth.mutate(
      {
        month: data.currentMonth.month,
        year: data.currentMonth.year,
        branchId: confirmBranch.branchId,
      },
      {
        onSuccess: () => {
          toast.success(
            `${confirmBranch.branchName} — ${getMonthName(data.currentMonth.month)} ${data.currentMonth.year} closed!`
          );
          setConfirmBranch(null);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to close month.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="space-y-6 lg:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <CalendarCheck className="mr-2 text-[#F0A500]" />
            Monthly Closings
          </h1>
          <p className="text-gray-500 text-sm">
            {isManager ? "View locked monthly statements." : "View all monthly profit/bachat logic."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-48 text-red-500">
          Failed to load monthly closings. Please try again.
        </div>
      ) : (
        <>
          {/* Current Month Section */}
          {data?.currentMonth && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                {currentMonthLabel} — Current Month
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.currentMonth.branches.map((branch) => (
                  <Card key={branch.branchId} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-[#1A1A2E] text-sm">
                          {branch.branchName}
                        </span>
                        {branch.status === "CLOSED" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            CLOSED
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                            PENDING
                          </Badge>
                        )}
                      </div>
                      {branch.status === "CLOSED" ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm font-medium">
                              Net Bachat: {formatMoney(branch.bachat)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Total Sales: {formatMoney(branch.totalSales)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center text-amber-600">
                            <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm">Not closed yet</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Daily entries this month: {branch.dailyCount}
                          </p>
                          {isOwner && (
                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                className="bg-[#1B2A4A] hover:bg-[#243660] text-white text-xs h-7 px-3"
                                onClick={() => setConfirmBranch(branch)}
                              >
                                Close This Month →
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Months Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Past Months
            </h2>
            <Card className="shadow-sm border-0 overflow-hidden">
              <CardContent className="p-0">
                {!data?.closings?.length ? (
                  <div className="flex flex-col justify-center items-center h-48 text-gray-500">
                    <CalendarCheck className="w-12 h-12 text-gray-200 mb-2" />
                    <p>No monthly closings locked yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Month</TableHead>
                          {!isManager && (
                            <TableHead className="font-semibold text-gray-700">Branch</TableHead>
                          )}
                          <TableHead className="font-semibold text-gray-700 text-right">
                            Total Sales
                          </TableHead>
                          <TableHead className="font-semibold text-red-600 text-right">
                            Total Expenses
                          </TableHead>
                          <TableHead className="font-semibold text-green-700 text-right">
                            Net Bachat
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">
                            Date Locked
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.closings.map((closing) => (
                          <TableRow
                            key={closing.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <TableCell className="font-medium text-[#1A1A2E]">
                              {getMonthName(closing.month)} {closing.year}
                            </TableCell>
                            {!isManager && (
                              <TableCell className="text-gray-600">
                                {closing.branch?.name || "—"}
                              </TableCell>
                            )}
                            <TableCell className="text-right text-gray-600">
                              {formatMoney(closing.totalSales)}
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-medium font-mono text-sm tracking-tighter">
                              -{formatMoney(closing.totalExpenses)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-700 bg-green-50/30">
                              {formatMoney(closing.netBachat)}
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-500">
                              {closing.closedAt
                                ? format(new Date(closing.closedAt), "dd MMM yyyy")
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Confirm Close Month Dialog */}
      <Dialog open={!!confirmBranch} onOpenChange={(open) => { if (!open) setConfirmBranch(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              Close {currentMonthLabel} for {confirmBranch?.branchName}?
            </DialogTitle>
            <DialogDescription>
              This will lock all daily entries. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmBranch(null)}
              disabled={closeMonth.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B2A4A] hover:bg-[#243660] text-white"
              onClick={handleCloseMonth}
              disabled={closeMonth.isPending}
            >
              {closeMonth.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
