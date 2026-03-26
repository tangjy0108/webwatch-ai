import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WebWatch AI",
    short_name: "WebWatch AI",
    description: "AI 情報過濾與每日科技 digest，幫你先看值得追的更新。",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#7C6FF7",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon?size=180",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
