import { NextRequest, NextResponse } from "next/server";

// Upstash Redis HTTP helpers — no SDK needed, plain fetch
async function redisCmd(url: string, token: string, ...args: (string | number)[]) {
  const res = await fetch(`${url}/${args.map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  return res.json();
}

async function incr(url: string, token: string, key: string) {
  return redisCmd(url, token, "INCR", key);
}

export async function POST(req: NextRequest) {
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Graceful no-op if env vars not configured yet
  if (!redisUrl || !redisToken) {
    return NextResponse.json({ ok: false, reason: "Redis not configured" });
  }

  let body: { mode?: string; lang?: string; docType?: string };
  try { body = await req.json(); } catch { body = {}; }

  const mode    = body.mode    || "unknown";
  const lang    = body.lang    || "unknown";
  const docType = body.docType || "unknown";

  // Country from Vercel edge headers (auto-populated on Vercel deployments)
  const country = req.headers.get("x-vercel-ip-country") || "unknown";

  // Today's date key for daily chart
  const today = new Date().toISOString().split("T")[0];

  try {
    await Promise.all([
      incr(redisUrl, redisToken, "billify:total"),
      incr(redisUrl, redisToken, `billify:mode:${mode}`),
      incr(redisUrl, redisToken, `billify:lang:${lang}`),
      incr(redisUrl, redisToken, `billify:doctype:${docType}`),
      incr(redisUrl, redisToken, `billify:daily:${today}`),
      incr(redisUrl, redisToken, `billify:country:${country}`),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Track error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
