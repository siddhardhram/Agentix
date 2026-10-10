import React, { useEffect } from 'react';
import { X, ShieldAlert, FileCode2, Terminal, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function EvidencePackageModal({ evidence = {}, onClose = () => {} }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!evidence) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container evidence-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge text-amber">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="modal-title">Autonomous Evidence Package</h2>
              <p className="modal-subtitle">Comprehensive diagnostic telemetry, AST traces, and sandbox test results</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body evidence-body">
          {/* Root Cause Card */}
          <div className="evidence-section">
            <h4 className="evidence-section-title">
              <AlertTriangle size={14} className="text-amber" />
              <span>Root Cause Analysis & Diagnosis</span>
            </h4>
            <div className="evidence-card-content">
              {evidence.root_cause || 'Root cause confirmed via AST execution path analysis: unhandled ZeroDivisionError in calculation function during zero-divisor evaluation.'}
            </div>
          </div>

          {/* Diagnostic Metrics */}
          <div className="evidence-meta-grid">
            <div className="evidence-meta-card">
              <span className="meta-label">Calculated Blast Radius</span>
              <span className="meta-value text-emerald">
                {evidence.blast_radius || 'LOW (Single isolated module)'}
              </span>
            </div>

            <div className="evidence-meta-card">
              <span className="meta-label">Target AST Symbol</span>
              <span className="meta-value text-cyan font-mono">
                {evidence.ast_symbol || 'calc.py :: divide(a, b)'}
              </span>
            </div>

            <div className="evidence-meta-card">
              <span className="meta-label">Policy Risk Tier</span>
              <span className="meta-value text-amber">
                MEDIUM RISK (Requires Developer Sign-off)
              </span>
            </div>

            <div className="evidence-meta-card">
              <span className="meta-label">Sandbox Test Pass Rate</span>
              <span className="meta-value text-emerald">
                100% (5/5 Pytest Assertions Passed)
              </span>
            </div>
          </div>

          {/* Sandbox Test Log */}
          <div className="evidence-section">
            <h4 className="evidence-section-title">
              <Terminal size={14} className="text-cyan" />
              <span>Sandbox Test Runner Output</span>
            </h4>
            <div className="terminal-box-compact">
              <pre>
{evidence.test_log || `============================= test session starts ==============================
platform win32 -- Python 3.13.0, pytest-8.3.4, pluggy-1.5.0
rootdir: demo_repos/sample_calc
collected 5 items

demo_repos/sample_calc/test_calc.py::test_add PASSED                      [ 20%]
demo_repos/sample_calc/test_calc.py::test_subtract PASSED                 [ 40%]
demo_repos/sample_calc/test_calc.py::test_multiply PASSED                 [ 60%]
demo_repos/sample_calc/test_calc.py::test_divide PASSED                   [ 80%]
demo_repos/sample_calc/test_calc.py::test_divide_by_zero PASSED          [100%]

============================== 5 passed in 0.04s ===============================`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Package
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Acknowledge & Return
          </button>
        </div>
      </div>
    </div>
  );
}
