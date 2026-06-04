"use client";
import { ITReceiptData, ITTemplateId } from "../../types";

interface Props { data: ITReceiptData; onChange: (d: ITReceiptData) => void; }

const TEMPLATES: {
  id: ITTemplateId; name: string; tagline: string; emoji: string;
  defaultColors: { accent: string; bg: string; text: string };
  variants: { accent: string; bg: string; text: string }[];
}[] = [
  { id: "terminal", name: "Terminal", emoji: "⌨️", tagline: "Dark navy · warm amber · deep ocean",
    defaultColors: { accent: "#f59e0b", bg: "#08101f", text: "#edf2f7" },
    variants: [
      { accent: "#f59e0b", bg: "#08101f", text: "#edf2f7" },
      { accent: "#10b981", bg: "#04120e", text: "#e8fff7" },
      { accent: "#818cf8", bg: "#080f22", text: "#eef0ff" },
      { accent: "#f87171", bg: "#120608", text: "#fff0f0" },
    ]},
  { id: "clean", name: "Clean", emoji: "🏢", tagline: "White · corporate · IBM-inspired",
    defaultColors: { accent: "#0f62fe", bg: "#ffffff", text: "#161616" },
    variants: [
      { accent: "#0f62fe", bg: "#ffffff", text: "#161616" },
      { accent: "#da1e28", bg: "#ffffff", text: "#161616" },
      { accent: "#198038", bg: "#ffffff", text: "#161616" },
      { accent: "#6929c4", bg: "#ffffff", text: "#161616" },
    ]},
  { id: "neon", name: "Neon", emoji: "🌈", tagline: "Cyberpunk · vivid glow · creative studio",
    defaultColors: { accent: "#00f5c4", bg: "#09090f", text: "#f0f0ff" },
    variants: [
      { accent: "#00f5c4", bg: "#09090f", text: "#f0f0ff" },
      { accent: "#f059fb", bg: "#09090f", text: "#f0f0ff" },
      { accent: "#ffca28", bg: "#09090f", text: "#f0f0ff" },
      { accent: "#00b4d8", bg: "#09090f", text: "#f0f0ff" },
    ]},
  { id: "blueprint", name: "Blueprint", emoji: "📐", tagline: "Technical · engineering · grid overlay",
    defaultColors: { accent: "#4db8ff", bg: "#0a1628", text: "#e8f4ff" },
    variants: [
      { accent: "#4db8ff", bg: "#0a1628", text: "#e8f4ff" },
      { accent: "#7fff6e", bg: "#0a1a12", text: "#e8ffe4" },
      { accent: "#ff9f43", bg: "#1a0f00", text: "#fff4e0" },
      { accent: "#ff6b9d", bg: "#1a0a10", text: "#ffe4ee" },
    ]},
  { id: "minimal", name: "Minimal", emoji: "🤍", tagline: "Ultra-clean · Notion-style · pure typography",
    defaultColors: { accent: "#000000", bg: "#ffffff", text: "#111111" },
    variants: [
      { accent: "#000000", bg: "#ffffff", text: "#111111" },
      { accent: "#1d4ed8", bg: "#f8faff", text: "#1e3a8a" },
      { accent: "#166534", bg: "#f0fdf4", text: "#052e16" },
      { accent: "#7c3aed", bg: "#faf5ff", text: "#4c1d95" },
    ]},
  { id: "agency", name: "Agency", emoji: "🚀", tagline: "Bold split header · startup · brand feel",
    defaultColors: { accent: "#6c63ff", bg: "#ffffff", text: "#1a1a2e" },
    variants: [
      { accent: "#6c63ff", bg: "#ffffff", text: "#1a1a2e" },
      { accent: "#ef4444", bg: "#ffffff", text: "#1a0505" },
      { accent: "#f59e0b", bg: "#ffffff", text: "#1a1205" },
      { accent: "#10b981", bg: "#ffffff", text: "#051a12" },
    ]},
];

const WATERMARKS = ["PAID", "INVOICE", "DRAFT", "COPY", "VOID", "APPROVED", "QUOTE", "CONFIDENTIAL"];

