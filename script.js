// --- FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrT6zXJwT4O2OgRCvKxF9oR4ckAcLJjSU",
  authDomain: "accessopera-41a7e.firebaseapp.com",
  projectId: "accessopera-41a7e",
  storageBucket: "accessopera-41a7e.firebasestorage.app",
  messagingSenderId: "893285810406",
  appId: "1:893285810406:web:69bdcb11b99ab8842ebb27",
  measurementId: "G-892MVXEC3R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "clients");

// ==========================================
// 1. EXACT ORIGINAL LOADER ANIMATION
// ==========================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('gone');
    }
  }, 1000);
});

// ==========================================
// 2. CURSOR & UI LOGIC
// ==========================================
const dot = document.getElementById('cursor-dot');
let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
window.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  document.body.classList.add('cursor-ready');
});

function updateCursor() {
  if (dot) dot.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
  requestAnimationFrame(updateCursor);
}
updateCursor();

const homeBgVideo = document.querySelector('.home-bg-video');

function ensureHomeBgVideoPlayback() {
  if (!homeBgVideo || !document.body.classList.contains('home-view-active')) return;
  homeBgVideo.muted = true;
  homeBgVideo.defaultMuted = true;
  homeBgVideo.loop = true;
  homeBgVideo.playsInline = true;
  const playAttempt = homeBgVideo.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {});
  }
}

if (homeBgVideo) {
  homeBgVideo.muted = true;
  homeBgVideo.defaultMuted = true;
  homeBgVideo.loop = true;
  homeBgVideo.playsInline = true;
  window.addEventListener('load', ensureHomeBgVideoPlayback);
  window.addEventListener('pageshow', ensureHomeBgVideoPlayback);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureHomeBgVideoPlayback();
  });
  document.addEventListener('touchstart', ensureHomeBgVideoPlayback, { once: true, passive: true });
  document.addEventListener('click', ensureHomeBgVideoPlayback, { once: true });
}

function switchSPAView(targetId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(targetId);
  if (target) target.classList.add('active');
  document.body.classList.toggle('home-view-active', targetId === 'view-home');
  ensureHomeBgVideoPlayback();

  document.querySelectorAll('.media-workspace').forEach(ws => ws.classList.remove('active'));
  document.querySelectorAll('.svc-overlay').forEach(overlay => overlay.classList.remove('active'));
  
  const globalVid = document.getElementById('custom-video');
  if (globalVid) globalVid.pause();
}

const hashViewMap = {
  '#services': 'view-services',
  '#clients': 'view-clients',
  '#upcoming': 'view-upcoming',
  '#home': 'view-home'
};

function switchViewFromHash() {
  const targetId = hashViewMap[window.location.hash];
  if (targetId) switchSPAView(targetId);
}

document.querySelectorAll('.nav-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    switchSPAView(btn.getAttribute('data-target'));
  });
});

window.addEventListener('hashchange', switchViewFromHash);
switchViewFromHash();

// ==========================================
// 3. DYNAMIC MODULAR SERVICES
// ==========================================
const servicesContainer = document.getElementById('dynamic-services-list');
const overlay = document.getElementById('svc-overlay');
const overlayContent = document.getElementById('svc-overlay-content');
const svcCloseBtn = document.getElementById('svc-close-btn');

if (svcCloseBtn && overlay) {
  svcCloseBtn.addEventListener('click', () => overlay.classList.remove('active'));
}

async function loadServices() {
  if (!servicesContainer) return;
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    servicesContainer.innerHTML = ''; 
    querySnapshot.forEach((doc) => {
      const service = doc.data() || {};
      const serviceTitle = service.title || 'Untitled Service';
      
      let blocksHTML = '';
      if (service.blocks && Array.isArray(service.blocks)) {
        service.blocks.forEach(block => {
          if (block.type === 'text') blocksHTML += `<p style="margin-bottom: 16px;">${block.value || ''}</p>`;
          else if (block.type === 'image' && block.value) blocksHTML += `<img src="${block.value}" style="width: 100%; height: auto; border: 1px solid var(--raw); margin-bottom: 16px;">`;
          else if (block.type === 'video' && block.value) blocksHTML += `<video src="${block.value}" playsinline muted loop autoplay style="width: 100%; height: auto; border: 1px solid var(--raw); margin-bottom: 16px;"></video>`;
        });
      }

      const serviceHTML = `
        <button class="service-card dynamic-svc-btn" type="button">
          <div class="svc-content">
            <h3 class="svc-title">${serviceTitle}</h3>
            <div class="svc-extended" style="display: none;">${blocksHTML}</div>
          </div>
        </button>
      `;
      servicesContainer.insertAdjacentHTML('beforeend', serviceHTML);
    });

    document.querySelectorAll('.dynamic-svc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        if (overlay) {
          overlay.style.setProperty('--click-x', (e.clientX - rect.left) + 'px');
          overlay.style.setProperty('--click-y', (e.clientY - rect.top) + 'px');
        }
        if (overlayContent) {
          overlayContent.innerHTML = `<h2 class="svc-overlay-title">${btn.querySelector('.svc-title').innerText}</h2><div class="svc-overlay-body">${btn.querySelector('.svc-extended').innerHTML}</div>`;
        }
        if (overlay) overlay.classList.add('active');
      });
    });
  } catch (error) { console.error("Services Fetch Error:", error); }
}

