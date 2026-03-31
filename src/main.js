// ===== CSS =====
import './style.css';

// ===== HTML注入 =====
import htmlContent from '../html_body.txt?raw';
document.getElementById('app').innerHTML = htmlContent;

// ===== アプリロジック（Firebase初期化含む） =====
import './app.js';
