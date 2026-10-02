import React, { useState, useEffect } from 'react';
import TicketIntakeForm from '../components/TicketIntakeForm';
import { fetchTickets, createTicket } from '../services/api';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets().then(data => setTickets(data)).catch(() => {});
  }, []);

  const handleCreate = async (ticketData) => {
    await createTicket(ticketData);
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Agentix Command Cockpit</h1>
      </header>
      <TicketIntakeForm onSubmit={handleCreate} />
      <div className="ticket-list">
        <h3>Active Tickets ({tickets.length})</h3>
      </div>
    </div>
  );
}
