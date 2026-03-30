// ===== Firebase SDK (npm) =====
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const STORE_ID = import.meta.env.VITE_STORE_ID || 'muuk-hiratsuka';

firebase.initializeApp({
  apiKey: "AIzaSyDopvxzyHEcm8KChamvVVaN9YVxHCamGx0",
  authDomain: "salon-reception.firebaseapp.com",
  projectId: "salon-reception",
  storageBucket: "salon-reception.firebasestorage.app",
  messagingSenderId: "931290276865",
  appId: "1:931290276865:web:a855857799d47926d70c00"
});
const db = firebase.firestore();

let selectedRole = 'スタイリスト';
let photoData = '';

window.selectRole = function(role) {
  selectedRole = role;
  document.getElementById('role-stylist').classList.toggle('active', role === 'スタイリスト');
  document.getElementById('role-assistant').classList.toggle('active', role === 'アシスタント');
};

window.onPhotoSelect = function(input) {
  var file = input.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    photoData = e.target.result;
    document.getElementById('photoPreview').innerHTML = '<img src="' + photoData + '">';
  };
  reader.readAsDataURL(file);
};

window.submitForm = async function() {
  var nameJa = document.getElementById('nameJa').value.trim();
  var nameEn = document.getElementById('nameEn').value.trim();
  var slackId = document.getElementById('slackId').value.trim();
  if (!nameJa) { showToast('お名前を入力してください'); return; }
  if (slackId && !/^U[A-Z0-9]{6,14}$/.test(slackId)) {
    showToast('Slack IDの形式が正しくありません（例: U01AB2CD3EF）'); return;
  }
  var btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = '送信中...';
  try {
    var snap = await db.collection('salon').doc(STORE_ID).get();
    var staffList = [];
    var nextStaffId = 1;
    if (snap.exists) {
      staffList = snap.data().staffList || [];
      nextStaffId = snap.data().nextStaffId || staffList.length + 1;
    }
    staffList.push({
      id: nextStaffId, name: nameJa, nameEn: nameEn,
      role: selectedRole, on: true, slackId: slackId, photo: photoData
    });
    await db.collection('salon').doc(STORE_ID).update({
      staffList: staffList, nextStaffId: nextStaffId + 1
    });
    document.getElementById('formView').style.display = 'none';
    document.getElementById('doneView').classList.add('active');
  } catch (e) {
    console.error(e);
    showToast('送信に失敗しました。もう一度お試しください');
    btn.disabled = false; btn.textContent = '登録申請を送る';
  }
};

window.toggleHowto = function() {
  document.getElementById('howtoToggle').classList.toggle('open');
  document.getElementById('howtoContent').classList.toggle('open');
};

window.switchTab = function(id, el) {
  document.querySelectorAll('.howto-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.howto-steps').forEach(function(s){ s.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
};

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, 2500);
}
