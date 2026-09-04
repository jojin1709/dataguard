import dns from "dns/promises";

async function queryVirusTotalDomain(domain) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: {
        "x-apikey": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const attrs = json.data?.attributes;
    if (!attrs) return null;

    const stats = attrs.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;

    return {
      stats: { malicious, suspicious, harmless, undetected },
      reputation: attrs.reputation || 0,
      categories: Object.values(attrs.categories || {}).slice(0, 3),
      isClean: malicious === 0 && suspicious === 0,
      totalEngines: malicious + suspicious + harmless + undetected,
    };
  } catch (err) {
    console.error("VirusTotal API error:", err.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return Response.json({ error: "Domain name is required" }, { status: 400 });
    }

    const clean = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .replace(/^@/, "");

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(clean)) {
      return Response.json({ error: "Invalid domain format (e.g. google.com or paypal.com)" }, { status: 400 });
    }

    // 1. Resolve SPF TXT records
    let spfRecord = null;
    let spfStrength = "None";
    try {
      const txtRecords = await dns.resolveTxt(clean);
      for (const chunks of txtRecords) {
        const fullTxt = chunks.join("");
        if (fullTxt.startsWith("v=spf1")) {
          spfRecord = fullTxt;
          if (fullTxt.includes("-all")) {
            spfStrength = "Strict Hardfail (-all)";
          } else if (fullTxt.includes("~all")) {
            spfStrength = "Softfail (~all)";
          } else if (fullTxt.includes("+all")) {
            spfStrength = "Dangerous (+all Permissive)";
          } else {
            spfStrength = "Neutral (?all)";
          }
          break;
        }
      }
    } catch {
      // SPF lookup failed
    }

    // 2. Resolve DMARC TXT record (_dmarc.domain)
    let dmarcRecord = null;
    let dmarcPolicy = "None / Missing";
    let dmarcEnforced = false;
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${clean}`);
      for (const chunks of dmarcRecords) {
        const fullTxt = chunks.join("");
        if (fullTxt.startsWith("v=DMARC1")) {
          dmarcRecord = fullTxt;
          const policyMatch = fullTxt.match(/p=([a-z]+)/i);
          if (policyMatch) {
            const pol = policyMatch[1].toLowerCase();
            if (pol === "reject") {
              dmarcPolicy = "p=reject (Highest Protection - Unauthorized Emails Blocked)";
              dmarcEnforced = true;
            } else if (pol === "quarantine") {
              dmarcPolicy = "p=quarantine (Spam Folder Delivery)";
              dmarcEnforced = true;
            } else if (pol === "none") {
              dmarcPolicy = "p=none (Audit Only - Spoofed Emails Allowed Through)";
              dmarcEnforced = false;
            }
          }
          break;
        }
      }
    } catch {
      // DMARC lookup failed
    }

    // 3. Resolve MX Records
    let mxRecords = [];
    try {
      const mx = await dns.resolveMx(clean);
      mxRecords = (mx || [])
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 4)
        .map((m) => ({ exchange: m.exchange, priority: m.priority }));
    } catch {
      // MX lookup failed
    }

    // 4. Query VirusTotal Antivirus Engines
    const virusTotalData = await queryVirusTotalDomain(clean);

    // Calculate spoofing protection score (0 to 100)
    let score = 20;
    let rating = "Critical Vulnerability";
    if (dmarcEnforced) {
      score += 50;
    } else if (dmarcRecord) {
      score += 20;
    }

    if (spfRecord) {
      score += 30;
      if (spfStrength.includes("Hardfail")) score += 10;
    }

    if (score >= 85) {
      rating = "Strong / Spoof-Resistant";
    } else if (score >= 60) {
      rating = "Moderate / Partial Protection";
    } else if (score >= 40) {
      rating = "Weak / Spoofable";
    }

    return Response.json({
      domain: clean,
      score,
      rating,
      hasSPF: !!spfRecord,
      spfRecord: spfRecord || "No SPF record found in DNS.",
      spfStrength,
      hasDMARC: !!dmarcRecord,
      dmarcRecord: dmarcRecord || "No _dmarc TXT record found in DNS.",
      dmarcPolicy,
      dmarcEnforced,
      hasMX: mxRecords.length > 0,
      mxRecords,
      virusTotal: virusTotalData,
      summary: dmarcEnforced
        ? `Domain ${clean} has active email authentication. DMARC policy prevents unauthorized senders from forging its emails.`
        : `Domain ${clean} lacks strict DMARC enforcement. Attackers can potentially spoof emails appearing to originate from @${clean}.`,
      recommendations: !dmarcEnforced
        ? [
            "Implement a DMARC policy with 'p=quarantine' or 'p=reject' at _dmarc." + clean,
            "Ensure SPF contains '-all' instead of '+all' or '?all'.",
            "Sign all outbound emails with DKIM cryptographic headers.",
          ]
        : [
            "Domain has active email spoofing defense.",
            "Regularly monitor DMARC forensic feedback reports (RUA/RUF).",
          ],
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
