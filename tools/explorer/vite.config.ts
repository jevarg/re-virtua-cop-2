import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { AliasOptions, defineConfig } from 'vite';

import tsConfig from './tsconfig.json';

const aliases: AliasOptions = {};
for (const [key, value] of Object.entries(tsConfig.compilerOptions.paths)) {
  const newKey = key.replace('/*', '');
  const newValue = value[0].replace('/*', '');

  aliases[newKey] = path.join(__dirname, newValue);
}

console.log('Aliases:', aliases);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: aliases
  },
  plugins: [react()]
});
