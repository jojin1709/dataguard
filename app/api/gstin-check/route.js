const STATE_CODES = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

const CHAR_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function computeGSTINCheckDigit(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const char = first14[i];
    const val = CHAR_SET.indexOf(char);
    if (val === -1) return null;
    const factor = i % 2 === 0 ? 1 : 2;
    const product = val * factor;
    const quotient = Math.floor(product / 36);
    const remainder = product % 36;
    sum += quotient + remainder;
  }
  const checkCode = (36 - (sum % 36)) % 36;
  return CHAR_SET[checkCode];
}

export async function POST(req) {
  try {
    const { gstin } = await req.json();

    if (!gstin || typeof gstin !== "string") {
      return Response.json({ error: "GSTIN string is required" }, { status: 400 });
    }

    const cleanInput = gstin.trim().toUpperCase().replace(/[\s-]/g, "");

    if (cleanInput.length !== 15) {
      return Response.json({
        raw: gstin,
        isValidFormat: false,
        isValidChecksum: false,
        message: `GSTIN must be exactly 15 characters long (received ${cleanInput.length}).`,
      });
    }

    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const matchesPattern = regex.test(cleanInput);

    if (!matchesPattern) {
      return Response.json({
        raw: gstin,
        clean: cleanInput,
        isValidFormat: false,
        isValidChecksum: false,
        message: "Invalid GSTIN format. Expected: 2-digit state code + 10-char PAN + entity number + 'Z' + check digit.",
      });
    }

    const stateCode = cleanInput.slice(0, 2);
    const pan = cleanInput.slice(2, 12);
    const entityNum = cleanInput.charAt(12);
    const zChar = cleanInput.charAt(13);
    const providedCheckDigit = cleanInput.charAt(14);

    const stateName = STATE_CODES[stateCode] || "Unknown State Code";
    const expectedCheckDigit = computeGSTINCheckDigit(cleanInput.slice(0, 14));
    const isChecksumValid = expectedCheckDigit === providedCheckDigit;

    // Decode PAN entity type
    const entityChar = pan.charAt(3);
    const ENTITY_MAP = {
      P: "Individual / Proprietorship",
      C: "Company (Private / Public Ltd)",
      H: "Hindu Undivided Family (HUF)",
      F: "Partnership Firm / LLP",
      A: "Association of Persons (AOP)",
      T: "Trust",
      B: "Body of Individuals (BOI)",
      G: "Government Agency",
      J: "Artificial Juridical Person",
    };
    const entityType = ENTITY_MAP[entityChar] || "Commercial Entity";

    return Response.json({
      raw: gstin,
      clean: cleanInput,
      isValidFormat: true,
      isValidChecksum: isChecksumValid,
      stateCode,
      stateName,
      pan,
      entityType,
      entityRegistrationNumber: entityNum,
      providedCheckDigit,
      expectedCheckDigit,
      status: isChecksumValid ? "VALID_GSTIN" : "CHECKSUM_MISMATCH",
      summary: isChecksumValid
        ? `Valid GSTIN registered in ${stateName} for entity type: ${entityType}. Passed official Mod-36 checksum.`
        : `Structurally matches GSTIN syntax but failed Mod-36 check digit (expected '${expectedCheckDigit}', got '${providedCheckDigit}').`,
      verificationLinks: {
        gstPortal: `https://services.gst.gov.in/services/searchtp`,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
