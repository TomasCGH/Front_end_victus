import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  // base: "/",
  plugins: [react()],
  // Forzar puerto fijo para que coincida con redirectUri MSAL y evitar fallback automático a otro puerto
  server: {
    port: 5174,
    strictPort: true,
  },
  // base: "https://andrias01.github.io/github-pages",
  // npm i --save-dev gh-pages
  // "predeploy": "npm run build",
  //   "deploy": "gh-pages -d dist"
  // en consola
  // npm run deploy
  // https://www.youtube.com/watch?v=ZI7MXe-6HzA
  // para netlify su configuracion es diferente dejar npm run build
  // y en package.json agregar dist
  
})
