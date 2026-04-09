import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { resolveLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "My Darrin",
  description: "Homepage publica My Darrin conectata la Backoffice si pregatita pentru GCP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const locale = resolveLocale(cookieStore.get("mydarrin_locale")?.value);
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
