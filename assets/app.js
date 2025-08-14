AOS.init({ once: true, duration: 700, easing: 'ease-out' });

const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');

if (toggle) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

document.querySelectorAll('.menu a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && nav.classList.contains('open') && !nav.contains(e.target)) {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

const root = document.documentElement;
const onScroll = () => {
  const y = window.scrollY || window.pageYOffset;
  nav.classList.toggle('scrolled', y > 10);
  root.style.setProperty('--parallax', Math.min(40, y * 0.12) + 'px');
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

document.getElementById('yil').textContent = new Date().getFullYear();

const CALENDLY_URL = "https://calendly.com/glnhlphlvn/30min?timezone=Europe%2FIstanbul&hide_gdpr_banner=1&background_color=0d0f14&text_color=e8ecf1&primary_color=c7a86f";
document.querySelectorAll('a[href="#randevu"]').forEach(el=>{
  el.addEventListener('click', (e)=>{
    e.preventDefault();
    Calendly.initPopupWidget({ url: CALENDLY_URL });
  });

document.querySelectorAll('[data-calendly]').forEach(el=>{
  el.addEventListener('click', (e)=>{
    e.preventDefault();
    Calendly.initPopupWidget({ url: "https://calendly.com/glnhlphlvn/30min?timezone=Europe%2FIstanbul&hide_gdpr_banner=1&background_color=0d0f14&text_color=e8ecf1&primary_color=c7a86f" });
  });
});


});
