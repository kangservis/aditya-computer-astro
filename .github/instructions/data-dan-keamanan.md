---
description: Aturan data Firestore, cache, upload gambar, dan keamanan
applyTo: "src/lib/firebase.js,src/lib/data.js,functions/**,src/pages/admin.astro"
---

# Aturan Data & Keamanan — Aditya Computer

## Struktur data (jangan diubah tanpa rencana migrasi)

- `products`: name, brand, category, condition ("Baru"/"Second"), stock, price, description, specs[], image, images[]
- `articles`: title, date, readTime, image, excerpt, content
- Menambah/mengganti nama field atau koleksi = ajukan rencana migrasi data lama dulu dan tunggu persetujuan.
- Kode harus tahan data lama yang tidak punya field baru (beri nilai default/guard).

## Hemat pembacaan Firestore

- Halaman publik membaca data lewat `loadCollection(nama, onData)` di `src/lib/data.js`. **Jangan** memanggil `getDocs` langsung di halaman publik.
- Cache: `products` 5 menit, `articles` 30 menit, maksimal usang 24 jam (konstanta `TTL` dan `MAKS_USANG`). Ubah angka hanya di sana.
- Setiap simpan/hapus dari admin wajib memanggil `hapusCache("products")` atau `hapusCache("articles")` (nama = nama koleksi).
- Dashboard admin sengaja membaca langsung (`getDocs`) agar data selalu terbaru.
- Jangan memakai `onSnapshot` (listener real-time) atau membaca dalam perulangan tanpa alasan kuat dan persetujuan.
- Koleksi baru: tambahkan masa berlaku di `TTL` (kalau tidak, cache tidak berfungsi).

## Firebase

- Import Firebase dari CDN gstatic **v10.8.0**. Semua import (app, firestore, auth) harus **satu versi yang sama**. Jangan mencampur versi atau menambah paket npm `firebase` tanpa persetujuan.
- `PUBLIC_FIREBASE_*` memang tertanam di browser; itu normal untuk Firebase web. Keamanan sebenarnya ada di **Firestore Security Rules**, bukan di menyembunyikan config.

## Firestore Security Rules (penjaga sebenarnya)

- Baca: publik untuk `products` dan `articles`.
- Tulis: hanya admin yang UID-nya terdaftar di Rules (bukan sekadar `request.auth != null`).
- Setiap fitur yang menyentuh data: **ingatkan pemilik untuk mengecek Rules**, dan tulis usulan Rules bila perlu. Jangan mengarang Rules tanpa menjelaskan artinya dengan bahasa sederhana.
- Fitur apa pun yang membuat koleksi baru perlu aturan baru; tanpa aturan, akses ditolak.

## Upload gambar

- Browser memanggil `/api/upload` (Cloudflare Pages Function `functions/api/upload.js`), yang meneruskan ke ImgBB. Kunci ImgBB disimpan sebagai secret `IMGBB_API_KEY` di Cloudflare (**tanpa** awalan `PUBLIC_`). Jangan pernah memindahkan kunci ini ke kode browser.
- Status saat ini: `/api/upload` belum memverifikasi bahwa pemanggilnya admin yang login. Pengamanan ini adalah pekerjaan terencana (verifikasi token Firebase di function). Jangan mengklaim endpoint ini sudah aman.
- Foto ditampilkan lewat `getProxyUrl` (wsrv.nl, webp). Maksimal 5 foto per produk.

## Rahasia

- Jangan membuka, meminta, atau menampilkan isi `.env`, password admin, atau service account.
- Jangan menaruh token/API key/password di kode sisi klien. Jika fitur membutuhkan rahasia, jelaskan cara menyimpannya aman (secret di Cloudflare, dipakai dari Pages Function).
- `.env` sudah ada di `.gitignore`; pertahankan.

## Admin (`admin.astro`)

- Dashboard mandiri; tujuan utamanya pemilik bisa mengelola konten tanpa menyentuh kode.
- Data dari Firestore dimasukkan ke tabel lewat `innerHTML`. Untuk field teks bebas yang baru, perhatikan escaping.
- Library CDN (SortableJS) harus dipin ke versi tertentu. Saat menyentuh baris itu, ganti `@latest` menjadi versi pasti.
- Jangan menambah efek berat (`backdrop-blur`, bayangan besar) di sini.