export default function DesignPanel({ data, onChange }: Props) {
  const set = (k: keyof ITReceiptData, v: unknown) => onChange({ ...data, [k]: v });
  const currentTpl = TEMPLATES.find(t => t.id === data.templateId) || TEMPLATES[0];
  const st = "text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] mb-3";

  return (
    <div className="space-y-7">

      {/* TEMPLATE PICKER */}
      <div>
        <p className={st}>Choose Template</p>
        <div className="space-y-2">
          {TEMPLATES.map(t => {
            const active = data.templateId === t.id;
            return (
              <button key={t.id}
                onClick={() => onChange({ ...data, templateId: t.id, accentColor: t.defaultColors.accent, bgColor: t.defaultColors.bg, textColor: t.defaultColors.text })}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${active ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"}`}>
                {/* Mini preview swatch */}
                <div style={{ width: 56, height: 56, borderRadius: 10, background: t.defaultColors.bg, flexShrink: 0, overflow: "hidden", border: `2px solid ${active ? "var(--accent)" : "transparent"}` }}>
                  {(t.id === "terminal" || t.id === "neon" || t.id === "blueprint")
                    ? <div style={{ height: 10, background: "#161b22", borderBottom: `1px solid ${t.defaultColors.accent}22`, display: "flex", alignItems: "center", gap: 3, padding: "0 5px" }}>
                        {["#f85149","#f0883e","#3fb950"].map(c => <div key={c} style={{ width: 4, height: 4, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                      </div>
                    : <div style={{ height: 5, background: t.defaultColors.accent }} />
                  }
                  <div style={{ padding: "4px 6px" }}>
                    <div style={{ width: "70%", height: 3, background: t.defaultColors.accent, borderRadius: 2, marginBottom: 3, opacity: 0.8 }} />
                    <div style={{ width: "50%", height: 2, background: t.defaultColors.text, borderRadius: 1, opacity: 0.15, marginBottom: 2 }} />
                    <div style={{ width: "80%", height: 2, background: t.defaultColors.text, borderRadius: 1, opacity: 0.1 }} />
                    <div style={{ width: "40%", height: 2, background: t.defaultColors.text, borderRadius: 1, opacity: 0.08, marginTop: 2 }} />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
                      <div style={{ padding: "1px 4px", background: t.defaultColors.accent, borderRadius: 3 }}>
                        <div style={{ width: 12, height: 3, background: t.defaultColors.bg, borderRadius: 1, opacity: 0.7 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold text-sm ${active ? "text-[var(--text)]" : "text-[var(--text2)]"}`}>{t.emoji} {t.name}</span>
                    {active && <span style={{ fontSize: 9, background: "var(--accent)", color: "#fff", padding: "2px 6px", borderRadius: 20, fontWeight: 700 }}>ACTIVE</span>}
                  </div>
                  <div className="text-[11px] text-[var(--text3)] mt-0.5">{t.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* COLOR VARIANTS */}
      <div>
        <p className={st}>Color Variant</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {currentTpl.variants.map((v, i) => (
            <button key={i}
              onClick={() => onChange({ ...data, accentColor: v.accent, bgColor: v.bg, textColor: v.text })}
              className={`h-12 rounded-xl border-2 transition-all relative overflow-hidden ${data.accentColor === v.accent && data.bgColor === v.bg ? "border-[var(--accent)] scale-105" : "border-[var(--border)] hover:scale-105"}`}
              style={{ background: v.bg }}>
              <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ background: v.accent }} />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([
            { k: "accentColor" as const, label: "Accent" },
            { k: "bgColor"     as const, label: "Background" },
            { k: "textColor"   as const, label: "Text" },
          ]).map(c => (
            <label key={c.k} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition overflow-hidden relative">
                <input type="color" value={data[c.k]} onChange={e => set(c.k, e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer" />
              </div>
              <span className="text-[10px] text-[var(--text3)]">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* WATERMARK */}
      <div>
        <p className={st}>Watermark</p>
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <div onClick={() => set("showWatermark", !data.showWatermark)}
            className={`w-10 h-5 rounded-full transition-all relative ${data.showWatermark ? "bg-[var(--accent)]" : "bg-[var(--border2)]"}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${data.showWatermark ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-sm text-[var(--text2)]">Show diagonal watermark</span>
        </label>
        {data.showWatermark && (
          <div className="grid grid-cols-4 gap-2">
            {WATERMARKS.map(w => (
              <button key={w} onClick={() => set("watermarkText", w)}
                className={`py-1.5 rounded-lg border text-[9px] font-bold tracking-widest transition ${data.watermarkText === w ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text3)] hover:border-[var(--accent)]"}`}>
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
