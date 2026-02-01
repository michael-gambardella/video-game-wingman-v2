import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Game Wingman",
  description: "Ask questions about video games and get accurate answers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
