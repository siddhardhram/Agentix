import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Search, ShieldAlert, Cpu } from 'lucide-react';

export function StatusBadge({ status = 'OPEN', size = 'default' }) {
  const norm = String(status || '').toUpperCase();

  let variant = 'default';
  let label = status;
  let Icon = Clock;

  if (norm.includes('RESOLVED') || norm.includes('VERIFIED') || norm.includes('CLOSED')) {
    variant = 'success';
    label = 'Resolved';
    Icon = CheckCircle2;
  } else if (norm.includes('APPROVAL') || norm.includes('REVIEW')) {
    variant = 'warning';
    label = 'Human Review Required';
    Icon = ShieldAlert;
  } else if (norm.includes('INVESTIGAT') || norm.includes('TRIAGE')) {
    variant = 'info';
    label = 'Investigating';
    Icon = Search;
  } else if (norm.includes('PROGRESS') || norm.includes('PATCH') || norm.includes('CODE')) {
    variant = 'secondary';
    label = 'In Progress';
    Icon = Cpu;
  } else if (norm.includes('FAIL') || norm.includes('ERROR')) {
    variant = 'destructive';
    label = 'Failed';
    Icon = XCircle;
  } else {
    variant = 'outline';
    label = 'Open';
    Icon = Clock;
  }

  return (
    <Badge variant={variant} className={`status-badge-wrapper ${size === 'sm' ? 'badge-sm' : ''}`}>
      <Icon size={12} className="status-badge-icon" />
      <span>{label}</span>
    </Badge>
  );
}

export function PriorityBadge({ priority = 'Medium', severity = 'P2' }) {
  const norm = String(severity || priority || '').toUpperCase();

  let variant = 'secondary';
  let label = severity || priority;

  if (norm.includes('P0') || norm.includes('CRITICAL')) {
    variant = 'destructive';
    label = 'P0 · Critical';
  } else if (norm.includes('P1') || norm.includes('HIGH')) {
    variant = 'warning';
    label = 'P1 · High';
  } else if (norm.includes('P2') || norm.includes('MEDIUM')) {
    variant = 'info';
    label = 'P2 · Medium';
  } else {
    variant = 'outline';
    label = 'P3 · Low';
  }

  return (
    <Badge variant={variant} className="priority-badge-wrapper">
      <span>{label}</span>
    </Badge>
  );
}
