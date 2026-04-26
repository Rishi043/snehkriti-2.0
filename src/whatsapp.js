export const OWNER_PHONE = "919131765331";

export function sendOwnerWhatsApp(order) {
  const itemLines = order.items.map(i =>
    `• ${i.name} | Size: ${i.size || 'N/A'} | Qty: ${i.qty} | ₹${i.price * i.qty}`
  ).join('\n');

  const date = new Date(order.timestamp);
  const formatted = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const addr2 = order.customer.address2 ? `\n${order.customer.address2}` : '';

  const msg = `🛍️ *New Order — SNEHKRITI!*
━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* ${order.orderId}
🕐 *Time:* ${formatted}

👤 *Customer Details*
Name: ${order.customer.name}
Phone: +91 ${order.customer.phone}
Email: ${order.customer.email || 'Not provided'}

📍 *Delivery Address*
${order.customer.address1}${addr2}
${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}

🧾 *Items Ordered*
${itemLines}

📝 *Order Notes:* ${order.customer.notes || 'None'}

💰 *Payment Summary*
Subtotal: ₹${order.subtotal}
Delivery: ₹${order.delivery}
✅ *TOTAL: ₹${order.total}*

💳 Payment: QR (Pending confirmation)
━━━━━━━━━━━━━━━━━━━━━
Please process this order! 🙏`;

  window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

export function sendCustomerWhatsApp(order) {
  const itemLines = order.items.map(i =>
    `• ${i.name} | Size: ${i.size || 'N/A'} | Qty: ${i.qty} — ₹${i.price * i.qty}`
  ).join('\n');

  const msg = `🎉 *Order Confirmed — SNEHKRITI!*
━━━━━━━━━━━━━━━━━━━━━
Heyy ${order.customer.name}! Your order is placed 💛

📦 *Order ID:* ${order.orderId}

🧾 *What you ordered:*
${itemLines}

✅ *Total Paid: ₹${order.total}*

💳 *Payment:* Please scan the QR on the confirmation page and send us your payment screenshot here or on Instagram DM @snehkriti.in

🚚 We'll start crafting your piece with love once payment is confirmed!

Questions? Just reply here 💬
━━━━━━━━━━━━━━━━━━━━━
With love, Sneha 🌸
@snehkriti.in`;

  const customerPhone = '91' + order.customer.phone;
  window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}
