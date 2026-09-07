# DataGuard API Documentation

**Base URL:** `https://dataguard-suite.vercel.app` (or your self-hosted URL)

> **Note:** This API is rate-limited. 30 requests per minute for API endpoints.

---

## Authentication

Most endpoints don't require authentication. Some premium features require API keys set in environment variables (server-side only).

---

## Endpoints

### Email Breach Check
```
POST /api/breach-check
Content-Type: application/json

Body: { "email": "user@example.com" }

Response: {
  "email": "user@example.com",
  "breached": true/false,
  "count": 5,
  "breaches": ["Breach1", "Breach2"],
  "riskLevel": "Low|Moderate|High|Critical"
}
```

### Email Profile Discovery
```
POST /api/site-check
Content-Type: application/json

Body: { "email": "user@example.com" }

Response: {
  "email": "user@example.com",
  "results": [
    { "site": "Gravatar", "exists": true },
    { "site": "GitHub", "exists": false }
  ]
}
```

### Phone Number Analysis
```
POST /api/phone-check
Content-Type: application/json

Body: { "phone": "+91 9820012345" }

Response: {
  "e164": "+919820012345",
  "country": "India",
  "countryCode": "+91",
  "nationalNumber": "9820012345",
  "isValidFormat": true
}
```

### Aadhaar Validation
```
POST /api/aadhaar-check
Content-Type: application/json

Body: { "aadhaar": "XXXX-XXXX-4321" }

Response: {
  "isValidChecksum": true/false,
  "isMasked": true/false,
  "formatted": "XXXX-XXXX-4321"
}
```

### PAN Card Validation
```
POST /api/pan-check
Content-Type: application/json

Body: { "pan": "ABCDE1234F" }

Response: {
  "isValidFormat": true/false,
  "breakdown": {
    "entityType": "Individual",
    "entityCode": "A",
    "surnameOrNameInitial": "A",
    "sequenceDigits": "BCDE",
    "checkLetter": "F"
  }
}
```

### Username OSINT
```
POST /api/username-check
Content-Type: application/json

Body: { "username": "johndoe" }

Response: {
  "username": "johndoe",
  "totalChecked": 36,
  "foundCount": 5,
  "results": [
    { "name": "GitHub", "found": true, "url": "https://github.com/johndoe" }
  ]
}
```

### Password Breach Check
```
POST /api/password-check
Content-Type: application/json

Body: {
  "sha1": "ABC123...",
  "length": 12,
  "strength": { "level": "Moderate" }
}

Response: {
  "isPwned": true/false,
  "pwnedCount": 1234,
  "sha1Prefix": "ABC12... [k-Anonymity Protected]"
}
```

### IP Intelligence
```
POST /api/ip-check
Content-Type: application/json

Body: { "ip": "8.8.8.8" }

Response: {
  "query": "8.8.8.8",
  "country": "United States",
  "isp": "Google LLC",
  "abuseipdb": { "abuseConfidenceScore": 0 },
  "virusTotal": { "malicious": 0 }
}
```

### GSTIN Validation
```
POST /api/gstin-check
Content-Type: application/json

Body: { "gstin": "27AAPFU0939F1ZV" }

Response: {
  "isValidChecksum": true/false,
  "stateName": "Maharashtra",
  "pan": "AAPFU0939F",
  "entityType": "Proprietorship"
}
```

### Vehicle RC/DL Validation
```
POST /api/vehicle-dl-check
Content-Type: application/json

Body: { "query": "MH12AB1234" }

Response: {
  "isVehicleRC": true,
  "state": "Maharashtra",
  "rtoOffice": "Mumbai",
  "formatted": "MH12 AB 1234"
}
```

### Voter ID Validation
```
POST /api/voter-id-check
Content-Type: application/json

Body: { "epic": "ABC1234567" }

Response: {
  "isValidFormat": true/false,
  "serialNumber": "1234567",
  "constituencyPrefix": "ABC"
}
```

