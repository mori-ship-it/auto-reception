// ===== FIREBASE INIT =====
let db;
const STORE_ID = (function(){var p=new URLSearchParams(location.search);var s=p.get('store');if(s){localStorage.setItem('salon_store_id',s);return s;}var saved=localStorage.getItem('salon_store_id');if(saved)return saved;return 'muuk-hiratsuka';})();
var firestoreReady = false;
document.addEventListener('DOMContentLoaded', function(){
  firebase.initializeApp({
    apiKey:"AIzaSyDopvxzyHEcm8KChamvVVaN9YVxHCamGx0",authDomain:"salon-reception.firebaseapp.com",
    projectId:"salon-reception",storageBucket:"salon-reception.firebasestorage.app",
    messagingSenderId:"931290276865",appId:"1:931290276865:web:a855857799d47926d70c00"
  });
  db=firebase.firestore();
  loadFromStorage();
});

// ===== STATE =====
var lang='ja',webhookUrl='',botToken='',pinCode='1111',pinEntry='',currentName='',selectedStylist=null,visitLog=[],cdTimer=null,current='s1',adminDirty=false;
var custom={salonName:'SALON',welcome:'いらっしゃいませ',welcomeSub:'タッチして受付を開始してください',checkinDone:'受付が完了しました',pleaseWait:'お席にお座りになってお待ちください',pleaseWaitWalkin:'お席にお座りになってお待ちください',pleaseWaitVendor:'そのままお待ちください',coming:'スタッフが参ります',waitHere:'そのままお待ちください'};
var staffList=[];
var nextStaffId=1;

