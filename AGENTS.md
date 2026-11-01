# Aditya Computer — AGENTS.md

Aturan lengkap proyek ada di `.github/copilot-instructions.md`. Baca file itu lebih dulu; file ini hanya berisi catatan teknis singkat agar tidak ada instruksi ganda atau saling bertentangan.

## Development

Saat menjalankan dev server, gunakan mode background:

```
astro dev --background
```

Kelola server dengan `astro dev stop`, `astro dev status`, dan `astro dev logs`.

Verifikasi hasil dengan `npm run build`. Jangan menjalankan `git commit` atau `git push`.

## Dokumentasi

Dokumentasi Astro: https://docs.astro.build

Rujuk panduan ini sebelum mengerjakan hal terkait:

- [Routing, rute dinamis, middleware](https://docs.astro.build/en/guides/routing/)
- [Komponen Astro](https://docs.astro.build/en/basics/astro-components/)
- [Styling dan Tailwind](https://docs.astro.build/en/guides/styling/)

Catatan: proyek ini tidak memakai framework UI (React/Vue/Svelte), content collections, atau i18n. Jangan menambahkannya tanpa persetujuan pemilik.
