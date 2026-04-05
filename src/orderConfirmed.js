import { updateAllBadges } from './cart.js';
import { sendOwnerWhatsApp, sendCustomerWhatsApp, OWNER_PHONE } from './whatsapp.js';

updateAllBadges();

const order = JSON.parse(localStorage.getItem('snehkriti_last_order') || 'null');
const root = document.getElementById('confirmed-root');

if (!order) {
  window.location.href = 'index.html';
} else {
  // Open owner WhatsApp immediately (must be on page load, not in setTimeout to avoid popup block)
  sendOwnerWhatsApp(order);

  // Customer WA opened after a short delay with a visible prompt
  setTimeout(() => sendCustomerWhatsApp(order), 1200);

  const itemsHtml = order.items.map(i => `
    <div class="flex justify-between items-center py-2 border-b border-[#d4a373] border-opacity-20">
      <div>
        <span class="text-base text-[#5e503f]" style="font-family:'Playfair Display',serif;">${i.name}</span>
        ${i.size ? `<span class="bg-[#feeafa] text-[#d4a373] px-2 py-0.5 rounded-full text-xs ml-2" style="font-family:'Playfair Display',serif;">${i.size}</span>` : ''}
        <span class="text-sm text-[#6c757d] ml-2">×${i.qty}</span>
      </div>
      <span class="font-bold text-[#d4a373]" style="font-family:'Playfair Display',serif;">₹${i.price * i.qty}</span>
    </div>`).join('');

  const addr2 = order.customer.address2 ? `<br>${order.customer.address2}` : '';
  const payText = encodeURIComponent(`Hi! I've paid for Order ${order.orderId}. Attaching payment screenshot.`);

  root.innerHTML = `
    <div class="text-center mb-10">
      <div class="relative inline-block mb-4">
        <svg width="80" height="80" viewBox="0 0 80 80" class="mx-auto">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#d4a373" stroke-width="4"/>
          <polyline points="24,42 35,53 56,30" fill="none" stroke="#d4a373" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"
            style="stroke-dasharray:60;stroke-dashoffset:60;animation:checkDraw 0.8s ease forwards 0.3s"/>
        </svg>
      </div>
      <h2 class="text-5xl handwritten font-bold gradient-text mb-3">Order Placed! 🎉</h2>
      <p class="text-lg text-[#5e503f] mb-2" style="font-family:'Playfair Display',serif;">Thank you <strong class="text-[#d4a373]">${order.customer.name}</strong>! Your piece of art is being crafted with love.</p>
      <div class="bg-[#feeafa] text-[#d4a373] px-6 py-2 rounded-full text-base font-semibold shadow-md inline-block mb-3" style="font-family:'Playfair Display',serif;">Order ID: ${order.orderId}</div>
      <p class="text-sm text-[#6c757d] italic" style="font-family:'Playfair Display',serif;">📲 WhatsApp messages have been sent to you and Snehkriti automatically.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 mb-10">
      <div class="summary-card">
        <h3 class="text-xl font-bold text-[#d4a373] mb-4" style="font-family:'Playfair Display',serif;">What you ordered 🧾</h3>
        ${itemsHtml}
        <div class="mt-4 space-y-1">
          <div class="flex justify-between text-base" style="font-family:'Playfair Display',serif;"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
          <div class="flex justify-between text-base" style="font-family:'Playfair Display',serif;">
            <span>Delivery</span>
            <span>${order.delivery === 0 ? '<span class="text-green-500 font-semibold">FREE 🎉</span>' : '₹' + order.delivery}</span>
          </div>
          <div class="flex justify-between text-xl font-bold text-[#d4a373] border-t border-[#d4a373] border-opacity-30 pt-2" style="font-family:'Playfair Display',serif;">
            <span>Total</span><span>₹${order.total}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-[#d4a373] border-opacity-20">
          <p class="text-sm text-[#5e503f]" style="font-family:'Playfair Display',serif;">
            📍 ${order.customer.address1}${addr2}<br>
            ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}
          </p>
        </div>
      </div>

      <div class="watercolor-bg rounded-2xl p-6 text-center">
        <h3 class="text-xl font-bold text-[#d4a373] mb-4" style="font-family:'Playfair Display',serif;">Complete Your Payment 💳</h3>
        <div class="bg-white rounded-xl p-4 inline-block shadow-lg mb-4">
          <img src="/images/payment-qr.png" alt="Payment QR Code"
            class="w-48 h-48 object-contain mx-auto"
            onerror="this.parentElement.innerHTML='<div class=\\'w-48 h-48 flex items-center justify-center bg-[#f8edeb] rounded-xl mx-auto\\'><p class=\\'text-[#d4a373] text-center text-sm\\' style=\\'font-family:Playfair Display,serif;\\'>QR Code<br>Coming Soon 🌸</p></div>'">
        </div>
        <p class="text-lg font-bold text-[#d4a373] mb-1" style="font-family:'Playfair Display',serif;">Scan to pay ₹${order.total} via UPI</p>
        <p class="text-sm text-[#6c757d] italic mb-4" style="font-family:'Playfair Display',serif;">After paying, send your payment screenshot on WhatsApp or Instagram DM</p>
        <a href="https://wa.me/${OWNER_PHONE}?text=${payText}" target="_blank" class="whatsapp-btn inline-flex">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Send Payment Proof
        </a>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <a href="products.html" class="submit-btn text-lg px-8 py-3 rounded-full" style="font-family:'Playfair Display',serif;">Continue Shopping 🛍️</a>
    </div>`;
}
