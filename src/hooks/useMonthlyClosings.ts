import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MonthlyClosing {
  id: string;
  branchId: string;
  closedBy: string;
  month: number;
  year: number;
  totalCashSales: number;
  totalEasypaisaSales: number;
  totalSales: number;
  totalExpenses: number;
  netBachat: number;
  daysRecorded: number;
  isLocked: boolean;
  closedAt: string;
  branch?: { name: string };
}

export interface BranchMonthStatus {
  branchId: string;
  branchName?: string;
  status: 'CLOSED' | 'PENDING';
  dailyCount: number;
  bachat: number | null;
  totalSales?: number | null;
}

export interface CurrentMonthData {
  month: number;
  year: number;
  branches: BranchMonthStatus[];
}

export interface MonthlyClosingsResponse {
  closings: MonthlyClosing[];
  currentMonth: CurrentMonthData;
}

export const useMonthlyClosings = (params?: { month?: number; year?: number }) => {
  return useQuery({
    queryKey: ['monthly-closings', params],
    queryFn: async () => {
      const { data } = await api.get('/monthly-closings', { params });
      return data.data as MonthlyClosingsResponse;
    },
  });
};

export const useMonthlyClosing = (id: string, options = { enabled: true }) => {
  return useQuery({
    queryKey: ['monthly-closing', id],
    queryFn: async () => {
      const { data } = await api.get(`/monthly-closings/${id}`);
      return data.data as MonthlyClosing;
    },
    enabled: options.enabled,
  });
};

export const useCloseMonth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (monthData: { month: number; year: number; branchId?: string }) => {
      const { data } = await api.post('/monthly-closings', monthData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-closings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-closings'] });
    },
  });
};
