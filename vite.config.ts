import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isExtension = process.env.BUILD_TARGET === 'extension';
  const isPWA = !isExtension;
  const deployTarget = process.env.DEPLOY_TARGET; // 'firebase' | 'github' | undefined

  // Firebase는 root에서 서빙하므로 base: '/', GitHub Pages는 /Nexus/
  const base = isExtension ? '/' : (deployTarget === 'firebase' ? '/' : '/Nexus/');

  return {
    base,
    publicDir: 'public',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // PWA 빌드일 때만 PWA 플러그인 활성화
      !isExtension && VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: {
          name: '인사이트부동산 노트앱',
          short_name: '인사이트부동산',
          description: 'A premium minimalist text memo manager for focus',
          theme_color: '#f8fafc',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 3600
                }
              }
            }
          ],
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        devOptions: {
          enabled: false
        }
      })
    ].filter(Boolean),
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.BUILD_TARGET': JSON.stringify(process.env.BUILD_TARGET || 'pwa')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: isExtension ? 'dist-extension' : 'dist-pwa',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html')
        }
      }
    }
  };
});
