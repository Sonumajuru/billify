"use client";
import { useState, useRef } from "react";
import { Upload, X, ImagePlus, ChevronDown } from "lucide-react";
import { TenancyData } from "../../types";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: TenancyData;
  onChange: (d: TenancyData) => void;
  lang: Lang;
}

const CURRENCIES = [
  { s:"€",   l:"EUR — Euro"              },
  { s:"$",   l:"USD — US Dollar"         },
  { s:"£",   l:"GBP — British Pound"     },
  { s:"R",   l:"ZAR — South African Rand"},
  { s:"₦",   l:"NGN — Nigerian Naira"    },
  { s:"₹",   l:"INR — Indian Rupee"      },
  { s:"A$",  l:"AUD — Australian Dollar" },
  { s:"C$",  l:"CAD — Canadian Dollar"   },
  { s:"¥",   l:"JPY — Japanese Yen"      },
  { s:"د.إ", l:"AED — UAE Dirham"        },
];

const PAYMENT_METHODS = ["Cash","Bank Transfer","Credit Card","Debit Card","Cheque","Money Order","PayPal","Venmo","Zelle","Other"];

const PROPERTY_TYPES = ["Apartment","House","Condo","Studio","Room","Office","Commercial","Other"];

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

function AdvRow({ show, onToggle, tr }: { show: boolean; onToggle: () => void; tr: Tr }) {
  return (
    <button onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text3)", cursor:"pointer", background:"none", border:"none", fontFamily:"inherit", padding:"2px 0" }}>
      <ChevronDown size={11} style={{ transform: show ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .18s" }} />
      {show ? tr.hideAdvanced : tr.advanced}
    </button>
  );
}

const inp = "w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] transition font-[inherit]";
const lbl = (t: string) => <label style={{ display:"block", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", marginBottom:4 }}>{t}</label>;
const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 } as const;

export default function FormPanel({ data, onChange, lang }: Props) {
  const tr = T[lang];
  const logoRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof TenancyData, v: unknown) => onChange({ ...data, [k]: v });

  const [advLandlord,  setAdvLandlord]  = useState(false);
  const [advTenant,    setAdvTenant]    = useState(false);
  const [advProperty,  setAdvProperty]  = useState(false);
  const [showCharges,  setShowCharges]  = useState(false);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("logo", ev.target?.result as string); r.readAsDataURL(file);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── LANDLORD ── */}
      <Section title={tr.landlordSection} defaultOpen accent>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />

        {/* Logo — always visible */}
        <div>
          {lbl(tr.logo)}
          {data.logo ? (
            <div style={{ position:"relative", display:"inline-flex" }}>
              <img src={data.logo} alt="" style={{ height:48, objectFit:"contain", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", padding:6 }} />
              <button onClick={()=>set("logo","")} style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:"#ef4444", color:"#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={10}/></button>
              <button onClick={()=>logoRef.current?.click()} style={{ position:"absolute", bottom:-6, right:-6, width:22, height:22, borderRadius:"50%", background:"var(--accent)", color:"#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ImagePlus size={10}/></button>
            </div>
          ) : (
            <button onClick={()=>logoRef.current?.click()} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", border:"2px dashed var(--border2)", borderRadius:10, background:"var(--surface)", cursor:"pointer", transition:"border-color .15s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border2)"}>
              <Upload size={15} color="var(--text3)" />
              <span style={{ fontSize:12, color:"var(--text3)" }}>{tr.uploadLogo}</span>
            </button>
          )}
        </div>

        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.landlordName)}
            <input className={inp} value={data.landlordName} onChange={e=>set("landlordName",e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.landlordEmail} onChange={e=>set("landlordEmail",e.target.value)} placeholder="landlord@mail.com" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.landlordPhone} onChange={e=>set("landlordPhone",e.target.value)} placeholder="+1 555-0000" />
          </div>
        </div>

        <AdvRow show={advLandlord} onToggle={() => setAdvLandlord(v=>!v)} tr={tr} />

        {advLandlord && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="section-open">
            <div style={g2}>
              <div className="col-span-2">
                {lbl(tr.landlordCompany)}
                <input className={inp} value={data.landlordCompany} onChange={e=>set("landlordCompany",e.target.value)} placeholder="ABC Property Mgmt" />
              </div>
              <div className="col-span-2">
                {lbl(tr.landlordAddress)}
                <input className={inp} value={data.landlordAddress} onChange={e=>set("landlordAddress",e.target.value)} placeholder="789 Owner St, City" />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── RECEIPT DETAILS ── */}
      <Section title={tr.receiptSection} defaultOpen={false} accent>
        <div style={g2}>
          <div>
            {lbl(tr.receiptNumber)}
            <input className={inp} value={data.receiptNumber} onChange={e=>set("receiptNumber",e.target.value)} placeholder="RR-001" />
          </div>
          <div>
            {lbl(tr.currency)}
            <select className={inp} value={data.currencySymbol} onChange={e=>set("currencySymbol",e.target.value)}>
              {CURRENCIES.map(c=><option key={c.s} value={c.s}>{c.l}</option>)}
            </select>
          </div>
          <div>
            {lbl(tr.issueDate)}
            <input className={inp} type="date" value={data.issueDate} onChange={e=>set("issueDate",e.target.value)} />
          </div>
          <div>
            {lbl(tr.paymentDate)}
            <input className={inp} type="date" value={data.paymentDate} onChange={e=>set("paymentDate",e.target.value)} />
          </div>
          <div>
            {lbl(tr.method)}
            <select className={inp} value={data.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            {lbl(tr.status)}
            <select className={inp} value={data.paymentStatus} onChange={e=>set("paymentStatus",e.target.value as TenancyData["paymentStatus"])}>
              {["Paid","Partial","Pending","Overdue"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ── TENANT ── */}
      <Section title={tr.tenantSection} defaultOpen={false} accent>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.tenantName)}
            <input className={inp} value={data.tenantName} onChange={e=>set("tenantName",e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.tenantPhone} onChange={e=>set("tenantPhone",e.target.value)} placeholder="+1 555-1234" />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.tenantEmail} onChange={e=>set("tenantEmail",e.target.value)} placeholder="jane@email.com" />
          </div>
        </div>

        <AdvRow show={advTenant} onToggle={() => setAdvTenant(v=>!v)} tr={tr} />
        {/* (tenant advanced: reserved for future fields) */}
      </Section>

      {/* ── PROPERTY ── */}
      <Section title={tr.propertySection} defaultOpen={false} accent>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.propertyAddress)}
            <input className={inp} value={data.propertyAddress} onChange={e=>set("propertyAddress",e.target.value)} placeholder="456 Main St, City, State, ZIP" />
          </div>
          <div>
            {lbl(tr.periodFrom)}
            <input className={inp} type="date" value={data.periodFrom} onChange={e=>set("periodFrom",e.target.value)} />
          </div>
          <div>
            {lbl(tr.periodTo)}
            <input className={inp} type="date" value={data.periodTo} onChange={e=>set("periodTo",e.target.value)} />
          </div>
        </div>

        <AdvRow show={advProperty} onToggle={() => setAdvProperty(v=>!v)} tr={tr} />

        {advProperty && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="section-open">
            <div style={g2}>
              <div>
                {lbl(tr.propertyUnit)}
                <input className={inp} value={data.propertyUnit} onChange={e=>set("propertyUnit",e.target.value)} placeholder="Apt 2B" />
              </div>
              <div>
                {lbl(tr.propertyType)}
                <select className={inp} value={data.propertyType} onChange={e=>set("propertyType",e.target.value)}>
                  {PROPERTY_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── CHARGES ── */}
      <Section title={tr.chargesSection} defaultOpen={false} accent>
        {/* Rent — always visible */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            {lbl(tr.monthlyRent)}
            <span style={{ fontSize:11, color:"var(--accent)", fontWeight:700 }}>*</span>
          </div>
          <input className={inp} value={data.rentAmount} onChange={e=>set("rentAmount",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
        </div>

        {/* Optional charges toggle */}
        <button onClick={() => setShowCharges(v=>!v)} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text3)", cursor:"pointer", background:"none", border:"none", fontFamily:"inherit", padding:"2px 0" }}>
          <ChevronDown size={11} style={{ transform: showCharges ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .18s" }} />
          {showCharges ? tr.hideCharges : tr.moreCharges}
        </button>

        {showCharges && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }} className="section-open">
            {[
              { k:"lateFee",         l: tr.lateFee,     lk: null                },
              { k:"parkingFee",      l: tr.parkingFee,  lk: null                },
              { k:"utilitiesAmount", l: tr.utilities,   lk:"utilitiesLabel"  as keyof TenancyData },
              { k:"maintenanceFee",  l: tr.maintenance, lk:"maintenanceLabel" as keyof TenancyData },
              { k:"depositAmount",   l: tr.deposit,     lk: null                },
              { k:"otherFee",        l: tr.otherFee,    lk:"otherLabel"      as keyof TenancyData },
              { k:"discount",        l: tr.discount,    lk: null                },
            ].map(row => (
              <div key={row.k} style={{ display:"flex", gap:8 }}>
                {row.lk && (
                  <div style={{ flex:1 }}>
                    {lbl("Label")}
                    <input className={inp} value={(data as unknown as Record<string,string>)[row.lk!]} onChange={e=>set(row.lk!, e.target.value)} placeholder={row.l} />
                  </div>
                )}
                <div style={{ flex: row.lk ? 1 : undefined, width: row.lk ? undefined : "100%" }}>
                  {lbl(row.lk ? "Amount" : row.l)}
                  <input className={inp} value={(data as unknown as Record<string,string>)[row.k]} onChange={e=>set(row.k as keyof TenancyData, e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer / signature */}
        <div style={{ paddingTop:4, display:"flex", flexDirection:"column", gap:8 }}>
          <div>
            {lbl("Footer")}
            <input className={inp} value={data.footer} onChange={e=>set("footer",e.target.value)} placeholder="Official tenancy receipt — retain for your records." />
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
            <div onClick={()=>set("showSignature",!data.showSignature)} style={{ width:38, height:20, borderRadius:10, background: data.showSignature ? "var(--accent)" : "var(--border2)", position:"relative", transition:"background .2s", cursor:"pointer", flexShrink:0 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left: data.showSignature ? 20 : 2, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize:13, color:"var(--text2)" }}>{tr.signatureLines}</span>
          </label>
        </div>
      </Section>

    </div>
  );
}
