"use client";
import React from "react";
import { TenancyData } from "../../types";
import { calcTenancyTotal as calcTotal, fmtDate } from "../../utils/calc";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: TenancyData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  lang?: Lang;
}

const STATUS: Record<string, { bg: string; color: string }> = {
  Paid:    { bg: "#d1fae5", color: "#065f46" },
  Partial: { bg: "#fef3c7", color: "#92400e" },
  Pending: { bg: "#dbeafe", color: "#1e40af" },
  Overdue: { bg: "#fee2e2", color: "#991b1b" },
};

function ChargeRows({ data, accent, muted, border, sym, tr }: {
  data: TenancyData; accent: string; muted: string; border: string; sym: string; tr: Tr;
}) {
  const fmt = (v: string) => `${sym}${parseFloat(v).toFixed(2)}`;
  const rows = [
    { label: tr.pMonthlyRent,                           val: data.rentAmount,  main: true },
    { label: tr.pLateFee,                               val: data.lateFee              },
    { label: tr.pParkingFee,                            val: data.parkingFee           },
    { label: data.utilitiesLabel  || tr.utilities,      val: data.utilitiesAmount      },
    { label: data.maintenanceLabel|| tr.maintenance,    val: data.maintenanceFee       },
    { label: tr.pSecurityDeposit,                       val: data.depositAmount        },
    { label: data.otherLabel      || tr.otherFee,       val: data.otherFee             },
    { label: tr.pDiscount,                              val: data.discount, red: true  },
  ].filter(r => parseFloat(r.val) > 0);

  return (
    <>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
          <span style={{ color: r.main ? undefined : muted, fontWeight: r.main ? 600 : 400 }}>{r.label}</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: r.main ? 700 : 400, color: r.red ? "#dc2626" : r.main ? accent : muted }}>
            {r.red ? `−${fmt(r.val)}` : fmt(r.val)}
          </span>
        </div>
      ))}
    </>
  );
}

