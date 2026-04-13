"use client";

import { useState } from "react";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Loader2, Download, CheckCircle2, XCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function VendorOrdersPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (orderId: string) => {
    try {
      setDownloadingId(orderId);
      const { data } = await api.get(`/vendor-orders/${orderId}/download`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };
  
  // If manager, we might need to filter by their branch, 
  // but let's assume backend scopes it or we request it explicitly
  const { data: orders, isLoading, isError } = useVendorOrders(isManager ? user.branchId ?? undefined : undefined);

  return (
    <div className="space-y-6 lg:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <ClipboardList className="mr-2 text-[#F0A500]" />
            Vendor Orders
          </h1>
          <p className="text-gray-500 text-sm">
            {isManager ? "Manage orders placed to vendors." : "View all vendor orders across branches."}
          </p>
        </div>
        <Link href="/vendor-orders/new" className="w-full sm:w-auto">
          <Button className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Request
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
              Failed to load vendor orders. Please try again.
            </div>
          ) : orders?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <ClipboardList className="w-12 h-12 text-gray-200 mb-2" />
              <p>No vendor orders found.</p>
              <Link href="/vendor-orders/new">
                <Button variant="link" className="text-[#1B2A4A]">
                  Place your first order
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
                    <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Items</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">WhatsApp</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">
                        {format(new Date(order.created_at), "dd MMM yyyy")}
                      </TableCell>
                      {!isManager && (
                        <TableCell className="text-gray-600">
                          {order.branch?.name || "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-gray-600">
                        {order.vendor?.name || "—"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.whatsapp_sent ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {order.pdf_url ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 shadow-sm text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
                              onClick={() => handleDownload(order.id)}
                              disabled={downloadingId === order.id}
                            >
                              {downloadingId === order.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-1" />
                              )}
                              PDF
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Processing</span>
                          )}

                          {(!isManager || (new Date().getTime() - new Date(order.created_at).getTime()) < 5 * 60 * 60 * 1000) ? (
                            <Link href={`/vendor-orders/${order.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="w-4 h-4 text-gray-500 hover:text-[#1B2A4A]" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                              <Pencil className="w-4 h-4 text-gray-300" />
                            </Button>
                          )}
                        </div>
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
