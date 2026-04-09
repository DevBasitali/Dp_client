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

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return (data.data || []) as SystemUser[];
    },
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
