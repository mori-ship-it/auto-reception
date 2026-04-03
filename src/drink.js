import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const STORE_ID = import.meta.env.VITE_STORE_ID || 'muuk-hiratsuka';
const LIMIT_MS = 10 * 60 * 1000;

const firebaseConfig = {
  apiKey: "AIzaSyDopvxzyHEcm8KChamvVVaN9YVxHCamGx0",
  authDomain: "salon-reception.firebaseapp.com",
  projectId: "salon-reception",
  storageBucket: "salon-reception.firebasestorage.app",
  messagingSenderId: "931290276865",
  appId: "1:931290276865:web:a855857799d47926d70c00",
  measurementId: "G-BPDQTJ4KZ6"
};
if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let seat = '';
let salonName = '';
let webhookUrl = '';
let drinkMenu = [];
let currentCategory = 'hot';

// ===== Log helpers =====
function today(){
  const d=new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function nowFull(){
  const d=new Date();
  return (d.getMonth()+1)+'/'+d.getDate()+' '+d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');
}
async function addDrinkLog(name, type){
  try{
    const dateKey = today();
    const logRef = db.collection('logs').doc(STORE_ID + '_' + dateKey);
    const snap = await logRef.get();
    const entries = (snap.exists && snap.data().entries) ? snap.data().entries : [];
    entries.unshift({
      time: nowFull(),
      name: name,
      type: type,
      stylist: null
    });
    await logRef.set({ entries }, { merge: true });
  }catch(e){ console.warn('Drink log write error:', e); }
}

// ===== Seat =====
function initSeat(){
  const params = new URLSearchParams(window.location.search);
  const paramSeat = params.get('seat');
  if(paramSeat){
    seat = paramSeat;
    localStorage.setItem(`${STORE_ID}_drink_seat`, seat);
  } else {
    seat = localStorage.getItem(`${STORE_ID}_drink_seat`) || '';
  }
  const badge = document.getElementById('seatBadge');
  if(badge && seat) badge.textContent = '席' + seat;
}

// ===== Load from Firestore =====
async function loadData(){
  try{
    const snap = await db.collection('salon').doc(STORE_ID).get();
    if(snap.exists){
      const d = snap.data();
      if(d.webhookUrl) webhookUrl = d.webhookUrl;
      if(d.custom && d.custom.salonName) salonName = d.custom.salonName;
      if(d.drinkMenu) drinkMenu = d.drinkMenu;
      if(d.drinkEnabled===false){
        document.getElementById('tabs').style.display='none';
        document.getElementById('menuGrid').style.display='none';
        document.getElementById('confirmBg').style.display='none';
        var cb=document.getElementById('callStaffBtn'); if(cb) cb.style.display='none';
        var rp=document.getElementById('requestPanel'); if(rp) rp.classList.add('active');
        return;
      }
    }
  }catch(e){ console.warn('Drink load error:', e); }
  renderTabs();
  renderMenu();
}

// ===== Tabs =====
function renderTabs(){
  const el = document.getElementById('tabs');
  if(!el) return;
  const categories = [];
  const seen = {};
  drinkMenu.filter(function(d){ return d.visible!==false; }).forEach(function(d){
    if(!seen[d.category]){ seen[d.category]=true; categories.push(d.category); }
  });
  if(!categories.length){ el.innerHTML=''; return; }
  if(!seen[currentCategory]) currentCategory = categories[0];
  el.innerHTML = categories.map(function(cat){
    var label = cat==='hot'?'HOT':cat==='cold'?'COLD':cat;
    return '<button class="tab '+cat+(cat===currentCategory?' active':'')+'" data-cat="'+cat+'">'+label+'</button>';
  }).join('');
  el.querySelectorAll('.tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentCategory = btn.dataset.cat;
      renderTabs();
      renderMenu();
    });
  });
}

// ===== Menu =====
function renderMenu(){
  const el = document.getElementById('menuGrid');
  if(!el) return;
  const items = drinkMenu.filter(function(d){ return d.category === currentCategory && d.visible !== false; });
  if(!items.length){
    el.innerHTML = '<div class="empty">メニューがありません</div>';
    return;
  }
  el.innerHTML = items.map(function(d){
    return '<div class="drink-card" data-id="'+d.id+'"><div class="drink-name">'+d.name+'</div>'+(d.nameEn?'<div class="drink-name-en">'+d.nameEn+'</div>':'')+'</div>';
  }).join('');
  el.querySelectorAll('.drink-card').forEach(function(card){
    card.addEventListener('click', function(){
      var id = parseInt(card.dataset.id);
      var item = drinkMenu.find(function(d){ return d.id===id; });
      if(item) showConfirm(item);
    });
  });
}

// ===== Confirm =====
var _pendingItem = null;

function showConfirm(item){
  _pendingItem = item;
  var name = document.getElementById('confirmName');
  if(name) name.textContent = '【'+item.name+'】';
  var bg = document.getElementById('confirmBg');
  if(bg) bg.classList.add('active');
}

function hideConfirm(){
  _pendingItem = null;
  var bg = document.getElementById('confirmBg');
  if(bg) bg.classList.remove('active');
}

