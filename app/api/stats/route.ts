import { NextRequest, NextResponse } from "next/server";

async function redisGet(url: string, token: string, key: string): Promise<number> {
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    // revalidate every 60 s on Vercel edge cache
    next: { revalidate: 60 },
  } as RequestInit);
  if (!res.ok) return 0;
  const { result } = await res.json();
  return parseInt(result || "0", 10) || 0;
}

async function redisKeys(url: string, token: string, pattern: string): Promise<string[]> {
  const res = await fetch(`${url}/keys/${encodeURIComponent(pattern)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const { result } = await res.json();
  return result || [];
}

export async function GET(req: NextRequest) {
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const statsKey   = process.env.STATS_SECRET_KEY;

  // Optional secret protection — add STATS_SECRET_KEY env var to lock the route
  if (statsKey) {
    const provided = req.nextUrl.searchParams.get("key");
    if (provided !== statsKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ configured: false });
  }

  try {
    // Core counters
    const [total, invoice, tenancy, en, fr, nl] = await Promise.all([
      redisGet(redisUrl, redisToken, "billify:total"),
      redisGet(redisUrl, redisToken, "billify:mode:invoice"),
      redisGet(redisUrl, redisToken, "billify:mode:tenancy"),
      redisGet(redisUrl, redisToken, "billify:lang:en"),
      redisGet(redisUrl, redisToken, "billify:lang:fr"),
      redisGet(redisUrl, redisToken, "billify:lang:nl"),
    ]);

    // Doc types
    const docKeys = await redisKeys(redisUrl, redisToken, "billify:doctype:*");
    const docTypes: Record<string, number> = {};
    await Promise.all(
      docKeys.map(async k => {
        const label = k.replace("billify:doctype:", "");
        docTypes[label] = await redisGet(redisUrl, redisToken, k);
      })
    );

    // Countries (top 20)
    const countryKeys = await redisKeys(redisUrl, redisToken, "billify:country:*");
    const countries: Record<string, number> = {};
    await Promise.all(
      countryKeys.map(async k => {
        const label = k.replace("billify:country:", "");
        countries[label] = await redisGet(redisUrl, redisToken, k);
      })
    );

    // Last 14 days
    const daily: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const count = await redisGet(redisUrl, redisToken, `billify:daily:${d}`);
      daily.push({ date: d, count });
    }

    return NextResponse.json({
      configured: true,
      total,
      modes: { invoice, tenancy },
      langs: { en, fr, nl },
      docTypes,
      countries,
      daily,
    });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({ configured: false, error: String(e) }, { status: 500 });
  }
}
