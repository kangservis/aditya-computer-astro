---
description: Aturan halaman, komponen, dan layout Astro (ClientRouter, window.*, innerHTML)
applyTo: "src/pages/**,src/components/**,src/layouts/**,src/lib/store.js"
---

# Aturan UI Astro — Aditya Computer

## Arsitektur

- Pertahankan pola **Layout + komponen + halaman**. Komponen statis dibuat sebagai `.astro`.
- Halaman publik memakai `Layout.astro`. `admin.astro` berdiri sendiri (tidak memakai Layout) dan tidak boleh ikut memuat Header/BottomNav/Modals.
- Tanpa UI framework (React/Vue/Svelte, `client:*`).
- Kerjakan di build-time (frontmatter `.astro`) bila datanya jarang berubah. Data produk/artikel tetap dari Firestore lewat `loadCollection` (lihat aturan data).

## Pola kode yang dipertahankan

- Fungsi UI global lewat `window.*` dan dipanggil dengan `onclick="window.xxx()"` (mis. `renderProducts`, `addToCart`, `openProductDetail`, `toggleCart`).
  **Jika mengganti nama/parameter fungsi, cari dan perbarui SEMUA pemanggilnya** (di `.astro` maupun di string template `innerHTML` pada `store.js`, `index.astro`, `admin.astro`).
- Render daftar memakai template string + `innerHTML`. Untuk field baru berisi teks bebas, perhatikan escaping (jangan menaruh input mentah ke `innerHTML`; gunakan `innerText`/`textContent` bila memungkinkan).
- Field data bisa kosong. Beri guard, mis. `prod.specs` mungkin tidak ada: pakai `(prod.specs || [])`.

## Perangkap ClientRouter (View Transitions)

1. `<script>` module hanya berjalan **sekali**. Kode di level atas skrip = sekali; kode yang bergantung pada elemen halaman harus dijalankan ulang tiap kunjungan.
2. Pola yang dipakai halaman data (`index.astro`, `artikel.astro`): fungsi `mulaiXxx()` dipanggil dari **dua pintu**, `astro:after-swap` (saat pindah tab, sebelum layar digambar) dan `astro:page-load` (muat pertama), dengan penanda `grid.dataset.dimuat` agar tidak jalan dua kali. Ikuti pola ini untuk halaman baru yang memuat data.
3. Wajib guard `if (!el) return` sebelum menyentuh elemen.
4. Listener di `document`/`window` **jangan** didaftarkan di dalam `astro:page-load` tanpa guard (menumpuk tiap pindah halaman). Daftarkan di level atas skrip (sekali) atau beri penanda.
5. Isi DOM `Header`/`BottomNav` ter-reset saat pindah halaman (mis. badge keranjang). Render ulang dari state; `store.js` sudah memanggil `window.updateCartCounter()` di `astro:page-load`.
6. Modal/elemen yang dibuat per halaman perlu dipasang ulang listener-nya tiap kunjungan (lihat `setupArticleModals` di `artikel.astro`).
7. Navigasi antar tab sengaja **tanpa animasi** (dimatikan di `globals.css`). Jangan menghidupkan kembali animasi view transition.

## Layout dan sentuhan

- Mobile-first, uji mental di lebar 360px.
- Bottom nav fixed: konten utama wajib `pb-24` (pada `md:` kembali normal).
- Target sentuh minimal ~40px. Tombol/elemen klik diberi `cursor-pointer`.
- Halaman baru: tambahkan tautan di `Header.astro` **dan** `BottomNav.astro` bila perlu, dengan `data-astro-prefetch` dan logika `pathname` yang sama.
- Kategori produk ditulis manual di `index.astro` (tombol filter) **dan** `admin.astro` (dropdown form). Ubah keduanya sekaligus.

## Gambar

- Selalu lewat `getProxyUrl(url, lebar)` dengan lebar sesuai ukuran tampil.
- Beri `width`/`height` (atau wadah dengan tinggi tetap) agar tidak terjadi layout shift, `decoding="async"`, dan `loading="lazy"` kecuali gambar paling atas layar.
