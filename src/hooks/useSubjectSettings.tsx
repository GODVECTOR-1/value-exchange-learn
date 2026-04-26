import { useCallback, useEffect, useMemo, useState } from "react";

export type Difficulty = "easy" | "normal" | "hard";

export interface SubjectSettings {
  difficulty: Difficulty;
  sound: boolean;
  timer: boolean;
  timerSeconds: number;
}

const DEFAULTS: SubjectSettings = {
  difficulty: "normal",
  sound: true,
  timer: false,
  timerSeconds: 30,
};

const key = (subject: string) => `swapr.subject.${subject}.settings`;

export function useSubjectSettings(subject: string) {
  const [settings, setSettings] = useState<SubjectSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key(subject));
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, [subject]);

  const update = useCallback((patch: Partial<SubjectSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(key(subject), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [subject]);

  const playBeep = useCallback((type: "ok" | "fail" = "ok") => {
    if (!settings.sound) return;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AC) return;
      const ctx = new AC();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = type === "ok" ? 880 : 220;
      o.type = "sine";
      g.gain.value = 0.05;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
      setTimeout(() => ctx.close(), 200);
    } catch { /* ignore */ }
  }, [settings.sound]);

  return useMemo(() => ({ settings, update, playBeep }), [settings, update, playBeep]);
}
