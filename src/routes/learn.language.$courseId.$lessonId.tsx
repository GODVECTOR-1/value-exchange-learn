import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { COURSES, type Question } from "@/data/languageLessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, X, Check, ArrowLeft, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/language/$courseId/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson · Swapr" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = COURSES.find((c) => c.id === courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);

  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!course || !lesson) {
    return <AppLayout><div className="max-w-md mx-auto p-8 text-center"><p>Lesson not found.</p><Link to="/learn/language" className="text-primary underline">Back</Link></div></AppLayout>;
  }

  const q = lesson.questions[idx];
  const total = lesson.questions.length;
  const xpEarned = score * 10;

  const onAnswer = async (correct: boolean) => {
    const nextScore = correct ? score + 1 : score;
    const nextHearts = correct ? hearts : hearts - 1;
    if (correct) {
      setScore(nextScore);
      toast.success("Correct! +10 XP");
    } else {
      setHearts(nextHearts);
      toast.error("Try again!");
    }
    const finished = idx + 1 >= total || (!correct && hearts <= 1);
    if (finished) {
      setDone(true);
      const earned = nextScore * 10;
      if (user) {
        try {
          await supabase.from("lesson_progress").upsert({
            user_id: user.id, subject: `language:${courseId}`, lesson_id: lessonId,
            completed: true, score: nextScore, hearts: nextHearts, xp_earned: earned,
            last_activity_at: new Date().toISOString(),
          }, { onConflict: "user_id,subject,lesson_id" });
          const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user.id).maybeSingle();
          await supabase.from("profiles").update({ xp: (prof?.xp ?? 0) + earned }).eq("user_id", user.id);
        } catch (e) {
          console.error("Failed to save progress", e);
        }
      }
    } else {
      setIdx((i) => i + 1);
    }
  };

  if (done) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <Trophy className="w-20 h-20 mx-auto text-warning mb-4" />
          <h2 className="font-display font-bold text-3xl">Lesson complete!</h2>
          <p className="text-muted-foreground mt-2">Score: {score} / {total} · +{xpEarned} XP</p>
          <div className="flex gap-3 mt-8 justify-center">
            <Button asChild variant="outline" className="rounded-full"><Link to="/learn/language">More lessons</Link></Button>
            <Button onClick={() => { setIdx(0); setHearts(5); setScore(0); setDone(false); }} className="rounded-full bg-foreground text-background hover:bg-foreground/90">Replay</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate({ to: "/learn/language" })} className="p-2 rounded-full hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-mint transition-all" style={{ width: `${(idx / total) * 100}%` }} />
          </div>
          <div className="flex items-center gap-1 text-hot font-semibold"><Heart className="w-5 h-5 fill-current" /> {hearts}</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            className="bg-card rounded-3xl p-6 border border-border shadow-soft"
          >
            <QuestionView q={q} onAnswer={onAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

function QuestionView({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [matchPicks, setMatchPicks] = useState<{ a?: string; b?: string }>({});
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);

  if (q.type === "choice") {
    return (
      <div>
        <h3 className="font-display font-bold text-xl mb-5">{q.prompt}</h3>
        <div className="space-y-2">
          {q.options.map((o, i) => (
            <button
              key={i}
              onClick={() => setPicked(i)}
              className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-medium transition ${picked === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >{o}</button>
          ))}
        </div>
        <Button
          disabled={picked === null}
          onClick={() => onAnswer(picked === q.answer)}
          className="w-full mt-5 rounded-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold"
        >Check</Button>
      </div>
    );
  }
  if (q.type === "translate") {
    return (
      <div>
        <h3 className="font-display font-bold text-xl mb-5">Translate: <span className="text-primary">{q.prompt}</span></h3>
        <Input value={text} onChange={(e) => setText(e.target.value)} className="rounded-xl text-lg" placeholder="Type your answer…" />
        <Button
          disabled={!text.trim()}
          onClick={() => {
            const ok = [q.answer, ...(q.alts ?? [])].some((a) => a.toLowerCase().trim() === text.toLowerCase().trim());
            onAnswer(ok);
          }}
          className="w-full mt-5 rounded-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold"
        >Check</Button>
      </div>
    );
  }
  // match
  const left = q.pairs.map((p) => p.a);
  const right = [...q.pairs.map((p) => p.b)].sort();
  const tryMatch = (a: string, b: string) => {
    const ok = q.pairs.find((p) => p.a === a)?.b === b;
    if (ok) {
      const next = new Set(matched); next.add(a); setMatched(next);
      setMatchPicks({});
      setFeedback("ok"); setTimeout(() => setFeedback(null), 300);
      if (next.size === q.pairs.length) onAnswer(true);
    } else {
      setFeedback("bad"); setTimeout(() => { setFeedback(null); setMatchPicks({}); }, 400);
    }
  };
  return (
    <div>
      <h3 className="font-display font-bold text-xl mb-5">{q.prompt}</h3>
      <div className={`grid grid-cols-2 gap-2 ${feedback === "bad" ? "animate-pulse" : ""}`}>
        <div className="space-y-2">
          {left.map((a) => (
            <button key={a} disabled={matched.has(a)}
              onClick={() => { const next = { ...matchPicks, a }; setMatchPicks(next); if (next.b) tryMatch(a, next.b); }}
              className={`w-full px-3 py-3 rounded-2xl border-2 text-sm font-medium ${matched.has(a) ? "opacity-30" : matchPicks.a === a ? "border-primary bg-primary/10" : "border-border"}`}
            >{a}</button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((b) => {
            const isMatched = q.pairs.some((p) => matched.has(p.a) && p.b === b);
            return (
              <button key={b} disabled={isMatched}
                onClick={() => { const next = { ...matchPicks, b }; setMatchPicks(next); if (next.a) tryMatch(next.a, b); }}
                className={`w-full px-3 py-3 rounded-2xl border-2 text-sm font-medium ${isMatched ? "opacity-30" : matchPicks.b === b ? "border-primary bg-primary/10" : "border-border"}`}
              >{b}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
