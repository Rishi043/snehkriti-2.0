import { updateAllBadges } from './cart.js';

updateAllBadges();

const root = document.getElementById('orders-root');
const orders = JSON.parse(localStorage.getItem('snehkriti_orders') || '[]');

if (!orders.length) {
  root.innerHTML = `
    <div class="empty-orders">
      <p style="font-size:4rem;margin-bottom:16px;">🛍️</p>
      <h3 class="handwritten" style="font-size:1.8rem;color:#d4a373;margin-bottom:8px;">No orders yet!</h3>
      <p style="font-size:0.9rem;color:#999;margin-bottom:24px;">Your placed orders will appear here.</p>
      <a href="products.html" class="submit-btn handwritten" style="font-size:1rem;padding:10px 28px;border-radius:50px;text-decoration:none;display:inline-block;">Start Shopping ✨</a>
    </div>`;
} else {
  root.innerHTML = orders.map(order => {
    const date = new Date(order.timestamp);
    const formatted = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const itemsHtml = order.items.map(i => `
      <div class="order-item">
        <img src="${i.image}" alt="${i.name}" onerror="this.style.background='#f5f0eb'">
        <div style="flex:1;min-width:0;">
          <p class="order-item-name">${i.name}</p>
          <p class="order-item-meta">${i.size ? 'Size: ' + i.size + ' · ' : ''}Qty: ${i.qty}</p>
        </div>
        <span class="order-item-price">₹${i.price * i.qty}</span>
      </div>`).join('');

    const addr = order.customer.address1 + ', ' + order.customer.city + ', ' + order.customer.state + ' — ' + order.customer.pincode;

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <p class="order-id">Order #${order.orderId}</p>
            <p class="order-date">${formatted}</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="status-badge">⏳ Payment Pending</span>
            <span class="order-total">₹${order.total}</span>
          </div>
        </div>
        <div class="order-body">
          ${itemsHtml}
          <div class="order-address">
            <span style="font-weight:600;color:#5e503f;">📍 Deliver to:</span><br>
            ${order.customer.name} · +91 ${order.customer.phone}<br>
            ${addr}
            ${order.customer.notes ? `<br><span style="color:#d4a373;font-weight:500;">Note:</span> ${order.customer.notes}` : ''}
          </div>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
            <div style="display:flex;gap:8px;margin-left:auto;">
              <a href="products.html" style="font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:500;color:#d4a373;border:1.5px solid #d4a373;padding:6px 16px;border-radius:20px;text-decoration:none;">Shop Again</a>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}
