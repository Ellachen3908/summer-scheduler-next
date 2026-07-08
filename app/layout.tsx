import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "暑期订课排课系统",
  description: "家长、老师、教务后台一体化排课系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
