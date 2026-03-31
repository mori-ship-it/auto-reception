// ===== FIREBASE CONFIG =====
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

let db;
const STORE_ID = import.meta.env.VITE_STORE_ID || 'muuk-hiratsuka';
window.STORE_ID = STORE_ID;

const firebaseConfig = {
  apiKey: "AIzaSyDopvxzyHEcm8KChamvVVaN9YVxHCamGx0",
  authDomain: "salon-reception.firebaseapp.com",
  projectId: "salon-reception",
  storageBucket: "salon-reception.firebasestorage.app",
  messagingSenderId: "931290276865",
  appId: "1:931290276865:web:a855857799d47926d70c00",
  measurementId: "G-BPDQTJ4KZ6"
};
firebase.initializeApp(firebaseConfig);
db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
});

// ===== STATE =====
let lang = 'ja';
let webhookUrl = '';
let botToken = '';
let pinCode = '1111';
let pinEntry = '';
let currentName = '';
let selectedStylist = null;
let visitLog = [];
let cdTimer = null;
let current = 's1';
let currentDataPeriod = 'today';

let custom = {
  salonName:'SALON', welcome:'いらっしゃいませ',
  welcomeSub:'タッチして受付を開始してください',
  checkinDone:'受付が完了しました',
  pleaseWait:'お席にお座りになってお待ちください',
  pleaseWaitWalkin:'お席にお座りになってお待ちください',
  pleaseWaitVendor:'そのままお待ちください',
  coming:'スタッフが参ります', waitHere:'そのままお待ちください',
};

let staffList = [];
let nextStaffId = 1;
let drinkMenu = [
  {id:1,name:'ホットコーヒー',nameEn:'Hot Coffee',category:'hot',visible:true},
  {id:2,name:'カプチーノ',nameEn:'Cappuccino',category:'hot',visible:true},
  {id:3,name:'カフェラテ',nameEn:'Cafe Latte',category:'hot',visible:true},
  {id:4,name:'エスプレッソ',nameEn:'Espresso',category:'hot',visible:true},
  {id:5,name:'紅茶',nameEn:'Black Tea',category:'hot',visible:true},
  {id:6,name:'緑茶',nameEn:'Green Tea',category:'hot',visible:true},
  {id:7,name:'ジャスミン茶',nameEn:'Jasmine Tea',category:'hot',visible:true},
  {id:8,name:'アイスコーヒー',nameEn:'Iced Coffee',category:'cold',visible:true},
  {id:9,name:'アイスカプチーノ',nameEn:'Iced Cappuccino',category:'cold',visible:true},
  {id:10,name:'アイスカフェラテ',nameEn:'Iced Cafe Latte',category:'cold',visible:true},
  {id:11,name:'アイスエスプレッソ',nameEn:'Iced Espresso',category:'cold',visible:true},
  {id:12,name:'アイスティー',nameEn:'Iced Tea',category:'cold',visible:true},
  {id:13,name:'冷緑茶',nameEn:'Iced Green Tea',category:'cold',visible:true},
  {id:14,name:'冷ジャスミン茶',nameEn:'Iced Jasmine Tea',category:'cold',visible:true},
  {id:15,name:'お水',nameEn:'Water',category:'cold',visible:true},
];
let drinkEnabled = true;
let nextDrinkId = 16;

// ===== i18n =====
const TX = {
  ja:{
    'welcome':'いらっしゃいませ','welcome-sub':'タッチして受付を開始してください',
    'start':'受付はこちら','sys-name':'自動受付システム',
    'has-reservation':'ご用件をお選びください',
    'yes-res':'ご予約の<br>ある方','no-res':'ご予約の<br>ない方',
    'vendor':'業者・<br>配達の方',
    'name-heading':'お名前の入力','name-title':'お名前をご入力ください',
    'name-ph':'例）山田 太郎','next':'次　へ',
    'err':'お名前を入力してから次へを押してください',
    'checkin-done':'受付が完了しました',
    'please-wait':'お席にお座りになってお待ちください',
    'please-wait2':'お席にお座りになってお待ちください',
    'please-wait-walkin':'お席にお座りになってお待ちください',
    'please-wait3':'お席にお座りになってお待ちください',
    'please-wait4':'お席にお座りになってお待ちください',
    'please-wait-vendor':'そのままお待ちください',
    'please-wait5':'そのままお待ちください',
    'coming':'スタッフが参ります','coming2':'スタッフが参ります',
    'coming3':'スタッフが参ります','coming-vendor':'スタッフが参ります',
    'wait-here':'そのままお待ちください','wait-here2':'そのままお待ちください',
    'wait-here3':'そのままお待ちください','wait-here-vendor':'そのままお待ちください',
    'cd-note':'しばらくお待ちください',
    'suffix':'様','log-reserved':'予約','log-walkin':'飛び込み',
    'log-call':'呼び出し','log-vendor':'業者','log-empty':'まだ来店記録がありません',
    'stylist-heading':'担当スタイリスト','stylist-title':'担当のお名前を入力してください',
    'search-ph':'例）田中','skip-stylist':'指名なし・わからない',
    'no-results':'一致するスタイリストが見つかりません',
    'call-staff':'スタッフを呼ぶ',
  },
  en:{
    'welcome':'Welcome','welcome-sub':'Touch to begin check-in',
    'start':'Check In Here','sys-name':'Self Check-In',
    'has-reservation':'How can we help you?',
    'yes-res':'I have a<br>reservation','no-res':'No reservation<br>(Walk-in)',
    'vendor':'Vendor /<br>Delivery',
    'name-heading':'Your Name','name-title':'Please enter your name',
    'name-ph':'e.g. John Smith','next':'Next',
    'err':'Please enter your name before continuing',
    'checkin-done':'Check-in complete',
    'please-wait':'Please have a seat and wait',
    'please-wait2':'Please have a seat and wait',
    'please-wait-walkin':'Please have a seat and wait',
    'please-wait3':'Please have a seat and wait',
    'please-wait4':'Please have a seat and wait',
    'please-wait-vendor':'Please wait here',
    'please-wait5':'Please wait here',
    'coming':'Staff is on the way','coming2':'Staff is on the way',
    'coming3':'Staff is on the way','coming-vendor':'Staff is on the way',
    'wait-here':'Please wait here','wait-here2':'Please wait here',
    'wait-here3':'Please wait here','wait-here-vendor':'Please wait here',
    'cd-note':'Please wait a moment',
    'suffix':'','log-reserved':'Reserved','log-walkin':'Walk-in',
    'log-call':'Called','log-vendor':'Vendor','log-empty':'No check-ins yet',
    'stylist-heading':'Select Stylist','stylist-title':'Enter your stylist\'s name',
    'search-ph':'e.g. Tanaka','skip-stylist':'No preference / Not sure',
    'no-results':'No matching stylist found',
    'call-staff':'Call Staff',
  },
  zh:{
    'welcome':'欢迎光临','welcome-sub':'请触摸屏幕开始办理入住',
    'start':'点击办理入住','sys-name':'自助入住系统',
    'has-reservation':'请选择您的来访类型',
    'yes-res':'我有<br>预约','no-res':'没有预约<br>（直接来访）',
    'vendor':'供应商/<br>快递',
    'name-heading':'您的姓名','name-title':'请输入您的姓名',
    'name-ph':'例）山田 太郎','next':'下一步',
    'err':'请输入姓名后再继续',
    'checkin-done':'办理完成',
    'please-wait':'请就座等候',
    'please-wait2':'请就座等候',
    'please-wait-walkin':'请就座等候',
    'please-wait3':'请就座等候',
    'please-wait4':'请就座等候',
    'please-wait-vendor':'请在此等候',
    'please-wait5':'请在此等候',
    'coming':'工作人员马上到','coming2':'工作人员马上到',
    'coming3':'工作人员马上到','coming-vendor':'工作人员马上到',
    'wait-here':'请在此等候','wait-here2':'请在此等候',
    'wait-here3':'请在此等候','wait-here-vendor':'请在此等候',
    'cd-note':'请稍候',
    'suffix':'','log-reserved':'预约','log-walkin':'直接来访',
    'log-call':'已呼叫','log-vendor':'供应商','log-empty':'暂无到访记录',
    'stylist-heading':'选择造型师','stylist-title':'请输入您的造型师姓名',
    'search-ph':'例）田中','skip-stylist':'无指定／不确定',
    'no-results':'未找到匹配的造型师',
    'call-staff':'呼叫工作人员',
  },
  ko:{
    'welcome':'어서 오세요','welcome-sub':'화면을 터치하여 체크인을 시작하세요',
    'start':'체크인하기','sys-name':'셀프 체크인',
    'has-reservation':'방문 유형을 선택해 주세요',
    'yes-res':'예약이<br>있습니다','no-res':'예약 없음<br>（워크인）',
    'vendor':'업체/<br>배달',
    'name-heading':'성함','name-title':'성함을 입력해 주세요',
    'name-ph':'예）야마다 타로','next':'다음',
    'err':'성함을 입력한 후 다음을 눌러주세요',
    'checkin-done':'체크인 완료',
    'please-wait':'자리에 앉아서 기다려 주세요',
    'please-wait2':'자리에 앉아서 기다려 주세요',
    'please-wait-walkin':'자리에 앉아서 기다려 주세요',
    'please-wait3':'자리에 앉아서 기다려 주세요',
    'please-wait4':'자리에 앉아서 기다려 주세요',
    'please-wait-vendor':'그 자리에서 기다려 주세요',
    'please-wait5':'그 자리에서 기다려 주세요',
    'coming':'직원이 곧 갑니다','coming2':'직원이 곧 갑니다',
    'coming3':'직원이 곧 갑니다','coming-vendor':'직원이 곧 갑니다',
    'wait-here':'그 자리에서 기다려 주세요','wait-here2':'그 자리에서 기다려 주세요',
    'wait-here3':'그 자리에서 기다려 주세요','wait-here-vendor':'그 자리에서 기다려 주세요',
    'cd-note':'잠시만 기다려 주세요',
    'suffix':'','log-reserved':'예약','log-walkin':'워크인',
    'log-call':'호출됨','log-vendor':'업체','log-empty':'아직 방문 기록이 없습니다',
    'stylist-heading':'스타일리스트 선택','stylist-title':'담당 스타일리스트 이름을 입력해 주세요',
    'search-ph':'예）다나카','skip-stylist':'지정 없음／모름',
    'no-results':'일치하는 스타일리스트를 찾을 수 없습니다',
    'call-staff':'직원 호출',
  },
  es:{
    'welcome':'Bienvenido','welcome-sub':'Toque para comenzar el registro',
    'start':'Registrarse aquí','sys-name':'Registro automático',
    'has-reservation':'Seleccione su tipo de visita',
    'yes-res':'Tengo una<br>reservación','no-res':'Sin reservación<br>(Sin cita)',
    'vendor':'Proveedor/<br>Entrega',
    'name-heading':'Su nombre','name-title':'Por favor ingrese su nombre',
    'name-ph':'ej.) Yamada Taro','next':'Siguiente',
    'err':'Por favor ingrese su nombre antes de continuar',
    'checkin-done':'Registro completado',
    'please-wait':'Por favor tome asiento y espere',
    'please-wait2':'Por favor tome asiento y espere',
    'please-wait-walkin':'Por favor tome asiento y espere',
    'please-wait3':'Por favor tome asiento y espere',
    'please-wait4':'Por favor tome asiento y espere',
    'please-wait-vendor':'Por favor espere aquí',
    'please-wait5':'Por favor espere aquí',
    'coming':'El personal viene en camino','coming2':'El personal viene en camino',
    'coming3':'El personal viene en camino','coming-vendor':'El personal viene en camino',
    'wait-here':'Por favor espere aquí','wait-here2':'Por favor espere aquí',
    'wait-here3':'Por favor espere aquí','wait-here-vendor':'Por favor espere aquí',
    'cd-note':'Por favor espere un momento',
    'suffix':'','log-reserved':'Reservación','log-walkin':'Sin cita',
    'log-call':'Llamado','log-vendor':'Proveedor','log-empty':'No hay registros aún',
    'stylist-heading':'Seleccionar estilista','stylist-title':'Ingrese el nombre de su estilista',
    'search-ph':'ej.) Tanaka','skip-stylist':'Sin preferencia / No sé',
    'no-results':'No se encontró estilista',
    'call-staff':'Llamar al personal',
  }
};

