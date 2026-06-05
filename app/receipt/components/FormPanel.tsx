"use client";
import { useState, useRef } from "react";
import { Upload, X, ImagePlus, ChevronDown, Plus, Trash2 } from "lucide-react";
import { GeneralReceiptData, GeneralReceiptItem } from "../../types";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: GeneralReceiptData;
  onChange: (d: GeneralReceiptData) => void;
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

const PAYMENT_METHODS = ["Cash","Card","Bank Transfer","Credit Card","Debit Card","PayPal","Stripe","Venmo","Zelle","Cheque","Other"];

function Section({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius:12, border:"1px solid var(--border)", overflow:"hidden", marginBottom:8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--surface2)", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
        <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--accent)" }}>{title}</span>
        <ChevronDown size={14} color="var(--text3)" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .2s" }} />
      </button>
      {open && (
        <div style={{ padding:"12px 14px", background:"var(--panel)", display:"flex", flexDirection:"column", gap:10 }}>
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
  const set = (k: keyof GeneralReceiptData, v: unknown) => onChange({ ...data, [k]: v });

  const [advSeller, setAdvSeller] = useState(false);
  const [advBuyer,  setAdvBuyer]  = useState(false);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("logo", ev.target?.result as string); r.readAsDataURL(file);
  };

  const addItem = () => {
    const newItem: GeneralReceiptItem = { id: Date.now().toString(), description: "", quantity: "1", rate: "" };
    set("items", [...data.items, newItem]);
  };

  const updateItem = (id: string, k: keyof GeneralReceiptItem, v: string) => {
    set("items", data.items.map(i => i.id === id ? { ...i, [k]: v } : i));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) return;
    set("items", data.items.filter(i => i.id !== id));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── SELLER / YOUR INFO ── */}
      <Section title={tr.grSellerSection} defaultOpen>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
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
            {lbl(tr.fullName)}
            <input className={inp} value={data.sellerName} onChange={e=>set("sellerName",e.target.value)} placeholder="Your Name" />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.sellerEmail} onChange={e=>set("sellerEmail",e.target.value)} placeholder="you@business.com" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.sellerPhone} onChange={e=>set("sellerPhone",e.target.value)} placeholder="+1 555-0000" />
          </div>
        </div>
        <AdvRow show={advSeller} onToggle={() => setAdvSeller(v=>!v)} tr={tr} />
        {advSeller && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={g2}>
              <div className="col-span-2">
                {lbl(tr.company)}
                <input className={inp} value={data.sellerCompany} onChange={e=>set("sellerCompany",e.target.value)} placeholder="Business Name" />
              </div>
              <div className="col-span-2">
                {lbl(tr.address)}
                <input className={inp} value={data.sellerAddress} onChange={e=>set("sellerAddress",e.target.value)} placeholder="123 Main St, City" />
              </div>
              <div className="col-span-2">
                {lbl(tr.website)}
                <input className={inp} value={data.sellerWebsite} onChange={e=>set("sellerWebsite",e.target.value)} placeholder="www.yourbusiness.com" />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── RECEIPT DETAILS ── */}
      <Section title={tr.grReceiptSection}>
        <div style={g2}>
          <div>
            {lbl(tr.receiptNumber)}
            <input className={inp} value={data.receiptNumber} onChange={e=>set("receiptNumber",e.target.value)} placeholder="RC-001" />
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
            <select className={inp} value={data.paymentStatus} onChange={e=>set("paymentStatus",e.target.value as GeneralReceiptData["paymentStatus"])}>
              {["Paid","Partial","Pending","Overdue"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ── CUSTOMER ── */}
      <Section title={tr.grBuyerSection}>
        <div style={g2}>
          <div className="col-span-2">
            {lbl(tr.grBuyerName)}
            <input className={inp} value={data.buyerName} onChange={e=>set("buyerName",e.target.value)} placeholder="Customer Name" />
          </div>
          <div>
            {lbl(tr.email)}
            <input className={inp} value={data.buyerEmail} onChange={e=>set("buyerEmail",e.target.value)} placeholder="customer@email.com" />
          </div>
          <div>
            {lbl(tr.phone)}
            <input className={inp} value={data.buyerPhone} onChange={e=>set("buyerPhone",e.target.value)} placeholder="+1 555-1234" />
          </div>
        </div>
        <AdvRow show={advBuyer} onToggle={() => setAdvBuyer(v=>!v)} tr={tr} />
        {advBuyer && (
          <div>
            {lbl(tr.address)}
            <input className={inp} value={data.buyerAddress} onChange={e=>set("buyerAddress",e.target.value)} placeholder="Customer Address" />
          </div>
        )}
      </Section>

      {/* ── ITEMS ── */}
      <Section title={tr.grItemsSection}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 56px 80px 28px", gap:6 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", paddingLeft:2 }}>{tr.grItemDesc}</span>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", textAlign:"center" }}>{tr.grQty}</span>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--text3)", textAlign:"right" }}>{tr.grPrice}</span>
            <span />
          </div>
          {data.items.map(item => (
            <div key={item.id} style={{ display:"grid", gridTemplateColumns:"1fr 56px 80px 28px", gap:6, alignItems:"center" }}>
              <input className={inp} value={item.description} onChange={e=>updateItem(item.id,"description",e.target.value)} placeholder="Item description" style={{ fontSize:13 }} />
              <input className={inp} value={item.quantity} onChange={e=>updateItem(item.id,"quantity",e.target.value)} placeholder="1" type="number" min="0" step="any" style={{ fontSize:13, textAlign:"center" }} />
              <input className={inp} value={item.rate} onChange={e=>updateItem(item.id,"rate",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" style={{ fontSize:13, textAlign:"right" }} />
              <button onClick={()=>removeItem(item.id)} disabled={data.items.length===1}
                style={{ width:28, height:28, borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", color: data.items.length===1 ? "var(--border2)" : "var(--text3)", cursor: data.items.length===1 ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}
                onMouseEnter={e=>{ if (data.items.length>1) e.currentTarget.style.color="#ef4444"; }}
                onMouseLeave={e=>e.currentTarget.style.color="var(--text3)"}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>

        <button onClick={addItem} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10, border:"2px dashed var(--border2)", background:"transparent", color:"var(--text3)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s", width:"100%" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--text3)"; }}>
          <Plus size={13}/> {tr.addItem}
        </button>

        {/* Discount */}
        <div style={{ paddingTop:4, borderTop:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={g2}>
            <div>
              {lbl(tr.discountAmount)}
              <input className={inp} value={data.discount} onChange={e=>set("discount",e.target.value)} placeholder="0" type="number" min="0" step="0.01" />
            </div>
            <div>
              {lbl(tr.discountType)}
              <select className={inp} value={data.discountType} onChange={e=>set("discountType",e.target.value as "percent"|"fixed")}>
                <option value="percent">{tr.discountPct}</option>
                <option value="fixed">{tr.discountFixed}</option>
              </select>
            </div>
          </div>

          {/* Tax toggle */}
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
            <div onClick={()=>set("showTax",!data.showTax)} style={{ width:38, height:20, borderRadius:10, background: data.showTax ? "var(--accent)" : "var(--border2)", position:"relative", transition:"background .2s", cursor:"pointer", flexShrink:0 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left: data.showTax ? 20 : 2, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize:13, color:"var(--text2)" }}>{tr.grShowTax}</span>
          </label>

          {data.showTax && (
            <div style={g2}>
              <div>
                {lbl(tr.grTaxLabel)}
                <input className={inp} value={data.taxLabel} onChange={e=>set("taxLabel",e.target.value)} placeholder="Tax / VAT / GST" />
              </div>
              <div>
                {lbl(tr.grTaxRate)}
                <input className={inp} value={data.taxRate} onChange={e=>set("taxRate",e.target.value)} placeholder="10" type="number" min="0" step="0.01" />
              </div>
            </div>
          )}
        </div>

        {/* Footer / signature */}
        <div style={{ paddingTop:4, display:"flex", flexDirection:"column", gap:8 }}>
          <div>
            {lbl("Footer")}
            <input className={inp} value={data.footer} onChange={e=>set("footer",e.target.value)} placeholder="Thank you for your business!" />
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
