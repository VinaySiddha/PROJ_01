/**
 * @file Admin dashboard home — KPI stats and upcoming bookings table
 * @module app/(admin)/admin/page
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, DollarSign, Star, TrendingUp, Phone, Mail, MessageCircle, MapPin, CreditCard, ExternalLink } from 'lucide-react';
import StatsCard from '../../../components/admin/StatsCard';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { apiClient } from '../../../lib/api';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingReviews: number;
  todayBookingsChange?: number;
  todayRevenueChange?: number;
}

interface UpcomingBooking {
  id: string;
  bookingRef: string;
  customerName: string;
  theaterName: string;
  bookingDate: string;
  slotName: string;
  totalAmount: number;
  status: string;
}

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

function useAdminStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DashboardStats }>(
        '/admin/dashboard/stats',
      );
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

function useSiteSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ['admin', 'settings-quick'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings');
      return (res.data as { data: Record<string, string> }).data ?? {};
    },
    staleTime: 300_000,
  });
}

function useUpcomingBookings() {
  return useQuery<UpcomingBooking[]>({
    queryKey: ['admin', 'upcoming'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UpcomingBooking[] }>(
        '/admin/dashboard/upcoming',
      );
      return res.data.data ?? [];
    },
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingBookings();
  const { data: siteInfo } = useSiteSettings();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Dashboard
        </h1>
        <p className="text-[#888] text-sm mt-1">Overview of today's activity</p>
      </div>

      {/* KPI stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Bookings"
            value={String(stats?.todayBookings ?? 0)}
            icon={CalendarCheck}
            iconColor="gold"
            change={stats?.todayBookingsChange}
          />
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(stats?.todayRevenue ?? 0)}
            icon={DollarSign}
            iconColor="green"
            change={stats?.todayRevenueChange}
          />
          <StatsCard
            title="This Month"
            value={formatCurrency(stats?.monthRevenue ?? 0)}
            icon={TrendingUp}
            iconColor="blue"
          />
          <StatsCard
            title="Pending Reviews"
            value={String(stats?.pendingReviews ?? 0)}
            icon={Star}
            iconColor="red"
          />
        </div>
      )}

      {/* Upcoming bookings section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Upcoming Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-[#D4A017] hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : !upcoming || upcoming.length === 0 ? (
          <div className="text-center py-10 text-[#888] border border-white/10 rounded-xl bg-[#1A1A1A]">
            <CalendarCheck size={32} className="mx-auto mb-2 text-[#888]" />
            <p>No upcoming bookings today.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#1A1A1A]">
                  {['Ref', 'Customer', 'Theater', 'Date', 'Slot', 'Amount', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {upcoming.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#D4A017]">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="hover:underline"
                      >
                        {b.bookingRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white">{b.customerName}</td>
                    <td className="px-4 py-3 text-[#888]">{b.theaterName}</td>
                    <td className="px-4 py-3 text-[#888]">
                      {formatDate(b.bookingDate)}
                    </td>
                    <td className="px-4 py-3 text-[#888]">{b.slotName}</td>
                    <td className="px-4 py-3 text-[#D4A017] font-medium">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Site contact info quick view */}
      {siteInfo && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Site Info</h2>
            <Link
              href="/admin/settings"
              className="flex items-center gap-1 text-sm text-[#D4A017] hover:underline"
            >
              Edit <ExternalLink size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Phone,         label: 'Support Phone',  value: siteInfo['support_phone'] },
              { icon: Mail,          label: 'Support Email',  value: siteInfo['support_email'] },
              { icon: MessageCircle, label: 'WhatsApp',       value: siteInfo['whatsapp_number'] },
              { icon: CreditCard,    label: 'UPI ID',         value: siteInfo['upi_id'] },
              { icon: MapPin,        label: 'Address',        value: siteInfo['address'] },
            ]
              .filter((item) => item.value)
              .map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-[#1A1A1A]"
                >
                  <Icon size={15} className="text-[#D4A017] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#888] mb-0.5">{label}</p>
                    <p className="text-sm text-white truncate">{value}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
