import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";
import ResetDbButton from "@/components/ResetDbButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NuttyFans",
  description: "Exclusive content from your favorite creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen bg-gray-50`}
      >
        <ClientLayout>
          {children}
          <Toaster position="top-right" />
          <ResetDbButton />
        </ClientLayout>
      </body>
    </html>
  );
}
