export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split("@")[1];

    // XposedOrNot - free, no API key needed
    const res = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(cleanEmail)}`,
      { headers: { Accept: "application/json" } }
    );

    if (res.status === 404) {
      return Response.json({
        email: cleanEmail,
        domain,
        breached: false,
        breaches: [],
        count: 0,
        riskLevel: "Low",
        riskScore: 10,
        summary: "Zero compromised breach records found in the database.",
      });
    }

    if (!res.ok) {
      return Response.json({ error: "Upstream breach lookup service temporarily unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const rawBreaches = data?.breaches?.[0] || [];
    const breaches = Array.isArray(rawBreaches) ? rawBreaches : [];
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
        ? `Identified in ${count} public data breach corpuses.`
        : "No public breach records discovered.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
