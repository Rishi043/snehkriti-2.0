import { updateAllBadges } from './cart.js';

// Update cart badges on every page load
document.addEventListener('DOMContentLoaded', () => {
  updateAllBadges();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Gallery item hover effect
document.querySelectorAll('.hover-notes').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.transform = 'rotate(-2deg) scale(1.03)';
    item.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
    item.style.boxShadow = '';
  });
});

// Carousel functionality
export function changeSlide(button, direction) {
  const carousel = button.closest('.hoodie-carousel');
  const images = carousel.querySelectorAll('.carousel-img');
  const dots = carousel.querySelectorAll('.dot');
  let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
  images[currentIndex].classList.remove('active');
  dots[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + direction + images.length) % images.length;
  images[currentIndex].classList.add('active');
  dots[currentIndex].classList.add('active');
}

export function currentSlide(dot, index) {
  const carousel = dot.closest('.hoodie-carousel');
  const images = carousel.querySelectorAll('.carousel-img');
  const dots = carousel.querySelectorAll('.dot');
  images.forEach(img => img.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  images[index].classList.add('active');
  dots[index].classList.add('active');
}

window.changeSlide = changeSlide;
window.currentSlide = currentSlide;

// Toast notification
export function showToast(message, type = 'success') {
  const existing = document.getElementById('snehkriti-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'snehkriti-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'error' ? '#e91e63' : '#d4a373'};
    color: white;
    padding: 12px 28px;
    border-radius: 50px;
    font-family: 'Caveat', cursive;
    font-size: 1.2rem;
    z-index: 9999;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

window.showToast = showToast;
