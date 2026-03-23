import type { Metadata } from "next";
import ClerkClientProvider from "@/components/ClerkClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalkunesia — Platform Kalkulator Keuangan Indonesia",
  description: "10+ kalkulator keuangan gratis: KPR, PPh 21, BPJS, Invoice, ROI, Budget. Akurat, cepat, tanpa daftar.",
  keywords: ["kalkulator keuangan", "kpr calculator", "pph 21", "bpjs", "invoice generator", "kalkunesia"],
  openGraph: {
    title: "Kalkunesia — Platform Kalkulator Keuangan Indonesia",
    description: "10+ kalkulator keuangan gratis untuk Indonesia.",
    url: "https://kalkunesia.com",
    siteName: "Kalkunesia",
    type: "website",
    images: [
      {
        url: "https://kalkunesia.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kalkunesia — Platform Kalkulator Keuangan Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalkunesia — Platform Kalkulator Keuangan Indonesia",
    description: "10+ kalkulator keuangan gratis untuk Indonesia.",
    images: ["https://kalkunesia.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&family=Inconsolata:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClerkClientProvider>
          <div className="page-bg" />
          <div className="print-header">
            <div className="ph-left">
              <div className="ph-logo">🧮</div>
              <div>
                <div className="ph-title">Kalku<em>nesia</em></div>
                <div className="ph-sub">Platform Kalkulator Keuangan Indonesia</div>
              </div>
            </div>
            <div className="ph-date">
              kalkunesia.com
            </div>
          </div>
          {children}
          <div className="print-footer" style={{ display: 'none' }}>
            <span>kalkunesia.com — Platform Kalkulator Keuangan Indonesia</span>
            <span>Hasil kalkulasi bersifat estimasi. Konsultasikan dengan ahli keuangan.</span>
          </div>
        </ClerkClientProvider>
      </body>
    </html>
  );
}
