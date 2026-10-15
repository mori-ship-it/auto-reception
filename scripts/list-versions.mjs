#!/usr/bin/env node
// 全店舗の salon/${STORE_ID}.appVersion を読み出して一覧表示する。
// 受付アプリが起動時に書き込んだ最新ハッシュと起動情報を遠隔で確認する用途。
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
      userAgent: v.userAgent || ''
    });
  });
  rows.sort((a, b) => a.store.localeCompare(b.store));

  const w = { store: 28, hash: 10, build: 22, started: 18, screen: 12 };
  const header =
    pad('STORE_ID', w.store) +
    pad('HASH', w.hash) +
    pad('BUILD TIME', w.build) +
    pad('STARTED AT', w.started) +
    pad('SCREEN', w.screen);
  console.log(header);
  console.log('-'.repeat(header.length));
  for(const r of rows){
    console.log(
      pad(r.store, w.store) +
      pad(r.commitHash, w.hash) +
      pad(r.buildTime, w.build) +
      pad(r.startedAt, w.started) +
      pad(r.screenSize, w.screen)
    );
  }
  console.log('');
  console.log(`total: ${rows.length} store(s)`);
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message || e); process.exit(1); });
