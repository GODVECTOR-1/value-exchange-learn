import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Atom, Play, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PracticeWithMatch } from "@/components/PracticeWithMatch";
import { SubjectHero } from "@/components/SubjectHero";
import { SubjectSettings } from "@/components/SubjectSettings";
import { useSubjectSettings } from "@/hooks/useSubjectSettings";

export const Route = createFileRoute("/learn/physics")({
  head: () => ({ meta: [{ title: "Physics · Swapr" }] }),
  component: PhysicsPage,
});

const QUIZ = [
  { q: "Acceleration due to gravity on Earth (m/s²)?", options: ["3.7", "9.8", "11.2", "1.6"], a: 1 },
  { q: "Unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], a: 2 },
  { q: "Kinetic energy formula?", options: ["mgh", "½mv²", "ma", "Fd"], a: 1 },
  { q: "Speed of light (m/s)?", options: ["3 × 10⁶", "3 × 10⁸", "3 × 10¹⁰", "1.5 × 10⁸"], a: 1 },
];

function PhysicsPage() {
  const [tab, setTab] = useState<"quiz" | "projectile">("quiz");
  const { settings, update } = useSubjectSettings("physics");
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <SubjectHero
          icon={Atom}
          title="Physics"
          subtitle="Test your knowledge or launch a projectile."
          gradient="bg-gradient-hero"
          tag="Quiz + sim"
          actions={
            <>
              <PracticeWithMatch mode="live" label="Study with a match" />
              <SubjectSettings subjectName="Physics" settings={settings} onChange={update} />
            </>
          }
        />
        <div className="flex gap-1 mb-4 bg-muted rounded-full p-1 w-fit">
          {([["quiz", "Quiz"], ["projectile", "Projectile sim"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === k ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
          ))}
        </div>
        {tab === "quiz" ? <Quiz settings={settings} /> : <Projectile />}
      </div>
    </AppLayout>
  );
}

function Quiz({ settings }: { settings: ReturnType<typeof useSubjectSettings>["settings"] }) {
  const { user } = useAuth();
  const playBeep = (type: "ok" | "fail" = "ok") => {
    if (!settings.sound) return;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AC();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = type === "ok" ? 880 : 220; o.type = "sine"; g.gain.value = 0.05;
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.12);
      setTimeout(() => ctx.close(), 200);
    } catch { /* ignore */ }
  };
  const quiz = useMemo(() => {
    if (settings.difficulty === "easy") return QUIZ.slice(0, 2);
    if (settings.difficulty === "hard") return QUIZ;
    return QUIZ.slice(0, 3);
  }, [settings.difficulty]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const q = quiz[i];
  const done = i >= quiz.length;

  useEffect(() => { setI(0); setScore(0); setPicked(null); }, [settings.difficulty]);
  useEffect(() => { setTimeLeft(settings.timerSeconds); }, [i, settings.timerSeconds, settings.timer]);

  const submit = useCallback(() => {
    const correct = picked !== null && picked === q.a;
    const nextScore = correct ? score + 1 : score;
    if (correct) { setScore(nextScore); playBeep("ok"); toast.success("Correct!"); }
    else { playBeep("fail"); toast.error(picked === null ? `Time! Answer: ${q.options[q.a]}` : `Answer: ${q.options[q.a]}`); }
    setPicked(null);
    const nextI = i + 1;
    setI(nextI);
    if (nextI >= quiz.length && user) {
      const earned = nextScore * 10;
      (async () => {
        try {
          await supabase.from("lesson_progress").upsert({
            user_id: user.id, subject: "physics", lesson_id: "quiz",
            completed: true, score: nextScore, hearts: 5, xp_earned: earned,
            last_activity_at: new Date().toISOString(),
          }, { onConflict: "user_id,subject,lesson_id" });
          const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user.id).maybeSingle();
          await supabase.from("profiles").update({ xp: (prof?.xp ?? 0) + earned }).eq("user_id", user.id);
        } catch (e) { console.error("save physics progress failed", e); }
      })();
    }
  }, [picked, q, score, i, quiz.length, user]);

  useEffect(() => {
    if (!settings.timer || done) return;
    if (timeLeft <= 0) { submit(); return; }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [settings.timer, timeLeft, done, submit]);

  if (done) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border text-center">
        <h2 className="font-display font-bold text-2xl">Score: {score} / {quiz.length}</h2>
        <Button onClick={() => { setI(0); setScore(0); }} className="mt-4 rounded-full bg-foreground text-background hover:bg-foreground/90">Restart</Button>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {i + 1} / {quiz.length}</span>
        {settings.timer && <span className={`font-bold ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>{timeLeft}s</span>}
      </div>
      <h3 className="font-display font-bold text-xl">{q.q}</h3>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o, k) => (
          <button key={k} onClick={() => setPicked(k)}
            className={`px-4 py-3 rounded-2xl border-2 font-medium text-left ${picked === k ? "border-primary bg-primary/10" : "border-border"}`}>{o}</button>
        ))}
      </div>
      <Button onClick={submit} disabled={picked === null} className="relative z-10 w-full rounded-full h-12 bg-foreground text-background hover:bg-foreground/90"><Check className="w-4 h-4 mr-1" /> Submit</Button>
    </div>
  );
}

function Projectile() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(40);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    // ground
    ctx.fillStyle = "#9ee493"; ctx.fillRect(0, h - 20, w, 20);
    // path
    const g = 9.8, theta = (angle * Math.PI) / 180;
    const vx = speed * Math.cos(theta), vy = speed * Math.sin(theta);
    ctx.strokeStyle = "rgba(108,76,255,0.4)"; ctx.lineWidth = 2; ctx.beginPath();
    let lastX = 20, lastY = h - 20;
    for (let s = 0; s < 6; s += 0.05) {
      const x = 20 + vx * s * 4;
      const y = h - 20 - (vy * s - 0.5 * g * s * s) * 4;
      if (y > h - 20) break;
      ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); lastX = x; lastY = y;
    }
    ctx.stroke();
    // ball
    const x = 20 + vx * t * 4;
    const y = h - 20 - (vy * t - 0.5 * g * t * t) * 4;
    if (y <= h - 20) {
      ctx.fillStyle = "#ff5277"; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
  }, [angle, speed, t]);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      setT((prev) => {
        const next = prev + dt;
        const g = 9.8, theta = (angle * Math.PI) / 180;
        const vy = speed * Math.sin(theta);
        const y = vy * next - 0.5 * g * next * next;
        if (y < 0 && next > 0.1) { setRunning(false); return 0; }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [running, angle, speed]);

  const range = ((speed * speed) * Math.sin((2 * angle * Math.PI) / 180) / 9.8).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-3xl p-4 border border-border">
        <canvas ref={ref} width={640} height={300} className="w-full h-auto rounded-2xl bg-gradient-to-b from-sky-100 to-sky-50" />
      </div>
      <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1"><span>Angle</span><span className="font-semibold">{angle}°</span></div>
          <Slider value={[angle]} min={5} max={85} onValueChange={(v) => setAngle(v[0])} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span>Initial speed</span><span className="font-semibold">{speed} m/s</span></div>
          <Slider value={[speed]} min={10} max={80} onValueChange={(v) => setSpeed(v[0])} />
        </div>
        <div className="text-sm text-muted-foreground">Predicted range: <span className="font-semibold text-foreground">{range} m</span></div>
        <div className="flex gap-2">
          <Button onClick={() => { setT(0); setRunning(true); }} className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Play className="w-4 h-4 mr-1" /> Launch</Button>
          <Button variant="outline" className="rounded-full" onClick={() => { setRunning(false); setT(0); }}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
        </div>
      </div>
    </div>
  );
}