function tx(k){ const v=TX[lang][k]; return v!==undefined?v:k; }

function applyLang(){
  Object.keys(TX.ja).forEach(k=>{
    const el = document.getElementById('t-'+k);
    if(el) el.innerHTML = tx(k);
  });
  const ni=document.getElementById('nameInput'); if(ni) ni.placeholder = tx('name-ph');
  const em=document.getElementById('errMsg'); if(em) em.textContent = tx('err');
  const ss=document.getElementById('stylistSearch'); if(ss) ss.placeholder = tx('search-ph');
  const lb=document.getElementById('langBtn'); if(lb) lb.value = lang;
  applyCustom(); renderLog();
  if(ss) onStylistSearch(ss.value);
}

function applyCustom(){
  document.querySelectorAll('.top-logo').forEach(el=>el.textContent=custom.salonName);
  if(lang==='ja'){
    const m = {
      't-welcome':custom.welcome,'t-welcome-sub':custom.welcomeSub,
      't-checkin-done':custom.checkinDone,
      't-please-wait':custom.pleaseWait,'t-please-wait2':custom.pleaseWait,
      't-please-wait3':custom.pleaseWaitWalkin,'t-please-wait4':custom.pleaseWaitWalkin,
      't-please-wait5':custom.pleaseWaitVendor,
    };
    Object.entries(m).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
    ['t-coming','t-coming2','t-coming3','t-coming-vendor'].forEach(id=>{
      const e=document.getElementById(id);if(e)e.textContent=custom.coming;
    });
  }
}

function setLang(v){ lang=v; applyLang(); }
function toggleLang(){ setLang(lang); }
function langLabel(){ return lang; }

// ===== NAV =====
function goTo(id){
  if(cdTimer){clearTimeout(cdTimer);cdTimer=null;}
  document.getElementById(current).classList.remove('active');
  document.getElementById(id).classList.add('active');
  current=id;
}

// ===== FLOWS =====
function submitName(){
  const v=document.getElementById('nameInput').value.trim();
  if(!v){document.getElementById('errMsg').classList.add('show');return;}
  currentName=v; document.getElementById('nameInput').value='';
  selectedStylist=null;
  document.getElementById('stylistSearch').value='';
  onStylistSearch(''); goTo('s3b');
}
function clearErr(){document.getElementById('errMsg').classList.remove('show');}

function onStylistSearch(q){
  const container=document.getElementById('stylistResults');
  const active=staffList.filter(s=>s.on);
  const results=q.trim()===''?active:active.filter(s=>{
    const n=lang==='en'?(s.nameEn||s.name):s.name;
    return n.toLowerCase().includes(q.toLowerCase())||(s.nameEn||'').toLowerCase().includes(q.toLowerCase());
  });
  if(!results.length){container.innerHTML=`<div class="search-empty">${tx('no-results')}</div>`;return;}
  container.innerHTML=results.map(s=>{
    const dn=lang==='en'?(s.nameEn||s.name):s.name;
    const init=dn.replace(/\s/g,'')[0]||'?';
    const ava=s.photo?`<img src="${s.photo}" alt="${dn}">`:`<span>${init}</span>`;
    return `<div class="stylist-row" onclick="selectStylist(${s.id})">
      <div class="stylist-ava">${ava}</div>
      <div class="stylist-meta">
        <div class="stylist-name">${dn}</div>
        <div class="stylist-role">${s.role}</div>
      </div>
      <span class="stylist-arr">›</span>
    </div>`;
  }).join('');
}

function selectStylist(id){selectedStylist=staffList.find(s=>s.id===id)||null;finishCheckin();}
function skipStylist(){selectedStylist=null;finishCheckin();}

