"use client";
import { useRef } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { TenancyData } from "../../types";

interface Props { data: TenancyData; onChange: (d: TenancyData) => void; }

const CURRENCIES = [
  { s: "$", l: "USD — US Dollar" }, { s: "€", l: "EUR — Euro" }, { s: "£", l: "GBP — British Pound" },
  { s: "R", l: "ZAR — South African Rand" }, { s: "₦", l: "NGN — Nigerian Naira" }, { s: "₹", l: "INR — Indian Rupee" },
  { s: "A$", l: "AUD — Australian Dollar" }, { s: "C$", l: "CAD — Canadian Dollar" }, { s: "¥", l: "JPY — Japanese Yen" }, { s: "د.إ", l: "AED — UAE Dirham" },
];

export default function FormPanel({ data, onChange }: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof TenancyData, v: unknown) => onChange({ ...data, [k]: v });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set("logo", ev.target?.result as string); r.readAsDataURL(file);
  };

  const inp = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--panel-border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition";
  const lbl = "block text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";
  const sec = (t: string) => <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] mb-3">{t}</p>;
  const div2 = "grid grid-cols-2 gap-3";

  return (
    <div className="space-y-5">

      {/* LANDLORD */}
      <div className="pb-5 border-b border-[var(--panel-border)] space-y-3">
        {sec("Landlord / Manager")}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <div>
          <label className={lbl}>Logo / Stamp</label>
          {data.logo ? (
            <div className="relative inline-flex group">
              <img src={data.logo} alt="" className="h-16 w-auto max-w-[180px] object-contain rounded-xl border border-[var(--panel-border)] bg-white p-2" />
              <button onClick={() => set("logo","")} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X size={11}/></button>
              <button onClick={() => logoRef.current?.click()} className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ImagePlus size={11}/></button>
            </div>
          ) : (
            <button onClick={() => logoRef.current?.click()} className="w-full flex flex-col items-center gap-1.5 py-5 border-2 border-dashed border-[var(--panel-border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition group">
              <Upload size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
              <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--accent)] font-medium">Upload logo or stamp</span>
              <span className="text-[10px] text-[var(--text-muted)] opacity-60">PNG, JPG, SVG</span>
            </button>
          )}
        </div>
        <div className={div2}>
          <div className="col-span-2"><label className={lbl}>Full Name</label><input className={inp} value={data.landlordName} onChange={e=>set("landlordName",e.target.value)} placeholder="John Doe" /></div>
          <div className="col-span-2"><label className={lbl}>Company / Agency</label><input className={inp} value={data.landlordCompany} onChange={e=>set("landlordCompany",e.target.value)} placeholder="ABC Property Mgmt" /></div>
          <div className="col-span-2"><label className={lbl}>Address</label><input className={inp} value={data.landlordAddress} onChange={e=>set("landlordAddress",e.target.value)} placeholder="789 Owner St, City" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={data.landlordPhone} onChange={e=>set("landlordPhone",e.target.value)} placeholder="+1 555-0000" /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={data.landlordEmail} onChange={e=>set("landlordEmail",e.target.value)} placeholder="landlord@mail.com" /></div>
        </div>
      </div>

      {/* RECEIPT META */}
      <div className="pb-5 border-b border-[var(--panel-border)] space-y-3">
        {sec("Receipt Details")}
        <div className={div2}>
          <div><label className={lbl}>Receipt #</label><input className={inp} value={data.receiptNumber} onChange={e=>set("receiptNumber",e.target.value)} placeholder="RR-001" /></div>
          <div>
            <label className={lbl}>Currency</label>
            <select className={inp} value={data.currencySymbol} onChange={e=>set("currencySymbol",e.target.value)}>
              {CURRENCIES.map(c=><option key={c.s} value={c.s}>{c.l}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Issue Date</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.issueDate} onChange={e=>set("issueDate",e.target.value)} /></div>
          <div><label className={lbl}>Payment Date</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.paymentDate} onChange={e=>set("paymentDate",e.target.value)} /></div>
          <div>
            <label className={lbl}>Payment Method</label>
            <select className={inp} value={data.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              {["Cash","Bank Transfer","Credit Card","Debit Card","Cheque","Money Order","PayPal","Venmo","Zelle","Other"].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select className={inp} value={data.paymentStatus} onChange={e=>set("paymentStatus",e.target.value as TenancyData["paymentStatus"])}>
              {["Paid","Partial","Pending","Overdue"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TENANT */}
      <div className="pb-5 border-b border-[var(--panel-border)] space-y-3">
        {sec("Tenant")}
        <div className={div2}>
          <div className="col-span-2"><label className={lbl}>Full Name</label><input className={inp} value={data.tenantName} onChange={e=>set("tenantName",e.target.value)} placeholder="Jane Smith" /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={data.tenantEmail} onChange={e=>set("tenantEmail",e.target.value)} placeholder="jane@email.com" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={data.tenantPhone} onChange={e=>set("tenantPhone",e.target.value)} placeholder="+1 555-1234" /></div>
        </div>
      </div>

      {/* PROPERTY */}
      <div className="pb-5 border-b border-[var(--panel-border)] space-y-3">
        {sec("Property")}
        <div className={div2}>
          <div className="col-span-2"><label className={lbl}>Property Address</label><input className={inp} value={data.propertyAddress} onChange={e=>set("propertyAddress",e.target.value)} placeholder="456 Main St, City, State, ZIP" /></div>
          <div><label className={lbl}>Unit / Apt #</label><input className={inp} value={data.propertyUnit} onChange={e=>set("propertyUnit",e.target.value)} placeholder="Apt 2B" /></div>
          <div>
            <label className={lbl}>Type</label>
            <select className={inp} value={data.propertyType} onChange={e=>set("propertyType",e.target.value)}>
              {["Apartment","House","Condo","Studio","Room","Office","Commercial","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Period From</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.periodFrom} onChange={e=>set("periodFrom",e.target.value)} /></div>
          <div><label className={lbl}>Period To</label><input className={`${inp} [color-scheme:dark]`} type="date" value={data.periodTo} onChange={e=>set("periodTo",e.target.value)} /></div>
        </div>
      </div>

      {/* CHARGES */}
      <div className="pb-5 border-b border-[var(--panel-border)] space-y-3">
        {sec("Payment Breakdown")}
        <div>
          <label className={lbl}>Monthly Rent <span className="text-[var(--accent)]">*</span></label>
          <input className={inp} value={data.rentAmount} onChange={e=>set("rentAmount",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
        </div>
        {[
          { k:"lateFee",          l:"Late Fee",          lk:null },
          { k:"parkingFee",       l:"Parking Fee",       lk:null },
          { k:"utilitiesAmount",  l:"Utilities",         lk:"utilitiesLabel" },
          { k:"maintenanceFee",   l:"Maintenance",       lk:"maintenanceLabel" },
          { k:"depositAmount",    l:"Security Deposit",  lk:null },
          { k:"otherFee",         l:"Other",             lk:"otherLabel" },
        ].map(row => (
          <div key={row.k} className={row.lk ? div2 : ""}>
            {row.lk && (
              <div>
                <label className={lbl}>{row.l} Label</label>
                <input className={inp} value={(data as unknown as Record<string,string>)[row.lk!]} onChange={e=>set(row.lk as keyof TenancyData, e.target.value)} placeholder={row.l} />
              </div>
            )}
            <div className={row.lk ? "" : ""}>
              <label className={lbl}>{row.lk ? "Amount" : row.l}</label>
              <input className={inp} value={(data as unknown as Record<string,string>)[row.k]} onChange={e=>set(row.k as keyof TenancyData, e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
            </div>
          </div>
        ))}
        <div className={div2}>
          <div><label className={lbl}>Discount Label</label><input className={inp} value={data.discount} onChange={e=>set("discount",e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" /></div>
        </div>
      </div>

      {/* NOTES */}
      <div className="space-y-3">
        {sec("Notes & Footer")}
        <div><label className={lbl}>Notes to Tenant</label><textarea className={`${inp} h-20 resize-none`} value={data.notes} onChange={e=>set("notes",e.target.value)} placeholder="Next payment due 1st of next month." /></div>
        <div><label className={lbl}>Terms & Conditions</label><textarea className={`${inp} h-16 resize-none`} value={data.terms} onChange={e=>set("terms",e.target.value)} placeholder="Late payments incur a $50 fee after 5 days." /></div>
        <div><label className={lbl}>Footer Line</label><input className={inp} value={data.footer} onChange={e=>set("footer",e.target.value)} placeholder="Official tenancy receipt — retain for your records." /></div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={()=>set("showSignature",!data.showSignature)} className={`w-10 h-5 rounded-full transition-all relative ${data.showSignature?"bg-[var(--accent)]":"bg-[var(--panel-border)]"}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${data.showSignature?"left-5":"left-0.5"}`} />
          </div>
          <span className="text-sm text-[var(--text-secondary)]">Include signature lines</span>
        </label>
      </div>
    </div>
  );
}
