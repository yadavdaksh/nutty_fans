'use client';

import { ReactNode } from 'react';

/**
 * Theme Provider Component
 * Ensures consistent theme application across the app
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
