import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { UserSync } from "./components/UserSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lesbian Quest",
  description: "A quest for lesbians",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <UserSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
