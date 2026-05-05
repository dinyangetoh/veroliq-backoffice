'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminLogoutMutation } from '@/redux/api/adminApi';

export function LogoutButton() {
  const router = useRouter();
  const [logout, { isLoading }] = useAdminLogoutMutation();

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      // ignore — cookies cleared either way
    }
    router.replace('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      <LogOut className="w-5 h-5 text-gray-400" />
      {isLoading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
