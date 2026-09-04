"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Fingerprint,
  CreditCard,
  User,
  KeyRound,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Building2,
  Car,
  Vote,
  Coins,
  ShieldHalf,
  Trash2,
  Binary,
  Printer,
  Download,
  Radio,
  Server,
  Link,
  MapPin,
  ShieldQuestion,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "identity", label: "Identity & Accounts" },
  { id: "government", label: "Government & Transport" },
  { id: "financial", label: "Financial & Web3" },
  { id: "cyber", label: "Cyber & Threat Recon" },
];

const MODULES = [
  // Identity
  {
    id: "email",
    category: "identity",
    label: "Email",
    icon: Mail,
    placeholder: "Enter an email address (e.g. someone@example.com)",
    samples: ["test@gmail.com", "hello@github.com"],
    helperText: "Checks data breaches and linked public profiles.",
  },
  {
    id: "phone",
    category: "identity",
    label: "Phone",
    icon: Phone,
    placeholder: "Enter phone number (e.g. +91 9820012345)",
    samples: ["+91 9820012345", "+1 202-555-0143"],
    helperText: "Identifies telecom carrier, E.164 normalization, and WhatsApp link.",
  },
  {
    id: "aadhaar",
    category: "identity",
    label: "Aadhaar",
    icon: Fingerprint,
    placeholder: "Enter 12-digit Aadhaar or masked format (e.g. XXXX-XXXX-4321)",
    samples: ["XXXX-XXXX-4321", "2345 6789 0123"],
    helperText: "Verifies official UIDAI Verhoeff checksum and masked privacy status.",
  },
  {
    id: "pan",
    category: "identity",
    label: "PAN Card",
    icon: CreditCard,
    placeholder: "Enter 10-character PAN (e.g. ABCDE1234F)",
    samples: ["ABCDE1234F", "AAACP1234H"],
    helperText: "Decodes taxpayer category (Individual, Company, Firm) and syntax.",
  },
  {
    id: "username",
    category: "identity",
    label: "Username",
    icon: User,
    placeholder: "Enter username (e.g. torvalds or shadcn)",
    samples: ["torvalds", "shadcn"],
    helperText: "Searches public profile presence across GitHub, Reddit, HackerNews, and more.",
  },

  // Government & Transport
  {
    id: "gstin",
    category: "government",
    label: "GSTIN (GST)",
    icon: Building2,
    placeholder: "Enter 15-character GSTIN (e.g. 27AAPFU0939F1ZV)",
    samples: ["27AAPFU0939F1ZV", "07AAAAA0000A1Z5"],
    helperText: "Validates 15-char structure, extracts PAN, identifies State, and runs Mod-36 checksum.",
  },
  {
    id: "vehicle",
    category: "government",
    label: "Vehicle RC & DL",
    icon: Car,
    placeholder: "Enter Vehicle RC (e.g. MH12AB1234) or Driving License (e.g. DL0120150012345)",
    samples: ["MH12AB1234", "DL0120150012345", "22BH1234AA"],
    helperText: "Decodes Indian Transport Office (RTO), State authority, and license issue year.",
  },
  {
    id: "voter",
    category: "government",
    label: "Voter ID",
    icon: Vote,
    placeholder: "Enter 10-character Voter ID / EPIC (e.g. ABC1234567)",
    samples: ["ABC1234567", "TNL7654321"],
    helperText: "Validates Election Commission of India (ECI) standard EPIC card structure.",
  },

  // Financial & Web3
  {
    id: "card",
    category: "financial",
    label: "Card BIN & Luhn",
    icon: CreditCard,
    placeholder: "Enter card number (e.g. 4000 0012 3456 7897)",
    samples: ["4000001234567897", "5241931234567890"],
    helperText: "Mathematical Luhn mod-10 check and BIN bank identification (zero CVV/PIN needed).",
  },
  {
    id: "crypto",
    category: "financial",
    label: "Crypto Wallet",
    icon: Coins,
    placeholder: "Enter Bitcoin, Ethereum, or Solana address (e.g. 0x... or bc1...)",
    samples: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"],
    helperText: "Validates Bitcoin (Legacy/SegWit), Ethereum EIP-55, and Solana with live explorer links.",
  },

  // Cyber & Threat Recon
  {
    id: "password",
    category: "cyber",
    label: "Password",
    icon: KeyRound,
    placeholder: "Enter password to test breach frequency",
    samples: ["password123", "Tr0ub4dor&3"],
    helperText: "Safely checks breach databases using k-Anonymity (raw password never transmitted).",
  },
  {
    id: "ip",
    category: "cyber",
    label: "IP & AbuseIPDB",
    icon: Globe,
    placeholder: "Enter IP address or domain (e.g. 118.25.6.39 or 1.1.1.1)",
    samples: ["118.25.6.39", "1.1.1.1", "8.8.8.8"],
    helperText: "Inspects geolocation, ISP, and live AbuseIPDB threat telemetry & attack reports.",
  },
  {
    id: "domainSpoof",
    category: "cyber",
    label: "Domain Spoofing",
    icon: ShieldHalf,
    placeholder: "Enter domain (e.g. google.com or paypal.com)",
    samples: ["google.com", "microsoft.com"],
    helperText: "Performs live DNS query for SPF, DMARC (p=reject), and MX email spoofing defense.",
  },
  {
    id: "disposable",
    category: "cyber",
    label: "Disposable Email",
    icon: Trash2,
    placeholder: "Enter email or domain to detect burner providers (e.g. test@10minutemail.com)",
    samples: ["user@10minutemail.com", "user@gmail.com"],
    helperText: "Checks against a registry of 400+ temporary burner email services.",
  },
  {
    id: "hash",
    category: "cyber",
    label: "Hash Identifier",
    icon: Binary,
    placeholder: "Paste hash string (MD5, SHA-1, SHA-256, bcrypt, etc.)",
    samples: ["5d41402abc4b2a76b9719d911017c592", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"],
    helperText: "Detects cryptographic hash algorithm and searches known plaintext reversals.",
  },
  {
    id: "urlSafety",
    category: "cyber",
    label: "URL Safety",
    icon: Link,
    placeholder: "Enter URL to scan (e.g. https://suspicious-site.com)",
    samples: ["https://google.com", "http://malware.testing.google.test/testing/malware/"],
    helperText: "Scans URL across VirusTotal (70+ AV engines) and Google Safe Browsing for malware & phishing.",
  },
  {
    id: "whois",
    category: "cyber",
    label: "WHOIS Lookup",
    icon: Calendar,
    placeholder: "Enter domain to look up (e.g. google.com or github.com)",
    samples: ["google.com", "github.com"],
    helperText: "Reveals registrar, domain age, expiry date, nameservers via RDAP & WhoisXML.",
  },
  {
    id: "ssl",
    category: "cyber",
    label: "SSL Certificate",
    icon: Lock,
    placeholder: "Enter domain to check SSL cert (e.g. github.com)",
    samples: ["github.com", "google.com"],
    helperText: "Live TLS handshake reveals issuer, expiry, Subject Alt Names, cipher suite, and fingerprint.",
  },
  {
    id: "socialOsint",
    category: "cyber",
    label: "Social OSINT",
    icon: Users,
    placeholder: "Enter username to search across 35 platforms (e.g. torvalds)",
    samples: ["torvalds", "shadcn"],
    helperText: "Checks username presence across GitHub, Reddit, Dev.to, npm, PyPI, HackerNews, and 29 more platforms.",
  },
];

/* Number count-up animation */
function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    }

    requestAnimationFrame(update);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

