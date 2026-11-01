---
description: Aturan styling Tailwind v4, identitas visual, dan performa mobile
applyTo: "**/*.astro,src/styles/**,src/lib/store.js"
---

# Aturan Styling & Performa — Aditya Computer

## Tailwind CSS v4

- CSS-first: `@import "tailwindcss"` di `src/styles/globals.css`. **Jangan** membuat `tailwind.config.js` tanpa izin.
- Utility class langsung di markup. Gaya kustom yang berulang masuk `globals.css` (contoh yang sudah ada: `bento-card`, `accent-gradient`, `category-btn`, `scrollbar-none`).
- Class dinamis di template string JS harus ditulis **utuh** (mis. `"text-red-600"`), jangan dirakit dari potongan (`"text-" + warna`), karena Tailwind hanya mengenali class yang tertulis lengkap.

## Identitas visual (jangan diubah tanpa diminta)

- Aksen merah `#dc2626` (gradient `#ef4444` ke `#dc2626`), putih, slate.
- Warna fungsional: emerald (WhatsApp / stok tersedia), orange (Second), rose (habis). Jangan menambah warna baru tanpa alasan kuat.
- Sudut membulat, bayangan tipis, gaya bento card. Font: Inter (isi), Outfit (judul, `font-display`), JetBrains Mono (label/spek).
- Minimalis dan lapang. Tidak menambah elemen dekoratif.

## Performa (prioritas: HP kelas menengah, koneksi biasa)

Target Lighthouse mobile: LCP < 2,5 dtk, CLS mendekati 0, INP < 200 ms.

- **Hindari di mobile**: `backdrop-blur`, bayangan besar, `will-change` berlebihan, animasi yang memicu layout.
- Animasi (bila benar-benar perlu) hanya `transform` dan `opacity`, singkat.
- Perpindahan antar halaman sengaja tanpa animasi (diatur di `globals.css`). Jangan dihidupkan kembali.
- Bersihkan efek berat bila sedang menyentuh bagian itu, tapi jangan melebar ke file lain tanpa diminta.
- Gambar: lewat `getProxyUrl` dengan lebar sesuai ukuran tampil (katalog 400), `width`/`height` atau wadah tinggi tetap, `decoding="async"`, `loading="lazy"` kecuali gambar paling atas.
- Jangan menambah font, ikon, atau library baru. Jika benar-benar perlu: sebut ukurannya (KB gzip), alasannya, alternatif vanilla, dan minta persetujuan. Versi CDN wajib dipin (bukan `@latest`).
- Preferensi: vanilla JS/CSS dibanding library.
- Skrip halaman seminimal mungkin. Pekerjaan yang bisa dilakukan saat build (frontmatter `.astro`) jangan dipindah ke browser.

## Mobile-first

- Uji mental di lebar 360px dulu, baru `sm:`/`md:`/`lg:`.
- Konten utama punya `pb-24` karena bottom nav fixed (hilang di `md:`).
- Target sentuh minimal ~40px.
- Jangan membuat horizontal scroll tidak sengaja di 360px (cek teks panjang, `min-w`, grid).
