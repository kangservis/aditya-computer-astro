// File: src/lib/store.js
import { getProxyUrl } from "./firebase.js";

// --- 1. INISIALISASI KERANJANG DARI PENYIMPANAN BROWSER ---
// Mengambil data lama jika ada, atau buat array kosong jika baru
let cart = JSON.parse(localStorage.getItem("aditya_cart")) || [];

// Fungsi simpan otomatis setiap ada perubahan
function saveCart() {
  localStorage.setItem("aditya_cart", JSON.stringify(cart));
}

// Format Rupiah (diambil dari logika lama)
function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

// --- 2. FITUR NOTIFIKASI KECIL (TOAST) ---
window.showNotification = (message, type = "success") => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  let iconClass = "ri-checkbox-circle-fill text-emerald-500";
  let borderClass = "border-slate-100";

  if (type === "warning" || type === "error") {
    iconClass = "ri-error-warning-fill text-red-500";
    borderClass = "border-red-200";
  }

  toast.className = `bento-card p-4 flex items-center gap-3 bg-white shadow-xl border pointer-events-auto w-full transition-all duration-300 translate-y-2 opacity-0 ${borderClass}`;
  toast.innerHTML = `<i class="${iconClass} text-xl shrink-0"></i>
    <p class="text-xs font-semibold text-slate-800 flex-grow leading-tight">${message}</p>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-900 text-lg cursor-pointer"><i class="ri-close-line"></i></button>`;

  container.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-2", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// --- 3. FITUR KERANJANG BELANJA ---
window.toggleCart = (isOpen) => {
  document.getElementById("cart-drawer")?.classList.toggle("hidden", !isOpen);
  if (isOpen) window.renderCart();
};

window.addToCart = (prodId) => {
  // Ambil data produk dari variabel global yang di-fetch di index.astro
  const prod = window.PRODUCTS_DATA?.find((p) => p.id === prodId);
  if (!prod) {
    window.showNotification("Data produk belum termuat penuh, tunggu sebentar.", "warning");
    return;
  }

  const inCart = cart.find((item) => item.product.id === prodId);

  if (inCart) {
    if (inCart.quantity < prod.stock) {
      inCart.quantity++;
      window.showNotification(`Jumlah "${prod.name}" ditambah di keranjang.`);
    } else {
      window.showNotification("Stok barang di toko kami terbatas!", "warning");
    }
  } else {
    cart.push({ product: prod, quantity: 1 });
    window.showNotification(`"${prod.name}" berhasil masuk keranjang.`);
  }
  
  saveCart(); // Simpan ke HP user
  window.updateCartCounter();
};

window.changeQty = (prodId, delta) => {
  const item = cart.find((it) => it.product.id === prodId);
  if (!item) return;
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    window.removeFromCart(prodId);
  } else if (newQty > item.product.stock) {
    window.showNotification("Mencapai batas stok toko!", "warning");
  } else {
    item.quantity = newQty;
    saveCart();
    window.renderCart();
    window.updateCartCounter();
  }
};

window.removeFromCart = (prodId) => {
  cart = cart.filter((it) => it.product.id !== prodId);
  saveCart();
  window.renderCart();
  window.updateCartCounter();
};

window.updateCartCounter = () => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const counter = document.getElementById("cart-count");
  if (counter) {
    if (totalItems > 0) {
      counter.innerText = totalItems;
      counter.classList.remove("hidden");
      counter.classList.add("inline-flex");
    } else {
      counter.classList.add("hidden");
      counter.classList.remove("inline-flex");
    }
  }
};

window.renderCart = () => {
  const container = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");
  if (!container || !footer) return;
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<div class="py-12 text-center text-slate-400 text-xs">Keranjang belanja Anda masih kosong.</div>';
    footer.classList.add("hidden");
    return;
  }

  let grandTotal = 0;
  let htmlBuffer = "";

  cart.forEach((item) => {
    const proxiedImg = getProxyUrl(item.product.image);
    const totalItemPrice = item.product.price * item.quantity;
    grandTotal += totalItemPrice;

    htmlBuffer += `
      <div class="flex gap-4 p-3 border border-slate-100 bg-slate-50/50 rounded-xl">
          <img src="${proxiedImg}" class="w-12 h-12 object-contain bg-white rounded border border-slate-100 p-1">
          <div class="flex-grow space-y-1 text-xs">
              <h4 class="font-bold text-slate-800 line-clamp-1">${item.product.name}</h4>
              <p class="font-semibold text-red-600">${formatRupiah(item.product.price)}</p>
              <div class="flex items-center justify-between pt-1">
                  <div class="flex items-center gap-2">
                      <button onclick="changeQty('${item.product.id}', -1)" class="w-6 h-6 border bg-white rounded flex items-center justify-center cursor-pointer hover:bg-slate-50">-</button>
                      <span class="font-bold font-mono">${item.quantity}</span>
                      <button onclick="changeQty('${item.product.id}', 1)" class="w-6 h-6 border bg-white rounded flex items-center justify-center cursor-pointer hover:bg-slate-50">+</button>
                  </div>
                  <button onclick="removeFromCart('${item.product.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer" title="Hapus produk">
                      <i class="ri-delete-bin-line text-red-600 pointer-events-none"></i>
                  </button>
              </div>
          </div>
      </div>`;
  });
  
  container.innerHTML = htmlBuffer;
  document.getElementById("cart-total").innerText = formatRupiah(grandTotal);
  footer.classList.remove("hidden");
};

