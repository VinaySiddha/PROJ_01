/**
 * @file Admin layout — wraps all admin pages with sidebar navigation
 * @module app/(admin)/admin/layout
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../components/admin/AdminSidebar';

/** Admin layout — checks for admin_token and renders the sidebar shell */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Guard: redirect to login if admin token is absent
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('admin_token')
        : null;
    if (!token) {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Scrollable main content area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