// ==========================================
// 4. DYNAMIC CLIENT ROSTER & ARCHIVES
// ==========================================
const clientListContainer = document.getElementById('dynamic-client-list');
const workspacesTarget = document.getElementById('dynamic-workspaces-target');

async function loadClients() {
  if (!clientListContainer || !workspacesTarget) return;

  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    clientListContainer.innerHTML = ''; 
    workspacesTarget.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const client = doc.data() || {};
      if (!client.name) return; 

      const clientName = client.name.toString();
      const safeName = clientName.replace(/\s+/g, '-').toLowerCase() + '-' + doc.id;
      const clientRole = (client.role || 'Artist').toString();
      const clientImage = client.image_url || '';

      const clientHTML = `
        <button class="roster-row media-artist-btn" data-artist="${safeName}" style="width:100%; text-align:left; font-family:inherit; background:transparent; border:none; outline:none; border-bottom: 1px solid var(--raw);">
          <div class="r-data r-avatar"><img src="${clientImage}" alt="${clientName}" onerror="this.style.display='none'" /></div>
          <div class="r-data r-details"><div class="r-role">${clientRole}</div><div class="r-name">${clientName}</div></div>
          <div class="r-data r-tag">archive</div> 
        </button>
      `;
      clientListContainer.insertAdjacentHTML('beforeend', clientHTML);

      const normalizedClientName = clientName.trim().toLowerCase();
      const vids = Array.isArray(client.videos) && client.videos.length > 0 ? [...client.videos] : [{name: 'motion', src: ''}];
      if (normalizedClientName === 'rotimi') {
        vids[0] = { ...(vids[0] || {}), name: (vids[0] && vids[0].name) || 'ffj', src: 'ffj.mp4' };
      }
      if (normalizedClientName === 'ye') {
        vids[0] = { ...(vids[0] || {}), name: (vids[0] && vids[0].name) || 'YE TRAILER', src: 'YE TRAILER.mp4' };
      }
      const images = Array.isArray(client.gallery_images) && client.gallery_images.length > 0 ? client.gallery_images : [''];
      const gName = client.gallery_name || 'archive';
      const videoClass = ['rotimi', 'ye'].includes(normalizedClientName) ? 'custom-video color-video' : 'custom-video';

      let videoGridHTML = '';
      vids.forEach((vid, idx) => {
        let activeClass = idx === 0 ? 'active' : '';
        const vidName = vid.name || `Video ${idx + 1}`;
        videoGridHTML += `<button class="v-sel ${activeClass}" data-src="${vid.src || ''}" data-name="${vidName}">0${idx + 1}</button>`;
      });
      
      const firstVid = vids[0] || {name: 'motion', src: ''};
      let gData = "[]";
      try { gData = JSON.stringify(images).replace(/"/g, '&quot;'); } catch(e){}

      const workspaceHTML = `
        <div class="media-workspace" id="media-workspace-${safeName}">
          <div class="media-ws-header">
            <button class="overlay-close-btn workspace-back-btn">return</button>
            <h2 class="ws-artist-title">${clientName}</h2>
          </div>
          <div class="media-container">
            <div class="display-area">
              <video class="${videoClass}" src="${firstVid.src || ''}" playsinline muted loop></video>
              <img class="gallery-img" src="${images[0] || ''}" style="display: none;" onerror="this.style.display='none'" />
              
              <div class="media-controls-dock">
                <div class="dock-video dock-panel" style="display: flex;">
                  <div class="m-btn-group"><button class="btn-play m-btn">play</button><button class="btn-mute m-btn">unmute</button></div>
                </div>
                <div class="dock-gallery dock-panel" style="display: none;">
                  <div class="m-btn-group"><button class="btn-prev m-btn">prev</button><button class="btn-next m-btn">next</button></div>
                  <div class="m-info"><span class="g-current">1</span> / <span class="g-total">${images.length}</span></div>
                </div>
              </div>
            </div>
            <div class="media-menu">
              <div class="menu-section-top">
                <div class="menu-label">motion</div>
                <div class="video-grid">${videoGridHTML}</div>
                <div class="active-media-name display-name">${firstVid.name || 'Video'}</div>
                <div class="menu-label">stills</div>
                <button class="btn-gallery btn-gallery-toggle" data-gallery="${gData}">
                  <span class="g-name">${gName}</span><span class="g-status gallery-status">loaded</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      workspacesTarget.insertAdjacentHTML('beforeend', workspaceHTML);
    });

    attachWorkspaceLogic();
  } catch (error) { console.error("Client Fetch Error:", error); }
}

function attachWorkspaceLogic() {
  document.querySelectorAll('.media-artist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-artist');
      const ws = document.getElementById(`media-workspace-${targetId}`);
      if (ws) {
        ws.style.setProperty('--click-x', e.clientX + 'px');
        ws.style.setProperty('--click-y', e.clientY + 'px');
        ws.classList.add('active');
        const vid = ws.querySelector('.custom-video');
        const playBtn = ws.querySelector('.btn-play');
        if (vid && vid.src && !vid.src.endsWith('undefined') && vid.src !== window.location.href) {
            vid.play().then(() => { if (playBtn) playBtn.innerText = 'pause'; }).catch(err=>{});
        }
      }
    });
  });

  document.querySelectorAll('.workspace-back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ws = e.target.closest('.media-workspace');
      if (ws) {
        ws.classList.remove('active');
        const vid = ws.querySelector('.custom-video');
        const playBtn = ws.querySelector('.btn-play');
        if (vid) { vid.pause(); if (playBtn) playBtn.innerText = 'play'; }
      }
    });
  });

  document.querySelectorAll('.media-workspace').forEach(ws => {
    const vidEl = ws.querySelector('.custom-video');
    const imgEl = ws.querySelector('.gallery-img');
    const dockVid = ws.querySelector('.dock-video');
    const dockGal = ws.querySelector('.dock-gallery');
    const dispName = ws.querySelector('.display-name');
    const galStatus = ws.querySelector('.gallery-status');
    
    const playBtn = ws.querySelector('.btn-play');
    if (playBtn && vidEl) {
      playBtn.addEventListener('click', () => {
        if (vidEl.paused) { vidEl.play(); playBtn.innerText = 'pause'; }
        else { vidEl.pause(); playBtn.innerText = 'play'; }
      });
    }

    const muteBtn = ws.querySelector('.btn-mute');
    if (muteBtn && vidEl) {
      muteBtn.addEventListener('click', () => {
        vidEl.muted = !vidEl.muted;
        muteBtn.innerText = vidEl.muted ? 'unmute' : 'mute';
      });
    }

    const vSelectors = ws.querySelectorAll('.v-sel');
    vSelectors.forEach(btn => {
      btn.addEventListener('click', () => {
        vSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if(vidEl) vidEl.style.display = 'block';
        if(imgEl) imgEl.style.display = 'none';
        if(dockVid) dockVid.style.display = 'flex';
        if(dockGal) dockGal.style.display = 'none';
        if(dispName) dispName.innerText = btn.getAttribute('data-name');
        if(galStatus) galStatus.innerText = 'loaded';
        if(vidEl) {
          vidEl.src = btn.getAttribute('data-src');
          if (vidEl.src && !vidEl.src.endsWith('undefined') && vidEl.src !== window.location.href) {
              vidEl.play().then(() => { if (playBtn) playBtn.innerText = 'pause'; }).catch(err=>{});
          }
        }
      });
    });

    const galToggle = ws.querySelector('.btn-gallery-toggle');
    if (galToggle) {
      let gIndex = 0;
      const gCurrent = ws.querySelector('.g-current');
      
      let images = [];
      try {
        const rawData = galToggle.getAttribute('data-gallery').replace(/&quot;/g, '"');
        images = JSON.parse(rawData);
      } catch(e) {}

      galToggle.addEventListener('click', () => {
        if(vidEl) { vidEl.pause(); vidEl.style.display = 'none'; }
        if(imgEl) imgEl.style.display = 'block';
        if(dockVid) dockVid.style.display = 'none';
        if(dockGal) dockGal.style.display = 'flex';
        if(dispName) dispName.innerText = 'stills archive';
        if(galStatus) galStatus.innerText = 'viewing';
        vSelectors.forEach(b => b.classList.remove('active'));
      });

      ws.querySelector('.btn-prev')?.addEventListener('click', () => {
        if(images.length === 0) return;
        gIndex = (gIndex - 1 + images.length) % images.length;
        if(imgEl) imgEl.src = images[gIndex];
        if(gCurrent) gCurrent.innerText = gIndex + 1;
      });
      
      ws.querySelector('.btn-next')?.addEventListener('click', () => {
        if(images.length === 0) return;
        gIndex = (gIndex + 1) % images.length;
        if(imgEl) imgEl.src = images[gIndex];
        if(gCurrent) gCurrent.innerText = gIndex + 1;
      });
    }
  });
}

// ==========================================
// 5. DYNAMIC UPCOMING SHOWS
// ==========================================
const upcomingContainer = document.getElementById('upcoming-wrapper-target');

function formatScheduleDate(dateText) {
  const value = (dateText || '').toString();
  const parts = value.split(/\s+-\s+/);
  if (parts.length === 2) {
    return `<span>${parts[0]}</span><span>-${parts[1]}</span>`;
  }
  return value;
}

async function loadTours() {
  if (!upcomingContainer) return;
  try {
    const querySnapshot = await getDocs(collection(db, "tours"));
    upcomingContainer.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const tour = doc.data() || {};
      if (!tour.artist) return; 

      let showsHTML = '';
      if (tour.shows && Array.isArray(tour.shows)) {
        tour.shows.forEach(show => {
          showsHTML += `
            <a href="${show.link || '#'}" class="schedule-row" target="_blank">
              <div class="s-data s-date">${show.date || ''}</div>
              <div class="s-data s-artist">${tour.artist}</div>
              <div class="s-data s-location">${show.location || ''}</div>
              <div class="s-data s-action">${show.action || 'tickets'}</div>
            </a>
          `;
        });
      }
      const tourHTML = `
        <div class="tour-accordion dynamic-accordion">
          <button type="button" class="schedule-row accordion-trigger">
            <div class="s-data s-date">${formatScheduleDate(tour.date_range || 'TBA')}</div>
            <div class="s-data s-artist">${tour.artist}</div>
            <div class="s-data s-location">${tour.tour_name || 'Tour'}</div>
            <div class="s-data s-action"><span class="accordion-icon">+</span> expand</div>
          </button>
          <div class="accordion-content"><div class="accordion-inner">${showsHTML}</div></div>
        </div>
      `;
      upcomingContainer.insertAdjacentHTML('beforeend', tourHTML);
    });

    document.querySelectorAll('.dynamic-accordion').forEach(acc => {
      const trigger = acc.querySelector('.accordion-trigger');
      const icon = acc.querySelector('.accordion-icon');
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        acc.classList.toggle('open');
        if (icon) icon.innerText = acc.classList.contains('open') ? '-' : '+';
      });
    });
  } catch (error) { console.error("Tours Fetch Error:", error); }
}

// ==========================================
// 6. DIRECT TO FIREBASE POPUP SUBMISSION
// ==========================================
const formModal = document.getElementById('contact-modal');
const formOpenBtn = document.getElementById('form-open-btn');
const formCloseBtn = document.getElementById('form-close-btn');

if (formOpenBtn && formModal && formCloseBtn) {
  formOpenBtn.addEventListener('click', () => formModal.classList.add('active'));
  formCloseBtn.addEventListener('click', () => formModal.classList.remove('active'));
  formModal.addEventListener('click', (e) => { if (e.target === formModal) formModal.classList.remove('active'); });
}

const contactForm = document.getElementById('ao-contact-form');
const resultMsg = document.getElementById('form-result-msg');
const submitBtn = document.getElementById('form-submit-btn');
const inquiryEmail = 'inquiry@accessopera.com';

function openInquiryEmailDraft(data) {
  const phone = `${data.country_code || ''} ${data.phone || ''}`.trim() || 'Not provided';
  const instagram = data.instagram || 'Not provided';
  const subject = `Direct inquiry from ${data.name || 'website visitor'}`;
  const body = [
    `Name: ${data.name || 'Not provided'}`,
    `Email: ${data.email || 'Not provided'}`,
    `Phone: ${phone}`,
    `Instagram: ${instagram}`
  ].join('\n');

  window.location.href = `mailto:${inquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    
    // Add a timestamp so we can sort them in your dashboard
    object.timestamp = new Date().toISOString();

    resultMsg.style.display = 'block';
    resultMsg.style.color = 'var(--dust)';
    resultMsg.innerHTML = 'sending...';
    submitBtn.style.opacity = '0.5';
    submitBtn.style.pointerEvents = 'none';

    try {
      // Push directly to Firebase instead of Web3Forms
      await addDoc(collection(db, "inquiries"), object);
      
      resultMsg.style.color = 'var(--gold)';
      resultMsg.innerHTML = 'message received. opening email...';
      openInquiryEmailDraft(object);
      contactForm.reset();
    } catch (error) {
      console.error("Form error:", error);
      resultMsg.style.color = 'red';
      resultMsg.innerHTML = 'error processing request.';
    } finally {
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'all';
      setTimeout(() => { resultMsg.style.display = 'none'; }, 5000);
    }
  });
}

// Start loading the dynamic data in the background silently
loadServices();
loadClients();
loadTours();
