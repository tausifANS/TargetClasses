export type AuthRole = 'admin' | 'student' | 'user';

const KEYS: Record<AuthRole, string> = {
  admin: 'tc_admin_token',
  student: 'tc_student_token',
  user: 'tc_user_token',
};

export function getToken(role: AuthRole) {
  return sessionStorage.getItem(KEYS[role]);
}

export function setToken(role: AuthRole, token: string) {
  sessionStorage.setItem(KEYS[role], token);
}

export function clearToken(role: AuthRole) {
  sessionStorage.removeItem(KEYS[role]);
}
