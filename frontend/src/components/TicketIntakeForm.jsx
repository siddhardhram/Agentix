import React, { useState } from 'react';

export default function TicketIntakeForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoPath, setRepoPath] = useState('./demo_repos/sample_calc');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ title, description, repo_path: repoPath });
    }
  };

  return (
    <div className="ticket-intake-card">
      <h2>Submit New Issue</h2>
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Issue Title (e.g., ZeroDivisionError in calc.py)"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <textarea 
          placeholder="Detailed description, stack trace, or expected behavior..."
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <input 
          placeholder="Repo Path"
          value={repoPath} 
          onChange={(e) => setRepoPath(e.target.value)} 
        />
        <button type="submit">Launch Autonomous Resolution</button>
      </form>
    </div>
  );
}
