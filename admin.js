// --- FIREBASE ADMIN SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrT6zXJwT4O2OgRCvKxF9oR4ckAcLJjSU",
  authDomain: "accessopera-41a7e.firebaseapp.com",
  projectId: "accessopera-41a7e",
  storageBucket: "accessopera-41a7e.firebasestorage.app",
  messagingSenderId: "893285810406",
  appId: "1:893285810406:web:69bdcb11b99ab8842ebb27"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "clients");
const storage = getStorage(app);

const loadingOverlay = document.getElementById('loading-overlay');

// --- UI NAVIGATION ---
const views = document.querySelectorAll('.view-section');
function showView(viewId) {
  views.forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  
  if(viewId === 'inquiries-view') loadInquiriesAdmin();
  if(viewId === 'services-view') loadServicesAdmin();
  if(viewId === 'clients-view') loadClientsAdmin();
  if(viewId === 'tours-view') loadToursAdmin();
}

document.querySelectorAll('.dash-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', (e) => showView(e.currentTarget.getAttribute('data-target')));
});
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => { resetForms(); showView('dashboard-view'); });
});

function resetForms() {
  document.getElementById('form-service').reset();
  document.getElementById('form-client').reset();
  document.getElementById('form-tour').reset();
  document.getElementById('svc-block-list').innerHTML = '';
  document.getElementById('video-list').innerHTML = '';
  document.getElementById('show-list').innerHTML = '';
  document.querySelectorAll('.cancel-edit-btn').forEach(b => b.style.display = 'none');
  document.querySelectorAll('[id^="edit-id-"]').forEach(i => i.value = '');
  document.getElementById('title-service-form').innerText = 'add new modular service';
  document.getElementById('title-client-form').innerText = 'add new client';
  document.getElementById('title-tour-form').innerText = 'add new tour';
  document.getElementById('btn-submit-svc').innerText = 'publish service';
  document.getElementById('btn-submit-client').innerText = 'publish client';
  document.getElementById('btn-submit-tour').innerText = 'publish tour';
}

// --- AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
  if (user) showView('dashboard-view');
  else showView('login-view');
});

document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-pass').value)
    .then(() => { e.target.reset(); document.getElementById('login-error').style.display='none'; })
    .catch(() => { document.getElementById('login-error').style.display='block'; document.getElementById('login-error').innerText="Access Denied."; });
});
document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));

