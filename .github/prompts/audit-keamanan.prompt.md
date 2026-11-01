---
description: Audit keamanan website (laporan saja, tanpa mengubah file)
agent: ask
---

Audit keamanan website ini. **Hanya laporan, jangan mengubah file.** Jangan membuka atau menampilkan isi `.env`.

Periksa:

- Rahasia di kode sisi klien: kunci/token/password yang ikut terbawa ke browser selain `PUBLIC_FIREBASE_*` (yang memang normal).
- `functions/api/upload.js`: apakah memverifikasi pemanggilnya, batas ukuran/tipe file, penanganan error.
- Pemakaian `innerHTML` dengan data dari Firestore atau input pengguna (risiko XSS), terutama di `admin.astro`, `index.astro`, `artikel.astro`, `store.js`.
- Kode admin: alur login, apa yang terjadi bila pengguna biasa membuka `/admin`.
- Asumsi yang bergantung pada Firestore Rules. Sebutkan Rules yang harus ada agar kode aman, dan minta saya mengecek Rules di konsol Firebase (kamu tidak bisa melihatnya dari repo).
- Library CDN tanpa versi pasti.

Format laporan:

1. Temuan diurutkan dari risiko tertinggi, masing-masing dengan file + bagian, penjelasan sederhana, dan tingkat risiko (tinggi/sedang/rendah).
2. Langkah perbaikan kecil yang disarankan, berurutan.
3. Hal yang sudah aman.

Berhenti dan tunggu saya memilih langkah mana yang dikerjakan.
