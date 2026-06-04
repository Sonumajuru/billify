"use client";
import { useState, useEffect, useRef } from "react";
import { Save, FolderOpen, Trash2, Download, Upload, Copy, Clock, FileText, Home, Star, X, Check, AlertCircle } from "lucide-react";
import { SavedDoc, SavedTemplate, AppMode, ITReceiptData, TenancyData } from "../types";
import {
  getDocs, saveDoc, deleteDoc,
  getTemplates, saveTemplate, deleteTemplate, exportTemplate, importTemplate,
  saveDraft, loadDraft, clearDraft,
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
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function SavedPanel({ mode, currentData, onLoadDoc, onApplyTemplate, onNewDoc }: Props) {
  const [tab,       setTab]       = useState<PanelTab>("docs");
  const [docs,      setDocs]      = useState<SavedDoc[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [docName,   setDocName]   = useState("");
  const [tplName,   setTplName]   = useState("");
  const [toast,     setToast]     = useState<string | null>(null);
  const [draft,     setDraft]     = useState<{ data: unknown; savedAt: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const refresh = () => { setDocs(getDocs()); setTemplates(getTemplates()); };

  useEffect(() => { refresh(); setDraft(loadDraft(mode)); }, [mode]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(() => {
      saveDraft(mode, currentData);
      setDraft(loadDraft(mode));
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [mode, currentData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveDoc = () => {
    const name = docName.trim() || `${mode === "invoice" ? "Invoice" : "Tenancy"} — ${new Date().toLocaleDateString("en-GB")}`;
    const doc: SavedDoc = { id: Date.now().toString(), mode, name, savedAt: new Date().toISOString(), data: currentData };
    saveDoc(doc);
    setDocName("");
    refresh();
    showToast("Document saved ✓");
  };

  const handleSaveTemplate = () => {
    const name = tplName.trim() || `Template — ${new Date().toLocaleDateString("en-GB")}`;
    const tpl: SavedTemplate = { id: Date.now().toString(), mode, name, createdAt: new Date().toISOString(), template: currentData };
    saveTemplate(tpl);
    setTplName("");
    refresh();
    showToast("Template saved ✓");
  };

  const handleImportTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const tpl = await importTemplate(file);
      refresh();
      showToast(`Imported: ${tpl.name}`);
    } catch { showToast("Invalid template file"); }
    e.target.value = "";
  };

  const handleRestoreDraft = () => {
    if (!draft) return;
    onLoadDoc({ id: "draft", mode, name: "Draft", savedAt: draft.savedAt, data: draft.data as ITReceiptData | TenancyData });
    showToast("Draft restored");
  };

  const inp = "w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] transition font-[inherit]";
  const modeIcon = mode === "invoice" ? <FileText size={12}/> : <Home size={12}/>;
  const modeLabel = mode === "invoice" ? "Invoice" : "Tenancy";

  return (
    <div className="flex flex-col h-full">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green)] text-white text-sm font-semibold shadow-xl fade-in">
          <Check size={14}/> {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] sticky top-0 bg-[var(--panel)] z-10">
        {(["docs","templates"] as PanelTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-[13px] font-semibold capitalize transition"
            style={{ color: tab===t?"var(--text)":"var(--text3)", borderBottom: tab===t?"2px solid var(--accent)":"2px solid transparent", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
            {t === "docs" ? "Saved Documents" : "Templates"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {tab === "docs" && (
          <>
            {/* New + Auto-save draft banner */}
            <div className="flex gap-2">
              <button onClick={onNewDoc}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--border)] text-[var(--text2)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition">
                <FileText size={13}/> New Document
              </button>
            </div>

            {draft && (
              <div className="p-3 rounded-xl border border-[var(--orange)] bg-[var(--orange-dim)] flex items-start gap-3">
                <Clock size={14} className="text-[var(--orange)] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[var(--orange)]">Unsaved draft</div>
                  <div className="text-[11px] text-[var(--text3)] mt-0.5">Auto-saved {timeAgo((draft as { savedAt: string }).savedAt)}</div>
                </div>
                <button onClick={handleRestoreDraft} className="text-xs font-bold text-[var(--orange)] hover:text-[var(--text)] transition px-2 py-1 rounded-lg border border-[var(--orange)] hover:border-[var(--text)]">
                  Restore
                </button>
              </div>
            )}

            {/* Save current */}
            <div className="space-y-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Save Current Document</p>
              <input className={inp} value={docName} onChange={e=>setDocName(e.target.value)}
                placeholder={`${modeLabel} #001 — Client Name`}
                onKeyDown={e => e.key === "Enter" && handleSaveDoc()} />
              <button onClick={handleSaveDoc}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--accent)] text-[#0d1117] text-sm font-bold hover:opacity-90 transition">
                <Save size={14}/> Save Document
              </button>
            </div>

            {/* Saved list */}
            {docs.filter(d => d.mode === mode).length === 0 ? (
              <div className="text-center py-8 text-[var(--text3)] text-xs">No saved {modeLabel.toLowerCase()} documents yet</div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text3)]">
                  Saved ({docs.filter(d=>d.mode===mode).length})
                </p>
                {docs.filter(d => d.mode === mode).map(doc => (
                  <div key={doc.id} className="group p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[var(--accent)] flex-shrink-0">{modeIcon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text)] truncate">{doc.name}</div>
                          <div className="text-[11px] text-[var(--text3)] flex items-center gap-1 mt-0.5">
                            <Clock size={10}/> {timeAgo(doc.savedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                        <button onClick={() => onLoadDoc(doc)} title="Open"
                          className="p-1.5 rounded-lg hover:bg-[var(--accent-dim)] text-[var(--accent)] transition">
                          <FolderOpen size={13}/>
                        </button>
                        <button onClick={() => { deleteDoc(doc.id); refresh(); }} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-[var(--text3)] hover:text-red-400 transition">
                          <Trash2 size={13}/>
                        </button>
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
            <div className="space-y-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Save as Template</p>
              <p className="text-[11px] text-[var(--text3)]">Saves your design, branding and default settings — not client data.</p>
              <input className={inp} value={tplName} onChange={e=>setTplName(e.target.value)}
                placeholder="My Company Template"
                onKeyDown={e => e.key === "Enter" && handleSaveTemplate()} />
              <button onClick={handleSaveTemplate}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--purple)] text-white text-sm font-bold hover:opacity-90 transition">
                <Star size={14}/> Save Template
              </button>
            </div>

            {/* Import template */}
            <div>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportTemplate} />
              <button onClick={() => importRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-[var(--border)] text-[var(--text3)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition">
                <Upload size={13}/> Import Template (.json)
              </button>
            </div>

            {/* Template list */}
            {templates.filter(t => t.mode === mode).length === 0 ? (
              <div className="text-center py-8 text-[var(--text3)] text-xs">No saved templates yet</div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text3)]">
                  Templates ({templates.filter(t=>t.mode===mode).length})
                </p>
                {templates.filter(t => t.mode === mode).map(tpl => (
                  <div key={tpl.id} className="group p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--purple)] transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Star size={12} className="text-[var(--purple)] flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text)] truncate">{tpl.name}</div>
                          <div className="text-[11px] text-[var(--text3)] flex items-center gap-1 mt-0.5">
                            <Clock size={10}/> {timeAgo(tpl.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                        <button onClick={() => { onApplyTemplate(tpl); showToast(`Applied: ${tpl.name}`); }}
                          title="Apply template"
                          className="p-1.5 rounded-lg hover:bg-[var(--purple)]/20 text-[var(--purple)] transition">
                          <Copy size={13}/>
                        </button>
                        <button onClick={() => exportTemplate(tpl)} title="Export as .json"
                          className="p-1.5 rounded-lg hover:bg-[var(--accent-dim)] text-[var(--text3)] hover:text-[var(--accent)] transition">
                          <Download size={13}/>
                        </button>
                        <button onClick={() => { deleteTemplate(tpl.id); refresh(); }} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-[var(--text3)] hover:text-red-400 transition">
                          <Trash2 size={13}/>
                        </button>
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
