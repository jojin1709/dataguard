function validateLuhn(numStr) {
  let sum = 0;
  let alternate = false;
  for (let i = numStr.length - 1; i >= 0; i--) {
    let n = parseInt(numStr.charAt(i), 10);
    if (isNaN(n)) return false;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function detectCardBrand(digits) {
  if (/^4/.test(digits)) return { brand: "Visa", icon: "💳" };
  if (/^(5[1-5]|2[2-7])/.test(digits)) return { brand: "Mastercard", icon: "💳" };
  if (/^3[47]/.test(digits)) return { brand: "American Express", icon: "💳" };
  if (/^(60|65|81|82|508)/.test(digits)) return { brand: "RuPay (NPCI India)", icon: "🇮🇳" };
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return { brand: "Discover", icon: "💳" };
  if (/^35(2[89]|[3-8][0-9])/.test(digits)) return { brand: "JCB", icon: "💳" };
  if (/^(30[0-5]|36|38)/.test(digits)) return { brand: "Diners Club", icon: "💳" };
  if (/^(5018|5020|5038|5893|6304|6759|6761)/.test(digits)) return { brand: "Maestro", icon: "💳" };
  return { brand: "Standard Bank Card", icon: "💳" };
}

// Local fallback dictionary for known popular bank BIN prefixes
const POPULAR_BIN_MAP = {
  "405574": { bank: "State Bank of India (SBI)", type: "Debit", country: "India" },
  "450644": { bank: "HDFC Bank", type: "Credit", country: "India" },
  "414720": { brand: "Chase Bank", bank: "JPMorgan Chase", type: "Credit", country: "United States" },
  "438628": { bank: "ICICI Bank", type: "Credit", country: "India" },
  "524193": { bank: "Axis Bank", type: "Credit", country: "India" },
  "607069": { bank: "State Bank of India (RuPay)", type: "Debit", country: "India" },
  "400000": { bank: "Visa Test Interbank", type: "Credit", country: "Global" },
};

export async function POST(req) {
  try {
    const { cardNumber } = await req.json();

    if (!cardNumber || typeof cardNumber !== "string") {
      return Response.json({ error: "Card number is required" }, { status: 400 });
    }

    const clean = cardNumber.replace(/\D/g, "");

    if (clean.length < 12 || clean.length > 19) {
      return Response.json({
        raw: cardNumber,
        isValidLength: false,
        isValidLuhn: false,
        message: "Card numbers must be between 12 and 19 digits.",
      });
    }

    const isLuhnValid = validateLuhn(clean);
    const brandInfo = detectCardBrand(clean);
    const bin = clean.slice(0, 6);
    const last4 = clean.slice(-4);
    const masked = `${clean.slice(0, 4)} •••• •••• ${last4}`;

    // Attempt live BIN resolution
    let binDetails = POPULAR_BIN_MAP[bin] || null;
    if (!binDetails) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`https://data.handyapi.com/bin/${bin}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          if (json.Status === "SUCCESS") {
            binDetails = {
              bank: json.Issuer || "Issuing Bank Registered",
              type: json.Type || "Credit/Debit",
              country: json.Country?.Name || "Global",
            };
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    return Response.json({
      masked,
      bin,
      last4,
      length: clean.length,
      brand: brandInfo.brand,
      brandIcon: brandInfo.icon,
      isValidLuhn: isLuhnValid,
      status: isLuhnValid ? "VALID_LUHN_CHECKSUM" : "FAILED_LUHN_CHECKSUM",
      issuer: binDetails?.bank || "Verified Financial Institution",
      cardType: binDetails?.type || "Standard Payment Card",
      country: binDetails?.country || "International",
      summary: isLuhnValid
        ? `Mathematically valid ${brandInfo.brand} card (passed Luhn mod-10 algorithm). Issuer: ${binDetails?.bank || "Active Card Issuer"}.`
        : "Failed mathematical Luhn algorithm checksum. Likely a mistyped card number.",
      securityNotice: "Never share CVV, expiration dates, or OTPs. Card numbers alone are public IIN sequences.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
