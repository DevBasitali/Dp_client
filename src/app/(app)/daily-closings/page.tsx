"use client";

import { useState } from "react";
import { useDailyClosings } from "@/hooks/useDailyClosings";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DailyClosingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isManager = user?.role === "branch_manager";
  const isOwner = user?.role === "owner";

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; date: string } | null>(null);

  const filters = isManager ? { branchId: user?.branchId ?? undefined } : {};
  const { data: closings, isLoading, isError } = useDailyClosings(filters);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/daily-closings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-closings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Daily closing deleted.");
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg =
        status === 409
          ? "This month is already closed."
          : status === 403
          ? "You can only delete your own entries."
          : "Failed to delete closing.";
      toast.error(msg);
      setDeleteTarget(null);
    },
  });

  const formatMoney = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-PK")}`;

  return (
    <div className="space-y-6 lg:p-4 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <Wallet className="mr-2 text-[#F0A500]" />
            Daily Closings
          </h1>
          <p className="text-gray-500 text-sm">
            {isManager ? "Track your branch daily closing records." : "View all branch daily records."}
          </p>
        </div>
        <Link href="/daily-closings/new" className="w-full sm:w-auto">
          <Button className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Closing
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/5" />
                  <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load daily closings. Please try again.
            </div>
          ) : closings?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <Wallet className="w-12 h-12 text-gray-200 mb-2" />
              <p>No closing records found.</p>
              <Link href="/daily-closings/new">
                <Button variant="link" className="text-[#1B2A4A]">
                  Enter your first daily closing
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      {!isManager && <TableHead className="font-semibold text-gray-700">Branch</TableHead>}
                      <TableHead className="font-semibold text-gray-700 text-right">Cash</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">EasyPaisa</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right text-[#1B2A4A]">Register</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right text-green-700">Physical to Box</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closings?.map((closing) => (
                      <TableRow key={closing.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-[#1A1A2E]">
                          {format(new Date(closing.closingDate), "dd MMM yyyy")}
                        </TableCell>
                        {!isManager && (
                          <TableCell className="text-gray-600">{closing.branch?.name || "—"}</TableCell>
                        )}
                        <TableCell className="text-right text-gray-600 font-mono text-sm">{formatMoney(Number(closing.cashSales))}</TableCell>
                        <TableCell className="text-right text-gray-600 font-mono text-sm">{formatMoney(Number(closing.easypaisaSales))}</TableCell>
                        <TableCell className="text-right font-bold text-[#1B2A4A] font-mono text-sm tracking-tight">{formatMoney(Number(closing.registerTotal))}</TableCell>
                        <TableCell className="text-right font-bold text-green-600 font-mono text-sm tracking-tight">{formatMoney(Number(closing.physicalToBox))}</TableCell>
                        <TableCell className="text-right p-2">
                          <div className="flex justify-end gap-1">
                            {(!isManager || format(new Date(closing.closingDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) ? (
                              <Link href={`/daily-closings/${closing.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="w-4 h-4 text-gray-500 hover:text-[#1B2A4A]" />
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                                <Pencil className="w-4 h-4 text-gray-300" />
                              </Button>
                            )}
                            {(isOwner || (isManager && closing.enteredBy === user?.userId)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteTarget({ id: closing.id, date: format(new Date(closing.closingDate), "dd MMM yyyy") })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="block md:hidden divide-y">
                {closings?.map((closing) => (
                  <div key={closing.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1A1A2E]">
                        {format(new Date(closing.closingDate), "dd MMM yyyy")}
                      </span>
                      {!isManager && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {closing.branch?.name || "—"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Cash</p>
                        <p className="font-medium">{formatMoney(Number(closing.cashSales))}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">EasyPaisa</p>
                        <p className="font-medium">{formatMoney(Number(closing.easypaisaSales))}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Register</p>
                        <p className="font-medium text-[#1B2A4A]">{formatMoney(Number(closing.registerTotal))}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Physical to Box</p>
                        <p className="font-medium text-green-600">{formatMoney(Number(closing.physicalToBox))}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      {(!isManager || format(new Date(closing.closingDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) ? (
                        <Link href={`/daily-closings/${closing.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                        </Link>
                      ) : null}
                      {(isOwner || (isManager && closing.enteredBy === user?.userId)) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => setDeleteTarget({ id: closing.id, date: format(new Date(closing.closingDate), "dd MMM yyyy") })}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Daily Closing</DialogTitle>
            <DialogDescription>
              Delete this closing for <strong>{deleteTarget?.date}</strong>?
              This will reverse the Cal Box balance and remove linked vendor payments.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
