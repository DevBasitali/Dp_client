import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuditLogItem {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  created_at: string;
  user?: { name: string; role: string };
}

export interface ItemMarginReport {
  id: string;
  name: string;
  category?: string;
  vendor?: { name: string };
  cost_price: number;
  selling_price: number;
  margin: number;
  margin_percent: number;
}

export const useAuditLog = () => {
  return useQuery({
    queryKey: ['reports', 'audit-log'],
    queryFn: async () => {
      const { data } = await api.get('/reports/audit-log');
      return (data.data || []) as AuditLogItem[];
    },
  });
};

export const useItemMarginsReport = () => {
  return useQuery({
    queryKey: ['reports', 'item-margins'],
    queryFn: async () => {
      const { data } = await api.get('/reports/item-margins');
      return (data.data || []) as ItemMarginReport[];
    },
  });
};
