// File: src/lib/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase dari file lama
const firebaseConfig = {
    apiKey: "AIzaSyAebVJbgflOX2uHY8epkSoi6eIVcFkpsq4",
    authDomain: "aditya-computer-db.firebaseapp.com",
    projectId: "aditya-computer-db",
    storageBucket: "aditya-computer-db.firebasestorage.app",
    messagingSenderId: "433328408123",
    appId: "1:433328408123:web:879956669ccdcc9592be1e",
    measurementId: "G-4PS0CSCMB8"
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

// Fungsi Proxy Gambar (Anti Blokir)
export const getProxyUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('img/') || !url.startsWith('http') || url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
};

// Fungsi Format Rupiah
export const formatRupiah = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};