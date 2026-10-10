import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Check, Play, Pause, Copy, CheckCheck, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'INTAKE', label: '1. Intake' },
  { id: 'TRIAGE', label: '2. Triage & Classify' },
  { id: 'INVESTIGATION', label: '3. AST Investigation' },
  { id: 'CODE_PATCH', label: '4. Patch Synthesis' },
  { id: 'SANDBOX_TEST', label: '5. Sandbox Runner' },
  { id: 'APPROVAL', label: '6. Role Gate' },
  { id: 'VERIFIED', label: '7. Verified & Sealed' },
];

const STAGE_ALIASES = {
  RESOLVED: 'VERIFIED',
  VERIFIED: 'VERIFIED',
  APPROVAL: 'APPROVAL',
  PENDING_APPROVAL: 'APPROVAL',
  SANDBOX: 'SANDBOX_TEST',
  SANDBOX_TEST: 'SANDBOX_TEST',
  PATCH: 'CODE_PATCH',
  CODE_PATCH: 'CODE_PATCH',
  INVESTIGATION: 'INVESTIGATION',
  INVESTIGATING: 'INVESTIGATION',
  TRIAGE: 'TRIAGE',
  INTAKE: 'INTAKE'
};

export default function LiveOrchestratorView({ currentStage = 'INVESTIGATION', telemetryLogs = [] }) {
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(telemetryLogs) && telemetryLogs.length > 0) {
      setLogs(telemetryLogs);
      return;
    }

    const initialLogs = [
      { time: '00:01.02', tag: 'triage', text: 'TriageAgent: Vector embedding generated (1536 dims). Checking duplicate index...' },
      { time: '00:01.45', tag: 'triage', text: 'TriageAgent: 0 duplicates detected. Issue classified as Code Defect (P2).' },
      { time: '00:02.10', tag: 'investigate', text: 'RepoAgent: Parsing AST symbol tables across repository directory tree...' },
      { time: '00:02.80', tag: 'investigate', text: 'RepoAgent: Found target node divide(a, b) at calc.py:12-16' },
      { time: '00:03.25', tag: 'investigate', text: 'RepoAgent: Call hierarchy scanned: 4 caller functions mapped.' },
      { time: '00:04.10', tag: 'patch', text: 'CoderAgent: Generating surgical unified diff with zero-divisor check...' },
      { time: '00:05.00', tag: 'sandbox', text: 'SandboxRunner: Spawning isolated pytest execution runner...' },
      { time: '00:05.80', tag: 'sandbox', text: 'SandboxRunner: test_divide_by_zero PASSED (5/5 tests passed in 0.04s).' },
      { time: '00:06.20', tag: 'verify', text: 'RiskEngine: Blast radius evaluated: LOW (1 file touched, 100% test coverage).' },
      { time: '00:06.90', tag: 'audit', text: 'AuditLogger: SHA-256 event logged into tamper-evident ledger (PRD §13).' },
    ];
    setLogs(initialLogs);
  }, [telemetryLogs]);

  useEffect(() => {
    if (!isPaused && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.tag.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizedStage = STAGE_ALIASES[String(currentStage || '').toUpperCase()] || currentStage;
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.id === normalizedStage);
  const activeIdx = currentIdx >= 0 ? currentIdx : 2;

  return (
    <div className="orchestrator-view-container">
      {/* Horizontal Pipeline Stepper */}
      <div className="pipeline-stepper-container">
        <div className="pipeline-stepper-header">
          <span className="stepper-title">Autonomous Execution Pipeline</span>
          <span className="stepper-stage-indicator">
            Stage {activeIdx + 1} of {PIPELINE_STAGES.length}: <strong>{PIPELINE_STAGES[activeIdx]?.label || 'Active'}</strong>
          </span>
        </div>

        <div className="pipeline-stepper">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIdx || (activeIdx === PIPELINE_STAGES.length - 1 && idx === activeIdx);
            const isActive = idx === activeIdx && activeIdx < PIPELINE_STAGES.length - 1;

            return (
              <div
                key={stage.id}
                className={`stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="stepper-circle">
                  {isCompleted ? <Check size={14} /> : <span>{idx + 1}</span>}
                </div>
                <span className="stepper-label">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Telemetry Window */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-header-left">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <span className="terminal-title">Agent Telemetry Stream & Subprocess Runner</span>
          </div>

          <div className="terminal-controls">
            <button 
              className="terminal-ctrl-btn"
              onClick={handleCopyLogs}
              title="Copy terminal output"
            >
              {copied ? <CheckCheck size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              className="terminal-ctrl-btn"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume live scrolling' : 'Pause scrolling'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        <div className="terminal-body">
          {logs.map((log, idx) => (
            <div key={idx} className="terminal-line">
              <span className="terminal-time">[{log.time}]</span>
              <span className={`terminal-tag tag-${log.tag}`}>{log.tag.toUpperCase()}</span>
              <span className="terminal-text">{log.text}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
