import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shapescan-oficial.vercel.app"),
  title: "ShapeScan — Descubra seu biotipo com IA",
  description:
    "Análise corporal personalizada por inteligência artificial. Receba seu biotipo, dieta e plano de treinos em minutos.",
  applicationName: "ShapeScan",
  appleWebApp: {
    capable: true,
    title: "ShapeScan",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "ShapeScan — Descubra seu biotipo com IA",
    description:
      "Análise corporal personalizada por IA. Biotipo, dieta e treino em 2 minutos, de graça.",
    url: "https://shapescan-oficial.vercel.app",
    siteName: "ShapeScan",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShapeScan — Descubra seu biotipo com IA",
    description:
      "Análise corporal personalizada por IA. Biotipo, dieta e treino em 2 minutos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#fb923c", // orange-400 — combinando com identidade
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#111111]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
