"use client";
import { useRef } from "react";
import { Upload, X, ImagePlus, Plus, Trash2, Info } from "lucide-react";
import { ITReceiptData, LineItem, RateType, VatRate } from "../../types";
import { calcDueDate, fmtMoney, lineExcl } from "../../utils/calc";

interface Props { data: ITReceiptData; onChange: (d: ITReceiptData) => void; }

const IT_CATEGORIES = [
  "Software Development", "Web Development", "Mobile Apps", "DevOps / Cloud",
  "Cybersecurity", "IT Consulting", "System Administration", "Network Management",
  "Data Analytics / BI", "AI / Machine Learning", "UI/UX Design", "IT Project Management",
  "Helpdesk / Support", "Training / Education", "Software Licenses", "Hardware",
  "Hosting / Domain", "Testing / QA", "Technical Documentation", "Other IT",
];

const UNITS = ["hour", "day", "unit", "license", "month", "year", "project", "GB", "user"];

const VAT_OPTIONS: { value: VatRate; label: string }[] = [
  { value: 21, label: "21% (standard)" },
  { value: 9,  label: "9% (reduced)"   },
  { value: 0,  label: "0% (zero rate)" },
];

const RATE_TYPES: { value: RateType; label: string }[] = [
  { value: "fixed",     label: "Fixed price" },
  { value: "per_hour",  label: "Per hour"    },
  { value: "per_day",   label: "Per day"     },
  { value: "per_month", label: "Per month"   },
  { value: "milestone", label: "Milestone"   },
];

const PAYMENT_METHODS = ["Bank Transfer", "iDEAL", "SEPA Transfer", "Credit Card", "PayPal", "Stripe", "Cash", "Other"];

