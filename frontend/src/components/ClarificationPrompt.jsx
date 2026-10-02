import React from 'react';

export default function ClarificationPrompt({ questions = [], onAnswer }) {
  return (
    <div className="clarification-panel">
      <h3>Agent Clarification Required</h3>
      <p>The agent needs more context to accurately isolate and resolve this issue.</p>
    </div>
  );
}
