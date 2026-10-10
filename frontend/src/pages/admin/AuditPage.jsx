import React, { useEffect, useState, useCallback } from 'react';
import { getLoginHistory } from '../../services/supabase';
import { History, RefreshCw, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

const PAGE_SIZE = 25;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function AuditPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [successFilter, setSuccessFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const successParam = successFilter === 'all' ? null : successFilter === 'true';
      const { records: data, total: count } = await getLoginHistory({
        page,
        pageSize: PAGE_SIZE,
        success: successParam,
        fromDate: fromDate || null,
        toDate: toDate ? toDate + 'T23:59:59Z' : null,
      });
      setRecords(data);
      setTotal(count);
    } catch (err) {
      setError(err.message || 'Failed to load login history. Check your admin permissions.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, successFilter, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleExport = () => {
    const csv = [
      'Timestamp,Email,Role,IP Address,User Agent,Result,Reason',
      ...records.map(r =>
        [
          formatDate(r.created_at),
          r.email_attempted,
          r.role || '—',
          r.ip_address || '—',
          `"${(r.user_agent || '').replace(/"/g, "'")}"`,
          r.success ? 'SUCCESS' : 'FAILED',
          r.failure_reason || '—',
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentix_login_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History size={20} className="text-indigo-400" />
            Audit &amp; Login History
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Every authentication attempt — success and failure — logged in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-900/60 px-4 py-3">
        <Filter size={13} className="text-slate-500 shrink-0" />
        
        <div className="flex items-center gap-2 w-36">
          <label className="text-xs text-slate-400">Status</label>
          <Select
            value={successFilter}
            onValueChange={val => { setSuccessFilter(val); setPage(1); }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Success</SelectItem>
              <SelectItem value="false">Failures</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-[var(--border-card)] bg-[var(--bg-input)] px-2 text-xs text-[var(--text-main)] outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-[var(--border-card)] bg-[var(--bg-input)] px-2 text-xs text-[var(--text-main)] outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {(successFilter !== 'all' || fromDate || toDate) && (
          <button
            onClick={() => { setSuccessFilter('all'); setFromDate(''); setToDate(''); setPage(1); }}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-500">{total} total records</span>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-slate-950/40">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email Attempted</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">IP Address</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Result</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && records.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-3/4 rounded bg-slate-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No login attempts found for the selected filters.
                  </td>
                </tr>
              ) : (
                records.map(row => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-slate-400 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium max-w-[200px] truncate">
                      {row.email_attempted}
                    </td>
                    <td className="px-4 py-3">
                      {row.role ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border
                          ${row.role === 'admin' ? 'bg-purple-950/60 text-purple-300 border-purple-800/50' :
                            row.role === 'developer' ? 'bg-blue-950/60 text-blue-300 border-blue-800/50' :
                            'bg-slate-800/60 text-slate-300 border-slate-700/50'}`}
                        >
                          {row.role}
                        </span>
                      ) : <span className="text-slate-600 text-[12px]">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-slate-400">
                      {row.ip_address || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.success ? (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400">
                          <CheckCircle2 size={13} /> SUCCESS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-400">
                          <XCircle size={13} /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-500 max-w-[180px] truncate">
                      {row.failure_reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
