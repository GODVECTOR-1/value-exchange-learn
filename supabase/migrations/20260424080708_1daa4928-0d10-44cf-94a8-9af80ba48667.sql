-- Deduplicate any existing rows before adding the unique constraint
DELETE FROM public.lesson_progress a
USING public.lesson_progress b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.subject = b.subject
  AND a.lesson_id = b.lesson_id;

ALTER TABLE public.lesson_progress
DROP CONSTRAINT IF EXISTS lesson_progress_user_subject_lesson_unique;

ALTER TABLE public.lesson_progress
ADD CONSTRAINT lesson_progress_user_subject_lesson_unique
UNIQUE (user_id, subject, lesson_id);