import React from 'react';

export default function AuditLedger({ events = [] }) {
  return (
    <div className="audit-ledger">
      <h3>Immutable Audit Trail</h3>
      <ul>
        {events.map((evt, idx) => (
          <li key={idx}>
            <span>{evt.timestamp}</span> — <strong>{evt.event_type}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
