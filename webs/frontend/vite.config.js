import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Lắng nghe trên tất cả các địa chỉ IP
    port: process.env.PORT || 5173, // Sử dụng cổng từ biến môi trường hoặc cổng mặc định 5173
  },
  plugins: [react()],
});