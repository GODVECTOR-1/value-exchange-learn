import { motion } from "framer-motion";
import { Code2, Palette, GraduationCap, Languages, Music, Camera } from "lucide-react";

const categories = [
  { name: "Coding", icon: Code2, gradient: "bg-gradient-cyber", count: "2.4k swaps" },
  { name: "Design", icon: Palette, gradient: "bg-gradient-hero", count: "1.8k swaps" },
  { name: "Academics", icon: GraduationCap, gradient: "bg-gradient-mint", count: "3.1k swaps" },
  { name: "Languages", icon: Languages, gradient: "bg-gradient-sun", count: "1.2k swaps" },
  { name: "Music", icon: Music, gradient: "bg-gradient-card", count: "890 swaps" },
  { name: "Photography", icon: Camera, gradient: "bg-gradient-cyber", count: "640 swaps" },
];

export function Categories() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
              Pick your <span className="italic text-primary">vibe</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">Browse skills by category</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group relative aspect-square rounded-3xl p-5 text-left overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop transition-shadow"
              >
                <div className={`absolute inset-0 ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative h-full flex flex-col justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${cat.gradient} flex items-center justify-center shadow-soft group-hover:bg-background/20 group-hover:backdrop-blur-sm transition-all`}>
                    <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="group-hover:text-primary-foreground transition-colors">
                    <div className="font-display font-bold text-lg">{cat.name}</div>
                    <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">{cat.count}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
