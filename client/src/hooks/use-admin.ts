import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth-store';

export function useIsAdminLoggedIn() {
  return !!getToken('admin');
}

export type TeacherPage = 'students' | 'attendance' | 'classes' | 'questions' | 'notes' | 'results' | 'gallery';

export interface AdminMe {
  username: string;
  role: string;
  accountRole: 'admin' | 'teacher';
  className: string | null;
  permissions: TeacherPage[] | null;
  isOwner: boolean;
}

export function useAdminMe(enabled: boolean) {
  return useQuery<AdminMe>({
    queryKey: ['admin', 'me'],
    queryFn: async () => (await api.get('/admin/me')).data.data,
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useAdminLogin() {
  return useMutation({
    // Two independent admin logins exist server-side: the single owner account
    // configured via env vars (/admin/login), and any additional accounts
    // created under Settings → Admin Accounts (/admin/login-account). Try the
    // owner login first, then fall back so both kinds of accounts work from
    // one form; surface the fallback's error since it reflects the actual
    // username being checked against real accounts.
    mutationFn: async (data: { username: string; password: string }) => {
      try {
        const res = await api.post<{ data: { accessToken: string } }>('/admin/login', data);
        return res.data.data;
      } catch (err) {
        try {
          const res = await api.post<{ data: { accessToken: string } }>('/admin/login-account', data);
          return res.data.data;
        } catch (fallbackErr) {
          throw fallbackErr ?? err;
        }
      }
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

export function useResetStudentPassword() {
  return useMutation({
    mutationFn: async ({ studentId, password, sendEmail }: { studentId: string; password?: string; sendEmail: boolean }) =>
      (await api.post(`/admin/students/${studentId}/reset-password`, { password, sendEmail })).data.data as { password: string; emailSent: boolean },
  });
}

// ---- Email (SMTP) settings ----

export interface SmtpSettings {
  host: string;
  port: string;
  user: string;
  from: string;
  passwordSet: boolean;
  overridden: boolean;
}

export function useSmtpSettings(enabled: boolean) {
  return useQuery<SmtpSettings>({
    queryKey: ['admin', 'smtp-settings'],
    queryFn: async () => (await api.get('/admin/settings/smtp')).data.data,
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useUpdateSmtpSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { host?: string; port?: string; user?: string; from?: string; password?: string }) =>
      (await api.patch('/admin/settings/smtp', data)).data,
    onSuccess: () => invalidate(queryClient, 'smtp-settings'),
  });
}

// ---- Admin Accounts (multi-admin management) ----

export interface AdminAccount {
  Id: string;
  Username: string;
  Role: string;
  Status: string;
  SubmittedAt: string;
  ClassName?: string;
  Permissions?: TeacherPage[];
}

export function useAdminAccountsList(enabled: boolean) {
  return useAdminList<AdminAccount>('accounts', '/admin/accounts', enabled);
}

export function useCreateAdminAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; password: string; role: 'admin' | 'teacher'; className?: string; permissions?: TeacherPage[] }) =>
      (await api.post('/admin/accounts', data)).data,
    onSuccess: () => invalidate(queryClient, 'accounts'),
  });
}

export function useDeleteAdminAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/accounts/${id}`)).data,
    onSuccess: () => invalidate(queryClient, 'accounts'),
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await api.post('/admin/change-password', data)).data,
  });
}
