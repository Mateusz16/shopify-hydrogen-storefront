import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/remix-oxygen/vite';
import {remix} from '@remix-run/dev';
import path from 'node:path';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), remix()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
  server: {
    port: 3000,
  },
});
