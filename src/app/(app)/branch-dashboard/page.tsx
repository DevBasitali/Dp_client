"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, FileText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BranchDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Branch Home</h1>
        <p className="text-gray-500">Welcome, {user?.name}</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            className="h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white flex justify-start px-4"
            onClick={() => router.push('/vendor-orders/new')}
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
        </div>
      </div>

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
    </div>
  );
}
