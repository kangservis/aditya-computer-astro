---
description: Periksa perubahan terakhir sebelum git push (build, pemanggil, konsistensi)
agent: agent
---

Saya akan melakukan `git push`. Periksa kesiapan perubahan terakhir. **Jangan mengubah file kecuali saya minta setelah laporan.** Jangan menjalankan `git commit`/`git push`.

1. Cek perubahan yang belum di-commit (`git status`, `git diff`):
   - Fungsi `window.*` yang diganti nama/parameter: apakah semua pemanggilnya (termasuk di string template `innerHTML`) sudah diperbarui?
   - Id elemen yang dipakai skrip: apakah masih ada di markup?
   - Daftar kategori: apakah `index.astro` dan `admin.astro` masih sama?
   - Halaman publik baru: sudah ada `pb-24`, tautan di Header dan BottomNav?
   - Gambar baru: lewat `getProxyUrl`, ada ukuran/`loading`/`decoding`?
   - Library/font/ikon baru atau `@latest` yang tidak dipin?
   - Ada rahasia/kunci yang tertulis di kode? Apakah `.env` ikut berubah?
2. Sebutkan hal yang perlu disiapkan di luar kode: env var di Cloudflare Pages, perubahan Firestore Rules, atau keduanya.

Laporan: daftar **Aman / Perlu diperbaiki / Perlu dicek manual**, lalu "Cara tes" singkat untuk hasil deploy.
