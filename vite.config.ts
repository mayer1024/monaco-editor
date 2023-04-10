import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  server: {	
    port:3555,			// ← ← ← ← ← ←
    // host: '0.0.0.0'	// ← 新增内容 ←
  },
   // 强制预构建插件包
  plugins: [vue(), monacoEditorPlugin({})]
})