---
description: Analisis permintaan dan buat rencana + opsi, TANPA mengubah file
agent: ask
---

Saya ingin: ${input:keinginan:Ceritakan keinginanmu (boleh santai)}

Tugasmu sekarang **hanya merencanakan**. Jangan mengubah file apa pun.

1. Baca file yang relevan di repo (jangan menebak isinya).
2. Jelaskan dengan bahasa sederhana apa yang kamu pahami dari permintaan saya. Jika ada hal penting yang kurang jelas, tanya **SATU** pertanyaan terpenting.
3. Ajukan 2-3 opsi. Untuk tiap opsi sebut: biaya, kompleksitas, dampak ke kecepatan website, dan file yang akan berubah.
4. Beri rekomendasimu beserta alasannya.
5. Sebutkan risiko atau keberatanmu secara jujur bila ada yang bertentangan dengan prinsip di `copilot-instructions.md`.
6. Jika menyentuh data, ingatkan apa yang perlu dicek di Firestore Rules.
7. Pecah pekerjaan menjadi langkah kecil (satu fitur per langkah).

Berhenti di situ dan tunggu persetujuan saya.
