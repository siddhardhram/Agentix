import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTickets as supabaseGetTickets, createTicket as supabaseCreateTicket, updateTicket as supabaseUpdateTicket, deleteTicket as supabaseDeleteTicket, supabase } from '../services/supabase';
import { fetchTickets as apiFetchTickets, createTicket as apiCreateTicket, updateTicket as apiUpdateTicket, deleteTicket as apiDeleteTicket } from '../services/api';
import { useAuth } from './AuthContext';

const TicketContext = createContext({
  tickets: [],
  loading: true,
  error: null,
  getTicketById: (id) => null,
  createTicket: async (ticketData) => {},
  updateTicket: async (id, updates) => {},
  assignDeveloper: async (ticketId, devId) => {},
  approvePatch: async (ticketId, reviewerName) => {},
  rejectPatch: async (ticketId, reviewerName) => {},
  refreshTickets: async () => {},
});

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, session } = useAuth();

  const LOCAL_STORAGE_KEY = 'agentix_tickets_store';

  const getLocalTickets = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalTickets = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch from all sources in parallel: Backend, Supabase, LocalStorage
      const [apiRes, supabaseRes] = await Promise.allSettled([
        apiFetchTickets(),
        supabaseGetTickets()
      ]);

      const backendData = (apiRes.status === 'fulfilled' && Array.isArray(apiRes.value)) ? apiRes.value : [];
      const supabaseData = (supabaseRes.status === 'fulfilled' && Array.isArray(supabaseRes.value?.tickets)) ? supabaseRes.value.tickets : [];
      const localData = getLocalTickets();

      // Merge and deduplicate by ticket_ref, ticket_id, or id
      const seen = new Set();
      const combined = [];

      for (const t of [...backendData, ...localData, ...supabaseData]) {
        if (!t) continue;
        const key = t.ticket_ref || t.ticket_id || t.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push({
            ...t,
            id: t.id || key,
            ticket_ref: t.ticket_ref || t.ticket_id || key,
            ticket_id: t.ticket_id || t.ticket_ref || key,
            title: t.title || t.description?.slice(0, 50) || 'Incident Report',
            description: t.description || t.title || '',
            status: (t.status || 'open').toLowerCase(),
            priority: (t.priority || 'medium').toLowerCase(),
            risk_level: (t.risk_level || 'low').toLowerCase(),
            agent_status: t.agent_status || {
              triage: 'completed',
              investigation: 'running',
              repository_scan: 'waiting',
              fix_generation: 'waiting',
              verification: 'waiting',
              resolution: 'waiting'
            },
            verification: t.verification || {
              build: 'passed',
              tests: 'running',
              lint: 'passed',
              security: 'passed',
              regression: 'waiting',
              test_log: 'Running test suites...'
            }
          });
        }
      }

      setTickets(combined);
      saveLocalTickets(combined);
      setError(null);
    } catch (err) {
      const localData = getLocalTickets();
      if (localData && localData.length > 0) {
        setTickets(localData);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();

    if (!isAuthenticated) return;

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets, isAuthenticated]);

  const getTicketById = (id) => {
    return tickets.find((t) => t.id === id || t.ticket_id === id || t.ticket_ref === id) || null;
  };

  const createTicket = async (ticketData) => {
    const ticketRef = ticketData.ticket_ref || ticketData.ticket_id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = session?.user?.id || 'anonymous_user';

    const payload = {
      ...ticketData,
      raised_by: userId,
      raised_by_raw: userId,
      ticket_ref: ticketRef,
      ticket_id: ticketRef,
      title: ticketData.title || ticketData.description?.slice(0, 50) || 'Technical Incident',
      description: ticketData.description || ticketData.title || 'Technical Incident',
      affected_area: ticketData.affected_area || 'General',
      priority: (ticketData.priority || 'medium').toLowerCase(),
      repo_ref: ticketData.repo_ref || ticketData.repo_path || 'main',
      status: 'open',
      risk_level: (ticketData.risk_level || 'low').toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically update local tickets & state immediately so Developer Board updates with 0 latency
    setTickets(prev => {
      const updated = [payload, ...prev.filter(t => (t.ticket_ref || t.id) !== ticketRef)];
      saveLocalTickets(updated);
      return updated;
    });

    // Synchronize to FastAPI backend (launching real diagnosis pipeline) and Supabase
    try {
      await Promise.allSettled([
        apiCreateTicket(payload),
        supabaseCreateTicket(payload)
      ]);
    } catch (err) {
      console.warn('[TicketContext] Network sync notice:', err.message);
    }

    return payload;
  };

  const updateTicket = async (id, updates) => {
    setTickets(prev => {
      const updated = prev.map(t => (t.id === id || t.ticket_id === id || t.ticket_ref === id) ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
      saveLocalTickets(updated);
      return updated;
    });

    try {
      await Promise.allSettled([
        apiUpdateTicket(id, updates),
        supabaseUpdateTicket(id, updates)
      ]);
    } catch (err) {
      console.warn('[TicketContext] Update sync notice:', err.message);
    }
  };

  const assignDeveloper = async (ticketId, devId) => {
    return await updateTicket(ticketId, { assignee: devId });
  };

  const approvePatch = async (ticketId, reviewerName = 'Developer') => {
    return await updateTicket(ticketId, { status: 'resolved' });
  };

  const rejectPatch = async (ticketId, reviewerName = 'Developer') => {
    return await updateTicket(ticketId, { status: 'in_progress' });
  };

  const deleteTicket = async (id) => {
    setTickets(prev => {
      const updated = prev.filter(t => t.id !== id && t.ticket_id !== id && t.ticket_ref !== id);
      saveLocalTickets(updated);
      return updated;
    });

    try {
      await Promise.allSettled([
        apiDeleteTicket(id),
        supabaseDeleteTicket(id)
      ]);
    } catch (err) {
      console.warn('[TicketContext] Delete sync notice:', err.message);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        loading,
        error,
        getTicketById,
        createTicket,
        updateTicket,
        deleteTicket,
        assignDeveloper,
        approvePatch,
        rejectPatch,
        refreshTickets: fetchTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
