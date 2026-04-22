import { motion } from "framer-motion";
import { Search, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const go = (_term: string) => {
    navigate({ to: user ? "/discover" : "/auth" });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go(q.trim());
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-primary/30 animate-blob blur-3xl" />
        <div className="absolute top-40 -right-24 w-[24rem] h-[24rem] bg-accent/30 animate-blob blur-3xl" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 w-[20rem] h-[20rem] bg-warning/30 animate-blob blur-3xl" style={{ animationDelay: "4s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5 text-hot" fill="currentColor" />
            <span>Trade skills, not money</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tighter text-balance leading-[0.95]">
            Learn anything.{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Teach what you love.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto text-balance">
            Match with students who teach what you wanna learn — and learn from you in return. No money. Just vibes & value.
          </p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <form onSubmit={onSubmit} className="relative group">
              <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex items-center gap-2 p-2 bg-card rounded-2xl shadow-card border border-border">
                <div className="pl-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What do you wanna learn today?"
                  className="flex-1 bg-transparent outline-none py-3 text-base placeholder:text-muted-foreground"
                />
                <Button type="submit" size="lg" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold gap-1">
                  Search
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Trending:</span>
              {["Python", "Figma", "Calculus", "Spanish", "Guitar"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => go(tag)}
                  className="px-3 py-1 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[
                "bg-gradient-hero",
                "bg-gradient-mint",
                "bg-gradient-sun",
                "bg-gradient-cyber",
              ].map((bg, i) => (
                <div key={i} className={`w-9 h-9 rounded-full ${bg} border-2 border-background`} />
              ))}
            </div>
            <span>
              <span className="font-bold text-foreground">12,400+</span> students already swapping
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