export default function FormPanel({ data, onChange }: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof ITReceiptData, v: unknown) => onChange({ ...data, [k]: v });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("logo", ev.target?.result as string); r.readAsDataURL(file);
  };

  const updateItem = (i: number, k: keyof LineItem, v: string | number) => {
    const items = [...data.items]; items[i] = { ...items[i], [k]: v }; onChange({ ...data, items });
  };

  const addItem = () => onChange({
    ...data,
    items: [...data.items, {
      id: Date.now().toString(), description: "", category: "Software Development",
      quantity: "1", unit: "hour", rate: "", rateType: "per_hour", vatRate: 21,
    }],
  });

  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  const handleTermChange = (days: string) => {
    onChange({ ...data, paymentTermDays: days, dueDate: calcDueDate(data.issueDate, days) });
  };

  const handleIssueDateChange = (d: string) => {
    onChange({ ...data, issueDate: d, dueDate: calcDueDate(d, data.paymentTermDays || "30") });
  };

  const inp = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] transition font-[inherit]";
  const lbl = "block text-[11px] font-semibold uppercase tracking-widest text-[var(--text3)] mb-1.5";
  const sec = (t: string) => <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] mb-3">{t}</p>;
  const g2  = "grid grid-cols-2 gap-3";
  const tip = (text: string) => <span title={text} className="inline-flex items-center ml-1 text-[var(--text3)] cursor-help"><Info size={10}/></span>;

  return (
    <div className="space-y-5">

      {/* YOUR BUSINESS */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Your Business")}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <div>
          <label className={lbl}>Logo</label>
          {data.logo ? (
            <div className="relative inline-flex group">
              <img src={data.logo} alt="" className="h-14 w-auto max-w-[160px] object-contain rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2" />
              <button onClick={() => set("logo","")} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X size={11}/></button>
              <button onClick={() => logoRef.current?.click()} className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ImagePlus size={11}/></button>
            </div>
          ) : (
            <button onClick={() => logoRef.current?.click()} className="w-full flex flex-col items-center gap-1.5 py-4 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition group">
              <Upload size={18} className="text-[var(--text3)] group-hover:text-[var(--accent)]" />
              <span className="text-xs text-[var(--text3)] group-hover:text-[var(--accent)] font-medium">Upload company logo</span>
            </button>
          )}
        </div>
        <div className={g2}>
          <div className="col-span-2"><label className={lbl}>Full Name</label><input className={inp} value={data.providerName} onChange={e=>set("providerName",e.target.value)} placeholder="Jan de Vries" /></div>
          <div className="col-span-2"><label className={lbl}>Job Title / Role</label><input className={inp} value={data.providerTitle} onChange={e=>set("providerTitle",e.target.value)} placeholder="IT Consultant / Software Developer" /></div>
          <div className="col-span-2"><label className={lbl}>Company Name</label><input className={inp} value={data.providerCompany} onChange={e=>set("providerCompany",e.target.value)} placeholder="Jan de Vries IT B.V." /></div>
          <div className="col-span-2"><label className={lbl}>Street + Number</label><input className={inp} value={data.providerAddress} onChange={e=>set("providerAddress",e.target.value)} placeholder="Keizersgracht 123" /></div>
          <div><label className={lbl}>Postcode</label><input className={inp} value={data.providerPostcode} onChange={e=>set("providerPostcode",e.target.value)} placeholder="1234 AB" /></div>
          <div><label className={lbl}>City</label><input className={inp} value={data.providerCity} onChange={e=>set("providerCity",e.target.value)} placeholder="Amsterdam" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={data.providerPhone} onChange={e=>set("providerPhone",e.target.value)} placeholder="+31 6 12345678" /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={data.providerEmail} onChange={e=>set("providerEmail",e.target.value)} placeholder="jan@itbedrijf.nl" /></div>
          <div className="col-span-2"><label className={lbl}>Website</label><input className={inp} value={data.providerWebsite} onChange={e=>set("providerWebsite",e.target.value)} placeholder="www.jandevriesit.nl" /></div>
        </div>

        {/* Dutch legal numbers */}
        <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--border)] space-y-3">
          <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Dutch Business Details</p>
          <div className={g2}>
            <div>
              <label className={lbl}>Chamber of Commerce (KvK) {tip("Kamer van Koophandel number")}</label>
              <input className={inp} value={data.kvkNumber} onChange={e=>set("kvkNumber",e.target.value)} placeholder="12345678" maxLength={8} />
            </div>
            <div>
              <label className={lbl}>VAT Number (BTW) {tip("Format: NL999999999B01")}</label>
              <input className={inp} value={data.btwNumber} onChange={e=>set("btwNumber",e.target.value)} placeholder="NL123456789B01" />
            </div>
          </div>
        </div>

        {/* Bank details */}
        <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--border)] space-y-3">
          <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Bank Details</p>
          <div className={g2}>
            <div className="col-span-2"><label className={lbl}>IBAN</label><input className={inp} value={data.iban} onChange={e=>set("iban",e.target.value.toUpperCase())} placeholder="NL12 ABNA 0123 4567 89" /></div>
            <div><label className={lbl}>BIC / SWIFT</label><input className={inp} value={data.bic} onChange={e=>set("bic",e.target.value.toUpperCase())} placeholder="ABNANL2A" /></div>
            <div><label className={lbl}>Bank Name</label><input className={inp} value={data.bankName} onChange={e=>set("bankName",e.target.value)} placeholder="ABN AMRO" /></div>
          </div>
        </div>
      </div>

      {/* DOCUMENT */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Document Details")}
        <div className={g2}>
          <div>
            <label className={lbl}>Document Type</label>
            <select className={inp} value={data.docType} onChange={e=>set("docType",e.target.value as ITReceiptData["docType"])}>
              <option value="invoice">Invoice</option>
              <option value="quote">Quote / Estimate</option>
              <option value="proforma">Pro Forma Invoice</option>
              <option value="credit_note">Credit Note</option>
              <option value="receipt">Receipt</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select className={inp} value={data.docStatus} onChange={e=>set("docStatus",e.target.value as ITReceiptData["docStatus"])}>
              {["Draft","Sent","Paid","Overdue","Cancelled","In Progress"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Invoice Number</label><input className={inp} value={data.docNumber} onChange={e=>set("docNumber",e.target.value)} placeholder="2024-001" /></div>
          <div>
            <label className={lbl}>Currency</label>
            <select className={inp} value={data.currencySymbol} onChange={e=>set("currencySymbol",e.target.value)}>
              <option value="€">EUR (€)</option>
              <option value="$">USD ($)</option>
              <option value="£">GBP (£)</option>
            </select>
          </div>
          <div><label className={lbl}>Issue Date</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.issueDate} onChange={e=>handleIssueDateChange(e.target.value)} /></div>
          <div><label className={lbl}>Due Date</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
          <div>
            <label className={lbl}>Payment Terms</label>
            <select className={inp} value={data.paymentTermDays} onChange={e=>handleTermChange(e.target.value)}>
              {["7","14","21","30","45","60","90"].map(d=><option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div><label className={lbl}>PO Number</label><input className={inp} value={data.poNumber} onChange={e=>set("poNumber",e.target.value)} placeholder="PO-12345" /></div>
          <div className="col-span-2"><label className={lbl}>Client Reference Number</label><input className={inp} value={data.referenceNumber} onChange={e=>set("referenceNumber",e.target.value)} placeholder="Client's own reference" /></div>
        </div>
      </div>

      {/* VAT SCHEME */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("VAT Scheme")}
        <div className="space-y-2">
          {[
            { v: "standard",       l: "Standard VAT",          d: "21% / 9% / 0% — set per line item, auto-calculated" },
            { v: "reverse_charge", l: "Reverse Charge (Verlegd)", d: "Invoice without VAT — client pays VAT (art. 12 OB)" },
            { v: "exempt",         l: "VAT Exempt",             d: "Freelancer under €20,000/yr or exempt service (KOR)" },
            { v: "eu_vat",         l: "EU / Intra-Community",   d: "EU client with VAT number — 0% with reverse charge clause" },
          ].map(opt => (
            <label key={opt.v} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${data.vatScheme === opt.v ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"}`}>
              <input type="radio" name="vatScheme" value={opt.v} checked={data.vatScheme === opt.v} onChange={e=>set("vatScheme",e.target.value as ITReceiptData["vatScheme"])} className="mt-0.5 accent-[var(--accent)]" />
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">{opt.l}</div>
                <div className="text-[11px] text-[var(--text3)] mt-0.5">{opt.d}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* CLIENT */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Client Details")}
        <div className={g2}>
          <div className="col-span-2"><label className={lbl}>Contact Name</label><input className={inp} value={data.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="Piet Janssen" /></div>
          <div className="col-span-2"><label className={lbl}>Company Name</label><input className={inp} value={data.clientCompany} onChange={e=>set("clientCompany",e.target.value)} placeholder="Client B.V." /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={data.clientEmail} onChange={e=>set("clientEmail",e.target.value)} placeholder="piet@client.nl" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={data.clientPhone} onChange={e=>set("clientPhone",e.target.value)} placeholder="+31 20 1234567" /></div>
          <div className="col-span-2"><label className={lbl}>Street + Number</label><input className={inp} value={data.clientAddress} onChange={e=>set("clientAddress",e.target.value)} placeholder="Herengracht 456" /></div>
          <div><label className={lbl}>Postcode</label><input className={inp} value={data.clientPostcode} onChange={e=>set("clientPostcode",e.target.value)} placeholder="1017 BX" /></div>
          <div><label className={lbl}>City</label><input className={inp} value={data.clientCity} onChange={e=>set("clientCity",e.target.value)} placeholder="Amsterdam" /></div>
          <div>
            <label className={lbl}>Country</label>
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
          <div><label className={lbl}>Client KvK</label><input className={inp} value={data.clientKvk} onChange={e=>set("clientKvk",e.target.value)} placeholder="87654321" /></div>
          <div className="col-span-2">
            <label className={lbl}>Client VAT Number {tip("Required for EU reverse charge")}</label>
            <input className={inp} value={data.clientBtw} onChange={e=>set("clientBtw",e.target.value)} placeholder="NL987654321B01 or DE..." />
          </div>
        </div>
      </div>

      {/* PROJECT */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Project / Assignment")}
        <div className={g2}>
          <div className="col-span-2"><label className={lbl}>Project Name</label><input className={inp} value={data.projectName} onChange={e=>set("projectName",e.target.value)} placeholder="Website Redesign Phase 2" /></div>
          <div className="col-span-2"><label className={lbl}>Technology / Platform</label><input className={inp} value={data.techStack} onChange={e=>set("techStack",e.target.value)} placeholder="React, Azure, .NET, SAP, Cisco..." /></div>
          <div><label className={lbl}>Period From</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.periodFrom} onChange={e=>set("periodFrom",e.target.value)} /></div>
          <div><label className={lbl}>Period To</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.periodTo} onChange={e=>set("periodTo",e.target.value)} /></div>
          <div className="col-span-2"><label className={lbl}>Project Description</label><textarea className={`${inp} h-16 resize-none`} value={data.projectDescription} onChange={e=>set("projectDescription",e.target.value)} placeholder="Brief description of work performed..." /></div>
        </div>
      </div>

      {/* LINE ITEMS */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Line Items")}
        <div className="space-y-2">
          {data.items.map((item, idx) => {
            const total = lineExcl(item);
            return (
              <div key={item.id} className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--border)] space-y-2 group relative">
                <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-[var(--text3)] hover:text-red-400"><Trash2 size={13}/></button>
                <input className={inp} value={item.description} onChange={e=>updateItem(idx,"description",e.target.value)} placeholder="Description of work performed..." />
                <div className="grid grid-cols-2 gap-2">
                  <select className={inp} value={item.category} onChange={e=>updateItem(idx,"category",e.target.value)}>
                    {IT_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <select className={inp} value={item.rateType} onChange={e=>updateItem(idx,"rateType",e.target.value as RateType)}>
                    {RATE_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--text3)] mb-0.5 block">Qty</label>
                    <input className={inp} value={item.quantity} onChange={e=>updateItem(idx,"quantity",e.target.value)} placeholder="1" type="number" min="0" step="0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text3)] mb-0.5 block">Unit</label>
                    <select className={inp} value={item.unit} onChange={e=>updateItem(idx,"unit",e.target.value)}>
                      {UNITS.map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text3)] mb-0.5 block">Rate (€)</label>
                    <input className={inp} value={item.rate} onChange={e=>updateItem(idx,"rate",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text3)] mb-0.5 block">VAT %</label>
                    <select className={inp} value={item.vatRate} onChange={e=>updateItem(idx,"vatRate",parseInt(e.target.value) as VatRate)}>
                      {VAT_OPTIONS.map(v=><option key={v.value} value={v.value}>{v.value}%</option>)}
                    </select>
                  </div>
                </div>
                {total > 0 && (
                  <div className="flex justify-between items-center text-xs mt-1 pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text3)]">
                      {item.quantity} {item.unit} × {data.currencySymbol}{parseFloat(item.rate||"0").toFixed(2)} excl. VAT
                    </span>
                    <div className="flex gap-3">
                      <span className="text-[var(--text3)]">Excl. VAT: <span className="font-mono text-[var(--text2)]">{data.currencySymbol}{total.toFixed(2)}</span></span>
                      {data.vatScheme === "standard" && item.vatRate > 0 && (
                        <span className="text-[var(--text3)]">VAT {item.vatRate}%: <span className="font-mono text-[var(--accent)]">{data.currencySymbol}{(total * item.vatRate / 100).toFixed(2)}</span></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:text-[var(--text)] transition">
          <Plus size={14}/> Add line item
        </button>
      </div>

      {/* DISCOUNT */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Discount")}
        <div className={g2}>
          <div>
            <label className={lbl}>Discount Amount</label>
            <input className={inp} value={data.discount} onChange={e=>set("discount",e.target.value)} placeholder="0" type="number" min="0" step="0.01" />
          </div>
          <div>
            <label className={lbl}>Discount Type</label>
            <select className={inp} value={data.discountType} onChange={e=>set("discountType",e.target.value as ITReceiptData["discountType"])}>
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="pb-5 border-b border-[var(--border)] space-y-3">
        {sec("Payment")}
        <div className={g2}>
          <div>
            <label className={lbl}>Payment Method</label>
            <select className={inp} value={data.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Payment Terms</label>
            <select className={inp} value={data.paymentTermDays} onChange={e=>handleTermChange(e.target.value)}>
              {["7","14","21","30","45","60","90"].map(d=><option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={lbl}>Payment Instructions</label>
            <textarea className={`${inp} h-16 resize-none`} value={data.paymentNotes} onChange={e=>set("paymentNotes",e.target.value)} placeholder="Please transfer the amount within 30 days quoting the invoice number..." />
          </div>
        </div>
      </div>

      {/* NOTES */}
      <div className="space-y-3">
        {sec("Notes & Terms")}
        <div><label className={lbl}>Notes</label><textarea className={`${inp} h-20 resize-none`} value={data.notes} onChange={e=>set("notes",e.target.value)} placeholder="Thank you for your business." /></div>
        <div><label className={lbl}>Terms & Conditions</label><textarea className={`${inp} h-16 resize-none`} value={data.terms} onChange={e=>set("terms",e.target.value)} placeholder="Late payments are subject to statutory interest. Ownership reserved until full payment received." /></div>
        <div><label className={lbl}>Footer</label><input className={inp} value={data.footer} onChange={e=>set("footer",e.target.value)} placeholder="Your Name · KvK 12345678 · VAT NL123456789B01" /></div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={()=>set("showSignature",!data.showSignature)} className={`w-10 h-5 rounded-full transition-all relative ${data.showSignature?"bg-[var(--accent)]":"bg-[var(--border2)]"}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${data.showSignature?"left-5":"left-0.5"}`}/>
          </div>
          <span className="text-sm text-[var(--text2)]">Include signature lines</span>
        </label>
      </div>
    </div>
  );
}
