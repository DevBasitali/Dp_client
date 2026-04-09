"use client";

import { useMonthlyClosings } from "@/hooks/useMonthlyClosings";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Plus, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function MonthlyClosingsPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  const { data: closings, isLoading, isError } = useMonthlyClosings();

  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
  };

  const getMonthName = (m: number) => {
    return new Date(0, m - 1).toLocaleString('default', { month: 'long' });
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
        {isManager && (
          <Link href="/monthly-closings/new" className="w-full sm:w-auto">
            <Button className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto shadow-sm">
              <Lock className="w-4 h-4 mr-2" />
              Close Month
            </Button>
          </Link>
        )}
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load monthly closings. Please try again.
            </div>
          ) : closings?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <CalendarCheck className="w-12 h-12 text-gray-200 mb-2" />
              <p>No monthly closings locked yet.</p>
              {isManager && (
                <Link href="/monthly-closings/new">
                  <Button variant="link" className="text-[#1B2A4A]">
                    Close your first month
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Period</TableHead>
                    {!isManager && <TableHead className="font-semibold text-gray-700">Branch</TableHead>}
                    <TableHead className="font-semibold text-gray-700 text-right">Total Sales</TableHead>
                    <TableHead className="font-semibold text-red-600 text-right">Total Expenses</TableHead>
                    <TableHead className="font-semibold text-green-700 text-right">Net Bachat</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Date Locked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closings?.map((closing) => (
                    <TableRow key={closing.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {getMonthName(closing.month)} {closing.year}
                      </TableCell>
                      {!isManager && (
                        <TableCell className="text-gray-600">
                          {closing.branch?.name || "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-right text-gray-600">
                        {formatMoney(closing.total_sales)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium font-mono text-sm tracking-tighter">
                        -{formatMoney(closing.total_expenses)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700 bg-green-50/30">
                        {formatMoney(closing.net_bachat)}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">
                        {closing.closed_at ? format(new Date(closing.closed_at), "dd MMM yyyy") : "—"}
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
