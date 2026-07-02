import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/client/store";
import { ToastProvider } from "@/components/Toast";

const SITE_URL = "https://hemc.pk";
const DESC =
  "Traditional Unani & herbal remedies from Hashmi Eastern Medicine Clinic — kidney, brain, women's health and vitality formulas, formulated by hakeems and delivered across Pakistan.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HEMC — Hashmi Eastern Medicine Clinic",
    template: "%s · HEMC",
  },
  description: DESC,
  applicationName: "HEMC",
  keywords: [
    "Unani medicine", "herbal remedies", "Hashmi", "HEMC", "hakeem",
    "kidney formula", "brain tonic", "women's health", "Pakistan herbal medicine",
  ],
  authors: [{ name: "Hashmi Eastern Medicine Clinic" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "HEMC — Hashmi Eastern Medicine Clinic",
    title: "HEMC — Hashmi Eastern Medicine Clinic",
    description: DESC,
    url: SITE_URL,
    locale: "en_PK",
  },
  twitter: { card: "summary_large_image", title: "HEMC — Hashmi Eastern Medicine Clinic", description: DESC },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaf2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#07120d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('verda.theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <StoreProvider>{children}</StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
