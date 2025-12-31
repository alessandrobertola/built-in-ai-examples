import { defineConfig } from 'vite';
import { vitePluginMdToHTML } from 'vite-plugin-md-to-html';


export default defineConfig({
  plugins: [vitePluginMdToHTML(
    {
      syntaxHighlighting: true,
    }
  )],
});
