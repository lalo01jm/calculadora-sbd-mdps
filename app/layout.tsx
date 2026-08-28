import type { Metadata } from "next";
import "./globals.css";

const basePath =
  process.env.GITHUB_ACTIONS === "true" ? "/calculadora-sbd-mdps" : "";

export const metadata: Metadata = {
  title: "Calculadora de 1RM · SBD y MDPS",
  description:
    "Calcula tu 1RM estimado para powerlifting y streetlifting con las fórmulas de Epley, Brzycki y Lombardi.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
