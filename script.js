// Magnetic Cursor Engine (Dot only)
const dot = document.getElementById('cursor-dot');
let dx = 0, dy = 0;

document.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });

(function cursorLoop() {
  if(dot) dot.style.transform = `translate(calc(${dx}px - 50%), calc(${dy}px - 50%))`;
  requestAnimationFrame(cursorLoop);
})();

document.querySelectorAll('a, button, .nav-trigger, .v-sel, .service-card, .overlay-close-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Slide-up Loader
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.loader');
    if(loader) loader.classList.add('gone');
  }, 1000);
});

// Theme Engine (Light / Dark Mode)
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
      themeToggle.innerText = 'light mode';
    } else {
      themeToggle.innerText = 'dark mode';
    }
  });
}

// SPA Engine variables
const triggers = document.querySelectorAll('.nav-trigger');
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const globalVideo = document.getElementById('custom-video');
const playBtn = document.getElementById('btn-play');
const workspaces = document.querySelectorAll('.media-workspace');

// Overlays
const svcOverlay = document.getElementById('svc-overlay');
const svcOverlayContent = document.getElementById('svc-overlay-content');
const svcCloseBtn = document.getElementById('svc-close-btn');

function switchSPAView(targetId) {
  if(globalVideo && !globalVideo.paused) {
    globalVideo.pause();
    globalVideo.classList.remove('is-playing');
    if(playBtn) playBtn.innerText = 'play';
  }

  if(svcOverlay && svcOverlay.classList.contains('active')) {
    svcOverlay.classList.remove('active');
  }

  workspaces.forEach(ws => ws.classList.remove('active'));

  navItems.forEach(item => {
    item.classList.remove('active');
    if(item.getAttribute('data-target') === targetId) {
      item.classList.add('active');
    }
  });

  views.forEach(view => {
    view.classList.remove('active');
    if (view.id === targetId) {
      setTimeout(() => { view.classList.add('active'); }, 50);
    }
  });
}

triggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    if(trigger.getAttribute('href') === '#') e.preventDefault();
    
    if(trigger.getAttribute('data-target') === 'view-clients') {
      workspaces.forEach(ws => ws.classList.remove('active'));
    }

    switchSPAView(trigger.getAttribute('data-target'));
  });
});

// SERVICE EXPANSION CLIP-PATH LOGIC
const svcCards = document.querySelectorAll('.service-card');

svcCards.forEach(card => {
  card.addEventListener('click', (e) => {
    const rect = document.getElementById('view-services').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if(svcOverlay) {
      svcOverlay.style.setProperty('--click-x', `${x}px`);
      svcOverlay.style.setProperty('--click-y', `${y}px`);
    }

    const title = card.querySelector('.svc-title').innerText;
    const extended = card.querySelector('.svc-extended').innerHTML;

    if(svcOverlayContent) {
      svcOverlayContent.innerHTML = `
        <h2 class="svc-overlay-title">${title}</h2>
        <div class="svc-overlay-body">${extended}</div>
      `;
    }

    if(svcOverlay) svcOverlay.classList.add('active');
  });
});

if(svcCloseBtn) {
  svcCloseBtn.addEventListener('click', () => {
    if(svcOverlay) svcOverlay.classList.remove('active');
  });
}

// MEDIA ARCHIVE EXPANSION CLIP-PATH LOGIC
const artistBtns = document.querySelectorAll('.media-artist-btn');
artistBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const artist = btn.getAttribute('data-artist');
    const targetWorkspace = document.getElementById('media-workspace-' + artist);
    
    if(targetWorkspace) {
      const rect = document.getElementById('view-clients').getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      targetWorkspace.style.setProperty('--click-x', `${x}px`);
      targetWorkspace.style.setProperty('--click-y', `${y}px`);
      
      targetWorkspace.classList.add('active');
    }
    
    if (artist === 'ye') {
      if(globalVideo) {
        globalVideo.load();
        globalVideo.play().then(() => {
          if(playBtn) playBtn.innerText = 'pause';
          globalVideo.classList.add('is-playing');
        }).catch(err => {
          if(playBtn) playBtn.innerText = 'play';
        });
      }
    }
  });
});

const wsBackBtns = document.querySelectorAll('.workspace-back-btn');
wsBackBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    workspaces.forEach(ws => ws.classList.remove('active'));
    if(globalVideo && !globalVideo.paused) {
      globalVideo.pause();
      globalVideo.classList.remove('is-playing');
      if(playBtn) playBtn.innerText = 'play';
    }
  });
});

// DEFAULT LOAD BEHAVIOR
window.addEventListener('DOMContentLoaded', () => {
  switchSPAView('view-home');
});

// DEEP LINK IMPLEMENTATION ROUTINE
function triggerDeepLinkArchive(mode) {
  switchSPAView('view-clients');
  const yeWorkspace = document.getElementById('media-workspace-ye');
  
  if(yeWorkspace) {
    yeWorkspace.style.setProperty('--click-x', `50%`);
    yeWorkspace.style.setProperty('--click-y', `50%`);
    yeWorkspace.classList.add('active');
  }

  if (mode === 'gallery') {
    const btnGalleryToggle = document.getElementById('btn-gallery-toggle');
    if(btnGalleryToggle) btnGalleryToggle.click();
  } else {
    const defaultVideoBtn = document.querySelector('.v-sel[data-src="video1.mp4"]');
    if(defaultVideoBtn) defaultVideoBtn.click();
  }
}

