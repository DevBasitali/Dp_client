import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface VendorOrderItem {
  id: string;
  item_name: string;
  quantity: number;
  image_url?: string;
}

export interface VendorOrder {
  id: string;
  branch_id: string;
  vendor_id: string;
  requested_by: string;
  notes?: string;
  pdf_url?: string;
  whatsapp_sent: boolean;
  whatsapp_sent_at?: string;
  created_at: string;
  items?: VendorOrderItem[];
  branch?: {name: string};
  vendor?: {name: string};
}

export const useVendorOrders = (branchId?: string) => {
  return useQuery({
    queryKey: ['vendor-orders', branchId],
    queryFn: async () => {
      const url = branchId ? `/vendor-orders?branchId=${branchId}` : '/vendor-orders';
      const { data } = await api.get(url);
      return (data.data || []) as VendorOrder[];
    },
  });
};

export const useVendorOrder = (id: string, options = { enabled: true }) => {
  return useQuery({
    queryKey: ['vendor-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/vendor-orders/${id}`);
      return data.data as VendorOrder;
    },
    enabled: options.enabled,
  });
};

export const useCreateVendorOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: { vendor_id: string, branch_id?: string, notes?: string, items: { item_name: string, quantity: number }[], images: (File | null)[] }) => {
      const formData = new FormData();
      formData.append('vendorId', orderData.vendor_id);
      if (orderData.branch_id) formData.append('branchId', orderData.branch_id);
      if (orderData.notes) formData.append('notes', orderData.notes);
      
      const mappedItems = orderData.items.map(it => ({ itemName: it.item_name, quantity: it.quantity }));
      formData.append('items', JSON.stringify(mappedItems));
      
      if (orderData.images) {
        orderData.images.forEach((file, index) => {
          if (file) {
            formData.append(`items[${index}][image]`, file);
          }
        });
      }

      const { data } = await api.post('/vendor-orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
};

export const useUpdateVendorOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: { id: string, vendor_id: string, branch_id?: string, notes?: string, items: { id?: string, item_name: string, quantity: number, image_url?: string }[], images: (File | null)[] }) => {
      const formData = new FormData();
      formData.append('vendorId', orderData.vendor_id);
      if (orderData.branch_id) formData.append('branchId', orderData.branch_id);
      if (orderData.notes) formData.append('notes', orderData.notes);
      
      const mappedItems = orderData.items.map(it => ({ id: it.id, itemName: it.item_name, quantity: it.quantity, image_url: it.image_url }));
      formData.append('items', JSON.stringify(mappedItems));
      
      if (orderData.images) {
        orderData.images.forEach((file, index) => {
          if (file) {
            formData.append(`items[${index}][image]`, file);
          }
        });
      }

      const { data } = await api.put(`/vendor-orders/${orderData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-order', variables.id] });
    },
  });
};
