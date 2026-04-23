ALTER TABLE public.code_sessions
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_messages_match_created
ON public.messages (match_id, created_at DESC);