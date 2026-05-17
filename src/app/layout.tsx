import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
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
  title: "ShapeScan — Descubra seu biotipo com IA",
  description:
    "Análise corporal personalizada por inteligência artificial. Receba seu biotipo, dieta e plano de treinos em minutos.",
  applicationName: "ShapeScan",
  appleWebApp: {
    capable: true,
    title: "ShapeScan",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1", // mesma cor do manifest (cor do app no celular)
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // usa toda a tela em iPhones com notch
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
      </body>
    </html>
  );
}
