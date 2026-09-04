const ABUSE_CATEGORIES = {
  3: "Fraud Orders",
  4: "DDoS Attack",
  5: "FTP Brute-Force",
  6: "Ping of Death",
  7: "Phishing",
  8: "Fraud VoIP",
  9: "Open Proxy",
  10: "Web Spam",
  11: "Email Spam",
  12: "Blog Spam",
  13: "VPN IP",
  14: "Port Scan",
  15: "Hacking Attempt",
  16: "SQL Injection",
  17: "Spoofing",
  18: "Brute-Force",
  19: "Bad Web Bot",
  20: "Exploited Host",
  21: "Web App Attack",
  22: "SSH Attack",
  23: "IoT Targeted",
};

async function queryAbuseIPDB(ip) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(
      ip
    )}&maxAgeInDays=90&verbose=true`;

    const res = await fetch(url, {
      headers: {
        Key: apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json.data;
    if (!data) return null;

    const recentReports = (data.reports || []).slice(0, 8).map((r) => ({
      reportedAt: r.reportedAt,
      comment: r.comment || "Suspicious traffic detected",
      reporterCountry: r.reporterCountryName || r.reporterCountryCode || "Global",
      categories: (r.categories || []).map((catId) => ABUSE_CATEGORIES[catId] || `Category ${catId}`),
    }));

    return {
      abuseConfidenceScore: data.abuseConfidenceScore || 0,
      isWhitelisted: data.isWhitelisted || false,
      isTor: data.isTor || false,
      totalReports: data.totalReports || 0,
      numDistinctUsers: data.numDistinctUsers || 0,
      lastReportedAt: data.lastReportedAt || null,
      usageType: data.usageType || "Unknown",
      countryName: data.countryName || null,
      domain: data.domain || null,
      recentReports,
    };
  } catch (err) {
    console.error("AbuseIPDB error:", err.message);
    return null;
  }
}

async function queryVirusTotalIP(ip) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        "x-apikey": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const stats = json.data?.attributes?.last_analysis_stats;
    if (!stats) return null;

    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      reputation: json.data?.attributes?.reputation || 0,
      isClean: (stats.malicious || 0) === 0,
    };
  } catch (err) {
    console.error("VirusTotal IP error:", err.message);
    return null;
  }
}

async function queryAlienVaultOTX(ip) {
  const apiKey = process.env.ALIENVAULT_OTX_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`, {
      headers: {
        "X-OTX-API-KEY": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return {
      pulseCount: json.pulse_info?.count || 0,
      references: (json.pulse_info?.pulses || []).slice(0, 3).map((p) => p.name),
      adversary: json.pulse_info?.pulses?.[0]?.adversary || null,
    };
  } catch (err) {
    console.error("AlienVault OTX error:", err.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const { ip } = await req.json();

    if (!ip || typeof ip !== "string") {
      return Response.json({ error: "IP address or domain is required" }, { status: 400 });
    }

    const cleanQuery = ip.trim().replace(/^https?:\/\//i, "").split("/")[0];

    // Fetch GeoIP + ASN
    const geoRes = await fetch(`https://ipwho.is/${encodeURIComponent(cleanQuery)}`, {
      headers: { Accept: "application/json" },
    });

    if (!geoRes.ok) {
      return Response.json({ error: "Failed to query IP intelligence provider" }, { status: 502 });
    }

    const data = await geoRes.json();

    if (!data.success) {
      return Response.json({
        raw: ip,
        success: false,
        message: data.message || "Invalid IP address or domain host.",
      });
    }

    const resolvedIP = data.ip;

    // Concurrently query threat databases: AbuseIPDB, VirusTotal, and AlienVault OTX
    const [abuseData, virusTotalData, otxData] = await Promise.all([
      queryAbuseIPDB(resolvedIP),
      queryVirusTotalIP(resolvedIP),
      queryAlienVaultOTX(resolvedIP),
    ]);

    return Response.json({
      query: resolvedIP,
      type: data.type,
      continent: data.continent,
      country: data.country,
      countryCode: data.country_code,
      flagEmoji: data.flag?.emoji || "🌐",
      region: data.region,
      city: data.city,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      isp: data.connection?.isp || "Unknown ISP",
      domain: data.connection?.domain || "",
      org: data.connection?.org || "",
      asn: data.connection?.asn ? `AS${data.connection.asn}` : "N/A",
      timezone: data.timezone?.id || "UTC",
      security: {
        isBogon: data.is_bogon || false,
      },
      abuseipdb: abuseData,
      virusTotal: virusTotalData,
      alienVaultOtx: otxData,
      summary: `${resolvedIP} resolves to ${data.city || data.region || "Unknown City"}, ${data.country} operated by ${data.connection?.isp || "Unknown Provider"}.`,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
