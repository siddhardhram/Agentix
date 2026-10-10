import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Shield, FolderGit2, AlertTriangle, Cpu, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const PRESETS = [
  {
    title: 'ZeroDivisionError in calc.py',
    description: 'calc.py divide(a, b) raises unhandled ZeroDivisionError when denominator is 0. Need safe division and value check.',
    repo_path: './demo_repos/sample_calc',
    severity: 'P2',
    route: 'code',
    tag: 'Python Code Fix'
  },
  {
    title: 'Uncaught TypeError in session handler',
    description: 'Null reference exception when user session cookie expires mid-request. Missing null-check in verify_token().',
    repo_path: './demo_repos/sample_calc',
    severity: 'P1',
    route: 'code',
    tag: 'Authentication'
  },
  {
    title: 'Postgres Connection Pool Exhaustion',
    description: 'High latency spike causing pool connection count to exceed 100 max connections during peak traffic window.',
    repo_path: './backend',
    severity: 'P0',
    route: 'ops',
    tag: 'Operational'
  },
  {
    title: 'Missing Type Annotations in test_runner.py',
    description: 'Strict typechecker warning: function returns Any without explicit return signature.',
    repo_path: './backend',
    severity: 'P3',
    route: 'code',
    tag: 'Linter / Typo'
  }
];

export default function TicketIntakeForm({ onSubmit, isSubmitting }) {
  const { user, profile, role } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoPath, setRepoPath] = useState('./demo_repos/sample_calc');
  const [severity, setSeverity] = useState('P2');
  const [route, setRoute] = useState('code');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = role || 'user';

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setRepoPath(preset.repo_path);
    setSeverity(preset.severity);
    setRoute(preset.route);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    if (onSubmit) {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        repo_path: repoPath.trim() || './demo_repos/sample_calc',
        severity,
        route,
        raised_by: displayName,
        raised_by_role: displayRole
      });
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="ticket-intake-card">
      {/* Card Header */}
      <div className="intake-card-header">
        <div className="intake-header-left">
          <div className="intake-icon-badge">
            <Sparkles size={20} className="text-indigo" />
          </div>
          <div>
            <h3 className="intake-title">Intake New Incident</h3>
            <p className="intake-subtitle">
              Dispatches autonomous AST scanner, root-cause reasoner, and sandboxed patch generator.
            </p>
          </div>
        </div>

        <div className="intake-user-badge">
          <span className="text-xs text-muted">Submitter:</span>
          <span className="user-name-tag">{displayName}</span>
          <span className={`role-pill badge-${displayRole}`}>{displayRole.toUpperCase()}</span>
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="preset-container">
        <span className="preset-label">Quick Scenario Presets:</span>
        <div className="preset-pills">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset(p)}
            >
              <span className="preset-dot"></span>
              <span className="preset-text">{p.title}</span>
              <span className="preset-tag">{p.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {submitSuccess && (
        <div className="intake-success-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>Incident accepted! Autonomous triage & AST indexing in progress...</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="intake-form">
        <div className="form-group">
          <label className="form-label">Issue Title / Summary</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Unhandled ZeroDivisionError in calculation endpoint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Issue Description & Diagnostic Details</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Provide stack trace, observed behavior, or error logs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-row-3col">
          <div className="form-group">
            <label className="form-label">Repository Path</label>
            <div className="input-with-icon">
              <FolderGit2 size={15} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="./demo_repos/sample_calc"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P0">P0 — Critical Production Outage</SelectItem>
                <SelectItem value="P1">P1 — High Severity Degradation</SelectItem>
                <SelectItem value="P2">P2 — Standard Software Defect</SelectItem>
                <SelectItem value="P3">P3 — Minor / Cosmetic / Lint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Route</label>
            <Select value={route} onValueChange={setRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">Code-Fix Pipeline (AST + Diff)</SelectItem>
                <SelectItem value="ops">Operational Pipeline (Logs + DB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="form-actions-row">
          <div className="intake-security-note">
            <Shield size={14} className="text-emerald" />
            <span>Enforces sandbox verification before code changes are staged</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!title.trim() || isSubmitting}
          >
            <Sparkles size={16} />
            <span>{isSubmitting ? 'Dispatching Agent...' : 'Dispatch Autonomous Agent'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
