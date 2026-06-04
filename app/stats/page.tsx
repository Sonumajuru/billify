"use client";
import { useState, useEffect } from "react";
import { loadEvents, clearEvents, StatEvent } from "../utils/stats";
import { FileText, Home, Download, Globe, Trash2, BarChart2, ExternalLink, RefreshCw, MapPin, Wifi, WifiOff } from "lucide-react";

interface GlobalStats {
  configured: boolean;
  total?: number;
  modes?: { invoice: number; tenancy: number };
  langs?: { en: number; fr: number; nl: number };
  docTypes?: Record<string, number>;
  countries?: Record<string, number>;
  daily?: { date: string; count: number }[];
}

const LANG_LABELS: Record<string, string> = { en: "🇬🇧 English", fr: "🇫🇷 Français", nl: "🇳🇱 Nederlands" };
const LANG_COLORS: Record<string, string> = { en: "#6366f1", fr: "#3b82f6", nl: "#f59e0b" };
const MODE_COLORS: Record<string, string>  = { invoice: "#f59e0b", tenancy: "#10b981" };
const DOC_LABELS: Record<string, string>   = {
  invoice: "Invoice", quote: "Quote", proforma: "Pro Forma",
  credit_note: "Credit Note", receipt: "Receipt", tenancy: "Tenancy Receipt",
};
const COUNTRY_FLAGS: Record<string, string> = {
  NL:"🇳🇱", FR:"🇫🇷", GB:"🇬🇧", BE:"🇧🇪", DE:"🇩🇪", US:"🇺🇸", CA:"🇨🇦",
  AU:"🇦🇺", ZA:"🇿🇦", NG:"🇳🇬", IN:"🇮🇳", JP:"🇯🇵", AE:"🇦🇪", unknown:"🌍",
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 7, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width .5s ease" }} />
    </div>
  );
}

function Card({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ background: "var(--panel)", borderRadius: 16, border: "1px solid var(--border)", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)" }}>{title}</span>
        {badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "var(--text2)", width: 130, flexShrink: 0 }}>{label}</span>
      <Bar value={value} max={Math.max(max, 1)} color={color} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "'JetBrains Mono', monospace", width: 28, textAlign: "right", flexShrink: 0 }}>{value}</span>
      <span style={{ fontSize: 10, color: "var(--text3)", width: 32, textAlign: "right", flexShrink: 0 }}>{max > 0 ? `${Math.round(value/max*100)}%` : "0%"}</span>
    </div>
  );
}

