"use client";

import { useVendorPortalOrders } from "@/hooks/useVendorPortal";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, Download } from "lucide-react";
import { format } from "date-fns";

export default function VendorOrdersHistoryPage() {
  const { user } = useAuthStore();
  const { data: orders, isLoading, isError } = useVendorPortalOrders(user?.vendorId);

  return (
    <div className="space-y-6 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <ClipboardList className="mr-2 text-[#F0A500]" />
          My Incoming Orders
        </h1>
        <p className="text-gray-500 text-sm">Download official PDF requests sent by branches.</p>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load order history. Please try again.
            </div>
          ) : orders?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <ClipboardList className="w-12 h-12 text-gray-200 mb-2" />
              <p>No orders bound to your account yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Date Received</TableHead>
                    <TableHead className="font-semibold text-gray-700">Branch Requesting</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Items Count</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {format(new Date(order.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {order.branch?.name || "—"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.pdf_url ? (
                          <a 
                            href={order.pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 shadow-sm text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF Copy
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Processing</span>
                        )}
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
