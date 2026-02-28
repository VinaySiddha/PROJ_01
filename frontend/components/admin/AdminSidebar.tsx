/**
 * @file AdminSidebar — collapsible navigation sidebar for the admin panel
 * @module components/admin/AdminSidebar
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Star,
  Tag,
  Settings,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Clapperboard,
} from 'lucide-react';

/** Nav item definition */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** Admin navigation items */
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Theaters', href: '/admin/theaters', icon: Building2 },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Offers', href: '/admin/offers', icon: Tag },
  { label: 'Error Logs', href: '/admin/error-logs', icon: AlertTriangle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * AdminSidebar — fixed left sidebar with nav links for the admin panel.
 * Active link is highlighted with gold accent.
 *
 * @returns A sticky sidebar element with branded header, nav links, and a sign-out button
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  /**
   * Check if a nav item is active.
   * Exact match for dashboard, prefix match for others.
   *
   * @param href - The nav item href to test against the current pathname
   * @returns True when the current route matches or starts with the given href
   */
  const isActive = (href: string): boolean => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Clapperboard size={24} className="text-accent" />
          <div>
            <span className="font-bold text-foreground text-sm block">CineNest</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={16}
                  className={active ? 'text-accent' : 'text-current'}
                />
                {item.label}
              </div>
              {active && <ChevronRight size={14} className="text-accent" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: back to site + logout */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Clapperboard size={16} />
          View Site
        </Link>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
