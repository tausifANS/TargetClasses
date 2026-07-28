import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

let roleCache = null;
/** Roles are a tiny, effectively-static lookup table — cache them for process lifetime. */
export async function getRoleIdByName(name) {
  if (!roleCache) {
    const { data, error } = await supabaseAdmin.from('roles').select('id, name');
    if (error) throw ApiError.internal(error.message);
    roleCache = new Map(data.map((r) => [r.name, r.id]));
  }
  const id = roleCache.get(name);
  if (!id) throw ApiError.internal(`Unknown role: ${name}`);
  return id;
}

export async function getUserById(id) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, phone, role_id, must_change_password, is_active, roles(name)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, phone, password_hash, role_id, must_change_password, is_active, roles(name)')
    .eq('email', email)
    .maybeSingle();
  if (error) throw ApiError.internal(error.message);
  return data;
}

/** Students may log in with their Student ID instead of an email. */
export async function getUserByStudentCode(studentCode) {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('user_id, users(id, email, phone, password_hash, role_id, must_change_password, is_active, roles(name))')
    .eq('student_code', studentCode)
    .maybeSingle();
  if (error) throw ApiError.internal(error.message);
  return data?.users ?? null;
}

export async function createUser({ email, phone, passwordHash, roleName, mustChangePassword = false }) {
  const roleId = await getRoleIdByName(roleName);
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: email ?? null,
      phone: phone ?? null,
      password_hash: passwordHash,
      role_id: roleId,
      must_change_password: mustChangePassword,
    })
    .select('id, email, role_id')
    .single();
  if (error) {
    if (error.code === '23505') throw ApiError.conflict('An account with this email already exists');
    throw ApiError.internal(error.message);
  }
  return data;
}

export async function updatePassword(userId, passwordHash, { mustChangePassword = false } = {}) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: mustChangePassword })
    .eq('id', userId);
  if (error) throw ApiError.internal(error.message);
}

export async function touchLastLogin(userId) {
  await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', userId);
}

export async function setActive(userId, isActive) {
  const { error } = await supabaseAdmin.from('users').update({ is_active: isActive }).eq('id', userId);
  if (error) throw ApiError.internal(error.message);
}
