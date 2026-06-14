# Setup Guide — Colibri PWA

Comandos exatos para bootstrapping do projeto. Execute na ordem.

## 1. Scaffold Vite

```bash
npm create vite@latest colibri-app -- --template react-ts
cd colibri-app
```

## 2. Instalar dependências

```bash
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

## 3. Configurar Tailwind

Adicionar o plugin no `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          }
        ]
      },
      manifest: {
        name: 'Colibri — Seu companheiro TDAH',
        short_name: 'Colibri',
        description: 'Timer, tarefas e humor para cérebros que funcionam diferente',
        theme_color: '#7C3AED',
        background_color: '#121214',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
});
```

No `src/styles/index.css`:

```css
@import "tailwindcss";
```

## 4. Criar estrutura de pastas

```bash
mkdir -p src/components/shell
mkdir -p src/components/ui
mkdir -p src/components/shared
mkdir -p src/features/timer/components
mkdir -p src/features/mood/components
mkdir -p src/features/tasks/components
mkdir -p src/features/chat/components
mkdir -p src/features/profile/components
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/styles
mkdir -p src/types
mkdir -p public
```

## 5. Configurar tailwind.config.js

Usar a config com tokens Colibri conforme definido no SKILL.md.

## 6. Criar CLAUDE.md na raiz

O CLAUDE.md deve conter:
- Stack tecnológica resumida
- Estrutura de pastas
- Regras UX TDAH (1 toque, carga cognitiva, tom de voz)
- Paleta de cores
- Convenções de código

## 7. Build de verificação

```bash
npm run build
```

Deve completar sem erros e sem warnings.
