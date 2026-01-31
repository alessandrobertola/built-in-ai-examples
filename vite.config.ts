import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  base: command === 'build' && mode === 'production' ? '/built-in-ai-examples/' : '/',
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'pages/translator.html',
        'pages/language-detector.html',
        'pages/summarizer.html',
        'pages/writer.html',
        'pages/rewriter.html',
        'pages/prompt.html',
        'pages/proofreader.html',
      ],
    },
  },
}));
