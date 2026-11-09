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
