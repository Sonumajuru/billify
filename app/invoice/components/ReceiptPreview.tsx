"use client";
import React from "react";
import { ITReceiptData, LineItem } from "../../types";
import { calcITTotals, lineExcl, lineVat, fmtDate, fmtDateShort, fmtMoney as fmtMoney } from "../../utils/calc";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: ITReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  lang?: Lang;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Draft:         { bg: "#1c2330",  color: "#8b949e", border: "#30363d" },
  Sent:          { bg: "#0d2d6b",  color: "#79c0ff", border: "#1f6feb" },
  Paid:          { bg: "#0f2a1a",  color: "#3fb950", border: "#238636" },
  "Overdue":      { bg: "#3a0e0e",  color: "#f85149", border: "#da3633" },
  "In Progress":{ bg:"#2d1f00",  color: "#f0883e", border: "#bd561d" },
  Cancelled:     { bg: "#1c1c1c",  color: "#6e7681", border: "#30363d" },
};

/** Shared totals block */
function BtwBlock({ data, accent, muted, border, bg2, sym, tr }: {
  data: ITReceiptData; accent: string; muted: string; border: string; bg2: string; sym: string; tr: Tr;
}) {
  const { subtotalExcl, discount, afterDiscount, vatGroups, totalVat, totalIncl } = calcITTotals(data);
  const fmt = (n: number) => fmtMoney(n, sym);
  const isVerlegd    = data.vatScheme === "reverse_charge";
  const isVrijgesteld = data.vatScheme === "exempt";

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
      <div style={{ width: 300 }}>
        <div style={{ padding: "14px 16px", background: bg2, borderRadius: 10, border: `1px solid ${border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: muted, borderBottom: `1px solid ${border}` }}>
            <span>{tr.pSubtotal}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(subtotalExcl)}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#dc2626", borderBottom: `1px solid ${border}` }}>
              <span>{tr.pDiscount}{data.discountType === "percent" ? ` (${data.discount}%)` : ""}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>−{fmt(discount)}</span>
            </div>
          )}

          {!isVerlegd && !isVrijgesteld && vatGroups.map(g => (
            <div key={g.rate} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: muted, borderBottom: `1px solid ${border}` }}>
              <span>{tr.pTaxGroup} {g.rate}% {fmt(g.base - (discount > 0 ? discount * g.base / subtotalExcl : 0))}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(g.vat)}</span>
            </div>
          ))}

          {isVerlegd && (
            <div style={{ padding: "6px 0", fontSize: 12, color: accent, fontStyle: "italic", borderBottom: `1px solid ${border}` }}>
              {tr.pVatReversed}
            </div>
          )}

          {isVrijgesteld && (
            <div style={{ padding: "6px 0", fontSize: 12, color: muted, fontStyle: "italic", borderBottom: `1px solid ${border}` }}>
              {tr.pVatExempt}
            </div>
          )}

          {data.vatScheme === "eu_vat" && data.clientBtw && (
            <div style={{ padding: "6px 0", fontSize: 12, color: accent, fontStyle: "italic", borderBottom: `1px solid ${border}` }}>
              {tr.pIntraCommunity} {data.clientBtw}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", fontSize: 16, fontWeight: 800, color: accent }}>
            <span>{tr.pTotal}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22 }}>{fmt(totalIncl)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemsTable({ data, accent, muted, border, bg2, sym, tr }: {
  data: ITReceiptData; accent: string; muted: string; border: string; bg2: string; sym: string; tr: Tr;
}) {
  const fmt = (n: number) => fmtMoney(n, sym);
  const showVat = data.vatScheme === "standard" || data.vatScheme === "eu_vat";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ background: bg2 }}>
          {["Description", "Cat.", tr.qty, tr.rate, ...(showVat ? [tr.vatPct, tr.pTaxGroup] : []), "Total excl."].map((h, i) => (
            <th key={h} style={{ padding: "8px 10px", textAlign: i < 2 ? "left" : "right", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, i) => {
          const excl = lineExcl(item);
          const vat  = lineVat(item);
          return (
            <tr key={item.id || i} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? "transparent" : `${bg2}50` }}>
              <td style={{ padding: "9px 10px", fontWeight: 500, maxWidth: 180 }}>
                {item.description || <span style={{ opacity: 0.3 }}>—</span>}
              </td>
              <td style={{ padding: "9px 10px" }}>
                {item.category && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: `${accent}18`, color: accent, whiteSpace: "nowrap" }}>
                  {item.category.split(" ")[0]}
                </span>}
              </td>
              <td style={{ padding: "9px 10px", textAlign: "right", color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                {item.quantity} {item.unit}
              </td>
              <td style={{ padding: "9px 10px", textAlign: "right", color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                {item.rate ? `${sym}${parseFloat(item.rate).toFixed(2)}` : "—"}
                {item.rateType !== "fixed" && item.rateType !== "milestone" && <span style={{ fontSize: 9, opacity: 0.6 }}>/{item.unit}</span>}
              </td>
              {showVat && <>
                <td style={{ padding: "9px 10px", textAlign: "right", color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{item.vatRate}%</td>
                <td style={{ padding: "9px 10px", textAlign: "right", color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{excl > 0 ? fmt(vat) : "—"}</td>
              </>}
              <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {excl > 0 ? fmt(excl) : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PartyBlock({ label, name, company, address, postcode, city, country, email, phone, kvk, btw, accent, muted, tx }: {
  label: string; name: string; company: string; address: string; postcode: string; city: string;
  country: string; email: string; phone: string; kvk?: string; btw?: string;
  accent: string; muted: string; tx: string;
}) {
  const addrLine = [address, [postcode, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: accent, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{company || name || "—"}</div>
      {company && name && <div style={{ fontSize: 12, color: muted }}>{name}</div>}
      <div style={{ fontSize: 12, color: muted, lineHeight: 1.8, marginTop: 2 }}>
        {addrLine && <div>{addrLine}</div>}
        {country && country !== "Nederland" && <div>{country}</div>}
        {phone && <div>{phone}</div>}
        {email && <div>{email}</div>}
        {kvk  && <div>KvK: {kvk}</div>}
        {btw  && <div>BTW: {btw}</div>}
      </div>
    </div>
  );
}

function PaymentBlock({ data, accent, muted, border, bg2, tr }: {
  data: ITReceiptData; accent: string; muted: string; border: string; bg2: string; tr: Tr;
}) {
  if (!data.iban && !data.paymentNotes) return null;
  return (
    <div style={{ marginTop: 18, padding: "14px 16px", background: bg2, borderRadius: 10, border: `1px solid ${border}` }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, marginBottom: 10 }}>{tr.pPaymentDetails}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12, color: muted }}>
        <div>
          {data.iban       && <div style={{ marginBottom: 3 }}><strong>IBAN:</strong> <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{data.iban}</span></div>}
          {data.bic        && <div style={{ marginBottom: 3 }}><strong>BIC:</strong> <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{data.bic}</span></div>}
          {data.bankName   && <div style={{ marginBottom: 3 }}><strong>Bank:</strong> {data.bankName}</div>}
          {data.providerName && <div><strong>{tr.pAccName}</strong> {data.providerName}</div>}
        </div>
        <div>
          {data.paymentMethod && <div style={{ marginBottom: 3 }}><strong>{tr.pMethod}</strong> {data.paymentMethod}</div>}
          {data.dueDate       && <div style={{ marginBottom: 3 }}><strong>{tr.pDueDate}</strong> {fmtDateShort(data.dueDate)}</div>}
          {data.paymentTermDays && <div style={{ marginBottom: 3 }}><strong>{tr.pTerms}</strong> {data.paymentTermDays} {tr.days}</div>}
          <div><strong>{tr.pRef}</strong> <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{data.docNumber}</span></div>
        </div>
      </div>
      {data.paymentNotes && <div style={{ marginTop: 8, fontSize: 11, color: muted, lineHeight: 1.7 }}>{data.paymentNotes}</div>}
    </div>
  );
}

function LegalFooterLine({ data, muted, accent }: { data: ITReceiptData; muted: string; accent: string }) {
  const parts: string[] = [];
  if (data.kvkNumber) parts.push(`KvK: ${data.kvkNumber}`);
  if (data.btwNumber) parts.push(`BTW: ${data.btwNumber}`);
  if (data.iban)      parts.push(`IBAN: ${data.iban}`);
  return (
    <div style={{ fontSize: 10, color: muted, textAlign: "center", lineHeight: 1.7 }}>
      {data.footer || `${data.providerCompany || data.providerName}`}
      {parts.length > 0 && <div style={{ marginTop: 3 }}>{parts.join(" · ")}</div>}
    </div>
  );
}

export default function ReceiptPreview({ data, previewRef, lang = "en" }: Props) {
  const tr  = T[lang] as Tr;
  const sym = data.currencySymbol || "€";
  const tid = data.templateId;
  const st  = data.docStatus || "Draft";
  const sts = STATUS_STYLE[st] || STATUS_STYLE.Draft;
  const DOC_LABEL_MAP: Record<string, string> = {
    invoice: tr.pDocInvoice, quote: tr.pDocQuote,
    proforma: tr.pDocProforma, credit_note: tr.pDocCredit, receipt: tr.pDocReceipt,
  };
  const docLbl = DOC_LABEL_MAP[data.docType] || tr.pDocInvoice;
  const { totalIncl } = calcITTotals(data);
  const fmt = (n: number) => fmtMoney(n, sym);

  const providerAddrLine = [data.providerAddress, [data.providerPostcode, data.providerCity].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const clientAddrLine   = [data.clientAddress,   [data.clientPostcode,   data.clientCity  ].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  /* ── TEMPLATE 1: TERMINAL (dark / code) ── */
  if (tid === "terminal") {
    const bg = data.bgColor || "#0d1117", ac = data.accentColor || "#58a6ff", tx = data.textColor || "#e6edf3";
    const muted = "#8b949e", border = "#21262d", bg2 = "#161b22";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <div style={{ background: bg2, borderBottom: `1px solid ${border}`, padding: "9px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#f85149","#f0883e","#3fb950"].map(c=><div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: muted }}>
            {data.providerEmail || "invoice@itcompany.com"} — {docLbl.toLowerCase()}-{data.docNumber || "001"}.pdf
          </div>
        </div>
        <div style={{ padding: "26px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 46, objectFit: "contain", marginBottom: 12 }} />
                : <div style={{ fontFamily: "'JetBrains Mono', monospace", color: muted, fontSize: 11, marginBottom: 8 }}>
                    <span style={{ color: "#6e7681" }}>$ </span><span style={{ color: ac }}>whoami</span>
                  </div>
              }
              <div style={{ fontSize: 19, fontWeight: 700 }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
              <div style={{ fontSize: 12, color: ac, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{data.providerTitle || "IT Service Provider"}</div>
              {data.providerCompany && data.providerName && <div style={{ fontSize: 12, color: muted }}>{data.providerCompany}</div>}
              {providerAddrLine && <div style={{ fontSize: 12, color: muted }}>{providerAddrLine}</div>}
              {data.providerEmail && <div style={{ fontSize: 12, color: muted }}>{data.providerEmail}</div>}
              {data.providerWebsite && <div style={{ fontSize: 12, color: ac }}>{data.providerWebsite}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, color: ac, letterSpacing: -1 }}>{docLbl}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: muted, marginTop: 3 }}>#{data.docNumber || "2024-001"}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Date: {fmtDateShort(data.issueDate)}</div>
              {data.dueDate && <div style={{ fontSize: 11, color: muted }}>Due: {fmtDateShort(data.dueDate)}</div>}
              {data.poNumber && <div style={{ fontSize: 11, color: muted }}>PO: {data.poNumber}</div>}
              <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: sts.bg, border: `1px solid ${sts.border}`, fontSize: 11, fontWeight: 700, color: sts.color }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: sts.color }} />{st}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
            <div style={{ padding: "12px", background: bg2, borderRadius: 8, border: `1px solid ${border}` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: muted, marginBottom: 6 }}><span style={{ color: "#6e7681" }}>// </span>van</div>
              <PartyBlock label="" name={data.providerName} company={data.providerCompany} address={data.providerAddress} postcode={data.providerPostcode} city={data.providerCity} country="" email={data.providerEmail} phone={data.providerPhone} kvk={data.kvkNumber} btw={data.btwNumber} accent={ac} muted={muted} tx={tx} />
            </div>
            <div style={{ padding: "12px", background: bg2, borderRadius: 8, border: `1px solid ${border}` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: muted, marginBottom: 6 }}><span style={{ color: "#6e7681" }}>// </span>factuur_aan</div>
              <PartyBlock label="" name={data.clientName} company={data.clientCompany} address={data.clientAddress} postcode={data.clientPostcode} city={data.clientCity} country={data.clientCountry !== "Nederland" ? data.clientCountry : ""} email={data.clientEmail} phone={data.clientPhone} kvk={data.clientKvk} btw={data.clientBtw} accent={ac} muted={muted} tx={tx} />
            </div>
          </div>

          {/* Project */}
          {(data.projectName || data.techStack || data.periodFrom) && (
            <div style={{ marginBottom: 18, padding: "10px 14px", background: bg2, borderRadius: 8, border: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: muted }}>const project = </span><span style={{ color: "#79c0ff" }}>{"{"}</span>
              {data.projectName && <span> name: <span style={{ color: ac }}>"{data.projectName}"</span>,</span>}
              {data.techStack && <span> stack: <span style={{ color: "#d2a8ff" }}>[{data.techStack}]</span>,</span>}
              {data.periodFrom && <span> period: <span style={{ color: "#3fb950" }}>"{fmtDateShort(data.periodFrom)} – {fmtDateShort(data.periodTo)}"</span></span>}
              <span style={{ color: "#79c0ff" }}> {"}"}</span>
            </div>
          )}

          {/* Items */}
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", border: `1px solid ${border}` }}>
            <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          </div>

          <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
          <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />

          {(data.notes || data.terms) && (
            <div style={{ display: "grid", gridTemplateColumns: data.notes && data.terms ? "1fr 1fr" : "1fr", gap: 12, marginTop: 18 }}>
              {data.notes && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8, border: `1px solid ${border}`, borderLeft: `3px solid ${ac}` }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: muted, marginBottom: 4 }}>// notes</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div></div>}
              {data.terms && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8, border: `1px solid ${border}` }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: muted, marginBottom: 4 }}>// terms</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.terms}</div></div>}
            </div>
          )}

          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 24 }}>
              {[data.providerName || "Service Provider", data.clientName || "Client"].map(n => (
                <div key={n}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted, fontFamily: "'JetBrains Mono', monospace" }}>{n}</div></div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: `1px solid ${border}`, textAlign: "center" }}>
            <LegalFooterLine data={data} muted={muted} accent={ac} />
          </div>
        </div>
        {data.showWatermark && data.watermarkText && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.04, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>{data.watermarkText}</div>
        )}
      </div>
    );
  }

  /* ── TEMPLATE 2: CLEAN (white, IBM-style) ── */
  if (tid === "clean") {
    const bg = data.bgColor || "#ffffff", ac = data.accentColor || "#0f62fe", tx = data.textColor || "#161616";
    const muted = "#6f6f6f", border = "#e0e0e0", bg2 = "#f4f4f4";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <div style={{ height: 5, background: ac }} />
        <div style={{ padding: "34px 42px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 50, objectFit: "contain", marginBottom: 14 }} />
                : <div style={{ width: 50, height: 50, borderRadius: 10, background: ac, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 22, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>IT</div>
              }
              <div style={{ fontSize: 21, fontWeight: 700, color: tx }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
              <div style={{ fontSize: 12, color: ac, fontWeight: 600, marginTop: 2 }}>{data.providerTitle || "IT Service Provider"}</div>
              {data.providerCompany && data.providerName && <div style={{ fontSize: 12, color: muted }}>{data.providerCompany}</div>}
              {providerAddrLine && <div style={{ fontSize: 12, color: muted }}>{providerAddrLine}</div>}
              {data.providerEmail && <div style={{ fontSize: 12, color: muted }}>{data.providerEmail}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: ac, letterSpacing: -1 }}>{docLbl}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: muted, marginTop: 3 }}>#{data.docNumber || "2024-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Date: {fmtDateShort(data.issueDate)}</div>
              {data.dueDate && <div style={{ fontSize: 12, color: muted }}>Due: {fmtDateShort(data.dueDate)}</div>}
              {data.referenceNumber && <div style={{ fontSize: 11, color: muted }}>Uw ref.: {data.referenceNumber}</div>}
              <div style={{ marginTop: 8, display: "inline-flex", padding: "3px 10px", borderRadius: 4, background: sts.bg, border: `1px solid ${sts.border}`, fontSize: 11, fontWeight: 700, color: sts.color }}>{st}</div>
            </div>
          </div>

          <div style={{ height: 1, background: border, marginBottom: 26 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 26 }}>
            <PartyBlock label={tr.pFrom} name={data.providerName} company={data.providerCompany} address={data.providerAddress} postcode={data.providerPostcode} city={data.providerCity} country="" email={data.providerEmail} phone={data.providerPhone} kvk={data.kvkNumber} btw={data.btwNumber} accent={ac} muted={muted} tx={tx} />
            <PartyBlock label={tr.pBillTo} name={data.clientName} company={data.clientCompany} address={data.clientAddress} postcode={data.clientPostcode} city={data.clientCity} country={data.clientCountry !== "Nederland" ? data.clientCountry : ""} email={data.clientEmail} phone={data.clientPhone} kvk={data.clientKvk} btw={data.clientBtw} accent={ac} muted={muted} tx={tx} />
          </div>

          {(data.projectName || data.techStack) && (
            <div style={{ marginBottom: 22, padding: "12px 16px", background: bg2, borderRadius: 8, display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
              {data.projectName && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted }}>Project </span><span style={{ fontWeight: 600, color: tx }}>{data.projectName}</span></div>}
              {data.techStack   && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted }}>Technologie </span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: ac }}>{data.techStack}</span></div>}
              {data.periodFrom  && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted }}>Period </span><span style={{ color: tx }}>{fmtDateShort(data.periodFrom)} – {fmtDateShort(data.periodTo)}</span></div>}
            </div>
          )}

          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 18 }}>
            <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          </div>

          <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
          <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />

          {(data.notes || data.terms) && (
            <div style={{ display: "grid", gridTemplateColumns: data.notes && data.terms ? "1fr 1fr" : "1fr", gap: 12, marginTop: 18 }}>
              {data.notes && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8, borderLeft: `3px solid ${ac}` }}><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 4 }}>Opmerkingen</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div></div>}
              {data.terms && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8 }}><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 4 }}>Betalingsvoorwaarden</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.terms}</div></div>}
            </div>
          )}

          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
              {[data.providerName || "Service Provider", data.clientName || "Client"].map(n => (
                <div key={n}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 11, color: muted }}>{n}</div></div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 22, paddingTop: 12, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: muted }}>
            <LegalFooterLine data={data} muted={muted} accent={ac} />
          </div>
        </div>
        {data.showWatermark && data.watermarkText && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.04, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", letterSpacing: "0.1em" }}>{data.watermarkText}</div>
        )}
      </div>
    );
  }

  /* ── TEMPLATE 3: NEON ── */
  if (tid === "neon") {
    const bg = data.bgColor || "#09090f", ac = data.accentColor || "#00f5c4", tx = data.textColor || "#f0f0ff";
    const muted = "rgba(240,240,255,0.45)", border = `${ac}20`, bg2 = `${ac}06`;
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${ac},#a855f7,${ac},transparent)` }} />
        <div style={{ padding: "28px 34px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              {data.logo ? <img src={data.logo} alt="" style={{ height: 44, objectFit: "contain", marginBottom: 10 }} /> : <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: ac, marginBottom: 8, textShadow: `0 0 20px ${ac}60` }}>IT</div>}
              <div style={{ fontSize: 18, fontWeight: 700, color: tx }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
              <div style={{ fontSize: 12, color: ac, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{data.providerTitle || "IT Service Provider"}</div>
              {data.providerEmail && <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{data.providerEmail}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: ac, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 30px ${ac}50` }}>{docLbl}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: muted, marginTop: 3 }}>#{data.docNumber || "2024-001"}</div>
              <div style={{ fontSize: 11, color: muted }}>{fmtDateShort(data.issueDate)}</div>
              {data.dueDate && <div style={{ fontSize: 11, color: muted }}>Due: {fmtDateShort(data.dueDate)}</div>}
              <div style={{ marginTop: 6, display: "inline-flex", padding: "3px 10px", borderRadius: 20, background: sts.bg, border: `1px solid ${sts.border}`, fontSize: 11, fontWeight: 700, color: sts.color }}>{st}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { t: "// from", n: data.providerName, co: data.providerCompany, addr: providerAddrLine, extra: [data.kvkNumber && `KvK: ${data.kvkNumber}`, data.btwNumber && `BTW: ${data.btwNumber}`].filter(Boolean) },
              { t: "// bill_to", n: data.clientName, co: data.clientCompany, addr: clientAddrLine, extra: [data.clientBtw && `BTW: ${data.clientBtw}`].filter(Boolean) },
            ].map(p => (
              <div key={p.t} style={{ padding: "12px 14px", background: bg2, borderRadius: 8, border: `1px solid ${border}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ac, marginBottom: 6 }}>{p.t}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: tx }}>{p.co || p.n || "—"}</div>
                {p.co && p.n && <div style={{ fontSize: 11, color: muted }}>{p.n}</div>}
                {p.addr && <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{p.addr}</div>}
                {p.extra.map((e,i) => <div key={i} style={{ fontSize: 11, color: muted }}>{e}</div>)}
              </div>
            ))}
          </div>
          {data.projectName && <div style={{ marginBottom: 16, padding: "10px 12px", background: bg2, borderRadius: 8, border: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            <span style={{ color: muted }}>opdracht: </span><span style={{ color: ac }}>"{data.projectName}"</span>
            {data.techStack && <span><span style={{ color: muted }}> — stack: </span><span style={{ color: "#d2a8ff" }}>[{data.techStack}]</span></span>}
          </div>}
          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 14 }}>
            <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          </div>
          <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
          <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          {data.notes && <div style={{ marginTop: 14, padding: "10px 12px", background: bg2, borderRadius: 8, border: `1px solid ${border}`, borderLeft: `2px solid ${ac}`, fontSize: 11, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}
          {data.showSignature && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 22 }}>{[data.providerName || "Service Provider", data.clientName || "Client"].map(n => <div key={n}><div style={{ height: 1, background: border, marginBottom: 5 }} /><div style={{ fontSize: 10, color: muted, fontFamily: "'JetBrains Mono', monospace" }}>{n}</div></div>)}</div>}
          <div style={{ marginTop: 18, paddingTop: 10, borderTop: `1px solid ${border}`, textAlign: "center" }}><LegalFooterLine data={data} muted={muted} accent={ac} /></div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${ac},#a855f7,${ac},transparent)`, opacity: 0.3 }} />
        {data.showWatermark && data.watermarkText && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.04, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ── TEMPLATE 4: BLUEPRINT ── */
  if (tid === "blueprint") {
    const bg = data.bgColor || "#0a1628", ac = data.accentColor || "#4db8ff", tx = data.textColor || "#e8f4ff";
    const muted = "rgba(232,244,255,0.5)", border = `${ac}25`, bg2 = `${ac}07`;
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative", backgroundImage: "radial-gradient(circle,rgba(77,184,255,0.05) 1px,transparent 1px)", backgroundSize: "20px 20px" }}>
        <div style={{ padding: "28px 34px" }}>
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: "14px 18px", marginBottom: 22, background: bg2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                {data.logo && <img src={data.logo} alt="" style={{ height: 38, objectFit: "contain", marginBottom: 10, filter: "invert(1) sepia(1) saturate(2) hue-rotate(190deg)" }} />}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: ac, letterSpacing: 2, textTransform: "uppercase" }}>{docLbl}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: muted, marginTop: 2 }}>REF: {data.docNumber || "2024-001"} · {fmtDateShort(data.issueDate)} · {data.paymentTermDays || "30"} dgn</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: tx }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
                <div style={{ fontSize: 11, color: ac, fontFamily: "'JetBrains Mono', monospace" }}>{data.providerTitle || "IT Service Provider"}</div>
                {data.kvkNumber && <div style={{ fontSize: 10, color: muted }}>KvK: {data.kvkNumber}</div>}
                {data.btwNumber && <div style={{ fontSize: 10, color: muted }}>BTW: {data.btwNumber}</div>}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { l: "CLIENT",     v: data.clientCompany || data.clientName || "—",  s: clientAddrLine },
              { l: "PROJECT",   v: data.projectName || "—",                        s: data.techStack },
              { l: "PERIOD",   v: data.periodFrom ? `${fmtDateShort(data.periodFrom)}` : fmtDateShort(data.issueDate), s: data.periodTo ? `to ${fmtDateShort(data.periodTo)}` : undefined },
              { l: "STATUS",    v: st,                                              s: data.dueDate ? `Due ${fmtDateShort(data.dueDate)}` : undefined },
            ].map(f => (
              <div key={f.l} style={{ border: `1px solid ${border}`, borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: ac, marginBottom: 4 }}>{f.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: tx, wordBreak: "break-word" }}>{f.v}</div>
                {f.s && <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{f.s}</div>}
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "7px 12px", background: bg2, borderBottom: `1px solid ${border}` }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ac, letterSpacing: "0.15em" }}>WORK_ITEMS[]</span>
            </div>
            <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          </div>
          <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
          <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          {data.notes && <div style={{ marginTop: 14, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 12px" }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: ac, marginBottom: 5 }}>NOTES</div><div style={{ fontSize: 11, color: muted, lineHeight: 1.7 }}>{data.notes}</div></div>}
          {data.showSignature && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 22 }}>{[data.providerName || "Service Provider", data.clientName || "Client"].map(n => <div key={n}><div style={{ height: 1, background: border, marginBottom: 5 }} /><div style={{ fontSize: 10, color: muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>{n.toUpperCase()}</div></div>)}</div>}
          <div style={{ marginTop: 16, paddingTop: 10, borderTop: `1px solid ${border}`, textAlign: "center" }}><LegalFooterLine data={data} muted={muted} accent={ac} /></div>
        </div>
        {data.showWatermark && data.watermarkText && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.03, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ── TEMPLATE 5: MINIMAL ── */
  if (tid === "minimal") {
    const bg = data.bgColor || "#ffffff", ac = data.accentColor || "#000000", tx = data.textColor || "#111111";
    const muted = "#6b7280", border = "#f3f4f6", bg2 = "#f9fafb";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "46px 50px 38px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <div>
              {data.logo ? <img src={data.logo} alt="" style={{ height: 40, objectFit: "contain", marginBottom: 14 }} /> : <div style={{ fontSize: 12, fontWeight: 700, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{data.providerName?.split(" ").map(w=>w[0]).join("") || "IT"}</div>}
              <div style={{ fontSize: 21, fontWeight: 600, color: tx }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.providerTitle || "IT Service Provider"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: muted, marginBottom: 6 }}>{docLbl}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: tx }}>{data.docNumber || "2024-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>{fmtDate(data.issueDate)}</div>
              {data.dueDate && <div style={{ fontSize: 12, color: muted }}>Due {fmtDate(data.dueDate)}</div>}
              <div style={{ marginTop: 6, display: "inline-flex", padding: "3px 10px", borderRadius: 20, background: sts.bg, fontSize: 10, fontWeight: 700, color: sts.color }}>{st}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            <PartyBlock label={tr.pFrom} name={data.providerName} company={data.providerCompany} address={data.providerAddress} postcode={data.providerPostcode} city={data.providerCity} country="" email={data.providerEmail} phone={data.providerPhone} kvk={data.kvkNumber} btw={data.btwNumber} accent={ac} muted={muted} tx={tx} />
            <PartyBlock label={tr.pTo} name={data.clientName} company={data.clientCompany} address={data.clientAddress} postcode={data.clientPostcode} city={data.clientCity} country={data.clientCountry !== "Nederland" ? data.clientCountry : ""} email={data.clientEmail} phone={data.clientPhone} kvk={data.clientKvk} btw={data.clientBtw} accent={ac} muted={muted} tx={tx} />
          </div>
          {data.projectName && <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${border}`, fontSize: 13 }}>
            <span style={{ color: muted }}>Project: </span><span style={{ fontWeight: 600, color: tx }}>{data.projectName}</span>
            {data.techStack && <span style={{ color: muted }}> · </span>}
            {data.techStack && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: tx }}>{data.techStack}</span>}
          </div>}
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
            <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          </div>
          <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
          <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
          {data.notes && <div style={{ marginTop: 22, fontSize: 12, color: muted, lineHeight: 1.8 }}>{data.notes}</div>}
          {data.terms && <div style={{ marginTop: 10, fontSize: 11, color: muted, lineHeight: 1.8, borderTop: `1px solid ${border}`, paddingTop: 10 }}>{data.terms}</div>}
          {data.showSignature && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>{[data.providerName || "Service Provider", data.clientName || "Client"].map(n => <div key={n}><div style={{ height: 1, background: "#e5e7eb", marginBottom: 6 }} /><div style={{ fontSize: 11, color: muted }}>{n}</div></div>)}</div>}
          <div style={{ marginTop: 26, paddingTop: 12, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: muted }}>
            <LegalFooterLine data={data} muted={muted} accent={ac} />
          </div>
        </div>
        {data.showWatermark && data.watermarkText && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: tx, opacity: 0.03, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ── TEMPLATE 6: AGENCY (bold split) ── */
  const bg = data.bgColor || "#ffffff", ac = data.accentColor || "#6c63ff", tx = data.textColor || "#1a1a2e";
  const muted = "#6b7280", border = "#e5e7eb", bg2 = "#f9f9ff";
  return (
    <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Inter', sans-serif", borderRadius: 12, overflow: "hidden", position: "relative" }}>
      <div style={{ background: ac, padding: "26px 36px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            {data.logo ? <img src={data.logo} alt="" style={{ height: 42, objectFit: "contain", marginBottom: 10, filter: "brightness(0) invert(1)" }} /> : <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>IT</div>}
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{data.providerName || data.providerCompany || "Uw naam"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{data.providerTitle || "IT Service Provider"}{data.providerCompany && data.providerName ? ` · ${data.providerCompany}` : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{docLbl}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>#{data.docNumber || "2024-001"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{fmtDateShort(data.issueDate)}</div>
            {data.dueDate && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Due: {fmtDateShort(data.dueDate)}</div>}
            <div style={{ marginTop: 6, display: "inline-flex", padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 700, color: "#fff" }}>{st}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "26px 36px 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
          <div style={{ padding: "12px 14px", background: bg2, borderRadius: 10, border: `1px solid ${border}` }}>
            <PartyBlock label={tr.pFrom} name={data.providerName} company={data.providerCompany} address={data.providerAddress} postcode={data.providerPostcode} city={data.providerCity} country="" email={data.providerEmail} phone={data.providerPhone} kvk={data.kvkNumber} btw={data.btwNumber} accent={ac} muted={muted} tx={tx} />
          </div>
          <div style={{ padding: "12px 14px", background: bg2, borderRadius: 10, border: `1px solid ${border}` }}>
            <PartyBlock label={tr.pBillTo} name={data.clientName} company={data.clientCompany} address={data.clientAddress} postcode={data.clientPostcode} city={data.clientCity} country={data.clientCountry !== "Nederland" ? data.clientCountry : ""} email={data.clientEmail} phone={data.clientPhone} kvk={data.clientKvk} btw={data.clientBtw} accent={ac} muted={muted} tx={tx} />
          </div>
        </div>
        {(data.projectName || data.techStack) && <div style={{ marginBottom: 18, padding: "10px 14px", background: `${ac}08`, borderRadius: 10, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", fontSize: 13 }}>
          {data.projectName && <div><span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: ac }}>Project </span><span style={{ fontWeight: 600, color: tx, marginLeft: 4 }}>{data.projectName}</span></div>}
          {data.techStack && <div><span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: ac }}>Stack </span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: ac, marginLeft: 4 }}>{data.techStack}</span></div>}
        </div>}
        <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 18 }}>
          <ItemsTable data={data} sym={sym} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
        </div>
        <BtwBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} sym={sym} tr={tr} />
        <PaymentBlock data={data} accent={ac} muted={muted} border={border} bg2={bg2} tr={tr} />
        {(data.notes || data.terms) && <div style={{ display: "grid", gridTemplateColumns: data.notes && data.terms ? "1fr 1fr" : "1fr", gap: 12, marginTop: 18 }}>
          {data.notes && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8, borderLeft: `3px solid ${ac}` }}><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: ac, marginBottom: 4 }}>Opmerkingen</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div></div>}
          {data.terms && <div style={{ padding: "10px 12px", background: bg2, borderRadius: 8 }}><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: ac, marginBottom: 4 }}>Voorwaarden</div><div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.terms}</div></div>}
        </div>}
        {data.showSignature && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 26 }}>{[data.providerName || "Service Provider", data.clientName || "Client"].map(n => <div key={n}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 11, color: muted }}>{n}</div></div>)}</div>}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${border}`, textAlign: "center" }}><LegalFooterLine data={data} muted={muted} accent={ac} /></div>
      </div>
      {data.showWatermark && data.watermarkText && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.04, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
    </div>
  );
}
