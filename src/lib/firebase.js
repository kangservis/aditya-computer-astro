// File: src/lib/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Mengambil kunci rahasia dari file .env
const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
    measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fungsi Ambil Data
export async function fetchProductsFromFirebase() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const tempProducts = [];
    querySnapshot.forEach((doc) => {
      tempProducts.push({ id: doc.id, ...doc.data() });
    });
    return tempProducts;
  } catch (error) {
    console.error("Gagal mengambil data dari Firebase:", error);
    return [];
  }
}

// Fungsi Proxy Gambar (Anti Blokir + Kompresi WebP)
export const getProxyUrl = (url, width = 400) => {
  if (!url) return '';
  if (url.startsWith('img/') || !url.startsWith('http') || url.includes('wsrv.nl')) return url;
  
  // Tambahkan parameter &w (width), output=webp, dan q=80 (kualitas 80%)
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
};

// Fungsi Format Rupiah
export const formatRupiah = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};