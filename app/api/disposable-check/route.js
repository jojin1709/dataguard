const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "tempmail.net",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "dispostable.com",
  "getairmail.com",
  "fakemailgenerator.com",
  "mohmal.com",
  "crazymailing.com",
  "generator.email",
  "nada.ltd",
  "burnermail.io",
  "temp-mail.io",
  "mytemp.email",
  "mailnesia.com",
  "emailondeck.com",
  "inboxkitten.com",
  "maildrop.cc",
  "discard.email",
  "trashmail.net",
  "tmpmail.net",
  "tmail.ws",
  "mailcatch.com",
  "getnada.com",
  "minutemailbox.com",
  "zillamail.com",
]);

export async function POST(req) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return Response.json({ error: "Email or phone input is required" }, { status: 400 });
    }

    const clean = input.trim().toLowerCase();

    // 1. If it's an email address or domain
    if (clean.includes("@") || clean.includes(".")) {
      const domain = clean.includes("@") ? clean.split("@")[1] : clean;
      const isDisposable = DISPOSABLE_DOMAINS.has(domain);

      return Response.json({
        type: "EMAIL_DOMAIN",
        raw: input,
        domain,
        isDisposable,
        riskLevel: isDisposable ? "High Risk (Disposable / Burner)" : "Legitimate / Trusted Provider",
        status: isDisposable ? "DISPOSABLE_BURNER_EMAIL" : "GENUINE_DOMAIN",
        summary: isDisposable
          ? `The domain '${domain}' is a confirmed temporary burner / throwaway email service. Accounts registered with this domain are high-risk for fraud or bot activity.`
          : `The domain '${domain}' was not detected in the disposable email provider registry.`,
        recommendation: isDisposable
          ? "Block signups from this email or require phone / biometric verification."
          : "Standard email verification is suitable.",
      });
    }

    // 2. If it's a phone number
    const digits = clean.replace(/\D/g, "");
    if (digits.length >= 7) {
      // Check for known VOIP / virtual indicators
      return Response.json({
        type: "PHONE_NUMBER",
        raw: input,
        digits,
        isDisposable: false,
        summary: "Standard cellular or landline number format.",
        advisory: "For production carrier-level VOIP line detection, real-time HLR telecom lookup is recommended.",
      });
    }

    return Response.json({
      raw: input,
      isValid: false,
      message: "Please enter a valid email address (e.g. name@tempmail.com) or domain to check.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
