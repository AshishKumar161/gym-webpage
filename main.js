import './style.css';

// =========================================
// Navbar scroll detection
// =========================================
const header = document.getElementById('site-header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });

// =========================================
// Mobile nav toggle
// =========================================
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
let menuOpen = false;

navToggle?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    navMenu.style.cssText = `
      display: flex; flex-direction: column; gap: 0.25rem;
      position: fixed; top: 70px; left: 0; right: 0;
      background: rgba(13,15,20,0.98); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 1rem 1.5rem 1.5rem; z-index: 99;
    `;
  } else {
    navMenu.style.cssText = '';
  }
});

navMenu?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    navMenu.style.cssText = '';
  });
});

// =========================================
// Scroll fade-in (IntersectionObserver)
// =========================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// =========================================
// Gym Tour Video – click-to-play
// =========================================
const placeholder = document.getElementById('video-placeholder');
const playBtn     = document.getElementById('play-btn');
const videoWrap   = placeholder?.closest('.video-wrapper');

const playVideo = () => {
  if (!videoWrap) return;
  videoWrap.classList.add('playing');
  const iframe = videoWrap.querySelector('iframe');
  // Autoplay by appending autoplay param
  if (iframe && !iframe.src.includes('autoplay')) {
    iframe.src += '&autoplay=1';
  }
};

placeholder?.addEventListener('click', playVideo);
playBtn?.addEventListener('click', (e) => { e.stopPropagation(); playVideo(); });

// =========================================
// Active nav link on scroll
// =========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      active?.classList.add('active');
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

// =========================================
// Gallery lightbox (simple)
// =========================================
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.style.cssText = `
  display:none; position:fixed; inset:0; z-index:9999;
  background:rgba(0,0,0,0.92); backdrop-filter:blur(6px);
  align-items:center; justify-content:center; cursor:zoom-out;
`;
lightbox.innerHTML = '<img id="lb-img" style="max-width:92vw;max-height:88vh;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.7);" />';
document.body.appendChild(lightbox);

const lbImg = document.getElementById('lb-img');
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const src = item.querySelector('img')?.src;
    if (!src) return;
    lbImg.src = src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
});
lightbox.addEventListener('click', () => {
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
});
