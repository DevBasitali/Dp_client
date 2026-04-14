import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface VendorOutstanding {
  vendorId: string;
  vendorName: string;
  category: string | null;
  totalInventory: number;
  totalPaid: number;
  outstandingBalance: number;
}

export const useVendorOutstanding = () => {
  return useQuery({
    queryKey: ['vendor-outstanding'],
    queryFn: async () => {
      const { data } = await api.get('/vendor-ledger/outstanding');
      return (data.data || []) as VendorOutstanding[];
    },
  });
};
