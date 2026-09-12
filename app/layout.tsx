import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vextio Ops",
  description: "Order and stock management for Vextio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
