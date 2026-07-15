import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
title: "武博留学补课系统",
description: "武博留学家长、老师、教务后台一体化补课排课系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
