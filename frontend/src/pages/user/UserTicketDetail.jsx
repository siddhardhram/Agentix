import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FolderGit2, 
  ShieldAlert,
  Search,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { getTicketById } from '../../services/supabase';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

export default function UserTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById: getContextTicket } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">OPEN</Badge>;
      case 'in_progress':
      case 'triaged':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">IN PROGRESS</Badge>;
      case 'awaiting_approval':
      case 'awaiting_response':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">AWAITING REVIEW</Badge>;
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
        <h2 className="text-base font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested ticket could not be found or you may not have permission to view it.</p>
        <button
          onClick={() => navigate('/user/tickets')}
          className="mt-4 text-xs font-semibold text-indigo-400 hover:underline"
        >
          &larr; Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Back button & Title header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/user/tickets')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to My Tickets</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-base font-bold text-indigo-400">
              {ticket.ticket_ref || 'TCK-NEW'}
            </span>
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            {getRiskBadge(ticket.risk_level)}
          </div>
          <span className="text-xs text-slate-400">
            Created: {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Description Card */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>

          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Affected Area</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{ticket.affected_area || 'General'}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Repository Ref</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{ticket.repo_ref || 'main'}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Status</span>
              <span className="font-medium text-slate-200 mt-0.5 block capitalize">{ticket.status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Root Cause Card (Real field only) */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-cyan-400" />
            <CardTitle className="text-sm font-bold text-white">Root Cause Diagnosis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {ticket.root_cause ? (
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-white/[0.06] font-mono">
              {ticket.root_cause}
            </p>
          ) : (
            <div className="p-4 rounded-lg bg-slate-950/30 border border-dashed border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Root cause investigation is currently in progress by the autonomous agent pipeline.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Summary Card (Real field only) */}
      <Card className="border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck2 size={16} className="text-emerald-400" />
            <CardTitle className="text-sm font-bold text-white">Resolution Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {ticket.resolution_summary ? (
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/20">
              {ticket.resolution_summary}
            </p>
          ) : (
            <div className="p-4 rounded-lg bg-slate-950/30 border border-dashed border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Resolution summary will appear here once the patch is verified and closed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