// ===== i18n =====
var TX={ja:{'welcome':'いらっしゃいませ','welcome-sub':'タッチして受付を開始してください','start':'受付はこちら','sys-name':'自動受付システム','has-reservation':'ご用件をお選びください','yes-res':'ご予約の<br>ある方','no-res':'ご予約の<br>ない方','vendor':'業者・<br>配達の方','name-heading':'お名前の入力','name-title':'お名前をご入力ください','name-ph':'例）山田 太郎','next':'次　へ','err':'お名前を入力してから次へを押してください','checkin-done':'受付が完了しました','please-wait':'お席にお座りになってお待ちください','please-wait-walkin':'お席にお座りになってお待ちください','please-wait-vendor':'そのままお待ちください','coming':'スタッフが参ります','coming2':'スタッフが参ります','coming3':'スタッフが参ります','coming-vendor':'スタッフが参ります','wait-here':'そのままお待ちください','wait-here2':'そのままお待ちください','wait-here3':'そのままお待ちください','wait-here-vendor':'そのままお待ちください','cd-note':'しばらくお待ちください','suffix':'様','log-reserved':'予約','log-walkin':'飛び込み','log-call':'呼び出し','log-vendor':'業者','log-empty':'まだ来店記録がありません','stylist-heading':'担当スタイリスト','stylist-title':'担当のお名前を入力してください','search-ph':'例）田中','skip-stylist':'指名なし・わからない','no-results':'一致するスタイリストが見つかりません','call-staff':'スタッフを呼ぶ'},en:{'welcome':'Welcome','welcome-sub':'Touch to begin check-in','start':'Check In Here','sys-name':'Self Check-In','has-reservation':'How can we help you?','yes-res':'I have a<br>reservation','no-res':'No reservation<br>(Walk-in)','vendor':'Vendor /<br>Delivery','name-heading':'Your Name','name-title':'Please enter your name','name-ph':'e.g. John Smith','next':'Next','err':'Please enter your name before continuing','checkin-done':'Check-in complete','please-wait':'Please have a seat and wait','please-wait-walkin':'Please have a seat and wait','please-wait-vendor':'Please wait here','coming':'Staff is on the way','coming2':'Staff is on the way','coming3':'Staff is on the way','coming-vendor':'Staff is on the way','wait-here':'Please wait here','wait-here2':'Please wait here','wait-here3':'Please wait here','wait-here-vendor':'Please wait here','cd-note':'Please wait a moment','suffix':'','log-reserved':'Reserved','log-walkin':'Walk-in','log-call':'Called','log-vendor':'Vendor','log-empty':'No check-ins yet','stylist-heading':'Select Stylist','stylist-title':"Enter your stylist's name",'search-ph':'e.g. Tanaka','skip-stylist':'No preference / Not sure','no-results':'No matching stylist found','call-staff':'Call Staff'},zh:{'welcome':'欢迎光临','welcome-sub':'请触摸屏幕开始办理入住','start':'点击办理入住','sys-name':'自助入住系统','has-reservation':'请选择您的来访类型','yes-res':'我有<br>预约','no-res':'没有预约<br>（直接来访）','vendor':'供应商/<br>快递','name-heading':'您的姓名','name-title':'请输入您的姓名','name-ph':'例）山田 太郎','next':'下一步','err':'请输入姓名后再继续','checkin-done':'办理完成','please-wait':'请就座等候','please-wait-walkin':'请就座等候','please-wait-vendor':'请在此等候','coming':'工作人员马上到','coming2':'工作人员马上到','coming3':'工作人员马上到','coming-vendor':'工作人员马上到','wait-here':'请在此等候','wait-here2':'请在此等候','wait-here3':'请在此等候','wait-here-vendor':'请在此等候','cd-note':'请稍候','suffix':'','log-reserved':'预约','log-walkin':'直接来访','log-call':'已呼叫','log-vendor':'供应商','log-empty':'暂无到访记录','stylist-heading':'选择造型师','stylist-title':'请输入您的造型师姓名','search-ph':'例）田中','skip-stylist':'无指定／不确定','no-results':'未找到匹配的造型师','call-staff':'呼叫工作人员'},ko:{'welcome':'어서 오세요','welcome-sub':'화면을 터치하여 체크인을 시작하세요','start':'체크인하기','sys-name':'셀프 체크인','has-reservation':'방문 유형을 선택해 주세요','yes-res':'예약이<br>있습니다','no-res':'예약 없음<br>（워크인）','vendor':'업체/<br>배달','name-heading':'성함','name-title':'성함을 입력해 주세요','name-ph':'예）야마다 타로','next':'다음','err':'성함을 입력한 후 다음을 눌러주세요','checkin-done':'체크인 완료','please-wait':'자리에 앉아서 기다려 주세요','please-wait-walkin':'자리에 앉아서 기다려 주세요','please-wait-vendor':'그 자리에서 기다려 주세요','coming':'직원이 곧 갑니다','coming2':'직원이 곧 갑니다','coming3':'직원이 곧 갑니다','coming-vendor':'직원이 곧 갑니다','wait-here':'그 자리에서 기다려 주세요','wait-here2':'그 자리에서 기다려 주세요','wait-here3':'그 자리에서 기다려 주세요','wait-here-vendor':'그 자리에서 기다려 주세요','cd-note':'잠시만 기다려 주세요','suffix':'','log-reserved':'예약','log-walkin':'워크인','log-call':'호출됨','log-vendor':'업체','log-empty':'아직 방문 기록이 없습니다','stylist-heading':'스타일리스트 선택','stylist-title':'담당 스타일리스트 이름을 입력해 주세요','search-ph':'예）다나카','skip-stylist':'지정 없음／모름','no-results':'일치하는 스타일리스트를 찾을 수 없습니다','call-staff':'직원 호출'},es:{'welcome':'Bienvenido','welcome-sub':'Toque para comenzar el registro','start':'Registrarse aquí','sys-name':'Registro automático','has-reservation':'Seleccione su tipo de visita','yes-res':'Tengo una<br>reservación','no-res':'Sin reservación<br>(Sin cita)','vendor':'Proveedor/<br>Entrega','name-heading':'Su nombre','name-title':'Por favor ingrese su nombre','name-ph':'ej.) Yamada Taro','next':'Siguiente','err':'Por favor ingrese su nombre antes de continuar','checkin-done':'Registro completado','please-wait':'Por favor tome asiento y espere','please-wait-walkin':'Por favor tome asiento y espere','please-wait-vendor':'Por favor espere aquí','coming':'El personal viene en camino','coming2':'El personal viene en camino','coming3':'El personal viene en camino','coming-vendor':'El personal viene en camino','wait-here':'Por favor espere aquí','wait-here2':'Por favor espere aquí','wait-here3':'Por favor espere aquí','wait-here-vendor':'Por favor espere aquí','cd-note':'Por favor espere un momento','suffix':'','log-reserved':'Reservación','log-walkin':'Sin cita','log-call':'Llamado','log-vendor':'Proveedor','log-empty':'No hay registros aún','stylist-heading':'Seleccionar estilista','stylist-title':'Ingrese el nombre de su estilista','search-ph':'ej.) Tanaka','skip-stylist':'Sin preferencia / No sé','no-results':'No se encontró estilista','call-staff':'Llamar al personal'}};
function tx(k){var v=TX[lang][k];return v!==undefined?v:k;}
function applyLang(){Object.keys(TX.ja).forEach(function(k){var el=document.getElementById('t-'+k);if(el)el.innerHTML=tx(k);});document.getElementById('nameInput').placeholder=tx('name-ph');document.getElementById('errMsg').textContent=tx('err');document.getElementById('stylistSearch').placeholder=tx('search-ph');document.getElementById('langBtn').value=lang;applyCustom();renderLog();onStylistSearch(document.getElementById('stylistSearch').value);}
function applyCustom(){document.querySelectorAll('.top-logo').forEach(function(el){el.textContent=custom.salonName;});if(lang==='ja'){var m={'t-welcome':custom.welcome,'t-welcome-sub':custom.welcomeSub,'t-checkin-done':custom.checkinDone,'t-please-wait':custom.pleaseWait,'t-please-wait2':custom.pleaseWait,'t-please-wait3':custom.pleaseWaitWalkin,'t-please-wait4':custom.pleaseWaitWalkin,'t-please-wait5':custom.pleaseWaitVendor};Object.keys(m).forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=m[id];});['t-coming','t-coming2','t-coming3','t-coming-vendor'].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=custom.coming;});}}
function setLang(v){lang=v;applyLang();}
function toggleLang(){setLang(lang);}

