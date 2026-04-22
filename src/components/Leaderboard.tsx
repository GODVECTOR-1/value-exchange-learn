import { Trophy, Flame, Crown, Medal } from "lucide-react";

const leaders = [
  { rank: 1, name: "Aisha P.", points: 4820, swaps: 47, streak: 64, badge: Crown, color: "text-warning", bg: "bg-warning/15" },
  { rank: 2, name: "Maya C.", points: 3940, swaps: 32, streak: 28, badge: Medal, color: "text-muted-foreground", bg: "bg-muted" },
  { rank: 3, name: "Diego M.", points: 3210, swaps: 28, streak: 19, badge: Medal, color: "text-hot", bg: "bg-hot/15" },
  { rank: 4, name: "Yuki M.", points: 2890, swaps: 24, streak: 42, badge: Trophy, color: "text-primary", bg: "bg-primary/15" },
  { rank: 5, name: "Marcus W.", points: 2410, swaps: 21, streak: 9, badge: Trophy, color: "text-primary", bg: "bg-primary/15" },
];

export function Leaderboard() {
  return (
    <section id="leaderboard" className="py-16 sm:py-24 bg-foreground/[0.03]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning-foreground font-semibold text-sm mb-3">
            <Flame className="w-3.5 h-3.5 text-hot" fill="currentColor" />
            This week's top swappers
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            Leaderboard
          </h2>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
          {leaders.map((l, i) => {
            const Badge = l.badge;
            return (
              <div
                key={l.name}
                className={`flex items-center gap-4 p-4 sm:p-5 ${i !== leaders.length - 1 ? "border-b border-border" : ""} hover:bg-muted/50 transition-colors`}
              >
                <div className={`w-10 h-10 rounded-xl ${l.bg} flex items-center justify-center font-display font-bold text-lg ${l.color}`}>
                  {l.rank}
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold">
                  {l.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg truncate">{l.name}</span>
                    <Badge className={`w-4 h-4 ${l.color} shrink-0`} />
                  </div>
                  <div className="text-xs text-muted-foreground">{l.swaps} swaps · {l.streak}d streak 🔥</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-xl">{l.points.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
