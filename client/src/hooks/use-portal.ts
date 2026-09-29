import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth-store';

export interface StudentProfile {
  studentId: string;
  studentName: string;
  className: string;
  email?: string;
  parentPhone?: string;
  status?: string;
}

export interface ClassItem {
  Id: string;
  Title: string;
  Subject: string;
  ClassName: string;
  Type: 'Live' | 'Recorded';
  Url: string;
  ScheduledAt?: string;
}

export interface AttendanceRecord {
  Id: string;
  StudentId: string;
  Date: string;
  PunchIn?: string;
  PunchOut?: string;
  PhotoUrl?: string;
}

export function useIsStudentLoggedIn() {
  return !!getToken('student');
}

export function usePortalLogin() {
  return useMutation({
    mutationFn: async (data: { studentId: string; password: string }) => {
      const res = await api.post<{ data: { accessToken: string; student: StudentProfile } }>('/portal/login', data);
      return res.data.data;
    },
    onSuccess: (data) => setToken('student', data.accessToken),
  });
}

export function usePortalForgotPassword() {
  return useMutation({
    mutationFn: async (data: { studentId: string }) => (await api.post('/portal/forgot-password', data)).data,
  });
}

export function usePortalResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => (await api.post('/portal/reset-password', data)).data,
  });
}

export function usePortalLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken('student');
    queryClient.removeQueries({ queryKey: ['portal'] });
  };
}

export function usePortalMe(enabled: boolean) {
  return useQuery<StudentProfile>({
    queryKey: ['portal', 'me'],
    queryFn: async () => (await api.get('/portal/me')).data.data,
    enabled,
    retry: false,
  });
}

export function usePortalClasses(enabled: boolean) {
  return useQuery<ClassItem[]>({
    queryKey: ['portal', 'classes'],
    queryFn: async () => (await api.get('/portal/classes')).data.data ?? [],
    enabled,
    retry: false,
  });
}

export function usePortalAttendance(enabled: boolean) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['portal', 'attendance'],
    queryFn: async () => (await api.get('/portal/attendance/history')).data.data ?? [],
    enabled,
    retry: false,
  });
}

export function usePunchIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data?: { photo?: string }) => (await api.post('/portal/attendance/punch-in', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'attendance'] }),
  });
}

export function usePunchOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/portal/attendance/punch-out')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'attendance'] }),
  });
}

export function usePortalQuestions(className: string, enabled: boolean) {
  return useQuery<Array<Record<string, string>>>({
    queryKey: ['portal', 'questions', className],
    queryFn: async () => (await api.get(`/questions?className=${encodeURIComponent(className)}`)).data.data ?? [],
    enabled,
    retry: false,
  });
}

export function usePortalNotes(className: string, enabled: boolean) {
  return useQuery<Array<Record<string, string>>>({
    queryKey: ['portal', 'notes', className],
    queryFn: async () => (await api.get(`/notes?className=${encodeURIComponent(className)}`)).data.data ?? [],
    enabled,
    retry: false,
  });
}

export function usePortalResults(className: string, enabled: boolean) {
  return useQuery<Array<Record<string, string>>>({
    queryKey: ['portal', 'results', className],
    queryFn: async () => (await api.get(`/results?className=${encodeURIComponent(className)}`)).data.data ?? [],
    enabled,
    retry: false,
  });
}

export function usePortalApplication() {
  return useMutation({
    mutationFn: async (data: {
      studentName: string;
      dob: string;
      className: string;
      subjects?: string;
      parentName: string;
      parentPhone: string;
      email: string;
      address: string;
    }) => api.post('/inquiries/portal-application', data),
  });
}
