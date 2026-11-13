import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RecoveryRedirect } from "@/components/auth/recovery-redirect";
import site from "@/config/site.json";
import { themeStyle } from "@/lib/theme";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: site.logo },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        style={
          themeStyle(site.primaryColor, site.accentColor) as React.CSSProperties
        }
      >
        <RecoveryRedirect />
        {children}
      </body>
    </html>
  );
}