const pastNMRow = document.getElementById('past-newmexico-row');
if(pastNMRow) {
  pastNMRow.addEventListener('click', (e) => {
    e.preventDefault();
    triggerDeepLinkArchive('gallery');
  });
}

// Accordion Logic for Upcoming Tour Dates
const tourAccordions = document.querySelectorAll('.tour-accordion');
tourAccordions.forEach(acc => {
  const trigger = acc.querySelector('.accordion-trigger');
  const actionText = trigger.querySelector('.s-action');
  
  if(trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      acc.classList.toggle('open');
      if (acc.classList.contains('open')) {
        if(actionText) actionText.innerHTML = '<span class="accordion-icon">+</span> collapse';
      } else {
        if(actionText) actionText.innerHTML = '<span class="accordion-icon">+</span> expand';
      }
    });
  }
});

// Structural Media Management (YE)
const displayVideo = document.getElementById('custom-video');
const displayGallery = document.getElementById('gallery-img');
const displayName = document.getElementById('display-name');

const dockVideo = document.getElementById('dock-video');
const dockGallery = document.getElementById('dock-gallery');

const vSelectors = document.querySelectorAll('.v-sel');
const btnGalleryToggle = document.getElementById('btn-gallery-toggle');
const gStatus = document.getElementById('gallery-status');

const muteBtn = document.getElementById('btn-mute');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

function formatTime(seconds) {
  if(isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

if(playBtn) {
  playBtn.addEventListener('click', () => {
    if (globalVideo.paused) {
      globalVideo.play();
      playBtn.innerText = 'pause';
      globalVideo.classList.add('is-playing');
    } else {
      globalVideo.pause();
      playBtn.innerText = 'play';
      globalVideo.classList.remove('is-playing');
    }
  });
}

if(muteBtn) {
  muteBtn.addEventListener('click', () => {
    globalVideo.muted = !globalVideo.muted;
    muteBtn.innerText = globalVideo.muted ? 'unmute' : 'mute';
  });
}

if(globalVideo) {
  globalVideo.addEventListener('loadedmetadata', () => {
    if(timeTotal) timeTotal.innerText = formatTime(globalVideo.duration);
  });
  globalVideo.addEventListener('timeupdate', () => {
    if(timeCurrent) timeCurrent.innerText = formatTime(globalVideo.currentTime);
  });
  globalVideo.addEventListener('ended', () => {
    if(playBtn) playBtn.innerText = 'play';
    globalVideo.classList.remove('is-playing');
  });
}

// Internal Carousel Logic (YE)
const galleryImages = ['gallery1.jpg', 'gallery2.jpg', 'gallery3.jpg'];
let gIndex = 0;
const gCurrent = document.getElementById('g-current');
const gTotal = document.getElementById('g-total');

if(gTotal) gTotal.innerText = galleryImages.length;

function updateGallery() {
  if(!displayGallery) return;
  displayGallery.style.filter = "grayscale(100%) contrast(1.1)";
  setTimeout(() => {
    displayGallery.src = galleryImages[gIndex];
    if(gCurrent) gCurrent.innerText = gIndex + 1;
    displayGallery.classList.add('is-active');
  }, 150);
}

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

if(btnPrev) {
  btnPrev.addEventListener('click', () => {
    gIndex = (gIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGallery();
  });
}
if(btnNext) {
  btnNext.addEventListener('click', () => {
    gIndex = (gIndex + 1) % galleryImages.length;
    updateGallery();
  });
}

// State Switching Matrix
vSelectors.forEach(btn => {
  btn.addEventListener('click', () => {
    vSelectors.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(btnGalleryToggle) btnGalleryToggle.classList.remove('active');
    if(gStatus) gStatus.innerText = 'loaded';

    if(displayName) displayName.innerText = btn.getAttribute('data-name');

    if(displayGallery) displayGallery.style.display = 'none';
    if(displayVideo) displayVideo.style.display = 'block';
    
    if(dockGallery) dockGallery.style.display = 'none';
    if(dockVideo) dockVideo.style.display = 'flex';

    const newSrc = btn.getAttribute('data-src');
    if(globalVideo) {
      globalVideo.src = newSrc;
      globalVideo.play().then(() => {
        if(playBtn) playBtn.innerText = 'pause';
        globalVideo.classList.add('is-playing');
      });
    }
  });
});

if(btnGalleryToggle) {
  btnGalleryToggle.addEventListener('click', () => {
    vSelectors.forEach(b => b.classList.remove('active'));
    btnGalleryToggle.classList.add('active');
    if(gStatus) gStatus.innerText = 'viewing';
    
    if(displayName) displayName.innerText = "new mexico archive (stills)";

    if(globalVideo) {
      globalVideo.pause();
      globalVideo.classList.remove('is-playing');
    }
    if(playBtn) playBtn.innerText = 'play';
    if(displayVideo) displayVideo.style.display = 'none';
    
    if(displayGallery) displayGallery.style.display = 'block';
    if(dockVideo) dockVideo.style.display = 'none';
    if(dockGallery) dockGallery.style.display = 'flex';

    updateGallery();
  });
}
