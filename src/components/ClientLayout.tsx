'use client';

import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "./LayoutShell";

import { useContentProtection } from "@/hooks/useContentProtection";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useContentProtection();

  return (
    <AuthProvider>
      <LayoutShell>
        {children}
      </LayoutShell>
    </AuthProvider>
  );
}
