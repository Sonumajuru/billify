import { SavedDoc, SavedTemplate, AppMode } from "../types";

const DOCS_KEY      = "doccraft_docs";
const TEMPLATES_KEY = "doccraft_templates";
const DRAFT_KEY     = (mode: AppMode) => `doccraft_draft_${mode}`;

// ── DOCUMENTS (save & resume) ──────────────────────────────────────
export const getDocs = (): SavedDoc[] => {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || "[]"); } catch { return []; }
};

export const saveDoc = (doc: SavedDoc): void => {
  const docs = getDocs().filter(d => d.id !== doc.id);
  localStorage.setItem(DOCS_KEY, JSON.stringify([doc, ...docs].slice(0, 50)));
};

export const deleteDoc = (id: string): void => {
  localStorage.setItem(DOCS_KEY, JSON.stringify(getDocs().filter(d => d.id !== id)));
};

// ── TEMPLATES ──────────────────────────────────────────────────────
export const getTemplates = (): SavedTemplate[] => {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]"); } catch { return []; }
};

export const saveTemplate = (tpl: SavedTemplate): void => {
  const tpls = getTemplates().filter(t => t.id !== tpl.id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify([tpl, ...tpls].slice(0, 20)));
};

export const deleteTemplate = (id: string): void => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(getTemplates().filter(t => t.id !== id)));
};

// Export template as downloadable JSON file
export const exportTemplate = (tpl: SavedTemplate): void => {
  const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `template-${tpl.name.replace(/\s+/g,"-")}.json`;
  a.click(); URL.revokeObjectURL(url);
};

// Import template from JSON file
export const importTemplate = (file: File): Promise<SavedTemplate> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = e => {
      try {
        const tpl = JSON.parse(e.target?.result as string) as SavedTemplate;
        if (!tpl.id || !tpl.mode || !tpl.name) throw new Error("Invalid template file");
        tpl.id = Date.now().toString(); // new ID on import to avoid collision
        saveTemplate(tpl);
        resolve(tpl);
      } catch { reject(new Error("Invalid template file")); }
    };
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsText(file);
  });

// ── DRAFT (auto-save) ──────────────────────────────────────────────
export const saveDraft = (mode: AppMode, data: unknown): void => {
  try { localStorage.setItem(DRAFT_KEY(mode), JSON.stringify({ data, savedAt: new Date().toISOString() })); } catch {}
};

export const loadDraft = (mode: AppMode): { data: unknown; savedAt: string } | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(mode));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearDraft = (mode: AppMode): void => {
  localStorage.removeItem(DRAFT_KEY(mode));
};
