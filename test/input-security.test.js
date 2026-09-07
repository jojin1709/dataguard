import test from "node:test";
import assert from "node:assert/strict";
import { isPublicIp, normalizePublicHostname, normalizeSafeHttpUrl } from "../lib/input-security.js";

test("accepts public domain names and safe HTTP URLs", () => {
  assert.equal(normalizePublicHostname("https://GitHub.com/path"), "github.com");
  assert.equal(normalizeSafeHttpUrl("example.com/a?b=c"), "https://example.com/a?b=c");
  assert.equal(normalizeSafeHttpUrl("http://example.com"), "http://example.com/");
});

test("rejects local, private, and malformed targets", () => {
  assert.equal(normalizePublicHostname("localhost"), null);
  assert.equal(normalizePublicHostname("127.0.0.1"), null);
  assert.equal(normalizeSafeHttpUrl("file:///etc/passwd"), null);
  assert.equal(normalizeSafeHttpUrl("https://user:pass@example.com"), null);
  assert.equal(isPublicIp("127.0.0.1"), false);
  assert.equal(isPublicIp("10.0.0.1"), false);
  assert.equal(isPublicIp("169.254.169.254"), false);
  assert.equal(isPublicIp("8.8.8.8"), true);
  assert.equal(isPublicIp("::1"), false);
});
