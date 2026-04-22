import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Code2, Languages, Calculator, Atom, Palette } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn · Swapr" }] }),
  component: LearnHub,
});

const subjects = [
  { to: "/learn/code", title: "Coding", desc: "Multi-language playground with live execution.", icon: Code2, gradient: "bg-gradient-cyber" },
  { to: "/learn/language", title: "Languages", desc: "Bite-sized lessons à la Duolingo.", icon: Languages, gradient: "bg-gradient-mint" },
  { to: "/learn/math", title: "Math", desc: "Solve equations & practice problems.", icon: Calculator, gradient: "bg-gradient-sun" },
  { to: "/learn/physics", title: "Physics", desc: "Quizzes + interactive simulations.", icon: Atom, gradient: "bg-gradient-hero" },
  { to: "/learn/design", title: "UI Design", desc: "Sketch on a mini-canvas, export PNG.", icon: Palette, gradient: "bg-gradient-card" },
] as const;

function LearnHub() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-1">Learn anything</h1>
        <p className="text-muted-foreground mb-8">Pick a subject and earn XP while you practice.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Link key={s.to} to={s.to} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-card transition-shadow">
              <div className={`${s.gradient} p-6 h-32 flex items-end`}>
                <s.icon className="w-10 h-10 text-primary-foreground drop-shadow" strokeWidth={2} />
              </div>
              <div className="p-5 bg-card">
                <h3 className="font-display font-bold text-xl group-hover:text-primary transition">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
