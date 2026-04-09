"use client";

import { useItemMarginsReport, useAuditLog } from "@/hooks/useReports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2, ArrowUpRight, Activity } from "lucide-react";
import { format } from "date-fns";

export default function ReportsPage() {
  const { data: itemMargins, isLoading: isLoadingMargins } = useItemMarginsReport();
  const { data: auditLogs, isLoading: isLoadingLogs } = useAuditLog();

  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  return (
    <div className="space-y-8 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <BarChart3 className="mr-2 text-[#F0A500]" />
          Financial & Audit Reports
        </h1>
        <p className="text-gray-500 text-sm">System-wide analytics and comprehensive activity tracking.</p>
      </div>

      {/* Item Margin Report Section */}
      <Card className="shadow-sm border-0 border-t-4 border-t-[#F0A500]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <ArrowUpRight className="w-5 h-5 mr-2 text-[#F0A500]" />
            High-Margin Items Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingMargins ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]"/></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Item Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Cost Price</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Selling Price</TableHead>
                    <TableHead className="text-right font-semibold text-blue-700">Margin (PKR)</TableHead>
                    <TableHead className="text-right font-semibold text-blue-700">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemMargins?.slice(0, 10).map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-[#1A1A2E]">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.vendor?.name || "—"}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatMoney(item.cost_price)}</TableCell>
                      <TableCell className="text-right text-[#1A1A2E] font-medium">{formatMoney(item.selling_price)}</TableCell>
                      <TableCell className="text-right font-bold text-blue-700 bg-blue-50/50">
                        {formatMoney(item.margin)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-700 bg-blue-50/50">
                        {item.margin_percent?.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {itemMargins?.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">No data found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card className="shadow-sm border-0 border-t-4 border-t-[#1B2A4A] mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#1B2A4A]" />
            System Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLogs ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]"/></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Timestamp</TableHead>
                    <TableHead className="font-semibold text-gray-700">User</TableHead>
                    <TableHead className="font-semibold text-gray-700">Action</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50">
                      <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                        {format(new Date(log.created_at), "dd MMM yyyy, hh:mm a")}
                      </TableCell>
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {log.user?.name || "System"}
                        <span className="block text-xs font-normal text-gray-500 uppercase">{log.user?.role}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">{log.description}</TableCell>
                    </TableRow>
                  ))}
                  {auditLogs?.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-gray-500">No logs found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
