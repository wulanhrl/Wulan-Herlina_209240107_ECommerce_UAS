document.addEventListener("DOMContentLoaded", () => {
  // =================== PENCARIAN ===================
  const searchInput = document.querySelector(".search-box input");
  const products = document.querySelectorAll(".product");

  if (searchInput && products.length > 0) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase();
      products.forEach(product => {
        const name = product.querySelector("h3").textContent.toLowerCase();
        product.style.display = name.includes(keyword) ? "block" : "none";
      });
    });
  }

  // Tambahkan data-index untuk reset sorting
  products.forEach((product, index) => {
    product.dataset.index = index;
  });

  // =================== SORTING PRODUK ===================
  const sortSelect = document.getElementById("sort-produk");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const grid = document.querySelector(".product-grid");
      const items = Array.from(grid.querySelectorAll(".product"));

      if (sortSelect.value === "default") {
        items.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
      } else {
        items.sort((a, b) => {
          const hargaA = parseInt(a.querySelector(".beli-btn").dataset.harga);
          const hargaB = parseInt(b.querySelector(".beli-btn").dataset.harga);
          return sortSelect.value === "asc" ? hargaA - hargaB : hargaB - hargaA;
        });
      }

      items.forEach(item => grid.appendChild(item));
    });
  }

  // =================== WISHLIST & KERANJANG ===================
  const wishlistNotif = document.getElementById("wishlist-notif");

  products.forEach(product => {
    const simpanBtn = document.createElement("button");
    simpanBtn.textContent = "❤ Simpan";
    simpanBtn.classList.add("wishlist-btn");

    simpanBtn.addEventListener("click", () => {
      const nama = product.querySelector("h3").textContent;
      const harga = product.querySelector("p:nth-of-type(2)").textContent;
      const gambar = product.querySelector("img").getAttribute("src");

      saveToWishlist(nama, harga, gambar);

      if (wishlistNotif) {
        wishlistNotif.style.display = "block";
        setTimeout(() => wishlistNotif.style.display = "none", 2000);
      }

      updateBadgeCounts();
    });

    product.appendChild(simpanBtn);
  });

  document.querySelectorAll(".beli-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const nama = btn.dataset.nama;
      const harga = parseInt(btn.dataset.harga);
      const keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
      const produkAda = keranjang.find(item => item.nama === nama);

      if (produkAda) {
        produkAda.jumlah++;
      } else {
        keranjang.push({ nama, harga, jumlah: 1 });
      }

      localStorage.setItem("keranjang", JSON.stringify(keranjang));

      const notif = document.getElementById("notif");
      if (notif) {
        notif.style.display = "block";
        setTimeout(() => notif.style.display = "none", 3000);
      }

      updateBadgeCounts();
    });
  });

  // =================== KERANJANG PAGE ===================
  const keranjangData = JSON.parse(localStorage.getItem("keranjang")) || [];
  const tabelKeranjang = document.querySelector("#tabel-keranjang tbody");
  const totalBelanja = document.getElementById("total-belanja");

  function renderKeranjang() {
    if (!tabelKeranjang) return;
    tabelKeranjang.innerHTML = "";
    let total = 0;

    keranjangData.forEach((item, i) => {
      const subtotal = item.harga * item.jumlah;
      total += subtotal;
      tabelKeranjang.innerHTML += `
        <tr>
          <td>${item.nama}</td>
          <td>${item.jumlah}</td>
          <td>Rp${item.harga.toLocaleString()}</td>
          <td>Rp${subtotal.toLocaleString()}</td>
          <td><button onclick="hapusItem(${i})">Hapus</button></td>
        </tr>`;
    });

    if (totalBelanja) {
      totalBelanja.textContent = `Total: Rp${total.toLocaleString()}`;
    }
  }

  window.hapusItem = function(index) {
    keranjangData.splice(index, 1);
    localStorage.setItem("keranjang", JSON.stringify(keranjangData));
    renderKeranjang();
    updateBadgeCounts();
  };

  renderKeranjang();

  const checkoutBtn = document.getElementById("checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (keranjangData.length === 0) {
        alert("Keranjang masih kosong.");
      } else {
        alert("Checkout berhasil! Terima kasih sudah berbelanja.");
        localStorage.removeItem("keranjang");
        keranjangData.length = 0;
        renderKeranjang();
        updateBadgeCounts();
      }
    });
  }

  // =================== WISHLIST PAGE ===================
  const listEl = document.getElementById("wishlist-list");
  if (listEl) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    listEl.innerHTML = wishlist.length === 0 ? '<p>Belum ada produk yang disimpan.</p>' : '';

    wishlist.forEach((item, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${item.gambar}" alt="${item.nama}" style="width: 80px; border-radius: 6px;">
        <div><strong>${item.nama}</strong><br><span>${item.harga}</span></div>
        <button onclick="hapusDariWishlist(${i})">Hapus</button>
        <button onclick="tambahKeKeranjang('${item.nama}', '${item.harga}')">Tambah ke Keranjang</button>`;
      listEl.appendChild(li);
    });

    window.hapusDariWishlist = function(index) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlist.splice(index, 1);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      location.reload();
    };

    window.tambahKeKeranjang = function(nama, harga) {
      const keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
      const produkAda = keranjang.find(item => item.nama === nama);
      const hargaAngka = parseInt(harga.replace(/[^0-9]/g, ""));

      if (produkAda) {
        produkAda.jumlah++;
      } else {
        keranjang.push({ nama, harga: hargaAngka, jumlah: 1 });
      }

      localStorage.setItem("keranjang", JSON.stringify(keranjang));
      alert("Produk ditambahkan ke keranjang!");
      updateBadgeCounts();
    };
  }

  // =================== UPDATE BADGE ===================
  updateBadgeCounts();
});

function updateBadgeCounts() {
  const keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const keranjangBadge = document.getElementById("jumlah-keranjang");
  const wishlistBadge = document.getElementById("jumlah-wishlist");

  if (keranjangBadge) keranjangBadge.textContent = keranjang.length;
  if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
}

function saveToWishlist(nama, harga, gambar) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (!wishlist.some(item => item.nama === nama)) {
    wishlist.push({ nama, harga, gambar });
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }
}