import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';

export default function App() {
  const [activeTicketId, setActiveTicketId] = useState(null);

  return (
    <div className="agentix-app">
      {activeTicketId ? (
        <TicketDetail ticketId={activeTicketId} onBack={() => setActiveTicketId(null)} />
      ) : (
        <Dashboard onSelectTicket={(id) => setActiveTicketId(id)} />
      )}
    </div>
  );
}
