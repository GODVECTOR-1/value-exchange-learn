import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Palette, Square, Circle, Type, Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/learn/design")({
  head: () => ({ meta: [{ title: "UI Design Canvas · Swapr" }] }),
  component: DesignPage,
});

type Shape =
  | { id: string; kind: "rect"; x: number; y: number; w: number; h: number; color: string }
  | { id: string; kind: "circle"; x: number; y: number; r: number; color: string }
  | { id: string; kind: "text"; x: number; y: number; text: string; color: string };

const COLORS = ["#6c4cff", "#ff5277", "#ffb547", "#3ad29f", "#0a0a0f", "#ffffff"];

function DesignPage() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const add = (kind: "rect" | "circle" | "text") => {
    const id = Math.random().toString(36).slice(2, 9);
    const x = 80 + Math.random() * 200, y = 80 + Math.random() * 100;
    let s: Shape;
    if (kind === "rect") s = { id, kind, x, y, w: 120, h: 80, color };
    else if (kind === "circle") s = { id, kind, x, y, r: 40, color };
    else s = { id, kind, x, y, text: "Hello!", color };
    setShapes([...shapes, s]);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - drag.ox;
    const y = e.clientY - rect.top - drag.oy;
    setShapes((prev) => prev.map((s) => (s.id === drag.id ? { ...s, x, y } : s)));
  };

  const exportPNG = () => {
    const svg = svgRef.current; if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = svg.clientWidth * 2; c.height = svg.clientHeight * 2;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const a = document.createElement("a");
      a.download = "swapr-design.png"; a.href = c.toDataURL("image/png"); a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center"><Palette className="w-5 h-5 text-primary-foreground" /></div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex-1">Design Canvas</h1>
          <Button onClick={exportPNG} variant="outline" className="rounded-full"><Download className="w-4 h-4 mr-1" /> Export</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button onClick={() => add("rect")} variant="outline" className="rounded-full"><Square className="w-4 h-4 mr-1" /> Rect</Button>
          <Button onClick={() => add("circle")} variant="outline" className="rounded-full"><Circle className="w-4 h-4 mr-1" /> Circle</Button>
          <Button onClick={() => add("text")} variant="outline" className="rounded-full"><Type className="w-4 h-4 mr-1" /> Text</Button>
          <Button onClick={() => setShapes([])} variant="outline" className="rounded-full text-destructive"><Trash2 className="w-4 h-4 mr-1" /> Clear</Button>
          <div className="flex gap-1.5 ml-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-foreground" : "border-border"}`} style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="w-full h-[500px] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:20px_20px]"
            onPointerMove={onMove}
            onPointerUp={() => setDrag(null)}
          >
            {shapes.map((s) => {
              const onDown = (e: React.PointerEvent) => {
                const rect = svgRef.current!.getBoundingClientRect();
                setDrag({ id: s.id, ox: e.clientX - rect.left - s.x, oy: e.clientY - rect.top - s.y });
              };
              if (s.kind === "rect") return <rect key={s.id} x={s.x} y={s.y} width={s.w} height={s.h} rx="12" fill={s.color} onPointerDown={onDown} className="cursor-move" />;
              if (s.kind === "circle") return <circle key={s.id} cx={s.x + s.r} cy={s.y + s.r} r={s.r} fill={s.color} onPointerDown={onDown} className="cursor-move" />;
              return <text key={s.id} x={s.x} y={s.y + 20} fill={s.color} fontSize="24" fontWeight="700" onPointerDown={onDown} className="cursor-move select-none">{s.text}</text>;
            })}
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Tip: drag shapes to move. Pick a color, then add shapes.</p>
      </div>
    </AppLayout>
  );
}
