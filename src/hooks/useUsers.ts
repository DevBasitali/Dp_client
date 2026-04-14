import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'branch_manager' | 'vendor';
  branch_id?: string;
  vendor_id?: string;
  is_active: boolean;
  branch?: { name: string };
  vendor?: { name: string };
}

export const useUsers = (role?: string) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const qs = role && role !== 'All' ? `?role=${role}` : '';
      const { data } = await api.get(`/users${qs}`);
      return (data.data || []) as SystemUser[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<SystemUser> & { password?: string }) => {
      const { data } = await api.post('/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SystemUser> & { id: string }) => {
      const { data } = await api.put(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
