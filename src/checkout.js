import { getCart, getCartTotal, getDelivery, clearCart } from './cart.js';
import { sendOwnerWhatsApp } from './whatsapp.js';
import { showToast } from './main.js';

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ORD-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function showError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  let err = field.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error handwritten text-sm mt-1';
    err.style.color = '#e91e63';
    field.parentElement.appendChild(err);
  }
  err.textContent = msg;
  field.style.borderColor = '#e91e63';
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
  field.style.borderColor = '';
}

function validate() {
  let valid = true;

  const name = document.getElementById('name').value.trim();
  if (name.length < 2) { showError('name', 'Please enter your name 🌸'); valid = false; }
  else clearError('name');

  const phone = document.getElementById('phone').value.replace(/\s/g, '');
  if (!/^\d{10}$/.test(phone)) { showError('phone', 'Enter a valid 10-digit number 📱'); valid = false; }
  else clearError('phone');

  const addr1 = document.getElementById('address1').value.trim();
  if (!addr1) { showError('address1', 'Address is required 🏠'); valid = false; }
  else clearError('address1');

  const city = document.getElementById('city').value.trim();
  if (!city) { showError('city', 'City is required 🏙️'); valid = false; }
  else clearError('city');

  const state = document.getElementById('state').value.trim();
  if (!state) { showError('state', 'State is required 📍'); valid = false; }
  else clearError('state');

  const pincode = document.getElementById('pincode').value.trim();
  if (!/^\d{6}$/.test(pincode)) { showError('pincode', 'Enter a valid 6-digit pincode 📮'); valid = false; }
  else clearError('pincode');

  return valid;
}

export function initCheckout() {
  const cart = getCart();
  if (!cart.length) { window.location.href = 'cart.html'; return; }

  renderSummary();

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) {
      document.getElementById('checkout-form').classList.add('shake');
      setTimeout(() => document.getElementById('checkout-form').classList.remove('shake'), 500);
      showToast('Please fill all required fields 🌸', 'error');
      return;
    }

    const subtotal = getCartTotal();
    const delivery = getDelivery(subtotal);
    const total = subtotal + delivery;

    const order = {
      orderId: generateOrderId(),
      customer: {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.replace(/\s/g, ''),
        email: document.getElementById('email').value.trim(),
        address1: document.getElementById('address1').value.trim(),
        address2: document.getElementById('address2').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        notes: document.getElementById('notes').value.trim()
      },
      items: cart,
      subtotal,
      delivery,
      total,
      timestamp: Date.now()
    };

    localStorage.setItem('snehkriti_last_order', JSON.stringify(order));
    sendOwnerWhatsApp(order);
    clearCart();
    window.location.href = 'order-confirmed.html';
  });
}

function renderSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const delivery = getDelivery(subtotal);
  const total = subtotal + delivery;

  const el = document.getElementById('order-summary');
  if (!el) return;

  el.innerHTML = `
    <div class="space-y-3 mb-4">
      ${cart.map(i => `
        <div class="flex justify-between items-center text-sm">
          <span class="handwritten text-lg text-[#5e503f]">${i.name} <span class="text-[#d4a373]">×${i.qty}</span>${i.size ? ` <span class="bg-[#feeafa] text-[#d4a373] px-2 py-0.5 rounded-full text-xs ml-1">${i.size}</span>` : ''}</span>
          <span class="handwritten text-lg font-bold text-[#d4a373]">₹${i.price * i.qty}</span>
        </div>
      `).join('')}
    </div>
    <div class="border-t border-[#d4a373] border-opacity-30 pt-3 space-y-2">
      <div class="flex justify-between handwritten text-lg"><span>Subtotal</span><span>₹${subtotal}</span></div>
      <div class="flex justify-between handwritten text-lg"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-green-500">FREE 🎉</span>' : '₹' + delivery}</span></div>
      <div class="flex justify-between handwritten text-2xl font-bold text-[#d4a373] border-t border-[#d4a373] border-opacity-30 pt-2">
        <span>Total</span><span>₹${total}</span>
      </div>
    </div>
    ${subtotal < 999 ? `<p class="handwritten text-sm text-[#6c757d] italic mt-3 text-center">✨ Add ₹${999 - subtotal} more for free delivery!</p>` : `<p class="handwritten text-sm text-green-500 italic mt-3 text-center">🎉 You've got free delivery!</p>`}
  `;
}
