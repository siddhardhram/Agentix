import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Inbox, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Layers,
  FileText
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { NumberTicker } from '../../components/magicui/number-ticker';
import { BorderBeam } from '../../components/magicui/border-beam';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { AnimatedList, AnimatedListItem } from '../../components/magicui/animated-list';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { tickets, loading, createTicket, refreshTickets } = useTickets();
  const { user, profile } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state - exactly matches tickets schema: description, affected_area, priority, repo_ref
  const [description, setDescription] = useState('');
  const [affectedArea, setAffectedArea] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [repoRef, setRepoRef] = useState('');

  // Scope tickets to current user (raised_by === user.id or user.email)
  const currentUserId = user?.id;
  const userTickets = (tickets || []).filter(t => 
    (currentUserId && (t.raised_by === currentUserId || t.raised_by_raw === currentUserId)) ||
    (user?.email && (t.raised_by === user.email || t.raised_by_email === user.email)) ||
    (!t.raised_by) || (t.raised_by === 'anonymous_user')
  );

  // Stats calculation
  const openCount = userTickets.filter(t => t.status === 'open').length;
  const resolvedCount = userTickets.filter(t => t.status === 'resolved' || t.status === 'closed' || t.status === 'fixed').length;
  const awaitingResponseCount = userTickets.filter(t => t.status === 'awaiting_response' || t.status === 'in_progress' || t.status === 'triaged' || t.status === 'awaiting_approval').length;

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a ticket description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTicket({
        description: description.trim(),
        affected_area: affectedArea,
        priority: priority,
        repo_ref: repoRef.trim() || 'main'
      });

      setDescription('');
      setAffectedArea('General');
      setPriority('medium');
      setRepoRef('');
      setIsCreateOpen(false);
      if (refreshTickets) await refreshTickets();
    } catch (err) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Report technical incidents, track status, and view diagnosis updates.
          </p>
        </div>

        <ShimmerButton
          onClick={() => setIsCreateOpen(true)}
          className="shadow-lg shadow-indigo-500/20 text-xs font-semibold px-4 py-2.5 h-10"
        >
          <PlusCircle size={15} className="mr-2" />
          <span>Raise a Ticket</span>
        </ShimmerButton>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Open Count */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={0} colorFrom="#3b82f6" colorTo="#60a5fa" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Open Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Inbox size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={openCount} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting triage &amp; agent pickup</p>
        </div>

        {/* Resolved Count */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={2} colorFrom="#10b981" colorTo="#34d399" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resolved</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={resolvedCount} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified fixes &amp; completed issues</p>
        </div>

        {/* Awaiting Response Count */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-sm">
          <BorderBeam size={100} duration={8} delay={4} colorFrom="#a855f7" colorTo="#c084fc" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Awaiting Response</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              <NumberTicker value={awaitingResponseCount} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active diagnosis &amp; review gates</p>
        </div>
      </div>

      {/* My Tickets List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">My Tickets</h2>
          <span className="text-xs text-slate-400">{userTickets.length} total</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        ) : userTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No tickets yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              You haven't reported any issues yet. Click &quot;Raise a Ticket&quot; to report a bug or system incident.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Raise your first ticket &rarr;
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {userTickets.map((ticket) => (
              <div
                key={ticket.id || ticket.ticket_ref}
                onClick={() => navigate(`/user/tickets/${ticket.id || ticket.ticket_ref}`)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/[0.07] bg-slate-900/50 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {ticket.ticket_ref || 'TCK-NEW'}
                    </span>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    {getRiskBadge(ticket.risk_level)}
                    {ticket.affected_area && (
                      <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-white/[0.05]">
                        {ticket.affected_area}
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
                  <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise a Ticket Modal Form (Exact fields: description, affected_area, priority, repo_ref) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PlusCircle size={18} className="text-indigo-500" />
              Raise a New Ticket
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submit your issue to the autonomous diagnosis pipeline. All fields map directly to system schema.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="ticket-desc" className="text-xs font-semibold text-[var(--text-main)]">
                Description <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="ticket-desc"
                rows={3}
                placeholder="Explain what happened, steps to reproduce, or error messages..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            {/* Affected Area & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ticket-area" className="text-xs font-semibold text-[var(--text-main)]">
                  Affected Area
                </Label>
                <Select value={affectedArea} onValueChange={setAffectedArea}>
                  <SelectTrigger id="ticket-area">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                    <SelectItem value="API & Backend">API & Backend</SelectItem>
                    <SelectItem value="Frontend UI">Frontend UI</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Payments">Payments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-priority" className="text-xs font-semibold text-[var(--text-main)]">
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="ticket-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Repo Ref */}
            <div className="space-y-1.5">
              <Label htmlFor="ticket-repo" className="text-xs font-semibold text-[var(--text-main)]">
                Repository / Branch Reference
              </Label>
              <Input
                id="ticket-repo"
                placeholder="e.g. main, feature/auth, demo_repos/sample_calc"
                value={repoRef}
                onChange={(e) => setRepoRef(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-secondary)] border border-[var(--border-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                Cancel
              </button>
              <ShimmerButton
                type="submit"
                disabled={submitting}
                className="text-xs font-semibold px-5 py-2"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </ShimmerButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
