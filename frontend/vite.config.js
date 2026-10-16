// File này cấu hình Vite: bật plugin React, plugin Tailwind CSS và chỉ định JSX tự động cho toàn dự án.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: { jsx: 'automatic' },
  oxc: { jsx: { runtime: 'automatic' } },
});