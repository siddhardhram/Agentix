import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  FolderGit2, 
  AlertTriangle, 
  Cpu, 
  FileText, 
  Upload, 
  CheckCircle2 
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

const PRESETS = [
  {
    title: 'ZeroDivisionError in demo_repos/sample_calc/calc.py',
    description: 'calc.py divide(a, b) raises unhandled ZeroDivisionError when denominator is 0. Need safe division and value check.',
    repo_path: './demo_repos/sample_calc',
    branch: 'main',
    environment: 'staging',
    severity: 'P2',
    priority: 'Medium',
    route: 'code',
    tag: 'Python AST Code Fix'
  },
  {
    title: 'PostgreSQL connection timeout in telemetry worker pool',
    description: 'DB pool connection count exceeded 100 on burst load during traffic surge. Need pool configuration tuning.',
    repo_path: './backend',
    branch: 'release/v1.2',
    environment: 'production',
    severity: 'P0',
    priority: 'Critical',
    route: 'ops',
    tag: 'Operational Pool Outage'
  },
  {
    title: 'Missing return type annotation in test_runner.py',
    description: 'Pyright strict typing alert: function returns Any without explicit annotation.',
    repo_path: './backend',
    branch: 'main',
    environment: 'development',
    severity: 'P3',
    priority: 'Low',
    route: 'code',
    tag: 'Linter / Strict Typing'
  }
];

import { useNavigate } from 'react-router-dom';

export default function UserCreateTicket({ onNavigate }) {
  const navigate = useNavigate();
  const nav = onNavigate || navigate;
  const { createTicket } = useTickets();
  const { user, profile } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('bug');
  const [severity, setSeverity] = useState('P2');
  const [priority, setPriority] = useState('Medium');
  const [repoPath, setRepoPath] = useState('./demo_repos/sample_calc');
  const [branch, setBranch] = useState('main');
  const [environment, setEnvironment] = useState('staging');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setRepoPath(preset.repo_path);
    setBranch(preset.branch || 'main');
    setEnvironment(preset.environment || 'staging');
    setSeverity(preset.severity);
    setPriority(preset.priority);
    setErrorMessage('ZeroDivisionError: division by zero at calc.py:14 in divide(a, b)');
    toast.info('Preset Applied', `Loaded preset: ${preset.tag}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Validation Error', 'Please provide an issue title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
      const newTicket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        repo_ref: repoPath.trim(),
        affected_area: issueType === 'ops' ? 'Infrastructure / Ops' : 'Code / Backend',
        branch: branch.trim(),
        environment,
        severity,
        priority: priority.toLowerCase(),
        route: issueType === 'ops' ? 'ops' : 'code',
        raised_by_name: displayName,
      });

      toast.success('Incident Dispatched!', `Ticket #${newTicket?.ticket_id || 'NEW'} submitted to Agentix triage.`);
      setTimeout(() => {
        nav(`/user/tickets/${newTicket?.id || newTicket?.ticket_id || ''}`);
      }, 500);
    } catch (err) {
      toast.error('Submission Failed', err?.message || 'An error occurred while creating the ticket.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-ticket-page-container">
      <PageHeader
        title="Submit New Software Incident"
        description="Dispatch autonomous triage, AST repository comprehension, and sandboxed patch generation."
      />

      {/* Preset Quick Actions Banner */}
      <Card className="preset-selector-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-cyan" />
            <span className="font-bold text-xs uppercase tracking-wider text-muted">1-Click Demonstration Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-pill-btn"
                onClick={() => handleApplyPreset(p)}
              >
                <span className="preset-pill-dot" />
                <span className="preset-pill-title">{p.title.split(' ')[0]} {p.title.split(' ')[1]}...</span>
                <span className="preset-pill-tag">{p.tag}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Issue Information */}
        <Card>
          <CardHeader>
            <CardTitle>1. Issue Information</CardTitle>
            <CardDescription>Describe the defect, observed symptoms, and priority level.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">
                <span>Issue Title / Summary</span>
                <span className="text-rose">*</span>
              </label>
              <Input
                placeholder="e.g. Unhandled ZeroDivisionError in calculation endpoint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Detailed Description & Behavior</span>
                <span className="text-rose">*</span>
              </label>
              <Textarea
                placeholder="Explain what happened, expected behavior, and steps to reproduce..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Issue Category</label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Code Defect (AST Patch)</SelectItem>
                    <SelectItem value="ops">Operational / Infrastructure Outage</SelectItem>
                    <SelectItem value="typing">Linter / Type Annotation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Severity Level</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 — Critical Outage</SelectItem>
                    <SelectItem value="P1">P1 — High Severity</SelectItem>
                    <SelectItem value="P2">P2 — Standard Defect</SelectItem>
                    <SelectItem value="P3">P3 — Low / Cosmetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle>2. Technical & Repository Information</CardTitle>
            <CardDescription>Target codebase path, branch, and runtime environment for sandbox isolation.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Target Repository Path</label>
                <Input
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="./demo_repos/sample_calc"
                />
              </div>

              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Git Branch</label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                />
              </div>

              <div className="form-group space-y-1.5">
                <label className="form-label text-xs font-semibold text-slate-300">Environment</label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Error Message / Diagnostic Stack Trace</label>
              <Textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Paste exception stack trace (e.g., Traceback (most recent call last)...)"
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" type="button" onClick={() => onNavigate('/user/tickets')}>
            Cancel
          </Button>

          <Button type="submit" variant="default" loading={isSubmitting} size="lg">
            <Sparkles size={16} />
            <span>{isSubmitting ? 'Dispatching Agentix...' : 'Dispatch Autonomous Agent'}</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
