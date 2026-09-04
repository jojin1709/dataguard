import crypto from "crypto";

async function checkGravatar(email) {
  const hash = crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  try {
    const res = await fetch(`https://www.gravatar.com/avatar/${hash}?d=404`);
    return { site: "Gravatar", exists: res.status === 200 };
  } catch {
    return { site: "Gravatar", exists: false, error: true };
  }
}

async function checkGithub(email) {
  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) return { site: "GitHub", exists: false, error: true };
    const data = await res.json();
    return { site: "GitHub", exists: (data.total_count || 0) > 0 };
  } catch {
    return { site: "GitHub", exists: false, error: true };
  }
}

// duckduckgo instant answer - not account check, skip. Kept to 2 solid free
// checks that actually work reliably without getting blocked. Adding fragile
// "forgot password" scrapers here will break constantly on Vercel IPs.

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "invalid email" }, { status: 400 });
    }

    const results = await Promise.all([checkGravatar(email), checkGithub(email)]);

    return Response.json({
      email,
      results,
      note: "Limited to sites with a reliable public API. Broad site enumeration (100+ sites via forgot-password probing) needs a non-serverless backend with rotating IPs — Vercel free tier will get rate-limited/captcha'd.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
