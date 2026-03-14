import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title: "WebWatch AI",
  description: "每日新聞摘要 + 職缺監控通知",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