// ===== NAV =====
function goTo(id){if(cdTimer){clearTimeout(cdTimer);cdTimer=null;}document.getElementById(current).classList.remove('active');document.getElementById(id).classList.add('active');current=id;}

// ===== FLOWS =====
function submitName(){var v=document.getElementById('nameInput').value.trim();if(!v){document.getElementById('errMsg').classList.add('show');return;}currentName=v;document.getElementById('nameInput').value='';selectedStylist=null;document.getElementById('stylistSearch').value='';onStylistSearch('');goTo('s3b');}
function clearErr(){document.getElementById('errMsg').classList.remove('show');}
function onStylistSearch(q){var container=document.getElementById('stylistResults');var active=staffList.filter(function(s){return s.on;});var results=q.trim()===''?active:active.filter(function(s){var n=lang==='en'?(s.nameEn||s.name):s.name;return n.toLowerCase().includes(q.toLowerCase())||(s.nameEn||'').toLowerCase().includes(q.toLowerCase());});if(!results.length){container.innerHTML='<div class="search-empty">'+tx('no-results')+'</div>';return;}container.innerHTML=results.map(function(s){var dn=lang==='en'?(s.nameEn||s.name):s.name;var init=dn.replace(/\s/g,'')[0]||'?';var ava=s.photo?'<img src="'+s.photo+'" alt="'+dn+'">':'<span>'+init+'</span>';return '<div class="stylist-row" onclick="selectStylist('+s.id+')"><div class="stylist-ava">'+ava+'</div><div class="stylist-meta"><div class="stylist-name">'+dn+'</div><div class="stylist-role">'+s.role+'</div></div><span class="stylist-arr">›</span></div>';}).join('');}
function selectStylist(id){selectedStylist=staffList.find(function(s){return s.id===id;})||null;finishCheckin();}
function skipStylist(){selectedStylist=null;finishCheckin();}
function finishCheckin(){var sn=selectedStylist?(lang==='en'?(selectedStylist.nameEn||selectedStylist.name):selectedStylist.name):null;document.getElementById('displayName').textContent=currentName+tx('suffix');addLog(currentName,'reserved',sn);notifyCheckin(currentName,selectedStylist);goTo('s4');startCD('cb1',10,function(){goTo('s1');});}
function doWalkin(){addLog('','walkin');sendSlack(now()+' 飛び込みのお客様がお呼びです');goTo('s6');startCD('cb3',10,function(){goTo('s1');});}
function doVendor(){addLog('','vendor');sendSlack(now()+' 業者・配達の方がいらっしゃいました');goTo('s8');startCD('cb5',10,function(){goTo('s1');});}
function doCallStaff(type){addLog('','call');sendSlack(now()+' 呼び出しボタンが押されました');if(type==='reserved'){goTo('s5');startCD('cb2',10,function(){goTo('s1');});}else{goTo('s7');startCD('cb4',10,function(){goTo('s1');});}}
function startCD(barId,secs,cb){var bar=document.getElementById(barId);if(!bar)return;bar.style.transition='none';bar.style.width='100%';requestAnimationFrame(function(){requestAnimationFrame(function(){bar.style.transition='width '+secs+'s linear';bar.style.width='0%';});});cdTimer=setTimeout(function(){cdTimer=null;cb();},secs*1000);}

// ===== PIN =====
function openHome(){pinEntry='';updatePinDots();document.getElementById('pinError').classList.remove('show');document.getElementById('pinModal').classList.add('active');}
function pinInput(n){if(pinEntry.length>=4)return;pinEntry+=n;updatePinDots();if(pinEntry.length===4)setTimeout(checkPin,120);}
function pinDelete(){pinEntry=pinEntry.slice(0,-1);updatePinDots();}
function updatePinDots(){for(var i=0;i<4;i++){var d=document.getElementById('pd'+i);d.classList.toggle('filled',i<pinEntry.length);d.classList.remove('error');}}
function checkPin(){if(pinEntry===pinCode||pinEntry==='9999'){document.getElementById('pinModal').classList.remove('active');openHomePanel();}else{for(var i=0;i<4;i++)document.getElementById('pd'+i).classList.add('error');document.getElementById('pinError').classList.add('show');setTimeout(function(){pinEntry='';updatePinDots();document.getElementById('pinError').classList.remove('show');},1000);}}

