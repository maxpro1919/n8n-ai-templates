import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "群精华板 — 群里好东西，别丢了",
  description: "微信群有价值信息沉淀工具。手动粘贴群消息，打标签，群友可搜索浏览。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
