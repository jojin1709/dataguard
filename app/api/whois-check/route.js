export async function POST(req) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return Response.json({ error: "Domain is required" }, { status: 400 });
    }

    const cleanDomain = domain.trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .toLowerCase();

    const [rdapData, whoisXmlData] = await Promise.allSettled([
      queryRDAP(cleanDomain),
      queryWhoisXML(cleanDomain),
    ]);

    const rdap = rdapData.status === "fulfilled" ? rdapData.value : null;
    const whoisXml = whoisXmlData.status === "fulfilled" ? whoisXmlData.value : null;

    // Merge: prefer WhoisXML for richer data, RDAP as fallback
    const registrar = whoisXml?.registrar || rdap?.registrar || "Unknown";
    const createdAt = whoisXml?.createdDate || rdap?.createdAt || null;
    const expiresAt = whoisXml?.expiresDate || rdap?.expiresAt || null;
    const updatedAt = whoisXml?.updatedDate || rdap?.updatedAt || null;
    const nameServers = whoisXml?.nameServers || rdap?.nameServers || [];
    const registrantCountry = whoisXml?.registrantCountry || rdap?.registrantCountry || "Unknown";
    const registrantOrg = whoisXml?.registrantOrg || rdap?.registrantOrg || "Unknown";
    const status = rdap?.status || [];

    // Calculate domain age
    let domainAgeDays = null;
    let domainAgeText = null;
    if (createdAt) {
      const created = new Date(createdAt);
      const now = new Date();
      domainAgeDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      const years = Math.floor(domainAgeDays / 365);
      const months = Math.floor((domainAgeDays % 365) / 30);
      domainAgeText = years > 0
        ? `${years} year${years !== 1 ? "s" : ""}${months > 0 ? `, ${months} month${months !== 1 ? "s" : ""}` : ""}`
        : `${months} month${months !== 1 ? "s" : ""}`;
    }

    // Days until expiry
    let daysUntilExpiry = null;
    let isExpired = false;
    if (expiresAt) {
      const expiry = new Date(expiresAt);
      const now = new Date();
      daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
      isExpired = daysUntilExpiry < 0;
    }

    return Response.json({
      domain: cleanDomain,
      registrar,
      registrantOrg,
      registrantCountry,
      createdAt,
      updatedAt,
      expiresAt,
      nameServers: nameServers.slice(0, 6),
      status,
      domainAgeDays,
      domainAgeText,
      daysUntilExpiry,
      isExpired,
      sources: { rdap: !!rdap, whoisXml: !!whoisXml },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function queryRDAP(domain) {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/rdap+json" },
    });
    if (!res.ok) return null;
    const json = await res.json();

    const getEventDate = (type) =>
      json.events?.find((e) => e.eventAction === type)?.eventDate || null;

    const registrar = json.entities
      ?.find((e) => e.roles?.includes("registrar"))
      ?.vcardArray?.[1]
      ?.find(([k]) => k === "fn")?.[3] || null;

    const registrantEntity = json.entities?.find((e) => e.roles?.includes("registrant"));
    const registrantCountry = registrantEntity?.vcardArray?.[1]
      ?.find(([k]) => k === "adr")?.[1]?.["country-name"] || null;

    const nameServers = (json.nameservers || []).map((ns) => ns.ldhName?.toLowerCase()).filter(Boolean);

    return {
      registrar,
      registrantCountry,
      registrantOrg: null,
      createdAt: getEventDate("registration"),
      updatedAt: getEventDate("last changed"),
      expiresAt: getEventDate("expiration"),
      nameServers,
      status: json.status || [],
    };
  } catch (err) {
    console.error("RDAP error:", err.message);
    return null;
  }
}

async function queryWhoisXML(domain) {
  const apiKey = process.env.WHOISXML_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.WhoisRecord;
    if (!r) return null;

    return {
      registrar: r.registrarName || null,
      registrantOrg: r.registrant?.organization || r.registrant?.name || null,
      registrantCountry: r.registrant?.country || null,
      createdDate: r.createdDateNormalized || r.createdDate || null,
      updatedDate: r.updatedDateNormalized || r.updatedDate || null,
      expiresDate: r.expiresDateNormalized || r.expiresDate || null,
      nameServers: (r.nameServers?.hostNames || []).map((n) => n.toLowerCase()),
    };
  } catch (err) {
    console.error("WhoisXML error:", err.message);
    return null;
  }
}
