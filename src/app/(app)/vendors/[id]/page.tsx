"use client";

import { use, useState, useEffect } from "react";
import { useVendor, useVendorLedger, useRecordInventory } from "@/hooks/useVendors";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Phone, MessageCircle, Plus, PackageOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface Branch {
  id: string;
  name: string;
}

const formatMoney = (amount: number) =>
  `Rs. ${Number(isNaN(amount) ? 0 : amount).toLocaleString("en-PK")}`;

export default function VendorLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";

  const isOwner = user?.role === "owner";

  const { data: vendor, isLoading, isError } = useVendor(id);
  const { data: ledgerData, isLoading: ledgerLoading } = useVendorLedger(id);
  const recordInventory = useRecordInventory();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await api.get('/branches');
        console.log('Branches response:', data);
        console.log('Branches loaded:', data.data || []);
        console.log('Branches count:', (data.data || []).length);
        setBranches(data.data || []);
      } catch (err) {
        console.error('Branches fetch error:', err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [invAmount, setInvAmount] = useState("");
  const [invDescription, setInvDescription] = useState("");
  // Branch manager: auto-fill from token. Owner: user selects.
  const [invBranchId, setInvBranchId] = useState<string | null>(
    isManager ? (user?.branchId ?? null) : null
  );
  const [invDate, setInvDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Derive branch name for read-only display (branch manager)
  const managerBranchName =
    branches.find((b) => b.id === user?.branchId)?.name ?? "Your Branch";

  const resetModal = () => {
    setInvAmount("");
    setInvDescription("");
    setInvBranchId(isManager ? (user?.branchId ?? null) : null);
    setInvDate(format(new Date(), "yyyy-MM-dd"));
  };

  const allLedger = ledgerData?.ledger ?? [];

  const filteredLedger =
    selectedBranch === "all"
      ? allLedger
      : allLedger.filter((row) => row.branch?.id === selectedBranch);

  const filteredBilled = filteredLedger
    .filter((r) => r.type === "INVENTORY")
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredPaid = filteredLedger
    .filter((r) => r.type === "PAYMENT")
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredBalance = filteredBilled - filteredPaid;

  const selectedBranchName =
    selectedBranch === "all"
      ? "All Branches"
      : (branches.find((b) => b.id === selectedBranch)?.name ?? "Branch");

  const handleRecordInventory = () => {
    const amount = parseFloat(invAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!invDescription.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (!invBranchId) {
      toast.error("Please select a branch.");
      return;
    }

    recordInventory.mutate(
      {
        vendorId: id,
        branchId: invBranchId,
        amount,
        description: invDescription.trim(),
        date: invDate,
      },
      {
        onSuccess: () => {
          toast.success("Inventory recorded successfully.");
          setShowInventoryModal(false);
          resetModal();
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg || "Failed to record inventory.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (isError || !vendor) {
    return <div className="text-center mt-10 text-red-500">Error loading vendor details.</div>;
  }

  return (
    <div className="space-y-6 lg:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{vendor.name}</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                {vendor.whatsapp_number}
              </span>
              {vendor.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {vendor.phone}
                </span>
              )}
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                {vendor.category || "General"}
              </span>
            </div>
          </div>
        </div>

        <Button
          className="bg-[#1B2A4A] hover:bg-slate-700 text-white"
          onClick={() => setShowInventoryModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Inventory
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{formatMoney(filteredBilled)}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatMoney(filteredPaid)}</div>
          </CardContent>
        </Card>
        <Card
          className={`border-0 shadow-sm ${
            filteredBalance > 0 ? "border-l-4 border-l-red-500 bg-red-50/30" : ""
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${filteredBalance > 0 ? "text-red-800" : "text-gray-500"}`}>
              Balance Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${filteredBalance > 0 ? "text-red-600" : "text-gray-800"}`}>
              {formatMoney(filteredBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <CardTitle className="text-base">Transaction Ledger</CardTitle>
            {isOwner && (
              <div className="flex flex-col items-end gap-1">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[180px] h-8 text-sm">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesLoading ? (
                      <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">
                  {selectedBranchName} — {formatMoney(filteredBilled)} total
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ledgerLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B2A4A]" />
            </div>
          ) : !allLedger.length ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <PackageOpen className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No transactions yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Record the first inventory delivery when vendor sends goods.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead className="w-[110px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Branch</TableHead>
                    <TableHead className="w-[130px] text-right">Amount</TableHead>
                    <TableHead className="w-[120px]">Source</TableHead>
                    <TableHead className="w-[140px] text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(row.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {row.type === "INVENTORY" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Inventory
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Payment
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{row.description}</TableCell>
                      <TableCell className="text-xs text-gray-500">{row.branch?.name ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {row.type === "INVENTORY" ? (
                          <span className="text-gray-800">{formatMoney(row.amount)}</span>
                        ) : (
                          <span className="text-red-600">−{formatMoney(row.amount)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.type === "PAYMENT" && row.source ? (
                          row.source === "SALE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              FROM SALE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              FROM CAL
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        <span className={row.runningBalance > 0 ? "text-red-600" : "text-green-600"}>
                          {formatMoney(row.runningBalance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Inventory Modal */}
      <Dialog
        open={showInventoryModal}
        onOpenChange={(open) => {
          setShowInventoryModal(open);
          if (!open) resetModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Inventory Delivery</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bill Amount (PKR) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="e.g. Monthly stock delivery"
                value={invDescription}
                onChange={(e) => setInvDescription(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Branch <span className="text-red-500">*</span></Label>
              {isManager ? (
                <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  {managerBranchName}
                </div>
              ) : (
                <Select onValueChange={(val) => setInvBranchId(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInventoryModal(false)}
              disabled={recordInventory.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B2A4A] hover:bg-slate-700 text-white"
              onClick={handleRecordInventory}
              disabled={recordInventory.isPending}
            >
              {recordInventory.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                "Record Inventory"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
