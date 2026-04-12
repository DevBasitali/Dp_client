"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Loader2, ArrowLeft } from "lucide-react";

interface OwnerInfo {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Branch {
  id: number;
  name: string;
  location?: string;
  created_at: string;
}

interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface DailyClosing {
  id: number;
  date: string;
  cash_in_hand: string | number;
  total_sales: string | number;
  branch?: { name: string };
}

interface VendorBalance {
  vendor_id: number;
  vendor_name: string;
  outstanding_balance: string | number;
}

interface OwnerData {
  owner: OwnerInfo;
  branches: Branch[];
  vendors: Vendor[];
  users: User[];
  recentDailyClosings: DailyClosing[];
  vendorBalances: VendorBalance[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    banned: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
        map[status?.toLowerCase()] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(val: string | number | undefined) {
  if (val == null) return "—";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return "Rs. " + num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-[#1B2A4A]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-4 py-6 text-center text-gray-400 text-sm"
      >
        No records found.
      </td>
    </tr>
  );
}

export default function OwnerDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, isError } = useQuery<OwnerData>({
    queryKey: ["sa-owner-data", id],
    queryFn: async () => {
      const res = await saApi.get(`/super-admin/owners/${id}/data`);
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-red-500 text-sm font-medium">
        Failed to load owner data.
      </div>
    );
  }

  const { owner, branches, vendors, users, recentDailyClosings, vendorBalances } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/super-admin/owners"
          className="text-gray-400 hover:text-[#1B2A4A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1B2A4A]">Owner Data</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full snapshot</p>
        </div>
      </div>

      {/* Owner info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">{owner.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{owner.email}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={owner.status} />
            <p className="text-xs text-gray-400 mt-1.5">
              Joined {formatDate(owner.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <SectionCard title={`Branches (${branches?.length ?? 0})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!branches?.length ? (
                <EmptyRow cols={3} />
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                      {b.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {b.location ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(b.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Vendors */}
      <SectionCard title={`Vendors (${vendors?.length ?? 0})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!vendors?.length ? (
                <EmptyRow cols={4} />
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                      {v.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(v.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Users */}
      <SectionCard title={`Users (${users?.length ?? 0})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!users?.length ? (
                <EmptyRow cols={4} />
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">
                      {u.role?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Recent Daily Closings */}
      <SectionCard title="Recent Daily Closings (Last 10)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cash in Hand
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!recentDailyClosings?.length ? (
                <EmptyRow cols={4} />
              ) : (
                recentDailyClosings.map((dc) => (
                  <tr key={dc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(dc.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {dc.branch?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#1B2A4A]">
                      {formatMoney(dc.total_sales)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#1B2A4A]">
                      {formatMoney(dc.cash_in_hand)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Vendor Outstanding Balances */}
      <SectionCard title="Vendor Outstanding Balances">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Outstanding Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!vendorBalances?.length ? (
                <EmptyRow cols={2} />
              ) : (
                vendorBalances.map((vb) => (
                  <tr key={vb.vendor_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                      {vb.vendor_name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatMoney(vb.outstanding_balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
