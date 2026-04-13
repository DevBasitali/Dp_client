"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVendors, useDeleteVendor, useRecordInventory, Vendor } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";
import VendorForm from "@/components/vendors/VendorForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Loader2, Users, Search, Eye, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function VendorsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: vendors, isLoading, isError } = useVendors();
  const { data: branches } = useBranches();
  const deleteMutation = useDeleteVendor();
  const recordInventoryMutation = useRecordInventory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [recordForm, setRecordForm] = useState({
    amount: "",
    description: "",
    branchId: user?.branchId ?? "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [recordError, setRecordError] = useState("");

  const isOwner = user?.role === "owner";

  const handleOpenRecordModal = (vendor: Vendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setRecordForm({
      amount: "",
      description: "",
      branchId: user?.branchId ?? "",
      date: new Date().toISOString().slice(0, 10),
    });
    setRecordError("");
    setRecordModalOpen(true);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError("");
    if (!recordForm.amount || Number(recordForm.amount) <= 0) {
      setRecordError("Bill amount must be greater than 0.");
      return;
    }
    if (!recordForm.description.trim()) {
      setRecordError("Description is required.");
      return;
    }
    if (!recordForm.branchId) {
      setRecordError("Please select a branch.");
      return;
    }
    recordInventoryMutation.mutate(
      {
        vendorId: selectedVendorId!,
        branchId: recordForm.branchId,
        amount: Number(recordForm.amount),
        description: recordForm.description.trim(),
        date: recordForm.date,
      },
      {
        onSuccess: () => {
          setRecordModalOpen(false);
          toast.success("Inventory recorded successfully.");
        },
        onError: (err: unknown) => {
          setRecordError(err instanceof Error ? err.message : "Something went wrong.");
        },
      }
    );
  };

  const handleCreateNew = () => {
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to continuously deactivate this vendor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewLedger = (id: string) => {
    router.push(`/vendors/${id}`);
  };

  const filteredVendors = vendors?.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 lg:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <Users className="mr-2 text-[#F0A500]" />
            Vendors
          </h1>
          <p className="text-gray-500 text-sm">Manage suppliers and access their ledgers.</p>
        </div>
        {isOwner && (
          <Button onClick={handleCreateNew} className="bg-[#1B2A4A] hover:bg-slate-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search vendors by name or category..." 
            className="pl-9 border-gray-200" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load vendors. Please try again.
            </div>
          ) : filteredVendors?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <Users className="w-12 h-12 text-gray-200 mb-2" />
              <p>No vendors found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700">WhatsApp</TableHead>
                    <TableHead className="font-semibold text-gray-700">Linked Branches</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors?.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A2E]">{vendor.name}</TableCell>
                      <TableCell className="text-gray-600">{vendor.category || "General"}</TableCell>
                      <TableCell className="text-gray-600 font-mono text-sm">{vendor.whatsapp_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {vendor.branch_links?.length ? (
                             vendor.branch_links.map((link) => (
                               <Badge key={link.branch_id} variant="secondary" className="bg-slate-100 text-[#1B2A4A] font-medium border-slate-200">
                                 {link.branch?.name || "Branch"}
                               </Badge>
                             ))
                          ) : (
                            <span className="text-gray-400 text-xs">Unlinked</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRecordModal(vendor)}
                            className="h-8 shadow-sm text-[#F0A500] border-[#F0A500]/30 hover:bg-amber-50"
                            title="Record Inventory"
                          >
                            <ClipboardList className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Record Inventory</span>
                          </Button>

                           <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLedger(vendor.id)}
                            className="h-8 shadow-sm text-[#1B2A4A] border-[#1B2A4A]/20"
                            title="View Ledger"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">View Ledger</span>
                          </Button>

                          {isOwner && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(vendor)}
                                className="h-8 shadow-sm"
                                title="Edit Vendor"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(vendor.id)}
                                className="h-8 shadow-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100"
                                disabled={deleteMutation.isPending}
                                title="Delete Vendor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VendorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        vendorToEdit={selectedVendor}
      />

      <Dialog open={recordModalOpen} onOpenChange={setRecordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Vendor</Label>
              <Input value={selectedVendorName} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Bill Amount (PKR) <span className="text-red-500">*</span></Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 5000"
                value={recordForm.amount}
                onChange={(e) => setRecordForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                placeholder="e.g. Delivery of melamine plates"
                value={recordForm.description}
                onChange={(e) => setRecordForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            {isOwner ? (
              <div className="space-y-1">
                <Label>Branch <span className="text-red-500">*</span></Label>
                <Select
                  value={recordForm.branchId}
                  onValueChange={(val: string | null) => setRecordForm((f) => ({ ...f, branchId: val ?? '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Branch</Label>
                <Input
                  value={branches?.find((b) => b.id === recordForm.branchId)?.name ?? "Your Branch"}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                value={recordForm.date}
                onChange={(e) => setRecordForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            {recordError && (
              <p className="text-sm text-red-600">{recordError}</p>
            )}
            <Button
              type="submit"
              disabled={recordInventoryMutation.isPending}
              className="w-full bg-[#1B2A4A] hover:bg-slate-800 text-white"
            >
              {recordInventoryMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Inventory
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
