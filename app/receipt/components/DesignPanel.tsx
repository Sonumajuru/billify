"use client";
import { GeneralReceiptData, GeneralReceiptTemplateId } from "../../types";

interface Props { data: GeneralReceiptData; onChange: (d: GeneralReceiptData) => void; }

const TEMPLATES: {
  id: GeneralReceiptTemplateId; name: string; tagline: string;
  preview: { bg: string; accent: string; text: string; tag: string };
}[] = [
  {
    id: "fresh",
    name: "Fresh",
    tagline: "White · clean · works for any business",
    preview: { bg: "#ffffff", accent: "#3b82f6", text: "#111827", tag: "Clean & Modern" },
  },
  {
    id: "dark",
    name: "Dark",
    tagline: "Deep navy · bold accent · premium feel",
    preview: { bg: "#0f172a", accent: "#f59e0b", text: "#f1f5f9", tag: "Bold & Dark" },
  },
  {
    id: "warm",
    name: "Warm",
    tagline: "Cream paper · earth tones · artisanal",
    preview: { bg: "#fdf9f0", accent: "#c2410c", text: "#292524", tag: "Warm & Classic" },
  },
];

const PRESETS: Record<GeneralReceiptTemplateId, { accent: string; bg: string; text: string }[]> = {
  fresh: [
    { accent: "#3b82f6", bg: "#ffffff", text: "#111827" },
    { accent: "#10b981", bg: "#f0fdf9", text: "#064e3b" },
    { accent: "#8b5cf6", bg: "#faf5ff", text: "#2e1065" },
    { accent: "#ec4899", bg: "#fdf2f8", text: "#3b0764" },
  ],
  dark: [
    { accent: "#f59e0b", bg: "#0f172a", text: "#f1f5f9" },
    { accent: "#38bdf8", bg: "#0c1929", text: "#e0f2fe" },
    { accent: "#a3e635", bg: "#111827", text: "#f4f4f5" },
    { accent: "#f472b6", bg: "#1a0a14", text: "#fce7f3" },
  ],
  warm: [
    { accent: "#c2410c", bg: "#fdf9f0", text: "#292524" },
    { accent: "#b45309", bg: "#fffbeb", text: "#1c1107" },
    { accent: "#0f766e", bg: "#f0fdfa", text: "#042f2e" },
    { accent: "#7c3aed", bg: "#faf5ff", text: "#2e1065" },
  ],
};

const WATERMARKS = ["PAID", "RECEIVED", "DRAFT", "COPY", "VOID", "OVERDUE"];

export default function DesignPanel({ data, onChange }: Props) {
  const set = (k: keyof GeneralReceiptData, v: unknown) => onChange({ ...data, [k]: v });
  const currentPresets = PRESETS[data.templateId] || PRESETS.fresh;
  const st = "text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] mb-3";

  return (
    <div className="space-y-7">

      {/* ── TEMPLATE PICKER ── */}
      <div>
        <p className={st}>Choose Template</p>
        <div className="space-y-2">
          {TEMPLATES.map(t => {
            const active = data.templateId === t.id;
            return (
              <button key={t.id} onClick={() => {
                const preset = PRESETS[t.id][0];
                onChange({ ...data, templateId: t.id, accentColor: preset.accent, bgColor: preset.bg, textColor: preset.text });
              }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  active ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
                }`}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: t.preview.bg, flexShrink: 0, position: "relative", overflow: "hidden", border: `2px solid ${active ? "var(--accent)" : "transparent"}` }}>
                  <div style={{ height: 3, background: t.preview.accent }} />
                  <div style={{ padding: "4px 6px" }}>
                    <div style={{ width: "60%", height: 4, background: t.preview.accent, borderRadius: 2, marginBottom: 3, opacity: 0.9 }} />
                    <div style={{ width: "80%", height: 2, background: t.preview.text, borderRadius: 1, opacity: 0.2, marginBottom: 2 }} />
                    <div style={{ width: "50%", height: 2, background: t.preview.text, borderRadius: 1, opacity: 0.15 }} />
                    <div style={{ width: "40%", height: 2, background: t.preview.text, borderRadius: 1, opacity: 0.1, marginTop: 2 }} />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                      <div style={{ padding: "2px 5px", background: t.preview.accent, borderRadius: 4 }}>
                        <div style={{ width: 14, height: 3, background: t.preview.bg, borderRadius: 1, opacity: 0.8 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${active ? "text-[var(--text)]" : "text-[var(--text2)]"}`}>{t.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: active ? "var(--accent)" : "var(--panel-border)", color: active ? "#fff" : "var(--text-muted)", letterSpacing: "0.06em" }}>{t.preview.tag}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text3)] mt-0.5">{t.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── COLOR VARIANTS ── */}
      <div>
        <p className={st}>Color Variant</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {currentPresets.map((p, i) => (
            <button key={i} onClick={() => onChange({ ...data, accentColor: p.accent, bgColor: p.bg, textColor: p.text })}
              title={`Variant ${i + 1}`}
              className={`h-12 rounded-xl border-2 transition-all relative overflow-hidden ${
                data.accentColor === p.accent && data.bgColor === p.bg ? "border-[var(--accent)] scale-105" : "border-[var(--border)] hover:scale-105"
              }`} style={{ background: p.bg }}>
              <div className="absolute left-0 top-0 bottom-0 w-3" style={{ background: p.accent }} />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([
            { k: "accentColor" as const, label: "Accent" },
            { k: "bgColor"     as const, label: "Paper" },
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

      {/* ── WATERMARK ── */}
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
          <div className="grid grid-cols-3 gap-2">
            {WATERMARKS.map(w => (
              <button key={w} onClick={() => set("watermarkText", w)}
                className={`py-2 rounded-xl border text-[11px] font-bold transition ${
                  data.watermarkText === w
                    ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text)]"
                    : "border-[var(--border)] text-[var(--text3)] hover:border-[var(--accent)]"
                }`}>{w}</button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
