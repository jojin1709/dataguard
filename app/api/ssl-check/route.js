import { connect } from "tls";

export async function POST(req) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return Response.json({ error: "Domain is required" }, { status: 400 });
    }

    const cleanDomain = domain.trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split(":")[0]
      .toLowerCase();

    const certInfo = await getCertificate(cleanDomain);
    return Response.json(certInfo);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

function getCertificate(hostname) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("Connection timed out. Ensure the domain has HTTPS enabled."));
    }, 10000);

    const socket = connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
      () => {
        clearTimeout(timeout);
        const cert = socket.getPeerCertificate(true);
        socket.destroy();

        if (!cert || !cert.subject) {
          return reject(new Error("Could not retrieve certificate. The domain may not support HTTPS."));
        }

        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((validTo - validFrom) / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining < 0;
        const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30;

        // Parse Subject Alternative Names
        const sanRaw = cert.subjectaltname || "";
        const sans = sanRaw
          .split(",")
          .map((s) => s.trim().replace(/^DNS:/, ""))
          .filter(Boolean)
          .slice(0, 15);

        // Issuer chain
        const issuer = cert.issuer || {};
        const subject = cert.subject || {};

        // Protocol & cipher from socket
        const protocol = socket.getProtocol ? socket.getProtocol() : null;
        const cipher = socket.getCipher ? socket.getCipher() : null;

        resolve({
          domain: hostname,
          isValid: !isExpired,
          isExpired,
          isExpiringSoon,
          daysRemaining,
          totalDays,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          subject: {
            cn: subject.CN || hostname,
            org: subject.O || null,
            country: subject.C || null,
          },
          issuer: {
            cn: issuer.CN || null,
            org: issuer.O || null,
            country: issuer.C || null,
          },
          sans,
          serialNumber: cert.serialNumber || null,
          fingerprint: cert.fingerprint256 || cert.fingerprint || null,
          protocol: protocol || "TLS",
          cipher: cipher ? `${cipher.name} (${cipher.version})` : null,
          bits: cert.bits || null,
        });
      }
    );

    socket.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`SSL connection failed: ${err.message}`));
    });
  });
}
