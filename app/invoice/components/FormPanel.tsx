"use client";
import { useState, useRef } from "react";
import { Upload, X, ImagePlus, Plus, Trash2, ChevronDown } from "lucide-react";
import { ITReceiptData, LineItem, RateType, VatRate } from "../../types";
import { calcDueDate, lineExcl } from "../../utils/calc";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: ITReceiptData;
  onChange: (d: ITReceiptData) => void;
  lang: Lang;
}

const IT_CATEGORIES = [
  "Software Development","Web Development","Mobile Apps","DevOps / Cloud",
  "Cybersecurity","IT Consulting","System Administration","Network Management",
  "Data Analytics / BI","AI / Machine Learning","UI/UX Design","IT Project Management",
  "Helpdesk / Support","Training / Education","Software Licenses","Hardware",
  "Hosting / Domain","Testing / QA","Technical Documentation","Other IT",
];

const UNITS = ["hour","day","unit","license","month","year","project","GB","user"];

const VAT_OPTIONS: { value: VatRate; label: string }[] = [
  { value:21, label:"21%" },
  { value:9,  label:"9%"  },
  { value:0,  label:"0%"  },
];

const RATE_TYPES: { value: RateType; label: string }[] = [
  { value:"fixed",     label:"Fixed"    },
  { value:"per_hour",  label:"/ hour"   },
  { value:"per_day",   label:"/ day"    },
  { value:"per_month", label:"/ month"  },
  { value:"milestone", label:"Milestone"},
];

const PAYMENT_METHODS = ["Bank Transfer","iDEAL","SEPA Transfer","Credit Card","PayPal","Stripe","Cash","Other"];

