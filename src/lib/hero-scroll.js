const DURASI = 550;
const TOLERANSI = 2;
const KUNCI_TAMBAHAN = 150;
const JEDA_SETTLE = 200;
const JEDA_FRAME = 33;
// Ubah ke true bila ingin menghormati pengaturan OS.
const HORMATI_REDUCED_MOTION = false;
// "js" = animasi buatan sendiri yang sama di semua browser;
// "native" = scrollTo smooth bawaan browser, hampir tanpa kerja per frame,
// tetapi di Firefox dapat mengikuti pengaturan smooth scroll browser.
const MODE_ANIMASI = "js";

const MEDIA_DESKTOP = "(min-width: 1024px)";
const MEDIA_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const mqDesktop = window.matchMedia(MEDIA_DESKTOP);
const mqReduced = window.matchMedia(MEDIA_REDUCED_MOTION);
let sedangAnimasi = false;
let kunciSampai = 0;
let waktuMulaiAnimasi = 0;
let tujuanAnimasiAktif = 0;
let pointerDitekan = false;
let frameAnimasi = 0;
let timerSettle;
let timerNativeFallback;

function selesaiAnimasiNative() {
  akhiriAnimasi();
}

function ambilBatas() {
  const katalog = document.getElementById("katalog");
  if (!katalog) return null;

  const tinggiHeader = document.querySelector("header")?.offsetHeight || 64;
  const maks = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const t = Math.round(
    katalog.getBoundingClientRect().top + window.scrollY - tinggiHeader,
  );
  const batas = Math.min(maks, Math.max(0, t));
  return batas > TOLERANSI ? batas : null;
}

function halamanAktif() {
  if (
    !mqDesktop.matches ||
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
  if (frameAnimasi) cancelAnimationFrame(frameAnimasi);
  frameAnimasi = 0;
  clearTimeout(timerNativeFallback);
  window.removeEventListener("scrollend", selesaiAnimasiNative);
  sedangAnimasi = false;
  document.documentElement.classList.remove("sedang-gulir");
  kunciSampai = performance.now() + KUNCI_TAMBAHAN;
}

function animasiKe(tujuan) {
  document.documentElement.classList.add("sedang-gulir");
  tujuanAnimasiAktif = tujuan;
  waktuMulaiAnimasi = performance.now();
  sedangAnimasi = true;

  if (Math.abs(tujuan - window.scrollY) < 1) {
    akhiriAnimasi();
    return;
  }

  if (frameAnimasi) cancelAnimationFrame(frameAnimasi);
  clearTimeout(timerNativeFallback);
  window.removeEventListener("scrollend", selesaiAnimasiNative);

  if (MODE_ANIMASI === "native") {
    window.addEventListener("scrollend", selesaiAnimasiNative, { once: true });
    timerNativeFallback = setTimeout(akhiriAnimasi, 1200);
    window.scrollTo({ top: tujuan, left: 0, behavior: "smooth" });
    return;
  }

  const awal = window.scrollY;
  let waktuMulai = null;
  let waktuUpdateTerakhir = 0;
  let posisiTerakhirDitulis = Math.round(awal);
  const durasi =
    HORMATI_REDUCED_MOTION &&
    mqReduced.matches
      ? 0
      : DURASI;

  if (durasi === 0) {
    window.scrollTo({ top: tujuan, left: 0, behavior: "instant" });
    akhiriAnimasi();
    return;
  }

  function langkah(waktuSekarang) {
    if (waktuMulai === null) waktuMulai = waktuSekarang;
    const progres = Math.min(1, (waktuSekarang - waktuMulai) / durasi);
    const easing =
      progres < 0.5
        ? 4 * progres * progres * progres
        : 1 - Math.pow(-2 * progres + 2, 3) / 2;
    const posisi = awal + (tujuan - awal) * easing;
    const posisiBulat = Math.round(posisi);
    if (
      (waktuSekarang - waktuUpdateTerakhir >= JEDA_FRAME || progres === 1) &&
      (posisiBulat !== posisiTerakhirDitulis || progres === 1)
    ) {
      const posisiTulis = progres === 1 ? tujuan : posisi;
      window.scrollTo({
        top: posisiTulis,
        left: 0,
        behavior: "instant",
      });
      waktuUpdateTerakhir = waktuSekarang;
      posisiTerakhirDitulis = Math.round(posisiTulis);
    }

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
  if (!halamanAktif()) return false;
  if (window.scrollY > window.innerHeight * 2) return false;

  if (
    sedangAnimasi &&
    performance.now() - waktuMulaiAnimasi > DURASI + 500
  ) {
    akhiriAnimasi();
  }

  if (sedangAnimasi || performance.now() < kunciSampai) return true;

  const batasKatalog = ambilBatas();
  if (batasKatalog === null) return false;

  const y = window.scrollY;
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
    const batasKatalog = ambilBatas();
    if (batasKatalog === null) return;
    const y = window.scrollY;
    if (y > TOLERANSI && y < batasKatalog - TOLERANSI) {
      animasiKe(y < batasKatalog / 2 ? 0 : batasKatalog);
    }
  }, JEDA_SETTLE);
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
  if (
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest('a[href="#katalog"]');
  if (!link || !halamanAktif()) return;
  const batasKatalog = ambilBatas();
  if (batasKatalog === null) return;
  event.preventDefault();
  event.stopPropagation();
  if (sedangAnimasi || performance.now() < kunciSampai) return;
  animasiKe(batasKatalog);
}

function handleVisibilityChange() {
  if (!document.hidden || !sedangAnimasi) return;
  window.scrollTo({
    top: tujuanAnimasiAktif,
    left: 0,
    behavior: "instant",
  });
  akhiriAnimasi();
}

function handleScroll() {
  if (sedangAnimasi) return;

  const y = window.scrollY;
  if (
    y <= TOLERANSI ||
    y > window.innerHeight * 2 ||
    !halamanAktif()
  ) {
    clearTimeout(timerSettle);
    return;
  }

  jadwalkanSettle();
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
window.addEventListener("resize", jadwalkanSettle);
document.addEventListener("visibilitychange", handleVisibilityChange);
document.addEventListener("click", handleClick, true);
