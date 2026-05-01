import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "แตะจับอิโมจิ | เกมสุ่มเลข",
  description: "เกมสุ่มเลข 2 หลักด้วยการแตะอิโมจิลอยสุดน่ารัก",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="font-th">{children}</body>
    </html>
  );
}
