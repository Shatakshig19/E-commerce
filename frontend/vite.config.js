import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      "/api":{
        target:"http://localhost:5000",
        changeOrigin: true,
        secure: false,
        onError(err, req, res) {
          console.error('Proxy error:', err);
          if (err.code === 'ECONNREFUSED') {
            res.writeHead(502, {
              'Content-Type': 'text/plain'
            });
            res.end('The backend server is not running.');
          } else {
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
          }
        }
      },
    },
  },
})
