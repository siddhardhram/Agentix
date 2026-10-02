import React from 'react';

export default function EvidencePackageModal({ evidence, onClose }) {
  if (!evidence) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Escalation Evidence Package</h3>
        <p>Risk Reason: {evidence.reason}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
