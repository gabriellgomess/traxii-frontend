import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Importados dinamicamente na prova de vida; pré-bundle no boot do dev
    // server evita falha de "outdated optimize dep" no primeiro uso
    include: ['@tensorflow/tfjs', '@tensorflow-models/blazeface'],
  },
});
