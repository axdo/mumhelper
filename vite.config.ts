import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点部署在 https://<用户名>.github.io/mumhelper/ 子路径下
  base: '/mumhelper/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '妈妈帮手',
        short_name: '妈妈帮手',
        description: '记录喂奶开始与结束时间的小工具',
        lang: 'zh-CN',
        theme_color: '#e8836b',
        background_color: '#fff8f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/mumhelper/',
        scope: '/mumhelper/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
