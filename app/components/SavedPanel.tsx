"use client";
import { useState, useEffect, useRef } from "react";
import {
  Save, FolderOpen, Trash2, Download, Upload, Copy,
  Clock, FileText, Home, Star, Check, Plus, Layers,
} from "lucide-react";
import { SavedDoc, SavedTemplate, AppMode, ITReceiptData, TenancyData } from "../types";
import {
  getDocs, saveDoc, deleteDoc,
  getTemplates, saveTemplate, deleteTemplate, exportTemplate, importTemplate,
  saveDraft, loadDraft,
} from "../utils/storage";

interface Props {
  mode: AppMode;
  currentData: ITReceiptData | TenancyData;
  onLoadDoc: (doc: SavedDoc) => void;
  onApplyTemplate: (tpl: SavedTemplate) => void;
  onNewDoc: () => void;
}

type PanelTab = "docs" | "templates";

const timeAgo = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dy = Math.floor(d / 86400000);
  if (m  < 2)  return "just now";
  if (m  < 60) return `${m}m ago`;
  if (h  < 24) return `${h}h ago`;
  if (dy < 7)  return `${dy}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

// ── Reusable styles ─────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  background: "var(--surface)", border: "1px solid var(--border)",
  fontSize: 13, color: "var(--text)", fontFamily: "inherit",
  outline: "none", transition: "border-color .15s",
};

const btn = (accent: string, text = "#fff"): React.CSSProperties => ({
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
  gap: 7, padding: "10px 14px", borderRadius: 11, border: "none",
  background: accent, color: text, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s",
});

const ghost: React.CSSProperties = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
  gap: 7, padding: "9px 14px", borderRadius: 11,
  border: "2px dashed var(--border2)", background: "transparent",
  color: "var(--text3)", fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
};

export default function SavedPanel({ mode, currentData, onLoadDoc, onApplyTemplate, onNewDoc }: Props) {
  const [tab,       setTab]       = useState<PanelTab>("docs");
  const [docs,      setDocs]      = useState<SavedDoc[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [docName,   setDocName]   = useState("");
  const [tplName,   setTplName]   = useState("");
  const [toast,     setToast]     = useState<string | null>(null);
  const [draft,     setDraft]     = useState<{ data: unknown; savedAt: string } | null>(null);
  const [delConfirm,setDelConfirm]= useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const autoRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const refresh = () => { setDocs(getDocs()); setTemplates(getTemplates()); };
  useEffect(() => { refresh(); setDraft(loadDraft(mode)); }, [mode]);

  useEffect(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => { saveDraft(mode, currentData); setDraft(loadDraft(mode)); }, 30000);
    return () => clearInterval(autoRef.current);
  }, [mode, currentData]);

  const toast$ = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const handleSaveDoc = () => {
    const name = docName.trim() || `${mode === "invoice" ? "Invoice" : "Receipt"} · ${new Date().toLocaleDateString("en-GB")}`;
    saveDoc({ id: Date.now().toString(), mode, name, savedAt: new Date().toISOString(), data: currentData });
    setDocName(""); refresh(); toast$("Saved ✓");
  };

  const handleSaveTemplate = () => {
    const name = tplName.trim() || `Template · ${new Date().toLocaleDateString("en-GB")}`;
    saveTemplate({ id: Date.now().toString(), mode, name, createdAt: new Date().toISOString(), template: currentData });
    setTplName(""); refresh(); toast$("Template saved ✓");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { const tpl = await importTemplate(f); refresh(); toast$(`Imported: ${tpl.name}`); }
    catch { toast$("Invalid template file"); }
    e.target.value = "";
  };

  const modeIcon  = mode === "invoice" ? <FileText size={13}/> : <Home size={13}/>;
  const modeColor = mode === "invoice" ? "var(--accent)" : "var(--green)";
  const filteredDocs = docs.filter(d => d.mode === mode);
  const filteredTpls = templates.filter(t => t.mode === mode);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", zIndex: 200, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: "var(--green)", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }} className="fade-in">
          <Check size={14}/> {toast}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface2)", flexShrink: 0 }}>
        {([
          { id: "docs"      as PanelTab, icon: <Save size={13}/>,   label: `Documents${filteredDocs.length ? ` (${filteredDocs.length})` : ""}` },
          { id: "templates" as PanelTab, icon: <Layers size={13}/>, label: `Templates${filteredTpls.length ? ` (${filteredTpls.length})` : ""}` },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, fontWeight: 600, border: "none", background: tab===t.id ? "var(--panel)" : "transparent", color: tab===t.id ? "var(--text)" : "var(--text3)", borderBottom: tab===t.id ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px", display: "flex", flexDirection: "column", gap: 12 }}>

        {tab === "docs" && (
          <>
            {/* Draft banner */}
            {draft && (
              <div style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={13} style={{ color: "#f97316", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>Unsaved draft</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Auto-saved {timeAgo((draft as { savedAt: string }).savedAt)}</div>
                </div>
                <button onClick={() => { onLoadDoc({ id:"draft", mode, name:"Draft", savedAt: (draft as {savedAt:string}).savedAt, data: draft.data as ITReceiptData|TenancyData }); toast$("Draft restored"); }}
                  style={{ fontSize: 11, fontWeight: 700, color: "#f97316", background: "none", border: "1px solid rgba(249,115,22,0.4)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                  Restore
                </button>
              </div>
            )}

            {/* Save current */}
            <div style={{ padding: "14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 10 }}>Save Current</div>
              <input
                style={{ ...inp, marginBottom: 9 }}
                value={docName}
                onChange={e => setDocName(e.target.value)}
                placeholder="Name this document…"
                onKeyDown={e => e.key === "Enter" && handleSaveDoc()}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
              />
              <button style={btn("var(--accent)", "#1a2535")} onClick={handleSaveDoc}
                onMouseEnter={e=>(e.currentTarget.style.opacity=".85")}
                onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                <Save size={14}/> Save Document
              </button>
            </div>

            {/* New doc */}
            <button style={ghost} onClick={onNewDoc}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--text3)"; }}>
              <Plus size={14}/> New Document
            </button>

            {/* Saved list */}
            {filteredDocs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 12 }}>
                <Save size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <div>No saved documents yet</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Save your work above to restore later</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", paddingBottom: 4 }}>
                  Saved ({filteredDocs.length})
                </div>
                {filteredDocs.map(doc => (
                  <div key={doc.id}
                    style={{ padding: "11px 13px", borderRadius: 12, border: `1px solid ${delConfirm===doc.id ? "#ef4444" : "var(--border)"}`, background: "var(--panel)", transition: "border-color .15s", cursor: "default" }}
                    onMouseEnter={e=>{ if (delConfirm!==doc.id) (e.currentTarget as HTMLDivElement).style.borderColor="var(--accent)"; }}
                    onMouseLeave={e=>{ if (delConfirm!==doc.id) (e.currentTarget as HTMLDivElement).style.borderColor="var(--border)"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: modeColor, flexShrink: 0 }}>{modeIcon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10}/> {timeAgo(doc.savedAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { onLoadDoc(doc); toast$(`Opened: ${doc.name}`); }}
                          style={{ padding: "5px 9px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: modeColor, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, transition: "all .15s" }}
                          title="Open">
                          <FolderOpen size={12}/> Open
                        </button>
                        {delConfirm === doc.id ? (
                          <button onClick={() => { deleteDoc(doc.id); refresh(); setDelConfirm(null); toast$("Deleted"); }}
                            style={{ padding: "5px 9px", borderRadius: 8, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700 }}>
                            Confirm
                          </button>
                        ) : (
                          <button onClick={() => setDelConfirm(doc.id)}
                            style={{ padding: "5px 7px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text3)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all .15s" }}
                            title="Delete"
                            onMouseEnter={e=>{ e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="#ef4444"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.color="var(--text3)"; e.currentTarget.style.borderColor="var(--border)"; }}>
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "templates" && (
          <>
            {/* Save as template */}
            <div style={{ padding: "14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--purple)", marginBottom: 6 }}>Save as Template</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>Saves design & branding — not client data.</div>
              <input
                style={{ ...inp, marginBottom: 9 }}
                value={tplName}
                onChange={e => setTplName(e.target.value)}
                placeholder="My Company Template"
                onKeyDown={e => e.key === "Enter" && handleSaveTemplate()}
                onFocus={e => e.currentTarget.style.borderColor = "var(--purple)"}
                onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
              />
              <button style={btn("var(--purple)")} onClick={handleSaveTemplate}
                onMouseEnter={e=>(e.currentTarget.style.opacity=".85")}
                onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                <Star size={14}/> Save Template
              </button>
            </div>

            {/* Import */}
            <div>
              <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
              <button style={ghost} onClick={() => importRef.current?.click()}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--text3)"; }}>
                <Upload size={13}/> Import Template (.json)
              </button>
            </div>

            {/* Template list */}
            {filteredTpls.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 12 }}>
                <Layers size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <div>No templates saved yet</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Save your branding as a template to reuse</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", paddingBottom: 4 }}>
                  Templates ({filteredTpls.length})
                </div>
                {filteredTpls.map(tpl => (
                  <div key={tpl.id}
                    style={{ padding: "11px 13px", borderRadius: 12, border: `1px solid ${delConfirm===tpl.id ? "#ef4444" : "var(--border)"}`, background: "var(--panel)", transition: "border-color .15s" }}
                    onMouseEnter={e=>{ if (delConfirm!==tpl.id) (e.currentTarget as HTMLDivElement).style.borderColor="var(--purple)"; }}
                    onMouseLeave={e=>{ if (delConfirm!==tpl.id) (e.currentTarget as HTMLDivElement).style.borderColor="var(--border)"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Star size={13} style={{ color: "var(--purple)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tpl.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10}/> {timeAgo(tpl.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { onApplyTemplate(tpl); toast$(`Applied: ${tpl.name}`); }}
                          style={{ padding: "5px 9px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--purple)", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                          title="Apply">
                          <Copy size={12}/> Apply
                        </button>
                        <button onClick={() => exportTemplate(tpl)}
                          style={{ padding: "5px 7px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text3)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all .15s" }}
                          title="Export"
                          onMouseEnter={e=>{ e.currentTarget.style.color="var(--accent)"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.color="var(--text3)"; }}>
                          <Download size={12}/>
                        </button>
                        {delConfirm === tpl.id ? (
                          <button onClick={() => { deleteTemplate(tpl.id); refresh(); setDelConfirm(null); toast$("Deleted"); }}
                            style={{ padding: "5px 9px", borderRadius: 8, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700 }}>
                            Confirm
                          </button>
                        ) : (
                          <button onClick={() => setDelConfirm(tpl.id)}
                            style={{ padding: "5px 7px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text3)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all .15s" }}
                            title="Delete"
                            onMouseEnter={e=>{ e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="#ef4444"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.color="var(--text3)"; e.currentTarget.style.borderColor="var(--border)"; }}>
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
