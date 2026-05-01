import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แมวกดเลขนำโชค | Cat Catch Number',
  description: 'เว็บสุ่มเลข 00-99 ด้วยน้องแมวสุดน่ารัก รองรับมือถือเต็มรูปแบบ'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="game-gradient min-h-screen">{children}</body>
    </html>
  );
}
