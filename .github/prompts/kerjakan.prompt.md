---
description: Kerjakan SATU langkah dari rencana yang sudah disetujui
agent: agent
---

Kerjakan langkah ini (sudah saya setujui): ${input:langkah:Tempel langkah/rencana yang disetujui}

Aturan:

1. Baca dulu file yang akan diubah dan cari semua pemanggilnya (`window.namaFungsi`, id elemen, nama class).
2. Kerjakan **hanya** langkah ini. Jangan refactor atau memperbaiki hal lain di luar cakupan; kalau menemukan masalah lain, catat di bagian "Langkah berikutnya".
3. Patuhi `copilot-instructions.md` dan instruksi per area (identitas visual, performa, pola `window.*`, perangkap ClientRouter, struktur data Firestore).
4. Jangan menambah library/font/ikon, jangan menyentuh `.env`, jangan `git commit`/`git push`.
5. Setelah selesai, biarkan saja begitu jangan jalankan `npm run build` biar saya sendiri yang test.

Laporan akhir (ringkas, bahasa sederhana):

- Apa yang diubah (file + bagian).
- **Cara tes**
- **Yang perlu di-deploy**
- **Langkah berikutnya yang disarankan**
