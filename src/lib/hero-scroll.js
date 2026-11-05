const DURASI = 650;
const TOLERANSI = 2;
const KUNCI_TAMBAHAN = 150;
const JEDA_SETTLE = 200;

const MEDIA_DESKTOP = "(min-width: 1024px)";
const MEDIA_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
let posisiKatalog = null;
let scrollMaksimum = 0;
let sedangAnimasi = false;
let kunciSampai = 0;
let pointerDitekan = false;
let frameAnimasi = 0;
let timerSettle;
let timerResize;

function hitungPosisi() {
  const hero = document.getElementById("hero-slide");
  const katalog = document.getElementById("katalog");
  if (!hero || !katalog) {
    posisiKatalog = null;
    return;
  }

  const tinggiHeader = document.querySelector("header")?.offsetHeight || 64;
  scrollMaksimum = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  posisiKatalog = Math.min(
    scrollMaksimum,
    Math.max(
      0,
      Math.round(
        katalog.getBoundingClientRect().top + window.scrollY - tinggiHeader,
      ),
    ),
  );
}

function halamanAktif() {
  if (
    !window.matchMedia(MEDIA_DESKTOP).matches ||
    !document.getElementById("hero-slide") ||
    document.body.style.overflow === "hidden"
  ) {
    return false;
  }

  const overlayIds = [
    "cart-drawer",
    "checkout-modal",
    "product-detail-modal",
    "image-lightbox",
  ];
  return !overlayIds.some((id) => {
    const overlay = document.getElementById(id);
    return overlay && !overlay.classList.contains("hidden");
  });
}

function akhiriAnimasi() {
  sedangAnimasi = false;
  kunciSampai = performance.now() + KUNCI_TAMBAHAN;
}

function animasiKe(y) {
  const tujuan = Math.min(scrollMaksimum, Math.max(0, Math.round(y)));
  const awal = window.scrollY;
  const waktuMulai = performance.now();
  const durasi = window.matchMedia(MEDIA_REDUCED_MOTION).matches
    ? 0
    : DURASI;

  sedangAnimasi = true;
  if (frameAnimasi) cancelAnimationFrame(frameAnimasi);

  if (durasi === 0) {
    window.scrollTo({ top: tujuan, left: 0, behavior: "instant" });
    akhiriAnimasi();
    return;
  }

  function langkah(waktuSekarang) {
    const progres = Math.min(1, (waktuSekarang - waktuMulai) / durasi);
    const easing =
      progres < 0.5
        ? 4 * progres * progres * progres
        : 1 - Math.pow(-2 * progres + 2, 3) / 2;
    const posisi = awal + (tujuan - awal) * easing;
    window.scrollTo({ top: posisi, left: 0, behavior: "instant" });

    if (progres < 1) {
      frameAnimasi = requestAnimationFrame(langkah);
    } else {
      frameAnimasi = 0;
      akhiriAnimasi();
    }
  }

  frameAnimasi = requestAnimationFrame(langkah);
}

function tangani(arah, px) {
  if (!halamanAktif() || posisiKatalog === null) return false;

  if (sedangAnimasi || performance.now() < kunciSampai) return true;

  const y = window.scrollY;
  const batasKatalog = posisiKatalog;
  if (arah > 0) {
    if (y < batasKatalog - TOLERANSI) {
      animasiKe(batasKatalog);
      return true;
    }
    return false;
  }

  if (y <= TOLERANSI) return false;
  if (y <= batasKatalog + TOLERANSI || y - px < batasKatalog) {
    animasiKe(0);
    return true;
  }
  return false;
}

function jadwalkanSettle() {
  clearTimeout(timerSettle);
  timerSettle = setTimeout(() => {
    if (!halamanAktif() || sedangAnimasi || pointerDitekan) return;
    const y = window.scrollY;
    if (y > TOLERANSI && y < posisiKatalog - TOLERANSI) {
      animasiKe(y < posisiKatalog / 2 ? 0 : posisiKatalog);
    }
  }, JEDA_SETTLE);
}

function perbaruiPosisi() {
  hitungPosisi();
  if (
    posisiKatalog !== null &&
    window.scrollY > TOLERANSI &&
    window.scrollY < posisiKatalog - TOLERANSI
  ) {
    jadwalkanSettle();
  }
}

function handleWheel(event) {
  let delta = event.deltaY;
  if (event.deltaMode === 1) delta *= 16;
  else if (event.deltaMode === 2) delta *= window.innerHeight;
  const px = Math.abs(delta);
  if (px < 4) return;
  if (tangani(delta > 0 ? 1 : -1, px)) event.preventDefault();
}

function handleKeydown(event) {
  if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
  const target = event.target;
  if (
    target instanceof Element &&
    target.closest("input, textarea, select, button, a, [contenteditable]")
  ) {
    return;
  }

  let arah;
  let px;
  if (event.key === "ArrowDown") {
    arah = 1;
    px = 40;
  } else if (event.key === "PageDown" || event.key === " ") {
    arah = 1;
    px = window.innerHeight * 0.9;
  } else if (event.key === "ArrowUp") {
    arah = -1;
    px = 40;
  } else if (event.key === "PageUp") {
    arah = -1;
    px = window.innerHeight * 0.9;
  } else {
    return;
  }

  if (tangani(arah, px)) event.preventDefault();
}

function handleClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest('a[href="#katalog"]');
  if (!link || !halamanAktif() || posisiKatalog === null) return;
  event.preventDefault();
  if (sedangAnimasi || performance.now() < kunciSampai) return;
  animasiKe(posisiKatalog);
}

function handleScroll() {
  if (
    !sedangAnimasi &&
    halamanAktif() &&
    posisiKatalog !== null &&
    window.scrollY > TOLERANSI &&
    window.scrollY < posisiKatalog - TOLERANSI
  ) {
    jadwalkanSettle();
  } else {
    clearTimeout(timerSettle);
  }
}

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("pointerdown", () => {
  pointerDitekan = true;
});
window.addEventListener("pointerup", () => {
  pointerDitekan = false;
  jadwalkanSettle();
});
window.addEventListener("pointercancel", () => {
  pointerDitekan = false;
  jadwalkanSettle();
});
window.addEventListener("resize", () => {
  clearTimeout(timerResize);
  timerResize = setTimeout(perbaruiPosisi, 100);
});
document.addEventListener("click", handleClick);
document.addEventListener("astro:page-load", perbaruiPosisi);

perbaruiPosisi();