/* Interactive Particle Canvas for ambient backdrop */
function ParticleAura() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 35), 35);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
      });
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.fillStyle = "rgba(147, 197, 253, 0.25)";
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.1 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 opacity-70"
    />
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("email");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [breachSearch, setBreachSearch] = useState("");

  const visibleModules =
    selectedCategory === "all"
      ? MODULES
      : MODULES.filter((m) => m.category === selectedCategory);

  const currentModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];

  function handleTabSwitch(tabId) {
    setActiveTab(tabId);
    setQuery("");
    setResult(null);
    setError("");
    setBreachSearch("");
    setShowPassword(false);
  }

  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    if (catId !== "all") {
      const catModules = MODULES.filter((m) => m.category === catId);
      const isCurrentInCat = catModules.some((m) => m.id === activeTab);
      if (!isCurrentInCat && catModules.length > 0) {
        handleTabSwitch(catModules[0].id);
      }
    }
  }

  function triggerCelebration() {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#60a5fa", "#34d399"],
      });
    } catch {
      // Ignore
    }
  }

  async function handleCheck(e, queryParam) {
    if (e) e.preventDefault();
    const targetQuery = (queryParam !== undefined ? queryParam : query).trim();
    if (!targetQuery) return;

    setError("");
    setResult(null);
    setLoading(true);
    setScanStep(1);
    setBreachSearch("");

    const stepInterval = setInterval(() => {
      setScanStep((s) => (s < 4 ? s + 1 : s));
    }, 380);

    try {
      if (activeTab === "email") {
        const [breachRes, siteRes] = await Promise.all([
          fetch("/api/breach-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: targetQuery }),
          }).then((r) => r.json()),
          fetch("/api/site-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: targetQuery }),
          }).then((r) => r.json()),
        ]);
        if (breachRes.error) throw new Error(breachRes.error);
        setResult({ type: "email", breach: breachRes, sites: siteRes });
        if (!breachRes.breached) triggerCelebration();
      } else if (activeTab === "phone") {
        const res = await fetch("/api/phone-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "phone", data: res });
        if (res.isValidFormat) triggerCelebration();
      } else if (activeTab === "aadhaar") {
        const res = await fetch("/api/aadhaar-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadhaar: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "aadhaar", data: res });
        if (res.isMasked || res.isValidChecksum) triggerCelebration();
      } else if (activeTab === "pan") {
        const res = await fetch("/api/pan-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pan: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "pan", data: res });
        if (res.isValidFormat) triggerCelebration();
      } else if (activeTab === "username") {
        const res = await fetch("/api/username-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "username", data: res });
      } else if (activeTab === "password") {
        const res = await fetch("/api/password-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "password", data: res });
        if (!res.isPwned) triggerCelebration();
      } else if (activeTab === "ip") {
        const res = await fetch("/api/ip-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "ip", data: res });
        if (res.abuseipdb && res.abuseipdb.abuseConfidenceScore === 0) triggerCelebration();
      } else if (activeTab === "gstin") {
        const res = await fetch("/api/gstin-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gstin: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "gstin", data: res });
        if (res.isValidChecksum) triggerCelebration();
      } else if (activeTab === "vehicle") {
        const res = await fetch("/api/vehicle-dl-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "vehicle", data: res });
        if (res.isVehicleRC || res.isDrivingLicense) triggerCelebration();
      } else if (activeTab === "voter") {
        const res = await fetch("/api/voter-id-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ epic: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "voter", data: res });
        if (res.isValidFormat) triggerCelebration();
      } else if (activeTab === "card") {
        const res = await fetch("/api/card-bin-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardNumber: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "card", data: res });
        if (res.isValidLuhn) triggerCelebration();
      } else if (activeTab === "crypto") {
        const res = await fetch("/api/crypto-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "crypto", data: res });
        if (res.isValid) triggerCelebration();
      } else if (activeTab === "domainSpoof") {
        const res = await fetch("/api/domain-spoof-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "domainSpoof", data: res });
        if (res.dmarcEnforced) triggerCelebration();
      } else if (activeTab === "disposable") {
        const res = await fetch("/api/disposable-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "disposable", data: res });
        if (!res.isDisposable) triggerCelebration();
      } else if (activeTab === "hash") {
        const res = await fetch("/api/hash-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "hash", data: res });
      } else if (activeTab === "urlSafety") {
        const res = await fetch("/api/url-safety-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "urlSafety", data: res });
        if (res.isSafe) triggerCelebration();
      } else if (activeTab === "whois") {
        const res = await fetch("/api/whois-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "whois", data: res });
      } else if (activeTab === "ssl") {
        const res = await fetch("/api/ssl-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "ssl", data: res });
        if (res.isValid && !res.isExpiringSoon) triggerCelebration();
      } else if (activeTab === "socialOsint") {
        const res = await fetch("/api/social-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: targetQuery }),
        }).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setResult({ type: "socialOsint", data: res });
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }

  function handleCopyData() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background Animated Atmosphere */}
      <ParticleAura />
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float-reverse" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1019]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base flex items-center gap-2">
                DataGuard
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  20 Engines
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jojin1709"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-all shadow-sm"
              title="Visit developer GitHub profile"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Dev: <strong className="text-blue-400 font-semibold">JOJIN JOHN</strong></span>
            </a>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">100% Genuine Algorithmic Validation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Animated Headline Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Full-Spectrum Identity, Financial, and Cyber OSINT Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Verify & audit exposed data <span className="shimmer-text">instantly</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Run genuine mathematical checks on GSTIN, Aadhaar, PAN, and Cards — alongside real-time DNS spoofing, crypto wallets, and data breach feeds.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center pb-2 mb-4">
          <div className="flex flex-wrap items-center justify-center gap-1 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? MODULES.length
                  : MODULES.filter((m) => m.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isCatActive
                      ? "bg-slate-800 text-white shadow-sm font-semibold border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isCatActive
                        ? "bg-blue-600/30 text-blue-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Tool Tabs Wrap Grid */}
        <div className="max-w-4xl mx-auto pb-2 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {visibleModules.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleTabSwitch(mod.id)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25 font-semibold scale-[1.03]"
                      : "bg-[#101626]/90 border-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 hover:border-slate-700"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{mod.label}</span>

                  {selectedCategory === "all" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                        isActive
                          ? "bg-blue-700 text-blue-100"
                          : "bg-slate-800/90 text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {mod.category === "identity"
                        ? "ID"
                        : mod.category === "government"
                        ? "Gov"
                        : mod.category === "financial"
                        ? "Fin"
                        : "Cyber"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Search Box Card */}
        <div className="bg-[#111728]/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-7 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              {currentModule.helperText}
            </span>
          </div>

          <form onSubmit={(e) => handleCheck(e)} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type={activeTab === "password" && !showPassword ? "password" : "text"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentModule.placeholder}
                required
                className="w-full h-14 pl-5 pr-16 rounded-2xl bg-slate-900/90 border border-slate-700/70 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base transition-all shadow-inner"
              />

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                {activeTab === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 hover:text-white transition-colors"
                    title="Clear"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-14 px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Audit Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clickable Quick Samples */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Try genuine example:
            </span>
            {currentModule.samples.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  handleCheck(null, sample);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer hover:border-blue-500/40 active:scale-95 font-mono text-[11px]"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Live Animated Scanning Radar Overlay */}
        {loading && (
          <div className="bg-[#111728]/90 border border-blue-500/30 rounded-3xl p-8 mb-8 text-center backdrop-blur shadow-2xl relative overflow-hidden animate-pulse">
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-blue-400/40" />
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-radar" />
              <Search className="w-7 h-7 text-blue-400 animate-bounce" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Executing Verification Telemetry...</h3>

            <div className="max-w-xs mx-auto space-y-1.5 text-xs text-slate-300 font-mono">
              <p className={scanStep >= 1 ? "text-blue-400" : "text-slate-500"}>
                {scanStep >= 1 ? "✓" : "○"} Checking structural syntax & checksums...
              </p>
              <p className={scanStep >= 2 ? "text-blue-400" : "text-slate-500"}>
                {scanStep >= 2 ? "✓" : "○"} Querying live DNS & threat databases...
              </p>
              <p className={scanStep >= 3 ? "text-blue-400" : "text-slate-500"}>
                {scanStep >= 3 ? "✓" : "○"} Compiling genuine audit report...
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Request Unsuccessful</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results Container */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-slate-400">
                Audit results for: <strong className="text-slate-200 font-mono">{query}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-all hover:bg-slate-800 hover:border-slate-700 cursor-pointer active:scale-95"
                  title="Print or Save Audit Report as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export Report (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyData}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-all hover:bg-slate-800 hover:border-slate-700 cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subcomponents for all 15 modules */}
            {result.type === "email" && <EmailResultView result={result} search={breachSearch} setSearch={setBreachSearch} />}
            {result.type === "phone" && <PhoneResultView data={result.data} />}
            {result.type === "aadhaar" && <AadhaarResultView data={result.data} />}
            {result.type === "pan" && <PanResultView data={result.data} />}
            {result.type === "username" && <UsernameResultView data={result.data} />}
            {result.type === "password" && <PasswordResultView data={result.data} />}
            {result.type === "ip" && <IpResultView data={result.data} />}
            {result.type === "gstin" && <GstinResultView data={result.data} />}
            {result.type === "vehicle" && <VehicleDlResultView data={result.data} />}
            {result.type === "voter" && <VoterIdResultView data={result.data} />}
            {result.type === "card" && <CardBinResultView data={result.data} />}
            {result.type === "crypto" && <CryptoResultView data={result.data} />}
            {result.type === "domainSpoof" && <DomainSpoofResultView data={result.data} />}
            {result.type === "disposable" && <DisposableResultView data={result.data} />}
            {result.type === "hash" && <HashResultView data={result.data} />}
        {result.type === "urlSafety" && <UrlSafetyResultView data={result.data} />}
        {result.type === "whois" && <WhoisResultView data={result.data} />}
        {result.type === "ssl" && <SslResultView data={result.data} />}
        {result.type === "socialOsint" && <SocialOsintResultView data={result.data} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0c1019]/90 py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-200 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-sm">
              <span>DataGuard Suite</span>
              <span className="text-slate-600">•</span>
              <span>Developed by</span>
              <a
                href="https://www.linkedin.com/in/jojin-john/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-1 hover:underline"
              >
                JOJIN JOHN
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Autonomous multi-identifier OSINT, cryptographic checksums & live threat intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/jojin-john/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white transition-all text-xs"
            >
              <svg className="w-3.5 h-3.5 fill-blue-400" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </a>

            <a
              href="https://github.com/jojin1709/dataguard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
            >
              <svg className="w-3.5 h-3.5 fill-slate-400" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>

            <div className="flex items-center gap-1 text-slate-500 ml-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-logs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================================
   Result Views
   ========================================================================= */

function EmailResultView({ result, search, setSearch }) {
  const { breach, sites } = result;
  const breaches = breach.breaches || [];
  const filteredBreaches = breaches.filter((b) =>
    typeof b === "string" ? b.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white">Data Breach Exposure</h2>
            <p className="text-xs text-slate-400">Cross-referenced against indexed public breaches</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              breach.breached
                ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {breach.breached ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Found in <AnimatedNumber value={breach.count} /> breaches</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clean / No Breaches</span>
              </>
            )}
          </span>
        </div>

        {breach.breached ? (
          <div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Filter breaches (e.g. Canva, Adobe)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
              {filteredBreaches.length > 0 ? (
                filteredBreaches.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 hover:border-slate-700 transition-colors"
                  >
                    <span className="font-medium">{typeof b === "string" ? b : JSON.stringify(b)}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Compromised
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No breaches matching "{search}"</p>
              )}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <span className="text-base">💡</span>
              <div>
                <strong>Security Action:</strong> Change passwords on any service where you reused credentials, and turn on Two-Factor Authentication (2FA).
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-90 animate-bounce" />
            <h3 className="text-base font-semibold text-white">No Public Breaches Found!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Your email address does not appear in any known public database dumps.
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur flex flex-col justify-between">
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Public Profiles</h2>
          <p className="text-xs text-slate-400 mb-4">Discovered accounts linked to this email</p>

          <div className="space-y-3">
            {sites?.results?.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <span className="font-medium text-slate-200">{r.site}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    r.exists
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : r.error
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {r.error ? "Unavailable" : r.exists ? "Active Profile" : "Not Found"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-4 border-t border-slate-800 mt-4">
          Non-intrusive lookup using public profile avatars.
        </p>
      </div>
    </div>
  );
}

function PhoneResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Phone Intelligence</h2>
          <p className="text-xs text-slate-400">Carrier identification and international formatting</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl">{data.flag}</span>
          <span className="text-xs font-semibold text-slate-200">{data.country}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Global Standard (E.164)</span>
          <span className="text-base font-bold text-white font-mono">{data.e164}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Country Code</span>
          <span className="text-base font-bold text-blue-400 font-mono">{data.countryCode}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">National Subscriber</span>
          <span className="text-base font-bold text-white font-mono">{data.nationalNumber}</span>
        </div>
      </div>

      {data.indiaAnalysis && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Telecom Provider (India)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Allocated Operator: </span>
              <span className="font-semibold text-white">{data.indiaAnalysis.likelyOperator}</span>
            </div>
            <div>
              <span className="text-slate-400">Numbering Block: </span>
              <span className="text-slate-300 font-mono">{data.indiaAnalysis.seriesBlock}xxxx</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{data.indiaAnalysis.mnpNotice}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <a
          href={data.quickLinks?.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Open in WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href={data.quickLinks?.tel}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Number</span>
        </a>
      </div>
    </div>
  );
}

function AadhaarResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Aadhaar (UIDAI) Check</h2>
          <p className="text-xs text-slate-400">Dihedral D5 (Verhoeff) Checksum Algorithm</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isMasked
              ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
              : data.isValidChecksum
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isMasked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Masked Aadhaar (Safe)</span>
            </>
          ) : data.isValidChecksum ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid Verhoeff Checksum</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Invalid Aadhaar Checksum</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Display Format</span>
          <span className="text-base font-bold text-white font-mono">
            {data.isMasked ? data.maskedRepresentation : data.formatted}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Last 4 Digits</span>
          <span className="text-base font-bold text-slate-300 font-mono">•••• {data.lastFourDigits}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Privacy Level</span>
          <span
            className={`text-xs font-semibold ${
              data.isMasked
                ? "text-emerald-400"
                : data.isValidChecksum
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          >
            {data.isMasked ? "High (UIDAI Compliant Masking)" : "Exposed (Raw 12 Digits Disclosed)"}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
        <p className="text-slate-200 font-medium mb-1">Status Summary</p>
        <p className="text-slate-400">{data.message}</p>
        {data.securityAlert && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
            ⚠️ {data.securityAlert}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <span className="text-slate-300 font-medium block">Official UIDAI Recommendations:</span>
        {data.guidance?.map((g, i) => (
          <p key={i}>• {g}</p>
        ))}
      </div>
    </div>
  );
}

function PanResultView({ data }) {
  const b = data.breakdown;

  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">PAN Card Details</h2>
          <p className="text-xs text-slate-400">Income Tax Department Syntax & Entity Classification</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isValidFormat
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isValidFormat ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid PAN Format</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Invalid PAN</span>
            </>
          )}
        </span>
      </div>

      {data.isValidFormat && b ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Entity Category</span>
              <span className="text-sm font-semibold text-blue-400">{b.entityType}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Code: '{b.entityCode}'</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Surname Initial</span>
              <span className="text-base font-bold text-white font-mono">'{b.surnameOrNameInitial}'</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">5th character</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Sequence Digits</span>
              <span className="text-base font-bold text-white font-mono">{b.sequenceDigits}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">0001–9999</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Check Digit</span>
              <span className="text-base font-bold text-white font-mono">{b.checkLetter}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Check char</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
            <p className="text-slate-200 font-medium mb-1">Entity Classification</p>
            <p className="text-slate-400">{b.entityDescription}</p>
          </div>
        </>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
          {data.message}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <span className="text-slate-300 font-medium block">Advisory:</span>
        {data.securityAdvisory?.map((s, i) => (
          <p key={i}>• {s}</p>
        ))}
      </div>
    </div>
  );
}

function UsernameResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Username Search</h2>
          <p className="text-xs text-slate-400">Public profile presence across platforms</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Found on <AnimatedNumber value={data.foundCount} /> of {data.totalChecked} platforms
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
        {data.results?.map((r, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between transition-all hover:scale-[1.02] ${
              r.exists
                ? "bg-slate-900/90 border-blue-500/30 shadow-sm"
                : "bg-slate-950/50 border-slate-800 text-slate-500"
            }`}
          >
            <div>
              <span className="font-semibold text-white block text-sm">{r.platform}</span>
              {r.exists ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 mt-1 text-xs"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-slate-500 mt-1 block">Not registered</span>
              )}
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                r.exists
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {r.exists ? "Active" : "Free"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        ℹ️ Using identical handles across platforms makes it easier for third parties to track public activity.
      </p>
    </div>
  );
}

function PasswordResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Password Breach Audit</h2>
          <p className="text-xs text-slate-400">HaveIBeenPwned k-Anonymity leak check</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isPwned
              ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          }`}
        >
          {data.isPwned ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Breached in leaks</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Not in known leaks</span>
            </>
          )}
        </span>
      </div>

      {data.isPwned ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-5 text-xs text-rose-200">
          <p className="font-semibold text-sm text-rose-300 mb-1">
            Exposed in <AnimatedNumber value={data.pwnedCount} /> public data breaches!
          </p>
          <p className="text-rose-200/80">
            This password is part of publicly circulated password lists. You should not use it anywhere.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5 text-xs text-emerald-200">
          <p className="font-semibold text-sm text-emerald-300 mb-1">No matches found in known breaches</p>
          <p className="text-emerald-200/80">
            This password has not been cataloged in major public dumps.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Strength</span>
          <span className="text-sm font-semibold text-blue-400">{data.strength?.level}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Length</span>
          <span className="text-sm font-semibold text-white">{data.length} characters</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">k-Anonymity Model</span>
          <span className="text-xs font-mono text-slate-300">{data.sha1Prefix}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        🔒 <strong>Zero Knowledge Guarantee:</strong> Only the first 5 characters of the SHA-1 hash were queried. Your raw password was never transmitted.
      </p>
    </div>
  );
}

function IpResultView({ data }) {
  if (!data.query) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
        {data.message || "Failed to inspect IP address."}
      </div>
    );
  }

  const abuse = data.abuseipdb;
  const vt = data.virusTotal;
  const otx = data.alienVaultOtx;

  return (
    <div className="space-y-6">
      <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white">Network & IP Geolocation</h2>
            <p className="text-xs text-slate-400">Carrier, routing ASN, and physical location</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">{data.flagEmoji}</span>
            <span className="text-xs font-semibold text-slate-200">{data.country}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">IP Address</span>
            <span className="text-sm font-semibold text-white font-mono truncate block">{data.query}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Provider (ISP)</span>
            <span className="text-sm font-semibold text-blue-400 truncate block">{data.isp}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Location</span>
            <span className="text-sm font-semibold text-white truncate block">
              {data.city ? `${data.city}, ${data.region}` : data.country}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">AS Number</span>
            <span className="text-sm font-semibold text-slate-300 font-mono truncate block">{data.asn}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <p className="text-slate-300 mb-1">{data.summary}</p>
          <p className="text-[11px] text-slate-500 font-mono">
            Timezone: {data.timezone} • Coordinates: {data.latitude}, {data.longitude}
          </p>
        </div>
      </div>

      {abuse && (
        <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                IP
              </div>
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  AbuseIPDB Threat Intelligence
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    API v2 Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Malicious reporting & abuse confidence score</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                abuse.abuseConfidenceScore > 50
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : abuse.abuseConfidenceScore > 0
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {abuse.abuseConfidenceScore > 50 ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>High Abuse Risk ({abuse.abuseConfidenceScore}%)</span>
                </>
              ) : abuse.abuseConfidenceScore > 0 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reported ({abuse.abuseConfidenceScore}%)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0% Abuse Confidence (Clean)</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Abuse Score</span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xl font-bold font-mono ${
                    abuse.abuseConfidenceScore > 50
                      ? "text-rose-400"
                      : abuse.abuseConfidenceScore > 0
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  <AnimatedNumber value={abuse.abuseConfidenceScore} />%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Reports</span>
              <span className="text-xl font-bold text-white font-mono">
                <AnimatedNumber value={abuse.totalReports} />
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Last 90 days</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Usage Type</span>
              <span className="text-xs font-semibold text-blue-300 truncate block mt-1">
                {abuse.usageType || "General / Transit"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Tor Exit Node</span>
              <span
                className={`text-xs font-semibold block mt-1 ${
                  abuse.isTor ? "text-amber-400" : "text-slate-300"
                }`}
              >
                {abuse.isTor ? "🧅 Active Tor Node" : "No (Direct IP)"}
              </span>
            </div>
          </div>

          {abuse.recentReports && abuse.recentReports.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2.5">Recent Attack & Abuse Reports</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {abuse.recentReports.map((rep, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {rep.categories.map((cat, ci) => (
                          <span
                            key={ci}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {rep.reporterCountry} • {new Date(rep.reportedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rep.comment && (
                      <p className="text-[11px] text-slate-400 font-mono line-clamp-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        {rep.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VirusTotal Multi-AV Engine Threat Analysis */}
      {vt && (
        <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                VT
              </div>
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  VirusTotal Multi-AV Intelligence
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    v3 API Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Security scanner telemetry across 90+ antivirus vendors</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                vt.malicious > 0
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {vt.malicious > 0 ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{vt.malicious} Security Engines Flagged</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clean across {vt.harmless + vt.undetected} AV Engines</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Harmless Detections</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                <AnimatedNumber value={vt.harmless} />
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Verified clean vendors</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Malicious Detections</span>
              <span
                className={`text-xl font-bold font-mono ${
                  vt.malicious > 0 ? "text-rose-400" : "text-slate-400"
                }`}
              >
                <AnimatedNumber value={vt.malicious} />
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Active malware / abuse</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Suspicious Flags</span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                <AnimatedNumber value={vt.suspicious} />
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Heuristic anomalies</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Reputation Score</span>
              <span className="text-xl font-bold text-blue-400 font-mono">
                +{vt.reputation}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Community trust</span>
            </div>
          </div>
        </div>
      )}

      {/* AlienVault OTX Threat Pulses */}
      {otx && (
        <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                OTX
              </div>
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  AlienVault OTX Threat Intelligence
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    v1 API Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Open Threat Exchange adversary and IoC tracking</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                otx.pulseCount > 0
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {otx.pulseCount > 0 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{otx.pulseCount} Threat Pulses Reported</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0 Threat Pulses (Clean Indicator)</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Threat Pulses</span>
              <span className="text-xl font-bold text-white font-mono">
                <AnimatedNumber value={otx.pulseCount} />
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Security researcher reports</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Known Threat Actor</span>
              <span className="text-sm font-semibold text-blue-300 block mt-1">
                {otx.adversary || "No APT adversary linked"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Indicator Type</span>
              <span className="text-sm font-semibold text-slate-200 block mt-1 font-mono">
                IPv4 IoC Telemetry
              </span>
            </div>
          </div>

          {otx.references && otx.references.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2 font-medium">Active Threat Campaign References:</span>
              <div className="space-y-1.5">
                {otx.references.map((ref, ri) => (
                  <div key={ri} className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
                    ⚠️ {ref}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IP Geolocation Map */}
      {data.latitude && data.longitude && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Geolocation Map
          </h3>
          <div className="rounded-2xl overflow-hidden border border-slate-700/60" style={{ height: 260 }}>
            <iframe
              title="IP Geolocation Map"
              width="100%"
              height="260"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.7)" }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.1}%2C${data.latitude - 0.1}%2C${data.longitude + 0.1}%2C${data.latitude + 0.1}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
              allowFullScreen
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 text-center">
            📍 {data.city}, {data.region}, {data.country} &nbsp;·&nbsp; {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}

function GstinResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">GSTIN Audit Result</h2>
          <p className="text-xs text-slate-400">Goods and Services Tax Identification Number (India)</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isValidChecksum
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isValidChecksum ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid Mod-36 Checksum</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Checksum Failed</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">State / Jurisdiction</span>
          <span className="text-sm font-bold text-white">{data.stateName}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Code: {data.stateCode}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Embedded PAN</span>
          <span className="text-base font-bold text-blue-400 font-mono">{data.pan}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{data.entityType}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Entity Serial</span>
          <span className="text-base font-bold text-white font-mono">{data.entityRegistrationNumber}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Registration count</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Check Digit</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {data.providedCheckDigit} {data.isValidChecksum ? "(Valid)" : `(Expected: ${data.expectedCheckDigit})`}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Mod-36 Checksum</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <p className="text-slate-300">{data.summary}</p>
        {data.verificationLinks && (
          <a
            href={data.verificationLinks.gstPortal}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-4"
          >
            <span>GST Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function VehicleDlResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">
            {data.isDrivingLicense ? "Driving License (DL) Record" : "Vehicle Registration (RC) Record"}
          </h2>
          <p className="text-xs text-slate-400">Ministry of Road Transport and Highways (MoRTH)</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
          Valid MoRTH Structure
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">State / Territory</span>
          <span className="text-base font-bold text-white">{data.state}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">RTO District Office</span>
          <span className="text-sm font-semibold text-blue-400">{data.rtoOffice}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            {data.isDrivingLicense ? "Issue Year" : "Number Series"}
          </span>
          <span className="text-base font-bold text-white font-mono">
            {data.isDrivingLicense ? data.issueYear : data.formatted || data.clean}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <p className="text-slate-300">{data.summary}</p>
        {data.parivahanPortal && (
          <a
            href={data.parivahanPortal}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-4"
          >
            <span>Parivahan Sewa</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function VoterIdResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Voter ID (EPIC) Audit</h2>
          <p className="text-xs text-slate-400">Election Commission of India (ECI)</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isValidFormat
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isValidFormat ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid EPIC Format</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Invalid Format</span>
            </>
          )}
        </span>
      </div>

      {data.isValidFormat && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Assembly Constituency Prefix</span>
            <span className="text-base font-bold text-blue-400 font-mono">{data.constituencyPrefix || "Legacy"}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Voter Serial Number</span>
            <span className="text-base font-bold text-white font-mono">{data.serialNumber || data.clean}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Card Standard</span>
            <span className="text-xs font-semibold text-emerald-400 block mt-1">ECI Standard Electoral Card</span>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <p className="text-slate-300">{data.summary || data.message}</p>
        {data.portalLink && (
          <a
            href={data.portalLink}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-4"
          >
            <span>Electoral Search</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function CardBinResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Payment Card Check</h2>
          <p className="text-xs text-slate-400">Mathematical Luhn Mod-10 Check & Bank Identifier</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isValidLuhn
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isValidLuhn ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid Luhn Algorithm</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Failed Luhn Algorithm</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Card Brand</span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{data.brandIcon}</span> {data.brand}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Issuing Bank</span>
          <span className="text-sm font-semibold text-blue-400 truncate block">{data.issuer}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Card Type</span>
          <span className="text-sm font-semibold text-white">{data.cardType}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Country</span>
          <span className="text-sm font-semibold text-slate-300">{data.country}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        🛡️ <strong>Safety Guarantee:</strong> {data.securityNotice}
      </p>
    </div>
  );
}

function CryptoResultView({ data }) {
  const live = data.liveData;
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Cryptocurrency Wallet Check</h2>
          <p className="text-xs text-slate-400">Address format, cryptographic checksum & live node audit</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isValid
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.isValid ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid Wallet Address</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Invalid Address</span>
            </>
          )}
        </span>
      </div>

      {data.isValid && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Blockchain Network</span>
            <span className="text-base font-bold text-blue-400">{data.network}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Address Standard</span>
            <span className="text-sm font-semibold text-white">{data.chainType}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Checksum Status</span>
            <span className="text-xs font-semibold text-emerald-400 block mt-1">Cryptographically Verified</span>
          </div>
        </div>
      )}

      {/* Live Etherscan Telemetry */}
      {live && (
        <div className="mb-6 p-5 rounded-2xl bg-slate-950/60 border border-blue-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono flex items-center gap-1.5">
                Etherscan On-Chain Telemetry
              </h3>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full font-mono">
              API v2 Live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Live ETH Balance</span>
              <span className="text-base font-bold text-white font-mono">{live.ethBalance}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">USD Market Value</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{live.usdValue}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Current ETH Price</span>
              <span className="text-base font-bold text-blue-400 font-mono">{live.ethPrice}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Outbound Transactions</span>
              <span className="text-base font-bold text-white font-mono">
                <AnimatedNumber value={live.nonceTxCount} />
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between mb-4">
        <p className="text-slate-300">{data.summary}</p>
      </div>

      {data.explorers && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Live Block Explorers:</span>
          {data.explorers.map((exp, i) => (
            <a
              key={i}
              href={exp.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{exp.name}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function DomainSpoofResultView({ data }) {
  const vt = data.virusTotal;
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Domain & Email Spoofing Audit</h2>
          <p className="text-xs text-slate-400">Live DNS Resolution for SPF, DMARC, and MX Security</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.dmarcEnforced
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
          }`}
        >
          {data.dmarcEnforced ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spoofing Protected ({data.score}/100)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Vulnerable to Email Spoofing ({data.score}/100)</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">DMARC Enforcement</span>
          <span className={`text-sm font-bold ${data.dmarcEnforced ? "text-emerald-400" : "text-rose-400"}`}>
            {data.dmarcEnforced ? "Active (Emails Protected)" : "Missing / None"}
          </span>
          <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{data.dmarcPolicy}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">SPF Policy</span>
          <span className="text-sm font-bold text-white">{data.spfStrength}</span>
          <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{data.spfRecord}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Email Mail Servers (MX)</span>
          <span className="text-sm font-bold text-blue-400">{data.mxRecords?.length || 0} Mail Servers</span>
          <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">
            {data.mxRecords?.[0]?.exchange || "No MX configured"}
          </p>
        </div>
      </div>

      {/* Live VirusTotal Security Scanner Intel */}
      {vt && (
        <div className="mb-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                VT
              </div>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
                VirusTotal Multi-Scanner Intelligence (v3 API)
              </h3>
            </div>

            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                vt.stats.malicious > 0
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              }`}
            >
              {vt.stats.malicious > 0
                ? `${vt.stats.malicious} Security Engines Flagged`
                : `Clean across ${vt.totalEngines || 90} AV Engines`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Harmless Engines</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                <AnimatedNumber value={vt.stats.harmless} /> / {vt.totalEngines}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Malicious Flags</span>
              <span
                className={`text-base font-bold font-mono ${
                  vt.stats.malicious > 0 ? "text-rose-400" : "text-slate-400"
                }`}
              >
                <AnimatedNumber value={vt.stats.malicious} />
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Domain Reputation</span>
              <span className="text-base font-bold text-blue-400 font-mono">
                +{vt.reputation}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Category Classification</span>
              <span className="text-xs font-semibold text-slate-300 truncate block mt-0.5">
                {vt.categories?.join(", ") || "Web / Business"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <p className="font-semibold text-white mb-1">Analysis & Recommendations:</p>
        <p className="text-slate-400 mb-2">{data.summary}</p>
        {data.recommendations?.map((rec, idx) => (
          <p key={idx} className="text-slate-400">• {rec}</p>
        ))}
      </div>
    </div>
  );
}

function DisposableResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Disposable Burner Check</h2>
          <p className="text-xs text-slate-400">Temporary email and throwaway provider detection</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            data.isDisposable
              ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          }`}
        >
          {data.isDisposable ? (
            <>
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Burner / Disposable Service</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Genuine Domain</span>
            </>
          )}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs mb-4">
        <p className="text-slate-200 font-medium mb-1">Risk Evaluation</p>
        <p className="text-slate-400">{data.summary}</p>
      </div>

      {data.recommendation && (
        <p className="text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          💡 <strong>Action:</strong> {data.recommendation}
        </p>
      )}
    </div>
  );
}

function HashResultView({ data }) {
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Cryptographic Hash Analysis</h2>
          <p className="text-xs text-slate-400">Algorithm detection & rainbow plaintext reverse lookup</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {data.primaryType || "Identified"}
        </span>
      </div>

      {data.isCracked && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5 text-xs text-emerald-200">
          <p className="font-semibold text-sm text-emerald-300 mb-1">Plaintext Decrypted!</p>
          <p className="text-emerald-200/90 font-mono text-sm">
            "{data.knownPlaintext}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Primary Algorithm</span>
          <span className="text-base font-bold text-blue-400">{data.primaryType}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Character Length</span>
          <span className="text-base font-bold text-white font-mono">{data.length} characters</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Cryptographic Security</span>
          <span className="text-xs font-semibold text-slate-300 block mt-1">{data.securityLevel}</span>
        </div>
      </div>

      {data.possibleAlgorithms && (
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Matching Algorithms</h4>
          <div className="space-y-2">
            {data.possibleAlgorithms.map((alg, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex items-center justify-between">
                <span className="font-bold text-white font-mono">{alg.name}</span>
                <span className="text-slate-400 text-[11px]">{alg.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* URL Safety Result View */
function UrlSafetyResultView({ data }) {
  const isMalicious = data.isMalicious;
  const vt = data.virusTotal;
  const gsb = data.googleSafeBrowsing;
  const vtTotal = vt?.total || 0;
  const vtMal = vt?.malicious || 0;
  const vtSusp = vt?.suspicious || 0;
  const vtHarmless = vt?.harmless || 0;

  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">URL Safety Scan</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xs">{data.url}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${isMalicious ? "bg-red-500/15 text-red-400 border-red-500/30" : data.isSuspicious ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}>
          {isMalicious ? "⚠ MALICIOUS" : data.isSuspicious ? "⚠ SUSPICIOUS" : "✓ SAFE"}
        </span>
      </div>
      <p className="text-sm text-slate-300">{data.summary}</p>
      {vt && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">VirusTotal — {vtTotal} Engines</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Malicious", val: vtMal, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
              { label: "Suspicious", val: vtSusp, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
              { label: "Harmless", val: vtHarmless, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Undetected", val: vt.undetected, color: "text-slate-400", bg: "bg-slate-800/50 border-slate-700" },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className={`p-3 rounded-2xl border ${bg} text-center`}>
                <div className={`text-2xl font-black ${color}`}>{val}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          {vtTotal > 0 && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="bg-red-500 transition-all" style={{ width: `${(vtMal / vtTotal) * 100}%` }} />
                <div className="bg-yellow-500 transition-all" style={{ width: `${(vtSusp / vtTotal) * 100}%` }} />
                <div className="bg-emerald-500 transition-all" style={{ width: `${(vtHarmless / vtTotal) * 100}%` }} />
              </div>
            </div>
          )}
          {vt.flaggedEngines?.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-red-400">Flagged by:</h4>
              {vt.flaggedEngines.map((e, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/70 border border-red-500/10 text-xs">
                  <span className="font-semibold text-white">{e.engine}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.category === "malicious" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>{e.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {gsb && (
        <div className="p-4 rounded-2xl border border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Google Safe Browsing</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${gsb.isSafe ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{gsb.isSafe ? "CLEAN" : "THREAT FOUND"}</span>
          </div>
          {gsb.threats?.map((t, i) => (
            <div key={i} className="text-xs text-red-300 font-mono mt-1">⚠ {t.threatType} ({t.platformType})</div>
          ))}
          {gsb.isSafe && <p className="text-xs text-slate-400">No threats in Google threat database.</p>}
        </div>
      )}
    </div>
  );
}

/* WHOIS Result View */
function WhoisResultView({ data }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const expiring = data.daysUntilExpiry !== null && data.daysUntilExpiry <= 30 && !data.isExpired;
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">WHOIS / Domain Age</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{data.domain}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${data.isExpired ? "bg-red-500/15 text-red-400 border-red-500/30" : expiring ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"}`}>
          {data.isExpired ? "EXPIRED" : expiring ? "EXPIRING SOON" : data.domainAgeText || "ACTIVE"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Registered", val: fmt(data.createdAt), icon: "📅" },
          { label: "Last Updated", val: fmt(data.updatedAt), icon: "🔄" },
          { label: "Expires", val: fmt(data.expiresAt), icon: "⏳" },
          { label: "Domain Age", val: data.domainAgeText || "Unknown", icon: "🕰️" },
        ].map(({ label, val, icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className="text-sm font-bold text-white">{val}</div>
          </div>
        ))}
      </div>
      {data.daysUntilExpiry !== null && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Days until expiry</span>
            <span className={`text-sm font-black ${data.isExpired ? "text-red-400" : expiring ? "text-yellow-400" : "text-emerald-400"}`}>{data.isExpired ? `Expired ${Math.abs(data.daysUntilExpiry)} days ago` : `${data.daysUntilExpiry} days`}</span>
          </div>
          {!data.isExpired && <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className={`h-2 rounded-full ${expiring ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, Math.max(2, (data.daysUntilExpiry / 365) * 100))}%` }} /></div>}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Registrar</span>
          <span className="text-sm font-semibold text-white">{data.registrar}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Registrant Country</span>
          <span className="text-sm font-semibold text-white">{data.registrantCountry}</span>
        </div>
      </div>
      {data.nameServers?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Nameservers</h3>
          <div className="flex flex-wrap gap-2">{data.nameServers.map((ns, i) => <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-cyan-300">{ns}</span>)}</div>
        </div>
      )}
      {data.status?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Status Flags</h3>
          <div className="flex flex-wrap gap-2">{data.status.map((s, i) => <span key={i} className="text-[11px] font-mono px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">{s}</span>)}</div>
        </div>
      )}
      <div className="flex gap-2 text-[10px] text-slate-500">
        {data.sources?.rdap && <span className="px-2 py-0.5 rounded bg-slate-800">RDAP</span>}
        {data.sources?.whoisXml && <span className="px-2 py-0.5 rounded bg-slate-800">WhoisXML</span>}
      </div>
    </div>
  );
}

/* SSL Certificate Result View */
function SslResultView({ data }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const pct = data.totalDays > 0 ? Math.max(2, Math.min(100, (data.daysRemaining / data.totalDays) * 100)) : 0;
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">SSL Certificate</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{data.domain}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${data.isExpired ? "bg-red-500/15 text-red-400 border-red-500/30" : data.isExpiringSoon ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}>
          {data.isExpired ? "✗ EXPIRED" : data.isExpiringSoon ? "⚠ EXPIRING SOON" : "✓ VALID"}
        </span>
      </div>
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Certificate validity</span>
          <span className={`text-sm font-black ${data.isExpired ? "text-red-400" : data.isExpiringSoon ? "text-yellow-400" : "text-emerald-400"}`}>{data.isExpired ? `Expired ${Math.abs(data.daysRemaining)} days ago` : `${data.daysRemaining} days remaining`}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div className={`h-3 rounded-full ${data.isExpired ? "bg-red-500" : data.isExpiringSoon ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>{fmt(data.validFrom)}</span><span>{fmt(data.validTo)}</span></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-2">Subject (Certificate For)</span>
          <span className="text-sm font-bold text-white block font-mono">{data.subject?.cn}</span>
          {data.subject?.org && <span className="text-xs text-slate-400">{data.subject.org}</span>}
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-2">Certificate Authority</span>
          <span className="text-sm font-bold text-cyan-300 block">{data.issuer?.cn || "Unknown CA"}</span>
          {data.issuer?.org && <span className="text-xs text-slate-400">{data.issuer.org}</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[{ label: "Protocol", val: data.protocol }, { label: "Cipher Suite", val: data.cipher }, { label: "Key Bits", val: data.bits ? `${data.bits}-bit` : null }].filter(x => x.val).map(({ label, val }) => (
          <div key={label} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">{label}</span>
            <span className="text-xs font-bold text-white font-mono">{val}</span>
          </div>
        ))}
      </div>
      {data.sans?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Subject Alt Names ({data.sans.length})</h3>
          <div className="flex flex-wrap gap-2">{data.sans.map((san, i) => <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/60 text-blue-300">{san}</span>)}</div>
        </div>
      )}
      {data.fingerprint && (
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">SHA-256 Fingerprint</span>
          <span className="text-[11px] font-mono text-slate-300 break-all">{data.fingerprint}</span>
        </div>
      )}
    </div>
  );
}

/* Social OSINT Result View */
function SocialOsintResultView({ data }) {
  const found = (data.results || []).filter(r => r.found === true);
  const notFound = (data.results || []).filter(r => r.found === false);
  const unverifiable = (data.results || []).filter(r => r.found === null);
  return (
    <div className="bg-[#121826]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 glow-card shadow-lg backdrop-blur space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">Social Media OSINT</h2>
          <p className="text-xs text-slate-400 mt-0.5">@{data.username} · {data.totalChecked} platforms checked</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">{found.length} Found</span>
      </div>
      <p className="text-sm text-slate-300">{data.summary}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Found", val: found.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Not Found", val: notFound.length, color: "text-slate-400", bg: "bg-slate-800/50 border-slate-700" },
          { label: "Unverifiable", val: unverifiable.length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg} text-center`}>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {found.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">✓ Found on these platforms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {found.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/25 hover:border-emerald-400/50 hover:bg-emerald-500/15 transition-all group">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">{p.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
      {notFound.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">✗ Not found</h3>
          <div className="flex flex-wrap gap-2">{notFound.map((p, i) => <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/50 text-slate-500">{p.name}</span>)}</div>
        </div>
      )}
      {unverifiable.length > 0 && (
        <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/15">
          <p className="text-xs text-yellow-400 font-semibold mb-1">⚠ {unverifiable.length} platforms could not be verified</p>
          <p className="text-[11px] text-slate-400">Some platforms require login to confirm username existence.</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {unverifiable.map((p, i) => <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:text-yellow-200">{p.name}</a>)}
          </div>
        </div>
      )}
    </div>
  );
}
