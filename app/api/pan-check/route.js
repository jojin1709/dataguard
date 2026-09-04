const ENTITY_MAP = {
  P: { type: "Individual", desc: "Private Citizen / Natural Person" },
  C: { type: "Company", desc: "Incorporated Company / Corporate Entity" },
  H: { type: "Hindu Undivided Family (HUF)", desc: "HUF Tax Entity" },
  F: { type: "Firm", desc: "Partnership Firm / Limited Liability Partnership (LLP)" },
  A: { type: "Association of Persons (AOP)", desc: "Group of Individuals" },
  T: { type: "Trust", desc: "Charitable or Private Registered Trust" },
  B: { type: "Body of Individuals (BOI)", desc: "Body of Individuals" },
  L: { type: "Local Authority", desc: "Municipal or Local Government Authority" },
  J: { type: "Artificial Juridical Person", desc: "Statutory / Legal Entity" },
  G: { type: "Government Agency", desc: "Central or State Government Department" },
};

export async function POST(req) {
  try {
    const { pan } = await req.json();

    if (!pan || typeof pan !== "string") {
      return Response.json({ error: "PAN number is required" }, { status: 400 });
    }

    const cleanPAN = pan.trim().toUpperCase().replace(/[\s-]/g, "");

    const isValidFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN);

    if (!isValidFormat) {
      return Response.json({
        raw: pan,
        clean: cleanPAN,
        isValidFormat: false,
        status: "INVALID_PAN_FORMAT",
        message: "Invalid PAN format. A valid Indian PAN consists of 10 alphanumeric characters (e.g. ABCDE1234F).",
      });
    }

    const series = cleanPAN.slice(0, 3);
    const entityChar = cleanPAN.charAt(3);
    const surnameInitialChar = cleanPAN.charAt(4);
    const sequenceNum = cleanPAN.slice(5, 9);
    const checkLetter = cleanPAN.charAt(9);

    const entityInfo = ENTITY_MAP[entityChar] || {
      type: "Unknown / Special Category",
      desc: "Unclassified Entity Type",
    };

    return Response.json({
      raw: pan,
      clean: cleanPAN,
      isValidFormat: true,
      status: "VALID_PAN_STRUCTURE",
      message: `Structurally valid PAN for entity: ${entityInfo.type}`,
      breakdown: {
        seriesPrefix: series,
        entityType: entityInfo.type,
        entityDescription: entityInfo.desc,
        entityCode: entityChar,
        surnameOrNameInitial: surnameInitialChar,
        sequenceDigits: sequenceNum,
        checkLetter: checkLetter,
      },
      securityAdvisory: [
        "PAN is linked with Aadhaar, bank accounts, and Income Tax records.",
        "Public PAN exposure can enable fraudulent financial impersonation.",
        "Always securely store and never share unmasked PAN copies on untrusted forums.",
      ],
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
