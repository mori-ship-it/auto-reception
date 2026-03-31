// ===== Firebase SDK (npm — バージョン固定・CDN不要) =====
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// グローバルに公開（既存コードとの互換性）
window.firebase = firebase;

// ===== CSS =====
import './style.css';

// ===== HTML注入 =====
import htmlContent from '../html_body.txt?raw';
document.getElementById('app').innerHTML = htmlContent;

// ===== アプリロジック =====
import './app.js';
