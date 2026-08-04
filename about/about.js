const loader = document.querySelector('.loader');
const cursor = document.getElementById('cursor-dot');
const contentColumn = document.getElementById('about-content');

function resetAboutScroll() {
  window.scrollTo(0, 0);
  if (contentColumn) contentColumn.scrollTop = 0;
}

resetAboutScroll();
window.addEventListener('pageshow', resetAboutScroll);

window.addEventListener('load', () => {
  resetAboutScroll();
  window.setTimeout(() => loader?.classList.add('gone'), 1000);
});

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

window.addEventListener('mousemove', (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  document.body.classList.add('cursor-ready');
});

function updateCursor() {
  if (cursor) {
    cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
  }
  window.requestAnimationFrame(updateCursor);
}

updateCursor();

document.querySelectorAll('.about-contact-button, .nav-item, .descriptor-top').forEach((element) => {
  element.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.about-reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    root: contentColumn,
    threshold: 0.08,
    rootMargin: '0px 0px -8% 0px'
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll('.about-media video').forEach((video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;

  if (reducedMotion) {
    video.pause();
    return;
  }

  const playback = video.play();
  if (playback && typeof playback.catch === 'function') playback.catch(() => {});
});
