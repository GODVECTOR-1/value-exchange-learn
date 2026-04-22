import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Swapr" },
      { name: "description", content: "Join Swapr and start trading skills with students worldwide." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
      setSubmitting(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = mode === "signin"
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, displayName || email.split("@")[0]);

    if (error) {
      toast.error(error);
      setSubmitting(false);
    } else {
      toast.success(mode === "signin" ? "Welcome back! ✨" : "Account created! Check your email to confirm.");
      if (mode === "signin") navigate({ to: "/" });
      else setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 animate-blob blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/30 animate-blob blur-3xl" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-warning/20 animate-blob blur-3xl" style={{ animationDelay: "5s" }} />
      </div>

      {/* Logo header */}
      <header className="p-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-pop">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Swapr</span>
        </Link>
      </header>

      {/* Auth card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-3xl shadow-card p-7 sm:p-9">
            <div className="text-center mb-7">
              <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
                {mode === "signin" ? "Welcome back" : "Join Swapr"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to continue swapping skills"
                  : "Create an account to start trading skills"}
              </p>
            </div>

            {/* Google button */}
            <Button
              onClick={handleGoogle}
              disabled={submitting}
              variant="outline"
              size="lg"
              className="w-full rounded-2xl h-12 font-semibold border-2 hover:border-foreground transition-all gap-3"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmail} className="space-y-3">
              {mode === "signup" && (
                <Field
                  icon={UserIcon}
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={setDisplayName}
                />
              )}
              <Field
                icon={Mail}
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                icon={Lock}
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
              />

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full rounded-2xl h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-bold shadow-pop gap-2 mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign in" : "Create account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Swapr?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </div>
          </div>

          <p className="mt-5 text-xs text-center text-muted-foreground">
            By continuing you agree to our terms & privacy policy.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  minLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-input border-2 border-transparent focus:border-primary focus:bg-card outline-none text-sm font-medium placeholder:text-muted-foreground/70 transition-all"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
