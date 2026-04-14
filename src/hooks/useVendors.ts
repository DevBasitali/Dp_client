import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface LedgerRow {
  date: string;
  type: 'INVENTORY' | 'PAYMENT';
  description: string;
  amount: number;
  source: string | null;
  branch: { id: string; name: string };
  recordedBy: { id: string; name: string };
  runningBalance: number;
}

export interface VendorLedger {
  vendor: { id: string; name: string; whatsappNumber: string; category: string };
  outstandingBalance: number;
  ledger: LedgerRow[];
}

export interface Vendor {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string;
  category: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  // Included by the backend when listing:
  branch_links?: { branch_id: string; branch?: { name: string } }[];
  _count?: { items: number; purchases: number };
}

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await api.get('/vendors');
      return (data.data || []) as Vendor[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useVendor = (id: string, options = { enabled: true }) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data } = await api.get(`/vendors/${id}`);
      return data.data as Vendor;
    },
    enabled: options.enabled,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorData: Partial<Vendor> & { branch_links?: string[] }) => {
      const { data } = await api.post('/vendors', vendorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...vendorData }: Partial<Vendor> & { id: string, branch_links?: string[] }) => {
      const { data } = await api.put(`/vendors/${id}`, vendorData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/vendors/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useVendorLedger = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor-ledger', vendorId],
    queryFn: async () => {
      const { data } = await api.get(`/vendor-ledger/${vendorId}`);
      return data.data as VendorLedger;
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      vendorId: string;
      branchId: string;
      amount: number;
      description: string;
      date: string;
    }) => {
      const { data } = await api.post('/vendor-ledger/inventory', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-ledger', variables.vendorId] });
    },
  });
};
