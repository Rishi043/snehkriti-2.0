import { products } from './products.js';
import { addToCart, updateAllBadges } from './cart.js';
import { showToast } from './main.js';
import { OWNER_PHONE } from './whatsapp.js';

updateAllBadges();

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id'));
const product = products.find(p => p.id === id);
const content = document.getElementById('product-content');

if (!product) {
  content.innerHTML = `
    <div class="text-center py-24">
      <p class="text-8xl mb-6">🎨</p>
      <h2 class="handwritten text-4xl text-[#d4a373] mb-4">Oops! This piece doesn't exist.</h2>
      <p class="handwritten text-xl text-[#6c757d] mb-8">Maybe it sold out, or the link is wrong 💔</p>
      <a href="products.html" class="submit-btn handwritten text-xl px-8 py-3 rounded-full inline-block">Back to Collections</a>
    </div>`;
} else {
  document.title = `${product.name} | SNEHKRITI`;

  let selectedSize = '';
  let qty = 1;

  function buildImageGallery() {
    const hasMultiple = product.images.length > 1;
    const thumbs = hasMultiple ? `
      <div class="thumb-strip mt-3">
        ${product.images.map((src, i) => `
          <img src="${src}" alt="${product.name}" class="${i === 0 ? 'active-thumb' : ''}" onclick="swapMain(${i})">
        `).join('')}
      </div>` : '';

    return `
      <div>
        <div class="relative">
          <div class="polaroid-frame bg-white rounded-xl shadow-lg overflow-hidden">
            <img id="main-img" src="${product.images[0]}" alt="${product.name}" class="w-full h-80 md:h-96 object-cover">
          </div>
          <div class="washi-tape absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-300 rotate-6 -mt-2 z-20"></div>
        </div>
        ${thumbs}
        <a href="${product.instagramUrl}" target="_blank"
          class="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white handwritten text-lg transition hover:opacity-90"
          style="background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
          📸 View on Instagram
        </a>
      </div>`;
  }

  function buildSizeSelector() {
    return `
      <div class="size-options">
        ${product.sizes.map(s => `
          <div class="size-option">
            <input type="radio" name="size" id="size-${s}" value="${s}">
            <label for="size-${s}" class="handwritten text-lg">${s}</label>
          </div>
        `).join('')}
      </div>`;
  }

  function buildProductInfo() {
    const waText = encodeURIComponent(`Hi! I'm interested in ${product.name} (₹${product.price}). Can you help me?`);
    return `
      <div class="relative">
        <div class="absolute -top-3 -right-3 bg-[#f8edeb] px-3 py-1 rounded-full handwritten text-sm rotate-6 z-10">${product.badge}</div>
        <h2 class="text-4xl handwritten font-bold text-[#d4a373] mb-3">${product.name}</h2>
        <div class="price-tag bg-[#feeafa] text-[#d4a373] px-5 py-2 rounded-full text-2xl font-bold shadow-md inline-block mb-4">₹${product.price}</div>
        <p class="mb-4 text-lg">${product.description}</p>
        <blockquote class="artistic-border bg-[#f8edeb] p-4 rounded-lg mb-4 italic text-[#5e503f]">${product.longDescription}</blockquote>
        ${product.note ? `<p class="handwritten text-base bg-[#feeafa] text-[#e91e63] px-4 py-2 rounded-full inline-block mb-4">⚠️ ${product.note}</p>` : ''}

        <div class="mb-4">
          <p class="handwritten text-lg font-bold text-[#5e503f] mb-2">Select Size:</p>
          ${buildSizeSelector()}
          <p id="size-error" class="handwritten text-sm mt-1 hidden" style="color:#e91e63">Please select a size! 🌸</p>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <p class="handwritten text-lg font-bold text-[#5e503f]">Qty:</p>
          <div class="flex items-center gap-3">
            <button class="qty-btn" onclick="changeQty(-1)">−</button>
            <span id="qty-display" class="handwritten text-xl font-bold text-[#d4a373] w-8 text-center">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-6">
          <button id="add-cart-btn" onclick="handleAddToCart()" class="submit-btn handwritten text-xl px-6 py-3 rounded-full">Add to Cart 🛍️</button>
          <button onclick="handleBuyNow()" class="submit-btn-outline handwritten text-xl px-6 py-3 rounded-full">Buy Now ✨</button>
        </div>

        <a href="https://wa.me/${OWNER_PHONE}?text=${waText}"
          target="_blank" class="whatsapp-btn inline-flex mb-6">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Ask about this product
        </a>

        <div class="border border-[#d4a373] border-opacity-30 rounded-xl overflow-hidden">
          <button class="care-toggle w-full flex justify-between items-center px-4 py-3 bg-[#f8edeb] handwritten text-lg text-[#d4a373]" onclick="toggleCare()">
            <span>🧺 Care Instructions</span>
            <span id="care-arrow">▾</span>
          </button>
          <div id="care-content" class="hidden px-4 py-3 handwritten text-base text-[#5e503f]">${product.care}</div>
        </div>
      </div>`;
  }

  function buildRelated() {
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
    if (!related.length) return '';
    const cards = related.map(p => `
      <div class="hover-notes bg-white p-4 rounded-lg shadow-md relative">
        <a href="product-detail.html?id=${p.id}">
          <div class="polaroid-frame bg-white rounded-md shadow-lg overflow-hidden mb-3">
            <img src="${p.images[0]}" alt="${p.name}" class="w-full h-48 object-cover">
          </div>
          <h4 class="handwritten text-lg text-[#d4a373] hover:underline">${p.name}</h4>
        </a>
        <div class="flex justify-between items-center mt-2">
          <span class="price-tag bg-[#feeafa] text-[#d4a373] px-3 py-1 rounded-full font-bold">₹${p.price}</span>
          <a href="product-detail.html?id=${p.id}" class="handwritten text-sm text-[#d4a373] hover:underline">View →</a>
        </div>
      </div>`).join('');
    return `
      <div class="mt-16">
        <h3 class="handwritten text-3xl font-bold text-[#d4a373] text-center mb-8">You might also love ✨</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${cards}</div>
      </div>`;
  }

  content.innerHTML = `
    <div class="mb-4">
      <a href="products.html" class="handwritten text-[#d4a373] hover:underline text-lg">← Back to Collections</a>
    </div>
    <div class="grid md:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-2xl shadow-lg artistic-border">
      ${buildImageGallery()}
      ${buildProductInfo()}
    </div>
    <div class="info-strip mt-10">
      <div class="info-strip-item"><span class="text-2xl">🎨</span><span>Hand-painted with love</span></div>
      <div class="info-strip-item"><span class="text-2xl">🚚</span><span>PAN India Delivery</span></div>
      <div class="info-strip-item"><span class="text-2xl">♻️</span><span>Eco-friendly inks</span></div>
    </div>
    ${buildRelated()}`;

  document.querySelectorAll('input[name="size"]').forEach(radio => {
    radio.addEventListener('change', () => {
      selectedSize = radio.value;
      document.getElementById('size-error').classList.add('hidden');
    });
  });

  window.swapMain = function(i) {
    document.getElementById('main-img').src = product.images[i];
    document.querySelectorAll('.thumb-strip img').forEach((img, idx) => {
      img.classList.toggle('active-thumb', idx === i);
    });
  };

  window.changeQty = function(delta) {
    qty = Math.max(1, qty + delta);
    document.getElementById('qty-display').textContent = qty;
  };

  window.handleAddToCart = function() {
    if (!selectedSize) {
      document.getElementById('size-error').classList.remove('hidden');
      return;
    }
    addToCart(product, selectedSize, qty);
    showToast('Added to cart! 🛍️');
    const btn = document.getElementById('add-cart-btn');
    btn.textContent = 'Added! ✓';
    setTimeout(() => { btn.textContent = 'Add to Cart 🛍️'; }, 1500);
  };

  window.handleBuyNow = function() {
    if (!selectedSize) {
      document.getElementById('size-error').classList.remove('hidden');
      return;
    }
    addToCart(product, selectedSize, qty);
    window.location.href = 'checkout.html';
  };

  window.toggleCare = function() {
    const el = document.getElementById('care-content');
    const arrow = document.getElementById('care-arrow');
    el.classList.toggle('hidden');
    arrow.textContent = el.classList.contains('hidden') ? '▾' : '▴';
  };
}
