import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  FolderGit2,
  FileText
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { updateTicket, insertAuditLog } from '../../services/supabase';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

export default function ApprovalsPage() {
  const { tickets, loading, refreshTickets } = useTickets();
  const { user, profile } = useAuth();
  const [processingId, setProcessingId] = useState(null);

  const pendingApprovals = (tickets || []).filter(t => t.status === 'awaiting_approval');

  const handleApprove = async (ticket) => {
    setProcessingId(ticket.id || ticket.ticket_ref);
    try {
      await updateTicket(ticket.id || ticket.ticket_ref, { status: 'resolved' });

      await insertAuditLog({
        ticketId: ticket.id,
        action: 'TICKET_APPROVED',
        actorId: user?.id || null,
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
      await updateTicket(ticket.id || ticket.ticket_ref, { status: 'open' });

      await insertAuditLog({
        ticketId: ticket.id,
        action: 'TICKET_REJECTED',
        actorId: user?.id || null,
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Approvals Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop authorization gates for patch deployment.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Layers size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No pending approvals</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            All issue patches have been reviewed or no tickets currently require manual authorization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingApprovals.map((ticket) => (
            <Card key={ticket.id || ticket.ticket_ref} className="border-purple-500/30 bg-slate-900/70 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
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
                      <div className="bg-slate-950/70 p-3 rounded-lg border border-white/5">
                        <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">Root Cause Diagnosis</span>
                        <p className="text-xs font-mono text-slate-300 mt-1 whitespace-pre-wrap">{ticket.root_cause}</p>
                      </div>
                    )}

                    {ticket.resolution_summary && (
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Proposed Action</span>
                        <p className="text-xs text-slate-300 mt-0.5">{ticket.resolution_summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end lg:self-center">
                    <ShimmerButton
                      onClick={() => handleApprove(ticket)}
                      disabled={processingId === (ticket.id || ticket.ticket_ref)}
                      className="text-xs font-semibold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500"
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
  );
}
