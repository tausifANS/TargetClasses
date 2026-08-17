import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth-store';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useIsUserLoggedIn() {
  return !!getToken('user');
}

export function useUserSignup() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post<{ data: { token: string; user: UserProfile } }>('/user-auth/signup', data);
      return res.data.data;
    },
    onSuccess: (data) => setToken('user', data.token),
  });
}

export function useUserLogin() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<{ data: { token: string; user: UserProfile } }>('/user-auth/login', data);
      return res.data.data;
    },
    onSuccess: (data) => setToken('user', data.token),
  });
}

export function useUserLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken('user');
    queryClient.removeQueries({ queryKey: ['user-auth'] });
  };
}

export function useUserMe(enabled: boolean) {
  return useQuery<UserProfile>({
    queryKey: ['user-auth', 'me'],
    queryFn: async () => (await api.get('/user-auth/me')).data.data,
    enabled,
    retry: false,
  });
}
