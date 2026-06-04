"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download, Printer, RefreshCw, Palette, FileText, Eye, EyeOff,
  Monitor, Home, BookOpen, Save, ChevronDown, Check,
} from "lucide-react";
import InvoiceForm    from "./invoice/components/FormPanel";
import InvoiceDesign  from "./invoice/components/DesignPanel";
import InvoicePreview from "./invoice/components/ReceiptPreview";
import TenancyForm    from "./tenancy/components/FormPanel";
import TenancyDesign  from "./tenancy/components/DesignPanel";
import TenancyPreview from "./tenancy/components/ReceiptPreview";
import SavedPanel     from "./components/SavedPanel";
import { ITReceiptData, TenancyData, AppMode, SavedDoc, SavedTemplate } from "./types";

import { saveDraft as storeAutosave } from "./utils/storage";
import { calcDueDate } from "./utils/calc";

// ── DEFAULTS ──────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

const DEFAULT_INVOICE: ITReceiptData = {
  logo:"", providerName:"", providerTitle:"IT Consultant", providerCompany:"",
  providerAddress:"", providerPostcode:"", providerCity:"",
  providerPhone:"", providerEmail:"", providerWebsite:"",
  kvkNumber:"", btwNumber:"", iban:"", bic:"", bankName:"",
  docType:"invoice", docNumber:"2024-001", issueDate:today,
  dueDate:calcDueDate(today,"30"), docStatus:"Draft",
  currencySymbol:"€", poNumber:"", referenceNumber:"", vatScheme:"standard",
  clientName:"", clientCompany:"", clientEmail:"", clientPhone:"",
  clientAddress:"", clientPostcode:"", clientCity:"", clientKvk:"", clientBtw:"", clientCountry:"Netherlands",
  projectName:"", projectDescription:"", techStack:"", periodFrom:"", periodTo:"",
  items:[{ id:"1", description:"", category:"Software Development", quantity:"8", unit:"hour", rate:"", rateType:"per_hour", vatRate:21 }],
  discount:"", discountType:"percent",
  paymentTermDays:"30", paymentMethod:"Bank Transfer", paymentNotes:"",
  notes:"", terms:"", footer:"", showSignature:false, showWatermark:false, watermarkText:"PAID",
  templateId:"terminal", accentColor:"#f59e0b", bgColor:"#0d1117", textColor:"#e6edf3",
};

const DEFAULT_TENANCY: TenancyData = {
  logo:"", landlordName:"", landlordCompany:"", landlordAddress:"", landlordPhone:"", landlordEmail:"",
  receiptNumber:"RR-001", issueDate:today, paymentDate:today, paymentStatus:"Paid",
  paymentMethod:"Bank Transfer", currencySymbol:"€",
  tenantName:"", tenantEmail:"", tenantPhone:"",
  propertyAddress:"", propertyUnit:"", propertyType:"Apartment", periodFrom:"", periodTo:"",
  rentAmount:"", lateFee:"", parkingFee:"",
  utilitiesAmount:"", utilitiesLabel:"Utilities",
  maintenanceFee:"", maintenanceLabel:"Maintenance",
  depositAmount:"", otherFee:"", otherLabel:"Other", discount:"",
  notes:"", terms:"", footer:"This is an official tenancy receipt. Please retain for your records.",
  showSignature:false, showWatermark:false, watermarkText:"PAID",
  templateId:"executive", accentColor:"#c9a84c", bgColor:"#0f1c2e", textColor:"#e8dfc8",
};

type SideTab = "content" | "design" | "saved";

