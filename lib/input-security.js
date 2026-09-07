import net from "net";

const HOSTNAME = /^(?=.{1,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;

export function normalizePublicHostname(input) {
  if (typeof input !== "string") return null;
  const hostname = input.trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#:]/)[0];
  if (!HOSTNAME.test(hostname) || hostname === "localhost" || hostname.endsWith(".local")) return null;
  return hostname;
}

export function isPublicIp(address) {
  const version = net.isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0 && address.startsWith("192.0.0.")) ||
      (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19))
    );
  }
  if (version === 6) {
    const value = address.toLowerCase();
    return value !== "::1" && value !== "::" && !value.startsWith("fc") && !value.startsWith("fd") && !value.startsWith("fe80:") && !value.startsWith("ff");
  }
  return false;
}

export function normalizeSafeHttpUrl(input) {
  if (typeof input !== "string" || input.length > 2048) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
    if (!/^https?:$/.test(url.protocol) || !normalizePublicHostname(url.hostname) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}
