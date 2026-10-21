import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    //Forward /api/... calls to the Spring boot backend
    proxy:{
      '/api':'http://localhost:8080',
    },
  },
});
