import React from 'react';

export default function LiveOrchestratorView({ currentStage, telemetryLogs = [] }) {
  return (
    <div className="orchestrator-view">
      <h3>Active Pipeline Stage: {currentStage || 'INTAKE'}</h3>
      <div className="telemetry-feed">
        {telemetryLogs.map((log, idx) => (
          <div key={idx} className="telemetry-entry">{log}</div>
        ))}
      </div>
    </div>
  );
}
