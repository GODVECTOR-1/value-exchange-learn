-- Collaborative code sessions tied to a match for real-time pair coding
CREATE TABLE public.code_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE UNIQUE,
  language TEXT NOT NULL DEFAULT 'javascript',
  content TEXT NOT NULL DEFAULT '',
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.code_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match members can view code session"
  ON public.code_sessions FOR SELECT TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));

CREATE POLICY "Match members can create code session"
  ON public.code_sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_match_member(match_id, auth.uid()));

CREATE POLICY "Match members can update code session"
  ON public.code_sessions FOR UPDATE TO authenticated
  USING (public.is_match_member(match_id, auth.uid()));

CREATE TRIGGER update_code_sessions_updated_at
  BEFORE UPDATE ON public.code_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.code_sessions;
ALTER TABLE public.code_sessions REPLICA IDENTITY FULL;

-- Enable realtime on messages too (for the live messages list refresh)
ALTER TABLE public.messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;