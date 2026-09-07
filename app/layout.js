import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://dataguard-suite.vercel.app"),
  title: "DataGuard — Privacy & Data Exposure Suite",
  description:
    "DataGuard by Jojin John: Check whether your personal information (Email, Phone, Aadhaar, PAN, Username, Password, IP, Crypto Wallet, or Domain) has been leaked in data breaches or exposed online. Powered by 15+ intelligence engines.",
  applicationName: "DataGuard",
  authors: [{ name: "Jojin John", url: "https://www.linkedin.com/in/jojin-john/" }],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "DataGuard — Privacy & Data Exposure Suite",
    description:
      "Scan emails, phones, IPs, crypto wallets, domains & more across 15+ intelligence engines. Built by Jojin John.",
    url: "https://dataguard-suite.vercel.app",
    siteName: "DataGuard",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "DataGuard Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DataGuard — Privacy & Data Exposure Suite",
    description: "Scan emails, phones, IPs, crypto wallets, domains & more. Built by Jojin John.",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
