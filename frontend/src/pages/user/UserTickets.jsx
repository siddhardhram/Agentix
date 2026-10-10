import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Ticket, 
  ArrowRight, 
  Search,
  Filter,
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { Badge } from '../../components/ui/badge';
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

export default function UserTickets() {
  const navigate = useNavigate();
  const { tickets, loading, createTicket, refreshTickets, deleteTicket } = useTickets();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [description, setDescription] = useState('');
  const [affectedArea, setAffectedArea] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [repoRef, setRepoRef] = useState('');

  // Scope to current user
  const currentUserId = user?.id;
  const userTickets = (tickets || []).filter(t => 
    (currentUserId && (t.raised_by === currentUserId || t.raised_by_raw === currentUserId)) ||
    (user?.email && (t.raised_by === user.email || t.raised_by_email === user.email)) ||
    (!t.raised_by) || (t.raised_by === 'anonymous_user')
  );

  const filteredTickets = userTickets.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.ticket_ref && t.ticket_ref.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tickets</h1>
          <p className="text-xs text-slate-400 mt-1">
            All technical tickets submitted by your account.
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

      {/* Tickets List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {userTickets.length === 0 ? "No tickets yet" : "No matching tickets found"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {userTickets.length === 0 
              ? "You haven't reported any issues yet. Click 'Raise a Ticket' to report a bug or system incident."
              : "Try adjusting your search query or status filter."}
          </p>
          {userTickets.length === 0 && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Raise your first ticket &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredTickets.map((ticket) => (
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
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this ticket?')) {
                      deleteTicket(ticket.id || ticket.ticket_ref);
                    }
                  }}
                  className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="Delete ticket"
                >
                  <Trash2 size={14} />
                </button>

                <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raise a Ticket Modal Form */}
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
            <div className="space-y-1.5">
              <Label htmlFor="t-desc" className="text-xs font-semibold text-[var(--text-main)]">
                Description <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="t-desc"
                rows={3}
                placeholder="Explain what happened, steps to reproduce, or error messages..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-area" className="text-xs font-semibold text-[var(--text-main)]">
                  Affected Area
                </Label>
                <Select value={affectedArea} onValueChange={setAffectedArea}>
                  <SelectTrigger id="t-area">
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
                <Label htmlFor="t-priority" className="text-xs font-semibold text-[var(--text-main)]">
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="t-priority">
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

            <div className="space-y-1.5">
              <Label htmlFor="t-repo" className="text-xs font-semibold text-[var(--text-main)]">
                Repository / Branch Reference
              </Label>
              <Input
                id="t-repo"
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
