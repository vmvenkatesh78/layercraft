import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
    },
  },
  clean: true,
  external: ['react', 'react-dom'],
  minify: true,
  sourcemap: true,
});