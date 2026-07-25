import { createHash } from 'node:crypto'

import type { Plugin } from 'vite'

const PUBLIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/img/icons/android-chrome-192x192.png',
  '/img/icons/android-chrome-512x512.png',
  '/img/icons/apple-touch-icon.png',
  '/img/icons/maskable_icon.png',
  '/img/icons/safari-pinned-tab.svg',
]

export function day32Pwa(): Plugin {
  return {
    name: 'day32-pwa',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const generatedAssets = bundleFiles(bundle)
      const precache = [...new Set([...PUBLIC_ASSETS, ...generatedAssets])].sort()
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: serviceWorkerSource(precache, version),
      })
    },
  }
}

function bundleFiles(bundle: Record<string, { fileName: string }>): string[] {
  return Object.values(bundle)
    .filter((entry) => !entry.fileName.endsWith('.map'))
    .map((entry) => `/${entry.fileName}`)
}

function serviceWorkerSource(precache: string[], version: string): string {
  return `/* Day32 service worker ${version} */
const APP_CACHE = 'day32-app-${version}'
const FONT_CACHE = 'day32-fonts-v1'
const PRECACHE = ${JSON.stringify(precache)}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('day32-app-') && key !== APP_CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (
    url.hostname === 'accounts.google.com' ||
    url.hostname === 'www.googleapis.com' ||
    url.hostname === 'openidconnect.googleapis.com'
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    )
    return
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE))
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    )
  }
})

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)

  return cached || network
}
`
}
