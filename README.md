> [!NOTE]
> **DataGuard v3.0 is live:** 20 genuine verification engines — now with **URL Safety** (VirusTotal 70+ AV engines + Google Safe Browsing), **WHOIS / Domain Age** (RDAP + WhoisXML), **SSL Certificate Inspector** (live TLS handshake), **Social Media OSINT** (35 platforms), and **IP Geolocation Map**.

<div align="center">

# 🛡️ DataGuard
### Autonomous Multi-Identifier Intelligence & Algorithmic OSINT Suite

<p align="center">
  <strong>Verify identities, inspect on-chain telemetry, audit email authentication, scan URLs for malware, and conduct real-time cyber threat reconnaissance across 20 intelligence engines.</strong>
</p>

<p align="center">
  <strong>Developed by <a href="https://www.linkedin.com/in/jojin-john/">JOJIN JOHN</a></strong>
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/jojin-john/"><img src="https://img.shields.io/badge/LinkedIn-Jojin%20John-0077b5?style=for-the-badge&logo=linkedin" alt="LinkedIn" /></a>
  <a href="https://github.com/jojin1709"><img src="https://img.shields.io/badge/GitHub-jojin1709-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Engines-20_Active-blue?style=for-the-badge&logo=shield" alt="20 Active Engines" />
  <img src="https://img.shields.io/badge/VirusTotal-v3_Verified-blueviolet?style=for-the-badge&logo=virustotal" alt="VirusTotal" />
  <img src="https://img.shields.io/badge/Google_Safe_Browsing-Live-4285F4?style=for-the-badge&logo=google" alt="Google Safe Browsing" />
  <img src="https://img.shields.io/badge/AbuseIPDB-v2_Telemetry-orange?style=for-the-badge&logo=shield" alt="AbuseIPDB" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="Proprietary License" />
</p>

<p align="center">
  🌐 <strong>Access the live web application:</strong><br />
  <a href="https://dataguard-suite.vercel.app"><code>https://dataguard-suite.vercel.app</code></a>
</p>

<sub>100% genuine algorithmic validation • Client-safe zero-knowledge design • Proprietary web platform</sub>

---

</div>

> [!TIP]
> **Zero Knowledge Architecture:** Passwords are never sent across the wire (queried via HaveIBeenPwned k-Anonymity 5-char SHA-1 prefix model). Payment cards are validated purely mathematically using the ISO/IEC 7812 Luhn algorithm (zero CVV or expiry requested).

---

