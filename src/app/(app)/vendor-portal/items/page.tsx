"use client";

import { useVendorPortalItems } from "@/hooks/useVendorPortal";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PackageOpen, Loader2 } from "lucide-react";

export default function VendorItemsPage() {
  const { user } = useAuthStore();
  const { data: items, isLoading, isError } = useVendorPortalItems(user?.vendorId);

  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  return (
    <div className="space-y-6 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <PackageOpen className="mr-2 text-[#F0A500]" />
          My Catalog Items
        </h1>
        <p className="text-gray-500 text-sm">View items currently supplied to Dollar Point.</p>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load your items. Please try again.
            </div>
          ) : items?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <PackageOpen className="w-12 h-12 text-gray-200 mb-2" />
              <p>No items found under your catalog.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Item Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Cost Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.category || "—"}</TableCell>
                      <TableCell className="text-right text-gray-600 font-medium">
                        {formatMoney(item.cost_price)}
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