// --- 4. CHECKOUT WA ---
window.toggleCheckoutModal = (isOpen) => {
  document.getElementById("checkout-modal")?.classList.toggle("hidden", !isOpen);
};

window.openCheckout = () => {
  window.toggleCart(false);
  const total = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  document.getElementById("checkout-total-txt").innerText = formatRupiah(total);
  window.toggleCheckoutModal(true);
};

window.submitOrder = () => {
  const name = document.getElementById("order-name").value.trim();
  const phone = document.getElementById("order-phone").value.trim();
  const address = document.getElementById("order-address").value.trim();

  if (!name || !phone || !address) {
    window.showNotification("Harap lengkapi semua data pengiriman!", "warning");
    return;
  }

  let orderDetails = "";
  let total = 0;
  cart.forEach((it, idx) => {
    const sub = it.product.price * it.quantity;
    total += sub;
    orderDetails += `${idx + 1}. ${it.product.name} (${it.quantity}x) - ${formatRupiah(sub)}\n`;
  });

  const waText = `Halo Aditya Computer, saya ingin membeli produk berikut:\n\n📦 *Detail Belanja:*\n${orderDetails}\n💵 *Total Tagihan:* ${formatRupiah(total)}\n\n📍 *Detail Pengiriman:*\n- Nama: ${name}\n- HP/WA: ${phone}\n- Alamat: ${address}\n\nMohon segera diproses pesanan saya. Terima kasih!`;
  const link = `https://wa.me/6281297933936?text=${encodeURIComponent(waText)}`;
  
  // Kosongkan keranjang setelah order dibuat
  cart = [];
  saveCart();
  window.updateCartCounter();
  window.toggleCheckoutModal(false);
  window.open(link, "_blank");
};

