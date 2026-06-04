import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A股 AI 研究台",
  description: "面向私人和朋友使用的 A 股 AI 辅助研究工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
