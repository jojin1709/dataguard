import "./globals.css";

export const metadata = {
  title: "Privacy & Data Exposure Checker",
  description:
    "Check whether your personal information (Email, Phone, Aadhaar, PAN, Username, Password, or IP) has been leaked in data breaches or exposed online.",
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