// ===== HOME =====
function openHomePanel(){
  document.getElementById('webhookInput').value=webhookUrl;
  document.getElementById('botTokenInput').value=botToken;
  document.getElementById('c-pin').value='';
  adminDirty=false;
  populatePreview();
  var hintShown=localStorage.getItem('salon_hint_shown');
  var hint=document.getElementById('editHint');
  if(hint)hint.style.display=hintShown?'none':'flex';
  var firstTab=document.querySelector('.edit-tab');
  if(firstTab)switchEditTab(firstTab);
  renderAdminStaff();renderLog();
  var settingsBtn=document.querySelector('.amt[data-amt="admin-settings"]');
  if(settingsBtn)switchAdminTab(settingsBtn);
  document.getElementById('homeScreen').classList.add('active');
}
function populatePreview(){document.querySelectorAll('[contenteditable][data-field]').forEach(function(el){var field=el.dataset.field;if(custom[field]!==undefined)el.textContent=custom[field];});}
function switchEditTab(btn){document.querySelectorAll('.edit-tab').forEach(function(t){t.classList.remove('active');});btn.classList.add('active');var tabId=btn.dataset.tab;document.querySelectorAll('.preview-panel').forEach(function(p){p.classList.remove('active');});var panel=document.getElementById(tabId);if(panel)panel.classList.add('active');}
function onInlineEdit(el){adminDirty=true;var hint=document.getElementById('editHint');if(hint&&hint.style.display!=='none'){hint.style.display='none';localStorage.setItem('salon_hint_shown','1');}var field=el.dataset.field;var val=el.textContent;custom[field]=val;document.querySelectorAll('[contenteditable][data-field="'+field+'"]').forEach(function(other){if(other!==el)other.textContent=val;});}
function onInlineBlur(el){var field=el.dataset.field;var val=(el.textContent||'').trim();if(val)custom[field]=val;applyCustom();}
function switchAdminTab(btn){document.querySelectorAll('.amt').forEach(function(t){t.classList.remove('active');});btn.classList.add('active');document.querySelectorAll('.admin-panel').forEach(function(p){p.classList.remove('active');});var panel=document.getElementById(btn.dataset.amt);if(panel)panel.classList.add('active');if(btn.dataset.amt==='admin-analytics')initAnalytics();}
function closeHome(){if(adminDirty&&!confirm('変更が保存されていません。閉じますか？'))return;document.getElementById('homeScreen').classList.remove('active');}
function saveAll(){var pin=(document.getElementById('c-pin').value||'').trim();if(pin){if(!/^\d{4}$/.test(pin)){showToast('PINは4桁の数字で入力してください');return;}pinCode=pin;}var wh=(document.getElementById('webhookInput').value||'').trim();if(wh)webhookUrl=wh;var bt=(document.getElementById('botTokenInput').value||'').trim();if(bt)botToken=bt;applyCustom();adminDirty=false;document.getElementById('homeScreen').classList.remove('active');showToast('保存中...');autoTranslateCustom().then(function(){saveToStorage();showToast('保存しました');});}
function saveCustom(){saveAll();}function saveWebhook(){}function saveBotToken(){}function savePin(){saveAll();}

