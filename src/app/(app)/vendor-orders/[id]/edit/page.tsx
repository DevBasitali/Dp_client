"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useVendors } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";
import { useVendorOrder, useUpdateVendorOrder } from "@/hooks/useVendorOrders";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Camera, Loader2, ClipboardList, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const orderSchema = z.object({
  branch_id: z.string().optional(),
  vendor_id: z.string().min(1, "Please select a vendor"),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    item_name: z.string().min(1, "Item name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    image_url: z.string().optional(),
  })).min(1, "At least one item is required"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

function EditOrderForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  const { data: vendors } = useVendors();
  const { data: branches } = useBranches();
  const { data: order, isLoading: orderLoading } = useVendorOrder(orderId);
  const updateMutation = useUpdateVendorOrder();

  const [images, setImages] = useState<(File | null)[]>([]);

  const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [],
      branch_id: "",
      vendor_id: "",
      notes: "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    if (order) {
      reset({
        branch_id: order.branch_id,
        vendor_id: order.vendor_id,
        notes: order.notes || "",
        items: order.items?.map(it => ({
          id: it.id,
          item_name: it.item_name,
          quantity: it.quantity,
          image_url: it.image_url
        })) || []
      });
      setImages(new Array((order.items?.length || 0)).fill(null));
    }
  }, [order, reset]);

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

  const onSubmit = (data: OrderFormValues) => {
    if (!data.vendor_id || (!isManager && !data.branch_id)) {
      toast.error("Please ensure branch and vendor are selected.");
      return;
    }

    const payload = {
      id: orderId,
      vendor_id: data.vendor_id,
      branch_id: data.branch_id,
      notes: data.notes,
      items: data.items.map((it, i) => ({
        id: it.id,
        item_name: it.item_name,
        quantity: it.quantity,
        image_url: it.image_url // Keep existing URL if no new image
      })),
      images,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Vendor order updated and resent!");
        router.push(isManager ? "/branch-dashboard" : "/vendor-orders");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to update order.";
        toast.error(msg);
      }
    });
  };

  if (orderLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:p-4 max-w-3xl mx-auto pb-24">
      <div className="flex items-center space-x-4">
        <Link href="/vendor-orders">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-black">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Edit Vendor Order</h1>
          <p className="text-gray-500 text-sm">Update and resend updated PDF to vendor.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Order Details</h3>
            
            {!isManager && (
              <div className="space-y-2">
                <Label htmlFor="branch">Select Branch <span className="text-red-500">*</span></Label>
                <Select value={control._formValues.branch_id} onValueChange={(val: string) => setValue("branch_id", val)}>
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
              <Select value={control._formValues.vendor_id} onValueChange={(val: string) => setValue("vendor_id", val)}>
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
                <button 
                  type="button" 
                  onClick={() => handleRemoveRow(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
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
                    ) : (field.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={field.image_url} 
                        alt="Existing" 
                        className="object-contain w-full h-full absolute inset-0 z-0 opacity-40"
                      />
                    ) : null}
                    <div className="flex flex-col items-center justify-center space-y-2 z-10 text-center">
                      <Camera className={`w-8 h-8 ${images[index] || field.image_url ? 'text-[#1B2A4A] drop-shadow-md' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-600">
                        {images[index] ? images[index]?.name : field.image_url ? "Replace existing image" : "Tap to open Camera or Gallery"}
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

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 hidden md:inline">
              Update will regenerate PDF and notify vendor
            </span>
            <Button 
              type="submit" 
              className="w-full md:w-64 h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white shadow-xl md:shadow-md"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditVendorOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <EditOrderForm orderId={resolvedParams.id} />;
}
