import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth-store';

export function useIsAdminLoggedIn() {
  return !!getToken('admin');
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await api.post<{ data: { accessToken: string } }>('/admin/login', data);
      return res.data.data;
    },
    onSuccess: (data) => setToken('admin', data.accessToken),
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken('admin');
    queryClient.removeQueries({ queryKey: ['admin'] });
  };
}

// ---- Generic sheet-backed list ----

export function useAdminList<T = Record<string, unknown>>(key: string, path: string, enabled = true) {
  return useQuery<T[]>({
    queryKey: ['admin', key],
    queryFn: async () => (await api.get(`${path}`)).data.data ?? [],
    enabled,
    retry: false,
    // Admin data (inbox, applications, attendance, ...) needs to reflect what's
    // actually in the sheet right now, not a minutes-old cache — always refetch
    // when a panel mounts or the browser tab regains focus.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, key: string) {
  queryClient.invalidateQueries({ queryKey: ['admin', key] });
}

export function useAdminCreate(key: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown> | FormData) => (await api.post(path, body)).data,
    onSuccess: () => invalidate(queryClient, key),
  });
}

export function useAdminUpdate(key: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> | FormData }) =>
      (await api.patch(`${path}/${id}`, patch)).data,
    onSuccess: () => invalidate(queryClient, key),
  });
}

export function useAdminDelete(key: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`${path}/${id}`)).data,
    onSuccess: () => invalidate(queryClient, key),
  });
}

// ---- Inbox (Admissions / ContactMessages / SupportRequests / CareerApplications) ----

export const INBOX_SHEETS = [
  { key: 'Admissions', label: 'Admissions' },
  { key: 'ContactMessages', label: 'Contact Messages' },
  { key: 'SupportRequests', label: 'Support Requests' },
  { key: 'CareerApplications', label: 'Career Applications' },
] as const;

export function useInboxList(sheet: string, enabled: boolean) {
  return useAdminList(`inbox-${sheet}`, `/admin/inbox/${sheet}`, enabled);
}

export function useInboxUpdateStatus(sheet: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/admin/inbox/${sheet}/${id}`, { status })).data,
    onSuccess: () => invalidate(queryClient, `inbox-${sheet}`),
  });
}

// ---- Portal Applications ----

export function usePortalApplicationsList<T = Record<string, unknown>>(enabled: boolean) {
  return useAdminList<T>('portal-applications', '/admin/portal-applications', enabled);
}

export function useApprovePortalApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/portal-applications/${id}/approve`)).data,
    onSuccess: () => {
      invalidate(queryClient, 'portal-applications');
      invalidate(queryClient, 'students');
    },
  });
}

export function useRejectPortalApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/portal-applications/${id}/reject`)).data,
    onSuccess: () => invalidate(queryClient, 'portal-applications'),
  });
}

// ---- Students & Attendance ----

export function useStudentsList<T = Record<string, unknown>>(enabled: boolean) {
  return useAdminList<T>('students', '/admin/students', enabled);
}

export function useAttendanceList<T = Record<string, unknown>>(enabled: boolean) {
  return useAdminList<T>('attendance', '/admin/attendance', enabled);
}
