"use client";

import { PackageOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ItemsComingSoonPage() {
  return (
    <div className="space-y-6 lg:p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <PackageOpen className="mr-2 text-[#F0A500]" />
          Items Catalog
        </h1>
        <p className="text-gray-500 text-sm">Manage inventory catalog and pricing margins.</p>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col justify-center items-center h-64 text-gray-400 bg-gray-50">
            <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-[#1B2A4A] mb-2">Coming Soon</h2>
            <p className="text-center max-w-sm">
              The Items module is currently under development and will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
