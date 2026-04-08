"use client";

import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, ShoppingCart, Store } from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Owner Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || "Admin"}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Outstanding</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₨ 0</div>
            <p className="text-xs text-gray-400 mt-1">Across all vendors</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid This Month</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₨ 0</div>
            <p className="text-xs text-gray-400 mt-1">Sum of payments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-[#1B2A4A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Today's Sales</CardTitle>
            <ShoppingCart className="w-4 h-4 text-[#1B2A4A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">₨ 0</div>
            <p className="text-xs text-gray-400 mt-1">All branches</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-[#F0A500]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Branches</CardTitle>
            <Store className="w-4 h-4 text-[#F0A500]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A1A2E]">0</div>
            <p className="text-xs text-gray-400 mt-1">Managed locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-sm min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-lg">Branch Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-gray-400">
            Feature in development...
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-lg">Recent Inventory Requests</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-gray-400">
            No recent activity.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
