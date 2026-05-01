import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cat Catch Number',
  description: 'Playful mobile-first number catching game'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="game-gradient min-h-screen">{children}</body>
    </html>
  );
}
