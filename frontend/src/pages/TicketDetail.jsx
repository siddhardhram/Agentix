import React, { useState } from 'react';
import LiveOrchestratorView from '../components/LiveOrchestratorView';
import ApprovalDrawer from '../components/ApprovalDrawer';
import ClarificationPrompt from '../components/ClarificationPrompt';
import EvidencePackageModal from '../components/EvidencePackageModal';
import AuditLedger from '../components/AuditLedger';

export default function TicketDetail({ ticketId }) {
  const [stage, setStage] = useState('INVESTIGATION');

  return (
    <div className="ticket-detail-page">
      <h2>Ticket Resolution Cockpit: {ticketId || 'TCK-001'}</h2>
      <LiveOrchestratorView currentStage={stage} />
      <AuditLedger />
    </div>
  );
}
