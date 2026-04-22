import { Link } from "@tanstack/react-router";
import { Sparkles, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Navbar() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const initial = (user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase();

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
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold shadow-pop hover:scale-105 transition-transform">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initial
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <div className="px-2 py-2">
                  <div className="text-sm font-semibold truncate">{user.user_metadata?.full_name || "Student"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link to="/">
                    <UserIcon className="w-4 h-4 mr-2" /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-soft">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
