import { updateAllBadges, addToCart } from './cart.js';
import { showToast } from './main.js';
import { products } from './products.js';

updateAllBadges();

window.addToCartHome = function(id) {
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
