import { products } from './products.js';
import { addToCart, updateAllBadges } from './cart.js';
import { showToast } from './main.js';

updateAllBadges();

function buildCard(p) {
  const hasCarousel = p.images.length > 1;
  let imageHtml;
  if (hasCarousel) {
    const imgs = p.images.map((src, i) =>
      `<img src="${src}" alt="${p.name}" class="w-full h-64 object-cover carousel-img${i === 0 ? ' active' : ''}">`
    ).join('');
    const dots = p.images.map((_, i) =>
      `<span class="dot${i === 0 ? ' active' : ''}" onclick="currentSlide(this,${i})"></span>`
    ).join('');
    imageHtml = `
      <div class="polaroid-frame bg-white rounded-md shadow-lg overflow-hidden hoodie-carousel">
        <div class="carousel-images">${imgs}</div>
        <button class="carousel-btn carousel-prev" onclick="changeSlide(this,-1)">‹</button>
        <button class="carousel-btn carousel-next" onclick="changeSlide(this,1)">›</button>
        <div class="carousel-dots">${dots}</div>
      </div>`;
  } else {
    imageHtml = `
      <a href="product-detail.html?id=${p.id}">
        <div class="polaroid-frame bg-white rounded-md shadow-lg overflow-hidden">
          <img src="${p.images[0]}" alt="${p.name}" class="w-full h-64 object-cover">
        </div>
      </a>`;
  }

  return `
    <div class="hover-notes bg-white p-6 rounded-lg shadow-md relative product-card" data-cat="${p.category}">
      <div class="absolute -top-3 -right-3 bg-[#f8edeb] px-3 py-1 rounded-full handwritten text-sm rotate-6">${p.badge}</div>
      <div class="relative mb-4">
        ${imageHtml}
        <div class="washi-tape absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-300 rotate-6 -mt-2 z-20"></div>
      </div>
      <a href="product-detail.html?id=${p.id}">
        <h3 class="text-xl handwritten text-[#d4a373] mb-2 hover:underline">${p.name}</h3>
      </a>
      <p class="mb-4 text-sm">${p.description}</p>
      ${p.note ? `<p class="handwritten text-sm bg-[#feeafa] text-[#e91e63] px-3 py-1 rounded-full inline-block mb-3">⚠️ ${p.note}</p>` : ''}
      <div class="flex justify-between items-center gap-2 flex-wrap">
        <div class="price-tag bg-[#feeafa] text-[#d4a373] px-4 py-2 rounded-full text-lg font-bold shadow-md">₹${p.price}</div>
        <div class="flex gap-2">
          <a href="product-detail.html?id=${p.id}" class="text-[#d4a373] handwritten hover:underline text-sm border border-[#d4a373] px-3 py-1 rounded-full">View Details</a>
          <button onclick="handleAddToCart(${p.id})" class="bg-[#d4a373] hover:bg-[#b08968] text-white handwritten px-3 py-1 rounded-full text-sm transition">Add to Cart</button>
        </div>
      </div>
    </div>`;
}

function render(cat) {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
  if (!filtered.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(buildCard).join('');
}

document.getElementById('filter-pills').addEventListener('click', e => {
  const btn = e.target.closest('.filter-pill');
  if (!btn) return;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render(btn.dataset.cat);
});

window.handleAddToCart = function(id) {
  const p = products.find(x => x.id === id);
  addToCart(p, '', 1);
  showToast('Added to cart! 🛍️');
};

window.changeSlide = function(button, direction) {
  const carousel = button.closest('.hoodie-carousel');
  const images = carousel.querySelectorAll('.carousel-img');
  const dots = carousel.querySelectorAll('.dot');
  let idx = Array.from(images).findIndex(img => img.classList.contains('active'));
  images[idx].classList.remove('active');
  dots[idx].classList.remove('active');
  idx = (idx + direction + images.length) % images.length;
  images[idx].classList.add('active');
  dots[idx].classList.add('active');
};

window.currentSlide = function(dot, index) {
  const carousel = dot.closest('.hoodie-carousel');
  const images = carousel.querySelectorAll('.carousel-img');
  const dots = carousel.querySelectorAll('.dot');
  images.forEach(img => img.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  images[index].classList.add('active');
  dots[index].classList.add('active');
};

render('All');
