"use client";

import { useDailyClosings } from "@/hooks/useDailyClosings";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DailyClosingsPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  // Filter natively if manager
  const filters = isManager ? { branchId: user.branchId ?? undefined } : {};
  const { data: closings, isLoading, isError } = useDailyClosings(filters);

  // Format money helper
  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
  };

  return (
    <div className="space-y-6 lg:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <Wallet className="mr-2 text-[#F0A500]" />
            Daily Closings
          </h1>
          <p className="text-gray-500 text-sm">
            {isManager ? "Track your branch daily closing records." : "View all branch daily records."}
          </p>
        </div>
        <Link href="/daily-closings/new" className="w-full sm:w-auto">
          <Button className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Closing
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load daily closings. Please try again.
            </div>
          ) : closings?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <Wallet className="w-12 h-12 text-gray-200 mb-2" />
              <p>No closing records found.</p>
              <Link href="/daily-closings/new">
                <Button variant="link" className="text-[#1B2A4A]">
                  Enter your first daily closing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    {!isManager && <TableHead className="font-semibold text-gray-700">Branch</TableHead>}
                    <TableHead className="font-semibold text-gray-700 text-right">Cash</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">EasyPaisa</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right text-red-600">Expenses</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Net Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closings?.map((closing) => (
                    <TableRow key={closing.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {format(new Date(closing.closing_date), "dd MMM yyyy")}
                      </TableCell>
                      {!isManager && (
                        <TableCell className="text-gray-600">
                          {closing.branch?.name || "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-right text-gray-600">
                        {formatMoney(closing.cash_sales)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatMoney(closing.easypaisa_sales)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium font-mono text-sm tracking-tighter">
                        -{formatMoney(closing.daily_expense)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#1B2A4A] tracking-tight">
                        {formatMoney(closing.net_total)}
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
  );
}
