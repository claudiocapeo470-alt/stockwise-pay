ALTER TABLE public.cash_sessions
  ADD COLUMN IF NOT EXISTS opened_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_by_user
  ON public.cash_sessions (opened_by_user_id, status);