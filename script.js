// script.js
(function() {
  // PRELOADER
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function() { 
    setTimeout(function() { 
      preloader.classList.add('hidden'); 
    }, 600); 
  });
  setTimeout(function() { 
    preloader.classList.add('hidden'); 
  }, 4000);

  // COUNTDOWN TIMER
  var eventDate = new Date('2026-05-30T20:00:00+03:00').getTime();
  var prevValues = ['', '', '', ''];
  
  function pad(n) { 
    return String(Math.max(0, Math.floor(n))).padStart(2, '0'); 
  }
  
  function updateCountdown() {
    var d = Math.max(0, eventDate - Date.now());
    var values = [
      pad(d / 86400000), 
      pad((d % 86400000) / 3600000), 
      pad((d % 3600000) / 60000), 
      pad((d % 60000) / 1000)
    ];
    var ids = ['days', 'hours', 'minutes', 'seconds'];
    
    ids.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      
      if (values[i] !== prevValues[i]) {
        el.classList.add('glitch');
        setTimeout(function() { 
          el.classList.remove('glitch'); 
        }, 200);
        el.style.opacity = '0';
        setTimeout(function() { 
          el.textContent = values[i]; 
          el.style.opacity = '1'; 
        }, 100);
        prevValues[i] = values[i];
      } else if (prevValues[i] === '') { 
        el.textContent = values[i]; 
        prevValues[i] = values[i]; 
      }
    });
  }
  
  updateCountdown(); 
  setInterval(updateCountdown, 1000);

  // FAQ ACCORDION
  document.querySelectorAll('.faq-item').forEach(function(item) { 
    item.addEventListener('click', function() { 
      item.classList.toggle('open'); 
    }); 
  });

  // MOBILE MENU
  var menuBtn = document.getElementById('menuBtn');
  var navMenu = document.getElementById('navMenu');
  
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', function() { 
      navMenu.classList.toggle('open'); 
    });
    
    navMenu.querySelectorAll('a, button').forEach(function(el) { 
      el.addEventListener('click', function() { 
        navMenu.classList.remove('open'); 
      }); 
    });
  }

  // SEAT MAP OVERLAY
  var overlay = document.getElementById('seatMapOverlay');
  var seatMapImg = document.getElementById('seatMapImg');
  var seatMapClose = document.getElementById('seatMapClose');
  var seatMapHeaderBtn = document.getElementById('seatMapHeaderBtn');
  var seatMapFooterBtn = document.getElementById('seatMapFooterBtn');
  
  function openSeatMap() { 
    if (overlay) overlay.classList.add('open'); 
  }
  
  function closeSeatMap() { 
    if (overlay) overlay.classList.remove('open'); 
  }
  
  if (seatMapHeaderBtn) {
    seatMapHeaderBtn.addEventListener('click', openSeatMap);
  }
  
  if (seatMapFooterBtn) {
    seatMapFooterBtn.addEventListener('click', openSeatMap);
  }
  
  if (seatMapClose) {
    seatMapClose.addEventListener('click', closeSeatMap);
  }
  
  if (overlay) {
    overlay.addEventListener('click', function(e) { 
      if (e.target === overlay) closeSeatMap(); 
    });
  }
  
  if (seatMapImg) {
    seatMapImg.onerror = function() { 
      seatMapImg.style.display = 'none'; 
    };
  }

  // SCROLL REVEAL ANIMATION
  var revealElements = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function(entries) { 
    entries.forEach(function(entry) { 
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    }); 
  }, { threshold: 0.12 });
  
  revealElements.forEach(function(el) { 
    observer.observe(el); 
  });

  // SMOOTH SCROLLING FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      var targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        var navHeight = 56;
        var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ADD GLITCH EFFECT TO COUNTDOWN NUMBERS ON PAGE LOAD
  setTimeout(function() {
    var countdownNumbers = document.querySelectorAll('.countdown-number');
    countdownNumbers.forEach(function(num) {
      if (num.textContent !== '00') {
        num.classList.add('glitch');
        setTimeout(function() { num.classList.remove('glitch'); }, 200);
      }
    });
  }, 500);

  // TICKET BUTTON TRACKING (optional analytics-ready)
  var ticketBtns = document.querySelectorAll('.ticket-btn');
  ticketBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var ticketCard = this.closest('.ticket-card');
      var ticketName = '';
      if (ticketCard) {
        var nameEl = ticketCard.querySelector('.ticket-name');
        if (nameEl) ticketName = nameEl.innerText.replace(/\n/g, ' ').trim();
      }
      // Analytics-ready: console log for tracking (can be replaced with actual analytics)
      console.log('Ticket click: ' + ticketName + ' -> ' + this.href);
    });
  });

  // PROMOTER LINKS TRACKING
  var promoterLinks = document.querySelectorAll('.promoters-main a, .press-note a');
  promoterLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      console.log('Promoter link click: ' + this.href);
    });
  });

  // FOOTER YEAR AUTO-UPDATE
  var footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom) {
    var currentYear = new Date().getFullYear();
    var yearSpan = footerBottom.querySelector('span:first-child');
    if (yearSpan && yearSpan.textContent.includes('2026')) {
      yearSpan.textContent = '© ' + currentYear + ' YE ISTANBUL';
    }
  }

  // PRELOADER FALLBACK: ensure preloader hides if something goes wrong
  setTimeout(function() {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
    }
  }, 5000);

  // ADD KEYBOARD SUPPORT FOR SEAT MAP (ESC to close)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeSeatMap();
    }
  });

  // MOBILE MENU CLOSE ON WINDOW RESIZE (if screen becomes desktop)
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 767 && navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    }, 250);
  });

  // HERO IMAGE FALLBACK (if images fail to load)
  var heroImgs = document.querySelectorAll('.hero-bg img');
  heroImgs.forEach(function(img) {
    img.onerror = function() {
      this.style.backgroundColor = '#0D0D0D';
      this.style.minHeight = '100vh';
    };
  });

  // SPOTIFY IFRAME LOADING STATE (optional)
  var spotifyFrame = document.querySelector('.embed-box iframe');
  if (spotifyFrame) {
    spotifyFrame.setAttribute('title', 'YE Album Spotify Embed');
  }

  // ADD TOUCH OPTIMIZATION FOR FAQ ON MOBILE
  if ('ontouchstart' in window) {
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
      item.addEventListener('touchstart', function(e) {
        // Just to improve touch responsiveness
        this.style.cursor = 'pointer';
      });
    });
  }
})();
