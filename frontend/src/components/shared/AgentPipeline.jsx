import React from 'react';
import { Check, Circle, Loader2, AlertCircle, Clock } from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 'triage', label: 'Triage', description: 'Duplicate detection & classification' },
  { id: 'investigation', label: 'Investigation', description: 'Root cause & diagnostic logs' },
  { id: 'repository_scan', label: 'Repository Scan', description: 'AST symbol & dependency analysis' },
  { id: 'fix_generation', label: 'Fix Generation', description: 'Coder Agent synthesized diff' },
  { id: 'verification', label: 'Verification', description: 'Sandboxed tests & canary checks' },
  { id: 'resolution', label: 'Resolution', description: 'Verified fix & audit sealing' },
];

export function AgentPipeline({
  agentStatus = {},
  currentStage = 'investigation',
  compact = false
}) {
  const getStageState = (stageId) => {
    // Check if explicitly provided in agentStatus dictionary
    if (agentStatus && agentStatus[stageId]) {
      return agentStatus[stageId]; // 'completed' | 'running' | 'waiting' | 'failed'
    }

    // Default stage calculation based on currentStage
    const stageOrder = ['triage', 'investigation', 'repository_scan', 'fix_generation', 'verification', 'resolution'];
    const activeIdx = stageOrder.indexOf(currentStage.toLowerCase());
    const thisIdx = stageOrder.indexOf(stageId);

    if (activeIdx === -1) return 'waiting';
    if (thisIdx < activeIdx) return 'completed';
    if (thisIdx === activeIdx) return 'running';
    return 'waiting';
  };

  return (
    <div className={`agent-pipeline-container ${compact ? 'is-compact' : ''}`}>
      <div className="agent-pipeline-stepper">
        {PIPELINE_STAGES.map((stage, idx) => {
          const state = getStageState(stage.id);

          return (
            <div key={stage.id} className={`pipeline-step state-${state}`}>
              <div className="step-node-wrapper">
                <div className="step-node">
                  {state === 'completed' && <Check size={14} className="node-icon" />}
                  {state === 'running' && <Loader2 size={14} className="node-icon spin-animate" />}
                  {state === 'failed' && <AlertCircle size={14} className="node-icon" />}
                  {state === 'waiting' && <span className="node-num">{idx + 1}</span>}
                </div>
                {idx < PIPELINE_STAGES.length - 1 && <div className="step-connector" />}
              </div>

              <div className="step-info">
                <span className="step-title">{stage.label}</span>
                {!compact && <span className="step-desc">{stage.description}</span>}
                <span className={`step-status-tag status-${state}`}>
                  {state === 'completed' ? 'Completed' :
                   state === 'running' ? 'Active' :
                   state === 'failed' ? 'Failed' : 'Queued'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
