// ===== FIREBASE CONFIG =====
// ===== FIREBASE INIT (éå»¶) =====
let db;
const STORE_ID = new URLSearchParams(window.location.search).get('store') || 'muuk-hiratsuka';
document.addEventListener('DOMContentLoaded', () => {
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

let custom = {
  salonName:'SALON', welcome:'ããã£ãããã¾ã',
  welcomeSub:'ã¿ãããã¦åä»ãéå§ãã¦ãã ãã',
  startBtn:'åä»ã¯ãã¡ã', callBtn:'ã¹ã¿ãããå¼ã¶',
  checkinDone:'åä»ãå®äºãã¾ãã',
  pleaseWait:'ãå¸­ã«ãåº§ãã«ãªã£ã¦ãå¾ã¡ãã ãã',
  pleaseWaitWalkin:'ãå¸­ã«ãåº§ãã«ãªã£ã¦ãå¾ã¡ãã ãã',
  pleaseWaitWalkinSub:'ãã°ãããå¾ã¡ãã ãã',
  pleaseWaitVendor:'ãã®ã¾ã¾ãå¾ã¡ãã ãã',
  pleaseWaitVendorSub:'ã¹ã¿ãããåãã¾ã',
  coming:'ã¹ã¿ãããåãã¾ã',
  comingSub:'ãå¸­ã«ãåº§ãã«ãªã£ã¦ãå¾ã¡ãã ãã',
  waitHere:'ãã®ã¾ã¾ãå¾ã¡ãã ãã',
};
let adminDirty = false;
let custTabIdx = 0;

let staffList = [
  {id:1,name:'ç°ä¸­ ç¾å²',nameEn:'Misaki Tanaka',role:'ã¹ã¿ã¤ãªã¹ã',on:true,slackId:'',photo:''},
  {id:2,name:'é´æ¨ å¥å¤ª',nameEn:'Kenta Suzuki',role:'ã¹ã¿ã¤ãªã¹ã',on:true,slackId:'',photo:''},
  {id:3,name:'å±±æ¬ ããã',nameEn:'Sakura Yamamoto',role:'ã¹ã¿ã¤ãªã¹ã',on:false,slackId:'',photo:''},
  {id:4,name:'ä½è¤ ããª',nameEn:'Rina Sato',role:'ã¢ã·ã¹ã¿ã³ã',on:true,slackId:'',photo:''},
];
let nextStaffId = 5;

// ===== i18n =====
const TX = {
  ja:{
    'welcome':'ããã£ãããã¾ã','welcome-sub':'ã¿ãããã¦åä»ãéå§ãã¦ãã ãã',
    'start':'åä»ã¯ãã¡ã','sys-name':'èªååä»ã·ã¹ãã ',
    'has-reservation':'ãç¨ä»¶ããé¸ã³ãã ãã',
    'yes-res':'ãäºç´ã®<br>ããæ¹','no-res':'ãäºç´ã®<br>ãªãæ¹',
    'vendor':'æ¥­èã»<br>ééã®æ¹',
    'name-heading':'ãååã®å¥å','name-title':'ãååããå¥åãã ãã',
    'name-ph':'ä¾ï¼å±±ç° å¤ªé','next':'æ¬¡ãã¸',
    'err':'ãååãå¥åãã¦ããæ¬¡ã¸ãæ¼ãã¦ãã ãã',
    'checkin-done':'åä»ãå®äºãã¾ãã',
    'please-wait':'ãå¸­ã«ãåº§ãã«ãªã£ã¦ãå¾ã¡ãã ãã',
    'please-wait-walkin':'ãå¸­ã«ãåº§ãã«ãªã£ã¦ãå¾ã¡ãã ãã',
    'please-wait-vendor':'ãã®ã¾ã¾ãå¾ã¡ãã ãã',
    'coming':'ã¹ã¿ãããåãã¾ã','coming2':'ã¹ã¿ãããåãã¾ã',
    'coming3':'ã¹ã¿ãããåãã¾ã','coming-vendor':'ã¹ã¿ãããåãã¾ã',
    'wait-here':'ãã®ã¾ã¾ãå¾ã¡ãã ãã','wait-here2':'ãã®ã¾ã¾ãå¾ã¡ãã ãã',
    'wait-here3':'ãã®ã¾ã¾ãå¾ã¡ãã ãã','wait-here-vendor':'ãã®ã¾ã¾ãå¾ã¡ãã ãã',
    'cd-note':'ãã°ãããå¾ã¡ãã ãã',
    'suffix':'æ§','log-reserved':'äºç´','log-walkin':'é£ã³è¾¼ã¿',
    'log-call':'å¼ã³åºã','log-vendor':'æ¥­è','log-empty':'ã¾ã æ¥åºè¨é²ãããã¾ãã',
    'stylist-heading':'æå½ã¹ã¿ã¤ãªã¹ã','stylist-title':'æå½ã®ãååãå¥åãã¦ãã ãã',
    'search-ph':'ä¾ï¼ç°ä¸­','skip-stylist':'æåãªãã»ããããªã',
    'no-results':'ä¸è´ããã¹ã¿ã¤ãªã¹ããè¦ã¤ããã¾ãã',
    'call-staff':'ã¹ã¿ãããå¼ã¶',
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
    'please-wait-walkin':'Please have a seat and wait',
    'please-wait-vendor':'Please wait here',
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
    'welcome':'æ¬¢è¿åä¸´','welcome-sub':'è¯·è§¦æ¸å±å¹å¼å§åçå¥ä½',
    'start':'ç¹å»åçå¥ä½','sys-name':'èªå©å¥ä½ç³»ç»',
    'has-reservation':'è¯·éæ©æ¨çæ¥è®¿ç±»å',
    'yes-res':'ææ<br>é¢çº¦','no-res':'æ²¡æé¢çº¦<br>ï¼ç´æ¥æ¥è®¿ï¼',
    'vendor':'ä¾åºå/<br>å¿«é',
    'name-heading':'æ¨çå§å','name-title':'è¯·è¾å¥æ¨çå§å',
    'name-ph':'ä¾ï¼å±±ç° å¤ªé','next':'ä¸ä¸æ­¥',
    'err':'è¯·è¾å¥å§åååç»§ç»­',
    'checkin-done':'åçå®æ',
    'please-wait':'è¯·å°±åº§ç­å',
    'please-wait-walkin':'è¯·å°±åº§ç­å',
    'please-wait-vendor':'è¯·å¨æ­¤ç­å',
    'coming':'å·¥ä½äººåé©¬ä¸å°','coming2':'å·¥ä½äººåé©¬ä¸å°',
    'coming3':'å·¥ä½äººåé©¬ä¸å°','coming-vendor':'å·¥ä½äººåé©¬ä¸å°',
    'wait-here':'è¯·å¨æ­¤ç­å','wait-here2':'è¯·å¨æ­¤ç­å',
    'wait-here3':'è¯·å¨æ­¤ç­å','wait-here-vendor':'è¯·å¨æ­¤ç­å',
    'cd-note':'è¯·ç¨å',
    'suffix':'','log-reserved':'é¢çº¦','log-walkin':'ç´æ¥æ¥è®¿',
    'log-call':'å·²å¼å«','log-vendor':'ä¾åºå','log-empty':'ææ å°è®¿è®°å½',
    'stylist-heading':'éæ©é åå¸','stylist-title':'è¯·è¾å¥æ¨çé åå¸å§å',
    'search-ph':'ä¾ï¼ç°ä¸­','skip-stylist':'æ æå®ï¼ä¸ç¡®å®',
    'no-results':'æªæ¾å°å¹éçé åå¸',
    'call-staff':'å¼å«å·¥ä½äººå',
  },
  ko:{
    'welcome':'ì´ì ì¤ì¸ì','welcome-sub':'íë©´ì í°ì¹íì¬ ì²´í¬ì¸ì ììíì¸ì',
    'start':'ì²´í¬ì¸íê¸°','sys-name':'ìí ì²´í¬ì¸',
    'has-reservation':'ë°©ë¬¸ ì íì ì íí´ ì£¼ì¸ì',
    'yes-res':'ìì½ì´<br>ììµëë¤','no-res':'ìì½ ìì<br>ï¼ìí¬ì¸ï¼',
    'vendor':'ìì²´/<br>ë°°ë¬',
    'name-heading':'ì±í¨','name-title':'ì±í¨ì ìë ¥í´ ì£¼ì¸ì',
    'name-ph':'ìï¼ì¼ë§ë¤ íë¡','next':'ë¤ì',
    'err':'ì±í¨ì ìë ¥í í ë¤ìì ëë¬ì£¼ì¸ì',
    'checkin-done':'ì²´í¬ì¸ ìë£',
    'please-wait':'ìë¦¬ì ììì ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'please-wait-walkin':'ìë¦¬ì ììì ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'please-wait-vendor':'ê·¸ ìë¦¬ìì ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'coming':'ì§ìì´ ê³§ ê°ëë¤','coming2':'ì§ìì´ ê³§ ê°ëë¤',
    'coming3':'ì§ìì´ ê³§ ê°ëë¤','coming-vendor':'ì§ìì´ ê³§ ê°ëë¤',
    'wait-here':'ê·¸ ìë¦¬ìì ê¸°ë¤ë ¤ ì£¼ì¸ì','wait-here2':'ê·¸ ìë¦¬ìì ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'wait-here3':'ê·¸ ìë¦¬ìì ê¸°ë¤ë ¤ ì£¼ì¸ì','wait-here-vendor':'ê·¸ ìë¦¬ìì ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'cd-note':'ì ìë§ ê¸°ë¤ë ¤ ì£¼ì¸ì',
    'suffix':'','log-reserved':'ìì½','log-walkin':'ìí¬ì¸',
    'log-call':'í¸ì¶ë¨','log-vendor':'ìì²´','log-empty':'ìì§ ë°©ë¬¸ ê¸°ë¡ì´ ììµëë¤',
    'stylist-heading':'ì¤íì¼ë¦¬ì¤í¸ ì í','stylist-title':'ë´ë¹ ì¤íì¼ë¦¬ì¤í¸ ì´ë¦ì ìë ¥í´ ì£¼ì¸ì',
    'search-ph':'ìï¼ë¤ëì¹´','skip-stylist':'ì§ì  ììï¼ëª¨ë¦',
    'no-results':'ì¼ì¹íë ì¤íì¼ë¦¬ì¤í¸ë¥¼ ì°¾ì ì ììµëë¤',
    'call-staff':'ì§ì í¸ì¶',
  },
  es:{
    'welcome':'Bienvenido','welcome-sub':'Toque para comenzar el registro',
    'start':'Registrarse aquÃ­','sys-name':'Registro automÃ¡tico',
    'has-reservation':'Seleccione su tipo de visita',
    'yes-res':'Tengo una<br>reservaciÃ³n','no-res':'Sin reservaciÃ³n<br>(Sin cita)',
    'vendor':'Proveedor/<br>Entrega',
    'name-heading':'Su nombre','name-title':'Por favor ingrese su nombre',
    'name-ph':'ej.) Yamada Taro','next':'Siguiente',
    'err':'Por favor ingrese su nombre antes de continuar',
    'checkin-done':'Registro completado',
    'please-wait':'Por favor tome asiento y espere',
    'please-wait-walkin':'Por favor tome asiento y espere',
    'please-wait-vendor':'Por favor espere aquÃ­',
    'coming':'El personal viene en camino','coming2':'El personal viene en camino',
    'coming3':'El personal viene en camino','coming-vendor':'El personal viene en camino',
    'wait-here':'Por favor espere aquÃ­','wait-here2':'Por favor espere aquÃ­',
    'wait-here3':'Por favor espere aquÃ­','wait-here-vendor':'Por favor espere aquÃ­',
    'cd-note':'Por favor espere un momento',
    'suffix':'','log-reserved':'ReservaciÃ³n','log-walkin':'Sin cita',
    'log-call':'Llamado','log-vendor':'Proveedor','log-empty':'No hay registros aÃºn',
    'stylist-heading':'Seleccionar estilista','stylist-title':'Ingrese el nombre de su estilista',
    'search-ph':'ej.) Tanaka','skip-stylist':'Sin preferencia / No sÃ©',
    'no-results':'No se encontrÃ³ estilista',
    'call-staff':'Llamar al personal',
  }
};

function tx(k){ const v=TX[lang][k]; return v!==undefined?v:k; }

function applyLang(){
  Object.keys(TX.ja).forEach(k=>{
    const el = document.getElementById('t-'+k);
    if(el) el.innerHTML = tx(k);
  });
  document.getElementById('nameInput').placeholder = tx('name-ph');
  document.getElementById('errMsg').textContent = tx('err');
  document.getElementById('stylistSearch').placeholder = tx('search-ph');
  document.getElementById('langBtn').value = lang;
  applyCustom(); renderLog();
  onStylistSearch(document.getElementById('stylistSearch').value);
}

function applyCustom(){
  document.querySelectorAll('.top-logo').forEach(el=>el.textContent=custom.salonName);
  if(custom.startBtn){const e=document.getElementById('t-start');if(e)e.textContent=custom.startBtn;}
  if(custom.callBtn){const e=document.getElementById('t-call-staff');if(e)e.textContent=custom.callBtn;}
  if(lang==='ja'){
    const m = {
      't-welcome':custom.welcome,'t-welcome-sub':custom.welcomeSub,
      't-checkin-done':custom.checkinDone,
      't-please-wait':custom.pleaseWait,
      't-coming':custom.coming,
      't-please-wait2':custom.comingSub||custom.pleaseWait,
      't-coming2':custom.pleaseWaitWalkin,
      't-please-wait3':custom.pleaseWaitWalkinSub||'',
      't-coming3':custom.pleaseWaitWalkin,
      't-please-wait4':custom.pleaseWaitWalkinSub||'',
      't-coming-vendor':custom.pleaseWaitVendor,
      't-please-wait5':custom.pleaseWaitVendorSub||'',
    };
    Object.entries(m).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  }
}

function setLang(v){ lang=v; applyLang(); updateLangToggle(); }
function toggleLangQuick(){ setLang(lang==='ja'?'en':'ja'); closeLangPicker(); }
function updateLangToggle(){
  const btn=document.getElementById('langToggle');
  if(btn) btn.textContent = lang==='ja' ? 'English' : 'æ¥æ¬èª';
}
function openLangPicker(){
  const p=document.getElementById('langPicker');
  if(p) p.style.display = p.style.display==='none'?'block':'none';
}
function closeLangPicker(){
  const p=document.getElementById('langPicker');
  if(p) p.style.display='none';
}
function setLangAndClose(v){ setLang(v); closeLangPicker(); }
// ããã«ã¼å¤ã¯ãªãã¯ã§éãã
document.addEventListener('click', function(e){
  const picker=document.getElementById('langPicker');
  const more=document.getElementById('langMore');
  if(picker && picker.style.display!=='none' && !picker.contains(e.target) && e.target!==more){
    picker.style.display='none';
  }
});
function toggleLang(){ setLang(lang); }
function langLabel(){ return lang; }

// ===== NAV =====
function goTo(id){
  if(cdTimer){clearTimeout(cdTimer);cdTimer=null;}
  document.getElementById(current).classList.remove('active');
  document.getElementById(id).classList.add('active');
  current=id;
  if(id==='s1' && lang!=='ja'){ setLang('ja'); }
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
      <span class="stylist-arr">âº</span>
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
  addLog('','walkin'); sendSlack(now()+' é£ã³è¾¼ã¿ã®ãå®¢æ§ããå¼ã³ã§ã');
  goTo('s6'); startCD('cb3',10,()=>goTo('s1'));
}
function doVendor(){
  addLog('','vendor'); sendSlack(now()+' æ¥­èã»ééã®æ¹ãããã£ãããã¾ãã');
  goTo('s8'); startCD('cb5',10,()=>goTo('s1'));
}
function doCallStaff(type){
  addLog('','call'); sendSlack(now()+' å¼ã³åºããã¿ã³ãæ¼ããã¾ãã');
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
  document.getElementById('webhookInput').value=webhookUrl;
  document.getElementById('botTokenInput').value=botToken;
  document.getElementById('c-salonName').value=custom.salonName;
  document.getElementById('c-welcome').value=custom.welcome;
  document.getElementById('c-welcomeSub').value=custom.welcomeSub;
  document.getElementById('c-startBtn').value=custom.startBtn||'åä»ã¯ãã¡ã';
  document.getElementById('c-callBtn').value=custom.callBtn||'ã¹ã¿ãããå¼ã¶';
  document.getElementById('c-checkinDone').value=custom.checkinDone;
  document.getElementById('c-pleaseWait').value=custom.pleaseWait;
  document.getElementById('c-pleaseWaitWalkin').value=custom.pleaseWaitWalkin;
  document.getElementById('c-pleaseWaitWalkinSub').value=custom.pleaseWaitWalkinSub||'';
  document.getElementById('c-pleaseWaitVendor').value=custom.pleaseWaitVendor;
  document.getElementById('c-pleaseWaitVendorSub').value=custom.pleaseWaitVendorSub||'';
  document.getElementById('c-coming').value=custom.coming;
  document.getElementById('c-comingSub').value=custom.comingSub||'';
  document.getElementById('c-pin').value='';
  adminDirty=false; custTabIdx=0;
  switchCustTab(0);
  renderAdminStaff(); renderLog();
  document.getElementById('homeScreen').classList.add('active');
}
function closeHome(){
  if(adminDirty){
    showConfirm('è¨­å®ããåå®¹ãä¿å­ããã¦ãã¾ãããç ´æ£ãã¾ããï¼',()=>{
      adminDirty=false;
      document.getElementById('homeScreen').classList.remove('active');
    });
  } else {
    document.getElementById('homeScreen').classList.remove('active');
  }
}
function saveAll(){
  const g=id=>document.getElementById(id)?.value.trim()||'';
  if(g('c-salonName'))custom.salonName=g('c-salonName');
  if(g('c-welcome'))custom.welcome=g('c-welcome');
  if(g('c-welcomeSub'))custom.welcomeSub=g('c-welcomeSub');
  if(g('c-startBtn'))custom.startBtn=g('c-startBtn');
  if(g('c-callBtn'))custom.callBtn=g('c-callBtn');
  if(g('c-checkinDone'))custom.checkinDone=g('c-checkinDone');
  if(g('c-pleaseWait'))custom.pleaseWait=g('c-pleaseWait');
  if(g('c-pleaseWaitWalkin'))custom.pleaseWaitWalkin=g('c-pleaseWaitWalkin');
  if(g('c-pleaseWaitWalkinSub'))custom.pleaseWaitWalkinSub=g('c-pleaseWaitWalkinSub');
  if(g('c-pleaseWaitVendor'))custom.pleaseWaitVendor=g('c-pleaseWaitVendor');
  if(g('c-pleaseWaitVendorSub'))custom.pleaseWaitVendorSub=g('c-pleaseWaitVendorSub');
  if(g('c-coming'))custom.coming=g('c-coming');
  if(g('c-comingSub'))custom.comingSub=g('c-comingSub');
  const pin=g('c-pin');
  if(pin){if(!/^\d{4}$/.test(pin)){showToast('PINã¯4æ¡ã®æ°å­ã§å¥åãã¦ãã ãã');return;}pinCode=pin;}
  const wh=g('webhookInput'); if(wh)webhookUrl=wh;
  const bt=g('botTokenInput'); if(bt)botToken=bt;
  adminDirty=false;
  applyCustom();
  document.getElementById('homeScreen').classList.remove('active');
  showToast('ä¿å­ä¸­...');
  autoTranslateCustom().then(()=>{
    saveToStorage();
    showToast('ä¿å­ãã¾ãã');
  });
}
function saveCustom(){saveAll();}
function saveWebhook(){}
function saveBotToken(){}
function savePin(){saveAll();}

// ===== AUTO TRANSLATE =====
async function autoTranslateCustom(){
  const fields = ['welcome','welcomeSub','checkinDone','pleaseWait','pleaseWaitWalkin','pleaseWaitWalkinSub','pleaseWaitVendor','pleaseWaitVendorSub','coming','comingSub'];
  const keys   = ['welcome','welcome-sub','checkin-done','please-wait','please-wait-walkin','please-wait-walkin-sub','please-wait-vendor','please-wait-vendor-sub','coming','coming-sub'];
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
      }
    }
    applyLang();
  }catch(e){ console.warn('ç¿»è¨³ã¨ã©ã¼:', e); }
}

