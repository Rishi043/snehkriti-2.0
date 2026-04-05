import { products } from './products.js';
import { addToCart, updateAllBadges } from './cart.js';
import { showToast } from './main.js';
import { OWNER_PHONE } from './whatsapp.js';

updateAllBadges();

const LARGE_SIZES = ['XL'];
const LARGE_SIZE_SURCHARGE = 100;
const DM = "font-family:'DM Sans',sans-serif;";

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id'));
const product = products.find(p => p.id === id);
const content = document.getElementById('product-content');

if (!product) {
  content.innerHTML = `
    <div class="text-center py-24">
      <p class="text-8xl mb-6">🎨</p>
      <h2 class="handwritten text-4xl text-[#d4a373] mb-4">Oops! This piece doesn't exist.</h2>
      <a href="products.html" class="submit-btn handwritten text-xl px-8 py-3 rounded-full inline-block">Back to Collections</a>
    </div>`;
} else {
  document.title = `${product.name} | SNEHKRITI`;

  const availableSizes = product.sizes.filter(s => s !== 'XS' && s !== 'XXL');
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
          style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:24px;color:white;${DM}font-size:0.85rem;font-weight:500;text-decoration:none;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);">
          📸 View on Instagram
        </a>
      </div>`;
  }

  function buildProductInfo() {
    const basePrice = product.price;
    const waText = encodeURIComponent(`Hi! I'm interested in ${product.name} (₹${basePrice}). Can you help me?`);

    // All sizes on ONE line — no sub-text for XL surcharge
    const sizeOptions = availableSizes.map(s => `
      <div style="position:relative;">
        <input type="radio" name="size" id="size-${s}" value="${s}" style="position:absolute;opacity:0;">
        <label for="size-${s}" style="display:flex;align-items:center;justify-content:center;padding:8px 20px;background:#fff;border-radius:24px;border:1.5px solid #e2d0c0;cursor:pointer;${DM}font-size:0.88rem;font-weight:500;color:#2d1f14;min-width:52px;transition:all 0.2s;white-space:nowrap;">
          ${s}
        </label>
      </div>`).join('');

    const btnStyle = `width:100%;border:none;border-radius:50px;padding:12px;${DM}font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.25s;`;

    return `
      <div>
        <span style="display:inline-block;background:#d4a373;color:white;${DM}font-size:0.7rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:3px 14px;border-radius:20px;margin-bottom:10px;">${product.badge}</span>

        <h2 class="handwritten" style="font-size:1.8rem;font-weight:700;color:#d4a373;margin-bottom:6px;line-height:1.3;">${product.name}</h2>

        <div style="margin-bottom:14px;">
          <span id="price-display" style="${DM}font-size:1.5rem;font-weight:700;color:#d4a373;">₹${basePrice}</span>
          <span id="size-surcharge-note" style="${DM}font-size:0.8rem;color:#d4a373;margin-left:8px;display:none;">(XL +₹${LARGE_SIZE_SURCHARGE})</span>
        </div>

        <p style="${DM}font-size:0.88rem;color:#5e503f;line-height:1.65;margin-bottom:14px;">${product.description}</p>

        ${product.note ? `<p style="${DM}font-size:0.78rem;color:#e91e63;background:#feeafa;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;">⚠️ ${product.note}</p>` : ''}

        <div style="margin-bottom:14px;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${sizeOptions}</div>
          <p id="size-error" style="${DM}font-size:0.78rem;color:#e91e63;margin-top:6px;display:none;">Please select a size</p>
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span style="${DM}font-size:0.78rem;font-weight:600;color:#7a6555;text-transform:uppercase;letter-spacing:0.06em;">Qty</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="qty-btn" onclick="changeQty(-1)">−</button>
            <span id="qty-display" style="${DM}font-size:1rem;font-weight:700;color:#d4a373;min-width:24px;text-align:center;">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
          <span id="line-total" style="${DM}font-size:0.85rem;color:#999;"></span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
          <button id="add-cart-btn" onclick="handleAddToCart()" style="${btnStyle}background:linear-gradient(135deg,#d4a373,#b08968);color:white;box-shadow:0 4px 16px rgba(212,163,115,0.35);">Add to Cart 🛍️</button>
          <button onclick="handleBuyNow()" style="${btnStyle}background:transparent;color:#d4a373;border:1.5px solid #d4a373;">Buy Now ✨</button>
          <a href="https://wa.me/${OWNER_PHONE}?text=${waText}" target="_blank"
            style="${btnStyle}background:#25D366;color:white;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Ask about this product
          </a>
        </div>
      </div>`;
  }

  function buildRelated() {
    // Show all other products for maximum variety in horizontal scroll
    const related = products.filter(p => p.id !== product.id);
    if (!related.length) return '';
    const cards = related.map(p => `
      <div style="flex:0 0 160px;min-width:160px;scroll-snap-align:start;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
        <a href="product-detail.html?id=${p.id}" style="text-decoration:none;">
          <div style="position:relative;width:100%;padding-top:100%;background:#f5f0eb;">
            <img src="${p.images[0]}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
          </div>
          <div style="padding:10px;">
            <p style="${DM}font-size:0.82rem;font-weight:500;color:#1a1a1a;margin-bottom:4px;line-height:1.3;">${p.name}</p>
            <p style="${DM}font-size:0.88rem;font-weight:700;color:#d4a373;">₹${p.price}</p>
          </div>
        </a>
      </div>`).join('');
    return `
      <div style="margin-top:40px;">
        <h3 class="handwritten" style="font-size:1.6rem;font-weight:700;color:#d4a373;text-align:center;margin-bottom:16px;">You might also love ✨</h3>
        <div style="display:flex;flex-wrap:nowrap;overflow-x:auto;gap:14px;padding:4px 2px 12px;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x mandatory;">
          ${cards}
        </div>
      </div>`;
  }

  content.innerHTML = `
    <div style="margin-bottom:16px;">
      <a href="products.html" style="${DM}font-size:0.85rem;color:#d4a373;text-decoration:none;">← Back to Collections</a>
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
        l.style.color = '#2d1f14';
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
    setTimeout(() => { btn.textContent = 'Add to Cart 🛍️'; }, 1500);
  };

  window.handleBuyNow = function() {
    if (!selectedSize) { document.getElementById('size-error').style.display = 'block'; return; }
    addToCart({ ...product, price: getEffectivePrice(selectedSize) }, selectedSize, qty);
    window.location.href = 'checkout.html';
  };
}
