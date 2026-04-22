import { Star, Zap } from "lucide-react";

const featured = [
  { name: "Sana K.", skill: "UI/UX Design", trade: "↔ React", rating: 4.9, gradient: "bg-gradient-hero", streak: 28 },
  { name: "Leo T.", skill: "Calculus II", trade: "↔ Spanish", rating: 5.0, gradient: "bg-gradient-mint", streak: 14 },
  { name: "Yuki M.", skill: "Japanese", trade: "↔ Photography", rating: 4.8, gradient: "bg-gradient-sun", streak: 42 },
  { name: "Marcus W.", skill: "Music Theory", trade: "↔ Coding", rating: 4.9, gradient: "bg-gradient-cyber", streak: 9 },
];

export function Featured() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            🔥 Featured swappers this week
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">Top-rated students ready to trade skills</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p) => (
            <div
              key={p.name}
              className="group rounded-3xl bg-card border border-border shadow-soft overflow-hidden hover:shadow-pop hover:-translate-y-1 transition-all"
            >
              <div className={`relative h-40 ${p.gradient} flex items-center justify-center`}>
                <div className="w-20 h-20 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center text-3xl font-display font-bold text-primary-foreground">
                  {p.name.charAt(0)}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-hot text-hot-foreground text-xs font-bold shadow-soft">
                  <Zap className="w-3 h-3" fill="currentColor" />
                  {p.streak}d
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-lg">{p.name}</h3>
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 text-warning" fill="currentColor" />
                    {p.rating}
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary mb-1">{p.skill}</div>
                <div className="text-xs text-muted-foreground">{p.trade}</div>
                <button className="mt-4 w-full py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors">
                  Send swap request
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
