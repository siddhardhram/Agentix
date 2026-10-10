import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode2, CheckCircle, XCircle, Clock, GitMerge, Search, Filter, AlertTriangle } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { useAuth } from '../../context/AuthContext';

export default function DeveloperFixes() {
  const navigate = useNavigate();
  const { tickets, loading, approvePatch, rejectPatch } = useTickets();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fixTickets = (tickets || []).filter(t => 
    t.status === 'awaiting_approval' || t.status === 'resolved' || t.status === 'fixed'
  );

  const filteredTickets = fixTickets.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.ticket_ref && t.ticket_ref.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'awaiting_approval': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30"><Clock size={12} className="mr-1"/> PENDING REVIEW</Badge>;
      case 'resolved':
      case 'fixed': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"><CheckCircle size={12} className="mr-1"/> APPROVED</Badge>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCode2 size={24} className="text-indigo-400" />
            Generated Fixes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve AI-generated code patches before merging.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by ticket ref or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-900 border-white/10 text-xs text-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fixes</SelectItem>
              <SelectItem value="awaiting_approval">Pending Review</SelectItem>
              <SelectItem value="resolved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
            <FileCode2 size={36} className="mx-auto mb-3 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-200">No generated fixes found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              There are no patches waiting for review at this time.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-white/[0.08] bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-400">{ticket.ticket_ref}</span>
                  {getStatusBadge(ticket.status)}
                  {ticket.risk_level === 'high' && (
                    <span className="text-[11px] flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertTriangle size={10} /> High Risk Fix
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-200 truncate">{ticket.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ticket.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded border border-white/5 text-slate-300">
                    <GitMerge size={10} className="inline mr-1 text-slate-500"/>
                    branch: fix/{ticket.ticket_ref?.toLowerCase()}
                  </span>
                  <span className="text-[10px] bg-slate-950 px-2 py-1 rounded border border-white/5 text-slate-300">
                    +14 lines, -3 lines
                  </span>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
                {ticket.status === 'awaiting_approval' && (
                  <>
                    <button 
                      onClick={() => approvePatch(ticket.id, user?.full_name)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors text-xs font-medium"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => rejectPatch(ticket.id, user?.full_name)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors text-xs font-medium"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => navigate(`/developer/issues/${ticket.ticket_ref}`)}
                  className="w-full text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