// ===== Order =====
async function orderDrink(item){
  // rate limit check
  var lastOrder = parseInt(localStorage.getItem(`${STORE_ID}_drink_last`)||'0');
  var now = Date.now();
  if(now - lastOrder < LIMIT_MS){
    var remaining = Math.ceil((LIMIT_MS - (now - lastOrder)) / 60000);
    var limitSub = document.getElementById('limitSub');
    if(limitSub) limitSub.textContent = 'あと約'+remaining+'分お待ちください';
    showOverlay('limitOverlay', 3000);
    return;
  }

  localStorage.setItem(`${STORE_ID}_drink_last`, String(now));

  // Slack notify
  var seatLabel = seat ? '席'+seat : '不明席';
  var storeName = salonName || STORE_ID;
  var msg = '\uD83C\uDF79 '+seatLabel+' - '+item.name+'（'+storeName+'）';
  if(webhookUrl){
    try{
      await fetch(webhookUrl, {
        method:'POST',
        body: JSON.stringify({text: msg})
      });
    }catch(e){ console.warn('Slack error:', e); }
  }

  // Firestore log
  const seatInfo = seat ? '（'+seat+'席）' : '';
  await addDrinkLog(item.name + seatInfo, 'drink');

  showOverlay('doneOverlay', 5000);
}

function showOverlay(id, duration){
  var el = document.getElementById(id);
  if(!el) return;
  el.classList.add('active');
  setTimeout(function(){ el.classList.remove('active'); }, duration);
}

// ===== Call Staff =====
async function callStaff(){
  var lastCall = parseInt(localStorage.getItem(`${STORE_ID}_call_last`)||'0');
  var now = Date.now();
  if(now - lastCall < LIMIT_MS){
    var remaining = Math.ceil((LIMIT_MS - (now - lastCall)) / 60000);
    var sub = document.getElementById('callLimitSub');
    if(sub) sub.textContent = 'あと約'+remaining+'分お待ちください';
    showOverlay('callLimitOverlay', 3000);
    return;
  }
  localStorage.setItem(`${STORE_ID}_call_last`, String(now));
  var seatLabel = seat ? '席'+seat : '不明席';
  var storeName = salonName || STORE_ID;
  var msg = '\uD83D\uDD14 '+seatLabel+' - スタッフ呼び出し（'+storeName+'）';
  if(webhookUrl){
    try{
      await fetch(webhookUrl, {method:'POST', body:JSON.stringify({text:msg})});
    }catch(e){ console.warn('Slack error:', e); }
  }
  await addDrinkLog(seatLabel + ' - スタッフ呼び出し', 'call');
  showOverlay('callOverlay', 5000);
}

// ===== Request =====
const REQUEST_LIMIT_MS = 2 * 60 * 1000;

async function sendRequest(){
  var textarea = document.getElementById('requestText');
  if(!textarea) return;
  var text = textarea.value.trim();
  if(!text) return;

  var lastReq = parseInt(localStorage.getItem(STORE_ID + '_request_last') || '0');
  var now = Date.now();
  if(now - lastReq < REQUEST_LIMIT_MS){
    var remaining = Math.ceil((REQUEST_LIMIT_MS - (now - lastReq)) / 60000);
    var limitSub = document.getElementById('limitSub');
    if(limitSub) limitSub.textContent = 'あと約' + remaining + '分お待ちください';
    showOverlay('limitOverlay', 3000);
    return;
  }

  localStorage.setItem(STORE_ID + '_request_last', String(now));

  var seatLabel = seat ? '席' + seat : '不明席';
  var storeName = salonName || STORE_ID;
  var msg = '\uD83D\uDCAC ' + seatLabel + ' - ' + text + '（' + storeName + '）';
  if(webhookUrl){
    try{
      await fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ text: msg }) });
    }catch(e){ console.warn('Slack error:', e); }
  }

  var seatInfo = seat ? '（' + seat + '席）' : '';
  await addDrinkLog(text + seatInfo, 'request');

  textarea.value = '';
  showOverlay('doneOverlay', 5000);
}

// ===== Init =====
initSeat();
loadData();
var callBtn = document.getElementById('callStaffBtn');
if(callBtn) callBtn.addEventListener('click', callStaff);
var confirmYes = document.getElementById('confirmYes');
if(confirmYes) confirmYes.addEventListener('click', function(){ if(_pendingItem){ var item=_pendingItem; hideConfirm(); orderDrink(item); } });
var confirmNo = document.getElementById('confirmNo');
if(confirmNo) confirmNo.addEventListener('click', hideConfirm);
var confirmBg = document.getElementById('confirmBg');
if(confirmBg) confirmBg.addEventListener('click', function(e){ if(e.target===confirmBg) hideConfirm(); });
var requestSendBtn = document.getElementById('requestSendBtn');
if(requestSendBtn) requestSendBtn.addEventListener('click', sendRequest);
var requestCallBtn = document.getElementById('requestCallBtn');
if(requestCallBtn) requestCallBtn.addEventListener('click', callStaff);
