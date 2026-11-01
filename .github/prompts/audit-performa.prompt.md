---
description: Audit performa mobile (laporan saja, tanpa mengubah file)
agent: ask
---

Audit performa website ini untuk HP kelas menengah dan koneksi biasa. **Hanya laporan, jangan mengubah file.**

Periksa:

- Efek berat di mobile: `backdrop-blur`, bayangan besar, `will-change`, animasi yang memicu layout.
- Gambar: pemakaian `getProxyUrl` dan ukuran lebar, `width`/`height` (CLS), `loading="lazy"` dan `decoding="async"`, gambar paling atas tidak di-lazy.
- JavaScript: skrip yang bisa dikerjakan saat build, listener yang menumpuk akibat ClientRouter, `innerHTML` besar yang dirender berulang.
- Firestore: pembacaan yang tidak lewat `loadCollection`, cache (`TTL`) yang tidak terpakai, fetch ganda.
- Sumber luar di `<head>`: font, ikon, CDN. Sebut yang tidak dipin versinya dan ukuran perkiraan.

Format laporan:

1. Daftar temuan, diurutkan dari dampak terbesar ke terkecil, masing-masing dengan file + bagian, penjelasan sederhana, dan perkiraan dampak.
2. Rekomendasi urutan perbaikan dalam langkah kecil.
3. Hal yang sudah baik (jangan diubah).

Berhenti dan tunggu saya memilih langkah mana yang dikerjakan.
