import test from "node:test";
import assert from "node:assert/strict";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePAN(pan) {
  if (!pan || typeof pan !== "string") return false;
  const clean = pan.trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean);
}

function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== "string") return false;
  const clean = gstin.trim().toUpperCase();
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(clean);
}

function validateAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== "string") return false;
  const clean = aadhaar.replace(/[\s-]/g, "");
  return /^\d{12}$/.test(clean);
}

function validateVoterID(epic) {
  if (!epic || typeof epic !== "string") return false;
  const clean = epic.trim().toUpperCase();
  return /^[A-Z]{3}[0-9]{7}$/.test(clean);
}

function validateLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits || digits.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function validateBitcoinAddress(addr) {
  if (!addr || typeof addr !== "string") return false;
  return /^bc1[ac-hj-np-zAC-HJ-NP-Z02-9]{11,71}$/.test(addr) ||
         /^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(addr);
}

function validateEthereumAddress(addr) {
  if (!addr || typeof addr !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function validateDomain(domain) {
  if (!domain || typeof domain !== "string") return false;
  return /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}\.[a-z]{2,63}$/i.test(domain.trim().toLowerCase());
}

function validateIP(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4.test(ip)) return false;
  const parts = ip.split(".").map(Number);
  return parts.every(p => p >= 0 && p <= 255);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

test("email validation", () => {
  assert.equal(validateEmail("test@example.com"), true);
  assert.equal(validateEmail("user.name@domain.org"), true);
  assert.equal(validateEmail("invalid"), false);
  assert.equal(validateEmail("@domain.com"), false);
  assert.equal(validateEmail("user@"), false);
  assert.equal(validateEmail("user@.com"), false);
});

test("PAN validation", () => {
  assert.equal(validatePAN("ABCDE1234F"), true);
  assert.equal(validatePAN("AAACP1234H"), true);
  assert.equal(validatePAN("abcde1234f"), true);
  assert.equal(validatePAN("ABC12"), false);
  assert.equal(validatePAN("ABCDE12345"), false);
  assert.equal(validatePAN("ABCDEFGH123"), false);
});

test("GSTIN validation", () => {
  assert.equal(validateGSTIN("27AAPFU0939F1ZV"), true);
  assert.equal(validateGSTIN("07AAAAA0000A1Z5"), true);
  assert.equal(validateGSTIN("27AAPFU0939F1ZV".toLowerCase()), true);
  assert.equal(validateGSTIN("27AAPFU"), false);
  assert.equal(validateGSTIN("INVALID12345678"), false);
});

test("Aadhaar validation", () => {
  assert.equal(validateAadhaar("234567890123"), true);
  assert.equal(validateAadhaar("2345 6789 0123"), true);
  assert.equal(validateAadhaar("2345-6789-0123"), true);
  assert.equal(validateAadhaar("2345678901"), false);
  assert.equal(validateAadhaar("2345678901234"), false);
  assert.equal(validateAadhaar("abcdefghijkl"), false);
});

test("Voter ID validation", () => {
  assert.equal(validateVoterID("ABC1234567"), true);
  assert.equal(validateVoterID("TNL7654321"), true);
  assert.equal(validateVoterID("abc1234567"), true);
  assert.equal(validateVoterID("ABC123456"), false);
  assert.equal(validateVoterID("ABC12345678"), false);
  assert.equal(validateVoterID("123ABC4567"), false);
});

test("Luhn algorithm for card validation", () => {
  assert.equal(validateLuhn("4532015112830366"), true);
  assert.equal(validateLuhn("4916338506082832"), true);
  assert.equal(validateLuhn("4556737586899855"), true);
  assert.equal(validateLuhn("4000000000000001"), false);
  assert.equal(validateLuhn("1234567890123456"), false);
});

test("Bitcoin address validation", () => {
  assert.equal(validateBitcoinAddress("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"), true);
  assert.equal(validateBitcoinAddress("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"), true);
  assert.equal(validateBitcoinAddress("bc1invalid"), false);
  assert.equal(validateBitcoinAddress("0xinvalid"), false);
});

test("Ethereum address validation", () => {
  assert.equal(validateEthereumAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), true);
  assert.equal(validateEthereumAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"), true);
  assert.equal(validateEthereumAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"), true);
  assert.equal(validateEthereumAddress("0xG8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), false);
  assert.equal(validateEthereumAddress("d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), false);
  assert.equal(validateEthereumAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA960"), false);
});

test("domain validation", () => {
  assert.equal(validateDomain("google.com"), true);
  assert.equal(validateDomain("github.com"), true);
  assert.equal(validateDomain("example.org"), true);
  assert.equal(validateDomain("localhost"), false);
  assert.equal(validateDomain("192.168.1.1"), false);
  assert.equal(validateDomain(""), false);
});

test("IP validation", () => {
  assert.equal(validateIP("8.8.8.8"), true);
  assert.equal(validateIP("1.1.1.1"), true);
  assert.equal(validateIP("192.168.1.1"), true);
  assert.equal(validateIP("256.256.256.256"), false);
  assert.equal(validateIP("1.2.3"), false);
  assert.equal(validateIP("1.2.3.4.5"), false);
});

test("phone validation", () => {
  assert.equal(validatePhone("+91 9820012345"), true);
  assert.equal(validatePhone("+1 202-555-0143"), true);
  assert.equal(validatePhone("555-0143"), true);
  assert.equal(validatePhone("123"), false);
  assert.equal(validatePhone("+12345678901234567"), false);
});
