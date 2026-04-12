"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useVendors } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";
import { useCreateVendorOrder } from "@/hooks/useVendorOrders";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Camera, Loader2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const orderSchema = z.object({
  branch_id: z.string().optional(),
  vendor_id: z.string().min(1, "Please select a vendor"),
  notes: z.string().optional(),
  items: z.array(z.object({
    item_name: z.string().min(1, "Item name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item is required"),
});

export default function PlaceVendorOrderPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  const { data: vendors } = useVendors();
  const { data: branches } = useBranches();
  const createMutation = useCreateVendorOrder();

  const [images, setImages] = useState<(File | null)[]>([null]);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{ item_name: "", quantity: 1 }],
      branch_id: isManager ? (user.branchId || "") : "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Safe manual handling of image state paralleling field array
  const handleAddRow = () => {
    append({ item_name: "", quantity: 1 });
    setImages([...images, null]);
  };

  const handleRemoveRow = (index: number) => {
    remove(index);
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...images];
      newImages[index] = e.target.files[0];
      setImages(newImages);
    }
  };

  const onSubmit = (data: z.infer<typeof orderSchema>) => {
    if (!data.vendor_id || (!isManager && !data.branch_id)) {
      toast.error("Please ensure branch and vendor are selected.");
      return;
    }

    const payload = {
      vendor_id: data.vendor_id,
      branch_id: data.branch_id || (isManager ? user.branchId ?? undefined : undefined),
      notes: data.notes,
      items: data.items,
      images,
    };

    console.log("[VendorOrder] Submitting =>", { ...payload, images: images.map(f => f?.name) });

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        console.log("[VendorOrder] Success =>", res);
        toast.success("Inventory request sent!");
        router.push(isManager ? "/branch-dashboard" : "/vendor-orders");
      },
      onError: (err: any) => {
        console.error("[VendorOrder] Error =>", err.response?.data || err);
        const msg = err.response?.data?.message || "Failed to place order.";
        toast.error(msg);
      }
    });
  };

  return (
    <div className="space-y-6 lg:p-4 max-w-3xl mx-auto pb-24">
      <div className="flex items-center space-x-4">
        <Link href="/vendor-orders">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-black">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            Place Vendor Order
          </h1>
          <p className="text-gray-500 text-sm">Create and send an official PDF via WhatsApp.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Order Details</h3>
            
            {!isManager && (
              <div className="space-y-2">
                <Label htmlFor="branch">Select Branch <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val: string | null) => val && setValue("branch_id", val)}>
                  <SelectTrigger id="branch" className={errors.branch_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Which branch is ordering?" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vendor">Select Vendor <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val: string | null) => val && setValue("vendor_id", val)}>
                <SelectTrigger id="vendor" className={errors.vendor_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Which vendor?" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor_id && <p className="text-sm text-red-500">{errors.vendor_id.message}</p>}
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="notes">Delivery Notes / Instructions</Label>
              <Textarea 
                id="notes" 
                placeholder="e.g. Please deliver by Friday..." 
                className="resize-none"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Requested Items</h3>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="shadow-sm border border-gray-200">
              <CardContent className="p-4 sm:p-6 space-y-4 relative">
                {index > 0 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRow(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Item {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Product Name <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="e.g. Medium Plastic Plates"
                      {...register(`items.${index}.item_name`)}
                      className={errors.items?.[index]?.item_name ? "border-red-500" : ""}
                    />
                    {errors.items?.[index]?.item_name && <p className="text-xs text-red-500">{errors.items[index]?.item_name?.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantity <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      min="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className={errors.items?.[index]?.quantity ? "border-red-500" : ""}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Label className="mb-2 block text-gray-600">Reference Image (Optional)</Label>
                  <label className="flex items-center justify-center w-full h-24 sm:h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-[#F0A500] focus:outline-none overflow-hidden relative">
                    {images[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={URL.createObjectURL(images[index] as Blob)} 
                        alt="Preview" 
                        className="object-cover w-full h-full absolute inset-0 z-0 opacity-40 mix-blend-multiply"
                      />
                    ) : null}
                    <div className="flex flex-col items-center justify-center space-y-2 z-10 text-center">
                      <Camera className={`w-8 h-8 ${images[index] ? 'text-[#1B2A4A] drop-shadow-md' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-600">
                        {images[index] ? images[index]?.name : "Tap to open Camera or Gallery"}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={(e) => handleImageChange(index, e)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddRow}
            className="w-full h-14 border-dashed border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Item
          </Button>
        </div>

        {/* Fixed bottom bar for Mobile-first pattern */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 hidden md:inline">
              Generates PDF and sends via WhatsApp
            </span>
            <Button 
              type="submit" 
              className="w-full md:w-64 h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white shadow-xl md:shadow-md"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Send Official Order
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
