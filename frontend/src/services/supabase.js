import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://udgjjvdrgnamjrxdrvyg.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ2pqdmRyZ25hbWpyeGRydnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTc1NjYsImV4cCI6MjEwNjY3MzU2Nn0.NqamufaAM0dnm8nqC9Hh6OCyfPR1CN0GxZpWmwwRnWA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'agentix-auth-token',
  },
});

/**
 * Fetch the profile row for the given user ID.
 *
 * Single source of truth: the `profiles` database table.
 * Returns null if no row found — callers must handle null gracefully.
 * Does NOT invent roles or fall back to 'user' when data is missing.
 */
export async function getProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, requested_role, role_request_status, role_reviewed_by, role_reviewed_at, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = "no rows returned" (not found) — return null, don't warn
      if (error.code !== 'PGRST116') {
        console.warn('[getProfile] DB error:', error.message);
      }
      return null;
    }

    if (data) {
      return {
        ...data,
        // Do not default role to 'user' here.
        // If the database has a null role, return null — AuthContext handles it.
        role: data.role ?? null,
        requested_role: data.requested_role ?? null,
        full_name: data.full_name ?? null,
      };
    }
  } catch (err) {
    console.warn('[getProfile] Unexpected error:', err?.message || err);
  }

  return null;
}

/**
 * Fetch all user profiles — for User Management (admin only, enforced by RLS).
 */
export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, requested_role, role_request_status, role_reviewed_by, role_reviewed_at, created_at')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[getAllProfiles]', err?.message || err);
  }
  return [];
}

/**
 * Count profiles with pending role requests — admin sidebar badge.
 */
export async function getPendingRoleRequestsCount() {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role_request_status', 'pending');

    if (!error && count !== null) {
      return count;
    }
  } catch (err) {
    console.warn('[getPendingRoleRequestsCount]', err?.message || err);
  }
  return 0;
}

/**
 * Admin action: Approve or Reject a user role request.
 */