export default function ReceiptPreview({ data, previewRef, lang = "en" }: Props) {
  const tr  = T[lang] as Tr;
  const periodStr = (from: string, to: string) =>
    from && to ? `${fmtDate(from)} – ${fmtDate(to)}` : from ? `${fmtDate(from)}` : "";
  const total  = calcTotal(data);
  const sym    = data.currencySymbol || "$";
  const fmt    = (v: number | string) => `${sym}${parseFloat(String(v)).toFixed(2)}`;
  const period = periodStr(data.periodFrom, data.periodTo);
  const propLine = [data.propertyAddress, data.propertyUnit].filter(Boolean).join(", ");
  const st     = data.paymentStatus || "Paid";
  const statusBadge = STATUS[st] || STATUS.Paid;
  const tid    = data.templateId;

  /* ───── EXECUTIVE ───── deep navy, gold accents, authority */
  if (tid === "executive") {
    const bg = data.bgColor || "#0f1c2e", ac = data.accentColor || "#c9a84c", tx = data.textColor || "#e8dfc8";
    const border = "rgba(201,168,76,0.2)", muted = "rgba(232,223,200,0.5)";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        {/* Gold top stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${ac}, #e8c96a, ${ac})` }} />
        <div style={{ padding: "36px 42px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 52, objectFit: "contain", marginBottom: 12, filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg)", opacity: 0.9 }} />
                : <div style={{ width: 48, height: 48, borderRadius: 10, background: ac, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 22, fontWeight: 900, color: bg }}>🏠</div>
              }
              <div style={{ fontSize: 20, fontWeight: 700, color: tx }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
              {data.landlordCompany && data.landlordName && <div style={{ fontSize: 12, color: muted }}>{data.landlordCompany}</div>}
              {data.landlordAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.landlordAddress}</div>}
              {data.landlordPhone   && <div style={{ fontSize: 12, color: muted }}>{data.landlordPhone}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ac, marginBottom: 6 }}>{tr.pTenancyReceipt}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace", letterSpacing: -1 }}>{data.receiptNumber || "RR-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Issued: {fmtDate(data.issueDate)}</div>
              <div style={{ marginTop: 8, display: "inline-flex", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
            </div>
          </div>

          {/* Gold divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${ac}, transparent)`, marginBottom: 24 }} />

          {/* Parties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 8 }}>{tr.pReceivedFrom}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: tx }}>{data.tenantName || "—"}</div>
              <div style={{ fontSize: 12, color: muted, lineHeight: 1.8 }}>{data.tenantEmail}<br />{data.tenantPhone}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 8 }}>{tr.pPropertyLabel}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: tx }}>{propLine || "—"}</div>
              <div style={{ fontSize: 12, color: muted }}>{data.propertyType}</div>
              {period && <div style={{ fontSize: 11, color: ac, marginTop: 4, fontStyle: "italic" }}>{period}</div>}
            </div>
          </div>

          {/* Payment info pills */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { l: tr.method,      v: data.paymentMethod || "—" },
              { l: tr.pPaidOn,     v: fmtDate(data.paymentDate) },
            ].map(p => (
              <div key={p.l} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${border}`, flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 3 }}>{p.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: tx }}>{p.v}</div>
              </div>
            ))}
          </div>

          {/* Charges */}
          <ChargeRows data={data} accent={ac} muted={muted} border={border} sym={sym} tr={tr} />

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 4 }}>{tr.pTotalPaid}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace" }}>{fmt(total)}</div>
            </div>
          </div>

          {data.notes && <div style={{ marginTop: 22, padding: "12px 16px", borderLeft: `3px solid ${ac}`, background: "rgba(201,168,76,0.07)", borderRadius: "0 8px 8px 0", fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}
          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>
              {[tr.pLandlord, tr.pTenant].map(s => (
                <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: `1px solid ${border}`, textAlign: "center", fontSize: 11, color: muted, fontStyle: "italic" }}>
            {data.footer || "This is an official tenancy receipt. Please retain for your records."}
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${ac}, transparent)`, opacity: 0.4 }} />
        {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ───── MINIMAL ───── pure white, fine lines, editorial */
  if (tid === "minimal") {
    const bg = data.bgColor || "#ffffff", ac = data.accentColor || "#111827", tx = data.textColor || "#111827";
    const muted = "#9ca3af", border = "#f3f4f6";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "44px 48px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 44, objectFit: "contain", marginBottom: 14 }} />
                : <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, color: ac }}>{data.landlordName?.charAt(0) || "L"}</div>
              }
              <div style={{ fontSize: 19, fontWeight: 600, color: tx, marginTop: 4 }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
              {data.landlordAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.landlordAddress}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: muted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{tr.pTenancyReceipt}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: tx, fontFamily: "'DM Mono',monospace" }}>{data.receiptNumber || "RR-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{fmtDate(data.issueDate)}</div>
              <div style={{ marginTop: 8, display: "inline-flex", padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
            </div>
          </div>

          <div style={{ height: 1, background: "#e5e7eb", marginBottom: 32 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: muted, marginBottom: 8 }}>{tr.pReceivedFrom}</div>
              <div style={{ fontWeight: 600, color: tx }}>{data.tenantName || "—"}</div>
              <div style={{ fontSize: 12, color: muted, lineHeight: 1.8, marginTop: 2 }}>{data.tenantEmail}{data.tenantPhone && <><br />{data.tenantPhone}</>}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: muted, marginBottom: 8 }}>{tr.pForProperty}</div>
              <div style={{ fontWeight: 600, color: tx }}>{propLine || "—"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.propertyType}</div>
              {period && <div style={{ fontSize: 12, color: ac, marginTop: 3 }}>{period}</div>}
            </div>
          </div>

          <ChargeRows data={data} accent={ac} muted={muted} border={border} sym={sym} tr={tr} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 20, paddingTop: 16, borderTop: "2px solid " + tx }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: tx }}>{tr.pTotalPaidShort}</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: tx, fontFamily: "'DM Mono',monospace" }}>{fmt(total)}</span>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 20, fontSize: 12, color: muted }}>
            <span><strong style={{ color: tx }}>{tr.pPaidVia}</strong> {data.paymentMethod || "—"}</span>
            {data.paymentDate && <span><strong style={{ color: tx }}>On:</strong> {fmtDate(data.paymentDate)}</span>}
          </div>

          {data.notes && <div style={{ marginTop: 24, fontSize: 12, color: muted, lineHeight: 1.8, borderTop: `1px solid ${border}`, paddingTop: 16 }}>{data.notes}</div>}
          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>
              {[tr.pLandlord, tr.pTenant].map(s => (
                <div key={s}><div style={{ height: 1, background: "#e5e7eb", marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: muted }}>
            <span>{data.footer || "Official tenancy receipt — retain for your records."}</span>
            <span>{data.receiptNumber}</span>
          </div>
        </div>
        {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: tx, opacity: 0.04, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ───── URBAN ───── dark, modern, split header */
  if (tid === "urban") {
    const bg = data.bgColor || "#18181b", ac = data.accentColor || "#a3e635", tx = data.textColor || "#f4f4f5";
    const border = "rgba(255,255,255,0.08)", muted = "rgba(244,244,245,0.45)";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        {/* Split header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", background: "#09090b", padding: "28px 36px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {data.logo
              ? <img src={data.logo} alt="" style={{ height: 44, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              : <div style={{ width: 44, height: 44, borderRadius: 12, background: ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#09090b" }}>🏢</div>
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: tx }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
              {data.landlordAddress && <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{data.landlordAddress}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: ac, marginBottom: 4 }}>{tr.pTenancyReceipt}</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'DM Mono',monospace", color: tx }}>{data.receiptNumber || "RR-001"}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{fmtDate(data.issueDate)}</div>
          </div>
        </div>

        {/* Accent bar */}
        <div style={{ height: 3, background: ac }} />

        <div style={{ padding: "28px 36px 32px" }}>
          {/* Status + payment row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: statusBadge.bg, color: statusBadge.color, fontSize: 12, fontWeight: 700 }}>{st}</div>
            {[
              { l: tr.method,  v: data.paymentMethod || "—" },
              { l: tr.pPaidOn, v: fmtDate(data.paymentDate) },
            ].map(p => (
              <div key={p.l} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${border}`, flex: 1, minWidth: 100 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 2 }}>{p.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: tx }}>{p.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 8 }}>{tr.pTenantLabel}</div>
              <div style={{ fontWeight: 600, color: tx }}>{data.tenantName || "—"}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.8 }}>{data.tenantEmail}<br />{data.tenantPhone}</div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 8 }}>{tr.pPropertyLabel}</div>
              <div style={{ fontWeight: 600, color: tx }}>{propLine || "—"}</div>
              <div style={{ fontSize: 11, color: muted }}>{data.propertyType}</div>
              {period && <div style={{ fontSize: 11, color: ac, marginTop: 4 }}>{period}</div>}
            </div>
          </div>

          <ChargeRows data={data} accent={ac} muted={muted} border={border} sym={sym} tr={tr} />

          <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, background: "#09090b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: muted }}>{tr.pTotalPaid}</span>
            <span style={{ fontSize: 30, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace" }}>{fmt(total)}</span>
          </div>

          {data.notes && <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 10, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}
          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
              {[tr.pLandlord, tr.pTenant].map(s => (
                <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, fontSize: 10, color: muted, textAlign: "center" }}>
            {data.footer || "Official tenancy receipt — retain for your records."}
          </div>
        </div>
        {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ───── OFFICIAL ───── government-style, formal, serif */
  if (tid === "official") {
    const bg = data.bgColor || "#fefce8", ac = data.accentColor || "#1e40af", tx = data.textColor || "#1e293b";
    const muted = "#64748b", border = "#e2e8f0";
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'Fraunces',serif", borderRadius: 16, overflow: "hidden", position: "relative", border: `2px solid ${ac}` }}>
        {/* Official header stripe */}
        <div style={{ background: ac, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {data.logo
              ? <img src={data.logo} alt="" style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              : <span style={{ fontSize: 24 }}>🏛️</span>
            }
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
              {data.landlordCompany && data.landlordName && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{data.landlordCompany}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>{tr.pOfficialReceipt}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>{data.receiptNumber || "RR-001"}</div>
          </div>
        </div>

        {/* Decorative border strip */}
        <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${ac} 0, ${ac} 10px, #fefce8 10px, #fefce8 20px)` }} />

        <div style={{ padding: "28px 40px 32px" }}>
          {/* Date + Status row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: `2px double ${ac}` }}>
            <div style={{ fontSize: 13, color: muted, fontFamily: "'DM Sans',sans-serif" }}>
              <strong style={{ color: tx }}>{tr.pDateIssued}</strong> {fmtDate(data.issueDate)}
              {data.paymentDate && <span style={{ marginLeft: 20 }}><strong style={{ color: tx }}>{tr.pPaymentDateLabel}</strong> {fmtDate(data.paymentDate)}</span>}
            </div>
            <div style={{ padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color, fontFamily: "'DM Sans',sans-serif" }}>{st}</div>
          </div>

          {/* Parties in classic table style */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 24, fontFamily: "'DM Sans',sans-serif" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 8, borderBottom: `1px solid ${border}`, paddingBottom: 4 }}>{tr.pTenantDetails}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{data.tenantName || "—"}</div>
              <div style={{ fontSize: 12, color: muted, lineHeight: 1.8 }}>{data.tenantEmail}<br />{data.tenantPhone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 8, borderBottom: `1px solid ${border}`, paddingBottom: 4 }}>{tr.pPropertyDetails}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{propLine || "—"}</div>
              <div style={{ fontSize: 12, color: muted }}>{data.propertyType}</div>
              {period && <div style={{ fontSize: 12, color: ac, marginTop: 4, fontStyle: "italic" }}>{period}</div>}
            </div>
          </div>

          {/* Formal table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: ac }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fff" }}>{tr.pDescription}</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fff" }}>{tr.pGrAmount}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: tr.pMonthlyRent, val: data.rentAmount, bold: true },
                ...[
                  { label: tr.pLateFee,                              val: data.lateFee },
                  { label: tr.pParkingFee,                           val: data.parkingFee },
                  { label: data.utilitiesLabel  || tr.utilities,     val: data.utilitiesAmount },
                  { label: data.maintenanceLabel|| tr.maintenance,   val: data.maintenanceFee },
                  { label: tr.pSecurityDeposit,                      val: data.depositAmount },
                  { label: data.otherLabel      || tr.otherFee,      val: data.otherFee },
                ].filter(r => parseFloat(r.val) > 0),
                ...(parseFloat(data.discount) > 0 ? [{ label: tr.pDiscount, val: data.discount, red: true }] : []),
              ].map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "rgba(30,64,175,0.03)" : "transparent", borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "9px 12px", color: tx, fontWeight: (r as { bold?: boolean }).bold ? 700 : 400 }}>{r.label}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontFamily: "'DM Mono',monospace", color: (r as { red?: boolean }).red ? "#dc2626" : tx, fontWeight: (r as { bold?: boolean }).bold ? 700 : 400 }}>
                    {(r as { red?: boolean }).red ? `−${fmt(parseFloat(r.val))}` : fmt(parseFloat(r.val))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: `${ac}15` }}>
                <td style={{ padding: "12px", fontWeight: 700, fontSize: 15, color: ac, fontFamily: "'Fraunces',serif" }}>TOTAL PAID</td>
                <td style={{ padding: "12px", textAlign: "right", fontFamily: "'DM Mono',monospace", fontWeight: 900, fontSize: 20, color: ac }}>{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>

          <div style={{ fontSize: 12, color: muted, fontFamily: "'DM Sans',sans-serif" }}>
            <strong style={{ color: tx }}>{tr.pPaymentMethodLabel}</strong> {data.paymentMethod || "—"}
          </div>

          {data.notes && <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(30,64,175,0.06)", borderLeft: `3px solid ${ac}`, borderRadius: "0 8px 8px 0", fontSize: 12, color: muted, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }}>{data.notes}</div>}
          {data.terms && <div style={{ marginTop: 10, padding: "10px 14px", fontSize: 11, color: muted, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7, borderTop: `1px solid ${border}` }}><strong style={{ color: tx }}>Terms:</strong> {data.terms}</div>}
          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>
              {[tr.pLandlord, tr.pTenant].map(s => (
                <div key={s}><div style={{ height: 1, background: ac, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted, fontFamily: "'DM Sans',sans-serif" }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${ac} 0, ${ac} 10px, ${bg} 10px, ${bg} 20px)` }} />
        <div style={{ padding: "10px 40px", textAlign: "center", fontSize: 11, color: muted, background: `${ac}08`, fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>
          {data.footer || "This is an official tenancy receipt. Please retain for your records."}
        </div>
        {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ───── BOUTIQUE ───── soft, warm, property-management brand feel */
  if (tid === "boutique") {
    const bg = data.bgColor || "#fff8f3", ac = data.accentColor || "#c2410c", tx = data.textColor || "#1c1917";
    const muted = "#78716c", border = "#e7e5e4", light = `${ac}10`;
    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        {/* Warm top bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${ac}, #ea580c, #f97316)` }} />
        <div style={{ padding: "32px 40px 28px" }}>
          {/* Logo + company */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 52, objectFit: "contain", marginBottom: 10 }} />
                : <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏡</div>
                  </div>
              }
              <div style={{ fontSize: 20, fontWeight: 700, color: tx }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
              {data.landlordCompany && data.landlordName && <div style={{ fontSize: 12, color: muted }}>{data.landlordCompany}</div>}
              {data.landlordAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.landlordAddress}</div>}
              {data.landlordPhone   && <div style={{ fontSize: 12, color: muted }}>{data.landlordPhone}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: ac, letterSpacing: -0.5 }}>{tr.pRentReceipt}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: muted, marginTop: 3 }}>{data.receiptNumber || "RR-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{fmtDate(data.issueDate)}</div>
              <div style={{ marginTop: 8, display: "inline-flex", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
            </div>
          </div>

          {/* Warm card row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, background: light }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>{tr.pTenantLabel}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{data.tenantName || "—"}</div>
              <div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.tenantEmail}<br />{data.tenantPhone}</div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 12, background: light }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>{tr.pPropertyLabel}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{propLine || "—"}</div>
              <div style={{ fontSize: 12, color: muted }}>{data.propertyType}</div>
              {period && <div style={{ fontSize: 11, color: ac, marginTop: 3, fontWeight: 600 }}>{period}</div>}
            </div>
          </div>

          {/* Payment pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { l: tr.method, v: data.paymentMethod || "—" },
              { l: tr.pPaid,  v: fmtDate(data.paymentDate) },
            ].map(p => (
              <div key={p.l} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${border}`, background: "#fff", fontSize: 12 }}>
                <span style={{ color: muted }}>{p.l}: </span><strong style={{ color: tx }}>{p.v}</strong>
              </div>
            ))}
          </div>

          <ChargeRows data={data} accent={ac} muted={muted} border={border} sym={sym} tr={tr} />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: ac, display: "flex", gap: 24, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{tr.pTotalPaidShort}</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'DM Mono',monospace" }}>{fmt(total)}</span>
            </div>
          </div>

          {data.notes && <div style={{ marginTop: 20, padding: "12px 16px", borderLeft: `3px solid ${ac}`, background: `${ac}08`, borderRadius: "0 8px 8px 0", fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}
          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
              {[tr.pLandlord, tr.pTenant].map(s => (
                <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${border}`, textAlign: "center", fontSize: 11, color: muted }}>
            {data.footer || "Thank you — please retain this receipt for your records."}
          </div>
        </div>
        {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
      </div>
    );
  }

  /* ───── SIMPLE ───── plain, no-frills, works everywhere */
  const bg = data.bgColor || "#ffffff", ac = data.accentColor || "#374151", tx = data.textColor || "#111827";
  const muted = "#6b7280", border = "#e5e7eb";
  return (
    <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative", border: `1px solid ${border}` }}>
      <div style={{ padding: "32px 36px 28px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: `2px solid ${ac}`, marginBottom: 24 }}>
          <div>
            {data.logo ? <img src={data.logo} alt="" style={{ height: 44, objectFit: "contain", marginBottom: 10 }} /> : null}
            <div style={{ fontSize: 18, fontWeight: 700, color: tx }}>{data.landlordName || data.landlordCompany || tr.pLandlord}</div>
            {data.landlordAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.landlordAddress}</div>}
            {data.landlordPhone   && <div style={{ fontSize: 12, color: muted }}>{data.landlordPhone}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 4 }}>{tr.pTenancyReceipt}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: tx, fontFamily: "'DM Mono',monospace" }}>{data.receiptNumber || "RR-001"}</div>
            <div style={{ fontSize: 12, color: muted }}>{fmtDate(data.issueDate)}</div>
            <div style={{ marginTop: 6, display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 22, fontSize: 13 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 6 }}>{tr.pReceivedFrom}</div>
            <div style={{ fontWeight: 600, color: tx }}>{data.tenantName || "—"}</div>
            <div style={{ color: muted, lineHeight: 1.8 }}>{data.tenantEmail}{data.tenantPhone && <><br />{data.tenantPhone}</>}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: 6 }}>{tr.pPropertyLabel}</div>
            <div style={{ fontWeight: 600, color: tx }}>{propLine || "—"}</div>
            <div style={{ color: muted }}>{data.propertyType}</div>
            {period && <div style={{ color: ac, fontWeight: 600, marginTop: 2 }}>{period}</div>}
          </div>
        </div>

        <ChargeRows data={data} accent={ac} muted={muted} border={border} sym={sym} tr={tr} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, paddingTop: 14, borderTop: `2px solid ${ac}` }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{tr.pTotalPaidShort}</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace" }}>{fmt(total)}</span>
        </div>
        <div style={{ fontSize: 12, color: muted, marginTop: 10 }}>
          <strong style={{ color: tx }}>{tr.pPaymentMethodLabel}</strong> {data.paymentMethod || "—"}
          {data.paymentDate && <span style={{ marginLeft: 16 }}><strong style={{ color: tx }}>{tr.pOn}</strong> {fmtDate(data.paymentDate)}</span>}
        </div>
        {data.notes && <div style={{ marginTop: 18, padding: "12px", background: "#f9fafb", borderRadius: 8, fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}
        {data.showSignature && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
            {[tr.pLandlord, tr.pTenant].map(s => (
              <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 20, paddingTop: 12, borderTop: `1px solid ${border}`, textAlign: "center", fontSize: 11, color: muted }}>
          {data.footer || "Official tenancy receipt — retain for your records."}
        </div>
      </div>
      {data.showWatermark && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: tx, opacity: 0.04, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>}
    </div>
  );
}
