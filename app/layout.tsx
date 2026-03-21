import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'SKOSS v0 foundation',
  description: 'Implementation-ready foundation for the first SKOSS version.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
