import { UserCircle2, Sparkles, MessagesSquare, Trophy } from "lucide-react";

const steps = [
  { icon: UserCircle2, title: "Build your profile", desc: "List what you teach & wanna learn. Set your vibe." },
  { icon: Sparkles, title: "Get matched", desc: "Our algo finds your perfect skill-swap partner." },
  { icon: MessagesSquare, title: "Chat & schedule", desc: "Real-time messages. Book sessions in seconds." },
  { icon: Trophy, title: "Earn badges", desc: "Build streaks. Climb the leaderboard. Flex." },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">From signup to first swap in under 5 minutes.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative">
                <div className="rounded-3xl bg-card border border-border p-6 shadow-soft h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-pop mb-4">
                    <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mb-1">STEP {i + 1}</div>
                  <h3 className="font-display font-bold text-xl mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
