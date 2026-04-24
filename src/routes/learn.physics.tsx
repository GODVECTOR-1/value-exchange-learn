import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Atom, Play, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center"><Atom className="w-5 h-5 text-primary-foreground" /></div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Physics</h1>
        </div>
        <div className="flex gap-1 mb-4 bg-muted rounded-full p-1 w-fit">
          {([["quiz", "Quiz"], ["projectile", "Projectile sim"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${tab === k ? "bg-background shadow-soft" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        {tab === "quiz" ? <Quiz /> : <Projectile />}
      </div>
    </AppLayout>
  );
}

function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = QUIZ[i];
  const done = i >= QUIZ.length;

  const submit = () => {
    if (picked === null) return;
    if (picked === q.a) { setScore(score + 1); toast.success("Correct!"); }
    else toast.error(`Answer: ${q.options[q.a]}`);
    setPicked(null);
    setI(i + 1);
  };

  if (done) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border text-center">
        <h2 className="font-display font-bold text-2xl">Score: {score} / {QUIZ.length}</h2>
        <Button onClick={() => { setI(0); setScore(0); }} className="mt-4 rounded-full bg-foreground text-background hover:bg-foreground/90">Restart</Button>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
      <div className="text-xs text-muted-foreground">Question {i + 1} / {QUIZ.length}</div>
      <h3 className="font-display font-bold text-xl">{q.q}</h3>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o, k) => (
          <button key={k} onClick={() => setPicked(k)}
            className={`px-4 py-3 rounded-2xl border-2 font-medium text-left ${picked === k ? "border-primary bg-primary/10" : "border-border"}`}>{o}</button>
        ))}
      </div>
      <Button onClick={submit} disabled={picked === null} className="w-full rounded-full h-12 bg-foreground text-background hover:bg-foreground/90"><Check className="w-4 h-4 mr-1" /> Submit</Button>
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