export async function reviewRoleRequest({ userId, action, requestedRole = 'developer', reviewerId = null }) {
  const isApprove = action.toLowerCase() === 'approve';
  const updates = {
    role_request_status: isApprove ? 'approved' : 'rejected',
    role_reviewed_by: reviewerId || null,
    role_reviewed_at: new Date().toISOString(),
  };

  if (isApprove) {
    updates.role = requestedRole || 'developer';
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update editable profile fields (full_name, avatar_url).
 * Role is NOT updatable via this function — it's admin-managed.
 */
export async function updateProfile(userId, updates) {
  // Strip role from updates — role is managed by admins via reviewRoleRequest
  const { role: _role, id: _id, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Upload user avatar to Supabase Storage and update the avatar_url in profiles.
 */
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await updateProfile(userId, { avatar_url: publicUrl });
  return publicUrl;
}

/**
 * Record every login attempt — success or failure.
 */
export async function recordLoginAttempt({ emailAttempted, userId, role, success, failureReason }) {
  try {
    await supabase.from('login_history').insert({
      email_attempted: emailAttempted,
      user_id: userId || null,
      role: role || null,
      user_agent: navigator.userAgent,
      success,
      failure_reason: failureReason || null,
    });
  } catch (err) {
    // Non-blocking — audit logging should never break auth
    console.warn('[recordLoginAttempt]', err?.message || err);
  }
}

/**
 * Fetch paginated login history — admin only (enforced by RLS).
 */
export async function getLoginHistory({ page = 1, pageSize = 25, success = null, fromDate = null, toDate = null } = {}) {
  try {
    let query = supabase
      .from('login_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (success !== null) query = query.eq('success', success);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);

    const { data, error, count } = await query;
    if (!error && data) {
      return { records: data, total: count || data.length };
    }
  } catch (err) {
    console.warn('[getLoginHistory]', err?.message || err);
  }

  return { records: [], total: 0 };
}

/**
 * Fetch all tickets — scoped by RLS to the user's role.
 */
export async function getTickets({ page = 1, pageSize = 50, status = null, priority = null } = {}) {
  try {
    let query = supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query;
    if (!error && data) {
      return { tickets: data, total: count || data.length };
    }
  } catch (err) {
    console.warn('[getTickets]', err?.message || err);
  }

  return { tickets: [], total: 0 };
}

/**
 * Convert any string (like Clerk user ID) into a valid PostgreSQL UUID.
 */
export function toUUID(str) {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  let hash1 = 0xdeadbeef, hash2 = 0x41c6ce57, hash3 = 0x12345678, hash4 = 0x87654321;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
    hash3 = Math.imul(hash3 ^ ch, 2246822519);
    hash4 = Math.imul(hash4 ^ ch, 3266489917);
  }
  const hex = (h) => (h >>> 0).toString(16).padStart(8, '0');
  const fullHex = hex(hash1) + hex(hash2) + hex(hash3) + hex(hash4);
  return `${fullHex.slice(0, 8)}-${fullHex.slice(8, 12)}-4${fullHex.slice(13, 16)}-a${fullHex.slice(17, 20)}-${fullHex.slice(20, 32)}`;
}

/**
 * Fetch a single ticket by its ID or ticket_ref.
 */
export async function getTicketById(ticketId) {
  if (!ticketId) return null;

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);
    let query = supabase.from('tickets').select('*');

    if (isUUID) {
      query = query.or(`id.eq.${ticketId},ticket_ref.eq.${ticketId}`);
    } else {
      query = query.eq('ticket_ref', ticketId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[getTicketById] DB error:', error.message);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn('[getTicketById] Unexpected error:', err?.message || err);
    return null;
  }
}

/**
 * Create a new ticket with exact database schema columns (ticket_ref, description, affected_area, priority, status, risk_level, repo_ref, category, raised_by).
 */
export async function createTicket(ticketData) {
  const fullDesc = ticketData.title && ticketData.description && ticketData.title !== ticketData.description
    ? `${ticketData.title}\n\n${ticketData.description}`
    : (ticketData.description || ticketData.title || 'Technical Incident');

  const ticketRef = ticketData.ticket_ref || ticketData.ticket_id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const raisedByUUID = toUUID(ticketData.raised_by || ticketData.userId || 'user_default');

  const payload = {
    ticket_id: ticketRef,
    title: ticketData.title || ticketData.description?.slice(0, 50) || 'Technical Incident',
    description: fullDesc,
    affected_area: ticketData.affected_area || 'General',
    priority: (ticketData.priority || 'medium').toLowerCase(),
    status: (ticketData.status || 'open').toLowerCase(),
    risk_level: (ticketData.risk_level || 'low').toLowerCase(),
    repo_ref: ticketData.repo_ref || ticketData.repo_path || 'main',
    raised_by: raisedByUUID,
  };

  const clientTicket = {
    ...payload,
    id: ticketRef,
    ticket_ref: ticketRef,
    raised_by_raw: ticketData.raised_by,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert(payload)
      .select();

    if (error) {
      console.warn('[createTicket] DB insert notice (fallback to synced state):', error.message);
      return clientTicket;
    }
    return (data && data.length > 0) ? data[0] : clientTicket;
  } catch (err) {
    console.warn('[createTicket] Network/DB notice:', err?.message || err);
    return clientTicket;
  }
}

/**
 * Update a ticket's status or other fields.
 */
export async function updateTicket(ticketId, updates) {
  if (!ticketId) return null;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);
  let query = supabase
    .from('tickets')
    .update({ ...updates, updated_at: new Date().toISOString() });

  if (isUUID) {
    query = query.or(`id.eq.${ticketId},ticket_ref.eq.${ticketId}`);
  } else {
    query = query.eq('ticket_ref', ticketId);
  }

  const { data, error } = await query.select();
  if (error) throw new Error(error.message);
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Delete a ticket.
 */
export async function deleteTicket(ticketId) {
  if (!ticketId) return false;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);
  let query = supabase.from('tickets').delete();

  if (isUUID) {
    query = query.or(`id.eq.${ticketId},ticket_ref.eq.${ticketId}`);
  } else {
    query = query.eq('ticket_ref', ticketId);
  }

  const { error } = await query;
  if (error) {
    console.warn('[deleteTicket] DB delete notice:', error.message);
    return false;
  }
  return true;
}

/**
 * Insert an audit log entry.
 */
export async function insertAuditLog(logData) {
  try {
    const { data, error } = await supabase
      .from('login_history')
      .insert({
        email_attempted: logData.actor_email || logData.actor || 'system',
        role: logData.actor_role || 'developer',
        success: true,
        failure_reason: logData.action ? `${logData.action}: ${JSON.stringify(logData.details || {})}` : null,
      })
      .select()
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.warn('[insertAuditLog]', err?.message || err);
  }
  return null;
}