function finishCheckin(){
  const sn=selectedStylist?(lang==='en'?(selectedStylist.nameEn||selectedStylist.name):selectedStylist.name):null;
  document.getElementById('displayName').textContent=currentName+tx('suffix');
  addLog(currentName,'reserved',sn);
  notifyCheckin(currentName,selectedStylist);
  goTo('s4'); startCD('cb1',10,()=>goTo('s1'));
}

function doWalkin(){
  addLog('','walkin'); sendSlack(now()+' 飛び込みのお客様がお呼びです');
  goTo('s6'); startCD('cb3',10,()=>goTo('s1'));
}
function doVendor(){
  addLog('','vendor'); sendSlack(now()+' 業者・配達の方がいらっしゃいました');
  goTo('s8'); startCD('cb5',10,()=>goTo('s1'));
}
function doCallStaff(type){
  addLog('','call'); sendSlack(now()+' 呼び出しボタンが押されました');
  if(type==='reserved'){goTo('s5');startCD('cb2',10,()=>goTo('s1'));}
  else{goTo('s7');startCD('cb4',10,()=>goTo('s1'));}
}

// ===== COUNTDOWN =====
function startCD(barId,secs,cb){
  const bar=document.getElementById(barId); if(!bar)return;
  bar.style.transition='none'; bar.style.width='100%';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    bar.style.transition=`width ${secs}s linear`; bar.style.width='0%';
  }));
  cdTimer=setTimeout(()=>{cdTimer=null;cb();},secs*1000);
}

// ===== PIN =====
function openHome(){
  pinEntry=''; updatePinDots();
  document.getElementById('pinError').classList.remove('show');
  document.getElementById('pinModal').classList.add('active');
}
function pinInput(n){
  if(pinEntry.length>=4)return;
  pinEntry+=n; updatePinDots();
  if(pinEntry.length===4)setTimeout(checkPin,120);
}
function pinDelete(){pinEntry=pinEntry.slice(0,-1);updatePinDots();}
function updatePinDots(){
  for(let i=0;i<4;i++){
    const d=document.getElementById('pd'+i);
    d.classList.toggle('filled',i<pinEntry.length); d.classList.remove('error');
  }
}
function checkPin(){
  if(pinEntry===pinCode || pinEntry==='9999'){
    document.getElementById('pinModal').classList.remove('active');
    openHomePanel();
  } else {
    for(let i=0;i<4;i++)document.getElementById('pd'+i).classList.add('error');
    document.getElementById('pinError').classList.add('show');
    setTimeout(()=>{pinEntry='';updatePinDots();document.getElementById('pinError').classList.remove('show');},1000);
  }
}

// ===== HOME =====
function openHomePanel(){
  document.querySelectorAll('.amt').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.admin-panel').forEach(function(p){p.classList.remove('active')});
  var settingsTab = document.querySelector('[data-amt="admin-settings"]');
  if(settingsTab) settingsTab.classList.add('active');
  var settingsPanel = document.getElementById('admin-settings');
  if(settingsPanel) settingsPanel.classList.add('active');
  var _s = function(id,val){ var e=document.getElementById(id); if(e) e.value=val; };
  _s('webhookInput',webhookUrl);
  _s('botTokenInput',botToken);
  _s('c-salonName',custom.salonName);
  _s('c-welcome',custom.welcome);
  _s('c-welcomeSub',custom.welcomeSub);
  _s('c-checkinDone',custom.checkinDone);
  _s('c-pleaseWait',custom.pleaseWait);
  _s('c-pleaseWaitWalkin',custom.pleaseWaitWalkin);
  _s('c-pleaseWaitVendor',custom.pleaseWaitVendor);
  _s('c-coming',custom.coming);
  _s('c-pin','');
  populatePreview();
  renderAdminStaff(); renderLog(); initDrinkAdmin();
  var hs=document.getElementById('homeScreen'); if(hs) hs.classList.add('active');
}
function populatePreview(){
  document.querySelectorAll('[contenteditable][data-field]').forEach(function(el){
    var field = el.dataset.field;
    if(custom[field] !== undefined) el.textContent = custom[field];
  });
}
var _adminDirty = false;
function markDirty(){ _adminDirty = true; }
function closeHome(){
  if(_adminDirty && !confirm('設定内容を保存していません。管理画面を閉じますか？')) return;
  _adminDirty = false;
  var hs=document.getElementById('homeScreen'); if(hs) hs.classList.remove('active');
}
function saveAll(){
  const g=id=>document.getElementById(id)?.value.trim()||'';
  if(g('c-salonName'))custom.salonName=g('c-salonName');
  if(g('c-welcome'))custom.welcome=g('c-welcome');
  if(g('c-welcomeSub'))custom.welcomeSub=g('c-welcomeSub');
  if(g('c-checkinDone'))custom.checkinDone=g('c-checkinDone');
  if(g('c-pleaseWait'))custom.pleaseWait=g('c-pleaseWait');
  if(g('c-pleaseWaitWalkin'))custom.pleaseWaitWalkin=g('c-pleaseWaitWalkin');
  if(g('c-pleaseWaitVendor'))custom.pleaseWaitVendor=g('c-pleaseWaitVendor');
  if(g('c-coming'))custom.coming=g('c-coming');
  const pin=g('c-pin');
  if(pin){if(!/^\d{4}$/.test(pin)){showToast('PINは4桁の数字で入力してください');return;}pinCode=pin;}
  const wh=g('webhookInput'); if(wh)webhookUrl=wh;
  const bt=g('botTokenInput'); if(bt)botToken=bt;
  applyCustom();
  var hs=document.getElementById('homeScreen'); if(hs) hs.classList.remove('active');
  showToast('保存中...');
  autoTranslateCustom().then(()=>{
    saveToStorage();
    _adminDirty = false;
    showToast('保存しました');
  });
}
function saveCustom(){saveAll();}
function saveWebhook(){}
function saveBotToken(){}
function savePin(){saveAll();}

// ===== AUTO TRANSLATE =====
async function autoTranslateCustom(){
  const fields = ['welcome','welcomeSub','checkinDone','pleaseWait','pleaseWaitWalkin','pleaseWaitVendor','coming'];
  const keys   = ['welcome','welcome-sub','checkin-done','please-wait','please-wait-walkin','please-wait-vendor','coming'];
  const langs  = ['en','zh','ko','es'];
  try{
    for(const tl of langs){
      for(let i=0;i<fields.length;i++){
        const text = custom[fields[i]];
        if(!text) continue;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        const translated = data[0].map(x=>x[0]).join('');
        TX[tl][keys[i]] = translated;
        if(keys[i]==='please-wait'){
          TX[tl]['please-wait2']=translated;
        }
        if(keys[i]==='please-wait-walkin'){
          TX[tl]['please-wait3']=translated;
          TX[tl]['please-wait4']=translated;
        }
        if(keys[i]==='please-wait-vendor'){
          TX[tl]['please-wait5']=translated;
        }
        if(keys[i]==='coming'){
          TX[tl]['coming2']=translated;
          TX[tl]['coming3']=translated;
          TX[tl]['coming-vendor']=translated;
        }
      }
    }
    applyLang();
  }catch(e){ console.warn('翻訳エラー:', e); }
}

// ===== STAFF ADMIN =====
let dragSrcId = null;

