import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Code2, Languages, Calculator, Atom, Palette, Sparkles, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn · Swapr" }] }),
  component: LearnHub,
});

const subjects = [
  { to: "/learn/code", title: "Coding", desc: "Multi-language playground with live execution.", icon: Code2, gradient: "bg-gradient-cyber", tag: "10+ langs" },
  { to: "/learn/language", title: "Languages", desc: "Bite-sized lessons à la Duolingo.", icon: Languages, gradient: "bg-gradient-mint", tag: "Hearts & XP" },
  { to: "/learn/math", title: "Math", desc: "Solve equations & unlock new levels.", icon: Calculator, gradient: "bg-gradient-sun", tag: "3 levels" },
  { to: "/learn/physics", title: "Physics", desc: "Quizzes + interactive projectile sim.", icon: Atom, gradient: "bg-gradient-hero", tag: "Live sim" },
  { to: "/learn/design", title: "UI Design", desc: "Sketch on a mini-canvas, export PNG.", icon: Palette, gradient: "bg-gradient-card", tag: "Export" },
] as const;

function LearnHub() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 sm:p-10 mb-8 shadow-card">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Learn studio
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mt-3 max-w-2xl leading-tight">
              Learn anything. <span className="italic">Earn XP</span> while you do.
            </h1>
            <p className="text-white/85 mt-3 max-w-xl">
              Pick a subject below — practice solo or invite a match for a live session.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group relative block rounded-3xl overflow-hidden border-2 border-border bg-card hover:border-primary/40 hover:shadow-pop transition-all hover:-translate-y-1"
            >
              <div className={`${s.gradient} relative p-6 h-36 flex items-start justify-between`}>
                <s.icon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={2} />
                <span className="px-2.5 py-1 rounded-full bg-white/25 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider">
                  {s.tag}
                </span>
                <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <div className="p-5">
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
