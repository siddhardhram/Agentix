/**
 * Agentix API Service Client
 * REST endpoints and WebSocket telemetry helpers.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchTickets() {
  const res = await fetch(`${API_BASE_URL}/tickets/`);
  return res.json();
}

export async function createTicket(ticketData) {
  const res = await fetch(`${API_BASE_URL}/tickets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  return res.json();
}

export function createTelemetrySocket(ticketId, onMessage) {
  const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws/telemetry/${ticketId}`;
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => onMessage(event.data);
  return ws;
}
