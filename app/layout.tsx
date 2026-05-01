import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'สุ่มเลขนำโชค',
  description: 'เกมสุ่มเลขนำโชคสุดน่ารัก'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="font-th antialiased">{children}</body>
    </html>
  );
}
