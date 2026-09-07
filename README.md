# DataGuard

DataGuard is a privacy-first, zero-retention OSINT and identifier-validation dashboard built with Next.js 16. It combines public threat intelligence with local structural and checksum checks, while clearly distinguishing those two result types.

## What it does

- Email exposure lookups, disposable-email detection, public-avatar discovery, phone normalization, and username/social-profile checks.
- Public cyber intelligence: IP reputation, URL safety, domain email-authentication posture, WHOIS/RDAP, TLS certificates, hash identification, and password breach lookups.
- Structural validation: Aadhaar Verhoeff checksum, GSTIN Mod-36 checksum, PAN/EPIC/RC/DL format decoding, card Luhn/BIN checks, and wallet address checks.

## Important accuracy boundaries

DataGuard does **not** access UIDAI, Income Tax, ECI, Parivahan, banks, or other government/private identity databases. Aadhaar, PAN, voter ID, RC/DL, and payment-card results validate syntax, prefixes, or checksums only; they never prove an identifier exists, is active, belongs to a person, or is authorized.

A URL result marked **No threats found** means the configured sources returned no detection at scan time. It is not a guarantee of safety. Source status is shown as complete, partial, or unavailable.

Social-profile checks are best-effort public HTTP checks and may be limited by login walls, rate limiting, soft-404 responses, or provider changes.

## Privacy and safe use

- Searches are processed in memory; DataGuard has no database, accounts, saved history, or search-log feature.
- The password checker creates a SHA-1 fingerprint in the browser. The raw password is never sent to the application server or the Have I Been Pwned range API.
- Sensitive checks require an on-screen authorization confirmation. Only check data you own or are explicitly authorized to investigate.
- Never enter CVVs, OTPs, biometric data, seed phrases, private keys, or unmasked identity documents.

## Security controls

- Per-IP API throttling and same-origin protection for API requests.
- Security headers: CSP, HSTS, anti-framing, content-type protection, referrer policy, and Permissions Policy.
- The TLS inspector accepts public DNS names only, rejects private/internal address resolution, pins its connection to a validated public address, validates the certificate chain and hostname, and requires TLS 1.2 or newer.
- Upstream errors do not result in a false “safe” verdict.

## Connected intelligence sources

- **URL Safety:** VirusTotal, Google Safe Browsing, and urlscan.io. urlscan.io submissions use `unlisted` visibility and return an evidence link while its asynchronous scan completes.
- **IP Intelligence:** ipwho.is geolocation, AbuseIPDB, VirusTotal, AlienVault OTX, IPinfo Lite ASN context, Shodan observed ports, and Censys indexed services.

Each provider is optional. A quota, plan restriction, or upstream outage omits only that provider from the result; it never prevents the remaining checks from completing or produces a fabricated negative verdict.

> The included in-memory rate limit is an effective local/single-instance safeguard. For horizontally scaled production deployments, replace it with a shared, durable limiter such as Upstash Redis or your hosting provider’s WAF/rate limiter.

## Setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Configure only the API keys you intend to use in `.env.local`. Missing keys degrade the corresponding live enrichment to an unavailable/partial source state; no API key is exposed to the browser.

For Vercel, add the same variables under **Project Settings → Environment Variables** and redeploy after changing them. Keep API keys server-only—do not prefix them with `NEXT_PUBLIC_`.

## Quality checks

```bash
npm test
npm run build
```

The test suite covers public-target validation used by the URL and TLS endpoints. Add endpoint and browser-flow tests before extending any intelligence source.

## Operational roadmap

Before adding persistent accounts, report sharing, bulk scans, watchlists, or alerts, design explicit user consent, retention periods, access controls, audit logs, abuse controls, and applicable legal/compliance review. Those features intentionally are not included in this zero-retention build.

## License

See [LICENSE](LICENSE).
