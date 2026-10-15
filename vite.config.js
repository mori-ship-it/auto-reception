import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

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

// ビルドごとに dist/version.json を出力し、dist/sw.js の CACHE_NAME に
// コミットハッシュを埋め込む。sw.js が毎ビルドで変わるので
// registration.update() が差分を検知して SW が確実に更新される。
function emitBuildInfo(){
  return {
    name: 'emit-build-info',
    closeBundle(){
      const outDir = resolve('dist');
      writeFileSync(
        resolve(outDir, 'version.json'),
        JSON.stringify({ commitHash: COMMIT_HASH, buildTime: BUILD_TIME }, null, 2)
      );
      const swPath = resolve(outDir, 'sw.js');
      if(existsSync(swPath)){
        let s = readFileSync(swPath, 'utf8');
        s = s.replace(/CACHE_NAME\s*=\s*'[^']+'/, `CACHE_NAME = 'reception-${COMMIT_HASH}'`);
        writeFileSync(swPath, s);
      }
    }
  }
}

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  plugins: [emitBuildInfo()],
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
