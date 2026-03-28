import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Darrin",
  description: "Homepage publica My Darrin conectata la Backoffice si pregatita pentru GCP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