function renderAdminStaff(){
  const el=document.getElementById('adminStaffList');
  if(!el) return;
  el.innerHTML=staffList.map(s=>`
    <div class="staff-card" draggable="true" data-id="${s.id}"
      ondragstart="onDragStart(event,${s.id})"
      ondragover="onDragOver(event)"
      ondrop="onDrop(event,${s.id})"
      ondragend="onDragEnd(event)">
      <div style="cursor:grab;color:var(--text-muted);font-size:16px;padding:0 4px;flex-shrink:0;touch-action:none;">⠿</div>
      <div class="toggle ${s.on?'on':'off'}" onclick="toggleStaff(${s.id})">
        <div class="toggle-knob"></div>
      </div>
      <label class="photo-btn" title="写真を変更">
        ${s.photo?`<img src="${s.photo}">`:`<span class="ph-ico">📷</span>`}
        <input type="file" accept="image/*" onchange="uploadPhoto(${s.id},this)">
      </label>
      <div class="staff-info" style="flex:1;min-width:0;">
        <input class="admin-field" style="margin:0 0 4px;padding:4px 8px;font-family:'Shippori Mincho',serif;font-size:14px;" value="${s.name}" oninput="updateStaff(${s.id},'name',this.value)">
        <div style="display:flex;gap:4px;">
          <input class="admin-field" style="margin:0;padding:4px 8px;font-size:11px;flex:1;" value="${s.nameEn||''}" placeholder="Name (EN)" oninput="updateStaff(${s.id},'nameEn',this.value)">
          <select class="admin-field" style="margin:0;padding:4px 6px;font-size:11px;flex:1;" onchange="updateStaff(${s.id},'role',this.value)">
            <option value="スタイリスト" ${s.role==='スタイリスト'?'selected':''}>スタイリスト</option>
            <option value="アシスタント" ${s.role==='アシスタント'?'selected':''}>アシスタント</option>
          </select>
        </div>
      </div>
      <input class="slack-id-field" placeholder="Slack ID" value="${s.slackId||''}" oninput="updateStaff(${s.id},'slackId',this.value)">
      <span class="status-badge ${s.on?'on':'off'}">${s.on?'出勤中':'休み'}</span>
      <button class="del-btn" onclick="removeStaff(${s.id})">×</button>
    </div>`).join('');
}

function onDragStart(e, id){
  dragSrcId = id;
  e.currentTarget.style.opacity = '0.4';
}
function onDragOver(e){ e.preventDefault(); }
function onDrop(e, targetId){
  e.preventDefault();
  if(dragSrcId === targetId) return;
  const srcIdx = staffList.findIndex(s=>s.id===dragSrcId);
  const tgtIdx = staffList.findIndex(s=>s.id===targetId);
  const newList = [...staffList];
  const [removed] = newList.splice(srcIdx, 1);
  newList.splice(tgtIdx, 0, removed);
  staffList = newList;
  renderAdminStaff();
}
function onDragEnd(e){ e.currentTarget.style.opacity = '1'; }
function toggleStaff(id){staffList=staffList.map(s=>s.id===id?{...s,on:!s.on}:s);renderAdminStaff();}
function updateStaff(id,key,val){staffList=staffList.map(s=>s.id===id?{...s,[key]:val}:s);}
function updateSlackId(id,val){updateStaff(id,'slackId',val);}
function removeStaff(id){staffList=staffList.filter(s=>s.id!==id);renderAdminStaff();}
function addStaff(){
  const nn=document.getElementById('newName'); if(!nn) return;
  const name=nn.value.trim();
  const ne=document.getElementById('newNameEn');
  const nameEn=ne?ne.value.trim():'';
  const nr=document.getElementById('newRole');
  const role=nr?nr.value:'スタイリスト';
  if(!name)return;
  staffList.push({id:nextStaffId++,name,nameEn,role,on:true,slackId:'',photo:''});
  nn.value=''; if(ne) ne.value=''; if(nr) nr.value='スタイリスト';
  renderAdminStaff(); showToast(`${name} を追加しました`);
}
function uploadPhoto(id,input){
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{staffList=staffList.map(s=>s.id===id?{...s,photo:e.target.result}:s);renderAdminStaff();showToast('写真を登録しました');};
  reader.readAsDataURL(file);
}

// ===== LOG =====
function addLog(name,type,stylist){
  visitLog.unshift({time:nowFull(),name,type,stylist:stylist||null});
  renderLog();
  saveToStorage();
}
function renderLog(){
  const el=document.getElementById('logContainer');
  if(!el) return;
  if(!visitLog.length){el.innerHTML=`<div class="log-empty">${tx('log-empty')}</div>`;return;}
  el.innerHTML=visitLog.map(l=>{
    const badge=tx('log-'+l.type);
    const dn=l.name?l.name+tx('suffix'):(lang==='ja'?'飛び込み':'Walk-in');
    const st=l.stylist?`<span style="font-size:10px;color:var(--accent);margin-left:6px;font-family:'DM Sans',sans-serif;">/ ${l.stylist}</span>`:'';
    return `<div class="log-card">
      <span class="log-time">${l.time}</span>
      <span class="log-name">${dn}${st}</span>
      <span class="log-badge ${l.type}">${badge}</span>
    </div>`;
  }).join('');
}

