import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  base: command === 'build' && mode === 'production' ? '/built-in-ai-examples/' : '/',
}));
