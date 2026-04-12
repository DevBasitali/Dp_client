"use client";

import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCreateDailyClosing } from "@/hooks/useDailyClosings";
import { useBranches } from "@/hooks/useBranches";
import { useVendors } from "@/hooks/useVendors";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Calculator, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Must be greater than 0"),
  source: z.enum(["SALE", "CAL"]),
  vendorId: z.string().uuid().optional().nullable(),
});

const closingSchema = z.object({
  branchId: z.string().optional(),
  closingDate: z.string().min(1, "Date is required"),
  cashSales: z.number().min(0, "Cannot be negative"),
  easypaisaSales: z.number().min(0, "Cannot be negative"),
  notes: z.string().optional(),
  expenses: z.array(expenseSchema),
});

type ClosingFormValues = z.infer<typeof closingSchema>;

const formatMoney = (amount: number) =>
  `Rs. ${Number(isNaN(amount) ? 0 : amount).toLocaleString("en-PK")}`;

export default function DailyClosingFormPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";

  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();
  const createMutation = useCreateDailyClosing();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClosingFormValues>({
    resolver: zodResolver(closingSchema),
    defaultValues: {
      branchId: isManager ? (user?.branchId ?? "") : "",
      closingDate: format(new Date(), "yyyy-MM-dd"),
      cashSales: 0,
      easypaisaSales: 0,
      notes: "",
      expenses: [] as { description: string; amount: number; source: "SALE" | "CAL"; vendorId?: string | null }[],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "expenses" });

  // Watch all fields for live calculation
  const cashSales = useWatch({ control, name: "cashSales", defaultValue: 0 });
  const easypaisaSales = useWatch({ control, name: "easypaisaSales", defaultValue: 0 });
  const expenses = useWatch({ control, name: "expenses", defaultValue: [] });

  const cash = isNaN(Number(cashSales)) ? 0 : Number(cashSales);
  const eps = isNaN(Number(easypaisaSales)) ? 0 : Number(easypaisaSales);
  const totalSales = cash + eps;

  const saleExpenses = expenses
    .filter((e) => e.source === "SALE")
    .reduce((sum, e) => sum + (isNaN(Number(e.amount)) ? 0 : Number(e.amount)), 0);

  const calExpenses = expenses
    .filter((e) => e.source === "CAL")
    .reduce((sum, e) => sum + (isNaN(Number(e.amount)) ? 0 : Number(e.amount)), 0);

  const registerTotal = totalSales + saleExpenses;
  const physicalToBox = totalSales - saleExpenses;

  const onSubmit = (data: ClosingFormValues) => {
    if (!isManager && !data.branchId) {
      toast.error("Please select a branch.");
      return;
    }

    const payload = {
      branchId: isManager ? (user?.branchId ?? undefined) : data.branchId,
      closingDate: data.closingDate,
      cashSales: data.cashSales,
      easypaisaSales: data.easypaisaSales,
      notes: data.notes || undefined,
      expenses: data.expenses.map((e) => ({
        ...e,
        vendorId: e.vendorId || null,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Daily closing submitted successfully!");
        router.push(isManager ? "/branch-dashboard" : "/daily-closings");
      },
      onError: (err: any) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message;
        if (status === 409) {
          toast.error("Entry already exists for this date.");
        } else if (status === 400 && msg) {
          toast.error(msg);
        } else {
          toast.error(msg || "Failed to submit. Please try again.");
        }
      },
    });
  };

  return (
    <div className="space-y-6 lg:p-4 max-w-4xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={isManager ? "/branch-dashboard" : "/daily-closings"}>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-black">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Daily Closing Entry</h1>
          <p className="text-gray-500 text-sm">Record end-of-day sales and expenses.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Section 1 — Sales */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Sales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isManager && (
                <div className="space-y-2">
                  <Label>Branch <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(val: string | null) => val && setValue("branchId", val)}>
                    <SelectTrigger className={errors.branchId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select branch" />
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
                <Label>Closing Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  {...register("closingDate")}
                  className={errors.closingDate ? "border-red-500" : ""}
                />
                {errors.closingDate && (
                  <p className="text-xs text-red-500">{errors.closingDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cash Sales (PKR) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("cashSales", { valueAsNumber: true })}
                  className={`text-lg font-mono placeholder:font-sans ${errors.cashSales ? "border-red-500" : "focus:border-[#F0A500]"}`}
                />
                {errors.cashSales && (
                  <p className="text-xs text-red-500">{errors.cashSales.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>EasyPaisa Sales (PKR) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("easypaisaSales", { valueAsNumber: true })}
                  className={`text-lg font-mono placeholder:font-sans ${errors.easypaisaSales ? "border-red-500" : "focus:border-[#F0A500]"}`}
                />
                {errors.easypaisaSales && (
                  <p className="text-xs text-red-500">{errors.easypaisaSales.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 — Expenses */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Expenses
            </h2>

            {fields.length === 0 && (
              <p className="text-sm text-gray-400 italic">No expenses added yet.</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-2"
                >
                  {/* Main row: Description | Amount | Source | Remove */}
                  <div className="grid grid-cols-[1fr_130px_120px_36px] gap-2 items-start">
                    {/* Description */}
                    <div>
                      <Input
                        placeholder="e.g. Workers lunch"
                        {...register(`expenses.${index}.description`)}
                        className={`bg-white ${errors.expenses?.[index]?.description ? "border-red-500" : ""}`}
                      />
                      {errors.expenses?.[index]?.description && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.expenses[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        {...register(`expenses.${index}.amount`, { valueAsNumber: true })}
                        className={`font-mono bg-white ${errors.expenses?.[index]?.amount ? "border-red-500" : ""}`}
                      />
                      {errors.expenses?.[index]?.amount && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.expenses[index]?.amount?.message}
                        </p>
                      )}
                    </div>

                    {/* Source */}
                    <div>
                      <Controller
                        control={control}
                        name={`expenses.${index}.source`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={(val: string | null) => val && f.onChange(val)}>
                            <SelectTrigger
                              className={`bg-white ${errors.expenses?.[index]?.source ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SALE">FROM SALE</SelectItem>
                              <SelectItem value="CAL">FROM CAL</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.expenses?.[index]?.source && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.expenses[index]?.source?.message}
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 mt-0"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Vendor row (optional) */}
                  <div className="space-y-1">
                    <Controller
                      control={control}
                      name={`expenses.${index}.vendorId`}
                      render={({ field: f }) => (
                        <Select
                          value={f.value ?? ""}
                          onValueChange={(val) => f.onChange(val === "" ? null : val)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white">
                            <SelectValue placeholder="Select vendor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No vendor</SelectItem>
                            {vendors?.map((v) => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-slate-400">
                      Select a vendor to auto-record this as a payment in their ledger
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-dashed border-[#1B2A4A] text-[#1B2A4A] hover:bg-slate-50"
              onClick={() => append({ description: "", amount: 0, source: "SALE", vendorId: null })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>

        {/* Section 3 — Notes */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Notes
            </h2>
            <Textarea
              placeholder="Any extra notes for today..."
              className="resize-none"
              {...register("notes")}
            />
          </CardContent>
        </Card>

        {/* Live Calculation Card */}
        <Card className="shadow-sm border-0 bg-slate-50">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center mb-4">
              <Calculator className="w-4 h-4 mr-2" />
              Live Calculation
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Sales</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {formatMoney(totalSales)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-sm text-slate-600">Sale Expenses</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {formatMoney(saleExpenses)}
                </span>
              </div>

              <div className="border-t border-slate-300 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1B2A4A]">Written to Register</span>
                <span className="text-xl font-black text-[#1B2A4A] font-mono tracking-tight">
                  {formatMoney(registerTotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-green-700">Physical to Box</span>
                <span className="text-xl font-black text-green-600 font-mono tracking-tight">
                  {formatMoney(physicalToBox)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-500">Cal Expenses</span>
                  <p className="text-xs text-slate-400">(reduces Cal Box balance)</p>
                </div>
                <span className="font-semibold text-slate-500 font-mono">
                  {formatMoney(calExpenses)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 hidden md:inline">
              Double check values before submitting
            </span>
            <Button
              type="submit"
              className="w-full md:w-64 h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white shadow-xl md:shadow-md"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" />Submit Daily Closing</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
