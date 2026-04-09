"use client";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCreateDailyClosing } from "@/hooks/useDailyClosings";
import { useBranches } from "@/hooks/useBranches";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Calculator } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const closingSchema = z.object({
  branch_id: z.string().optional(),
  closing_date: z.string().min(1, "Date is required"),
  cash_sales: z.number().min(0, "Cannot be negative"),
  easypaisa_sales: z.number().min(0, "Cannot be negative"),
  daily_expense: z.number().min(0, "Cannot be negative"),
  notes: z.string().optional(),
});

export default function DailyClosingFormPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === "branch_manager";
  
  const { data: branches } = useBranches();
  const createMutation = useCreateDailyClosing();

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof closingSchema>>({
    resolver: zodResolver(closingSchema),
    defaultValues: {
      branch_id: isManager ? (user.branchId || "") : "",
      closing_date: format(new Date(), 'yyyy-MM-dd'),
      cash_sales: 0,
      easypaisa_sales: 0,
      daily_expense: 0,
    }
  });

  // Watch fields for live calculation
  const cashSales = useWatch({ control, name: "cash_sales", defaultValue: 0 });
  const easypaisaSales = useWatch({ control, name: "easypaisa_sales", defaultValue: 0 });
  const dailyExpense = useWatch({ control, name: "daily_expense", defaultValue: 0 });

  const [totalSales, setTotalSales] = useState(0);
  const [netTotal, setNetTotal] = useState(0);

  useEffect(() => {
    // Safety fallback to prevent NaN if empty input
    const cash = isNaN(cashSales) ? 0 : cashSales;
    const eps = isNaN(easypaisaSales) ? 0 : easypaisaSales;
    const exp = isNaN(dailyExpense) ? 0 : dailyExpense;

    const total = cash + eps;
    setTotalSales(total);
    setNetTotal(total - exp);
  }, [cashSales, easypaisaSales, dailyExpense]);

  const formatMoney = (amount: number) => {
    return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
  };

  const onSubmit = (data: z.infer<typeof closingSchema>) => {
    if (!isManager && !data.branch_id) {
      alert("Please select a branch.");
      return;
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        router.push("/daily-closings");
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Failed to submit closing. You might have already submitted for today or the month is locked.");
      }
    });
  };

  return (
    <div className="space-y-6 lg:p-4 max-w-3xl mx-auto pb-24">
      <div className="flex items-center space-x-4">
        <Link href="/daily-closings">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-black">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            Daily Closing Entry
          </h1>
          <p className="text-gray-500 text-sm">Record end-of-day cash and digital sales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isManager && (
                <div className="space-y-2">
                  <Label htmlFor="branch">Select Branch <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(val: string | null) => val && setValue("branch_id", val)}>
                    <SelectTrigger id="branch" className={errors.branch_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Which branch?" />
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
                <Label>Closing Date</Label>
                <Input 
                  type="date"
                  {...register("closing_date")}
                  className={errors.closing_date ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cash Sales (PKR) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...register("cash_sales", { valueAsNumber: true })}
                    className="text-lg font-mono placeholder:font-sans focus:border-[#F0A500]"
                  />
                  {errors.cash_sales && <p className="text-xs text-red-500">{errors.cash_sales.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>EasyPaisa Sales (PKR) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...register("easypaisa_sales", { valueAsNumber: true })}
                    className="text-lg font-mono placeholder:font-sans focus:border-[#F0A500]"
                  />
                  {errors.easypaisa_sales && <p className="text-xs text-red-500">{errors.easypaisa_sales.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Daily Expenses (PKR) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...register("daily_expense", { valueAsNumber: true })}
                    className="text-lg font-mono text-red-600 placeholder:text-gray-400 focus:border-red-500"
                  />
                  {errors.daily_expense && <p className="text-xs text-red-500">{errors.daily_expense.message}</p>}
                </div>
              </div>

              {/* Live Calculation Panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase flex items-center mb-2">
                  <Calculator className="w-4 h-4 mr-2" /> Live Calculation
                </h3>
                
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Sales (Cash + EP)</p>
                  <p className="text-2xl font-bold text-[#1B2A4A] tracking-tight">{formatMoney(totalSales)}</p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Net Batchat (Total - Exp)</p>
                  <p className={`text-3xl font-black tracking-tighter ${netTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatMoney(netTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Label>Extra Notes</Label>
              <Textarea 
                placeholder="Reason for high expenses..." 
                className="resize-none"
                {...register("notes")}
              />
            </div>
            
          </CardContent>
        </Card>

        {/* Fixed bottom bar for Mobile-first pattern */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 hidden md:inline">
              Double check values before submitting
            </span>
            <Button 
              type="submit" 
              className="w-full md:w-64 h-14 bg-[#1B2A4A] hover:bg-slate-800 text-white shadow-xl md:shadow-md"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Submit Daily Closing
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