export default function StatsPage() {
  const [local,    setLocal]    = useState<StatEvent[]>([]);
  const [global,   setGlobal]   = useState<GlobalStats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [confirmed,setConfirmed]= useState(false);
  const [view,     setView]     = useState<"global" | "local">("global");

  useEffect(() => { setLocal(loadEvents()); }, []);

  const fetchGlobal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data: GlobalStats = await res.json();
      setGlobal(data);
    } catch { setGlobal({ configured: false }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGlobal(); }, []);

  // ── Local computations ─────────────────────────────────────────
  const localTotal    = local.length;
  const localInvoice  = local.filter(e => e.mode === "invoice").length;
  const localTenancy  = local.filter(e => e.mode === "tenancy").length;
  const localByLang   = local.reduce((a, e) => ({ ...a, [e.lang]: (a[e.lang]||0)+1 }), {} as Record<string,number>);
  const localByDoc    = local.reduce((a, e) => e.docType ? ({ ...a, [e.docType]: (a[e.docType]||0)+1 }) : a, {} as Record<string,number>);

  const now = Date.now();
  const localDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * 86400000);
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
    const ds = new Date(d).setHours(0,0,0,0), de = ds + 86400000;
    return { label, date: d.toISOString().split("T")[0], count: local.filter(e => e.ts >= ds && e.ts < de).length };
  });

  // ── Decide which data to display ──────────────────────────────
  const useGlobal    = view === "global" && global?.configured;
  const total        = useGlobal ? (global!.total || 0) : localTotal;
  const invoiceCount = useGlobal ? (global!.modes?.invoice || 0) : localInvoice;
  const tenancyCount = useGlobal ? (global!.modes?.tenancy || 0) : localTenancy;
  const byLang       = useGlobal ? (global!.langs as Record<string,number> || {}) : localByLang;
  const byDoc        = useGlobal ? (global!.docTypes || {}) : localByDoc;
  const days         = useGlobal ? (global!.daily || []).map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
    date: d.date, count: d.count,
  })) : localDays;
  const maxDay       = Math.max(...days.map(d => d.count), 1);
  const maxDoc       = Math.max(...Object.values(byDoc), 1);
  const maxLang      = Math.max(...Object.values(byLang), 1);

  const countries    = useGlobal ? (global!.countries || {}) : {};
  const topCountries = Object.entries(countries)
    .filter(([k]) => k !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxCountry   = Math.max(...topCountries.map(([,v]) => v), 1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--app)", fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: "var(--panel)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.svg" alt="Billify" style={{ width: 28, height: 28, borderRadius: 7 }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", letterSpacing: -0.5, fontFamily: "'JetBrains Mono', monospace" }}>
            Bill<span style={{ color: "var(--accent)" }}>ify</span>
          </span>
          <span style={{ fontSize: 11, color: "var(--text3)", padding: "2px 8px", borderRadius: 20, background: "var(--surface2)", border: "1px solid var(--border)", marginLeft: 4 }}>Stats</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchGlobal} title="Refresh" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--text2)", padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontFamily: "inherit" }}>
            <RefreshCw size={13} />
          </button>
          <a href="https://vercel.com/analytics" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--text2)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none" }}>
            <ExternalLink size={13} /> Vercel
          </a>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--text2)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none" }}>
            ← App
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px" }}>

        {/* Global / Local toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
          {(["global", "local"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${view===v ? "var(--accent)" : "var(--border)"}`, background: view===v ? "var(--accent-dim)" : "var(--panel)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: view===v ? "var(--accent)" : "var(--text2)", transition: "all .15s" }}>
              {v === "global" ? <><Wifi size={14}/> All Users</> : <><WifiOff size={14}/> This Device</>}
            </button>
          ))}
          {view === "global" && !loading && !global?.configured && (
            <span style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
              ⚠ Redis not configured — see setup below
            </span>
          )}
          {view === "global" && global?.configured && (
            <span style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Live data
            </span>
          )}
        </div>

        {/* Setup banner — only when Redis not configured */}
        {view === "global" && !loading && !global?.configured && (
          <div style={{ marginBottom: 24, padding: "16px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", marginBottom: 8 }}>Connect Upstash Redis to see all-user data</div>
            <ol style={{ fontSize: 13, color: "var(--text2)", lineHeight: 2, paddingLeft: 18, margin: 0 }}>
              <li>Go to <a href="https://console.upstash.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>console.upstash.com</a> → Create a free Redis database</li>
              <li>Copy <strong>REST URL</strong> and <strong>REST Token</strong></li>
              <li>In Vercel → Your project → Settings → Environment Variables, add:<br />
                <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>UPSTASH_REDIS_REST_URL</code> and{" "}
                <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>UPSTASH_REDIS_REST_TOKEN</code>
              </li>
              <li>Redeploy — done. Every PDF download from any user will be counted.</li>
            </ol>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
              Optional: add <code style={{ background: "var(--surface2)", padding: "2px 5px", borderRadius: 4 }}>STATS_SECRET_KEY=your_password</code> to lock this page.
            </div>
          </div>
        )}

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total PDFs",   value: total,         icon: <Download size={18}/>, color: "#f59e0b" },
            { label: "Invoices",     value: invoiceCount,  icon: <FileText size={18}/>, color: "#f59e0b" },
            { label: "Receipts",     value: tenancyCount,  icon: <Home size={18}/>,     color: "#10b981" },
            { label: "Countries",    value: topCountries.length, icon: <MapPin size={18}/>, color: "#6366f1" },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: "var(--panel)", borderRadius: 14, border: "1px solid var(--border)", padding: "16px 18px" }}>
              <div style={{ color: kpi.color, marginBottom: 8 }}>{kpi.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {loading && view === "global" ? "—" : kpi.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginTop: 4 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Daily chart — 14 days */}
        <div style={{ marginBottom: 16 }}>
          <Card title={`Downloads — last 14 days${view === "global" ? " (all users)" : " (this device)"}`} badge={view === "global" ? "GLOBAL" : "LOCAL"}>
            {total === 0 && !loading ? (
              <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "24px 0" }}>
                {view === "global" && !global?.configured ? "Set up Redis to see data here." : "No downloads yet."}
              </p>
            ) : (
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
                {days.map(d => (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {d.count > 0 && <span style={{ fontSize: 9, color: "var(--text)", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{d.count}</span>}
                    <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: d.count ? "var(--accent)" : "var(--border)", height: `${Math.max((d.count / maxDay) * 52, d.count ? 6 : 2)}px`, transition: "height .4s ease" }} />
                    <span style={{ fontSize: 8, color: "var(--text3)", textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

          {/* Mode */}
          <Card title="Mode split" badge={view === "global" ? "GLOBAL" : "LOCAL"}>
            {total === 0 ? <p style={{ fontSize: 13, color: "var(--text3)" }}>No data.</p> : (
              <>
                <StatRow label="Invoice / Quote" value={invoiceCount} max={total} color={MODE_COLORS.invoice} />
                <StatRow label="Tenancy Receipt"  value={tenancyCount} max={total} color={MODE_COLORS.tenancy} />
              </>
            )}
          </Card>

          {/* Language */}
          <Card title="Language" badge={view === "global" ? "GLOBAL" : "LOCAL"}>
            {total === 0 ? <p style={{ fontSize: 13, color: "var(--text3)" }}>No data.</p> : (
              Object.entries(byLang).map(([l, v]) => (
                <StatRow key={l} label={LANG_LABELS[l] || l} value={v} max={maxLang} color={LANG_COLORS[l] || "#8b5cf6"} />
              ))
            )}
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: useGlobal && topCountries.length ? "1fr 1fr" : "1fr", gap: 14, marginBottom: 14 }}>

          {/* Doc types */}
          {Object.keys(byDoc).length > 0 && (
            <Card title="Document Types" badge={view === "global" ? "GLOBAL" : "LOCAL"}>
              {Object.entries(byDoc).sort((a,b)=>b[1]-a[1]).map(([t, v]) => (
                <StatRow key={t} label={DOC_LABELS[t] || t} value={v} max={maxDoc} color="var(--accent)" />
              ))}
            </Card>
          )}

          {/* Countries — only when global data available */}
          {useGlobal && topCountries.length > 0 && (
            <Card title="Top countries" badge="GLOBAL">
              {topCountries.map(([code, count]) => (
                <StatRow key={code} label={`${COUNTRY_FLAGS[code] || "🌐"} ${code}`} value={count} max={maxCountry} color="#6366f1" />
              ))}
            </Card>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            {view === "global"
              ? "Global data via Upstash Redis. Page views via Vercel Analytics."
              : `${localTotal} event${localTotal !== 1 ? "s" : ""} stored in this browser.`}
          </span>
          {view === "local" && localTotal > 0 && (
            <button onClick={() => { if (!confirmed) { setConfirmed(true); return; } clearEvents(); setLocal([]); setConfirmed(false); }}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: confirmed ? "#ef4444" : "var(--text3)", background: "none", border: `1px solid ${confirmed ? "#ef4444" : "var(--border)"}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit" }}>
              <Trash2 size={13} />
              {confirmed ? "Confirm delete" : "Clear local stats"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
