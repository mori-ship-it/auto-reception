import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

function safeExec(cmd){
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); }
  catch(e){ return 'unknown'; }
}

const COMMIT_HASH = safeExec('git rev-parse --short HEAD');
const BUILD_TIME = (function(){
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} JST`;
})();

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        drink: 'drink.html',
        register: 'register.html'
      }
    }
  }
})
