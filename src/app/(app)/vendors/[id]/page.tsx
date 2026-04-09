"use client";

import { use } from "react";
import { useVendor } from "@/hooks/useVendors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Phone, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VendorLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data: vendor, isLoading, isError } = useVendor(id);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" /></div>;
  }

  if (isError || !vendor) {
    return <div className="text-center mt-10 text-red-500">Error loading vendor details.</div>;
  }

  return (
    <div className="space-y-6 lg:p-4">
      {/* Header and Back navigation */}
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{vendor.name}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-green-600"/> {vendor.whatsapp_number}</span>
            {vendor.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</span>}
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{vendor.category || "General"}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards directly inspired from spec */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">₨ 0</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₨ 0</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Balance Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₨ 0</div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders for Future Implementation Sections */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Purchase Bills & Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
              Payments Module Pending Implementation
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Items Supplied Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
              Items Module Pending Implementation
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
