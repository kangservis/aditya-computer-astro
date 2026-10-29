// File: src/lib/data.js
// Cache data Firestore (produk & artikel) dengan masa berlaku.
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PREFIX = "aditya_cache_";
const MAKS_USANG = 24 * 60 * 60 * 1000; // lewat 24 jam: jangan tampilkan, tunggu data baru

// Masa berlaku cache per koleksi (ubah di sini jika perlu)
const TTL = {
  products: 5 * 60 * 1000, // 5 menit (stok & harga lebih sering berubah)
  articles: 30 * 60 * 1000, // 30 menit
};

// Mencegah fetch ganda untuk koleksi yang sama pada saat bersamaan
const sedangAmbil = {};

function bacaCache(nama) {
  try {
    const raw = localStorage.getItem(PREFIX + nama);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    return Array.isArray(data) ? { t, data } : null;
  } catch {
    return null;
  }
}

function tulisCache(nama, data) {
  try {
    localStorage.setItem(PREFIX + nama, JSON.stringify({ t: Date.now(), data }));
  } catch {
    // Penyimpanan penuh/diblokir: abaikan, situs tetap jalan tanpa cache
  }
}

// Dipanggil admin setelah simpan/hapus data
export function hapusCache(nama) {
  try {
    localStorage.removeItem(PREFIX + nama);
  } catch {}
}

function ambilDariFirestore(nama) {
  if (!sedangAmbil[nama]) {
    sedangAmbil[nama] = getDocs(collection(db, nama))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        tulisCache(nama, data);
        return data;
      })
      .finally(() => {
        delete sedangAmbil[nama];
      });
  }
  return sedangAmbil[nama];
}

// onData(data) dipanggil sekali (cache segar / tanpa cache)
// atau dua kali (cache agak basi, lalu data baru jika isinya berubah).
// Melempar error hanya jika tidak ada cache sama sekali dan Firestore gagal.
export async function loadCollection(nama, onData = () => {}) {
  const cache = bacaCache(nama);
  const umur = cache ? Date.now() - cache.t : Infinity;

  // 1. Cache masih segar: pakai langsung, tanpa baca Firestore
  if (cache && umur < TTL[nama]) {
    onData(cache.data);
    return;
  }

  // 2. Cache agak basi: tampilkan dulu, perbarui di belakang
  if (cache && umur < MAKS_USANG) {
    onData(cache.data);
    try {
      const baru = await ambilDariFirestore(nama);
      if (JSON.stringify(baru) !== JSON.stringify(cache.data)) onData(baru);
    } catch (error) {
      console.warn("Gagal memperbarui data, memakai cache lama:", error);
    }
    return;
  }

  // 3. Tanpa cache: harus menunggu Firestore
  onData(await ambilDariFirestore(nama));
}