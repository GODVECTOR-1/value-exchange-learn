import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/math")({
  head: () => ({ meta: [{ title: "Math · Swapr" }] }),
  component: MathPage,
});

type Problem = { question: string; answer: number; steps: string[] };

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function gen(level: 1 | 2 | 3): Problem {
  if (level === 1) {
    const a = rand(2, 20), b = rand(2, 20);
    const op = ["+", "-", "*"][rand(0, 2)];
    const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
    return {
      question: `${a} ${op} ${b} = ?`,
      answer: ans,
      steps: [`Take ${a} and ${b}.`, `Apply ${op}.`, `Result: ${ans}.`],
    };
  }
  if (level === 2) {
    // linear: ax + b = c
    const x = rand(1, 12), a = rand(2, 9), b = rand(-10, 10);
    const c = a * x + b;
    return {
      question: `Solve for x: ${a}x + ${b} = ${c}`,
      answer: x,
      steps: [`Subtract ${b} from both sides: ${a}x = ${c - b}.`, `Divide by ${a}: x = ${(c - b) / a}.`],
    };
  }
  // quadratic with integer roots
  const r1 = rand(-6, 6), r2 = rand(-6, 6);
  const b = -(r1 + r2), c = r1 * r2;
  return {
    question: `Find a root of x² + ${b}x + ${c} = 0`,
    answer: r1,
    steps: [`Factor: (x − ${r1})(x − ${r2}) = 0.`, `Roots: x = ${r1} or x = ${r2}.`],
  };
}

function MathPage() {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [p, setP] = useState<Problem>(() => gen(1));
  const [val, setVal] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [streak, setStreak] = useState(0);

  const next = (lv: 1 | 2 | 3 = level) => { setP(gen(lv)); setVal(""); setShowSteps(false); };

  const check = () => {
    const n = Number(val);
    if (Number.isNaN(n)) { toast.error("Enter a number"); return; }
    if (n === p.answer) {
      setStreak(streak + 1);
      toast.success(`Correct! Streak: ${streak + 1}`);
      next();
    } else {
      setStreak(0);
      toast.error(`Not quite. Try again or peek at hints.`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-sun flex items-center justify-center"><Calculator className="w-5 h-5 text-foreground" /></div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Math practice</h1>
            <p className="text-sm text-muted-foreground">Streak: {streak} 🔥</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((lv) => (
              <button key={lv} onClick={() => { setLevel(lv as 1 | 2 | 3); next(lv as 1 | 2 | 3); }}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${level === lv ? "bg-foreground text-background" : "bg-muted text-foreground"}`}>L{lv}</button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
          <div className="text-3xl sm:text-4xl font-display font-bold text-center py-6">{p.question}</div>
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") check(); }}
            placeholder="Your answer"
            className="rounded-xl text-lg text-center"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={check} className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 font-semibold"><Check className="w-4 h-4 mr-1" /> Check</Button>
            <Button onClick={() => next()} variant="outline" className="rounded-full h-12"><RefreshCw className="w-4 h-4 mr-1" /> Skip</Button>
          </div>
          <button onClick={() => setShowSteps(!showSteps)} className="text-sm text-primary hover:underline mt-4">
            {showSteps ? "Hide hints" : "Show step-by-step hints"}
          </button>
          {showSteps && (
            <ol className="list-decimal pl-5 mt-2 text-sm text-muted-foreground space-y-1">
              {p.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
