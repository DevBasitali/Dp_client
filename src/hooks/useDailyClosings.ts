import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DailyClosing {
  id: string;
  branch_id: string;
  entered_by: string;
  closing_date: string;
  cash_sales: number;
  easypaisa_sales: number;
  daily_expense: number;
  total_sales: number;
  net_total: number;
  notes?: string;
  created_at: string;
  branch?: { name: string };
  user?: { name: string };
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
    mutationFn: async (closingData: Partial<DailyClosing>) => {
      const { data } = await api.post('/daily-closings', closingData);
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
    mutationFn: async ({ id, ...closingData }: Partial<DailyClosing> & { id: string }) => {
      const { data } = await api.put(`/daily-closings/${id}`, closingData);
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
    enabled: !!filters?.month && !!filters?.year, // Only query if month/year are picked
  });
};
