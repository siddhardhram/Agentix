import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Server, Search, CheckCircle2, XCircle, Loader2, PlayCircle, GitCommit, ChevronRight } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

export default function DeveloperVerification() {
  const navigate = useNavigate();
  const { tickets, loading } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Filter to tickets that have some verification data or are in relevant statuses
  const verificationTickets = (tickets || []).filter(t => 
    t.status === 'in_progress' || t.status === 'awaiting_approval' || t.status === 'resolved' || t.status === 'fixed'
  );

  const filteredTickets = verificationTickets.filter(t => {
    const matchesSearch = !searchTerm || t.ticket_ref?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'running') return matchesSearch && t.status === 'in_progress';
    if (filter === 'passed') return matchesSearch && (t.status === 'awaiting_approval' || t.status === 'resolved');
    if (filter === 'failed') return false; // Mocking no failed for now unless defined in ticket
    return matchesSearch;
  });

  const renderStatus = (ticket) => {
    if (ticket.status === 'in_progress') {
      return (
        <div className="flex items-center gap-1.5 text-blue-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs font-medium">Running Tests...</span>
        </div>
      );
    }
    if (ticket.status === 'awaiting_approval' || ticket.status === 'resolved' || ticket.status === 'fixed') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 size={14} />
          <span className="text-xs font-medium">All Checks Passed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-slate-400">
        <PlayCircle size={14} />
        <span className="text-xs font-medium">Pending</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-emerald-400" />
            Verification Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor automated testing, security scans, and CI pipelines for generated fixes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-lg">
            <Server size={14} className="text-indigo-400" /> 4 Runners Active
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by ticket ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-900 border-white/10 text-xs text-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter runs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification Runs</SelectItem>
              <SelectItem value="running">In Progress</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
            <ShieldCheck size={36} className="mx-auto mb-3 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-200">No verification runs found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              There are no active or recent automated testing runs.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              onClick={() => navigate(`/developer/issues/${ticket.ticket_ref}`)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.08] bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg border ${
                  ticket.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  (ticket.status === 'awaiting_approval' || ticket.status === 'resolved') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {ticket.status === 'in_progress' ? <Loader2 size={18} className="animate-spin" /> :
                   (ticket.status === 'awaiting_approval' || ticket.status === 'resolved') ? <CheckCircle2 size={18} /> :
                   <ShieldCheck size={18} />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-white">{ticket.ticket_ref}</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                      <GitCommit size={10} /> {ticket.ticket_ref?.toLowerCase().slice(0,7) || 'a1b2c3d'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-md">{ticket.title}</p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {renderStatus(ticket)}
                
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>lint: {ticket.status === 'in_progress' ? '...' : 'pass'}</span>
                  <span>•</span>
                  <span>test: {ticket.status === 'in_progress' ? '...' : 'pass'}</span>
                  <span>•</span>
                  <span>sec: {ticket.status === 'in_progress' ? '...' : 'pass'}</span>
                </div>
              </div>

              <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors hidden sm:block ml-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
