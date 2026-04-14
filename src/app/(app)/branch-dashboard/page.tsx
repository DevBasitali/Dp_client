"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, ClipboardList, CalendarX2, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMonthlyClosings, useCloseMonth } from "@/hooks/useMonthlyClosings";

export default function BranchDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("default", { month: "long" });

  const { data, isLoading: loadingStatus, refetch } = useMonthlyClosings();
  const closeMonth = useCloseMonth();

  const myBranchStatus = data?.currentMonth?.branches?.[0] ?? null;
  const isAlreadyClosed = myBranchStatus?.status === "CLOSED";

  const handleCloseMonthClick = () => {
    if (isAlreadyClosed) {
      toast.info("This month is already closed.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmClose = () => {
    closeMonth.mutate(
      { month: currentMonth, year: currentYear },
      {
        onSuccess: (res) => {
          setShowConfirmDialog(false);
          const bachat = res?.data?.netBachat;
          const formatted = bachat !== undefined
            ? `Rs. ${Number(bachat).toLocaleString("en-PK")}`
            : "";
          toast.success(
            `${monthName} ${currentYear} closed successfully!${formatted ? `\nNet Bachat: ${formatted}` : ""}`
          );
          refetch();
        },
        onError: (err: unknown) => {
          setShowConfirmDialog(false);
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to close month.";
          toast.error(message);
        },
      }
    );
  };

  const formatMoney = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "—";
    return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Branch Home</h1>
        <p className="text-gray-500">Welcome, {user?.name}</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            className="h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white flex justify-start px-4"
            onClick={() => router.push('/vendor-orders')}
          >
            <Package className="w-5 h-5 mr-3 text-[#F0A500]" />
            Send Inventory Request
          </Button>
          <Button
            className="h-14 bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50 flex justify-start px-4"
            onClick={() => router.push('/daily-closings/new')}
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            Enter Daily Sales
          </Button>
          <Button
            className="h-14 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 flex justify-start px-4"
            onClick={() => router.push('/vendors')}
          >
            <FileText className="w-5 h-5 mr-3" />
            View Vendor Ledger
          </Button>
          <Button
            className="h-14 bg-white border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50 flex justify-start px-4"
            onClick={handleCloseMonthClick}
            disabled={loadingStatus}
          >
            <CalendarX2 className="w-5 h-5 mr-3" />
            Close Month
          </Button>
        </div>
      </div>

      {/* Month Status Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1A1A2E]">Month Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-[#1A1A2E]">
                  {monthName} {currentYear}
                </p>
                {myBranchStatus?.status === "CLOSED" ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Net Bachat: {formatMoney(myBranchStatus.bachat)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600 mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">
                      {myBranchStatus?.dailyCount ?? 0} daily {(myBranchStatus?.dailyCount ?? 0) === 1 ? "entry" : "entries"} recorded this month
                    </span>
                  </div>
                )}
              </div>
              {myBranchStatus?.status === "CLOSED" ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">
                  CLOSED
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 w-fit">
                  OPEN
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Card */}
      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Today's Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
            <p className="text-gray-500 mb-3">No sales entered for today yet.</p>
            <Button
              size="sm"
              className="bg-[#1B2A4A]"
              onClick={() => router.push('/daily-closings/new')}
            >
              Enter Daily Sales
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-gray-400">
            Your recent requests and payments will appear here.
          </div>
        </CardContent>
      </Card>

      {/* Confirm Close Month Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close {monthName} {currentYear}?</DialogTitle>
            <DialogDescription className="space-y-1 pt-1">
              <span className="block">
                Close {monthName} {currentYear} for {user?.name}&apos;s branch?
              </span>
              <span className="block">
                This will lock all daily entries for this month.
                Make sure all daily closings are entered correctly.
              </span>
              <span className="block font-medium text-red-600">
                This cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={closeMonth.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B2A4A] hover:bg-slate-800 text-white"
              onClick={handleConfirmClose}
              disabled={closeMonth.isPending}
            >
              {closeMonth.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                "Yes, Close Month"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
