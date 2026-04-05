import { products } from './products.js';
import { addToCart, updateAllBadges } from './cart.js';
import { showToast } from './main.js';

updateAllBadges();

function buildCard(p) {
  const hasCarousel = p.images.length > 1;
  let imageHtml;
  if (hasCarousel) {
    const imgs = p.images.map((src, i) =>
      `<img src="${src}" alt="${p.name}" class="carousel-img${i === 0 ? ' active' : ''}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i===0?1:0};transition:opacity 0.5s;">`
    ).join('');
    const dots = p.images.map((_, i) =>
      `<span class="dot${i === 0 ? ' active' : ''}" onclick="currentSlide(this,${i})"></span>`
    ).join('');
    imageHtml = `
      <div class="hoodie-carousel" style="position:absolute;inset:0;">
        <div class="carousel-images" style="position:relative;width:100%;height:100%;">${imgs}</div>
        <button class="carousel-btn carousel-prev" onclick="changeSlide(this,-1)">&#8249;</button>
        <button class="carousel-btn carousel-next" onclick="changeSlide(this,1)">&#8250;</button>
        <div class="carousel-dots">${dots}</div>
      </div>`;
  } else {
    imageHtml = `<a href="product-detail.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></a>`;
  }

  return `
    <div class="pcard" data-cat="${p.category}">
      <div class="pcard-img-wrap">
        ${imageHtml}
        <span class="pcard-badge">${p.badge}</span>
      </div>
      <div class="pcard-body">
        <a href="product-detail.html?id=${p.id}" style="text-decoration:none;">
          <p class="pcard-name">${p.name}</p>
        </a>
        <p class="pcard-price">&#8377;${p.price}</p>
        ${p.note ? `<span class="pcard-note">&#9888;&#65039; ${p.note}</span>` : ''}
        <div class="pcard-actions">
          <button class="btn-cart" onclick="handleAddToCart(${p.id})">Add to Cart</button>
          <a href="product-detail.html?id=${p.id}" class="btn-view">View</a>
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
