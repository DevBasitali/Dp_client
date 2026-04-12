"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SystemUser, useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";
import { useVendors } from "@/hooks/useVendors";
import { Loader2 } from "lucide-react";

// Schema for Creating User
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["owner", "branch_manager", "vendor"]),
  branch_id: z.string().optional(),
  vendor_id: z.string().optional(),
}).refine(data => {
  if (data.role === 'branch_manager' && !data.branch_id) return false;
  return true;
}, { message: "Branch is required for branch managers", path: ["branch_id"] })
.refine(data => {
  if (data.role === 'vendor' && !data.vendor_id) return false;
  return true;
}, { message: "Vendor profile is required", path: ["vendor_id"] });

// Schema for Updating User
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  is_active: z.boolean(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: SystemUser | null;
  onSuccess?: () => void;
}

export default function UserForm({ isOpen, onClose, userToEdit, onSuccess }: UserFormProps) {
  const isEditing = !!userToEdit;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();

  const form = useForm<any>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing
      ? { name: "", email: "", is_active: true }
      : { name: "", email: "", password: "", role: "branch_manager", branch_id: "", vendor_id: "" }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (userToEdit) {
        form.reset({
          name: userToEdit.name,
          email: userToEdit.email,
          is_active: userToEdit.is_active,
        });
      } else {
        form.reset({
          name: "", email: "", password: "", role: "branch_manager", branch_id: "", vendor_id: ""
        });
      }
    }
  }, [isOpen, userToEdit, form]);

  const onSubmit = (data: any) => {
    setSubmitError(null);
    const payload: any = {
      name: data.name,
      email: data.email,
    };

    if (isEditing) {
      payload.is_active = data.is_active;
    } else {
      payload.password = data.password;
      payload.role = data.role;
      payload.branch_id = data.role === 'branch_manager' ? (data.branch_id || null) : null;
      payload.vendor_id = data.role === 'vendor' ? (data.vendor_id || null) : null;
    }

    console.log("[UserForm] Submitting payload =>", payload);

    if (isEditing) {
      updateMutation.mutate({ id: userToEdit!.id, ...payload }, {
        onSuccess: (res) => {
          console.log("[UserForm] Update success =>", res);
          toast.success("User updated successfully");
          form.reset();
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          console.error("[UserForm] Update error =>", err.response?.data || err);
          const msg = err.response?.data?.message || err.message || "Failed to update user";
          setSubmitError(msg);
          toast.error(msg);
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          console.log("[UserForm] Create success =>", res);
          toast.success("User created successfully");
          form.reset();
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          console.error("[UserForm] Create error =>", err.response?.data || err);
          let errMsg = "Failed to create user";

          if (err.response?.status === 409) errMsg = "A user with this email already exists";
          else if (err.response?.status === 403) errMsg = "You don't have permission to do this";
          else if (err.response?.data?.message) errMsg = err.response.data.message;
          else if (err.message) errMsg = err.message;

          setSubmitError(errMsg);
          toast.error(errMsg);
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedRole = form.watch("role");

  // Show a banner when the form was submitted but had validation errors
  const hasValidationErrors = form.formState.isSubmitted && !form.formState.isValid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update user profile and access status." : "Provision a new user account across the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {submitError}
            </div>
          )}

          {hasValidationErrors && !submitError && (
            <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
              Please fix the highlighted errors below.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} className={form.formState.errors.name ? "border-red-500" : ""} />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} className={form.formState.errors.email ? "border-red-500" : ""} />
            {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message as string}</p>}
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} className={form.formState.errors.password ? "border-red-500" : ""} />
                {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>System Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(val) => {
                    form.setValue("role", val, { shouldValidate: true });
                    form.setValue("branch_id", "");
                    form.setValue("vendor_id", "");
                  }}
                >
                  <SelectTrigger className={form.formState.errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch_manager">Branch Manager</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedRole === 'branch_manager' && (
                <div className="space-y-2">
                  <Label>Assign to Branch <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.watch("branch_id") || ""}
                    onValueChange={(val) => form.setValue("branch_id", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className={form.formState.errors.branch_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.branch_id && (
                    <p className="text-xs text-red-500">{form.formState.errors.branch_id.message as string}</p>
                  )}
                </div>
              )}

              {selectedRole === 'vendor' && (
                <div className="space-y-2">
                  <Label>Bind to Vendor <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.watch("vendor_id") || ""}
                    onValueChange={(val) => form.setValue("vendor_id", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className={form.formState.errors.vendor_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a vendor profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.vendor_id && (
                    <p className="text-xs text-red-500">{form.formState.errors.vendor_id.message as string}</p>
                  )}
                </div>
              )}
            </>
          )}

          {isEditing && (
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-2">
              <Checkbox
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) => form.setValue("is_active", checked as boolean)}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="is_active" className="cursor-pointer">User is Active</Label>
                <p className="text-sm text-gray-500">Unchecking will lock this user out of the system.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B2A4A] hover:bg-slate-800" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
