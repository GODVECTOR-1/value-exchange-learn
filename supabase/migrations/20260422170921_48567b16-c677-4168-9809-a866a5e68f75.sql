-- =========================================
-- SWIPES
-- =========================================
CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL,
  target_id uuid NOT NULL,
  liked boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_id, target_id),
  CHECK (swiper_id <> target_id)
);
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT TO authenticated USING (auth.uid() = swiper_id);
CREATE POLICY "Users can create their own swipes" ON public.swipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = swiper_id);
CREATE INDEX idx_swipes_target ON public.swipes(target_id);
CREATE INDEX idx_swipes_swiper ON public.swipes(swiper_id);

-- =========================================
-- MATCHES
-- =========================================
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their matches" ON public.matches
  FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE INDEX idx_matches_user_a ON public.matches(user_a);
CREATE INDEX idx_matches_user_b ON public.matches(user_b);

-- Auto-create match on mutual like
CREATE OR REPLACE FUNCTION public.handle_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ua uuid;
  ub uuid;
BEGIN
  IF NEW.liked = true THEN
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.target_id
        AND target_id = NEW.swiper_id
        AND liked = true
    ) THEN
      ua := LEAST(NEW.swiper_id, NEW.target_id);
      ub := GREATEST(NEW.swiper_id, NEW.target_id);
      INSERT INTO public.matches (user_a, user_b)
      VALUES (ua, ub)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_mutual_like
AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION public.handle_mutual_like();

-- =========================================
-- MESSAGES
-- =========================================
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_match_member(_match uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matches
    WHERE id = _match AND (_user = user_a OR _user = user_b)
  );
$$;

CREATE POLICY "Members can read match messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_match_member(match_id, auth.uid()));
CREATE POLICY "Members can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_match_member(match_id, auth.uid()));
CREATE INDEX idx_messages_match ON public.messages(match_id, created_at);

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =========================================
-- SESSIONS
-- =========================================
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  guest_id uuid NOT NULL,
  topic text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 480),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view sessions" ON public.sessions
  FOR SELECT TO authenticated USING (auth.uid() = host_id OR auth.uid() = guest_id);
CREATE POLICY "Participants can create sessions" ON public.sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);
CREATE POLICY "Participants can update sessions" ON public.sessions
  FOR UPDATE TO authenticated USING (auth.uid() = host_id OR auth.uid() = guest_id);
CREATE TRIGGER trg_sessions_updated
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (reviewer_id <> reviewee_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view reviews" ON public.reviews
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

-- =========================================
-- LESSON PROGRESS
-- =========================================
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  lesson_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  hearts integer NOT NULL DEFAULT 5,
  xp_earned integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, subject, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.lesson_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.lesson_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id, subject);
CREATE TRIGGER trg_lesson_progress_updated
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- updated_at trigger for profiles (if not present)
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();