"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Branch, useCreateBranch, useUpdateBranch } from "@/hooks/useBranches";

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required").max(100),
  location: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormProps {
  isOpen: boolean;
  onClose: () => void;
  branchToEdit?: Branch | null;
}

export default function BranchForm({ isOpen, onClose, branchToEdit }: BranchFormProps) {
  const isEditing = !!branchToEdit;
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  // Reset form when opening/closing or selecting a branch to edit
  useEffect(() => {
    if (isOpen) {
      if (branchToEdit) {
        form.reset({
          name: branchToEdit.name,
          location: branchToEdit.location || "",
        });
      } else {
        form.reset({ name: "", location: "" });
      }
    }
  }, [isOpen, branchToEdit, form]);

  const onSubmit = (data: BranchFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: branchToEdit.id, ...data },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this location." : "Create a new branch location for Dollar Point."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name</Label>
            <Input
              id="name"
              placeholder="e.g. Alipur Branch"
              {...form.register("name")}
              className={form.formState.errors.name ? "border-red-500" : ""}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input
              id="location"
              placeholder="e.g. Main Bazar, Pindi"
              {...form.register("location")}
            />
            {form.formState.errors.location && (
              <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1B2A4A] hover:bg-slate-800"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Branch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
