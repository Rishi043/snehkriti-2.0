import { getCart, getCartTotal, getDelivery, clearCart } from './cart.js';
import { showToast } from './main.js';

function generateOrderId() {
  return 'ORD' + Date.now().toString().slice(-8);
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

  // Autofill from last order if exists
  const lastOrder = JSON.parse(localStorage.getItem('snehkriti_last_order') || 'null');
  if (lastOrder && lastOrder.customer) {
    const c = lastOrder.customer;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('name', c.name);
    set('phone', c.phone);
    set('email', c.email);
    set('address1', c.address1);
    set('pincode', c.pincode);
    set('notes', c.notes);
    // Trigger pincode lookup to fill city/state
    if (c.pincode) window.lookupPincode && window.lookupPincode(c.pincode);
    // Fallback: fill city/state directly if lookup fails
    setTimeout(() => {
      const city = document.getElementById('city');
      const state = document.getElementById('state');
      if (city && !city.value) city.value = c.city || '';
      if (state && !state.value) state.value = c.state || '';
    }, 1500);
  }

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
    const history = JSON.parse(localStorage.getItem('snehkriti_orders') || '[]');
    history.unshift(order);
    localStorage.setItem('snehkriti_orders', JSON.stringify(history));
    clearCart();

    // Build WhatsApp messages
    const itemLinesOwner = order.items.map(i =>
      `• ${i.name} | Size: ${i.size || 'N/A'} | Qty: ${i.qty} | ₹${i.price * i.qty}`
    ).join('\n');
    const itemLinesCust = order.items.map(i =>
      `• ${i.name} | Size: ${i.size || 'N/A'} | Qty: ${i.qty} — ₹${i.price * i.qty}`
    ).join('\n');

    const ownerMsg = encodeURIComponent(
      `🛍️ *New Order — SNEHKRITI!*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *Order ID:* ${order.orderId}\n\n👤 *Customer*\nName: ${order.customer.name}\nPhone: +91 ${order.customer.phone}\nEmail: ${order.customer.email || 'Not provided'}\n\n📍 *Address*\n${order.customer.address1}\n${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}\n\n🧾 *Items*\n${itemLinesOwner}\n\n💰 Subtotal: ₹${order.subtotal} | Delivery: ₹${order.delivery}\n✅ *TOTAL: ₹${order.total}*\n\n📝 Notes: ${order.customer.notes || 'None'}\n━━━━━━━━━━━━━━━━━━━━━\nPlease process this order! 🙏`
    );
    const customerMsg = encodeURIComponent(
      `🎉 *Order Confirmed — SNEHKRITI!*\n━━━━━━━━━━━━━━━━━━━━━\nHeyy ${order.customer.name}! Your order is placed 💛\n\n📦 *Order ID:* ${order.orderId}\n\n🧾 *What you ordered:*\n${itemLinesCust}\n\n✅ *Total: ₹${order.total}*\n\n💳 Please scan the QR and send payment screenshot here or on Instagram DM @snehkriti.in\n\n🚚 We'll start crafting once payment is confirmed!\n━━━━━━━━━━━━━━━━━━━━━\nWith love, Sneha 🌸`
    );

    // Store customer WhatsApp URL for auto-redirect on confirmation page
    localStorage.setItem('snehkriti_customer_wa', `https://wa.me/91${order.customer.phone}?text=${customerMsg}`);

    // Open owner WhatsApp directly (user gesture — never blocked)
    window.open(`https://wa.me/919131765331?text=${ownerMsg}`, '_blank');

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
  const font = "font-family:'DM Sans',sans-serif;";
  el.innerHTML = `
    <div class="space-y-2 mb-4">
      ${cart.map(i => `
        <div class="flex justify-between items-start gap-2" style="${font}font-size:0.88rem;">
          <span style="color:#2d1f14;">${i.name} <span style="color:#d4a373;font-weight:600;">×${i.qty}</span>${i.size ? ` <span style="background:#feeafa;color:#d4a373;padding:2px 8px;border-radius:20px;font-size:0.72rem;">${i.size}</span>` : ''}</span>
          <span style="font-weight:700;color:#d4a373;white-space:nowrap;">₹${i.price * i.qty}</span>
        </div>`).join('')}
    </div>
    <div style="border-top:1px solid rgba(212,163,115,0.3);padding-top:10px;">
      <div class="flex justify-between" style="${font}font-size:0.85rem;margin-bottom:4px;"><span>Subtotal</span><span>₹${subtotal}</span></div>
      <div class="flex justify-between" style="${font}font-size:0.85rem;margin-bottom:4px;"><span>Delivery</span><span>${delivery === 0 ? '<span style="color:#22c55e;font-weight:600;">FREE 🎉</span>' : '₹' + delivery}</span></div>
      <div class="flex justify-between" style="${font}font-size:1rem;font-weight:700;color:#d4a373;border-top:1px solid rgba(212,163,115,0.3);padding-top:8px;margin-top:4px;">
        <span>Total</span><span>₹${total}</span>
      </div>
    </div>
    <p style="${font}font-size:0.75rem;color:#999;text-align:center;margin-top:10px;">
      ${subtotal < 999 ? `✨ Add ₹${999 - subtotal} more for free delivery!` : '🎉 You\'ve got free delivery!'}
    </p>`;
}
