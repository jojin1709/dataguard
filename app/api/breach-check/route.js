export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split("@")[1];

    const [xon, hibp] = await Promise.all([queryXposedOrNot(cleanEmail), queryHibp(cleanEmail)]);
    if (!xon.available && !hibp.available) return Response.json({ error: "Breach intelligence sources are temporarily unavailable" }, { status: 502 });
    const breaches = [...new Set([...(xon.breaches || []), ...(hibp.breaches || [])])];
    const count = breaches.length;

    let riskLevel = "Low";
    let riskScore = 15;
    if (count > 20) {
      riskLevel = "Critical";
      riskScore = 95;
    } else if (count > 5) {
      riskLevel = "High";
      riskScore = 75;
    } else if (count > 0) {
      riskLevel = "Moderate";
      riskScore = 50;
    }

    return Response.json({
      email: cleanEmail,
      domain,
      breached: count > 0,
      breaches,
      count,
      riskLevel,
      riskScore,
      summary: count > 0
        ? `Identified in ${count} public breach records across available sources.`
        : "No public breach records discovered by the available sources.",
      pastes: hibp.pastes || [],
      sources: { xposedOrNot: xon.available, haveIBeenPwned: hibp.available },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function queryXposedOrNot(email) {
  try {
    const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    if (res.status === 404) return { available: true, breaches: [] };
    if (!res.ok) return { available: false, breaches: [] };
    const data = await res.json();
    return { available: true, breaches: Array.isArray(data?.breaches?.[0]) ? data.breaches[0] : [] };
  } catch { return { available: false, breaches: [] }; }
}

async function queryHibp(email) {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return { available: false, breaches: [], pastes: [] };
  const headers = { "hibp-api-key": apiKey, "user-agent": "DataGuard-OSINT-Suite" };
  try {
    const [breachRes, pasteRes] = await Promise.all([
      fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=true`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`https://haveibeenpwned.com/api/v3/pasteaccount/${encodeURIComponent(email)}`, { headers, signal: AbortSignal.timeout(6000) }),
    ]);
    const breaches = breachRes.status === 404 ? [] : breachRes.ok ? (await breachRes.json()).map((b) => b.Name || b.Title).filter(Boolean) : [];
    const pastes = pasteRes.status === 404 ? [] : pasteRes.ok ? (await pasteRes.json()).slice(0, 10).map((p) => ({ source: p.Source, title: p.Title || p.Id, date: p.Date || null })) : [];
    return { available: breachRes.ok || breachRes.status === 404 || pasteRes.ok || pasteRes.status === 404, breaches, pastes };
  } catch { return { available: false, breaches: [], pastes: [] }; }
}
