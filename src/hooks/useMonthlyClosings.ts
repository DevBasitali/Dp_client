import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MonthlyClosing {
  id: string;
  branch_id: string;
  closed_by: string;
  month: number;
  year: number;
  total_cash_sales: number;
  total_easypaisa_sales: number;
  total_sales: number;
  total_expenses: number;
  net_bachat: number;
  days_recorded: number;
  is_locked: boolean;
  closed_at: string;
  branch?: { name: string };
  user?: { name: string };
}

export const useMonthlyClosings = () => {
  return useQuery({
    queryKey: ['monthly-closings'],
    queryFn: async () => {
      const { data } = await api.get('/monthly-closings');
      return (data.data || []) as MonthlyClosing[];
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
    mutationFn: async (monthData: { branch_id: string, month: number, year: number }) => {
      const { data } = await api.post('/monthly-closings', monthData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-closings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-closings'] });
    },
  });
};