// --- HELPER: FILE UPLOADER ---
async function uploadFile(file, folder) {
  if (!file) return null;
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ==========================================
// 1. INQUIRIES INBOX
// ==========================================
async function loadInquiriesAdmin() {
  const list = document.getElementById('list-inquiries');
  list.innerHTML = '<span style="color:var(--dust);font-size:10px;">loading...</span>';
  
  try {
    const querySnapshot = await getDocs(collection(db, "inquiries"));
    list.innerHTML = '';
    
    let inquiries = [];
    querySnapshot.forEach(d => { inquiries.push({ id: d.id, ...d.data() }); });
    
    // Sort so newest shows up first
    inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (inquiries.length === 0) {
      list.innerHTML = '<span style="color:var(--dust);font-size:10px;">inbox is empty.</span>';
      return;
    }

    inquiries.forEach(data => {
      const row = document.createElement('div');
      row.className = 'existing-item';
      row.style.flexDirection = 'column';
      row.style.alignItems = 'flex-start';
      row.style.gap = '8px';

      const dateStr = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown Date';
      const igStr = data.instagram ? `IG: @${data.instagram.replace('@', '')}` : 'No IG provided.';

      row.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed var(--raw); padding-bottom: 8px;">
          <div>
            <strong style="color: var(--gold); font-size: 13px;">${data.name || 'No Name'}</strong><br>
            <a href="mailto:${data.email}" style="color: var(--concrete); text-decoration: none;">${data.email || 'No Email'}</a><br>
            <span style="color: var(--dust);">${data.country_code || ''} ${data.phone || 'No Phone'}</span>
          </div>
          <button class="action-btn delete-btn">delete</button>
        </div>
        <div style="color: var(--concrete); margin-top: 4px;">${igStr}</div>
        <div style="font-size: 9px; color: var(--dust); margin-top: 4px;">Received: ${dateStr}</div>
      `;

      row.querySelector('.delete-btn').addEventListener('click', async () => {
        if(confirm('Permanently delete this inquiry?')) {
          await deleteDoc(doc(db, "inquiries", data.id));
          loadInquiriesAdmin();
        }
      });
      list.appendChild(row);
    });
  } catch (error) {
    list.innerHTML = '<span style="color:red;font-size:10px;">error loading inquiries.</span>';
    console.error(error);
  }
}

// ==========================================
// 2. MODULAR SERVICES MANAGEMENT
// ==========================================
function addTextBlock(value = '') {
  const html = `
    <div class="dynamic-row svc-block" data-type="text" style="border: 1px dashed var(--dust); padding: 12px; margin-bottom: 8px;">
      <button type="button" class="remove-row-btn" onclick="this.parentElement.remove()" style="top: 8px; right: 8px;">X</button>
      <label style="font-size: 10px; color: var(--gold);">TEXT BLOCK</label>
      <textarea class="ao-input b-val" style="min-height: 80px;" required>${value}</textarea>
    </div>`;
  document.getElementById('svc-block-list').insertAdjacentHTML('beforeend', html);
}

function addMediaBlock(type, value = '') {
  const html = `
    <div class="dynamic-row svc-block" data-type="${type}" style="border: 1px dashed var(--dust); padding: 12px; margin-bottom: 8px;">
      <button type="button" class="remove-row-btn" onclick="this.parentElement.remove()" style="top: 8px; right: 8px;">X</button>
      <label style="font-size: 10px; color: var(--gold);">${type.toUpperCase()} BLOCK</label>
      <input type="hidden" class="b-old-val" value="${value}">
      <label style="font-size: 10px; color: var(--dust); display: block; margin-bottom: 4px;">
        ${value ? 'Media attached. Upload new file to replace.' : `Upload ${type}`}
      </label>
      <input type="file" class="b-file" accept="${type}/*" ${value ? '' : 'required'}>
    </div>`;
  document.getElementById('svc-block-list').insertAdjacentHTML('beforeend', html);
}

document.getElementById('btn-add-txt-block')?.addEventListener('click', () => addTextBlock());
document.getElementById('btn-add-img-block')?.addEventListener('click', () => addMediaBlock('image'));
document.getElementById('btn-add-vid-block')?.addEventListener('click', () => addMediaBlock('video'));

async function loadServicesAdmin() {
  const list = document.getElementById('list-services');
  list.innerHTML = '<span style="color:var(--dust);font-size:10px;">loading...</span>';
  const querySnapshot = await getDocs(collection(db, "services"));
  list.innerHTML = '';
  
  querySnapshot.forEach(d => {
    const data = d.data();
    const row = document.createElement('div');
    row.className = 'existing-item';
    row.innerHTML = `<span>${data.title}</span><div class="item-actions"><button class="action-btn edit-btn">edit</button><button class="action-btn delete-btn">delete</button></div>`;
    
    row.querySelector('.delete-btn').addEventListener('click', async () => {
      if(confirm('Delete this service?')) { await deleteDoc(doc(db, "services", d.id)); loadServicesAdmin(); }
    });

    row.querySelector('.edit-btn').addEventListener('click', () => {
      resetForms();
      document.getElementById('edit-id-svc').value = d.id;
      document.getElementById('svc-title').value = data.title;
      
      const blocks = data.blocks || [];
      blocks.forEach(b => {
        if (b.type === 'text') addTextBlock(b.value);
        else addMediaBlock(b.type, b.value);
      });

      document.getElementById('title-service-form').innerText = 'edit modular service';
      document.getElementById('btn-submit-svc').innerText = 'update service';
      document.getElementById('cancel-edit-svc').style.display = 'block';
    });
    list.appendChild(row);
  });
}

document.getElementById('cancel-edit-svc')?.addEventListener('click', resetForms);

document.getElementById('form-service')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loadingOverlay.style.display = 'flex';
  try {
    const editId = document.getElementById('edit-id-svc').value;
    const blocks = [];
    const blockRows = document.querySelectorAll('.svc-block');

    for (let row of blockRows) {
      const type = row.getAttribute('data-type');
      if (type === 'text') {
        blocks.push({ type: 'text', value: row.querySelector('.b-val').value });
      } else {
        const file = row.querySelector('.b-file').files[0];
        let val = row.querySelector('.b-old-val').value;
        if (file) val = await uploadFile(file, 'services');
        blocks.push({ type: type, value: val });
      }
    }

    const payload = { title: document.getElementById('svc-title').value, blocks: blocks };

    if (editId) { await updateDoc(doc(db, "services", editId), payload); } 
    else { await addDoc(collection(db, "services"), payload); }

    resetForms();
    loadServicesAdmin();
  } catch (error) { alert("Error: " + error.message); }
  loadingOverlay.style.display = 'none';
});

// ==========================================
// 3. CLIENTS MANAGEMENT
// ==========================================
function addVideoRow(name = '', src = '') {
  const wrapper = document.getElementById('video-list');
  const rowHTML = `
    <div class="dynamic-row video-row" style="border: 1px dashed var(--dust); padding: 12px; margin-bottom: 8px;">
      <button type="button" class="remove-row-btn" onclick="this.parentElement.remove()" style="top: 8px; right: 8px;">X</button>
      <input type="text" placeholder="video title (e.g. promo 1)" class="ao-input v-name" value="${name}" required style="margin-bottom: 8px;">
      <input type="hidden" class="v-old-src" value="${src}">
      <label style="font-size: 10px; color: var(--dust); display: block; margin-bottom: 4px;">
        ${src ? 'Video currently saved. Upload a new file below to replace it.' : 'Upload Video File (*)'}
      </label>
      <input type="file" class="v-file" accept="video/*" ${src ? '' : 'required'}>
    </div>
  `;
  wrapper.insertAdjacentHTML('beforeend', rowHTML);
}
document.getElementById('btn-add-video')?.addEventListener('click', () => addVideoRow());

async function loadClientsAdmin() {
  const list = document.getElementById('list-clients');
  list.innerHTML = '<span style="color:var(--dust);font-size:10px;">loading...</span>';
  const querySnapshot = await getDocs(collection(db, "clients"));
  list.innerHTML = '';
  querySnapshot.forEach(d => {
    const data = d.data();
    const row = document.createElement('div');
    row.className = 'existing-item';
    row.innerHTML = `<span>${data.name}</span><div class="item-actions"><button class="action-btn edit-btn">edit</button><button class="action-btn delete-btn">delete</button></div>`;
    row.querySelector('.delete-btn').addEventListener('click', async () => {
      if(confirm('Delete this artist from the roster?')) { await deleteDoc(doc(db, "clients", d.id)); loadClientsAdmin(); }
    });
    row.querySelector('.edit-btn').addEventListener('click', () => {
      resetForms();
      document.getElementById('edit-id-client').value = d.id;
      document.getElementById('cl-name').value = data.name;
      document.getElementById('cl-role').value = data.role;
      document.getElementById('cl-gal-name').value = data.gallery_name || '';
      document.getElementById('old-avatar-client').value = data.image_url || '';
      document.getElementById('old-gallery-client').value = JSON.stringify(data.gallery_images || []);
      const vids = data.videos || [];
      vids.forEach(v => addVideoRow(v.name, v.src));
      document.getElementById('title-client-form').innerText = 'edit client';
      document.getElementById('btn-submit-client').innerText = 'update client';
      document.getElementById('cancel-edit-client').style.display = 'block';
    });
    list.appendChild(row);
  });
}
document.getElementById('cancel-edit-client')?.addEventListener('click', resetForms);
document.getElementById('form-client')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loadingOverlay.style.display = 'flex';
  try {
    const editId = document.getElementById('edit-id-client').value;
    const avatarFile = document.getElementById('cl-avatar').files[0];
    let finalAvatarUrl = document.getElementById('old-avatar-client').value;
    if (avatarFile) { finalAvatarUrl = await uploadFile(avatarFile, 'avatars'); }
    if (!editId && !finalAvatarUrl) throw new Error("Avatar is required.");

    const galFiles = document.getElementById('cl-gal-files').files;
    let finalGalleryUrls = JSON.parse(document.getElementById('old-gallery-client').value || "[]");
    if (galFiles.length > 0) {
      finalGalleryUrls = [];
      for (let i = 0; i < galFiles.length; i++) finalGalleryUrls.push(await uploadFile(galFiles[i], 'galleries'));
    }

    let videos = [];
    const videoRows = document.querySelectorAll('.video-row');
    for (let row of videoRows) {
      const vName = row.querySelector('.v-name').value;
      const vFile = row.querySelector('.v-file').files[0];
      let vSrc = row.querySelector('.v-old-src').value;
      if (vFile) { vSrc = await uploadFile(vFile, 'videos'); }
      videos.push({ name: vName, src: vSrc });
    }

    const payload = {
      name: document.getElementById('cl-name').value, role: document.getElementById('cl-role').value,
      image_url: finalAvatarUrl, gallery_name: document.getElementById('cl-gal-name').value || 'archive',
      gallery_images: finalGalleryUrls, videos: videos
    };
    if (editId) { await updateDoc(doc(db, "clients", editId), payload); } else { await addDoc(collection(db, "clients"), payload); }
    resetForms(); loadClientsAdmin();
  } catch (error) { alert("Error: " + error.message); }
  loadingOverlay.style.display = 'none';
});

// ==========================================
// 4. TOURS MANAGEMENT
// ==========================================
function addShowRow(date='', loc='', act='', lnk='') {
  const wrapper = document.getElementById('show-list');
  const rowHTML = `
    <div class="dynamic-row show-row">
      <button type="button" class="remove-row-btn" onclick="this.parentElement.remove()">X</button>
      <div style="display:flex; gap:8px;"><input type="text" placeholder="date" class="ao-input s-date" style="flex:1;" value="${date}" required><input type="text" placeholder="location" class="ao-input s-loc" style="flex:1;" value="${loc}" required></div>
      <div style="display:flex; gap:8px;"><input type="text" placeholder="action" class="ao-input s-act" style="flex:1;" value="${act}" required><input type="text" placeholder="link" class="ao-input s-lnk" style="flex:1;" value="${lnk}"></div>
    </div>`;
  wrapper.insertAdjacentHTML('beforeend', rowHTML);
}
document.getElementById('btn-add-show')?.addEventListener('click', () => addShowRow());

async function loadToursAdmin() {
  const list = document.getElementById('list-tours');
  list.innerHTML = '<span style="color:var(--dust);font-size:10px;">loading...</span>';
  const querySnapshot = await getDocs(collection(db, "tours"));
  list.innerHTML = '';
  querySnapshot.forEach(d => {
    const data = d.data();
    const row = document.createElement('div');
    row.className = 'existing-item';
    row.innerHTML = `<span>${data.artist} - ${data.tour_name}</span><div class="item-actions"><button class="action-btn edit-btn">edit</button><button class="action-btn delete-btn">delete</button></div>`;
    row.querySelector('.delete-btn').addEventListener('click', async () => {
      if(confirm('Delete this tour?')) { await deleteDoc(doc(db, "tours", d.id)); loadToursAdmin(); }
    });
    row.querySelector('.edit-btn').addEventListener('click', () => {
      resetForms();
      document.getElementById('edit-id-tour').value = d.id;
      document.getElementById('tr-artist').value = data.artist;
      document.getElementById('tr-name').value = data.tour_name;
      document.getElementById('tr-dates').value = data.date_range;
      const shows = data.shows || [];
      shows.forEach(s => addShowRow(s.date, s.location, s.action, s.link));
      document.getElementById('title-tour-form').innerText = 'edit tour';
      document.getElementById('btn-submit-tour').innerText = 'update tour';
      document.getElementById('cancel-edit-tour').style.display = 'block';
    });
    list.appendChild(row);
  });
}
document.getElementById('cancel-edit-tour')?.addEventListener('click', resetForms);
document.getElementById('form-tour')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  loadingOverlay.style.display = 'flex';
  try {
    const editId = document.getElementById('edit-id-tour').value;
    let shows = [];
    document.querySelectorAll('.show-row').forEach(row => {
      shows.push({ date: row.querySelector('.s-date').value, location: row.querySelector('.s-loc').value, action: row.querySelector('.s-act').value, link: row.querySelector('.s-lnk').value || '#' });
    });
    const payload = { artist: document.getElementById('tr-artist').value, tour_name: document.getElementById('tr-name').value, date_range: document.getElementById('tr-dates').value, shows: shows };
    if (editId) { await updateDoc(doc(db, "tours", editId), payload); } else { await addDoc(collection(db, "tours"), payload); }
    resetForms(); loadToursAdmin();
  } catch (error) { alert("Error: " + error.message); }
  loadingOverlay.style.display = 'none';
});