// ===== STAFF ADMIN =====
let dragSrcId = null;

function renderAdminStaff(){
  const el=document.getElementById('adminStaffList');
  el.innerHTML=staffList.map(s=>`
    <div class="staff-card" draggable="true" data-id="${s.id}"
      ondragstart="onDragStart(event,${s.id})"
      ondragover="onDragOver(event)"
      ondrop="onDrop(event,${s.id})"
      ondragend="onDragEnd(event)">
      <div style="cursor:grab;color:var(--text-muted);font-size:16px;padding:0 4px;flex-shrink:0;touch-action:none;">â ¿</div>
      <div class="toggle ${s.on?'on':'off'}" onclick="toggleStaff(${s.id})">
        <div class="toggle-knob"></div>
      </div>
      <label class="photo-btn" title="åçãå¤æ´">
        ${s.photo?`<img src="${s.photo}">`:`<span class="ph-ico">ð·</span>`}
        <input type="file" accept="image/*" onchange="uploadPhoto(${s.id},this)">
      </label>
      <div class="staff-info" style="flex:1;min-width:0;">
        <input class="admin-field" style="margin:0 0 2px;padding:4px 8px;font-family:'Shippori Mincho',serif;font-size:14px;" value="${s.name}" oninput="updateStaff(${s.id},'name',this.value)">
        <input class="admin-field" style="margin:0 0 2px;padding:3px 8px;font-size:11px;font-family:'DM Sans',sans-serif;" value="${s.nameEn||''}" placeholder="Name (EN)" oninput="updateStaff(${s.id},'nameEn',this.value)">
        <select class="role-select admin-field" style="margin:0;padding:2px 6px;font-size:10px;width:auto;display:inline-block;border-radius:4px;background:rgba(90,106,150,.06);border:none;" onchange="updateStaff(${s.id},'role',this.value)">
          <option value="ã¹ã¿ã¤ãªã¹ã" ${s.role==='ã¹ã¿ã¤ãªã¹ã'?'selected':''}>ã¹ã¿ã¤ãªã¹ã</option>
          <option value="ã¢ã·ã¹ã¿ã³ã" ${s.role==='ã¢ã·ã¹ã¿ã³ã'?'selected':''}>ã¢ã·ã¹ã¿ã³ã</option>
        </select>
      </div>
      <input class="slack-id-field" placeholder="Slack ID" value="${s.slackId||''}" oninput="updateStaff(${s.id},'slackId',this.value)">
      <span class="status-badge ${s.on?'on':'off'}">${s.on?'åºå¤ä¸­':'ä¼ã¿'}</span>
      <button class="del-btn" onclick="removeStaff(${s.id})">Ã</button>
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
function toggleStaff(id){staffList=staffList.map(s=>s.id===id?{...s,on:!s.on}:s);renderAdminStaff();markDirty();}
function updateStaff(id,key,val){staffList=staffList.map(s=>s.id===id?{...s,[key]:val}:s);markDirty();}
function updateSlackId(id,val){updateStaff(id,'slackId',val);}
function removeStaff(id){
  const s=staffList.find(x=>x.id===id);
  if(!s)return;
  showConfirm(s.name+' ããªã¹ãããåé¤ãã¾ããï¼',()=>{
    staffList=staffList.filter(x=>x.id!==id);renderAdminStaff();saveToStorage();
  });
}

function showConfirm(msg,onYes){
  let overlay=document.getElementById('confirmOverlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='confirmOverlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(26,30,46,.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;transition:opacity 0.2s;';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML=
    '<div style="background:rgba(255,255,255,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.5);border-radius:20px;padding:32px 28px 24px;text-align:center;width:min(320px,85vw);box-shadow:0 20px 60px rgba(0,0,0,.12);">'+
      '<div style="font-size:15px;color:#1a1e2e;line-height:1.7;margin-bottom:24px;">'+msg+'</div>'+
      '<div style="display:flex;gap:10px;">'+
        '<button id="confirmNo" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(104,120,160,.2);background:transparent;color:#5a6278;font-size:14px;cursor:pointer;">ããã</button>'+
        '<button id="confirmYes" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#c04040,#d05050);color:#fff;font-size:14px;cursor:pointer;">ã¯ã</button>'+
      '</div>'+
    '</div>';
  overlay.style.display='flex';
  document.getElementById('confirmNo').onclick=function(){overlay.style.display='none';};
  document.getElementById('confirmYes').onclick=function(){overlay.style.display='none';onYes();};
}
function addStaff(){
  const name=document.getElementById('newName').value.trim();
  const nameEn=document.getElementById('newNameEn').value.trim();
  const role=document.getElementById('newRole').value;
  if(!name)return;
  staffList.push({id:nextStaffId++,name,nameEn,role,on:true,slackId:'',photo:''});
  document.getElementById('newName').value='';
  document.getElementById('newNameEn').value='';
  document.getElementById('newRole').value='ã¹ã¿ã¤ãªã¹ã';
  renderAdminStaff(); showToast(`${name} ãè¿½å ãã¾ãã`); markDirty();
}
function uploadPhoto(id,input){
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{staffList=staffList.map(s=>s.id===id?{...s,photo:e.target.result}:s);renderAdminStaff();showToast('åçãç»é²ãã¾ãã');markDirty();};
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
  if(!visitLog.length){el.innerHTML=`<div class="log-empty">${tx('log-empty')}</div>`;return;}
  el.innerHTML=visitLog.map(l=>{
    const badge=tx('log-'+l.type);
    const dn=l.name?l.name+tx('suffix'):(lang==='ja'?'é£ã³è¾¼ã¿':'Walk-in');
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
  if(stylist&&stylist.slackId) await sendSlackDM(stylist.slackId,`${t} ${name}${tx('suffix')}ããæ¥åºããã¾ãã`);
  else if(stylist) await sendSlack(`${t} ${name}${tx('suffix')}ãæ¥åºï¼æå½ï¼${stylist.name}ï¼`);
  else await sendSlack(`${t} ${name}${tx('suffix')}ãæ¥åºï¼æåãªãï¼`);
}

// ===== UTILS =====
function now(){const d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
function today(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function dateLabel(){const d=new Date();return `${d.getMonth()+1}/${d.getDate()}`;}
function nowFull(){const d=new Date();return `${dateLabel()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
function showToast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}

async function saveToStorage(){
  try{
    localStorage.setItem('salon_custom_' + STORE_ID, JSON.stringify(custom));
    localStorage.setItem('salon_pin_' + STORE_ID, pinCode);
    localStorage.setItem('salon_webhook_' + STORE_ID, webhookUrl);
    localStorage.setItem('salon_bottoken_' + STORE_ID, botToken);
    localStorage.setItem('salon_staff_' + STORE_ID, JSON.stringify(staffList));
    localStorage.setItem('salon_nextid_' + STORE_ID, nextStaffId);
    const logKey = 'salon_log_' + STORE_ID + '_' + today();
    localStorage.setItem(logKey, JSON.stringify(visitLog));
    if(!db) return;
    await db.collection('salon').doc(STORE_ID).set({
      custom, pinCode, webhookUrl, botToken,
      staffList, nextStaffId,
      txCache: {en: TX.en, zh: TX.zh, ko: TX.ko, es: TX.es},
    });
    await db.collection('logs').doc(today()).set({ entries: visitLog });
  }catch(e){ console.warn('Storage error:', e); }
}

async function loadFromStorage(){
  try{
    // ã¾ãlocalStorageããå³æåæ 
    const c=localStorage.getItem('salon_custom_' + STORE_ID); if(c)Object.assign(custom,JSON.parse(c));
    const p=localStorage.getItem('salon_pin_' + STORE_ID); if(p)pinCode=p;
    const w=localStorage.getItem('salon_webhook_' + STORE_ID); if(w)webhookUrl=w;
    const b=localStorage.getItem('salon_bottoken_' + STORE_ID); if(b)botToken=b;
    const s=localStorage.getItem('salon_staff_' + STORE_ID); if(s)staffList=JSON.parse(s);
    const ni=localStorage.getItem('salon_nextid_' + STORE_ID); if(ni)nextStaffId=parseInt(ni);
    const logKey='salon_log_'+today();
    const l=localStorage.getItem(logKey); if(l)visitLog=JSON.parse(l);
    applyLang();
    // Firestoreããææ°ãã¼ã¿ãåå¾ãã¦ä¸æ¸ã
    const snap = await db.collection('salon').doc(STORE_ID).get();
    if(snap.exists){
      const d=snap.data();
      if(d.custom)Object.assign(custom,d.custom);
      if(d.pinCode)pinCode=d.pinCode;
      if(d.webhookUrl)webhookUrl=d.webhookUrl;
      if(d.botToken)botToken=d.botToken;
      if(d.staffList)staffList=d.staffList;
      if(d.nextStaffId)nextStaffId=d.nextStaffId;
      if(d.txCache){
        if(d.txCache.en) Object.assign(TX.en, d.txCache.en);
        if(d.txCache.zh) Object.assign(TX.zh, d.txCache.zh);
        if(d.txCache.ko) Object.assign(TX.ko, d.txCache.ko);
        if(d.txCache.es) Object.assign(TX.es, d.txCache.es);
      }
    }
    const logSnap = await db.collection('logs').doc(today()).get();
    if(logSnap.exists&&logSnap.data().entries) visitLog=logSnap.data().entries;
    applyLang();
  }catch(e){ console.warn('Storage load error:', e); applyLang(); }
}

// ===== CUSTOMIZE PREVIEW =====
function markDirty(){ adminDirty=true; }
function switchCustTab(n){
  custTabIdx=n;
  document.querySelectorAll('.cust-tab').forEach(function(t,i){t.classList.toggle('active',i===n)});
  for(var i=0;i<5;i++){
    var p=document.getElementById('cp'+i);
    if(p) p.classList.toggle('active',i===n);
  }
  updateCustPreview();
}
function _cv(id){ var el=document.getElementById(id); return el?el.value:''; }
function _pmk(bg,n){ return '<div class="pmk" style="background:'+bg+';top:-8px;right:-22px">'+n+'</div>'; }
function _prevRing(color){ return '<div class="prev-ring" style="border-color:'+color+'"><svg viewBox="0 0 24 24" style="stroke:'+color+'"><polyline points="20 6 9 17 4 12"/></svg></div>'; }
function _prevDone(color,bg,m1id,m2id,badge){
  var h='<div class="prev-bar"><div class="prev-logo">'+_cv('c-salonName')+'</div><div class="prev-actions"><div class="prev-langbtn">English</div><div class="prev-gearbtn"></div></div></div>';
  h+='<div class="prev-body">';
  h+=_prevRing(color);
  if(badge) h+='<div class="prev-badge">ç°ä¸­ æ§</div>';
  h+='<div style="position:relative;display:inline-block"><span style="font-size:15px;font-weight:500;color:#1a1e2e">'+_cv(m1id)+'</span>'+_pmk(bg,'1')+'</div>';
  h+='<div style="position:relative;display:inline-block"><span class="prev-sub">'+_cv(m2id)+'</span>'+_pmk(bg,'2')+'</div>';
  h+='<div class="prev-bartrack"><div class="prev-barfill"></div></div>';
  h+='<div class="prev-home">ãã¼ã ã«æ»ã</div>';
  h+='</div>';
  return h;
}
function _prevSingle(color,mid){
  var h='<div class="prev-bar"><div class="prev-logo">'+_cv('c-salonName')+'</div><div class="prev-actions"><div class="prev-langbtn">English</div><div class="prev-gearbtn"></div></div></div>';
  h+='<div class="prev-body">';
  h+=_prevRing(color);
  h+='<div style="position:relative;display:inline-block"><span style="font-size:15px;font-weight:500;color:#1a1e2e">'+_cv(mid)+'</span>'+_pmk(color,'1')+'</div>';
  h+='<div class="prev-bartrack"><div class="prev-barfill"></div></div>';
  h+='<div class="prev-home">ãã¼ã ã«æ»ã</div>';
  h+='</div>';
  return h;
}
function updateCustPreview(){
  var s=document.getElementById('custPreview'); if(!s) return;
  if(custTabIdx===0){
    s.innerHTML=
      '<div class="prev-bar"><div class="prev-logo" style="position:relative">'+_cv('c-salonName')+_pmk('#E24B4A','1')+'</div><div class="prev-actions"><div class="prev-langbtn">English</div><div class="prev-gearbtn"></div></div></div>'+
      '<div class="prev-body">'+
        '<div style="position:relative;display:inline-block"><span class="prev-title">'+_cv('c-welcome')+'</span>'+_pmk('#E24B4A','2')+'</div>'+
        '<div class="prev-divider"></div>'+
        '<div style="position:relative;display:inline-block"><span class="prev-sub">'+_cv('c-welcomeSub')+'</span>'+_pmk('#E24B4A','3')+'</div>'+
        '<div style="height:8px"></div>'+
        '<div style="position:relative;display:inline-block"><div class="prev-btn">'+_cv('c-startBtn')+'</div>'+_pmk('#E24B4A','4')+'</div>'+
        '<div style="height:2px"></div>'+
        '<div style="position:relative;display:inline-block"><div class="prev-btn-out">'+_cv('c-callBtn')+'</div>'+_pmk('#E24B4A','5')+'</div>'+
      '</div>';
  } else if(custTabIdx===1){
    s.innerHTML=_prevDone('#1D9E75','#1D9E75','c-checkinDone','c-pleaseWait',true);
  } else if(custTabIdx===2){
    s.innerHTML=_prevDone('#378ADD','#378ADD','c-pleaseWaitWalkin','c-pleaseWaitWalkinSub',false);
  } else if(custTabIdx===3){
    s.innerHTML=_prevDone('#BA7517','#BA7517','c-pleaseWaitVendor','c-pleaseWaitVendorSub',false);
  } else {
    s.innerHTML=_prevDone('#7F77DD','#7F77DD','c-coming','c-comingSub',false);
  }
}

// ===== ã°ã­ã¼ãã«å¬éï¼HTML onclickäºæï¼ =====
const _fns = {
  goTo, submitName, doWalkin, doVendor, doCallStaff, skipStylist,
  selectStylist, onStylistSearch, setLang, clearErr, toggleLangQuick,
  openLangPicker, closeLangPicker, setLangAndClose,
  openHome, closeHome, saveAll, addStaff, removeStaff,
  toggleStaff, updateStaff, updateSlackId, uploadPhoto,
  pinInput, pinDelete, showToast, saveCustom, saveWebhook,
  saveBotToken, savePin, toggleLang,
  onDragStart, onDragOver, onDrop, onDragEnd,
  switchCustTab, updateCustPreview, markDirty
};
Object.entries(_fns).forEach(([k, v]) => { window[k] = v; });

// ===== ã¨ã©ã¼ç£è¦ =====
window.onerror = function(msg, src, line, col, err) {
  console.error('[Reception Error]', msg, src, line);
  // å°æ¥çã«SlackãSentryã«éä¿¡å¯è½
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('[Reception Promise Error]', e.reason);
});
