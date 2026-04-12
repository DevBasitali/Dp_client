"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OwnerDataPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/super-admin/owners");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]" />
    </div>
  );
}
