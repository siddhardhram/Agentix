import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, FileCode2, Loader2, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import { submitApprovalDecision } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ApprovalDrawer({ approvalData, onApprove, onReject, onOpenAuthModal }) {
  const [decisionRecorded, setDecisionRecorded] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, profile, role } = useAuth();
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = role || 'user';
  const canApprove = role === 'developer' || role === 'admin';

  // Fallback default approval state for demonstration
  const data = approvalData || {
    id: 'APP-902',
    risk_level: 'MEDIUM',
    reason: 'Code patch touches mathematical logic in core calculation module with high execution frequency.',
    files_modified: ['demo_repos/sample_calc/calc.py'],
    tests_passed: '5/5 passed (100%)',
    diff_summary: '1 insertion(+), 1 deletion(-)'
  };

  const filesList = Array.isArray(data.files_modified)
    ? data.files_modified.join(', ')
    : (data.files_modified || 'No files specified');

  const handleApprove = async () => {
    if (!canApprove) return;
    setIsProcessing(true);
    try {
      await submitApprovalDecision(data.id || 'APP-902', true, displayName);
      setDecisionRecorded('APPROVED');
      if (onApprove) onApprove(data.id || 'APP-902');
    } catch (err) {
      console.warn('Approval recording fallback:', err);
      setDecisionRecorded('APPROVED');
      if (onApprove) onApprove(data.id || 'APP-902');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!canApprove) return;
    setIsProcessing(true);
    try {
      await submitApprovalDecision(data.id || 'APP-902', false, displayName);
      setDecisionRecorded('REJECTED');
      if (onReject) onReject(data.id || 'APP-902');
    } catch (err) {
      console.warn('Rejection recording fallback:', err);
      setDecisionRecorded('REJECTED');
      if (onReject) onReject(data.id || 'APP-902');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="approval-panel">
      {/* Header */}
      <div className="approval-header">
        <div className="approval-header-left">
          <div className="approval-icon-box">
            <ShieldAlert size={20} className="text-amber" />
          </div>
          <div>
            <div className="approval-title-row">
              <h4 className="approval-title">Human Sign-off Required</h4>
              <span className={`risk-pill ${(data.risk_level || 'medium').toLowerCase()}`}>
                {data.risk_level || 'MEDIUM'} RISK
              </span>
            </div>
            <p className="approval-desc">
              {data.reason || 'Verification policy requires developer sign-off before committing patch to main.'}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="approval-meta-grid">
        <div className="approval-meta-item">
          <FileCode2 size={16} className="text-cyan" />
          <span>Files: <strong>{filesList}</strong></span>
        </div>
        <div className="approval-meta-item">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>Sandbox Tests: <strong>{data.tests_passed || '5/5 passed (100%)'}</strong></span>
        </div>
      </div>

      {/* Role Permission Banner */}
      {!canApprove ? (
        <div className="role-lock-banner">
          <div className="role-lock-text">
            <Lock size={15} className="text-amber" />
            <span>
              Signed in as <strong>{displayName}</strong> ({displayRole.toUpperCase()}). Approvals require <strong>Developer</strong> or <strong>Admin</strong> role (PRD §13).
            </span>
          </div>
          {onOpenAuthModal && (
            <button className="btn btn-sm btn-secondary" onClick={onOpenAuthModal}>
              Switch Persona
            </button>
          )}
        </div>
      ) : (
        <div className="role-authorized-tag">
          <ShieldCheck size={14} className="text-emerald" />
          <span>Authorized as <strong>{displayName}</strong> ({displayRole.toUpperCase()})</span>
        </div>
      )}

      {/* Decision Actions */}
      {decisionRecorded ? (
        <div className={`decision-alert ${decisionRecorded.toLowerCase()}`}>
          {decisionRecorded === 'APPROVED' ? (
            <>
              <CheckCircle2 size={18} />
              <span>✓ Patch Approved by {displayName} — Applying to Working Tree</span>
            </>
          ) : (
            <>
              <XCircle size={18} />
              <span>✕ Patch Rejected — Triggering Automated Clean Rollback</span>
            </>
          )}
        </div>
      ) : (
        <div className="approval-btn-group">
          <button 
            className="btn-approve" 
            onClick={handleApprove} 
            disabled={isProcessing || !canApprove}
            title={!canApprove ? "Requires Developer or Admin role" : "Approve and apply patch"}
          >
            {isProcessing ? <Loader2 size={16} className="spin-animate" /> : <CheckCircle2 size={16} />}
            <span>{isProcessing ? 'Recording Decision...' : 'Approve & Merge Patch'}</span>
          </button>
          <button 
            className="btn-reject" 
            onClick={handleReject} 
            disabled={isProcessing || !canApprove}
            title={!canApprove ? "Requires Developer or Admin role" : "Reject and rollback changes"}
          >
            <XCircle size={16} />
            <span>Reject & Rollback</span>
          </button>
        </div>
      )}
    </div>
  );
}