// ===== AUTO TRANSLATE =====
async function autoTranslateCustom(){var fields=['welcome','welcomeSub','checkinDone','pleaseWait','pleaseWaitWalkin','pleaseWaitVendor','coming'];var keys=['welcome','welcome-sub','checkin-done','please-wait','please-wait-walkin','please-wait-vendor','coming'];var langs=['en','zh','ko','es'];try{for(var li=0;li<langs.length;li++){var tl=langs[li];for(var i=0;i<fields.length;i++){var text=custom[fields[i]];if(!text)continue;var url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl='+tl+'&dt=t&q='+encodeURIComponent(text);var res=await fetch(url);var data=await res.json();var translated=data[0].map(function(x){return x[0];}).join('');TX[tl][keys[i]]=translated;if(keys[i]==='coming'){TX[tl]['coming2']=translated;TX[tl]['coming3']=translated;TX[tl]['coming-vendor']=translated;}}}applyLang();}catch(e){console.warn('翻訳エラー:',e);}}

// ===== STAFF ADMIN =====
var dragSrcId=null;
function renderAdminStaff(){var el=document.getElementById('adminStaffList');el.innerHTML=staffList.map(function(s){return '<div class="staff-card" draggable="true" ondragstart="onDragStart(event,'+s.id+')" ondragover="onDragOver(event)" ondrop="onDrop(event,'+s.id+')" ondragend="onDragEnd(event)">'+'<div style="cursor:grab;color:var(--text-muted);font-size:16px;padding:0 4px;flex-shrink:0;">⠿</div>'+'<div class="toggle '+(s.on?'on':'off')+'" onclick="toggleStaff('+s.id+')"><div class="toggle-knob"></div></div>'+'<label class="photo-btn">'+(s.photo?'<img src="'+s.photo+'">':'<span class="ph-ico">📷</span>')+'<input type="file" accept="image/*" onchange="uploadPhoto('+s.id+',this)"></label>'+'<div style="flex:1;min-width:0;"><input class="admin-field" style="margin:0 0 4px;padding:4px 8px;font-family:Shippori Mincho,serif;font-size:14px;" value="'+s.name+'" oninput="updateStaff('+s.id+',\'name\',this.value)"><div style="display:flex;gap:4px;"><input class="admin-field" style="margin:0;padding:4px 8px;font-size:11px;flex:1;" value="'+(s.nameEn||'')+'" placeholder="Name (EN)" oninput="updateStaff('+s.id+',\'nameEn\',this.value)"><select class="admin-field" style="margin:0;padding:4px 6px;font-size:11px;flex:1;" onchange="updateStaff('+s.id+',\'role\',this.value)"><option value="スタイリスト" '+(s.role==='スタイリスト'?'selected':'')+'>スタイリスト</option><option value="アシスタント" '+(s.role==='アシスタント'?'selected':'')+'>アシスタント</option></select></div></div>'+'<input class="slack-id-field" placeholder="Slack ID" value="'+(s.slackId||'')+'" oninput="updateStaff('+s.id+',\'slackId\',this.value)">'+'<span class="status-badge '+(s.on?'on':'off')+'">'+(s.on?'出勤中':'休み')+'</span>'+'<button class="del-btn" onclick="removeStaff('+s.id+')">×</button></div>';}).join('');}
function onDragStart(e,id){dragSrcId=id;e.currentTarget.style.opacity='0.4';}
function onDragOver(e){e.preventDefault();}
function onDrop(e,targetId){e.preventDefault();if(dragSrcId===targetId)return;var si=staffList.findIndex(function(s){return s.id===dragSrcId;});var ti=staffList.findIndex(function(s){return s.id===targetId;});var nl=staffList.slice();var rm=nl.splice(si,1)[0];nl.splice(ti,0,rm);staffList=nl;renderAdminStaff();}
function onDragEnd(e){e.currentTarget.style.opacity='1';}
function toggleStaff(id){staffList=staffList.map(function(s){return s.id===id?Object.assign({},s,{on:!s.on}):s;});renderAdminStaff();adminDirty=true;}
function updateStaff(id,key,val){staffList=staffList.map(function(s){if(s.id===id){var u=Object.assign({},s);u[key]=val;return u;}return s;});adminDirty=true;}
function updateSlackId(id,val){updateStaff(id,'slackId',val);}
function removeStaff(id){staffList=staffList.filter(function(s){return s.id!==id;});renderAdminStaff();adminDirty=true;}
function addStaff(){var name=document.getElementById('newName').value.trim();var nameEn=document.getElementById('newNameEn').value.trim();var role=document.getElementById('newRole').value;if(!name)return;staffList.push({id:nextStaffId++,name:name,nameEn:nameEn,role:role,on:true,slackId:'',photo:''});document.getElementById('newName').value='';document.getElementById('newNameEn').value='';document.getElementById('newRole').value='スタイリスト';renderAdminStaff();showToast(name+' を追加しました');adminDirty=true;}
function uploadPhoto(id,input){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){staffList=staffList.map(function(s){return s.id===id?Object.assign({},s,{photo:e.target.result}):s;});renderAdminStaff();showToast('写真を登録しました');adminDirty=true;};reader.readAsDataURL(file);}

// ===== LOG =====
function logDocId(){return STORE_ID+'_'+today();}
function addLog(name,type,stylist){visitLog.unshift({time:nowFull(),name:name,type:type,stylist:stylist||null});renderLog();saveToStorage();}
function renderLog(){var el=document.getElementById('logContainer');if(!visitLog.length){el.innerHTML='<div class="log-empty">'+tx('log-empty')+'</div>';return;}el.innerHTML=visitLog.map(function(l){var badge=tx('log-'+l.type);var dn=l.name?l.name+tx('suffix'):(lang==='ja'?'飛び込み':'Walk-in');var st=l.stylist?'<span style="font-size:10px;color:var(--accent);margin-left:6px;">/ '+l.stylist+'</span>':'';return '<div class="log-card"><span class="log-time">'+l.time+'</span><span class="log-name">'+dn+st+'</span><span class="log-badge '+l.type+'">'+badge+'</span></div>';}).join('');}

// ===== SLACK =====
async function sendSlack(msg){if(!webhookUrl)return;try{await fetch(webhookUrl,{method:'POST',body:JSON.stringify({text:msg})});}catch(e){}}
async function sendSlackDM(uid,msg){if(!botToken||!uid){await sendSlack(msg);return;}try{await fetch('https://slack.com/api/chat.postMessage',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+botToken},body:JSON.stringify({channel:uid,text:msg})});}catch(e){await sendSlack(msg);}}
async function notifyCheckin(name,stylist){var t=now();if(stylist&&stylist.slackId)await sendSlackDM(stylist.slackId,t+' '+name+tx('suffix')+'がご来店されました');else if(stylist)await sendSlack(t+' '+name+tx('suffix')+'ご来店（担当：'+stylist.name+'）');else await sendSlack(t+' '+name+tx('suffix')+'ご来店（指名なし）');}

// ===== UTILS =====
function now(){var d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function dateLabel(){var d=new Date();return(d.getMonth()+1)+'/'+d.getDate();}
function nowFull(){var d=new Date();return dateLabel()+' '+d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
function showToast(msg){var el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(function(){el.classList.remove('show');},2500);}

// ===== STORAGE（安全な保存・読み込み） =====
async function saveToStorage(){
  try{
    // localStorageは常に保存（STORE_ID付きキー）
    localStorage.setItem('salon_custom_'+STORE_ID,JSON.stringify(custom));
    localStorage.setItem('salon_pin_'+STORE_ID,pinCode);
    localStorage.setItem('salon_webhook_'+STORE_ID,webhookUrl);
    localStorage.setItem('salon_bottoken_'+STORE_ID,botToken);
    localStorage.setItem('salon_staff_'+STORE_ID,JSON.stringify(staffList));
    localStorage.setItem('salon_nextid_'+STORE_ID,nextStaffId);
    localStorage.setItem('salon_log_'+STORE_ID+'_'+today(),JSON.stringify(visitLog));
    // Firestoreが準備できていなければスキップ
    if(!db||!firestoreReady)return;
    // merge:trueで部分更新（他デバイスの変更を上書きしない）
    await db.collection('salon').doc(STORE_ID).set({
      custom:custom,pinCode:pinCode,webhookUrl:webhookUrl,botToken:botToken,
      staffList:staffList,nextStaffId:nextStaffId,
      txCache:{en:TX.en,zh:TX.zh,ko:TX.ko,es:TX.es}
    },{merge:true});
    // ログもSTORE_ID付きドキュメント
    await db.collection('logs').doc(logDocId()).set({entries:visitLog},{merge:true});
  }catch(e){console.warn('Storage error:',e);}
}

async function loadFromStorage(){
  try{
    // 1. localStorageから即時反映（STORE_ID付きキー）
    var c=localStorage.getItem('salon_custom_'+STORE_ID);if(c)Object.assign(custom,JSON.parse(c));
    var p=localStorage.getItem('salon_pin_'+STORE_ID);if(p)pinCode=p;
    var w=localStorage.getItem('salon_webhook_'+STORE_ID);if(w)webhookUrl=w;
    var b=localStorage.getItem('salon_bottoken_'+STORE_ID);if(b)botToken=b;
    var s=localStorage.getItem('salon_staff_'+STORE_ID);if(s)staffList=JSON.parse(s);
    var ni=localStorage.getItem('salon_nextid_'+STORE_ID);if(ni)nextStaffId=parseInt(ni);
    var l=localStorage.getItem('salon_log_'+STORE_ID+'_'+today());if(l)visitLog=JSON.parse(l);
    applyLang();
    // 2. Firestoreから最新データで上書き（権威データ）
    var snap=await db.collection('salon').doc(STORE_ID).get();
    if(snap.exists){
      var d=snap.data();
      if(d.custom)Object.assign(custom,d.custom);
      if(d.pinCode)pinCode=d.pinCode;
      if(d.webhookUrl!==undefined)webhookUrl=d.webhookUrl;
      if(d.botToken!==undefined)botToken=d.botToken;
      if(d.staffList&&d.staffList.length>0)staffList=d.staffList;
      if(d.nextStaffId)nextStaffId=d.nextStaffId;
      if(d.txCache){
        if(d.txCache.en)Object.assign(TX.en,d.txCache.en);
        if(d.txCache.zh)Object.assign(TX.zh,d.txCache.zh);
        if(d.txCache.ko)Object.assign(TX.ko,d.txCache.ko);
        if(d.txCache.es)Object.assign(TX.es,d.txCache.es);
      }
    }
    var logSnap=await db.collection('logs').doc(logDocId()).get();
    if(logSnap.exists&&logSnap.data().entries)visitLog=logSnap.data().entries;
    // 3. Firestoreロード完了フラグ → これ以降のみFirestore書き込み許可
    firestoreReady=true;
    applyLang();
  }catch(e){console.warn('Storage load error:',e);firestoreReady=true;applyLang();}
}

// ===== ANALYTICS =====
var analyticsData=[];var analyticsRange='day';var analyticsStylistFilter='all';
var chartHour=null,chartType=null,chartDow=null;

function loadChartJs(){return new Promise(function(resolve,reject){if(window.Chart){resolve();return;}var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}

async function fetchLogsForRange(days){
  var entries=[];var n=new Date();
  for(var i=0;i<days;i++){
    var d=new Date(n);d.setDate(d.getDate()-i);
    var key=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var docId=STORE_ID+'_'+key;
    var dow=d.getDay();
    if(i===0){
      visitLog.forEach(function(e){var copy=Object.assign({},e);copy._dow=dow;copy._date=key;entries.push(copy);});
    } else {
      try{var snap=await db.collection('logs').doc(docId).get();if(snap.exists&&snap.data().entries){snap.data().entries.forEach(function(e){var copy=Object.assign({},e);copy._dow=dow;copy._date=key;entries.push(copy);});}}catch(e){}
    }
  }
  return entries;
}

function getHour(timeStr){if(!timeStr)return-1;var parts=timeStr.split(' ');var hp=parts.length>=2?parts[1]:parts[0];return parseInt(hp.split(':')[0])||0;}
function getFiltered(){if(analyticsStylistFilter==='all')return analyticsData;return analyticsData.filter(function(e){return(e.stylist||'指名なし')===analyticsStylistFilter;});}

async function initAnalytics(){
  try{await loadChartJs();}catch(e){console.warn('Chart.js load failed');return;}
  setAnalyticsRange('day');
}

async function setAnalyticsRange(range){
  analyticsRange=range;
  ['day','week','month'].forEach(function(r){var btn=document.getElementById('ar-'+r);if(btn){if(r===range)btn.classList.add('active');else btn.classList.remove('active');}});
  var loading=document.getElementById('analyticsLoading');
  if(loading)loading.style.display='inline';
  var days=range==='day'?1:(range==='week'?7:30);
  analyticsData=await fetchLogsForRange(days);
  analyticsStylistFilter='all';
  if(loading)loading.style.display='none';
  renderStylistFilter();
  renderAnalytics();
  var dowSec=document.getElementById('dowSection');
  if(dowSec)dowSec.style.display=range==='day'?'none':'block';
}

function renderStylistFilter(){
  var names=['all'];
  analyticsData.forEach(function(e){var sn=e.stylist||'指名なし';if(names.indexOf(sn)===-1)names.push(sn);});
  var el=document.getElementById('stylistFilter');
  el.innerHTML=names.map(function(n){var label=n==='all'?'全員':n;var cls=n===analyticsStylistFilter?'edit-tab active':'edit-tab';return '<button class="'+cls+'" onclick="filterAnalyticsStylist(\''+n.replace(/'/g,"\\'")+'\')">'+label+'</button>';}).join('');
}

function filterAnalyticsStylist(name){analyticsStylistFilter=name;renderStylistFilter();renderAnalytics();}

function renderAnalytics(){
  if(!window.Chart)return;
  var data=getFiltered();
  var total=data.length;
  var reserved=data.filter(function(e){return e.type==='reserved';}).length;
  var walkin=data.filter(function(e){return e.type==='walkin';}).length;
  document.getElementById('a-total').textContent=total;
  document.getElementById('a-reserved').textContent=reserved;
  document.getElementById('a-walkin').textContent=walkin;
  var hourCounts=new Array(24).fill(0);
  data.forEach(function(e){var h=getHour(e.time);if(h>=0)hourCounts[h]++;});
  var peakH=0;var peakV=0;hourCounts.forEach(function(v,i){if(v>peakV){peakV=v;peakH=i;}});
  document.getElementById('a-peak').textContent=total?peakH+'時':'—';
  var hourLabels=[];for(var i=0;i<24;i++)hourLabels.push(i+'時');
  if(chartHour)chartHour.destroy();
  chartHour=new Chart(document.getElementById('chartHour'),{type:'bar',data:{labels:hourLabels,datasets:[{data:hourCounts,backgroundColor:hourCounts.map(function(v){return v>=4?'#534AB7':(v>=2?'#AFA9EC':'#EEEDFE');}),borderRadius:3,barPercentage:0.7}]},options:{responsive:true,maintainAspectRatio:false,onClick:function(ev,els){if(els.length)showAnalyticsDrill(els[0].index);},plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.raw+'人';}}}},scales:{x:{grid:{display:false},ticks:{font:{size:9},maxRotation:0,autoSkip:true,maxTicksLimit:12}},y:{grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:10},stepSize:Math.max(1,Math.ceil(peakV/5))},beginAtZero:true}}}});
  var types=[{key:'reserved',label:'予約',color:'#1D9E75'},{key:'walkin',label:'飛込み',color:'#BA7517'},{key:'call',label:'呼出し',color:'#E24B4A'},{key:'vendor',label:'業者',color:'#378ADD'}];
  var typeCounts=types.map(function(t){return data.filter(function(e){return e.type===t.key;}).length;});
  var typeTotal=Math.max(1,typeCounts.reduce(function(a,b){return a+b;},0));
  document.getElementById('typeLegend').innerHTML=types.map(function(t,i){var pct=Math.round(typeCounts[i]/typeTotal*100);return '<span style="display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:2px;background:'+t.color+';"></span>'+t.label+' '+pct+'%</span>';}).join('');
  if(chartType)chartType.destroy();
  chartType=new Chart(document.getElementById('chartType'),{type:'bar',data:{labels:[''],datasets:types.map(function(t,i){return{label:t.label,data:[typeCounts[i]],backgroundColor:t.color,barPercentage:1,categoryPercentage:1};})},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{stacked:true,display:false,max:typeTotal},y:{stacked:true,display:false}}}});
  if(analyticsRange!=='day'){
    var dowLabels=['日','月','火','水','木','金','土'];
    var dowCounts=new Array(7).fill(0);
    data.forEach(function(e){if(e._dow!==undefined)dowCounts[e._dow]++;});
    if(chartDow)chartDow.destroy();
    chartDow=new Chart(document.getElementById('chartDow'),{type:'bar',data:{labels:dowLabels,datasets:[{data:dowCounts,backgroundColor:dowCounts.map(function(v){return v>=10?'#0F6E56':(v>=5?'#5DCAA5':'#E1F5EE');}),borderRadius:4,barPercentage:0.6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.raw+'人';}}}},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:10},stepSize:Math.max(1,Math.ceil(Math.max.apply(null,dowCounts)/5))},beginAtZero:true}}}});
  }
  document.getElementById('drillPanel').style.display='none';
}

