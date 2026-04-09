"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Vendor, useCreateVendor, useUpdateVendor } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(100),
  phone: z.string().optional(),
  whatsapp_number: z.string().min(1, "WhatsApp number is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  branch_links: z.array(z.string()).min(1, "Assign vendor to at least one branch"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit?: Vendor | null;
}

export default function VendorForm({ isOpen, onClose, vendorToEdit }: VendorFormProps) {
  const isEditing = !!vendorToEdit;
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp_number: "",
      category: "",
      notes: "",
      branch_links: [],
    },
  });

  // Reset form when modal state changes
  useEffect(() => {
    if (isOpen) {
      if (vendorToEdit) {
        // Extract array of branch IDs from the complex relationships object
        const linkedBranchIds = vendorToEdit.branch_links?.map(link => link.branch_id) || [];
        
        form.reset({
          name: vendorToEdit.name,
          phone: vendorToEdit.phone || "",
          whatsapp_number: vendorToEdit.whatsapp_number,
          category: vendorToEdit.category || "",
          notes: vendorToEdit.notes || "",
          branch_links: linkedBranchIds,
        });
      } else {
        form.reset({ 
          name: "", phone: "", whatsapp_number: "", category: "", notes: "", branch_links: [] 
        });
      }
    }
  }, [isOpen, vendorToEdit, form]);

  const onSubmit = (data: VendorFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: vendorToEdit.id, ...(data as any) },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(data as any, { onSuccess: () => onClose() });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update supplier details." : "Register a new supplier to the system. WhatsApp is required for sending inventory requests."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-500">Business/Vendor Name *</Label>
            <Input id="name" placeholder="e.g. Hamza Melamine" {...form.register("name")} className="h-11" />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-xs font-semibold uppercase text-gray-500">WhatsApp *</Label>
              <Input id="whatsapp_number" placeholder="e.g. +923000000000" {...form.register("whatsapp_number")} className="h-11" />
              {form.formState.errors.whatsapp_number && <p className="text-xs text-red-500">{form.formState.errors.whatsapp_number.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase text-gray-500">Phone (Alt)</Label>
              <Input id="phone" placeholder="Optional" {...form.register("phone")} className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase text-gray-500">Category</Label>
            <Input id="category" placeholder="e.g. Toys, Household, Plastics" {...form.register("category")} className="h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">Branch Assignments *</Label>
            <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
              {branchesLoading ? (
                <p className="text-sm text-gray-400 text-center py-2">Loading branches...</p>
              ) : branches?.length === 0 ? (
                <p className="text-sm text-red-500">You must create at least one branch first.</p>
              ) : (
                <div className="space-y-3">
                  {branches?.map((branch) => (
                    <div key={branch.id} className="flex flex-row items-start space-x-3">
                      <Checkbox 
                        id={`branch-${branch.id}`}
                        checked={form.watch("branch_links").includes(branch.id)}
                        onCheckedChange={(checked) => {
                          const currentValues = form.watch("branch_links");
                          if (checked) {
                            form.setValue("branch_links", [...currentValues, branch.id], { shouldValidate: true });
                          } else {
                            form.setValue("branch_links", currentValues.filter(id => id !== branch.id), { shouldValidate: true });
                          }
                        }}
                      />
                      <div className="grid leading-none">
                        <label htmlFor={`branch-${branch.id}`} className="text-sm font-medium leading-none cursor-pointer">
                          {branch.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {form.formState.errors.branch_links && <p className="text-xs text-red-500">{form.formState.errors.branch_links.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-[#1B2A4A] hover:bg-slate-800" disabled={isPending}>
              {isPending ? "Saving..." : "Save Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
