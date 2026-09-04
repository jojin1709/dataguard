import crypto from "crypto";

function evaluatePasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let level = "Very Weak";
  let color = "red";
  if (score >= 6) {
    level = "Very Strong";
    color = "emerald";
  } else if (score >= 4) {
    level = "Moderate";
    color = "amber";
  } else if (score >= 2) {
    level = "Weak";
    color = "rose";
  }

  if (password.length < 12) {
    feedback.push("Use at least 12–16 characters to resist automated brute-force attacks.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("Include symbols (e.g. !@#$%^&*) for higher complexity.");
  }

  return { score, level, color, feedback };
}

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return Response.json({ error: "Password string is required" }, { status: 400 });
    }

    // SHA-1 hash computation
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    // Query HIBP k-Anonymity API (safe, official, free)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "User-Agent": "SecOps-Threat-Intel-Checker",
      },
    });

    if (!res.ok) {
      return Response.json(
        { error: "Unable to query breach database (upstream network error)" },
        { status: 502 }
      );
    }

    const text = await res.text();
    const lines = text.split("\r\n");

    let pwnedCount = 0;
    let isPwned = false;

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix && hashSuffix.trim() === suffix) {
        isPwned = true;
        pwnedCount = parseInt(countStr.trim(), 10) || 1;
        break;
      }
    }

    const strength = evaluatePasswordStrength(password);

    return Response.json({
      isPwned,
      pwnedCount,
      sha1Prefix: `${prefix}... [k-Anonymity Protected]`,
      length: password.length,
      strength,
      securityStatus: isPwned ? "COMPROMISED_IN_BREACHES" : "NOT_FOUND_IN_KNOWN_BREACHES",
      summary: isPwned
        ? `ALERT: This password appeared ${pwnedCount.toLocaleString()} times in publicly leaked credential dumps.`
        : "Good news: This exact password was not found in known public leak corpuses.",
      recommendation: isPwned
        ? "Immediately discard this password on all services! Attackers use automated credential stuffing lists containing this password."
        : "Even if not leaked yet, ensure unique passwords per service and enable 2-Factor Authentication (2FA).",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
