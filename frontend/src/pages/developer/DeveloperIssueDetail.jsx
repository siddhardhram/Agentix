import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  FolderGit2, 
  Layers, 
  Check, 
  X, 
  AlertTriangle,
  FileCode2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Link as LinkIcon
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { getTicketById, updateTicket, insertAuditLog } from '../../services/supabase';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

export default function DeveloperIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById: getContextTicket, refreshTickets } = useTickets();
  const { user, profile } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const cached = getContextTicket(id);
      if (cached) {
        setTicket(cached);
        setLoading(false);
        return;
      }
      const data = await getTicketById(id);
      setTicket(data);
      setLoading(false);
    }
    load();
  }, [id, getContextTicket]);

  const handleApprove = async () => {
    if (!ticket) return;
    setProcessing(true);
    try {
      const updated = await updateTicket(ticket.id || ticket.ticket_ref, { status: 'resolved' });
      setTicket(prev => ({ ...prev, status: 'resolved' }));

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
      console.error('Approval failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!ticket) return;
    setProcessing(true);
    try {
      await updateTicket(ticket.id || ticket.ticket_ref, { status: 'open' });
      setTicket(prev => ({ ...prev, status: 'open' }));

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
      console.error('Rejection failed:', err);
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-slate-800/60" />
        <div className="h-32 rounded-xl bg-slate-900/60 border border-white/5" />
        <div className="h-48 rounded-xl bg-slate-900/60 border border-white/5" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
        <AlertTriangle size={32} className="text-amber-400 mb-3" />
        <h2 className="text-base font-bold text-white">Issue Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested issue could not be found.</p>
        <button
          onClick={() => navigate('/developer/issues')}
          className="mt-4 text-xs font-semibold text-blue-400 hover:underline"
        >
          &larr; Back to Assigned Issues
        </button>
      </div>
    );
  }

  const isAwaitingApproval = ticket.status === 'awaiting_approval';
  const relatedIds = Array.isArray(ticket.related_ids) 
    ? ticket.related_ids 
    : (typeof ticket.related_ids === 'string' ? JSON.parse(ticket.related_ids || '[]') : []);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/developer/issues')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Assigned Issues</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-base font-bold text-blue-400">
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
          </div>
          <span className="text-xs text-slate-400">
            Created: {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Approvals Action Banner if awaiting approval */}
      {isAwaitingApproval && (
        <Card className="border-purple-500/40 bg-purple-950/20 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-purple-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-purple-200">Awaiting Developer Approval</h4>
                <p className="text-[11px] text-purple-300/80">Authorize the patch or reject for re-investigation.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ShimmerButton
                onClick={handleApprove}
                disabled={processing}
                className="text-xs font-semibold px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500"
              >
                <Check size={14} className="mr-1.5" />
                Approve Patch
              </ShimmerButton>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center"
              >
                <X size={14} className="mr-1.5" />
                Reject
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description Card */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Issue Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>

          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Affected Area</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{ticket.affected_area || 'General'}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Category</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{ticket.category || 'code_fix'}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Priority</span>
              <span className="font-medium text-slate-200 mt-0.5 block capitalize">{ticket.priority}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Risk Tier</span>
              <span className="font-medium text-slate-200 mt-0.5 block capitalize">{ticket.risk_level}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Details: Root Cause, Repo Ref, Related IDs (Real fields only) */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-cyan-400" />
            <CardTitle className="text-sm font-bold text-white">Investigation Data</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Repository pointers, diagnosed root cause, and related incident IDs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Root Cause */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Root Cause</span>
            {ticket.root_cause ? (
              <p className="text-xs text-slate-200 font-mono bg-slate-950/70 p-3.5 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                {ticket.root_cause}
              </p>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-dashed border-white/10">
                <span className="text-xs text-slate-400">Root cause diagnosis in progress.</span>
              </div>
            )}
          </div>

          {/* Repo Ref */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Repository Reference</span>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-white/5">
              <FolderGit2 size={15} className="text-indigo-400 shrink-0" />
              <span>{ticket.repo_ref || 'main'}</span>
            </div>
          </div>

          {/* Related IDs */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Related Incident IDs</span>
            {relatedIds && relatedIds.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {relatedIds.map((relId, idx) => (
                  <span key={idx} className="flex items-center gap-1 font-mono text-[11px] text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                    <LinkIcon size={12} />
                    {relId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No related incidents linked.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resolution Summary if available */}
      {ticket.resolution_summary && (
        <Card className="border-emerald-500/30 bg-emerald-950/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <CardTitle className="text-sm font-bold text-white">Resolution Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
              {ticket.resolution_summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
