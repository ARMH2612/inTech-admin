import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBase = (env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
  const proxy: Record<string, string | ProxyOptions> = apiBase
    ? { '/api': { target: apiBase, changeOrigin: true, secure: apiBase.startsWith('https://') } }
    : {};

  return {
    server: {
      host: '127.0.0.1',
      proxy,
    },
  };
});
