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
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs mt-1">Orders from branches will appear here.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {orders?.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-[#1B2A4A] text-sm">{order.branch?.name || "—"}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {format(new Date(order.created_at), "d MMM yyyy")}
                        </p>
                      </div>
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                        {order.items?.length || 0} items
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {item.item_name}: {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.pdf_url && (
                      <div className="flex justify-end pt-3 border-t border-gray-100">
                        <a
                          href={order.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1B2A4A] text-white"
                        >
                          View PDF
                        </a>
                      </div>
                    )}
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
