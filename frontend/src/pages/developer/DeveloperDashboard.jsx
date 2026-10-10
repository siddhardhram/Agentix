import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Code2,
  FileCode2,
  Search,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { insertAuditLog, updateTicket } from '../../services/supabase';
import { NumberTicker } from '../../components/magicui/number-ticker';
import { BorderBeam } from '../../components/magicui/border-beam';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const { tickets, loading, refreshTickets } = useTickets();
  const { user, profile } = useAuth();

  const [processingId, setProcessingId] = useState(null);
  const currentUserId = user?.id;

  // Scoped to developer (assignee === user.id or all active issues for developer review)
  const allTickets = tickets || [];
  const assignedTickets = allTickets.filter(t => 
    (currentUserId && t.assignee === currentUserId) ||
    (!t.assignee) // Unassigned issues available for developer pickup
  );

  const pendingApprovals = allTickets.filter(t => t.status === 'awaiting_approval');
  const resolvedByThem = allTickets.filter(t => 
    (t.status === 'resolved' || t.status === 'closed' || t.status === 'fixed') &&
    (t.assignee === currentUserId || !t.assignee)
  );

  const handleApprove = async (ticket) => {
    setProcessingId(ticket.id || ticket.ticket_ref);
    try {
      // 1. Update ticket status in tickets table
      await updateTicket(ticket.id || ticket.ticket_ref, { status: 'resolved' });

      // 2. Insert real audit_log row
      await insertAuditLog({
        ticketId: ticket.id,
        action: 'TICKET_APPROVED',
        actorId: currentUserId || null,
        details: {
          ticket_ref: ticket.ticket_ref,
          risk_level: ticket.risk_level,
          reviewer_name: profile?.full_name || user?.email || 'Developer',
          approved_at: new Date().toISOString()
        }
      });

      if (refreshTickets) await refreshTickets();
    } catch (err) {
      console.error('Failed to approve ticket:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (ticket) => {
    setProcessingId(ticket.id || ticket.ticket_ref);
    try {
      // 1. Update ticket status in tickets table
      await updateTicket(ticket.id || ticket.ticket_ref, { status: 'open' });

      // 2. Insert real audit_log row
      await insertAuditLog({
        ticketId: ticket.id,
        action: 'TICKET_REJECTED',
        actorId: currentUserId || null,
        details: {
          ticket_ref: ticket.ticket_ref,
          risk_level: ticket.risk_level,
          reviewer_name: profile?.full_name || user?.email || 'Developer',
          rejected_at: new Date().toISOString()
        }
      });

      if (refreshTickets) await refreshTickets();
    } catch (err) {
      console.error('Failed to reject ticket:', err);
    } finally {
      setProcessingId(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Developer Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review assigned issues, inspect root cause diagnostics, and authorize code patches.
          </p>
        </div>
      </div>

      {/* Stats Row (NumberTicker + BorderBeam) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Assigned Issues */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={0} colorFrom="#3b82f6" colorTo="#60a5fa" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned Issues</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <GitPullRequest size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={assignedTickets.length} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active issues in development pipeline</p>
        </div>

        {/* Pending Approvals */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={2} colorFrom="#a855f7" colorTo="#c084fc" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={pendingApprovals.length} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Human-in-the-loop sign-off gates</p>
        </div>

        {/* Resolved By Dev */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={4} colorFrom="#10b981" colorTo="#34d399" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resolved</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={resolvedByThem.length} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified patches &amp; closed incidents</p>
        </div>
      </div>

      {/* Approvals Queue Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">Approvals Queue</h2>
          </div>
          <span className="text-xs text-slate-400">{pendingApprovals.length} pending review</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
            <p className="text-xs text-slate-400">No pending approvals in queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingApprovals.map((ticket) => (
              <Card key={ticket.id || ticket.ticket_ref} className="border-purple-500/30 bg-slate-900/70 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-400">{ticket.ticket_ref}</span>
                        {getRiskBadge(ticket.risk_level)}
                        {ticket.repo_ref && (
                          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
                            {ticket.repo_ref}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Description</span>
                        <p className="text-xs text-slate-200 mt-0.5">{ticket.description}</p>
                      </div>

                      {ticket.root_cause && (
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">Root Cause</span>
                          <p className="text-xs font-mono text-slate-300 mt-0.5">{ticket.root_cause}</p>
                        </div>
                      )}

                      {ticket.resolution_summary && (
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Proposed Action</span>
                          <p className="text-xs text-slate-300 mt-0.5">{ticket.resolution_summary}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                      <ShimmerButton
                        onClick={() => handleApprove(ticket)}
                        disabled={processingId === (ticket.id || ticket.ticket_ref)}
                        className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Check size={14} className="mr-1.5" />
                        Approve Patch
                      </ShimmerButton>
                      <button
                        onClick={() => handleReject(ticket)}
                        disabled={processingId === (ticket.id || ticket.ticket_ref)}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-center w-full"
                      >
                        <X size={14} className="mr-1.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Issues List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">Assigned Issues</h2>
          </div>
          <span className="text-xs text-slate-400">{assignedTickets.length} total</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        ) : assignedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Code2 size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No assigned issues</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Your development issue queue is clean. When tickets are raised or assigned, they will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {assignedTickets.map((ticket) => (
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
    </div>
  );
}
