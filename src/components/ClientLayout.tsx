'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "./LayoutShell";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith('/onboarding');
  const isAuthPage = pathname === '/login' || pathname === '/signup'; 
  // Depending on design, auth pages might also want to hide header/footer or have a minimal one.
  // For now, user specifically asked for onboarding.

  return (
    <AuthProvider>
      <LayoutShell>
        {children}
      </LayoutShell>
    </AuthProvider>
  );
}
