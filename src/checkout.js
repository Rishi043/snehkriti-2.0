import { getCart, getCartTotal, getDelivery, clearCart } from './cart.js';
import { showToast } from './main.js';

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ORD-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getField(id) { return document.getElementById(id); }

function showError(fieldId, msg) {
  const field = getField(fieldId);
  let err = field.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    err.style.cssText = 'color:#e91e63;font-size:0.78rem;font-family:Inter,sans-serif;margin-top:4px;';
    field.parentElement.appendChild(err);
  }
  err.textContent = msg;
  field.style.borderColor = '#e91e63';
}

function clearError(fieldId) {
  const field = getField(fieldId);
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
  field.style.borderColor = '';
}

function validate() {
  let valid = true;
  const name = getField('name').value.trim();
  if (name.length < 2) { showError('name', 'Please enter your full name'); valid = false; } else clearError('name');

  const phone = getField('phone').value.replace(/\s/g, '');
  if (!/^\d{10}$/.test(phone)) { showError('phone', 'Enter a valid 10-digit mobile number'); valid = false; } else clearError('phone');

  const addr1 = getField('address1').value.trim();
  if (!addr1) { showError('address1', 'Address is required'); valid = false; } else clearError('address1');

  const city = getField('city').value.trim();
  if (!city) { showError('city', 'City is required'); valid = false; } else clearError('city');

  const state = getField('state').value.trim();
  if (!state) { showError('state', 'State is required'); valid = false; } else clearError('state');

  const pincode = getField('pincode').value.trim();
  if (!/^\d{6}$/.test(pincode)) { showError('pincode', 'Enter a valid 6-digit pincode'); valid = false; } else clearError('pincode');

  return valid;
}

export function initCheckout() {
  const cart = getCart();
  if (!cart.length) { window.location.href = 'cart.html'; return; }

  renderSummary();

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const subtotal = getCartTotal();
    const delivery = getDelivery(subtotal);
    const total = subtotal + delivery;

    const order = {
      orderId: generateOrderId(),
      customer: {
        name: getField('name').value.trim(),
        phone: getField('phone').value.replace(/\s/g, ''),
        email: getField('email').value.trim(),
        address1: getField('address1').value.trim(),
        address2: getField('address2').value.trim(),
        city: getField('city').value.trim(),
        state: getField('state').value.trim(),
        pincode: getField('pincode').value.trim(),
        notes: getField('notes').value.trim()
      },
      items: cart,
      subtotal,
      delivery,
      total,
      timestamp: Date.now()
    };

    // Save order — WhatsApp messages are sent automatically on order-confirmed page
    localStorage.setItem('snehkriti_last_order', JSON.stringify(order));
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
  const font = "font-family:'Playfair Display',serif;";
  el.innerHTML = `
    <div class="space-y-2 mb-4">
      ${cart.map(i => `
        <div class="flex justify-between items-start gap-2 text-sm" style="${font}">
          <span class="text-[#5e503f]">${i.name} <span class="text-[#d4a373] font-semibold">×${i.qty}</span>${i.size ? ` <span class="bg-[#feeafa] text-[#d4a373] px-2 py-0.5 rounded-full text-xs">${i.size}</span>` : ''}</span>
          <span class="font-bold text-[#d4a373] whitespace-nowrap">₹${i.price * i.qty}</span>
        </div>`).join('')}
    </div>
    <div class="border-t border-[#d4a373] border-opacity-30 pt-3 space-y-1">
      <div class="flex justify-between text-sm" style="${font}"><span>Subtotal</span><span>₹${subtotal}</span></div>
      <div class="flex justify-between text-sm" style="${font}"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-green-600 font-semibold">FREE 🎉</span>' : '₹' + delivery}</span></div>
      <div class="flex justify-between font-bold text-[#d4a373] border-t border-[#d4a373] border-opacity-30 pt-2" style="${font}font-size:1.1rem;">
        <span>Total</span><span>₹${total}</span>
      </div>
    </div>
    <p class="text-xs text-[#6c757d] italic mt-3 text-center" style="${font}">
      ${subtotal < 999 ? `✨ Add ₹${999 - subtotal} more for free delivery!` : '🎉 You\'ve got free delivery!'}
    </p>`;
}
