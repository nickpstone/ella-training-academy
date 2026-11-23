import { createHash } from 'node:crypto'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [{
    name: 'academy-offline-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index?.type !== 'asset') throw new Error('Missing built app shell')
      this.emitFile({ type: 'asset', fileName: '404.html', source: index.source })
      const files = [...Object.keys(bundle), 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'ella.webp']
      const fingerprint = createHash('sha256')
      for (const item of Object.values(bundle)) fingerprint.update(item.type === 'asset' ? item.source : item.code)
      // Public assets can change independently of the JS and CSS bundles.
      fingerprint.update(publicAssetFingerprint())
      const version = fingerprint.digest('hex').slice(0, 16)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const cacheName = 'ella:' + self.registration.scope + ':${version}';
const scope = self.registration.scope;
const shell = new URL('index.html', scope).href;
const files = ${JSON.stringify([...new Set(files)])}.map(file => new URL(file, scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)));
});
self.addEventListener('activate', event => {
  const prefix = 'ella:' + scope + ':';
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(cacheName).then(cache => cache.match(shell)).then(response => response || fetch(request)));
  } else if (files.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(cache => cache.match(request)).then(response => response || fetch(request)));
  }
});
` })
    },
  }],
})

import { readFileSync } from 'node:fs'
function publicAssetFingerprint() {
  const hash = createHash('sha256')
  for (const file of ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'ella.webp']) {
    hash.update(readFileSync(new URL('./public/' + file, import.meta.url)))
  }
  return hash.digest()
}
