import { products } from './products.js';
import { addToCart, updateAllBadges } from './cart.js';
import { showToast } from './main.js';
import { OWNER_PHONE } from './whatsapp.js';

updateAllBadges();

const LARGE_SIZES = ['XL', 'XXL'];
const LARGE_SIZE_SURCHARGE = 100;
const P = "font-family:'Poppins',sans-serif;";

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id'));
const product = products.find(p => p.id === id);
const content = document.getElementById('product-content');

if (!product) {
  content.innerHTML = `
    <div class="text-center py-24">
      <p class="text-8xl mb-6">🎨</p>
      <h2 style="${P}font-size:1.5rem;font-weight:600;color:#d4a373;margin-bottom:12px;">This piece doesn't exist.</h2>
      <p style="${P}font-size:0.9rem;color:#666;margin-bottom:24px;">Maybe it sold out, or the link is wrong.</p>
      <a href="products.html" class="submit-btn" style="${P}font-size:0.95rem;font-weight:500;text-decoration:none;display:inline-block;">Back to Collections</a>
    </div>`;
} else {
  document.title = `${product.name} | SNEHKRITI`;

  let selectedSize = '';
  let qty = 1;

  function getEffectivePrice(size) {
    return product.price + (LARGE_SIZES.includes(size) ? LARGE_SIZE_SURCHARGE : 0);
  }

  function buildImageGallery() {
    const hasMultiple = product.images.length > 1;
    let mainImageHtml;

    if (hasMultiple) {
      const imgs = product.images.map((src, i) =>
        `<img src="${src}" alt="${product.name}" class="carousel-img${i === 0 ? ' active' : ''}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i===0?1:0};transition:opacity 0.5s ease;">`
      ).join('');
      const dots = product.images.map((_, i) =>
        `<span class="pd-dot${i === 0 ? ' active' : ''}" onclick="pdSlide(${i})" style="width:8px;height:8px;border-radius:50%;background:${i===0?'#d4a373':'rgba(255,255,255,0.6)'};cursor:pointer;transition:all 0.3s;display:inline-block;"></span>`
      ).join('');
      mainImageHtml = `
        <div style="position:relative;width:100%;padding-top:100%;overflow:hidden;border-radius:12px;background:#f5f0eb;">
          <div style="position:absolute;inset:0;">${imgs}</div>
          <button onclick="pdSlide(-1,'prev')" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(212,163,115,0.85);color:white;border:none;border-radius:6px;font-size:1.6rem;padding:4px 10px;cursor:pointer;z-index:10;">&#8249;</button>
          <button onclick="pdSlide(-1,'next')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(212,163,115,0.85);color:white;border:none;border-radius:6px;font-size:1.6rem;padding:4px 10px;cursor:pointer;z-index:10;">&#8250;</button>
          <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10;">${dots}</div>
        </div>`;
    } else {
      mainImageHtml = `
        <div style="position:relative;width:100%;padding-top:100%;overflow:hidden;border-radius:12px;background:#f5f0eb;">
          <img id="main-img" src="${product.images[0]}" alt="${product.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
        </div>`;
    }

    return `
      <div>
        ${mainImageHtml}
        <a href="${product.instagramUrl}" target="_blank"
          style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:24px;color:white;${P}font-size:0.82rem;font-weight:500;text-decoration:none;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);">
          📸 View on Instagram
        </a>
      </div>`;
  }

  function buildProductInfo() {
    const basePrice = product.price;
    const waText = encodeURIComponent(`Hi! I'm interested in ${product.name} (₹${basePrice}). Can you help me?`);

    const sizeOptions = product.sizes.map(s => {
      const isLarge = LARGE_SIZES.includes(s);
      return `
        <div style="position:relative;">
          <input type="radio" name="size" id="size-${s}" value="${s}" style="position:absolute;opacity:0;">
          <label for="size-${s}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 16px;background:#fff;border-radius:24px;border:1.5px solid #e2d0c0;cursor:pointer;${P}font-size:0.82rem;font-weight:500;color:#1a1a1a;min-width:52px;transition:all 0.2s;gap:2px;">
            ${s}
            ${isLarge ? `<span style="font-size:0.6rem;color:#d4a373;font-weight:600;">+&#8377;${LARGE_SIZE_SURCHARGE}</span>` : ''}
          </label>
        </div>`;
    }).join('');

    return `
      <div>
        <span style="display:inline-block;background:#d4a373;color:white;${P}font-size:0.68rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:3px 12px;border-radius:20px;margin-bottom:10px;">${product.badge}</span>

        <h1 style="${P}font-weight:600;font-size:1.35rem;color:#1a1a1a;margin-bottom:8px;line-height:1.35;">${product.name}</h1>

        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
          <span id="price-display" style="${P}font-weight:700;font-size:1.5rem;color:#d4a373;">&#8377;${basePrice}</span>
          <span id="size-surcharge-note" style="${P}font-size:0.75rem;color:#d4a373;display:none;">+&#8377;${LARGE_SIZE_SURCHARGE} for XL/XXL</span>
        </div>

        <p style="${P}font-size:0.85rem;color:#444;line-height:1.65;margin-bottom:12px;">${product.description}</p>

        <p style="${P}font-size:0.8rem;color:#666;line-height:1.65;background:#fdf6f0;border-left:3px solid #d4a373;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;font-style:italic;">${product.longDescription}</p>

        ${product.note ? `<p style="${P}font-size:0.75rem;color:#e91e63;background:#feeafa;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;">&#9888; ${product.note}</p>` : ''}

        <div style="background:#fdf8f5;border-radius:10px;padding:14px;border:1px solid #e8d5c0;margin-bottom:14px;">
          <p style="${P}font-size:0.82rem;font-weight:600;color:#1a1a1a;margin-bottom:3px;">Select Size</p>
          <p style="${P}font-size:0.72rem;color:#999;margin-bottom:10px;">XL &amp; XXL are +&#8377;${LARGE_SIZE_SURCHARGE} extra</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${sizeOptions}</div>
          <p id="size-error" style="${P}font-size:0.75rem;color:#e91e63;margin-top:8px;display:none;">Please select a size</p>
        </div>

        <div style="display:flex;align-items:center;gap:12px;background:#fdf8f5;border-radius:10px;padding:12px 14px;border:1px solid #e8d5c0;margin-bottom:16px;">
          <span style="${P}font-size:0.82rem;font-weight:600;color:#1a1a1a;">Qty</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="qty-btn" onclick="changeQty(-1)">&minus;</button>
            <span id="qty-display" style="${P}font-weight:600;font-size:1rem;color:#d4a373;min-width:24px;text-align:center;">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
          <span id="line-total" style="${P}font-size:0.82rem;color:#999;"></span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
          <button id="add-cart-btn" onclick="handleAddToCart()" class="submit-btn" style="${P}font-size:0.95rem;font-weight:500;">Add to Cart</button>
          <button onclick="handleBuyNow()" class="submit-btn-outline" style="${P}font-size:0.95rem;font-weight:500;">Buy Now</button>
        </div>

        <a href="https://wa.me/${OWNER_PHONE}?text=${waText}" target="_blank" class="whatsapp-btn" style="margin-bottom:16px;display:inline-flex;">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Ask about this product
        </a>

        <div style="border:1px solid rgba(212,163,115,0.25);border-radius:10px;overflow:hidden;">
          <button onclick="toggleCare()" style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#fdf6f0;${P}font-size:0.82rem;font-weight:500;color:#d4a373;border:none;cursor:pointer;">
            <span>Care Instructions</span>
            <span id="care-arrow">&#9662;</span>
          </button>
          <div id="care-content" style="display:none;padding:12px 16px;${P}font-size:0.8rem;color:#555;line-height:1.6;">${product.care}</div>
        </div>
      </div>`;
  }

  function buildRelated() {
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
    if (!related.length) return '';
    const cards = related.map(p => `
      <div class="pcard">
        <div class="pcard-img-wrap">
          <a href="product-detail.html?id=${p.id}">
            <img src="${p.images[0]}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
          </a>
        </div>
        <div class="pcard-body">
          <a href="product-detail.html?id=${p.id}" style="text-decoration:none;">
            <p class="pcard-name">${p.name}</p>
          </a>
          <p class="pcard-price">&#8377;${p.price}</p>
          <div class="pcard-actions">
            <a href="product-detail.html?id=${p.id}" class="btn-view">View</a>
          </div>
        </div>
      </div>`).join('');
    return `
      <div style="margin-top:48px;">
        <h3 class="section-heading" style="margin-bottom:20px;">You might also love</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;">${cards}</div>
      </div>`;
  }

  content.innerHTML = `
    <div style="margin-bottom:16px;">
      <a href="products.html" style="${P}font-size:0.85rem;color:#d4a373;text-decoration:none;">&#8592; Back to Collections</a>
    </div>
    <div style="display:grid;grid-template-columns:1fr;gap:24px;background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" class="pd-grid">
      ${buildImageGallery()}
      ${buildProductInfo()}
    </div>
    <div class="info-strip" style="margin-top:24px;">
      <div class="info-strip-item"><span style="font-size:1.4rem;">🎨</span><span>Hand-painted with love</span></div>
      <div class="info-strip-item"><span style="font-size:1.4rem;">🚚</span><span>PAN India Delivery</span></div>
      <div class="info-strip-item"><span style="font-size:1.4rem;">♻️</span><span>Eco-friendly inks</span></div>
    </div>
    ${buildRelated()}`;

  // Make 2-col on md+
  const style = document.createElement('style');
  style.textContent = '@media(min-width:768px){.pd-grid{grid-template-columns:1fr 1fr!important;}}';
  document.head.appendChild(style);

  let pdCurrentIdx = 0;
  window.pdSlide = function(arg, dir) {
    const imgs = content.querySelectorAll('.carousel-img');
    const dots = content.querySelectorAll('.pd-dot');
    if (!imgs.length) return;
    imgs[pdCurrentIdx].style.opacity = '0';
    if (dots[pdCurrentIdx]) dots[pdCurrentIdx].style.background = 'rgba(255,255,255,0.6)';
    if (dir === 'next') pdCurrentIdx = (pdCurrentIdx + 1) % imgs.length;
    else if (dir === 'prev') pdCurrentIdx = (pdCurrentIdx - 1 + imgs.length) % imgs.length;
    else pdCurrentIdx = arg;
    imgs[pdCurrentIdx].style.opacity = '1';
    if (dots[pdCurrentIdx]) dots[pdCurrentIdx].style.background = '#d4a373';
  };

  function updatePriceDisplay() {
    const price = getEffectivePrice(selectedSize);
    const priceEl = document.getElementById('price-display');
    const noteEl = document.getElementById('size-surcharge-note');
    const lineTotalEl = document.getElementById('line-total');
    if (priceEl) priceEl.textContent = `₹${price}`;
    if (noteEl) noteEl.style.display = LARGE_SIZES.includes(selectedSize) ? 'inline' : 'none';
    if (lineTotalEl) lineTotalEl.textContent = qty > 1 ? `= ₹${price * qty}` : '';
  }

  document.querySelectorAll('input[name="size"]').forEach(radio => {
    radio.addEventListener('change', () => {
      selectedSize = radio.value;
      document.getElementById('size-error').style.display = 'none';
      document.querySelectorAll('label[for^="size-"]').forEach(l => {
        l.style.background = '#fff';
        l.style.borderColor = '#e2d0c0';
        l.style.color = '#1a1a1a';
        l.style.transform = '';
        l.style.boxShadow = '';
      });
      const sel = document.querySelector(`label[for="size-${selectedSize}"]`);
      if (sel) {
        sel.style.background = '#d4a373';
        sel.style.borderColor = '#d4a373';
        sel.style.color = 'white';
        sel.style.transform = 'scale(1.05)';
        sel.style.boxShadow = '0 4px 12px rgba(212,163,115,0.4)';
      }
      updatePriceDisplay();
    });
  });

  window.changeQty = function(delta) {
    qty = Math.max(1, qty + delta);
    document.getElementById('qty-display').textContent = qty;
    updatePriceDisplay();
  };

  window.handleAddToCart = function() {
    if (!selectedSize) { document.getElementById('size-error').style.display = 'block'; return; }
    addToCart({ ...product, price: getEffectivePrice(selectedSize) }, selectedSize, qty);
    showToast('Added to cart! 🛍️');
    const btn = document.getElementById('add-cart-btn');
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1500);
  };

  window.handleBuyNow = function() {
    if (!selectedSize) { document.getElementById('size-error').style.display = 'block'; return; }
    addToCart({ ...product, price: getEffectivePrice(selectedSize) }, selectedSize, qty);
    window.location.href = 'checkout.html';
  };

  window.toggleCare = function() {
    const el = document.getElementById('care-content');
    const arrow = document.getElementById('care-arrow');
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    arrow.innerHTML = isHidden ? '&#9652;' : '&#9662;';
  };
}