### Card BIN/Luhn Check
```
POST /api/card-bin-check
Content-Type: application/json

Body: { "cardNumber": "4000001234567897" }

Response: {
  "isValidLuhn": true,
  "brand": "Visa",
  "issuer": "Example Bank",
  "cardType": "Credit"
}
```

### Crypto Wallet Validation
```
POST /api/crypto-check
Content-Type: application/json

Body: { "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }

Response: {
  "isValid": true,
  "network": "Ethereum",
  "chainType": "ERC-20",
  "explorers": [{ "name": "Etherscan", "url": "https://..." }]
}
```

### Domain Spoofing Check
```
POST /api/domain-spoof-check
Content-Type: application/json

Body: { "domain": "google.com" }

Response: {
  "dmarcEnforced": true,
  "spfStrength": "Strict Hardfail (-all)",
  "mxRecords": [{ "exchange": "smtp.google.com", "priority": 10 }]
}
```

### Disposable Email Check
```
POST /api/disposable-check
Content-Type: application/json

Body: { "input": "user@10minutemail.com" }

Response: {
  "isDisposable": true,
  "riskLevel": "High Risk (Disposable / Burner)",
  "registrySize": 500
}
```

### Hash Identifier
```
POST /api/hash-identifier
Content-Type: application/json

Body: { "hash": "5d41402abc4b2a76b9719d911017c592" }

Response: {
  "primaryType": "MD5",
  "length": 32,
  "securityLevel": "Weak (MD5 deprecated)"
}
```

### URL Safety Scan
```
POST /api/url-safety-check
Content-Type: application/json

Body: { "url": "https://example.com" }

Response: {
  "isSafe": true,
  "isMalicious": false,
  "scanStatus": "complete",
  "availableEngines": ["VirusTotal", "Google Safe Browsing"]
}
```

### WHOIS Lookup
```
POST /api/whois-check
Content-Type: application/json

Body: { "domain": "google.com" }

Response: {
  "domain": "google.com",
  "registrar": "MarkMonitor Inc.",
  "createdAt": "1997-09-15",
  "expiresAt": "2028-09-14",
  "daysUntilExpiry": 826
}
```

### SSL Certificate Check
```
POST /api/ssl-check
Content-Type: application/json

Body: { "domain": "github.com" }

Response: {
  "isValid": true,
  "isExpired": false,
  "daysRemaining": 180,
  "issuer": "DigiCert Inc",
  "subject": { "cn": "github.com" }
}
```

### Social OSINT
```
POST /api/social-check
Content-Type: application/json

Body: { "username": "torvalds" }

Response: {
  "username": "torvalds",
  "totalChecked": 36,
  "foundCount": 3,
  "results": [
    { "name": "GitHub", "found": true, "url": "https://github.com/torvalds" }
  ]
}
```

---

## Rate Limits

- **API Endpoints:** 30 requests per minute per IP
- **UI Usage:** 120 requests per minute per IP

When rate limited, you'll receive:
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input format |
| 403 | Forbidden - Cross-origin not allowed |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Something went wrong |
| 502 | Bad Gateway - External API unavailable |

---

## Environment Variables

For self-hosting, set these in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `HIBP_API_KEY` | Have I Been Pwned API key | For password checks |
| `VIRUSTOTAL_API_KEY` | VirusTotal API key | For URL/IP checks |
| `ABUSEIPDB_API_KEY` | AbuseIPDB API key | For IP threat intel |
| `IPINFO_TOKEN` | IPinfo API token | For geolocation |
| `CENSYS_API_TOKEN` | Censys API token | For attack surface |
| `SHODAN_API_KEY` | Shodan API key | For network mapping |
| `WHOISXML_API_KEY` | WhoisXML API key | For WHOIS lookups |
| `GOOGLE_SAFE_BROWSING_KEY` | Google Safe Browsing | For URL safety |
| `URLSCAN_API_KEY` | urlscan.io API key | For URL scanning |
| `ETHERSCAN_API_KEY` | Etherscan API key | For crypto lookups |
| `ALIENVAULT_OTX_KEY` | AlienVault OTX key | For threat intel |
