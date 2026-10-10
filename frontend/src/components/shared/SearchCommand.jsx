import React, { useState, useEffect } from 'react';
import { Search, FileText, Cpu, ArrowRight, X } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { StatusBadge, PriorityBadge } from './Badges';

export function SearchCommand({ open, onOpenChange, onSelectTicket }) {
  const [query, setQuery] = useState('');
  const { tickets } = useTickets();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const filtered = (tickets || []).filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q) ||
      (t.ticket_id || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }).slice(0, 6);

  return (
    <div className="ui-dialog-backdrop" onClick={() => onOpenChange(false)}>
      <div className="search-command-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-command-input-row">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            className="search-command-input"
            placeholder="Search tickets, AST symbols, repositories... (Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="search-command-results">
          <div className="search-results-section-title">INCIDENTS & TICKETS</div>
          {filtered.length === 0 ? (
            <div className="search-no-results">No matching incidents found for "{query}"</div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="search-result-item"
                onClick={() => {
                  onSelectTicket(t.id);
                  onOpenChange(false);
                }}
              >
                <div className="search-result-left">
                  <span className="search-ticket-id">{t.ticket_id || t.id}</span>
                  <span className="search-ticket-title">{t.title}</span>
                </div>
                <div className="search-result-right">
                  <StatusBadge status={t.status} size="sm" />
                  <ArrowRight size={14} className="text-muted" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="search-command-footer">
          <span>Tip: Press <strong>Ctrl + K</strong> anywhere to quickly open search</span>
        </div>
      </div>
    </div>
  );
}
