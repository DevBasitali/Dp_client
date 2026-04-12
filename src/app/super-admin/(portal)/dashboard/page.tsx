"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Loader2, Users, Clock, ShieldOff, CheckCircle2 } from "lucide-react";

interface Stats {
  totalOwners: number;
  pendingApprovals: number;
  bannedOwners: number;
  activeOwners: number;
}

interface PendingOwner {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface DashboardData {
  stats: Stats;
  pendingOwners: PendingOwner[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  variant,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  accent?: boolean;
  variant?: "amber" | "red" | "green";
}) {
  const colors = {
    amber: { text: "text-amber-500", bg: "bg-amber-50 text-amber-500" },
    red:   { text: "text-red-500",   bg: "bg-red-50 text-red-500" },
    green: { text: "text-green-600", bg: "bg-green-50 text-green-600" },
  };
  const c = variant ? colors[variant] : null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c ? c.text : "text-[#1B2A4A]"}`}>
            {value ?? "—"}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${c ? c.bg : "bg-slate-100 text-[#1B2A4A]"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
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
    mutationFn: (id: string) => saApi.put(`/super-admin/owners/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sa-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["sa-owners"] });
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => saApi.put(`/super-admin/owners/${id}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sa-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["sa-owners"] });
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
  const isActionPending = approveMutation.isPending || banMutation.isPending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#1B2A4A]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Owner accounts overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Owners" value={stats?.totalOwners} icon={Users} />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingApprovals}
          icon={Clock}
          variant={(stats?.pendingApprovals ?? 0) > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Active Owners"
          value={stats?.activeOwners}
          icon={CheckCircle2}
          variant="green"
        />
        <StatCard
          label="Banned Owners"
          value={stats?.bannedOwners}
          icon={ShieldOff}
          variant={(stats?.bannedOwners ?? 0) > 0 ? "red" : undefined}
        />
      </div>

      {/* Pending Approvals */}
      {pendingOwners.length > 0 ? (
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
                    {["Name", "Email", "Signup Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                          h === "Actions" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">{owner.name}</td>
                      <td className="px-4 py-3 text-gray-500">{owner.email}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(owner.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveMutation.mutate(owner.id)}
                            disabled={isActionPending}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => banMutation.mutate(owner.id)}
                            disabled={isActionPending}
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
      ) : (
        <section>
          <h2 className="text-base font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Pending Approvals
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No pending approvals.
          </div>
        </section>
      )}
    </div>
  );
}