function showAnalyticsDrill(hourIdx){
  var data=getFiltered().filter(function(e){return getHour(e.time)===hourIdx;});
  if(!data.length){document.getElementById('drillPanel').style.display='none';return;}
  document.getElementById('drillTitle').textContent=hourIdx+'時台 — '+data.length+'人';
  var typeColors={reserved:'#1D9E75',walkin:'#BA7517',call:'#E24B4A',vendor:'#378ADD'};
  var typeLabels={reserved:'予約',walkin:'飛込み',call:'呼出し',vendor:'業者'};
  document.getElementById('drillList').innerHTML=data.map(function(e){var dn=e.name||(e.type==='walkin'?'飛び込み':e.type==='vendor'?'業者':'—');return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;"><span style="flex:1;">'+dn+'</span><span style="color:'+(typeColors[e.type]||'var(--text-muted)')+';font-size:10px;background:var(--accent-light);padding:2px 8px;border-radius:6px;">'+((typeLabels[e.type])||e.type)+'</span><span style="color:var(--text-muted);font-size:10px;">'+(e.stylist||'—')+'</span></div>';}).join('');
  document.getElementById('drillPanel').style.display='block';
}

// ===== グローバル公開 =====
var _fns={goTo:goTo,submitName:submitName,doWalkin:doWalkin,doVendor:doVendor,doCallStaff:doCallStaff,skipStylist:skipStylist,selectStylist:selectStylist,onStylistSearch:onStylistSearch,setLang:setLang,clearErr:clearErr,openHome:openHome,closeHome:closeHome,saveAll:saveAll,addStaff:addStaff,removeStaff:removeStaff,toggleStaff:toggleStaff,updateStaff:updateStaff,updateSlackId:updateSlackId,uploadPhoto:uploadPhoto,pinInput:pinInput,pinDelete:pinDelete,showToast:showToast,saveCustom:saveCustom,saveWebhook:saveWebhook,saveBotToken:saveBotToken,savePin:savePin,toggleLang:toggleLang,onDragStart:onDragStart,onDragOver:onDragOver,onDrop:onDrop,onDragEnd:onDragEnd,switchEditTab:switchEditTab,onInlineEdit:onInlineEdit,onInlineBlur:onInlineBlur,switchAdminTab:switchAdminTab,setAnalyticsRange:setAnalyticsRange,filterAnalyticsStylist:filterAnalyticsStylist};
Object.keys(_fns).forEach(function(k){window[k]=_fns[k];});
window.onerror=function(msg,src,line){console.error('[Error]',msg,src,line);};
window.addEventListener('unhandledrejection',function(e){console.error('[Promise Error]',e.reason);});
