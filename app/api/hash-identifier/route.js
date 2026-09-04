const POPULAR_HASH_REVERSALS = {
  // MD5
  "5d41402abc4b2a76b9719d911017c592": "hello",
  "5f4dcc3b5aa765d61d8327deb882cf99": "password",
  "098f6bcd4621d373cade4e832627b4f6": "test",
  "e10adc3949ba59abbe56e057f20f883e": "123456",
  "25d55ad283aa400af464c76d713c07ad": "12345678",
  "d8578edf8458ce06fbc5bb76a58c5ca4": "qwerty",
  // SHA-1
  "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d": "hello",
  "5baa61e4c9b93f3f0682250b6cf8331b7ee68d8": "password",
  "7c4a8d09ca3762af61e59520943dc26494f8941b": "123456",
  // SHA-256
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824": "hello",
  "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "password",
  "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92": "123456",
};

export async function POST(req) {
  try {
    const { hash } = await req.json();

    if (!hash || typeof hash !== "string") {
      return Response.json({ error: "Hash string is required" }, { status: 400 });
    }

    const clean = hash.trim();
    const len = clean.length;
    const isHex = /^[a-fA-F0-9]+$/.test(clean);

    let algorithms = [];
    let securityLevel = "Standard";

    if (clean.startsWith("$2a$") || clean.startsWith("$2b$") || clean.startsWith("$2y$")) {
      algorithms.push({ name: "bcrypt", desc: "Adaptive Blowfish password hash (High Security)" });
      securityLevel = "High (Slow Adaptive Key Derivation)";
    } else if (clean.startsWith("$argon2id$") || clean.startsWith("$argon2i$")) {
      algorithms.push({ name: "Argon2", desc: "Modern memory-hard password hash (Maximum Security)" });
      securityLevel = "Maximum (Modern Winner of PHC)";
    } else if (clean.startsWith("$6$")) {
      algorithms.push({ name: "SHA-512 Unix Crypt", desc: "Linux shadow password hash" });
    } else if (clean.startsWith("$1$")) {
      algorithms.push({ name: "MD5 Unix Crypt", desc: "Legacy shadow password hash" });
      securityLevel = "Broken / Insecure";
    } else if (isHex) {
      if (len === 32) {
        algorithms.push(
          { name: "MD5", desc: "Message Digest 5 (128-bit) - Cryptographically Broken" },
          { name: "NTLM", desc: "Microsoft Windows NT LAN Manager Hash" },
          { name: "MD4", desc: "Legacy Message Digest 4" }
        );
        securityLevel = "Cryptographically Weak (Subject to collision & fast GPU crack)";
      } else if (len === 40) {
        algorithms.push(
          { name: "SHA-1", desc: "Secure Hash Algorithm 1 (160-bit) - Deprecated" },
          { name: "RIPEMD-160", desc: "RACE Integrity Primitives (Used in Bitcoin)" }
        );
        securityLevel = "Deprecated / Collisions Demonstrated";
      } else if (len === 56) {
        algorithms.push(
          { name: "SHA-224", desc: "SHA-2 variant (224-bit)" },
          { name: "SHA3-224", desc: "Keccak-based SHA-3 (224-bit)" }
        );
        securityLevel = "Strong";
      } else if (len === 64) {
        algorithms.push(
          { name: "SHA-256", desc: "Standard SHA-2 (256-bit) - Industry Standard" },
          { name: "Keccak-256", desc: "Ethereum EVM standard cryptographic hash" }
        );
        securityLevel = "Very Strong";
      } else if (len === 96) {
        algorithms.push({ name: "SHA-384", desc: "SHA-2 variant (384-bit)" });
        securityLevel = "Maximum";
      } else if (len === 128) {
        algorithms.push(
          { name: "SHA-512", desc: "SHA-2 (512-bit) - High Security" },
          { name: "Whirlpool", desc: "NESSIE European cryptographic hash (512-bit)" }
        );
        securityLevel = "Maximum";
      }
    }

    if (algorithms.length === 0) {
      return Response.json({
        raw: hash,
        isValidHash: false,
        message: "Could not identify cryptographic hash pattern. Provide a valid hex hash (e.g. 32-char MD5, 64-char SHA-256) or salted format ($2b$..., $argon2id$).",
      });
    }

    // Check for plaintext in reverse dictionary
    const lower = clean.toLowerCase();
    const knownPlaintext = POPULAR_HASH_REVERSALS[lower] || null;

    return Response.json({
      raw: hash,
      clean,
      length: len,
      isHex,
      primaryType: algorithms[0].name,
      possibleAlgorithms: algorithms,
      securityLevel,
      isCracked: !!knownPlaintext,
      knownPlaintext,
      summary: knownPlaintext
        ? `Identified as ${algorithms[0].name}. MATCH FOUND: This hash was successfully decrypted to plaintext: "${knownPlaintext}"!`
        : `Identified as ${algorithms[0].name} (${algorithms.map((a) => a.name).join(", ")}). Length: ${len} chars.`,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
