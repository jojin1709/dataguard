// Verhoeff algorithm lookup tables as defined by UIDAI specifications
const dTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const pTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validateVerhoeff(numStr) {
  let c = 0;
  const digits = numStr.split("").map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = dTable[c][pTable[i % 8][digits[i]]];
  }
  return c === 0;
}

export async function POST(req) {
  try {
    const { aadhaar } = await req.json();

    if (!aadhaar || typeof aadhaar !== "string") {
      return Response.json({ error: "Aadhaar number is required" }, { status: 400 });
    }

    const cleanInput = aadhaar.trim().replace(/[\s-]/g, "");

    // Check for masked Aadhaar: e.g. "XXXXXXXX1234", "****1234"
    const isMasked = /^[X*•]{8}[0-9]{4}$/i.test(cleanInput);
    if (isMasked) {
      return Response.json({
        raw: aadhaar,
        isMasked: true,
        isValidFormat: true,
        lastFourDigits: cleanInput.slice(-4),
        maskedRepresentation: `XXXX-XXXX-${cleanInput.slice(-4)}`,
        status: "MASKED_AADHAAR",
        message: "Masked Aadhaar format detected (UIDAI Recommended Privacy Format).",
        securityScore: "High",
        recommendations: [
          "Masked Aadhaar is UIDAI compliant and safe for public verification.",
          "First 8 digits remain concealed, preventing identity harvesting.",
        ],
      });
    }

    // Standard 12-digit Aadhaar check
    if (!/^\d{12}$/.test(cleanInput)) {
      return Response.json({
        raw: aadhaar,
        isValidFormat: false,
        isValidChecksum: false,
        status: "INVALID_LENGTH",
        message: "Aadhaar number must be exactly 12 numeric digits (excluding spaces/hyphens).",
        securityScore: "Critical",
      });
    }

    // UIDAI rule: Cannot begin with 0 or 1
    const firstDigit = cleanInput.charAt(0);
    if (firstDigit === "0" || firstDigit === "1") {
      return Response.json({
        raw: aadhaar,
        isValidFormat: false,
        isValidChecksum: false,
        status: "INVALID_PREFIX",
        message: "Aadhaar numbers never start with 0 or 1 per UIDAI numbering specifications.",
        securityScore: "Critical",
      });
    }

    // Execute Verhoeff Checksum
    const isChecksumValid = validateVerhoeff(cleanInput);

    const formatted = `${cleanInput.slice(0, 4)} ${cleanInput.slice(4, 8)} ${cleanInput.slice(8, 12)}`;
    const maskedFormatted = `XXXX XXXX ${cleanInput.slice(8, 12)}`;

    return Response.json({
      raw: aadhaar,
      clean: cleanInput,
      formatted,
      maskedFormatted,
      lastFourDigits: cleanInput.slice(-4),
      isValidFormat: true,
      isValidChecksum: isChecksumValid,
      status: isChecksumValid ? "VALID_AADHAAR_CHECKSUM" : "FAILED_CHECKSUM",
      message: isChecksumValid
        ? "Mathematically valid 12-digit Aadhaar number (passed UIDAI Verhoeff Checksum Algorithm)."
        : "Invalid Aadhaar number (failed UIDAI Verhoeff Checksum validation - likely a typo or counterfeit).",
      securityScore: isChecksumValid ? "Exposed / Unmasked" : "Invalid",
      securityAlert: isChecksumValid
        ? "Warning: Never share full 12-digit unmasked Aadhaar publicly. Always prefer Masked Aadhaar or Virtual ID (VID) for authentication to avoid identity theft."
        : null,
      guidance: [
        "Aadhaar uses the Dihedral D5 (Verhoeff) error-detecting code algorithm.",
        "UIDAI advises citizens to lock biometrics via the mAadhaar portal.",
        "Official offline verification should use QR code digitally signed by UIDAI.",
      ],
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