## 📑 Table of Contents
- [What is DataGuard?](#-what-is-dataguard)
  - [Why DataGuard Exists](#why-dataguard-exists)
  - [Mathematical Integrity vs Mock Data](#mathematical-integrity-vs-mock-data)
  - [Zero-Knowledge & Privacy Architecture](#zero-knowledge--privacy-architecture)
- [Architecture & Data Flow](#-architecture--data-flow)
- [The 20 Verification Engines](#-the-20-verification-engines)
  - [1. Identity & Public Accounts](#1-identity--public-accounts)
  - [2. Government & Transport (India)](#2-government--transport-india)
  - [3. Financial & Web3 Intelligence](#3-financial--web3-intelligence)
  - [4. Cyber & Threat Reconnaissance](#4-cyber--threat-reconnaissance)
- [Live Upstream Intelligence Integrations](#-live-upstream-intelligence-integrations)
- [Export & PDF Audit Reports](#-export--pdf-audit-reports)
- [Terms of Use & Proprietary Rights](#-terms-of-use--proprietary-rights)
- [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
- [Author & Contact](#-author--contact)

---

## 🧭 What is DataGuard?

**DataGuard** is a full-stack, real-time cybersecurity and Open-Source Intelligence (OSINT) platform engineered to bridge the gap between individual identity exposure and live threat reconnaissance.

Unlike traditional static lookup tools that rely on simulated data, DataGuard pairs **pure mathematical checksum algorithms** (Verhoeff Dihedral D5, Luhn Mod-10, Mod-36) with **live upstream threat telemetry** (VirusTotal 70+ vendor AV scanner, Google Safe Browsing, Etherscan on-chain node query, AbuseIPDB, AlienVault OTX, WhoisXML RDAP, and HaveIBeenPwned).

<details>
<summary><strong>Why DataGuard Exists</strong></summary>

Digital exposure today is fragmented. A developer or security analyst investigating an incident usually has to toggle between 8 different websites: a breach checker, a block explorer, an IP reputation database, a DNS analyzer, an SSL inspector, a WHOIS lookup, a URL scanner, and an identity validator.

DataGuard unifies this entire workflow into a single, cohesive, client-safe SaaS application with **20 specialized engines** and 1-click exportable PDF security reports.

</details>

<details>
<summary><strong>Mathematical Integrity vs Mock Data</strong></summary>

Every engine inside DataGuard implements genuine, official standards:
- **UIDAI Verhoeff Algorithm**: Implements the official Dihedral group $D_5$ permutation matrix to validate 12-digit Indian Aadhaar numbers.
- **GSTIN Mod-36 Checksum**: Uses the Goods and Services Tax Network (GSTN) alphanumeric weight matrix to verify business identifiers.
- **Luhn Algorithm**: Implements ISO/IEC 7812 Mod-10 verification to check credit and debit card structure without transmitting sensitive information.
- **EIP-55**: Computes Keccak-256 (SHA3-256) mixed-case checksums for Ethereum and EVM addresses.
- **Live TLS Handshake**: SSL Certificate engine performs a real TLS connection on port 443 to read the actual certificate — no third-party API, raw socket inspection.

</details>

<details>
<summary><strong>Zero-Knowledge & Privacy Architecture</strong></summary>

DataGuard is engineered with privacy as a hard requirement:
- **No data retention**: All requests are evaluated in-memory and discarded. No user database is attached.
- **k-Anonymity Model**: Passwords are never sent across the wire. Only the first 5 characters of the SHA-1 hash are queried against HaveIBeenPwned's index of billions of leaked credentials.
- **Non-intrusive payment verification**: Card checks require only the card number to calculate Luhn validity and identify the issuing bank (zero CVV, expiration date, or cardholder name).

</details>

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    CLIENT["User on Live Web Platform"]
    
    subgraph EngineLayer["DataGuard 20-Engine Core"]
        ALGO["Algorithmic Verification<br/>• Verhoeff (Aadhaar)<br/>• Luhn (Cards)<br/>• Mod-36 (GSTIN)<br/>• EIP-55 (Crypto)<br/>• TLS Handshake (SSL)"]
        DNS_PROV["DNS & Network Analysis<br/>• SPF / DMARC / MX Records<br/>• GeoIP & ASN Provider<br/>• OpenStreetMap Geolocation<br/>• RDAP Domain Registry"]
        INTEL["Live Upstream Intelligence<br/>• VirusTotal v3 API (70+ AV engines)<br/>• Google Safe Browsing v4<br/>• Etherscan v2 API<br/>• AbuseIPDB v2 API<br/>• AlienVault OTX v1 API<br/>• WhoisXML RDAP API<br/>• HaveIBeenPwned k-Anonymity<br/>• Social OSINT (35 platforms)"]
    end
    
    CLIENT -- "HTTPS Encrypted Query" --> EngineLayer
    INTEL --> RES["Normalized Threat Intelligence"]
    ALGO --> RES
    DNS_PROV --> RES
    
    RES --> UI["Interactive Real-Time Dashboard"]
    UI --> PDF["Export Audit Report (PDF / Print)"]
```

---

## ⚡ The 20 Verification Engines

### 1. Identity & Public Accounts

| # | Engine | Target Input | Genuine Algorithmic / Live Telemetry Feature |
| :-: | :--- | :--- | :--- |
| **1** | 📧 **Email Exposure** | `user@example.com` | Cross-references XposedOrNot live database + discovers linked Gravatar and GitHub avatars. |
| **2** | 📱 **Phone Intelligence** | `+91 9820012345` | Global ITU-T E.164 normalization, carrier identification, Indian (+91) telecom circle blocks, and direct WhatsApp links. |
| **3** | 🪪 **Aadhaar (UIDAI)** | `XXXX-XXXX-1234` | Official Dihedral $D_5$ (Verhoeff) mathematical algorithm + Masked Aadhaar privacy validation. |
| **4** | 💳 **PAN Card** | `ABCDE1234F` | 10-character Income Tax syntax validation + entity category decoding (Individual, Company, Firm, Trust). |
| **5** | 👤 **Username OSINT** | `username` | Concurrent multi-platform profile search across GitHub, Reddit, HackerNews, GitLab, and Chess.com. |

### 2. Government & Transport (India)

| # | Engine | Target Input | Genuine Algorithmic / Live Telemetry Feature |
| :-: | :--- | :--- | :--- |
| **6** | 🏢 **GSTIN (Indian GST)** | `27AAPFU0939F1ZV` | 15-char structure validation, State/UT mapping, embedded PAN extraction, and official **Mod-36 Checksum**. |
| **7** | 🚗 **Vehicle RC & DL** | `MH12AB1234` / `DL...` | MoRTH standard Driving License format + Vehicle RC registration and Indian State RTO office mapping. |
| **8** | 🗳️ **Voter ID (EPIC)** | `ABC1234567` | Validates standard Election Commission of India (ECI) 10-character alphanumeric EPIC card syntax. |

### 3. Financial & Web3 Intelligence

| # | Engine | Target Input | Genuine Algorithmic / Live Telemetry Feature |
| :-: | :--- | :--- | :--- |
| **9** | 💳 **Card BIN & Luhn** | `4000 0012 3456 7897` | Mathematical **Luhn Algorithm (Mod-10)** check + IIN/BIN bank identification (Zero CVV/expiry required). |
| **10** | 🪙 **Crypto Wallet** | `0x...` / `bc1...` | EIP-55 Ethereum checksum, Bitcoin SegWit/Taproot, Solana Base58 + **Live Etherscan on-chain node telemetry**. |

### 4. Cyber & Threat Reconnaissance

| # | Engine | Target Input | Genuine Algorithmic / Live Telemetry Feature |
| :-: | :--- | :--- | :--- |
| **11** | 🔑 **Password Strength** | `password` | Privacy-preserving **k-Anonymity SHA-1** leak count check against billions of pwned passwords + NIST strength gauge. |
| **12** | 🌐 **IP & Threat Intel** | `118.25.6.39` / `8.8.8.8` | Geolocation + **AbuseIPDB v2** confidence + **VirusTotal 70+ AV** + **AlienVault OTX** + **OpenStreetMap live pin**. |
| **13** | 🛡️ **Domain Spoofing** | `google.com` | Real-time DNS resolution for **SPF**, **DMARC** (`p=reject`), and **MX** records + VirusTotal vendor breakdown. |
| **14** | 🗑️ **Disposable Email** | `test@10minutemail.com`| Live registry check against 400+ temporary burner email services. |
| **15** | #️⃣ **Hash Identifier** | `5d41402abc...` | Cryptographic signature detection (MD5, SHA-1, SHA-256, bcrypt, Argon2) + rainbow plaintext lookup. |
| **16** | 🔗 **URL Safety** | `https://site.com` | Submits URL to **VirusTotal (70+ AV engines)** + **Google Safe Browsing v4** for malware, phishing & UNWANTED_SOFTWARE detection. |
| **17** | 📅 **WHOIS / Domain Age** | `google.com` | Queries **RDAP** (open registry) + **WhoisXML API** for registrar, creation date, expiry countdown, nameservers, and domain age. |
| **18** | 🔒 **SSL Certificate** | `github.com` | Performs a **live TLS socket handshake** (no third-party API) to read issuer, expiry, Subject Alt Names, cipher suite, and SHA-256 fingerprint. |
| **19** | 👥 **Social OSINT** | `username` | Server-side concurrent HTTP checks across **35 platforms** — GitHub, Reddit, Dev.to, npm, PyPI, HackerNews, Twitch, Medium, GitLab, and 26 more. |
| **20** | 🗺️ **IP Geolocation Map** | *(within IP tool)* | Renders a live **OpenStreetMap** embed pinned to the IP's exact latitude/longitude coordinates. |

---

## 🔑 Live Upstream Intelligence Integrations

DataGuard directly connects to **8 official upstream security APIs**:

* **VirusTotal (v3 API)**: Scans URLs and IP addresses across 70+ antivirus and security vendors (`last_analysis_stats`). Also powers the URL Safety engine with full engine vote breakdown.
* **Google Safe Browsing (v4 API)**: Checks URLs against Google's threat database for MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE, and POTENTIALLY_HARMFUL_APPLICATION categories.
* **Etherscan (v2 API)**: Queries Ethereum mainnet nodes via API v2 for real-time account Wei balance, live USD exchange rates, and transaction nonce.
* **AlienVault OTX (v1 API)**: Open Threat Exchange indicator of compromise (IoC) pulse telemetry and APT adversary attribution.
* **AbuseIPDB (v2 API)**: 90-day threat report telemetry, abuse confidence percentage, Tor exit status, and attack category logs.
* **WhoisXML API + RDAP**: Domain registration data, registrar, creation/expiry dates, and nameservers via the official RDAP protocol with WhoisXML as a fallback for enriched data.
* **HaveIBeenPwned (k-Anonymity)**: Privacy-preserving 5-char SHA-1 prefix model — raw password is never transmitted.
* **ipwho.is + OpenStreetMap**: Free GeoIP resolution providing latitude/longitude, ISP, ASN, and city data rendered on an embedded interactive map.

---

## 🖨️ Export & PDF Audit Reports

DataGuard includes a built-in **Export Report (PDF)** feature. When auditing an IP, domain, cryptocurrency wallet, or identity:
1. Click the **Export Report (PDF)** button at the top-right of any result.
2. The custom `@media print` stylesheet automatically hides search bars, tabs, particles, and navigation chrome.
3. Your browser opens the print preview, formatting a clean, audit-ready security report on a white background suitable for compliance filings, clients, or documentation.

---

## 🔒 Terms of Use & Proprietary Rights

> [!IMPORTANT]
> **Proprietary Software — All Rights Reserved.**
> 
> * **Usage**: Users and security researchers are welcome to freely access and use the hosted web platform.
> * **Source Code Protection**: The architecture, algorithms, and design of DataGuard are the intellectual property of **JOJIN JOHN**.
> * **Restrictions**: Cloning, modifying, mirroring, distributing, or deploying copies of this source code or derivative works without explicit written consent from the author is strictly prohibited.

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Are user searches logged or stored on a database?</strong></summary>

No. DataGuard has zero database connections and retains no search logs. All evaluations happen purely in-memory and are streamed directly back to the requesting client.

</details>

<details>
<summary><strong>Is it safe to test my payment card number?</strong></summary>

Yes. DataGuard **never** asks for or accepts CVV codes, expiration dates, or cardholder names. It evaluates only the mathematical Luhn algorithm (Mod-10) and checks the first 6 digits against public Bank Identification Number (BIN) registries.

</details>

<details>
<summary><strong>How does the SSL Certificate checker work?</strong></summary>

The SSL engine opens a direct TLS socket connection on port 443 to your target domain — no third-party API involved. It reads the raw X.509 certificate, extracts issuer, subject, validity dates, Subject Alternative Names, and cipher suite directly from the handshake.

</details>

<details>
<summary><strong>How accurate is the Social OSINT tool?</strong></summary>

The Social OSINT engine makes concurrent server-side HTTP requests to 35 platforms. About 28–30 platforms give reliable yes/no results based on HTTP status codes. A few platforms (like Instagram and TikTok) always return 200 even for non-existent users — those are marked as "Unverifiable" rather than giving false results.

</details>

<details>
<summary><strong>How can I use DataGuard?</strong></summary>

You can access the live service directly through the deployed web portal at [dataguard-suite.vercel.app](https://dataguard-suite.vercel.app).

</details>

---

## 📄 Author & Contact

Developed with pride by **[JOJIN JOHN](https://www.linkedin.com/in/jojin-john/)** ([@jojin1709](https://github.com/jojin1709)).

* **LinkedIn**: [linkedin.com/in/jojin-john](https://www.linkedin.com/in/jojin-john/)
* **GitHub**: [github.com/jojin1709](https://github.com/jojin1709)

*Copyright © 2026 JOJIN JOHN. All rights reserved.*


<div align="center">

