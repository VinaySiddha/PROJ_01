/**
 * @file Admin error logs viewer — paginated application error tracking table
 * @module app/(admin)/admin/error-logs/page
 */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

/** Severity badge colour map */
const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  error: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

/** Fetch paginated error logs */
function useErrorLogs(page: number, severity: string) {
  return useQuery({
    queryKey: ['admin', 'error-logs', page, severity],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20', ...(severity ? { severity } : {}) });
      const res = await apiClient.get(`/admin/error-logs?${params.toString()}`);
      return res.data as { data: Record<string, unknown>[]; pagination: Record<string, number> };
    },
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}

export default function AdminErrorLogsPage() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');

  const { data, isLoading, refetch } = useErrorLogs(page, severity);

  const logs = data?.data ?? [];
  const total = data?.pagination?.['total'] ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[#D4A017]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Error Logs
            </h1>
            <p className="text-[#888] text-sm">{total} total errors logged</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Severity filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'critical', 'error', 'warning', 'info'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setSeverity(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              severity === s
                ? 'bg-[#D4A017] text-black'
                : 'border border-white/10 text-[#888] hover:text-white hover:bg-white/5'
            }`}
          >
            {s === '' ? 'All Severities' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#D4A017]" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#1A1A1A]">
                    {['Time', 'Error Code', 'Severity', 'Message', 'Path', 'Request ID'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-[#888] uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#888]">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle size={28} className="text-[#D4A017]/20" />
                          <p>No errors logged. 🎉</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const master = log['errorMaster'] as Record<string, string> | undefined;
                      const sev = master?.['severity'] ?? 'info';
                      return (
                        <tr key={log['id'] as string} className="hover:bg-white/[0.015] transition-colors">
                          <td className="px-4 py-3 text-xs text-[#888] whitespace-nowrap">
                            {new Date(log['createdAt'] as string ?? log['created_at'] as string).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-[#D4A017]">
                              {log['errorCode'] as string ?? log['error_code'] as string}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_COLORS[sev] ?? 'bg-white/5 text-[#888] border-white/10'}`}>
                              {sev}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#888] max-w-[240px] truncate text-xs">
                            {master?.['message'] ?? log['message'] as string ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-[#555] max-w-[160px] truncate">
                            {log['requestPath'] as string ?? log['request_path'] as string ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-[#555] max-w-[120px] truncate">
                            {log['requestId'] as string ?? log['request_id'] as string ?? '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#888]">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} errors
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-3 py-1.5 text-[#888] text-xs">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
