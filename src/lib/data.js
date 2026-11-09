// File: src/lib/data.js
// Cache data Firestore (produk & artikel) dengan masa berlaku; pembacaan memakai REST tanpa SDK.

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

function ubahNilai(nilai) {
  if (Object.hasOwn(nilai, "stringValue")) return nilai.stringValue;
  if (Object.hasOwn(nilai, "integerValue")) return Number(nilai.integerValue);
  if (Object.hasOwn(nilai, "doubleValue")) return nilai.doubleValue;
  if (Object.hasOwn(nilai, "booleanValue")) return nilai.booleanValue;
  if (Object.hasOwn(nilai, "nullValue")) return null;
  if (Object.hasOwn(nilai, "timestampValue")) return nilai.timestampValue;
  if (Object.hasOwn(nilai, "referenceValue")) return nilai.referenceValue;
  if (Object.hasOwn(nilai, "bytesValue")) return nilai.bytesValue;
  if (Object.hasOwn(nilai, "geoPointValue")) return nilai.geoPointValue;
  if (Object.hasOwn(nilai, "arrayValue")) {
    return (nilai.arrayValue.values || []).map(ubahNilai);
  }
  if (Object.hasOwn(nilai, "mapValue")) {
    return Object.fromEntries(
      Object.entries(nilai.mapValue.fields || {}).map(([nama, nilaiField]) => [
        nama,
        ubahNilai(nilaiField),
      ]),
    );
  }
  return null;
}

function ambilDariFirestore(nama) {
  if (!sedangAmbil[nama]) {
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      throw new Error(
        "Konfigurasi Firebase REST tidak lengkap: project ID atau API key belum diatur.",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const ambilHalaman = async () => {
      const dokumen = [];
      let token = "";
      let halaman = 0;

      do {
        const pageQuery = token
          ? `&pageToken=${encodeURIComponent(token)}`
          : "";
        const url =
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${nama}` +
          `?pageSize=300&key=${encodeURIComponent(apiKey)}${pageQuery}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(
            `Gagal mengambil koleksi ${nama}: HTTP ${response.status}.`,
          );
        }

        const json = await response.json();
        (json.documents || []).forEach((document) => {
          const id = document.name.split("/").pop();
          const fields = Object.fromEntries(
            Object.entries(document.fields || {}).map(([fieldName, value]) => [
              fieldName,
              ubahNilai(value),
            ]),
          );
          dokumen.push({ id, ...fields });
        });
        token = json.nextPageToken || "";
        halaman += 1;
        if (token && halaman >= 10) {
          throw new Error(
            `Koleksi ${nama} melebihi batas pengambilan 10 halaman.`,
          );
        }
      } while (token);

      return dokumen;
    };

    sedangAmbil[nama] = ambilHalaman()
      .then((data) => {
        tulisCache(nama, data);
        return data;
      })
      .finally(() => {
        clearTimeout(timeout);
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