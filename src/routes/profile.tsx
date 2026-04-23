import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, Loader2, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile · Swapr" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [offered, setOffered] = useState<string[]>([]);
  const [wanted, setWanted] = useState<string[]>([]);
  const [newOffered, setNewOffered] = useState("");
  const [newWanted, setNewWanted] = useState("");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setBio(data.bio ?? "");
        setLocation(data.location ?? "");
        setAvailability(data.availability ?? "");
        setOffered(data.skills_offered ?? []);
        setWanted(data.skills_wanted ?? []);
        setXp(data.xp ?? 0);
        setStreak(data.streak ?? 0);
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (saving) return;
    if (!displayName.trim()) { toast.error("Please add a display name."); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        availability: availability.trim() || null,
        skills_offered: offered,
        skills_wanted: wanted,
      };
      // Upsert + await the row back (HTTP 200/201 with returned row)
      const { data, error, status } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      if (!data || (status !== 200 && status !== 201)) throw new Error("Save did not confirm");
      toast.success("Profile saved!");
      const complete = !!data.display_name && (data.skills_offered?.length ?? 0) > 0;
      if (complete) navigate({ to: "/matches" });
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't save profile.");
    } finally {
      setSaving(false);
    }
  };

  const addChip = (val: string, list: string[], set: (v: string[]) => void, clear: () => void) => {
    const v = val.trim();
    if (!v || list.includes(v) || list.length >= 12) return;
    set([...list, v]);
    clear();
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Your profile</h1>
            <p className="text-muted-foreground mt-1">Tell others what you teach and what you wanna learn.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-gradient-hero text-primary-foreground border-0 px-3 py-1.5 text-sm rounded-full">
              <Trophy className="w-4 h-4 mr-1" /> {xp} XP
            </Badge>
            <Badge className="bg-hot text-hot-foreground border-0 px-3 py-1.5 text-sm rounded-full">
              <Flame className="w-4 h-4 mr-1" /> {streak} day streak
            </Badge>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border space-y-5">
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={400} placeholder="Tell people about yourself..." className="mt-1.5 rounded-xl min-h-24" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="Berlin · Remote" className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="avail">Availability</Label>
              <Input id="avail" value={availability} onChange={(e) => setAvailability(e.target.value)} maxLength={80} placeholder="Weekday evenings" className="mt-1.5 rounded-xl" />
            </div>
          </div>

          <ChipEditor
            label="Skills I can teach"
            color="bg-gradient-mint text-secondary-foreground"
            values={offered}
            onRemove={(v) => setOffered(offered.filter((x) => x !== v))}
            input={newOffered}
            setInput={setNewOffered}
            onAdd={() => addChip(newOffered, offered, setOffered, () => setNewOffered(""))}
            placeholder="e.g. Physics, Guitar, Python"
          />
          <ChipEditor
            label="Skills I want to learn"
            color="bg-gradient-sun text-foreground"
            values={wanted}
            onRemove={(v) => setWanted(wanted.filter((x) => x !== v))}
            input={newWanted}
            setInput={setNewWanted}
            onAdd={() => addChip(newWanted, wanted, setWanted, () => setNewWanted(""))}
            placeholder="e.g. Spanish, UI Design, Math"
          />

          <Button onClick={save} disabled={saving} className="relative z-10 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save profile"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function ChipEditor({
  label, color, values, onRemove, input, setInput, onAdd, placeholder,
}: {
  label: string; color: string; values: string[]; onRemove: (v: string) => void;
  input: string; setInput: (v: string) => void; onAdd: () => void; placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v) => (
          <span key={v} className={`${color} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5`}>
            {v}
            <button onClick={() => onRemove(v)} className="hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          maxLength={40}
          className="rounded-xl"
        />
        <Button type="button" onClick={onAdd} variant="outline" className="rounded-xl"><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
