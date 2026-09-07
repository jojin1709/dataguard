import { normalizeSafeHttpUrl } from "../../../lib/input-security";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const cleanUrl = normalizeSafeHttpUrl(url);
    if (!cleanUrl) return Response.json({ error: "Enter a public HTTP or HTTPS URL." }, { status: 400 });

    const [vtResult, gsbResult] = await Promise.all([
      checkVirusTotal(cleanUrl),
      checkGoogleSafeBrowsing(cleanUrl),
    ]);

    const availableEngines = [vtResult && "VirusTotal", gsbResult && "Google Safe Browsing"].filter(Boolean);
    const isMalicious = (vtResult?.malicious || 0) > 0 || (gsbResult?.threats?.length || 0) > 0;
    const isSuspicious = (vtResult?.suspicious || 0) > 0;
    const scanStatus = availableEngines.length === 0 ? "unavailable" : availableEngines.length === 2 ? "complete" : "partial";

    return Response.json({
      url: cleanUrl,
      isSafe: scanStatus === "complete" && !isMalicious && !isSuspicious,
      isMalicious,
      isSuspicious,
      scanStatus,
      availableEngines,
      virusTotal: vtResult,
      googleSafeBrowsing: gsbResult,
      summary: isMalicious
        ? `This URL is flagged as malicious by ${vtResult?.malicious || 0} engine(s).`
        : isSuspicious
        ? `This URL is flagged as suspicious by ${vtResult?.suspicious || 0} engine(s).`
        : scanStatus === "complete" ? "No threats detected by the configured scanning engines." : "The scan is incomplete; this result must not be treated as safe.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function checkVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;
  try {
    const submitRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: { "x-apikey": apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body: `url=${encodeURIComponent(url)}`,
    });
    if (!submitRes.ok) return null;
    const submitJson = await submitRes.json();
    const analysisId = submitJson?.data?.id;
    if (!analysisId) return null;

    await new Promise((r) => setTimeout(r, 2500));

    const analysisRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { "x-apikey": apiKey },
    });

    if (!analysisRes.ok) {
      const urlId = Buffer.from(url).toString("base64url").replace(/=/g, "");
      const directRes = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: { "x-apikey": apiKey },
      });
      if (!directRes.ok) return null;
      const d = await directRes.json();
      const stats = d?.data?.attributes?.last_analysis_stats;
      return stats ? buildVtResult(stats, d?.data?.attributes?.last_analysis_results || {}) : null;
    }

    const j = await analysisRes.json();
    const stats = j?.data?.attributes?.stats;
    const results = j?.data?.attributes?.results || {};
    return stats ? buildVtResult(stats, results) : null;
  } catch (err) {
    console.error("VirusTotal URL error:", err.message);
    return null;
  }
}

function buildVtResult(stats, results) {
  const flagged = Object.entries(results)
    .filter(([, v]) => v.category === "malicious" || v.category === "suspicious")
    .slice(0, 10)
    .map(([engine, v]) => ({ engine, category: v.category, result: v.result }));
  return {
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
    total: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0),
    flaggedEngines: flagged,
  };
}

async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "dataguard", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const matches = json.matches || [];
    return {
      threats: matches.map((m) => ({ threatType: m.threatType, platformType: m.platformType })),
      isSafe: matches.length === 0,
    };
  } catch (err) {
    console.error("Google Safe Browsing error:", err.message);
    return null;
  }
}
