"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Loader2 } from "lucide-react";
import PaginationBar from "@/components/ui/pagination-bar";

interface Owner {
  id: string;
  name: string;
  email: string;
  accountStatus: string;
  is_active: boolean;
  created_at: string;
}

type FilterTab = "all" | "approved" | "pending" | "banned";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending:  "bg-amber-100 text-amber-700",
    banned:   "bg-red-100 text-red-700",
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

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "banned",   label: "Banned" },
];

export default function SuperAdminOwnersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const { data, isLoading, isError } = useQuery<Owner[]>({
    queryKey: ["sa-owners"],
    queryFn: async () => {
      const res = await saApi.get("/super-admin/owners");
      return res.data?.data?.owners ?? res.data?.data ?? [];
    },
  });

  const mutationOpts = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-owners"] });
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sa-pending-count"] });
    },
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => saApi.put(`/super-admin/owners/${id}/approve`),
    ...mutationOpts,
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => saApi.put(`/super-admin/owners/${id}/ban`),
    ...mutationOpts,
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => saApi.put(`/super-admin/owners/${id}/unban`),
    ...mutationOpts,
  });

  const owners = data ?? [];

  const filtered = owners.filter((o) => {
    if (activeTab === "all") return true;
    return o.accountStatus?.toLowerCase() === activeTab;
  });

  const counts = {
    all:      owners.length,
    pending:  owners.filter((o) => o.accountStatus?.toLowerCase() === "pending").length,
    approved: owners.filter((o) => o.accountStatus?.toLowerCase() === "approved").length,
    banned:   owners.filter((o) => o.accountStatus?.toLowerCase() === "banned").length,
  };

  const isActionPending =
    approveMutation.isPending || banMutation.isPending || unbanMutation.isPending;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1B2A4A]">Owners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all owner accounts</p>
        </div>
        <Link
          href="/super-admin/create-owner"
          className="w-full md:w-auto px-4 py-2 bg-[#1B2A4A] text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors text-center"
        >
          + Create Owner
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px shrink-0 ${
              activeTab === tab.key
                ? "border-[#1B2A4A] text-[#1B2A4A]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500 text-sm font-medium">
          Failed to load owners.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No owners found.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Name", "Email", "Status", "Joined", "Actions"].map((h) => (
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
                  {filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((owner) => {
                    const status = owner.accountStatus?.toLowerCase();
                    return (
                      <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1B2A4A]">{owner.name}</td>
                        <td className="px-4 py-3 text-gray-500">{owner.email}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={owner.accountStatus} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(owner.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {status === "pending" && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate(owner.id)}
                                  disabled={isActionPending}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => banMutation.mutate(owner.id)}
                                  disabled={isActionPending}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  Ban
                                </button>
                              </>
                            )}
                            {status === "approved" && (
                              <button
                                onClick={() => banMutation.mutate(owner.id)}
                                disabled={isActionPending}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                Ban
                              </button>
                            )}
                            {status === "banned" && (
                              <button
                                onClick={() => unbanMutation.mutate(owner.id)}
                                disabled={isActionPending}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                Unban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden space-y-3">
            {filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((owner) => {
              const status = owner.accountStatus?.toLowerCase();
              return (
                <div key={owner.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {owner.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1B2A4A] text-sm">{owner.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{owner.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={owner.accountStatus} />
                  </div>

                  <div className="text-xs text-gray-400 mb-3">
                    Joined: {formatDate(owner.created_at)}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(owner.id)}
                          disabled={isActionPending}
                          className="flex-1 py-2 rounded-lg text-xs font-medium bg-green-600 text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => banMutation.mutate(owner.id)}
                          disabled={isActionPending}
                          className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-600 text-white disabled:opacity-50"
                        >
                          Ban
                        </button>
                      </>
                    )}
                    {status === "approved" && (
                      <button
                        onClick={() => banMutation.mutate(owner.id)}
                        disabled={isActionPending}
                        className="flex-1 py-2 rounded-lg text-xs font-medium border border-red-300 text-red-600 disabled:opacity-50"
                      >
                        Ban
                      </button>
                    )}
                    {status === "banned" && (
                      <button
                        onClick={() => unbanMutation.mutate(owner.id)}
                        disabled={isActionPending}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-green-600 text-white disabled:opacity-50"
                      >
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <PaginationBar
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
