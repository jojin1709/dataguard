const COUNTRY_PREFIXES = [
  { code: "91", country: "India", flag: "🇮🇳", length: 10 },
  { code: "1", country: "United States / Canada", flag: "🇺🇸", length: 10 },
  { code: "44", country: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "971", country: "United Arab Emirates", flag: "🇦🇪", length: 9 },
  { code: "61", country: "Australia", flag: "🇦🇺", length: 9 },
  { code: "65", country: "Singapore", flag: "🇸🇬", length: 8 },
  { code: "49", country: "Germany", flag: "🇩🇪", length: 10 },
  { code: "33", country: "France", flag: "🇫🇷", length: 9 },
  { code: "81", country: "Japan", flag: "🇯🇵", length: 10 },
  { code: "966", country: "Saudi Arabia", flag: "🇸🇦", length: 9 },
];

function analyzeIndianNumber(tenDigit) {
  const firstDigit = tenDigit.charAt(0);
  const firstTwo = tenDigit.slice(0, 2);
  const firstFour = tenDigit.slice(0, 4);

  const isValidIndianMobile = /^[6-9]\d{9}$/.test(tenDigit);
  if (!isValidIndianMobile) {
    return {
      isValid: false,
      reason: "Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9 per DoT regulations.",
    };
  }

  // Telecom operator series detection (DoT original allocation)
  let likelyOperator = "Major Indian Telecom Network";
  if (firstTwo === "98" || firstTwo === "99" || firstTwo === "96" || firstTwo === "97") {
    likelyOperator = "Bharti Airtel / Vodafone Idea (Legacy GSM Block)";
  } else if (firstTwo === "90" || firstTwo === "91" || firstTwo === "92" || firstTwo === "93") {
    likelyOperator = "Vodafone Idea / Reliance Jio";
  } else if (firstTwo === "94" || firstTwo === "95") {
    likelyOperator = "BSNL / MTNL (Public Sector Telecom)";
  } else if (firstDigit === "7" || firstDigit === "6") {
    likelyOperator = "Reliance Jio Infocomm / Bharti Airtel (4G/5G Allotted Series)";
  } else if (firstDigit === "8") {
    likelyOperator = "Vodafone Idea / Bharti Airtel / Reliance Jio";
  }

  return {
    isValid: true,
    telecomSector: "National Mobile Telephony (DoT India)",
    likelyOperator,
    mnpNotice: "Note: The subscriber may have ported their operator via Mobile Number Portability (MNP).",
    firstDigit,
    seriesBlock: firstFour,
  };
}

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return Response.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleaned = phone.trim().replace(/[^\d+]/g, "");
    let digitsOnly = cleaned.replace(/\D/g, "");

    if (!digitsOnly || digitsOnly.length < 7 || digitsOnly.length > 15) {
      return Response.json({
        raw: phone,
        isValid: false,
        status: "INVALID_LENGTH",
        message: "Invalid phone number length. Valid phone numbers contain between 7 and 15 digits (ITU-T E.164 standard).",
      });
    }

    // Determine country
    let detectedCountry = null;
    let nationalNumber = digitsOnly;
    let countryCode = "";

    // If starts with 0 and 11 digits (Indian STD/trunk prefix e.g. 09876543210)
    if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
      digitsOnly = digitsOnly.slice(1);
    }

    // Check if starts with international code
    for (const c of COUNTRY_PREFIXES) {
      if (cleaned.startsWith(`+${c.code}`) || (digitsOnly.startsWith(c.code) && digitsOnly.length === c.code.length + c.length)) {
        detectedCountry = c;
        countryCode = c.code;
        nationalNumber = digitsOnly.slice(c.code.length);
        break;
      }
    }

    // If no international match but 10 digits starting with 6,7,8,9 -> default to India
    if (!detectedCountry && digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
      detectedCountry = COUNTRY_PREFIXES[0]; // India
      countryCode = "91";
      nationalNumber = digitsOnly;
    } else if (!detectedCountry) {
      countryCode = digitsOnly.slice(0, Math.min(3, digitsOnly.length - 7));
      nationalNumber = digitsOnly.slice(countryCode.length);
      detectedCountry = { country: "International Destination", flag: "🌐", code: countryCode };
    }

    const e164 = `+${countryCode}${nationalNumber}`;
    const e164Digits = `${countryCode}${nationalNumber}`;

    let indiaAnalysis = null;
    if (countryCode === "91" && nationalNumber.length === 10) {
      indiaAnalysis = analyzeIndianNumber(nationalNumber);
    }

    const waLink = `https://wa.me/${e164Digits}`;

    return Response.json({
      raw: phone,
      e164,
      e164Digits,
      country: detectedCountry.country,
      flag: detectedCountry.flag,
      countryCode: `+${countryCode}`,
      nationalNumber,
      isValidFormat: true,
      indiaAnalysis,
      quickLinks: {
        whatsapp: waLink,
        tel: `tel:${e164}`,
      },
      securityAdvisory: [
        "Phone numbers frequently serve as the primary factor for SMS 2FA and password resets.",
        "Watch out for SIM swap attacks, unauthorized call forwarding, and smishing (SMS phishing).",
        "Recommended: Use hardware security keys or authenticator apps (TOTP) instead of SMS for 2FA.",
      ],
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
