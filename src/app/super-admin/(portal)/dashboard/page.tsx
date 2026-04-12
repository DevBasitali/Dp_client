"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Loader2, Users, Clock, Store, Package, UserCog, ShoppingCart } from "lucide-react";

interface Stats {
  totalOwners: number;
  pendingApprovals: number;
  totalBranches: number;
  totalVendors: number;
  totalUsers: number;
  totalOrders: number;
}

interface PendingOwner {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface RecentOwner {
  id: number;
  name: string;
  email: string;
  status: string;
  branchCount: number;
  userCount: number;
  created_at: string;
}

interface DashboardData {
  stats: Stats;
  pendingOwners: PendingOwner[];
  recentOwners: RecentOwner[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold ${accent ? "text-amber-500" : "text-[#1B2A4A]"}`}>
            {value ?? "—"}
          </p>
        </div>
        <div
          className={`p-2 rounded-lg ${
            accent ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-[#1B2A4A]"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
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

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["sa-dashboard"],
    queryFn: async () => {
      const res = await saApi.get("/super-admin/dashboard");
      return res.data?.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      saApi.put(`/super-admin/owners/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sa-pending-count"] });
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: number) => saApi.put(`/super-admin/owners/${id}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sa-pending-count"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500 text-sm font-medium">
        Failed to load dashboard data.
      </div>
    );
  }

  const stats = data?.stats;
  const pendingOwners = data?.pendingOwners ?? [];
  const recentOwners = data?.recentOwners ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#1B2A4A]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">System overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Owners" value={stats?.totalOwners} icon={Users} />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingApprovals}
          icon={Clock}
          accent={(stats?.pendingApprovals ?? 0) > 0}
        />
        <StatCard label="Total Branches" value={stats?.totalBranches} icon={Store} />
        <StatCard label="Total Vendors" value={stats?.totalVendors} icon={Package} />
        <StatCard label="Total Users" value={stats?.totalUsers} icon={UserCog} />
        <StatCard label="Total Orders" value={stats?.totalOrders} icon={ShoppingCart} />
      </div>

      {/* Pending Approvals */}
      {pendingOwners.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Approvals
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingOwners.length}
            </span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Signup Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                        {owner.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{owner.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(owner.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveMutation.mutate(owner.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => banMutation.mutate(owner.id)}
                            disabled={banMutation.isPending}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Ban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Recent Owners */}
      <section>
        <h2 className="text-base font-semibold text-[#1B2A4A] mb-3">
          Recent Owners
        </h2>
        {recentOwners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No owners yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Branches
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                        {owner.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{owner.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={owner.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {owner.branchCount ?? 0}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {owner.userCount ?? 0}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(owner.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