// ===== SLACK =====
async function sendSlack(msg){
  if(!webhookUrl)return;
  try{await fetch(webhookUrl,{method:'POST',body:JSON.stringify({text:msg})});}catch(e){}
}
async function sendSlackDM(uid,msg){
  if(!botToken||!uid){await sendSlack(msg);return;}
  try{
    await fetch('https://slack.com/api/chat.postMessage',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${botToken}`},
      body:JSON.stringify({channel:uid,text:msg})
    });
  }catch(e){await sendSlack(msg);}
}
async function notifyCheckin(name,stylist){
  const t=now();
  if(stylist&&stylist.slackId) await sendSlackDM(stylist.slackId,`${t} ${name}${tx('suffix')}がご来店されました`);
  else if(stylist) await sendSlack(`${t} ${name}${tx('suffix')}ご来店（担当：${stylist.name}）`);
  else await sendSlack(`${t} ${name}${tx('suffix')}ご来店（指名なし）`);
}

// ===== UTILS =====
function now(){const d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
function today(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function dateLabel(){const d=new Date();return `${d.getMonth()+1}/${d.getDate()}`;}
function nowFull(){const d=new Date();return `${dateLabel()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
function showToast(msg){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}

// ===== Firestoreログキー（STORE_ID付き） =====
function logDocId(dateStr){ return `${STORE_ID}_${dateStr}`; }

async function saveToStorage(){
  try{
    localStorage.setItem(`${STORE_ID}_custom`, JSON.stringify(custom));
    localStorage.setItem(`${STORE_ID}_pin`, pinCode);
    localStorage.setItem(`${STORE_ID}_webhook`, webhookUrl);
    localStorage.setItem(`${STORE_ID}_bottoken`, botToken);
    localStorage.setItem(`${STORE_ID}_staff`, JSON.stringify(staffList));
    localStorage.setItem(`${STORE_ID}_nextid`, nextStaffId);
    const logKey = `${STORE_ID}_log_${today()}`;
    localStorage.setItem(logKey, JSON.stringify(visitLog));
    if(!db) return;
    await db.collection('salon').doc(STORE_ID).set({
      custom, pinCode, webhookUrl, botToken,
      staffList, nextStaffId,
      drinkMenu, drinkEnabled,
      txCache: {en: TX.en, zh: TX.zh, ko: TX.ko, es: TX.es},
    }, {merge: true});
    await db.collection('logs').doc(logDocId(today())).set({ entries: visitLog }, {merge: true});
  }catch(e){ console.warn('Storage error:', e); }
}

async function loadFromStorage(){
  try{
    // まずlocalStorageから即時反映（新キー → 旧キーフォールバック）
    const c=localStorage.getItem(`${STORE_ID}_custom`)||localStorage.getItem('salon_custom');
    if(c)Object.assign(custom,JSON.parse(c));
    const p=localStorage.getItem(`${STORE_ID}_pin`)||localStorage.getItem('salon_pin');
    if(p)pinCode=p;
    const w=localStorage.getItem(`${STORE_ID}_webhook`)||localStorage.getItem('salon_webhook');
    if(w)webhookUrl=w;
    const b=localStorage.getItem(`${STORE_ID}_bottoken`)||localStorage.getItem('salon_bottoken');
    if(b)botToken=b;
    const s=localStorage.getItem(`${STORE_ID}_staff`)||localStorage.getItem('salon_staff');
    if(s)staffList=JSON.parse(s);
    const ni=localStorage.getItem(`${STORE_ID}_nextid`)||localStorage.getItem('salon_nextid');
    if(ni)nextStaffId=parseInt(ni);
    const logKey=`${STORE_ID}_log_${today()}`;
    const l=localStorage.getItem(logKey)||localStorage.getItem('salon_log_'+today());
    if(l)visitLog=JSON.parse(l);
    applyLang();
    // Firestoreから最新データを取得して上書き
    const snap = await db.collection('salon').doc(STORE_ID).get();
    if(snap.exists){
      const d=snap.data();
      if(d.custom)Object.assign(custom,d.custom);
      if(d.pinCode)pinCode=d.pinCode;
      if(d.webhookUrl)webhookUrl=d.webhookUrl;
      if(d.botToken)botToken=d.botToken;
      if(d.staffList)staffList=d.staffList;
      if(d.nextStaffId)nextStaffId=d.nextStaffId;
      if(d.drinkMenu&&d.drinkMenu.length)drinkMenu=d.drinkMenu;
      if(d.drinkEnabled!==undefined)drinkEnabled=d.drinkEnabled;
      if(drinkMenu.length){nextDrinkId=Math.max.apply(null,drinkMenu.map(function(x){return x.id;}))+1;}
      if(d.txCache){
        if(d.txCache.en) Object.assign(TX.en, d.txCache.en);
        if(d.txCache.zh) Object.assign(TX.zh, d.txCache.zh);
        if(d.txCache.ko) Object.assign(TX.ko, d.txCache.ko);
        if(d.txCache.es) Object.assign(TX.es, d.txCache.es);
      }
    }
    // Firestore に drinkMenu がなければデフォルト（初期値）を保存
    var fsMenu = snap.exists ? snap.data().drinkMenu : null;
    if(!fsMenu || !Array.isArray(fsMenu) || fsMenu.length === 0){
      saveToStorage();
    }
    // ログ読み込み（新パス → 旧パスフォールバック）
    let logSnap = await db.collection('logs').doc(logDocId(today())).get();
    if(!logSnap.exists) logSnap = await db.collection('logs').doc(today()).get();
    if(logSnap.exists&&logSnap.data().entries) visitLog=logSnap.data().entries;
    applyLang();
  }catch(e){ console.warn('Storage load error:', e); applyLang(); }
}

const defaultDrinkMenu = [
  {id:1,name:'ホットコーヒー',nameEn:'Hot Coffee',category:'hot',visible:true},
  {id:2,name:'カプチーノ',nameEn:'Cappuccino',category:'hot',visible:true},
  {id:3,name:'カフェラテ',nameEn:'Cafe Latte',category:'hot',visible:true},
  {id:4,name:'エスプレッソ',nameEn:'Espresso',category:'hot',visible:true},
  {id:5,name:'紅茶',nameEn:'Black Tea',category:'hot',visible:true},
  {id:6,name:'緑茶',nameEn:'Green Tea',category:'hot',visible:true},
  {id:7,name:'ジャスミン茶',nameEn:'Jasmine Tea',category:'hot',visible:true},
  {id:8,name:'アイスコーヒー',nameEn:'Iced Coffee',category:'cold',visible:true},
  {id:9,name:'アイスカプチーノ',nameEn:'Iced Cappuccino',category:'cold',visible:true},
  {id:10,name:'アイスカフェラテ',nameEn:'Iced Cafe Latte',category:'cold',visible:true},
  {id:11,name:'アイスエスプレッソ',nameEn:'Iced Espresso',category:'cold',visible:true},
  {id:12,name:'アイスティー',nameEn:'Iced Tea',category:'cold',visible:true},
  {id:13,name:'冷緑茶',nameEn:'Iced Green Tea',category:'cold',visible:true},
  {id:14,name:'冷ジャスミン茶',nameEn:'Iced Jasmine Tea',category:'cold',visible:true},
  {id:15,name:'お水',nameEn:'Water',category:'cold',visible:true},
  {id:16,name:'ゆず蜂蜜ティー',nameEn:'Yuzu Honey Tea',category:'hot',visible:true},
  {id:17,name:'ホットココア',nameEn:'Hot Cocoa',category:'hot',visible:true},
];

// ===== データページ =====
function getDateList(days, offsetDays){
  const list = [];
  const start = offsetDays || 0;
  for(let i=start; i<start+days; i++){
    const d = new Date();
    d.setDate(d.getDate()-i);
    list.push(`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`);
  }
  return list;
}

async function loadLogEntries(dateStr){
  if(!db) return [];
  try{
    let snap = await db.collection('logs').doc(logDocId(dateStr)).get();
    if(!snap.exists) snap = await db.collection('logs').doc(dateStr).get();
    if(snap.exists && snap.data().entries){
      return snap.data().entries.map(function(e){ return Object.assign({_date:dateStr}, e); });
    }
  }catch(e){}
  return [];
}

function switchDataPeriod(period, btnEl){
  currentDataPeriod = period;
  const row = document.getElementById('dataPeriodRow');
  if(!row) return;
  row.querySelectorAll('.data-pill').forEach(b=>b.classList.remove('active'));
  if(btnEl) btnEl.classList.add('active');
  else{ const f=row.querySelector('.data-pill'); if(f) f.classList.add('active'); }
  const dc=document.getElementById('dataContent');
  if(dc) dc.innerHTML='<div class="log-empty">読み込み中...</div>';
  loadDataForPeriod(period);
}

async function loadDataForPeriod(period){
  const days = period==='today'?1 : period==='week'?7 : 30;
  let entries = [];
  let prevCount = 0;

  if(period==='today'){
    entries = [...visitLog];
    const yesterday = getDateList(1,1)[0];
    const yEntries = await loadLogEntries(yesterday);
    prevCount = yEntries.length;
  } else {
    const dates = getDateList(days);
    const results = await Promise.all(dates.map(d=>loadLogEntries(d)));
    results.forEach(r => entries.push(...r));
  }

  renderDataContent(entries, period, prevCount, days);
}

function parseHour(entry){
  if(!entry.time) return -1;
  const parts = entry.time.split(' ');
  const timePart = parts.length>1 ? parts[1] : parts[0];
  const h = parseInt(timePart.split(':')[0]);
  return isNaN(h) ? -1 : h;
}

function renderDataContent(entries, period, prevCount, days){
  const el = document.getElementById('dataContent');
  if(!el) return;
  const total = entries.length;

  // 種別集計
  const types = {reserved:0, walkin:0, vendor:0, call:0};
  entries.forEach(e=>{ if(types[e.type]!==undefined) types[e.type]++; });

  // 時間帯集計（9〜20時）
  const hours = {};
  for(let h=9;h<=20;h++) hours[h]=0;
  entries.forEach(e=>{
    const h = parseHour(e);
    if(h>=9&&h<=20) hours[h]++;
  });
  const maxHourCount = Math.max(...Object.values(hours),1);

  // ピーク時間帯
  let peakHour = -1;
  let peakCount = 0;
  Object.entries(hours).forEach(([h,c])=>{
    if(c>peakCount){peakCount=c;peakHour=parseInt(h);}
  });

  // スタイリスト集計
  const stylistMap = {};
  entries.forEach(e=>{
    if(e.type==='reserved'){
      const key = e.stylist || '指名なし';
      stylistMap[key] = (stylistMap[key]||0)+1;
    }
  });
  const stylistRanking = Object.entries(stylistMap).sort((a,b)=>b[1]-a[1]);
  const maxStylistCount = stylistRanking.length ? stylistRanking[0][1] : 1;

  // 比較カード
  let compareLabel, compareValue, compareColor;
  if(period==='today'){
    const diff = total - prevCount;
    compareLabel = '前日比';
    compareValue = (diff>=0?'+':'')+diff;
    compareColor = diff>=0 ? 'var(--success)' : 'var(--danger)';
  } else {
    const avg = days>0 ? (total/days).toFixed(1) : '0';
    compareLabel = '1日平均';
    compareValue = avg;
    compareColor = 'var(--text)';
  }

  // HTML組み立て
  let html = '';

  // サマリーカード
  html += `<div class="data-summary">
    <div class="data-card">
      <div class="data-card-label">${period==='today'?'本日の来店数':days+'日間の来店数'}</div>
      <div class="data-card-value">${total}</div>
    </div>
    <div class="data-card">
      <div class="data-card-label">${compareLabel}</div>
      <div class="data-card-value" style="color:${compareColor}">${compareValue}</div>
    </div>
  </div>`;

  // 種別内訳
  html += `<div class="data-sub-label">種別内訳</div>
  <div class="data-types">
    <div class="data-type-card" style="background:rgba(90,106,150,.08);">
      <div class="data-type-num" style="color:#3a4a70;">${types.reserved}</div>
      <div class="data-type-name" style="color:#5a6a96;">予約</div>
    </div>
    <div class="data-type-card" style="background:rgba(184,144,64,.08);">
      <div class="data-type-num" style="color:#8a6820;">${types.walkin}</div>
      <div class="data-type-name" style="color:#b89040;">飛び込み</div>
    </div>
    <div class="data-type-card" style="background:rgba(80,136,160,.08);">
      <div class="data-type-num" style="color:#3a6878;">${types.vendor}</div>
      <div class="data-type-name" style="color:#5088a0;">業者</div>
    </div>
    <div class="data-type-card" style="background:rgba(160,96,96,.08);">
      <div class="data-type-num" style="color:#8a4040;">${types.call}</div>
      <div class="data-type-name" style="color:#c45050;">呼び出し</div>
    </div>
  </div>`;

  // ピーク時間帯ハイライト
  if(peakHour>=0 && peakCount>0){
    html += `<div class="data-peak">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <span>ピーク：${peakHour}時台（${peakCount}件）</span>
    </div>`;
  }

  // 時間帯別バーチャート
  html += `<div class="data-sub-label">時間帯別</div>
  <div class="data-hours">`;
  for(let h=9;h<=20;h++){
    const pct = maxHourCount>0 ? (hours[h]/maxHourCount*100) : 0;
    const isPeak = (h===peakHour && peakCount>0);
    html += `<div class="data-hour-col">
      <div class="data-hour-bar-wrap">
        <div class="data-hour-bar${isPeak?' peak':''}" style="height:${Math.max(pct,2)}%"></div>
      </div>
      <div class="data-hour-label">${h}</div>
    </div>`;
  }
  html += '</div>';

  // スタイリスト別
  if(stylistRanking.length){
    html += '<div class="data-sub-label">スタイリスト別</div><div class="data-stylists">';
    stylistRanking.forEach(([name,count])=>{
      const pct = (count/maxStylistCount*100);
      const isNone = name==='指名なし';
      html += `<div class="data-stylist-row">
        <div class="data-stylist-name${isNone?' muted':''}">${name}</div>
        <div class="data-stylist-bar-wrap">
          <div class="data-stylist-bar${isNone?' none':''}" style="width:${pct}%"></div>
        </div>
        <div class="data-stylist-count">${count}</div>
      </div>`;
    });
    html += '</div>';
  }

  if(total===0){
    html = '<div class="log-empty">この期間のデータはありません</div>';
  }

  el.innerHTML = html;
}

// ===== グローバル公開（HTML onclick互換） =====
const _fns = {
  goTo, submitName, doWalkin, doVendor, doCallStaff, skipStylist,
  selectStylist, onStylistSearch, setLang, clearErr,
  openHome, closeHome, saveAll, addStaff, removeStaff,
  toggleStaff, updateStaff, updateSlackId, uploadPhoto,
  pinInput, pinDelete, showToast, saveCustom, saveWebhook,
  saveBotToken, savePin, toggleLang,
  onDragStart, onDragOver, onDrop, onDragEnd,
  switchDataPeriod
};
Object.entries(_fns).forEach(([k, v]) => { window[k] = v; });

// ===== エラー監視 =====
window.onerror = function(msg, src, line, col, err) {
  console.error('[Reception Error]', msg, src, line);
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('[Reception Promise Error]', e.reason);
});

window.switchAdminTab = function(btn) {
  document.querySelectorAll('.amt').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(function(p){p.classList.remove('active')});
  var t = document.getElementById(btn.getAttribute('data-amt'));
  if(t) t.classList.add('active');
  if(btn.getAttribute('data-amt')==='admin-analytics') window.setAnalyticsRange('day');
};
window.switchEditTab = function(btn) {
  var p = btn.closest('.admin-section');
  if(!p) return;
  p.querySelectorAll('.edit-tab').forEach(function(t){t.classList.remove('active')});
  btn.classList.add('active');
  p.querySelectorAll('.preview-panel').forEach(function(el){el.classList.remove('active')});
  var panel = document.getElementById(btn.getAttribute('data-tab'));
  if(panel) panel.classList.add('active');
};
var _analyticsEntries = [];
var _analyticsRange = 'day';
var _analyticsStylist = null;

window.filterByStylist = function(name) {
  _analyticsStylist = (name === '__all__') ? null : name;
  var filterEl = document.getElementById('stylistFilter');
  if(filterEl){
    filterEl.querySelectorAll('.edit-tab').forEach(function(b){
      var bName = b.getAttribute('data-stylist');
      b.classList.toggle('active', bName === (name || '__all__'));
    });
  }
  renderAnalyticsFromCache();
};

function renderAnalyticsFromCache(){
  var data = _analyticsStylist
    ? _analyticsEntries.filter(function(e){ return e.stylist === _analyticsStylist; })
    : _analyticsEntries;
  renderAnalyticsUI(data, _analyticsRange);
}

window.setAnalyticsRange = async function(range) {
  _analyticsRange = range;
  _analyticsStylist = null;
  // ボタン active 切替
  ['ar-day','ar-week','ar-month'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.classList.remove('active');
  });
  var activeBtn = document.getElementById('ar-'+range);
  if(activeBtn) activeBtn.classList.add('active');

  // ローディング表示
  var loading = document.getElementById('analyticsLoading');
  if(loading) loading.style.display='';

  // 曜日セクション表示切替
  var dowSec = document.getElementById('dowSection');
  if(dowSec) dowSec.style.display = (range==='day') ? 'none' : '';

  // データ取得
  var days = range==='month'?30 : range==='week'?7 : 1;
  var entries = [];
  if(range==='day'){
    entries = visitLog.slice();
  } else {
    var dates = getDateList(days);
    var results = await Promise.all(dates.map(function(d){return loadLogEntries(d);}));
    results.forEach(function(r){ entries = entries.concat(r); });
  }

  if(loading) loading.style.display='none';

  _analyticsEntries = entries;
  renderAnalyticsUI(entries, range);

  // スタイリストフィルタ
  var filterEl = document.getElementById('stylistFilter');
  if(filterEl){
    var names = {};
    entries.forEach(function(e){if(e.stylist) names[e.stylist]=true;});
    var sorted = Object.keys(names).sort();
    if(sorted.length > 0){
      filterEl.innerHTML = '<button class="edit-tab active" data-stylist="__all__" onclick="filterByStylist(\'__all__\')" style="font-size:10px;">全員</button>' +
        sorted.map(function(n){return '<button class="edit-tab" data-stylist="'+n.replace(/'/g,"\\'")+'" onclick="filterByStylist(\''+n.replace(/'/g,"\\'")+'\')\" style="font-size:10px;">'+n+'</button>';}).join('');
    } else {
      filterEl.innerHTML = '';
    }
  }
};

function renderAnalyticsUI(entries, range){
  // 統計カード
  var total = entries.length;
  var reserved = entries.filter(function(e){return e.type==='reserved';}).length;
  var walkin = entries.filter(function(e){return e.type==='walkin';}).length;

  var aTotal = document.getElementById('a-total');
  var aReserved = document.getElementById('a-reserved');
  var aWalkin = document.getElementById('a-walkin');
  var aPeak = document.getElementById('a-peak');
  if(aTotal) aTotal.textContent = total;
  if(aReserved) aReserved.textContent = reserved;
  if(aWalkin) aWalkin.textContent = walkin;

  // 時間帯集計 + ピーク
  var hourCounts = {};
  for(var h=9;h<=20;h++) hourCounts[h]=0;
  entries.forEach(function(e){
    var hr = parseHour(e);
    if(hr>=9 && hr<=20) hourCounts[hr]++;
  });
  var peakH = -1, peakV = 0;
  Object.keys(hourCounts).forEach(function(hk){
    if(hourCounts[hk]>peakV){peakV=hourCounts[hk];peakH=parseInt(hk);}
  });
  if(aPeak) aPeak.textContent = peakH>=0 && peakV>0 ? peakH+'時' : '—';

  // 時間帯バーチャート（canvas → シンプルHTML描画）
  var chartHourEl = document.getElementById('chartHour');
  if(chartHourEl && chartHourEl.parentNode){
    var maxH = Math.max.apply(null, Object.keys(hourCounts).map(function(k){return hourCounts[k];})) || 1;
    var barsHtml = '<div style="display:flex;align-items:flex-end;height:100%;gap:2px;padding:0 4px;">';
    for(var hh=9;hh<=20;hh++){
      var pct = (hourCounts[hh]/maxH*100);
      var isPeak = (hh===peakH && peakV>0);
      barsHtml += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
      barsHtml += '<div style="font-size:8px;color:var(--text-muted);margin-bottom:2px;">'+(hourCounts[hh]>0?hourCounts[hh]:'')+'</div>';
      barsHtml += '<div style="width:100%;background:'+(isPeak?'var(--accent)':'rgba(124,139,191,0.4)')+';border-radius:3px 3px 0 0;height:'+Math.max(pct,2)+'%;min-height:2px;cursor:pointer;" data-hour="'+hh+'"></div>';
      barsHtml += '<div style="font-size:8px;color:var(--text-muted);margin-top:2px;">'+hh+'</div>';
      barsHtml += '</div>';
    }
    barsHtml += '</div>';
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:100%;';
    wrapper.innerHTML = barsHtml;
    wrapper.addEventListener('click', function(ev){
      var bar = ev.target.closest('[data-hour]');
      if(!bar) return;
      var hour = parseInt(bar.dataset.hour);
      var panel = document.getElementById('drillPanel');
      var title = document.getElementById('drillTitle');
      var list = document.getElementById('drillList');
      if(!panel||!title||!list) return;
      var hourEntries = entries.filter(function(e){return parseHour(e)===hour;});
      title.textContent = hour+'時台の来店（'+hourEntries.length+'件）';
      list.innerHTML = hourEntries.map(function(e){
        var nm = e.name||(e.type==='walkin'?'飛び込み':e.type);
        var st = e.stylist?' / '+e.stylist:'';
        return '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--glass-border);"><span style="color:var(--text-muted);margin-right:6px;">'+(e.time||'')+'</span><span>'+nm+st+'</span></div>';
      }).join('');
      panel.style.display='';
    });
    chartHourEl.parentNode.replaceChild(wrapper, chartHourEl);
    wrapper.id = 'chartHour';
  }

  // タイプ内訳バー + 凡例
  var typeLegend = document.getElementById('typeLegend');
  var chartTypeEl = document.getElementById('chartType');
  var typeData = [
    {key:'reserved',label:'予約',color:'#6bcf8e',count:reserved},
    {key:'walkin',label:'飛込み',color:'#f5c542',count:walkin},
    {key:'vendor',label:'業者',color:'#7c8bbf',count:entries.filter(function(e){return e.type==='vendor';}).length},
    {key:'call',label:'呼出',color:'#e07a7a',count:entries.filter(function(e){return e.type==='call';}).length}
  ];
  if(typeLegend){
    typeLegend.innerHTML = typeData.map(function(t){
      return '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+t.color+';margin-right:3px;"></span>'+t.label+' '+t.count+'</span>';
    }).join('');
  }
  if(chartTypeEl && chartTypeEl.parentNode){
    var totalForBar = Math.max(total,1);
    var barHtml = '<div style="display:flex;width:100%;height:100%;border-radius:4px;overflow:hidden;">';
    typeData.forEach(function(t){
      if(t.count>0){
        barHtml += '<div style="width:'+(t.count/totalForBar*100)+'%;background:'+t.color+';height:100%;" title="'+t.label+': '+t.count+'"></div>';
      }
    });
    barHtml += '</div>';
    var typeWrapper = document.createElement('div');
    typeWrapper.style.cssText = 'width:100%;height:100%;';
    typeWrapper.innerHTML = barHtml;
    chartTypeEl.parentNode.replaceChild(typeWrapper, chartTypeEl);
    typeWrapper.id = 'chartType';
  }

  // 曜日別（week/month のみ）
  if(range!=='day'){
    var chartDowEl = document.getElementById('chartDow');
    if(chartDowEl && chartDowEl.parentNode){
      var dowLabels = ['日','月','火','水','木','金','土'];
      var dowCounts = [0,0,0,0,0,0,0];
      entries.forEach(function(e){
        if(!e._date && e.time){
          // today entries don't have _date, skip dow
          return;
        }
        if(e._date){
          var parts = e._date.split('-');
          var dd = new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
          dowCounts[dd.getDay()]++;
        }
      });
      var maxDow = Math.max.apply(null,dowCounts)||1;
      var dowHtml = '<div style="display:flex;align-items:flex-end;height:100%;gap:4px;padding:0 4px;">';
      dowLabels.forEach(function(label,idx){
        var dpct = (dowCounts[idx]/maxDow*100);
        dowHtml += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
        dowHtml += '<div style="font-size:8px;color:var(--text-muted);margin-bottom:2px;">'+(dowCounts[idx]>0?dowCounts[idx]:'')+'</div>';
        dowHtml += '<div style="width:100%;background:rgba(107,207,142,0.5);border-radius:3px 3px 0 0;height:'+Math.max(dpct,2)+'%;min-height:2px;"></div>';
        dowHtml += '<div style="font-size:9px;color:var(--text-muted);margin-top:2px;">'+label+'</div>';
        dowHtml += '</div>';
      });
      dowHtml += '</div>';
      var dowWrapper = document.createElement('div');
      dowWrapper.style.cssText = 'width:100%;height:100%;';
      dowWrapper.innerHTML = dowHtml;
      chartDowEl.parentNode.replaceChild(dowWrapper, chartDowEl);
      dowWrapper.id = 'chartDow';
    }
  }

  // 来店一覧
  var visitList = document.getElementById('analyticsVisitList');
  if(visitList){
    if(!entries.length){
      visitList.innerHTML = '<div style="font-size:11px;color:var(--text-muted);padding:12px 0;">データがありません</div>';
    } else {
      var recent = entries.slice(0,50);
      visitList.innerHTML = recent.map(function(e){
        var nm = e.name||(e.type==='walkin'?'飛び込み':e.type);
        var st = e.stylist?' / '+e.stylist:'';
        var dateStr = e._date ? e._date+' ' : '';
        var colors = {reserved:'#6bcf8e',walkin:'#f5c542',vendor:'#7c8bbf',call:'#e07a7a'};
        var labels = {reserved:'予約',walkin:'飛込み',vendor:'業者',call:'呼出'};
        return '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--glass-border);"><span style="color:var(--text-muted);margin-right:6px;">'+dateStr+(e.time||'')+'</span><span>'+nm+st+'</span><span style="float:right;font-size:10px;color:'+(colors[e.type]||'var(--text-muted)')+';">'+(labels[e.type]||e.type)+'</span></div>';
      }).join('');
    }
  }

}

window.onInlineEdit = function(el){
  markDirty();
  var field = el.getAttribute('data-field');
  if(field && custom[field] !== undefined){
    custom[field] = el.textContent;
    document.querySelectorAll('[data-field="'+field+'"]').forEach(function(other){
      if(other !== el) other.textContent = el.textContent;
    });
  }
};
window.onInlineBlur = function(el){
  var field = el.getAttribute('data-field');
  if(field && custom[field] !== undefined) custom[field] = (el.textContent||'').trim();
  applyCustom();
};

// ===== ドリンクメニュー管理 =====
window.toggleDrinkMenu = function(){
  markDirty();
  drinkEnabled = !drinkEnabled;
  var toggle = document.getElementById('drinkToggle');
  if(toggle) toggle.className = 'toggle '+(drinkEnabled?'on':'off');
  var body = document.getElementById('drinkAdminBody');
  if(body) body.style.display = drinkEnabled ? '' : 'none';
  var offMsg = document.getElementById('drinkOffMsg');
  if(offMsg) offMsg.style.display = drinkEnabled ? 'none' : '';
  if(drinkEnabled) renderDrinkMenu();
};

function initDrinkAdmin(){
  var toggle = document.getElementById('drinkToggle');
  if(toggle) toggle.className = 'toggle '+(drinkEnabled?'on':'off');
  var body = document.getElementById('drinkAdminBody');
  if(body) body.style.display = drinkEnabled ? '' : 'none';
  var offMsg = document.getElementById('drinkOffMsg');
  if(offMsg) offMsg.style.display = drinkEnabled ? 'none' : '';
  if(drinkEnabled) renderDrinkMenu();
}

var _drinkPreviewCat = 'hot';

function renderDrinkMenu(){
  var el = document.getElementById('drinkMenuList');
  if(el){
    if(!drinkMenu.length){
      el.innerHTML = '<div style="font-size:11px;color:var(--text-muted);padding:8px 0;">メニューがありません</div>';
    } else {
      el.innerHTML = drinkMenu.map(function(d){
        var catLabel = d.category==='hot'?'HOT':'COLD';
        var vis = d.visible!==false;
        return '<div class="staff-card" draggable="true" data-drink-id="'+d.id+'" ondragstart="onDrinkDragStart(event,'+d.id+')" ondragover="onDrinkDragOver(event)" ondrop="onDrinkDrop(event,'+d.id+')" ondragend="onDrinkDragEnd(event)" style="padding:8px 12px;">'
          +'<div style="cursor:grab;color:var(--text-muted);font-size:16px;padding:0 4px;flex-shrink:0;">⠿</div>'
          +'<div class="toggle '+(vis?'on':'off')+'" onclick="toggleDrinkVisible('+d.id+')"><div class="toggle-knob"></div></div>'
          +'<input class="admin-field" style="margin:0;padding:0 8px;font-size:12px;height:30px;line-height:30px;flex:2;min-width:0;'+(vis?'':'opacity:0.4;')+'" value="'+d.name.replace(/"/g,'&quot;')+'" oninput="updateDrinkField('+d.id+',\'name\',this.value)">'
          +'<input class="admin-field" style="margin:0;padding:0 8px;font-size:10px;height:30px;line-height:30px;flex:2;min-width:0;font-family:DM Sans,sans-serif;'+(vis?'':'opacity:0.4;')+'" value="'+(d.nameEn||'').replace(/"/g,'&quot;')+'" placeholder="EN" oninput="updateDrinkField('+d.id+',\'nameEn\',this.value)">'
          +'<span onclick="toggleDrinkCategory('+d.id+')" style="font-family:DM Sans,sans-serif;font-size:10px;padding:0 10px;height:30px;line-height:30px;border-radius:50px;cursor:pointer;flex-shrink:0;color:#fff;background:'+(d.category==='hot'?'#D85A30':'var(--accent)')+';letter-spacing:0.04em;display:inline-block;">'+catLabel+'</span>'
          +'<button class="del-btn" onclick="removeDrinkItem('+d.id+')">×</button>'
          +'</div>';
      }).join('');
    }
  }
  renderDrinkPreview();
}

function renderDrinkPreview(){
  var tabs = document.getElementById('drinkPreviewTabs');
  var grid = document.getElementById('drinkPreviewGrid');
  if(!tabs || !grid) return;

  var visibleMenu = drinkMenu.filter(function(d){ return d.visible!==false; });
  var cats = [];
  var seen = {};
  visibleMenu.forEach(function(d){ if(!seen[d.category]){seen[d.category]=true;cats.push(d.category);} });
  if(!cats.length){ tabs.innerHTML=''; grid.innerHTML='<div style="text-align:center;font-size:11px;color:var(--text-muted);grid-column:1/-1;padding:20px 0;">メニュー未登録</div>'; return; }
  if(!seen[_drinkPreviewCat]) _drinkPreviewCat = cats[0];

  tabs.innerHTML = cats.map(function(c){
    var label = c==='hot'?'HOT':c==='cold'?'COLD':c;
    var active = c===_drinkPreviewCat;
    var activeColor = c==='hot'?'#D85A30':'var(--accent)';
    return '<button onclick="switchDrinkPreview(\''+c+'\')" style="font-family:DM Sans,sans-serif;font-size:10px;padding:4px 14px;border-radius:50px;border:1px solid '+(active?activeColor:'var(--glass-border)')+';background:'+(active?activeColor:'var(--glass)')+';color:'+(active?'#fff':'var(--text-muted)')+';cursor:pointer;letter-spacing:0.06em;">'+label+'</button>';
  }).join('');

  var items = visibleMenu.filter(function(d){ return d.category===_drinkPreviewCat; });
  if(!items.length){
    grid.innerHTML = '<div style="text-align:center;font-size:11px;color:var(--text-muted);grid-column:1/-1;padding:16px 0;">このカテゴリにメニューはありません</div>';
    return;
  }
  grid.innerHTML = items.map(function(d){
    return '<div style="background:var(--surface);border:1px solid var(--glass-border);border-radius:10px;padding:12px 16px;text-align:center;">'
      +'<div style="font-size:12px;font-weight:500;white-space:nowrap;">'+d.name+'</div>'
      +(d.nameEn?'<div style="font-family:DM Sans,sans-serif;font-size:9px;color:var(--text-muted);margin-top:2px;letter-spacing:0.04em;white-space:nowrap;">'+d.nameEn+'</div>':'')
      +'</div>';
  }).join('');
}

window.switchDrinkPreview = function(cat){
  _drinkPreviewCat = cat;
  renderDrinkPreview();
};

window.addDrinkItem = function(){
  markDirty();
  var nameEl = document.getElementById('newDrinkName'); if(!nameEl) return;
  var name = nameEl.value.trim(); if(!name) return;
  var nameEnEl = document.getElementById('newDrinkNameEn');
  var catEl = document.getElementById('newDrinkCat');
  drinkMenu.push({
    id: nextDrinkId++,
    name: name,
    nameEn: nameEnEl ? nameEnEl.value.trim() : '',
    category: catEl ? catEl.value : 'hot',
    visible: true
  });
  nameEl.value = ''; if(nameEnEl) nameEnEl.value = '';
  renderDrinkMenu();
  showToast(name+' を追加しました');
};

window.toggleDrinkVisible = function(id){
  markDirty();
  drinkMenu = drinkMenu.map(function(d){ return d.id===id ? Object.assign({},d,{visible:d.visible===false?true:false}) : d; });
  renderDrinkMenu();
};

window.toggleDrinkCategory = function(id){
  markDirty();
  drinkMenu = drinkMenu.map(function(d){ return d.id===id ? Object.assign({},d,{category:d.category==='hot'?'cold':'hot'}) : d; });
  renderDrinkMenu();
};

window.updateDrinkField = function(id, field, val){
  markDirty();
  drinkMenu = drinkMenu.map(function(d){ if(d.id===id){var u=Object.assign({},d);u[field]=val;return u;} return d; });
  renderDrinkPreview();
};

window.removeDrinkItem = function(id){
  markDirty();
  drinkMenu = drinkMenu.filter(function(d){ return d.id !== id; });
  renderDrinkMenu();
};

var _drinkDragId = null;
window.onDrinkDragStart = function(e, id){ _drinkDragId = id; e.currentTarget.style.opacity='0.4'; };
window.onDrinkDragOver = function(e){ e.preventDefault(); };
window.onDrinkDrop = function(e, targetId){
  e.preventDefault();
  if(_drinkDragId===targetId) return;
  var fromIdx = drinkMenu.findIndex(function(d){return d.id===_drinkDragId;});
  var toIdx = drinkMenu.findIndex(function(d){return d.id===targetId;});
  var item = drinkMenu.splice(fromIdx,1)[0];
  drinkMenu.splice(toIdx,0,item);
  renderDrinkMenu();
};
window.onDrinkDragEnd = function(e){ e.currentTarget.style.opacity='1'; };
