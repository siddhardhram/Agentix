import React from 'react';

export default function ApprovalDrawer({ approvalData, onApprove, onReject }) {
  if (!approvalData) return null;

  return (
    <div className="approval-drawer">
      <h3>Human Approval Required</h3>
      <p>Risk Level: {approvalData.risk_level}</p>
      <pre>{approvalData.diff_preview}</pre>
      <div className="actions">
        <button onClick={() => onApprove(approvalData.id)}>Approve Patch</button>
        <button onClick={() => onReject(approvalData.id)}>Reject & Escalate</button>
      </div>
    </div>
  );
}
