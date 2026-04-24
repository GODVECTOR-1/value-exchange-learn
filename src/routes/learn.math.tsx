import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Check, Lock, Trophy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/learn/math")({
  head: () => ({ meta: [{ title: "Math · Swapr" }] }),
  component: MathPage,
});

type Problem = { question: string; answer: number; hint: string };

const LEVELS: { name: string; problems: Problem[] }[] = [
  {
    name: "Arithmetic",
    problems: [
      { question: "12 + 7 = ?", answer: 19, hint: "Add tens then units." },
      { question: "9 × 6 = ?", answer: 54, hint: "9 × 6 = 9 × 5 + 9." },
      { question: "84 ÷ 4 = ?", answer: 21, hint: "Divide both digits by 4." },
    ],
  },
  {
    name: "Linear equations",
    problems: [
      { question: "Solve: 3x + 2 = 11", answer: 3, hint: "Subtract 2, then divide by 3." },
      { question: "Solve: 5x − 4 = 16", answer: 4, hint: "Add 4, divide by 5." },
      { question: "Solve: 2x + 9 = 1", answer: -4, hint: "Subtract 9, divide by 2." },
    ],
  },
  {
    name: "Quadratics",
    problems: [
      { question: "A root of x² − 5x + 6 = 0", answer: 2, hint: "Factor (x−2)(x−3)." },
      { question: "A root of x² − 9 = 0", answer: 3, hint: "Difference of squares." },
      { question: "A root of x² + 2x − 8 = 0", answer: 2, hint: "Factor (x−2)(x+4)." },
    ],
  },
];

function MathPage() {
  const { user } = useAuth();
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const [val, setVal] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [unlocked, setUnlocked] = useState(0); // highest unlocked level
  const [completed, setCompleted] = useState(false);

  const p = LEVELS[level].problems[step];
  const total = LEVELS.reduce((s, l) => s + l.problems.length, 0);
  const done = useMemo(() => {
    let c = 0;
    for (let i = 0; i < level; i++) c += LEVELS[i].problems.length;
    return c + step;
  }, [level, step]);

  const submit = () => {
    const n = Number(val);
    if (Number.isNaN(n)) { toast.error("Enter a number"); return; }
    if (n !== p.answer) { toast.error("Not quite — peek at the hint."); return; }
    toast.success("Correct! Unlocked next problem.");
    setVal(""); setShowHint(false);
    if (step + 1 < LEVELS[level].problems.length) {
      setStep(step + 1);
    } else if (level + 1 < LEVELS.length) {
      const nl = level + 1;
      setLevel(nl); setStep(0);
      setUnlocked(Math.max(unlocked, nl));
    } else {
      setCompleted(true);
    }
  };

  const restart = () => { setLevel(0); setStep(0); setVal(""); setUnlocked(0); setCompleted(false); setShowHint(false); };

  return (
    <AppLayout>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-sun flex items-center justify-center"><Calculator className="w-5 h-5 text-foreground" /></div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Math practice</h1>
            <p className="text-sm text-muted-foreground">Solve to unlock — {done}/{total} cleared.</p>
          </div>
        </div>

        {/* Stepper */}
        <ol className="flex items-center gap-2 mb-6">
          {LEVELS.map((lv, i) => {
            const isUnlocked = i <= unlocked;
            const isActive = i === level;
            return (
              <li key={lv.name} className="flex-1 flex items-center gap-2">
                <button
                  onClick={() => isUnlocked && (setLevel(i), setStep(0), setVal(""), setShowHint(false))}
                  disabled={!isUnlocked}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold border-2 transition ${
                    isActive ? "border-primary bg-primary/10 text-foreground"
                      : isUnlocked ? "border-border bg-card text-foreground hover:border-primary/40"
                      : "border-border bg-muted text-muted-foreground cursor-not-allowed"
                  }`}>
                  {isUnlocked ? <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs">{i + 1}</span> : <Lock className="w-4 h-4" />}
                  <span className="truncate">{lv.name}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {completed ? (
          <div className="bg-card rounded-3xl p-8 border border-border text-center shadow-soft">
            <Trophy className="w-12 h-12 mx-auto text-warning mb-3" />
            <h2 className="font-display font-bold text-2xl">All levels cleared!</h2>
            <p className="text-muted-foreground mt-1">Brilliant work. Reset to play again.</p>
            <Button onClick={restart} className="mt-4 rounded-full bg-foreground text-background hover:bg-foreground/90"><RotateCcw className="w-4 h-4 mr-1" /> Restart</Button>
          </div>
        ) : (
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level {level + 1} · Problem {step + 1} of {LEVELS[level].problems.length}</div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-center py-6">{p.question}</div>
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="Your answer"
              inputMode="numeric"
              className="rounded-xl text-lg text-center"
            />
            <Button onClick={submit} className="relative z-10 w-full mt-3 rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 font-semibold">
              <Check className="w-4 h-4 mr-1" /> Submit
            </Button>
            <button onClick={() => setShowHint(!showHint)} className="text-sm text-primary hover:underline mt-3 block mx-auto">
              {showHint ? "Hide hint" : "Need a hint?"}
            </button>
            {showHint && <p className="text-sm text-muted-foreground mt-2 text-center">{p.hint}</p>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
