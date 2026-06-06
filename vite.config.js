import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        quiz: resolve(__dirname, 'quiz.html'),
        pairing: resolve(__dirname, 'pairing.html'),
        map: resolve(__dirname, 'map.html'),
        builder: resolve(__dirname, 'builder.html')
      }
    }
  }
});
