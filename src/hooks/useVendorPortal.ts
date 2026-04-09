import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { VendorOrderItem } from './useVendorOrders';

export interface VendorItem {
  id: string;
  name: string;
  category?: string;
  cost_price: number;
  selling_price: number;
}

export interface VendorPortalOrder {
  id: string;
  branch?: { name: string };
  requested_by: string;
  notes?: string;
  pdf_url?: string;
  created_at: string;
  items?: VendorOrderItem[];
}

export const useVendorPortalItems = (vendorId?: string | null) => {
  return useQuery({
    queryKey: ['vendor-portal-items', vendorId],
    queryFn: async () => {
      const { data } = await api.get(`/vendors/${vendorId}/items`);
      return (data.data || []) as VendorItem[];
    },
    enabled: !!vendorId,
  });
};

export const useVendorPortalOrders = (vendorId?: string | null) => {
  return useQuery({
    queryKey: ['vendor-portal-orders', vendorId],
    queryFn: async () => {
      const { data } = await api.get(`/vendors/${vendorId}/orders`);
      return (data.data || []) as VendorPortalOrder[];
    },
    enabled: !!vendorId,
  });
};
