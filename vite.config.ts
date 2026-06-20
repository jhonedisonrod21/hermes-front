import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gatewayTarget = env.VITE_HERMES_GATEWAY_PROXY_TARGET ?? 'http://127.0.0.1:8080';

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/auth': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false
        },
        '/bff': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
