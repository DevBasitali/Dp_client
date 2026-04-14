"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useDailySummary } from "@/hooks/useDailyClosings";
import { useCloseMonth } from "@/hooks/useMonthlyClosings";
import { useBranches } from "@/hooks/useBranches";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CloseMonthPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  const { data: branches } = useBranches();
  const closeMutation = useCloseMonth();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [branchId, setBranchId] = useState<string>(isManager ? (user.branchId || "") : "");
  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);

  const { data: summary, isLoading: isLoadingSummary } = useDailySummary({ 
    branchId: branchId || undefined, 
    month, 
    year 
  });

  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  const handleCloseMonth = () => {
    if (!branchId) return alert("Please select a branch");
    if (!summary || summary.days_recorded === 0) return alert("Cannot close a month with zero entries");

    const confirmMsg = `Are you absolutely sure you want to CLOSE this month? \n\nNo further daily closings can be added or edited for ${month}/${year}.`;
    if (!confirm(confirmMsg)) return;

    closeMutation.mutate({ branchId: branchId, month, year }, {
      onSuccess: () => {
        router.push("/monthly-closings");
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Failed to close month. Ensure it isn't already closed.");
      }
    });
  };

  return (
    <div className="space-y-6 lg:p-4 max-w-3xl mx-auto pb-24">
      <div className="flex items-center space-x-4">
        <Link href="/branch-dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-black">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            Close Month
          </h1>
          <p className="text-gray-500 text-sm">Lock the month and calculate final branch Bachat.</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!isManager && (
                <div className="space-y-2 md:col-span-1">
                  <Label>Branch</Label>
                  <Select value={branchId} onValueChange={(val: string | null) => val && setBranchId(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={month.toString()} onValueChange={(val: string | null) => val && setMonth(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year.toString()} onValueChange={(val: string | null) => val && setYear(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                <strong>Warning:</strong> Once you close this month, no more daily entries can be added or edited. This action cannot be undone. Make sure all registers are clear before proceeding.
              </p>
            </div>
          </CardContent>
        </Card>

        {branchId ? (
          <Card className="shadow-sm border-0 bg-white overflow-hidden">
            <div className="bg-[#1B2A4A] px-6 py-4">
              <h3 className="text-white font-semibold">Monthly Calculation Preview</h3>
            </div>
            <CardContent className="p-0">
              {isLoadingSummary ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
                </div>
              ) : summary ? (
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Days Recorded</p>
                      <p className="text-2xl font-bold text-[#1A1A2E]">{summary.days_recorded || 0} / 31</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Combined Sales</p>
                      <p className="text-2xl font-bold text-[#1A1A2E] tracking-tight">{formatMoney(summary.total_sales)}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Cash Collected</span>
                      <span className="font-semibold">{formatMoney(summary.total_cash_sales)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">EasyPaisa Digital</span>
                      <span className="font-semibold">{formatMoney(summary.total_easypaisa_sales)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-600">
                      <span>Total Expenses</span>
                      <span className="font-semibold">-{formatMoney(summary.total_expenses)}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 border-t-2 border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-1">Final Net Bachat (Profit)</p>
                    <p className="text-4xl lg:text-5xl font-black text-green-700 tracking-tighter">
                      {formatMoney(summary.net_total || summary.net_bachat)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  No data found for this period.
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 text-gray-400">Select a branch to view preview.</div>
        )}

        {/* Fixed bottom bar for Mobile-first pattern */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-3xl mx-auto flex justify-end">
            <Button 
              onClick={handleCloseMonth}
              className="w-full md:w-64 h-14 bg-red-600 hover:bg-red-700 text-white shadow-xl md:shadow-md"
              disabled={closeMutation.isPending || !summary || summary.days_recorded === 0}
            >
              {closeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Locking...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Close & Lock Month
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
