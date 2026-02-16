import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polling System",
  description: "Create and share polls with real-time results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
