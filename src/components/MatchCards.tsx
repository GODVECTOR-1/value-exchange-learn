import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { X, Heart, Sparkles, MapPin, Star } from "lucide-react";

const profiles = [
  {
    name: "Maya Chen",
    age: 21,
    location: "Berkeley, CA",
    bio: "CS major obsessed with clean code & matcha. Lemme teach you Python in exchange for some design wisdom 🐍",
    teaches: ["Python", "Algorithms", "ML basics"],
    wants: ["UI Design", "Figma"],
    rating: 4.9,
    swaps: 32,
    gradient: "bg-gradient-hero",
    perfectMatch: true,
  },
  {
    name: "Diego Morales",
    age: 19,
    location: "CDMX, MX",
    bio: "Self-taught designer. Trade my Figma skills for your Spanish convo practice 🎨✨",
    teaches: ["Figma", "Branding", "Illustrator"],
    wants: ["Spanish", "Calculus"],
    rating: 4.8,
    swaps: 21,
    gradient: "bg-gradient-cyber",
    perfectMatch: true,
  },
  {
    name: "Aisha Patel",
    age: 22,
    location: "Toronto, CA",
    bio: "Physics PhD candidate by day, lo-fi guitarist by night. Need help with React, can teach you quantum 🎸",
    teaches: ["Physics", "Calculus", "Guitar"],
    wants: ["React", "TypeScript"],
    rating: 5.0,
    swaps: 47,
    gradient: "bg-gradient-mint",
    perfectMatch: false,
  },
];

function SwipeCard({
  profile,
  onSwipe,
  isTop,
  index,
}: {
  profile: (typeof profiles)[0];
  onSwipe: (dir: "left" | "right") => void;
  isTop: boolean;
  index: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: profiles.length - index,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
      }}
      animate={{
        scale: isTop ? 1 : 1 - index * 0.04,
        y: isTop ? 0 : index * 12,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={`relative h-full rounded-[2rem] overflow-hidden shadow-card ${profile.gradient}`}>
        {/* Avatar placeholder visual */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center text-5xl font-display font-bold text-primary-foreground shadow-pop">
          {profile.name.charAt(0)}
        </div>

        {/* Perfect match badge */}
        {profile.perfectMatch && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/95 backdrop-blur-sm shadow-soft">
            <Sparkles className="w-3.5 h-3.5 text-hot" fill="currentColor" />
            <span className="text-xs font-bold text-foreground">PERFECT MATCH</span>
          </div>
        )}

        {/* Swipe indicators */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-8 px-4 py-2 rounded-2xl bg-success text-success-foreground font-display font-bold text-2xl border-4 border-success-foreground rotate-[-12deg]"
            >
              SWAP!
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 px-4 py-2 rounded-2xl bg-destructive text-destructive-foreground font-display font-bold text-2xl border-4 border-destructive-foreground rotate-[12deg]"
            >
              NOPE
            </motion.div>
          </>
        )}

        {/* Profile content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-3xl">
              {profile.name}, <span className="font-normal opacity-80">{profile.age}</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-90 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> {profile.rating} · {profile.swaps} swaps
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-4 opacity-95">{profile.bio}</p>

          <div className="space-y-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Teaches</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.teaches.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-background/25 backdrop-blur-sm text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Wants to learn</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.wants.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-foreground/30 backdrop-blur-sm text-xs font-semibold border border-background/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MatchCards() {
  const [stack, setStack] = useState(profiles);

  const handleSwipe = (dir: "left" | "right") => {
    setStack((prev) => {
      const next = prev.slice(1);
      return next.length ? next : profiles;
    });
  };

  return (
    <section id="matches" className="py-16 sm:py-24 bg-foreground/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold text-sm mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Smart matchmaking
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-6xl tracking-tighter text-balance">
              Swipe right on your next <span className="bg-gradient-hero bg-clip-text text-transparent">study buddy</span>.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Our algo finds people who teach what you want — and want what you teach. Mutual gain, zero awkwardness.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { num: "92%", label: "match rate" },
                { num: "48h", label: "avg first swap" },
                { num: "4.9★", label: "session rating" },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-2xl bg-card border border-border shadow-soft">
                  <div className="font-display font-bold text-2xl text-primary">{s.num}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card stack */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4]">
              <AnimatePresence>
                {stack.slice(0, 3).map((p, i) => (
                  <SwipeCard
                    key={p.name + stack.length}
                    profile={p}
                    onSwipe={handleSwipe}
                    isTop={i === 0}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => handleSwipe("left")}
                className="w-14 h-14 rounded-full bg-card border-2 border-border shadow-soft hover:border-destructive hover:text-destructive hover:scale-110 transition-all flex items-center justify-center"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
              <button
                onClick={() => handleSwipe("right")}
                className="w-16 h-16 rounded-full bg-gradient-hero shadow-pop hover:scale-110 transition-transform flex items-center justify-center"
              >
                <Heart className="w-7 h-7 text-primary-foreground" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