// ── Accordion Section ─────────────────────────────────────────────
function Section({ title, children, defaultOpen = true, accent = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; accent?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius:12, border:"1px solid var(--border)", overflow:"hidden", marginBottom:8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--surface2)", border:"none", cursor:"pointer", fontFamily:"inherit" }}
      >
        <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--accent)" }}>{title}</span>
        <ChevronDown size={14} color="var(--text3)" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .2s" }} />
      </button>
      {open && (
        <div className="section-open" style={{ padding:"12px 14px", background:"var(--panel)", display:"flex", flexDirection:"column", gap:10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Advanced toggle ───────────────────────────────────────────────
function AdvRow({ show, onToggle, tr }: { show: boolean; onToggle: () => void; tr: Tr }) {
  return (
    <button onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text3)", cursor:"pointer", background:"none", border:"none", fontFamily:"inherit", padding:"2px 0" }}>
      <ChevronDown size={11} style={{ transform: show ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .18s" }} />
      {show ? tr.hideAdvanced : tr.advanced}
    </button>
  );
}

// ── Field helpers ─────────────────────────────────────────────────
const inp = "w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] transition font-[inherit]";
const lbl = (t: string) => <label style={{ display:"block", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", marginBottom:4 }}>{t}</label>;
const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 } as const;

export default function FormPanel({ data, onChange, lang }: Props) {
  const tr = T[lang];
  const logoRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof ITReceiptData, v: unknown) => onChange({ ...data, [k]: v });

  const [advInfo,   setAdvInfo]   = useState(false);
  const [advDoc,    setAdvDoc]    = useState(false);
  const [advClient, setAdvClient] = useState(false);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("logo", ev.target?.result as string); r.readAsDataURL(file);
  };

  const updateItem = (i: number, k: keyof LineItem, v: string | number) => {
    const items = [...data.items]; items[i] = { ...items[i], [k]: v }; onChange({ ...data, items });
  };

  const addItem = () => onChange({
    ...data,
    items: [...data.items, { id: Date.now().toString(), description:"", category:"Software Development", quantity:"1", unit:"hour", rate:"", rateType:"per_hour", vatRate:21 }],
  });

  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  const handleTermChange = (days: string) =>
    onChange({ ...data, paymentTermDays: days, dueDate: calcDueDate(data.issueDate, days) });

  const handleIssueDateChange = (d: string) =>
    onChange({ ...data, issueDate: d, dueDate: calcDueDate(d, data.paymentTermDays || "30") });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── YOUR INFO ── */}
      <Section title={tr.yourInfo} defaultOpen accent>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />

        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.fullName)}
            <input className={inp} value={data.providerName} onChange={e=>set("providerName",e.target.value)} placeholder="Jan de Vries" />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.providerEmail} onChange={e=>set("providerEmail",e.target.value)} placeholder="jan@itbedrijf.nl" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.providerPhone} onChange={e=>set("providerPhone",e.target.value)} placeholder="+31 6 12345678" />
          </div>
        </div>

        <AdvRow show={advInfo} onToggle={() => setAdvInfo(v=>!v)} tr={tr} />

        {advInfo && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="section-open">
            {/* Logo */}
            <div>
              {lbl(tr.logo)}
              {data.logo ? (
                <div style={{ position:"relative", display:"inline-flex" }} className="group">
                  <img src={data.logo} alt="" style={{ height:48, objectFit:"contain", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", padding:6 }} />
                  <button onClick={()=>set("logo","")} style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:"#ef4444", color:"#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={10}/></button>
                  <button onClick={()=>logoRef.current?.click()} style={{ position:"absolute", bottom:-6, right:-6, width:22, height:22, borderRadius:"50%", background:"var(--accent)", color:"#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ImagePlus size={10}/></button>
                </div>
              ) : (
                <button onClick={()=>logoRef.current?.click()} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px", border:"2px dashed var(--border2)", borderRadius:10, background:"var(--surface)", cursor:"pointer", transition:"border-color .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border2)"}>
                  <Upload size={16} color="var(--text3)" />
                  <span style={{ fontSize:11, color:"var(--text3)" }}>{tr.uploadLogo}</span>
                </button>
              )}
            </div>

            <div style={g2}>
              <div>
                {lbl(tr.jobTitle)}
                <input className={inp} value={data.providerTitle} onChange={e=>set("providerTitle",e.target.value)} placeholder="IT Consultant" />
              </div>
              <div>
                {lbl(tr.company)}
                <input className={inp} value={data.providerCompany} onChange={e=>set("providerCompany",e.target.value)} placeholder="Jan de Vries IT B.V." />
              </div>
              <div className="col-span-2">
                {lbl(tr.address)}
                <input className={inp} value={data.providerAddress} onChange={e=>set("providerAddress",e.target.value)} placeholder="Keizersgracht 123" />
              </div>
              <div>
                {lbl(tr.postcode)}
                <input className={inp} value={data.providerPostcode} onChange={e=>set("providerPostcode",e.target.value)} placeholder="1234 AB" />
              </div>
              <div>
                {lbl(tr.city)}
                <input className={inp} value={data.providerCity} onChange={e=>set("providerCity",e.target.value)} placeholder="Amsterdam" />
              </div>
              <div className="col-span-2">
                {lbl(tr.website)}
                <input className={inp} value={data.providerWebsite} onChange={e=>set("providerWebsite",e.target.value)} placeholder="www.jandevriesit.nl" />
              </div>
            </div>

            {/* Dutch business details */}
            <div style={{ padding:"10px 12px", background:"var(--surface2)", borderRadius:10, border:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--accent)" }}>{tr.dutchBusiness}</span>
              <div style={g2}>
                <div>
                  {lbl(tr.kvk)}
                  <input className={inp} value={data.kvkNumber} onChange={e=>set("kvkNumber",e.target.value)} placeholder="12345678" maxLength={8} />
                </div>
                <div>
                  {lbl(tr.btw)}
                  <input className={inp} value={data.btwNumber} onChange={e=>set("btwNumber",e.target.value)} placeholder="NL123456789B01" />
                </div>
              </div>
            </div>

            {/* Bank details */}
            <div style={{ padding:"10px 12px", background:"var(--surface2)", borderRadius:10, border:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--accent)" }}>{tr.bankDetails}</span>
              <div style={g2}>
                <div className="col-span-2">
                  {lbl(tr.iban)}
                  <input className={inp} value={data.iban} onChange={e=>set("iban",e.target.value.toUpperCase())} placeholder="NL12 ABNA 0123 4567 89" />
                </div>
                <div>
                  {lbl(tr.bic)}
                  <input className={inp} value={data.bic} onChange={e=>set("bic",e.target.value.toUpperCase())} placeholder="ABNANL2A" />
                </div>
                <div>
                  {lbl(tr.bankName)}
                  <input className={inp} value={data.bankName} onChange={e=>set("bankName",e.target.value)} placeholder="ABN AMRO" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── DOCUMENT ── */}
      <Section title={tr.documentSection} defaultOpen={false} accent>
        <div style={g2}>
          <div>
            {lbl(tr.docType)}
            <select className={inp} value={data.docType} onChange={e=>set("docType",e.target.value as ITReceiptData["docType"])}>
              <option value="invoice">{tr.docInvoice}</option>
              <option value="quote">{tr.docQuote}</option>
              <option value="proforma">{tr.docProforma}</option>
              <option value="credit_note">{tr.docCredit}</option>
              <option value="receipt">{tr.docReceipt}</option>
            </select>
          </div>
          <div>
            {lbl(tr.invoiceNumber)}
            <input className={inp} value={data.docNumber} onChange={e=>set("docNumber",e.target.value)} placeholder="2024-001" />
          </div>
          <div>
            {lbl(tr.issueDate)}
            <input className={inp} type="date" value={data.issueDate} onChange={e=>handleIssueDateChange(e.target.value)} />
          </div>
          <div>
            {lbl(tr.dueDate)}
            <input className={inp} type="date" value={data.dueDate} onChange={e=>set("dueDate",e.target.value)} />
          </div>
          <div>
            {lbl(tr.currency)}
            <select className={inp} value={data.currencySymbol} onChange={e=>set("currencySymbol",e.target.value)}>
              <option value="€">EUR (€)</option>
              <option value="$">USD ($)</option>
              <option value="£">GBP (£)</option>
            </select>
          </div>
          <div>
            {lbl(tr.paymentTerms)}
            <select className={inp} value={data.paymentTermDays} onChange={e=>handleTermChange(e.target.value)}>
              {["7","14","21","30","45","60","90"].map(d=><option key={d} value={d}>{d} {tr.days}</option>)}
            </select>
          </div>
        </div>

        <AdvRow show={advDoc} onToggle={() => setAdvDoc(v=>!v)} tr={tr} />

        {advDoc && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="section-open">
            <div style={g2}>
              <div>
                {lbl(tr.status)}
                <select className={inp} value={data.docStatus} onChange={e=>set("docStatus",e.target.value as ITReceiptData["docStatus"])}>
                  {["Draft","Sent","Paid","Overdue","Cancelled","In Progress"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                {lbl(tr.poNumber)}
                <input className={inp} value={data.poNumber} onChange={e=>set("poNumber",e.target.value)} placeholder="PO-12345" />
              </div>
              <div className="col-span-2">
                {lbl(tr.clientReference)}
                <input className={inp} value={data.referenceNumber} onChange={e=>set("referenceNumber",e.target.value)} placeholder="Client reference" />
              </div>
            </div>

            {/* VAT Scheme */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", marginBottom:8 }}>{tr.vatSchemeSection}</label>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { v:"standard",       l:tr.vatStandard,   d:tr.vatStandardDesc },
                  { v:"reverse_charge", l:tr.vatReverse,    d:tr.vatReverseDesc  },
                  { v:"exempt",         l:tr.vatExempt,     d:tr.vatExemptDesc   },
                  { v:"eu_vat",         l:tr.vatEu,         d:tr.vatEuDesc       },
                ].map(opt => (
                  <label key={opt.v} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 10px", borderRadius:10, border:`1px solid ${data.vatScheme===opt.v ? "var(--accent)" : "var(--border)"}`, background: data.vatScheme===opt.v ? "var(--accent-dim)" : "var(--surface)", cursor:"pointer", transition:"border-color .15s" }}>
                    <input type="radio" name="vatScheme" value={opt.v} checked={data.vatScheme===opt.v} onChange={e=>set("vatScheme",e.target.value as ITReceiptData["vatScheme"])} style={{ marginTop:2, accentColor:"var(--accent)" }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{opt.l}</div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{opt.d}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── CLIENT ── */}
      <Section title={tr.clientSection} defaultOpen={false} accent>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.contactName)}
            <input className={inp} value={data.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Piet Janssen" />
          </div>
          <div className="col-span-2">
            {lbl(tr.clientCompany)}
            <input className={inp} value={data.clientCompany} onChange={e=>set("clientCompany",e.target.value)} placeholder="Client B.V." />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.clientEmail} onChange={e=>set("clientEmail",e.target.value)} placeholder="piet@client.nl" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="+31 20 1234567" />
          </div>
        </div>

        <AdvRow show={advClient} onToggle={() => setAdvClient(v=>!v)} tr={tr} />

        {advClient && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="section-open">
            <div style={g2}>
              <div className="col-span-2">
                {lbl(tr.address)}
                <input className={inp} value={data.clientAddress} onChange={e=>set("clientAddress",e.target.value)} placeholder="Herengracht 456" />
              </div>
              <div>
                {lbl(tr.postcode)}
                <input className={inp} value={data.clientPostcode} onChange={e=>set("clientPostcode",e.target.value)} placeholder="1017 BX" />
              </div>
              <div>
                {lbl(tr.city)}
                <input className={inp} value={data.clientCity} onChange={e=>set("clientCity",e.target.value)} placeholder="Amsterdam" />
              </div>
              <div>
                {lbl(tr.country)}
                <select className={inp} value={data.clientCountry} onChange={e=>set("clientCountry",e.target.value)}>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                {lbl(tr.clientKvk)}
                <input className={inp} value={data.clientKvk} onChange={e=>set("clientKvk",e.target.value)} placeholder="87654321" />
              </div>
              <div className="col-span-2">
                {lbl(tr.clientVat)}
                <input className={inp} value={data.clientBtw} onChange={e=>set("clientBtw",e.target.value)} placeholder="NL987654321B01" />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── PROJECT (collapsible, default closed) ── */}
      <Section title={tr.projectSection} defaultOpen={false}>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.projectName)}
            <input className={inp} value={data.projectName} onChange={e=>set("projectName",e.target.value)} placeholder="Website Redesign Phase 2" />
          </div>
          <div className="col-span-2">
            {lbl(tr.techStack)}
            <input className={inp} value={data.techStack} onChange={e=>set("techStack",e.target.value)} placeholder="React, Azure, .NET..." />
          </div>
          <div>
            {lbl(tr.periodFrom)}
            <input className={inp} type="date" value={data.periodFrom} onChange={e=>set("periodFrom",e.target.value)} />
          </div>
          <div>
            {lbl(tr.periodTo)}
            <input className={inp} type="date" value={data.periodTo} onChange={e=>set("periodTo",e.target.value)} />
          </div>
          <div className="col-span-2">
            {lbl(tr.projectDesc)}
            <textarea className={`${inp} resize-none`} style={{ height:64 }} value={data.projectDescription} onChange={e=>set("projectDescription",e.target.value)} placeholder="Brief description..." />
          </div>
        </div>
      </Section>

      {/* ── LINE ITEMS ── */}
      <Section title={tr.itemsSection} defaultOpen={false} accent>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {data.items.map((item, idx) => {
            const total = lineExcl(item);
            return (
              <div key={item.id} style={{ padding:"10px", background:"var(--surface2)", borderRadius:10, border:"1px solid var(--border)", position:"relative" }}>
                <button onClick={()=>removeItem(idx)} style={{ position:"absolute", top:8, right:8, background:"none", border:"none", cursor:"pointer", color:"var(--text3)", padding:2 }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#ef4444")}
                  onMouseLeave={e=>(e.currentTarget.style.color="var(--text3)")}>
                  <Trash2 size={13}/>
                </button>
                <input className={inp} style={{ marginBottom:6 }} value={item.description} onChange={e=>updateItem(idx,"description",e.target.value)} placeholder="Description of work..." />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>
                  <select className={inp} value={item.category} onChange={e=>updateItem(idx,"category",e.target.value)}>
                    {IT_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <select className={inp} value={item.rateType} onChange={e=>updateItem(idx,"rateType",e.target.value as RateType)}>
                    {RATE_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.2fr 0.8fr", gap:6 }}>
                  <div>
                    <label style={{ fontSize:10, color:"var(--text3)", display:"block", marginBottom:2 }}>{tr.qty}</label>
                    <input className={inp} value={item.quantity} onChange={e=>updateItem(idx,"quantity",e.target.value)} placeholder="1" type="number" min="0" step="0.5" />
                  </div>
                  <div>
                    <label style={{ fontSize:10, color:"var(--text3)", display:"block", marginBottom:2 }}>{tr.unit}</label>
                    <select className={inp} value={item.unit} onChange={e=>updateItem(idx,"unit",e.target.value)}>
                      {UNITS.map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:10, color:"var(--text3)", display:"block", marginBottom:2 }}>{tr.rate} ({data.currencySymbol})</label>
                    <input className={inp} value={item.rate} onChange={e=>updateItem(idx,"rate",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={{ fontSize:10, color:"var(--text3)", display:"block", marginBottom:2 }}>{tr.vatPct}</label>
                    <select className={inp} value={item.vatRate} onChange={e=>updateItem(idx,"vatRate",parseInt(e.target.value) as VatRate)}>
                      {VAT_OPTIONS.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                {total > 0 && (
                  <div style={{ display:"flex", justifyContent:"flex-end", fontSize:11, marginTop:6, paddingTop:6, borderTop:"1px solid var(--border)", color:"var(--text3)" }}>
                    {data.currencySymbol}{total.toFixed(2)} excl.
                    {data.vatScheme === "standard" && item.vatRate > 0 && (
                      <span style={{ marginLeft:8, color:"var(--accent)" }}>+ {data.currencySymbol}{(total * item.vatRate / 100).toFixed(2)} VAT</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={addItem} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"var(--accent)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:"4px 0" }}>
          <Plus size={14}/> {tr.addItem}
        </button>
      </Section>

      {/* ── PAYMENT ── */}
      <Section title={tr.paymentSection} defaultOpen={false} accent>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.paymentMethod)}
            <select className={inp} value={data.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Discount inline */}
        <div style={{ padding:"10px 12px", background:"var(--surface2)", borderRadius:10, border:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text3)" }}>{tr.discountAmount}</span>
          <div style={g2}>
            <div>
              <input className={inp} value={data.discount} onChange={e=>set("discount",e.target.value)} placeholder="0" type="number" min="0" step="0.01" />
            </div>
            <div>
              <select className={inp} value={data.discountType} onChange={e=>set("discountType",e.target.value as ITReceiptData["discountType"])}>
                <option value="percent">{tr.discountPct}</option>
                <option value="fixed">{tr.discountFixed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment instructions */}
        <div>
          {lbl(tr.paymentInstructions)}
          <textarea className={`${inp} resize-none`} style={{ height:56 }} value={data.paymentNotes} onChange={e=>set("paymentNotes",e.target.value)} placeholder="Please transfer within 30 days quoting invoice number..." />
        </div>

        {/* Footer line */}
        <div>
          {lbl("Footer")}
          <input className={inp} value={data.footer} onChange={e=>set("footer",e.target.value)} placeholder={`${data.providerCompany || data.providerName} · KvK ${data.kvkNumber || "12345678"}`} />
        </div>

        {/* Signature toggle */}
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div onClick={()=>set("showSignature",!data.showSignature)} style={{ width:38, height:20, borderRadius:10, background: data.showSignature ? "var(--accent)" : "var(--border2)", position:"relative", transition:"background .2s", cursor:"pointer", flexShrink:0 }}>
            <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left: data.showSignature ? 20 : 2, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize:13, color:"var(--text2)" }}>{tr.signatureLines}</span>
        </label>
      </Section>

    </div>
  );
}
