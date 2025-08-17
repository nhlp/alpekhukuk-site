// Animations
AOS.init({ once: true, duration: 700, easing: "ease-out" });

// === Fixed navbar behavior ===
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");

function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  nav?.classList.toggle("scrolled", y > 10);
  // parallax
  document.documentElement.style.setProperty("--parallax", Math.min(40, y * 0.12) + "px");
}
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile toggle
if (toggle) {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}
// Close menu on link click
document.querySelectorAll(".menu a").forEach((a) => {
  a.addEventListener("click", () => {
    nav?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});
// Close when clicking outside (mobile)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 900 && nav?.classList.contains("open") && !nav.contains(e.target)) {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});
// Reset on desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    nav?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

// Year in footer
const yil = document.getElementById("yil");
if (yil) yil.textContent = new Date().getFullYear();

// === Calendly (varsa) ===
const CALENDLY_URL =
  "https://calendly.com/glnhlphlvn/30min?timezone=Europe%2FIstanbul&hide_gdpr_banner=1&background_color=0d0f14&text_color=e8ecf1&primary_color=c7a86f";

document.querySelectorAll('a[href="#randevu"]').forEach((el) => {
  el.addEventListener("click", (e) => {
    if (!window.Calendly) return;
    e.preventDefault();
    Calendly.initPopupWidget({ url: CALENDLY_URL });
  });
});

document.querySelectorAll("[data-calendly]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (!window.Calendly) return;
    e.preventDefault();
    Calendly.initPopupWidget({ url: CALENDLY_URL });
  });
});

// === Randevu formu (Formspree) ===
const FORM_ENDPOINT = "https://formspree.io/f/xblkwaeg";
const form = document.getElementById("quickForm");
const msg  = document.getElementById("quickMsg");
const btn  = document.getElementById("quickBtn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "";

    const fd = new FormData(form);

    // Honeypot (spam)
    if (fd.get("web_site")) { if (msg) msg.textContent = "İstek reddedildi."; return; }

    // Tarih kontrol
    const t = fd.get("tarih");
    if (!t) { if (msg) msg.textContent = "Lütfen bir gün seçin."; return; }
    const today = new Date(); today.setHours(0,0,0,0);
    const picked = new Date(String(t).replace(/(\d{2}).(\d{2}).(\d{4})/, "$3-$2-$1")+"T00:00:00");
    if (picked < today) { if (msg) msg.textContent = "Geçmiş gün seçilemez."; return; }

    // Gönder
    if (btn) { btn.disabled = true; btn.textContent = "Gönderiliyor…"; }
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: fd });
      if (res.ok) {
        if (msg) msg.textContent = "Teşekkürler! Talebiniz alındı. Seçtiğiniz gün için sizi arayacağız.";
        form.reset();
      } else {
        if (msg) msg.textContent = "Şu an gönderemedik. Lütfen telefonla arayın.";
      }
    } catch (err) {
      if (msg) msg.textContent = "Bağlantı hatası. Lütfen tekrar deneyin.";
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Talebi Gönder"; }
    }
  });
}

// === Takvim (flatpickr) ===
document.addEventListener("DOMContentLoaded", function () {
  const kapaliGunler = [];         // ör: "2025-08-30"
  const kapaliAraliklar = [];      // ör: { from: "2025-09-01", to: "2025-09-05" }

  const el = document.querySelector("#tarih");
  if (el && window.flatpickr) {
    flatpickr(el, {
      locale: "tr",
      dateFormat: "d.m.Y",
      minDate: "today",
      disable: [
        // Pazar(0) ve Cumartesi(6) kapalı
        function (date) { const d = date.getDay(); return d === 0 || d === 6; },
        ...kapaliGunler,
        ...kapaliAraliklar,
      ],
    });
  }
});

// === Telefon maskesi (05xx xxx xx xx) ===
(function () {
  const el = document.querySelector("#telefon") || document.querySelector('input[name="telefon"]');
  if (!el) return;

  const onlyDigits11 = (v) => v.replace(/\D/g, "").slice(0, 11);
  const prettify = (digits) => {
    if (digits.length && digits[0] === "5") digits = "0" + digits;
    const g1 = digits.slice(0, 4), g2 = digits.slice(4, 7), g3 = digits.slice(7, 9), g4 = digits.slice(9, 11);
    return [g1, g2, g3, g4].filter(Boolean).join(" ");
  };

  el.addEventListener("input", () => { el.value = prettify(onlyDigits11(el.value)); });
  el.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    el.value = prettify(onlyDigits11(text));
  });
  el.addEventListener("keydown", (e) => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
    if (allowed.includes(e.key)) return;
    if (!/\d/.test(e.key)) e.preventDefault();
  });

  const quickForm = document.getElementById("quickForm");
  if (quickForm) {
    quickForm.addEventListener("submit", () => {
      const digits = el.value.replace(/\D/g, "").slice(0, 11);
      const normalized = digits[0] === "5" ? ("0" + digits).slice(0, 11) : digits;
      el.value = normalized;
    });
  }
})();
