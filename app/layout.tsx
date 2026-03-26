import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/layout";

const deploymentUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const metadataBase = deploymentUrl ? new URL(`https://${deploymentUrl}`) : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "WebWatch AI",
    template: "%s | WebWatch AI",
  },
  description: "AI 情報過濾與每日科技 digest，幫你先看值得追的更新。",
  applicationName: "WebWatch AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WebWatch AI",
  },
  openGraph: {
    title: "WebWatch AI",
    description: "AI 情報過濾與每日科技 digest，幫你先看值得追的更新。",
    type: "website",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WebWatch AI preview card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebWatch AI",
    description: "AI 情報過濾與每日科技 digest，幫你先看值得追的更新。",
    images: ["/twitter-image"],
  },
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
