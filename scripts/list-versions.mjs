#!/usr/bin/env node
// 全店舗の salon/${STORE_ID}.appVersion を読み出して一覧表示する。
// 受付アプリが起動時に書き込んだ最新ハッシュ・起動情報・UA・画面サイズを
// 遠隔で確認する用途。
//
// 使い方: npm run versions

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDopvxzyHEcm8KChamvVVaN9YVxHCamGx0',
  authDomain: 'salon-reception.firebaseapp.com',
  projectId: 'salon-reception',
  storageBucket: 'salon-reception.firebasestorage.app',
  messagingSenderId: '931290276865',
  appId: '1:931290276865:web:a855857799d47926d70c00',
  measurementId: 'G-BPDQTJ4KZ6'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function pad(s, n){
  s = String(s == null ? '' : s);
  if(s.length >= n) return s.substring(0, n);
  return s + ' '.repeat(n - s.length);
}

function short(iso){
  if(!iso) return '-';
  // 2026-10-15T19:30:00.000Z → 2026-10-15 19:30
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? m[1] + ' ' + m[2] : iso.substring(0, 16);
}

// userAgent を人間が読める短いラベルに分類する。
// ヘッドレスブラウザ／bot と実機の iPad などを見分けるのが主目的。
function classifyUA(ua){
  if(!ua) return '-';
  if(/HeadlessChrome|Puppeteer|PhantomJS|SlimerJS|Lighthouse/i.test(ua)) return 'bot';
  if(/vercelbot|bot\b|crawler|spider|preview-screenshot/i.test(ua)) return 'bot';
  if(/iPad/.test(ua)) return 'iPad';
  if(/iPhone/.test(ua)) return 'iPhone';
  if(/Android/.test(ua)) return 'Android';
  if(/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if(/Windows/i.test(ua)) return 'Win';
  return 'other';
}

async function main(){
  const snap = await getDocs(collection(db, 'salon'));
  const rows = [];
  snap.forEach(doc => {
    const v = (doc.data() && doc.data().appVersion) || {};
    rows.push({
      store: doc.id,
      commitHash: v.commitHash || '-',
      buildTime: v.buildTime || '-',
      startedAt: short(v.startedAt),
      screenSize: v.screenSize || '-',
      innerSize: v.innerSize || '-',
      uaClass: classifyUA(v.userAgent),
      userAgent: v.userAgent || ''
    });
  });
  rows.sort((a, b) => a.store.localeCompare(b.store));

  const w = { store: 24, hash: 10, build: 22, started: 18, screen: 12, inner: 12, ua: 7 };
  const header =
    pad('STORE_ID', w.store) +
    pad('HASH', w.hash) +
    pad('BUILD TIME', w.build) +
    pad('STARTED AT', w.started) +
    pad('SCREEN', w.screen) +
    pad('INNER', w.inner) +
    pad('UA', w.ua);
  console.log(header);
  console.log('-'.repeat(header.length));
  for(const r of rows){
    console.log(
      pad(r.store, w.store) +
      pad(r.commitHash, w.hash) +
      pad(r.buildTime, w.build) +
      pad(r.startedAt, w.started) +
      pad(r.screenSize, w.screen) +
      pad(r.innerSize, w.inner) +
      pad(r.uaClass, w.ua)
    );
  }
  console.log('');
  console.log(`total: ${rows.length} store(s)`);
  // ボットが混ざっていたら警告を出す
  const bots = rows.filter(r => r.uaClass === 'bot');
  if(bots.length){
    console.log('');
    console.log(`WARN: ${bots.length} store(s) look like bot/headless. Full UA:`);
    for(const r of bots){
      console.log(`  ${r.store}: ${r.userAgent}`);
    }
  }
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message || e); process.exit(1); });
