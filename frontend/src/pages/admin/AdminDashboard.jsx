import React from 'react';
import { 
  Users, 
  Briefcase, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  History,
  Settings
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge, PriorityBadge } from '../../components/shared/Badges';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { MOCK_USERS_LIST, MOCK_AGENT_METRICS, MOCK_SYSTEM_HEALTH } from '../../services/mockData';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ onNavigate }) {
  const navigate = useNavigate();
  const nav = onNavigate || navigate;
  const { tickets } = useTickets();
  const { user, profile } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const totalTickets = tickets.length;
  const openIssues = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'resolved').length;
  const resolvedIssues = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'resolved').length;
  const humanApprovals = tickets.filter((t) => (t.status || '').includes('APPROVAL') || (t.status || '').includes('approval') || t.risk_level === 'HIGH' || t.risk_level === 'critical').length;

  return (
    <div className="admin-dashboard-container flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={`Admin Control Center — ${displayName}`}
        description="Monitor system-wide autonomous issue resolution, manage user roles, audit cryptographic logs, and tune policy guardrails."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => nav('/admin/audit')} className="gap-2">
              <History size={14} />
              <span>Audit Ledger</span>
            </Button>
            <Button variant="default" size="sm" onClick={() => nav('/admin/users')} className="gap-2">
              <Users size={14} />
              <span>User Roles</span>
            </Button>
          </div>
        }
      />

      {/* Admin KPI Metrics */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Registered Users"
          value={MOCK_USERS_LIST.length}
          description="3 Developers, 2 Admins, 1 User"
          icon={Users}
          onClick={() => onNavigate('/admin/users')}
        />
        <StatCard
          title="Total Incidents Tracked"
          value={totalTickets}
          description="Across all connected repos"
          icon={Layers}
          onClick={() => onNavigate('/admin/tickets')}
        />
        <StatCard
          title="Open / Active Incidents"
          value={openIssues}
          description="In autonomous pipeline"
          icon={Activity}
          trendType="neutral"
          trend="In Flight"
          onClick={() => onNavigate('/admin/tickets')}
        />
        <StatCard
          title="Human Sign-off Requests"
          value={humanApprovals}
          description="Medium/high-risk diffs paused"
          icon={ShieldAlert}
          trendType="warning"
          trend="Pending"
          onClick={() => onNavigate('/admin/tickets')}
        />
        <StatCard
          title="Agent Resolution Success"
          value="97.4%"
          description="Across 4,780 executions"
          icon={Cpu}
          trendType="positive"
          trend="Healthy"
          onClick={() => onNavigate('/admin/agents')}
        />
        <StatCard
          title="System Core Health"
          value="100%"
          description="6 services operational"
          icon={ShieldCheck}
          trendType="positive"
          trend="0 Outages"
          onClick={() => onNavigate('/admin/system')}
        />
      </div>

      {/* 2-Column Administrative Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Platform Tickets Management Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Global Incident Stream</CardTitle>
                  <CardDescription>Live status and developer assignment across all repositories.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/tickets')}>
                  <span>Manage All</span>
                  <ArrowUpRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.slice(0, 5).map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer hover:bg-card-hover"
                      onClick={() => onNavigate(`/admin/tickets`)}
                    >
                      <TableCell className="font-mono font-bold text-cyan text-xs">{t.ticket_id || t.id}</TableCell>
                      <TableCell className="font-semibold text-xs text-main">{t.title}</TableCell>
                      <TableCell className="text-xs text-muted">{t.raised_by || 'User'}</TableCell>
                      <TableCell className="text-xs text-main font-medium">{t.assignee || 'Unassigned'}</TableCell>
                      <TableCell>
                        <span className={`risk-pill ${(t.risk_level || 'medium').toLowerCase()}`}>
                          {t.risk_level || 'MEDIUM'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* AI Agents Operational Status Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>AI Agent Fleet Status</CardTitle>
                  <CardDescription>Health, success rates, and active task loads across the 5 specialized agents.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/agents')}>
                  <span>Full Telemetry</span>
                  <ArrowUpRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MOCK_AGENT_METRICS.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="p-3 bg-black/25 rounded-md border border-border-subtle flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-main">{agent.name.split(' ')[0]} Agent</span>
                      <span className="text-2xs font-bold text-emerald">{agent.status}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Success Rate:</span>
                      <span className="font-mono text-emerald font-bold">{agent.success_rate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Avg Latency:</span>
                      <span className="font-mono text-cyan">{agent.avg_latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: System Health & Quick User Management */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">System Services Health</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/system')}>
                  <ArrowUpRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs">
              {MOCK_SYSTEM_HEALTH.slice(0, 4).map((s, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
                  <div>
                    <span className="font-medium text-main block">{s.service}</span>
                    <span className="text-2xs text-dim font-mono">Uptime {s.uptime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald font-bold block">{s.status}</span>
                    <span className="text-2xs text-cyan font-mono">{s.latency}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick User Directory */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Active Team Members</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/users')}>
                  <ArrowUpRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {MOCK_USERS_LIST.slice(0, 4).map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-cyan">
                      {u.name[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-main block">{u.name}</span>
                      <span className="text-2xs text-muted">{u.email}</span>
                    </div>
                  </div>
                  <span className={`role-pill badge-${u.role}`}>{u.role.toUpperCase()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
