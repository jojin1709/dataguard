export async function POST(req) {
  try {
    const { sha1, length, strength } = await req.json();

    if (!/^[A-F0-9]{40}$/.test(sha1 || "") || !Number.isInteger(length) || length < 1 || length > 1024 || !strength) {
      return Response.json({ error: "A valid client-side password fingerprint is required" }, { status: 400 });
    }

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

    return Response.json({
      isPwned,
      pwnedCount,
      sha1Prefix: `${prefix}... [k-Anonymity Protected]`,
      length,
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
