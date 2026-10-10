import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, 
  Search, 
  Filter, 
  ArrowRight, 
  Code2,
  AlertCircle
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

export default function DeveloperIssues() {
  const navigate = useNavigate();
  const { tickets, loading } = useTickets();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentUserId = user?.id;
  const allTickets = tickets || [];
  const assignedTickets = allTickets.filter(t => 
    (currentUserId && t.assignee === currentUserId) ||
    (!t.assignee)
  );

  const filteredTickets = assignedTickets.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.ticket_ref && t.ticket_ref.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">OPEN</Badge>;
      case 'in_progress':
      case 'triaged':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">IN PROGRESS</Badge>;
      case 'awaiting_approval':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">AWAITING APPROVAL</Badge>;
      case 'resolved':
      case 'fixed':
      case 'closed':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">RESOLVED</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-700 text-slate-300">{status?.toUpperCase() || 'OPEN'}</Badge>;
    }
  };

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive" className="bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/15 text-orange-400 border border-orange-500/30">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">MEDIUM</Badge>;
      case 'low':
      default:
        return <Badge className="bg-slate-800 text-slate-400 border border-slate-700">LOW</Badge>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">High Risk</span>;
      case 'medium':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium Risk</span>;
      case 'low':
      default:
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Low Risk</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assigned Issues</h1>
          <p className="text-xs text-slate-400 mt-1">
            Issues assigned to you or open in the engineering queue.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
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

        <div className="flex items-center gap-2 w-full sm:w-56">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <Code2 size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {assignedTickets.length === 0 ? "No assigned issues" : "No matching issues found"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {assignedTickets.length === 0 
              ? "Your queue is currently clear."
              : "Try adjusting your search query or status filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id || ticket.ticket_ref}
              onClick={() => navigate(`/developer/issues/${ticket.id || ticket.ticket_ref}`)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/[0.07] bg-slate-900/50 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {ticket.ticket_ref || 'TCK-NEW'}
                  </span>
                  {ticket.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {ticket.category}
                    </span>
                  )}
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  {getRiskBadge(ticket.risk_level)}
                  {ticket.repo_ref && (
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
                      {ticket.repo_ref}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-200 font-medium line-clamp-1 mt-0.5">
                  {ticket.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[11px] text-slate-400">
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Just now'}
                </span>
                <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
