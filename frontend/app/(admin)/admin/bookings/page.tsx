/**
 * @file Admin bookings list — filterable, paginated bookings table
 * @module app/(admin)/admin/bookings/page
 */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BookingsTable from '../../../../components/admin/BookingsTable';
import { Search, Filter } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import type { Booking, BookingStatus } from '../../../../types/booking';

/** Shape of the paginated response from the admin bookings API */
interface AdminBookingsResponse {
  data: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/** TanStack query for the admin bookings list */
function useAdminBookings(page: number, search: string, status: string) {
  return useQuery<AdminBookingsResponse>({
    queryKey: ['admin', 'bookings', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      const res = await apiClient.get<AdminBookingsResponse>(
        `/admin/bookings?${params.toString()}`,
      );
      return res.data;
    },
  });
}

/** Booking status filter options */
const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '',          label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending',   label: 'Pending' },
];

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useAdminBookings(page, search, status);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Bookings
        </h1>
        <p className="text-[#888] text-sm mt-1">Manage all customer bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, or booking ref..."
            className="flex-1 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 border border-white/10 rounded-xl text-[#888] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Search bookings"
          >
            <Search size={16} />
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#888] flex-shrink-0" />
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <BookingsTable
        bookings={data?.data ?? []}
        total={data?.meta.total ?? 0}
        page={page}
        limit={20}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
