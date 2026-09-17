import https from 'node:https'
import dns from 'node:dns'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En local (npm run dev), les fonctions /api sont celles du site en ligne : mêmes données Supabase.
// Le nom masters-xv.fr est résolu via Cloudflare (1.1.1.1) pour ne pas dépendre du cache DNS de la box.
const resolver = new dns.Resolver()
resolver.setServers(['1.1.1.1', '8.8.8.8'])
const agent = new https.Agent({
  keepAlive: true,
  lookup: (hostname, options, callback) =>
    resolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses?.length) return dns.lookup(hostname, options, callback)
      return options?.all ? callback(null, [{ address: addresses[0], family: 4 }]) : callback(null, addresses[0], 4)
    }),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'https://masters-xv.fr', changeOrigin: true, secure: true, agent },
    },
  },
})
