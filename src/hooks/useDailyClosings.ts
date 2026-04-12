import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DailyExpense {
  id: string;
  description: string;
  amount: number;
  source: 'SALE' | 'CAL';
  createdAt: string;
}

export interface DailyClosing {
  id: string;
  branchId: string;
  enteredBy: string;
  closingDate: string;
  cashSales: number;
  easypaisaSales: number;
  totalSales: number;
  registerTotal: number;
  physicalToBox: number;
  notes?: string;
  createdAt: string;
  expenses: DailyExpense[];
  branch?: { id: string; name: string };
}

export interface CreateDailyClosingPayload {
  branchId?: string;
  closingDate: string;
  cashSales: number;
  easypaisaSales: number;
  notes?: string;
  expenses: { description: string; amount: number; source: 'SALE' | 'CAL' }[];
}

export const useDailyClosings = (filters?: { branchId?: string; month?: number; year?: number }) => {
  return useQuery({
    queryKey: ['daily-closings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.month) params.append('month', filters.month.toString());
      if (filters?.year) params.append('year', filters.year.toString());
      const { data } = await api.get(`/daily-closings?${params.toString()}`);
      return (data.data || []) as DailyClosing[];
    },
  });
};

export const useCreateDailyClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDailyClosingPayload) => {
      const { data } = await api.post('/daily-closings', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-closings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });
};

export const useUpdateDailyClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateDailyClosingPayload & { id: string }) => {
      const { data } = await api.put(`/daily-closings/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-closings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });
};

export const useDailySummary = (filters?: { branchId?: string; month?: number; year?: number }) => {
  return useQuery({
    queryKey: ['daily-summary', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.month) params.append('month', filters.month.toString());
      if (filters?.year) params.append('year', filters.year.toString());
      const { data } = await api.get(`/daily-closings/summary?${params.toString()}`);
      return data.data;
    },
    enabled: !!filters?.month && !!filters?.year,
  });
};