export default function HomePage() {
  const [mode,           setMode]           = useState<AppMode>("invoice");
  const [invoiceData,    setInvoiceData]    = useState<ITReceiptData>(DEFAULT_INVOICE);
  const [tenancyData,    setTenancyData]    = useState<TenancyData>(DEFAULT_TENANCY);
  const [tab,            setTab]            = useState<SideTab>("content");
  const [showPreview,    setShowPreview]    = useState(true);
  const [modeMenuOpen,   setModeMenuOpen]   = useState(false);
  const [autoSavedAt,    setAutoSavedAt]    = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const autoRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const currentData = mode === "invoice" ? invoiceData : tenancyData;

  // Auto-save draft every 45 seconds
  useEffect(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      storeAutosave(mode, currentData);
      setAutoSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 45000);
    return () => clearInterval(autoRef.current);
  }, [mode, currentData]);

  // Immediate auto-save on data change (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      storeAutosave(mode, currentData);
    }, 3000);
    return () => clearTimeout(debounceRef.current);
  }, [mode, invoiceData, tenancyData]);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const el = document.getElementById("dl-btn");
    if (el) el.textContent = "Generating…";
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF       = (await import("jspdf")).default;
      const bg = mode === "invoice" ? (invoiceData.bgColor || "#08101f") : (tenancyData.bgColor || "#fff");
      const canvas = await html2canvas(previewRef.current, { scale: 2.5, useCORS: true, backgroundColor: bg });
      const w = canvas.width / 2.5, h = canvas.height / 2.5;
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [w, h] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      const num = mode === "invoice" ? invoiceData.docNumber : tenancyData.receiptNumber;
      pdf.save(`${mode}-${num || "001"}.pdf`);
    } finally {
      if (el) el.textContent = "Download PDF";
    }
  };

  const handleReset = () => {
    if (!confirm(`Reset all ${mode === "invoice" ? "invoice" : "tenancy receipt"} fields?`)) return;
    if (mode === "invoice") setInvoiceData({ ...DEFAULT_INVOICE, issueDate: today, dueDate: calcDueDate(today,"30") });
    else setTenancyData({ ...DEFAULT_TENANCY, issueDate: today, paymentDate: today });
  };

  const handleLoadDoc = (doc: SavedDoc) => {
    if (doc.mode === "invoice") { setInvoiceData(doc.data as ITReceiptData); setMode("invoice"); }
    else                        { setTenancyData(doc.data as TenancyData);   setMode("tenancy"); }
    setTab("content");
  };

  const handleApplyTemplate = (tpl: SavedTemplate) => {
    if (tpl.mode === "invoice") {
      setInvoiceData(prev => ({ ...prev, ...(tpl.template as Partial<ITReceiptData>) }));
    } else {
      setTenancyData(prev => ({ ...prev, ...(tpl.template as Partial<TenancyData>) }));
    }
  };

  const handleNewDoc = () => {
    if (mode === "invoice") setInvoiceData({ ...DEFAULT_INVOICE, issueDate: today, dueDate: calcDueDate(today,"30") });
    else setTenancyData({ ...DEFAULT_TENANCY, issueDate: today, paymentDate: today });
    setTab("content");
  };

  const b: React.CSSProperties = {
    display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10,
    fontSize:13, fontWeight:500, cursor:"pointer", border:"1px solid var(--border2)",
    background:"var(--surface)", color:"var(--text2)", fontFamily:"inherit", transition:"all .15s",
  };

  const MODES: { id: AppMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id:"invoice", label:"IT Invoice / Quote",     icon:<Monitor size={14}/>,  color:"var(--accent)" },
    { id:"tenancy", label:"Tenancy Receipt",         icon:<Home size={14}/>,     color:"var(--green)" },
  ];
  const activeMode = MODES.find(m => m.id === mode)!;

  const SIDE_TABS: { id: SideTab; icon: React.ReactNode; label: string }[] = [
    { id:"content", icon:<FileText size={14}/>, label:"Content" },
    { id:"design",  icon:<Palette size={14}/>,  label:"Templates" },
    { id:"saved",   icon:<BookOpen size={14}/>, label:"Saved" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--app)", display:"flex", flexDirection:"column" }}>

      {/* ── TOPBAR ── */}
      <header className="no-print" style={{ background:"linear-gradient(135deg, #1a2744 0%, #1e2f52 60%, #1f2a50 100%)", borderBottom:"1px solid var(--border2)", position:"sticky", top:0, zIndex:100, height:56, display:"flex", alignItems:"center", padding:"0 16px", justifyContent:"space-between", gap:12, boxShadow:"0 1px 0 rgba(99,102,241,0.15), 0 4px 20px rgba(0,0,0,0.3)" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, var(--accent), var(--purple))", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FileText size={16} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:17, color:"var(--text)", letterSpacing:-0.5, fontFamily:"'JetBrains Mono', monospace" }}>
            Bill<span style={{ color:"var(--accent)" }}>ify</span>
          </span>
        </div>

        {/* Mode switcher */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setModeMenuOpen(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:12, border:"1px solid var(--border2)", background:"var(--surface2)", cursor:"pointer", fontFamily:"inherit" }}>
            <span style={{ color: activeMode.color }}>{activeMode.icon}</span>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{activeMode.label}</span>
            <ChevronDown size={13} color="var(--text3)" />
          </button>
          {modeMenuOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:12, overflow:"hidden", minWidth:220, zIndex:200, boxShadow:"0 12px 40px rgba(0,0,0,0.5)" }}
              onBlur={() => setModeMenuOpen(false)}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setModeMenuOpen(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background .1s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="var(--surface2)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <span style={{ color: m.color }}>{m.icon}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:"var(--text)", flex:1 }}>{m.label}</span>
                  {mode === m.id && <Check size={13} color="var(--accent)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto-save indicator */}
        {autoSavedAt && (
          <div style={{ fontSize:11, color:"var(--text3)", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
            Autosaved {autoSavedAt}
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* Actions */}
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button style={b} onClick={() => setShowPreview(v=>!v)}>
            {showPreview ? <EyeOff size={14}/> : <Eye size={14}/>}
            <span className="hidden sm:inline">{showPreview?"Hide":"Show"} Preview</span>
          </button>
          <button style={b} onClick={handleReset}><RefreshCw size={14}/></button>
          <button style={b} onClick={() => window.print()}><Printer size={14}/></button>
          <button id="dl-btn" onClick={handleDownload}
            style={{ ...b, background:"var(--accent)", border:"none", color:"#1a0800", fontWeight:700, padding:"7px 18px" }}>
            <Download size={14}/> Download PDF
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"flex", maxWidth:1600, margin:"0 auto", width:"100%" }}>

        {/* ── SIDEBAR ── */}
        <aside className="no-print" style={{ width:380, flexShrink:0, borderRight:"1px solid var(--border2)", background:"linear-gradient(180deg, var(--panel) 0%, #1c2b50 100%)", height:"calc(100vh - 56px)", position:"sticky", top:56, display:"flex", flexDirection:"column" }}>

          {/* Mode badge */}
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border2)", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color: activeMode.color }}>{activeMode.icon}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{activeMode.label}</span>
            <div style={{ flex:1 }} />
            {autoSavedAt && <span style={{ fontSize:10, color:"var(--text3)" }}>Saved {autoSavedAt}</span>}
          </div>

          {/* Tab switcher */}
          <div style={{ display:"flex", borderBottom:"1px solid var(--border2)", background:"rgba(0,0,0,0.15)" }}>
            {SIDE_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"11px 0", fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background: tab===t.id?"var(--surface)":"transparent", color: tab===t.id?"var(--text)":"var(--text2)", borderBottom: tab===t.id?"2px solid var(--accent)":"2px solid transparent", transition:"all .15s", fontFamily:"inherit" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {tab === "saved" ? (
              <SavedPanel
                mode={mode}
                currentData={currentData}
                onLoadDoc={handleLoadDoc}
                onApplyTemplate={handleApplyTemplate}
                onNewDoc={handleNewDoc}
              />
            ) : (
              <div style={{ padding:"18px 16px 60px" }}>
                {mode === "invoice" ? (
                  tab === "content"
                    ? <InvoiceForm   data={invoiceData}  onChange={setInvoiceData} />
                    : <InvoiceDesign data={invoiceData}  onChange={setInvoiceData} />
                ) : (
                  tab === "content"
                    ? <TenancyForm   data={tenancyData}  onChange={setTenancyData} />
                    : <TenancyDesign data={tenancyData}  onChange={setTenancyData} />
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── PREVIEW ── */}
        {showPreview && (
          <main style={{ flex:1, padding:"24px 28px 60px", overflowY:"auto", background:"transparent" }}>
            <div className="no-print" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text3)", fontFamily:"'JetBrains Mono', monospace" }}>// live preview</span>
                <span style={{ fontSize:11, color: activeMode.color, background:"var(--surface)", padding:"2px 8px", borderRadius:20, border:"1px solid var(--border)", fontFamily:"'JetBrains Mono', monospace" }}>
                  {mode === "invoice" ? invoiceData.templateId : tenancyData.templateId}
                </span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {mode === "invoice" && (
                  <>
                    <span style={{ fontSize:11, color:"var(--text3)", background:"var(--surface)", padding:"2px 8px", borderRadius:20, border:"1px solid var(--border)" }}>
                      {invoiceData.docType}
                    </span>
                    <span style={{ fontSize:11, color:"var(--accent)", background:"var(--accent-dim)", padding:"2px 8px", borderRadius:20, border:"1px solid var(--accent)", fontFamily:"'JetBrains Mono', monospace" }}>
                      {invoiceData.vatScheme.replace("_"," ")}
                    </span>
                  </>
                )}
                {mode === "tenancy" && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: tenancyData.paymentStatus==="Paid"?"var(--green-dim)":"var(--surface)", color: tenancyData.paymentStatus==="Paid"?"var(--green)":"var(--text3)", border:"1px solid var(--border)" }}>
                    {tenancyData.paymentStatus}
                  </span>
                )}
              </div>
            </div>

            <div style={{ filter:"drop-shadow(0 20px 60px rgba(0,0,0,0.4))" }}>
              {mode === "invoice"
                ? <InvoicePreview data={invoiceData} previewRef={previewRef} />
                : <TenancyPreview data={tenancyData} previewRef={previewRef} />
              }
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