// --- 5. LOGIKA UI MODAL DETAIL & SLIDER ---
window.openProductDetail = (prodId) => {
  const prod = window.PRODUCTS_DATA?.find((p) => p.id === prodId);
  if (!prod) return;

  const imagesArray = prod.images && prod.images.length > 0 ? prod.images : [prod.image];
  let sliderHtml = `<div id="slider-detail-${prod.id}" class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full relative scroll-smooth items-center">`;
  imagesArray.forEach((imgUrl, idx) => {
     sliderHtml += `<div class="w-full h-full shrink-0 snap-center flex items-center justify-center p-2"><img src="${getProxyUrl(imgUrl)}" onclick="openLightbox('${prod.id}', ${idx})" class="max-h-full max-w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"></div>`;
  });
  sliderHtml += `</div>`;

  // Cari kode let navHtml = ''; di dalam window.openProductDetail dan timpa menjadi:
  let navHtml = '';
  if (imagesArray.length > 1) {
     navHtml = `
        <button onclick="window.scrollSlider(event, 'detail-${prod.id}', -1)" class="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full hidden sm:flex items-center justify-center shadow-sm text-slate-600 hover:text-red-600 transition-all duration-300 z-20 cursor-pointer opacity-0 group-hover:opacity-100"><i class="ri-arrow-left-s-line"></i></button>
        <button onclick="window.scrollSlider(event, 'detail-${prod.id}', 1)" class="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full hidden sm:flex items-center justify-center shadow-sm text-slate-600 hover:text-red-600 transition-all duration-300 z-20 cursor-pointer opacity-0 group-hover:opacity-100"><i class="ri-arrow-right-s-line"></i></button>
        <div class="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm z-20 pointer-events-none flex items-center gap-1"><i class="ri-image-2-line"></i> ${imagesArray.length}</div>
     `;
  }
  
  document.getElementById("detail-slider-container").innerHTML = sliderHtml + navHtml;
  document.getElementById("detail-category").innerText = prod.category;
  
  const condition = prod.condition || "Baru";
  document.getElementById("detail-brand").innerHTML = `${prod.brand} <span class="mx-1 text-slate-300">•</span> <span class="${condition === "Second" ? "text-orange-500" : "text-emerald-500"}">${condition}</span>`;
  document.getElementById("detail-title").innerText = prod.name;
  document.getElementById("detail-price").innerText = formatRupiah(prod.price);
  document.getElementById("detail-description").innerText = prod.description;

  const stockEl = document.getElementById("detail-stock");
  if (prod.stock > 0) {
    stockEl.innerText = `Stok: Tersedia (${prod.stock} unit)`;
    stockEl.className = "text-[11px] font-bold text-emerald-600";
  } else {
    stockEl.innerText = "Stok: Habis Terjual";
    stockEl.className = "text-[11px] font-bold text-rose-600";
  }

  document.getElementById("detail-specs").innerHTML = prod.specs.map(s => `<span class="text-[14px] bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-mono">${s}</span>`).join("");

  const buyBtn = document.getElementById("detail-buy-btn");
  if (prod.stock > 0) {
    buyBtn.disabled = false;
    buyBtn.innerText = "Masukkan Keranjang";
    buyBtn.className = "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer";
    buyBtn.setAttribute("onclick", `addToCart('${prod.id}'); closeProductDetail();`);
  } else {
    buyBtn.disabled = true;
    buyBtn.innerText = "Stok Habis";
    buyBtn.className = "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed";
    buyBtn.setAttribute("onclick", "");
  }

  document.getElementById("product-detail-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

window.closeProductDetail = () => {
  document.getElementById("product-detail-modal")?.classList.add("hidden");
  document.body.style.overflow = "";
};

window.scrollSlider = (event, prodId, direction) => {
  event.stopPropagation();
  const slider = document.getElementById(`slider-${prodId}`);
  if (slider) {
    const scrollAmount = slider.clientWidth;
    const currentScroll = slider.scrollLeft;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const scrollMode = prodId === 'lightbox' ? 'auto' : 'smooth';

    if (direction === 1) {
      if (currentScroll >= maxScroll - 5) slider.scrollTo({ left: 0, behavior: scrollMode });
      else slider.scrollBy({ left: scrollAmount, behavior: scrollMode });
    } else {
      if (currentScroll <= 5) slider.scrollTo({ left: maxScroll, behavior: scrollMode });
      else slider.scrollBy({ left: -scrollAmount, behavior: scrollMode });
    }
  }
};

window.openLightbox = (prodId, startIndex = 0) => {
  if (!prodId || prodId.startsWith("http") || prodId.startsWith("img/")) {
      document.getElementById("lightbox-slider-container").innerHTML = `<div class="w-full h-full flex items-center justify-center p-4 md:p-12"><img src="${prodId}" class="max-h-full max-w-full object-contain rounded-xl"></div>`;
      document.getElementById("lightbox-nav").classList.add("hidden");
      document.getElementById("lightbox-indicator").classList.add("hidden");
  } else {
      const prod = window.PRODUCTS_DATA?.find((p) => p.id === prodId);
      if (!prod) return;

      const imagesArray = prod.images && prod.images.length > 0 ? prod.images : [prod.image];
      let sliderHtml = `<div id="slider-lightbox" class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full items-center">`;
      imagesArray.forEach((imgUrl) => {
        sliderHtml += `<div class="w-full h-full shrink-0 snap-center flex items-center justify-center p-2 md:p-12"><img src="${getProxyUrl(imgUrl)}" class="max-h-full max-w-full object-contain rounded-xl"></div>`;
      });
      sliderHtml += `</div>`;

      document.getElementById("lightbox-slider-container").innerHTML = sliderHtml;

      const navMenu = document.getElementById("lightbox-nav");
      const indicator = document.getElementById("lightbox-indicator");

      if (imagesArray.length > 1) {
        navMenu.classList.remove("hidden");
        indicator.classList.remove("hidden");
        indicator.innerText = `${startIndex + 1} / ${imagesArray.length}`;
        const sliderEl = document.getElementById("slider-lightbox");
        sliderEl.addEventListener("scroll", () => {
            indicator.innerText = `${Math.round(sliderEl.scrollLeft / sliderEl.clientWidth) + 1} / ${imagesArray.length}`;
        });
      } else {
        navMenu.classList.add("hidden");
        indicator.classList.add("hidden");
      }
      
      setTimeout(() => {
          const sliderEl = document.getElementById("slider-lightbox");
          if (sliderEl && startIndex > 0) sliderEl.scrollTo({ left: sliderEl.clientWidth * startIndex, behavior: "instant" });
      }, 10);
  }

  document.getElementById("image-lightbox").classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = () => {
  document.getElementById("image-lightbox")?.classList.add("hidden");
  document.getElementById("lightbox-slider-container").innerHTML = "";
  document.body.style.overflow = "";
};

window.updateCartCounter = () => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const counter = document.getElementById("cart-count");
  if (counter) {
    if (totalItems > 0) {
      counter.innerText = totalItems;
      counter.classList.remove("hidden");
      counter.classList.add("inline-flex");
    } else {
      counter.classList.add("hidden");
      counter.classList.remove("inline-flex"); // <-- Ini yang ditambahkan
    }
  }
};

// Memaksa angka keranjang muncul lagi setiap kali pengunjung pindah halaman
document.addEventListener("astro:page-load", () => {
  window.updateCartCounter();
});