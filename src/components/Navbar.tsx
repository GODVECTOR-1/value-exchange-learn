import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-pop group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Swapr</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-full hover:bg-muted transition-colors">
            Discover
          </Link>
          <a href="#matches" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-full hover:bg-muted transition-colors">
            Matches
          </a>
          <a href="#leaderboard" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-full hover:bg-muted transition-colors">
            Leaderboard
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
            Log in
          </Button>
          <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-soft">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
