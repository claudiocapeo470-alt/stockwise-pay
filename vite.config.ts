import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      includeAssets: ["stocknix-logo-official.png"],
      manifest: {
        name: "Stocknix - Gestion de stock, caisse & boutique en ligne",
        short_name: "Stocknix",
        description: "Logiciel complet de gestion de stock, caisse POS, facturation, boutique en ligne et analytics pour PME/TPE",
        start_url: "/",
        display: "standalone",
        background_color: "#0A1A3B",
        theme_color: "#0A1A3B",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/stocknix-logo-official.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/stocknix-logo-official.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/stocknix-logo-official.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/stocknix-logo-official.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["business", "finance", "productivity"],
        lang: "fr",
        dir: "ltr",
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\.supabase\.co/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
