export async function POST(req) {
  try {
    const { epic } = await req.json();

    if (!epic || typeof epic !== "string") {
      return Response.json({ error: "Voter ID (EPIC Number) is required" }, { status: 400 });
    }

    const clean = epic.trim().toUpperCase().replace(/[\s-]/g, "");

    // Standard 10-char ECI EPIC format: 3 letters + 7 digits
    const standardRegex = /^([A-Z]{3})([0-9]{7})$/;
    const match = clean.match(standardRegex);

    if (match) {
      const prefix = match[1];
      const serial = match[2];

      return Response.json({
        raw: epic,
        clean,
        isValidFormat: true,
        type: "STANDARD_ECI_EPIC",
        constituencyPrefix: prefix,
        serialNumber: serial,
        formatted: `${prefix}-${serial}`,
        summary: `Valid Election Commission of India (ECI) standard EPIC card structure with constituency prefix '${prefix}'.`,
        portalLink: "https://electoralsearch.eci.gov.in/",
        securityAdvisory: [
          "Voter ID serves as proof of citizenship and residence across India.",
          "Check your official polling station and enrollment details at electoralsearch.eci.gov.in.",
          "Never upload unmasked Voter ID copies to unverified financial or lending apps.",
        ],
      });
    }

    // Check for legacy slash/hyphen formats (e.g. "DL/01/123/004567")
    const legacyRegex = /^[A-Z]{2,3}\/[0-9]{1,3}\/[0-9]{1,3}\/[0-9]{4,7}$/;
    if (legacyRegex.test(epic.trim().toUpperCase())) {
      return Response.json({
        raw: epic,
        clean,
        isValidFormat: true,
        type: "LEGACY_ECI_VOTER_ID",
        summary: "Legacy State Election Commission voter card format detected.",
        portalLink: "https://electoralsearch.eci.gov.in/",
      });
    }

    return Response.json({
      raw: epic,
      clean,
      isValidFormat: false,
      message: "Invalid Voter ID (EPIC) format. Standard modern ECI cards consist of 3 alphabetic letters followed by 7 numeric digits (e.g. ABC1234567).",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
