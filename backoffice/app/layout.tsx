import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { resolveLocale } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "My Darrin Back Office",
  description: "Panou complet de administrare My Darrin",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("mydarrin_locale")?.value);
  return (
    <html lang={locale}>
      <body className={inter.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
