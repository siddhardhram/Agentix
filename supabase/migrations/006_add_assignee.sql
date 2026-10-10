-- Add assignee column to tickets table
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS assignee UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON public.tickets(assignee);
