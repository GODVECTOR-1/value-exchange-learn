import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold">Swapr</span>
          <span className="text-sm text-muted-foreground">— learn by trading.</span>
        </div>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link to="/learn" className="hover:text-foreground">Learn</Link>
          <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          <Link to="/discover" className="hover:text-foreground">Discover</Link>
        </div>
      </div>
    </footer>
  );
}
