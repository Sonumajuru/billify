"use client";
import { useState, useRef, useEffect } from "react";
import {
  Download, Printer, RefreshCw, Palette, FileText, Eye, EyeOff,
  Monitor, Home, BookOpen, ChevronDown, Check, Globe,
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
import { Lang, T } from "./i18n";
import { trackDownload } from "./utils/stats";
import { track } from "@vercel/analytics";

const today = new Date().toISOString().split("T")[0];

const DEFAULT_INVOICE: ITReceiptData = {
  logo:"", providerName:"", providerTitle:"Consultant", providerCompany:"",
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
type MobileView = "form" | "preview";

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "en", label: "EN", flag: "🇬🇧" },
  { id: "fr", label: "FR", flag: "🇫🇷" },
  { id: "nl", label: "NL", flag: "🇳🇱" },
];

export default function HomePage() {
  const [mode,         setMode]         = useState<AppMode>("invoice");
  const [invoiceData,  setInvoiceData]  = useState<ITReceiptData>(DEFAULT_INVOICE);
  const [tenancyData,  setTenancyData]  = useState<TenancyData>(DEFAULT_TENANCY);
  const [tab,          setTab]          = useState<SideTab>("content");
  const [showPreview,  setShowPreview]  = useState(true);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [lang,         setLang]         = useState<Lang>("en");
  const [mobileView,   setMobileView]   = useState<MobileView>("form");
  const [autoSavedAt,  setAutoSavedAt]  = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const autoRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const tr = T[lang];
  const currentData = mode === "invoice" ? invoiceData : tenancyData;

  useEffect(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      storeAutosave(mode, currentData);
      setAutoSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 45000);
    return () => clearInterval(autoRef.current);
  }, [mode, currentData]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { storeAutosave(mode, currentData); }, 3000);
    return () => clearTimeout(debounceRef.current);
  }, [mode, invoiceData, tenancyData]);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const btn = document.getElementById("dl-btn");
    if (btn) btn.textContent = tr.generating;
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
      // track locally, in Vercel Analytics, and in global Redis store
      const docType = mode === "invoice" ? invoiceData.docType : "tenancy";
      trackDownload({ ts: Date.now(), mode, lang, docType });
      track("download", { mode, lang, docType });
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, lang, docType }),
      }).catch(() => { /* silent — never block the download */ });
    } finally {
      if (btn) btn.textContent = tr.downloadPdf;
    }
  };

  const handleReset = () => {
    if (!confirm(tr.resetConfirm)) return;
    if (mode === "invoice") setInvoiceData({ ...DEFAULT_INVOICE, issueDate: today, dueDate: calcDueDate(today,"30") });
    else setTenancyData({ ...DEFAULT_TENANCY, issueDate: today, paymentDate: today });
  };

  const handleLoadDoc = (doc: SavedDoc) => {
    if (doc.mode === "invoice") { setInvoiceData(doc.data as ITReceiptData); setMode("invoice"); }
    else                        { setTenancyData(doc.data as TenancyData);   setMode("tenancy"); }
    setTab("content");
  };

  const handleApplyTemplate = (tpl: SavedTemplate) => {
    if (tpl.mode === "invoice") setInvoiceData(prev => ({ ...prev, ...(tpl.template as Partial<ITReceiptData>) }));
    else                        setTenancyData(prev => ({ ...prev, ...(tpl.template as Partial<TenancyData>) }));
  };

  const handleNewDoc = () => {
    if (mode === "invoice") setInvoiceData({ ...DEFAULT_INVOICE, issueDate: today, dueDate: calcDueDate(today,"30") });
    else setTenancyData({ ...DEFAULT_TENANCY, issueDate: today, paymentDate: today });
    setTab("content");
  };

  const MODES: { id: AppMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id:"invoice", label: tr.invoiceMode, icon:<Monitor size={14}/>, color:"var(--accent)" },
    { id:"tenancy", label: tr.tenancyMode, icon:<Home size={14}/>,    color:"var(--green)" },
  ];
  const activeMode = MODES.find(m => m.id === mode)!;

  const SIDE_TABS: { id: SideTab; icon: React.ReactNode; label: string }[] = [
    { id:"content", icon:<FileText size={14}/>, label: tr.content },
    { id:"design",  icon:<Palette size={14}/>,  label: tr.templates },
    { id:"saved",   icon:<BookOpen size={14}/>, label: tr.saved },
  ];

  const btnBase: React.CSSProperties = {
    display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10,
    fontSize:13, fontWeight:500, cursor:"pointer", border:"1px solid var(--border2)",
    background:"var(--panel)", color:"var(--text2)", fontFamily:"inherit", transition:"all .15s",
    boxShadow:"0 1px 2px rgba(0,0,0,0.06)",
  };

  const activeLang = LANGS.find(l => l.id === lang)!;

  return (
    <div style={{ minHeight:"100vh", background:"var(--app)", display:"flex", flexDirection:"column" }} className="main-body">

      {/* ── TOPBAR ── */}
      <header className="no-print" style={{
        background:"var(--panel)",
        borderBottom:"1px solid var(--border)",
        position:"sticky", top:0, zIndex:100,
        height:56,
        display:"flex", alignItems:"center", padding:"0 16px",
        justifyContent:"space-between", gap:8,
        boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
      }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <img src="/logo.svg" alt="Billify" style={{ width:30, height:30, borderRadius:8 }} />
          <span style={{ fontWeight:800, fontSize:16, color:"var(--text)", letterSpacing:-0.5, fontFamily:"'JetBrains Mono', monospace" }}>
            Bill<span style={{ color:"var(--accent)" }}>ify</span>
          </span>
        </div>

        {/* Mode switcher */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={() => { setModeMenuOpen(v=>!v); setLangMenuOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, border:"1px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 1px 2px rgba(0,0,0,0.06)" }}>
            <span style={{ color: activeMode.color }}>{activeMode.icon}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }} className="hidden sm:inline">{activeMode.label}</span>
            <ChevronDown size={12} color="var(--text3)" />
          </button>
          {modeMenuOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", minWidth:210, zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.14)" }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setModeMenuOpen(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
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

        {/* Autosave */}
        {autoSavedAt && (
          <div style={{ fontSize:11, color:"var(--text3)", display:"flex", alignItems:"center", gap:4, flexShrink:0 }} className="hidden sm:flex">
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
            {tr.autosaved} {autoSavedAt}
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* Language picker */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={() => { setLangMenuOpen(v=>!v); setModeMenuOpen(false); }}
            style={{ ...btnBase, gap:5, padding:"6px 10px" }}>
            <Globe size={13} />
            <span style={{ fontSize:12, fontWeight:600 }}>{activeLang.flag} {activeLang.label}</span>
            <ChevronDown size={11} color="var(--text3)" />
          </button>
          {langMenuOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", minWidth:110, zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.14)" }}>
              {LANGS.map(l => (
                <button key={l.id} onClick={() => { setLang(l.id); setLangMenuOpen(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 14px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="var(--surface2)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <span>{l.flag}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:"var(--text)", flex:1 }}>{l.label}</span>
                  {lang === l.id && <Check size={12} color="var(--accent)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <button style={btnBase} onClick={() => setShowPreview(v=>!v)} className="hidden md:flex">
            {showPreview ? <EyeOff size={14}/> : <Eye size={14}/>}
            <span className="hidden lg:inline" style={{ fontSize:12 }}>{showPreview ? tr.hidePreview : tr.showPreview}</span>
          </button>
          <button style={btnBase} onClick={handleReset} title={tr.reset}><RefreshCw size={14}/></button>
          <button style={btnBase} onClick={() => window.print()} className="hidden sm:flex"><Printer size={14}/></button>
          <button id="dl-btn" onClick={handleDownload}
            style={{ ...btnBase, background:"var(--accent)", border:"none", color:"#fff", fontWeight:700, padding:"7px 14px", boxShadow:"0 2px 8px rgba(245,158,11,0.35)" }}>
            <Download size={14}/> <span className="hidden sm:inline">{tr.downloadPdf}</span>
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"flex", maxWidth:1600, margin:"0 auto", width:"100%" }}>

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar no-print ${mobileView === "form" ? "flex" : "hidden"} md:flex`}
          style={{
            flexShrink:0,
            borderRight:"1px solid var(--border)",
            background:"var(--panel)",
            height:"calc(100vh - 56px)",
            position:"sticky",
            top:56,
            flexDirection:"column",
            boxShadow:"1px 0 0 var(--border)",
          }}>

          {/* Mode badge */}
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", background:"var(--surface2)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color: activeMode.color }}>{activeMode.icon}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{activeMode.label}</span>
            <div style={{ flex:1 }} />
            {autoSavedAt && <span style={{ fontSize:10, color:"var(--text3)" }}>{tr.autosaved} {autoSavedAt}</span>}
          </div>

          {/* Tab switcher */}
          <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--surface2)" }}>
            {SIDE_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"10px 0", fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background: tab===t.id?"var(--panel)":"transparent", color: tab===t.id?"var(--text)":"var(--text3)", borderBottom: tab===t.id?"2px solid var(--accent)":"2px solid transparent", transition:"all .15s", fontFamily:"inherit" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {tab === "saved" ? (
              <SavedPanel mode={mode} currentData={currentData} onLoadDoc={handleLoadDoc} onApplyTemplate={handleApplyTemplate} onNewDoc={handleNewDoc} />
            ) : (
              <div style={{ padding:"16px 14px 80px" }}>
                {mode === "invoice" ? (
                  tab === "content"
                    ? <InvoiceForm data={invoiceData} onChange={setInvoiceData} lang={lang} />
                    : <InvoiceDesign data={invoiceData} onChange={setInvoiceData} />
                ) : (
                  tab === "content"
                    ? <TenancyForm data={tenancyData} onChange={setTenancyData} lang={lang} />
                    : <TenancyDesign data={tenancyData} onChange={setTenancyData} />
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── PREVIEW ── */}
        {(showPreview || mobileView === "preview") && (
          <main className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex`}
            style={{ flex:1, padding:"20px 20px 60px", overflowY:"auto", background:"var(--app)", backgroundImage:"radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize:"22px 22px", flexDirection:"column" }}>

            <div className="no-print" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text3)", fontFamily:"'JetBrains Mono', monospace" }}>// live preview</span>
                <span style={{ fontSize:11, color: activeMode.color, background:"rgba(255,255,255,0.9)", padding:"2px 8px", borderRadius:20, border:"1px solid var(--border)", fontFamily:"'JetBrains Mono', monospace" }}>
                  {mode === "invoice" ? invoiceData.templateId : tenancyData.templateId}
                </span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {mode === "invoice" && (
                  <>
                    <span style={{ fontSize:11, color:"var(--text2)", background:"rgba(255,255,255,0.9)", padding:"2px 8px", borderRadius:20, border:"1px solid var(--border)" }}>{invoiceData.docType}</span>
                    <span style={{ fontSize:11, color:"var(--accent)", background:"rgba(245,158,11,0.1)", padding:"2px 8px", borderRadius:20, border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono', monospace" }}>{invoiceData.vatScheme.replace("_"," ")}</span>
                  </>
                )}
                {mode === "tenancy" && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: tenancyData.paymentStatus==="Paid"?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.9)", color: tenancyData.paymentStatus==="Paid"?"#059669":"var(--text2)", border: tenancyData.paymentStatus==="Paid"?"1px solid rgba(16,185,129,0.35)":"1px solid var(--border)" }}>
                    {tenancyData.paymentStatus}
                  </span>
                )}
              </div>
            </div>

            <div style={{ filter:"drop-shadow(0 8px 32px rgba(30,50,100,0.12))" }}>
              {mode === "invoice"
                ? <InvoicePreview data={invoiceData} previewRef={previewRef} lang={lang} />
                : <TenancyPreview data={tenancyData} previewRef={previewRef} lang={lang} />
              }
            </div>
          </main>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV (hidden on md+ via class, no inline display) ── */}
      <nav className="no-print flex md:hidden"
        style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--panel)", borderTop:"1px solid var(--border)", zIndex:100, boxShadow:"0 -2px 12px rgba(0,0,0,0.1)" }}>
        {([
          { view:"form" as MobileView, icon:<FileText size={20}/>, label: tr.form },
          { view:"preview" as MobileView, icon:<Eye size={20}/>, label: tr.preview },
        ]).map(item => (
          <button key={item.view} onClick={() => setMobileView(item.view)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 8px 8px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", color: mobileView===item.view ? "var(--accent)" : "var(--text3)", transition:"color .15s", fontSize:10, fontWeight:600 }}>
            {item.icon}
            {item.label}
          </button>
        ))}
        <button onClick={() => window.print()}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 8px 8px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", color:"var(--text3)", fontSize:10, fontWeight:600 }}>
          <Printer size={20} />
          Print
        </button>
        <button onClick={handleDownload}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 8px 8px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", color:"var(--accent)", fontSize:10, fontWeight:600 }}>
          <Download size={20} />
          PDF
        </button>
      </nav>
    </div>
  );
}
