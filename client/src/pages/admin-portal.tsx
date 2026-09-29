import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminShell } from '@/components/admin/admin-shell';
import { useIsAdminLoggedIn, useAdminLogout } from '@/hooks/use-admin';
import { AdminLoginPanel } from '@/pages/admin/login';

export function AdminPortalPage() {
  const [loggedIn, setLoggedIn] = useState(useIsAdminLoggedIn());
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  if (!loggedIn) return <AdminLoginPanel onSuccess={() => setLoggedIn(true)} />;

  return (
    <AdminShell onLogout={handleLogout}>
      <Outlet />
    </AdminShell>
  );
}
