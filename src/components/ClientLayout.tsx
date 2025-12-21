'use client';

import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "./LayoutShell";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();

  return (
    <AuthProvider>
      <LayoutShell>
        {children}
      </LayoutShell>
    </AuthProvider>
  );
}
