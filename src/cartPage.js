import { getCart, removeFromCart, updateQty, getCartTotal, getDelivery, updateAllBadges } from './cart.js';
import { showToast } from './main.js';

updateAllBadges();

function render() {
  const cart = getCart();
  const root = document.getElementById('cart-root');
  updateAllBadges();

  if (!cart.length) {
    root.innerHTML = `
      <div class="empty-state">
        <p class="text-8xl mb-6">🛍️</p>
        <p class="handwritten text-3xl text-[#d4a373] mb-3">Your cart is empty...</p>
        <p class="handwritten text-xl text-[#6c757d] mb-8">Add some magic! ✨</p>
        <a href="products.html" class="submit-btn handwritten text-xl px-8 py-3 rounded-full inline-block">Explore Collections</a>
      </div>`;
    return;
  }

  const subtotal = getCartTotal();
  const delivery = getDelivery(subtotal);
  const total = subtotal + delivery;

  const itemsHtml = cart.map(item => `
    <div class="cart-item hover-notes bg-white p-4 rounded-xl shadow-sm mb-3">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border-2 border-[#d4a373] border-opacity-30 flex-shrink-0">
      <div class="flex-1 min-w-0">
        <a href="product-detail.html?id=${item.id}" class="handwritten text-xl text-[#d4a373] hover:underline block truncate">${item.name}</a>
        ${item.size ? `<span class="bg-[#feeafa] text-[#d4a373] px-2 py-0.5 rounded-full text-xs handwritten">${item.size}</span>` : ''}
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button class="qty-btn" onclick="handleQty(${item.id},'${item.size}',${item.qty - 1})">−</button>
        <span class="handwritten text-lg font-bold text-[#d4a373] w-6 text-center">${item.qty}</span>
        <button class="qty-btn" onclick="handleQty(${item.id},'${item.size}',${item.qty + 1})">+</button>
      </div>
      <div class="price-tag bg-[#feeafa] text-[#d4a373] px-3 py-1 rounded-full font-bold handwritten text-lg flex-shrink-0">₹${item.price * item.qty}</div>
      <button onclick="handleRemove(${item.id},'${item.size}')" class="text-[#e91e63] hover:scale-110 transition text-xl flex-shrink-0" title="Remove">❌</button>
    </div>`).join('');

  root.innerHTML = `
    <div class="grid md:grid-cols-3 gap-8">
      <div class="md:col-span-2">${itemsHtml}</div>
      <div class="summary-card artistic-border self-start">
        <h3 class="handwritten text-2xl font-bold text-[#d4a373] mb-4">Order Summary</h3>
        <div class="space-y-2 mb-4">
          <div class="flex justify-between handwritten text-lg"><span>Subtotal</span><span>₹${subtotal}</span></div>
          <div class="flex justify-between handwritten text-lg">
            <span>Delivery</span>
            <span>${delivery === 0 ? '<span class="text-green-500">FREE 🎉</span>' : '₹' + delivery}</span>
          </div>
          <div class="flex justify-between handwritten text-2xl font-bold text-[#d4a373] border-t border-[#d4a373] border-opacity-30 pt-3">
            <span>Total</span><span>₹${total}</span>
          </div>
        </div>
        <p class="handwritten text-sm text-[#6c757d] italic text-center mb-4">
          ${subtotal < 999 ? '✨ Free delivery on orders above ₹999' : '🎉 You\'ve got free delivery!'}
        </p>
        <a href="checkout.html" class="submit-btn handwritten text-xl px-6 py-3 rounded-full block text-center mb-3">Proceed to Checkout</a>
        <a href="products.html" class="submit-btn-outline handwritten text-lg px-6 py-2 rounded-full block text-center">Continue Shopping</a>
      </div>
    </div>`;
}

window.handleQty = function(id, size, newQty) {
  updateQty(id, size, newQty);
  render();
};

window.handleRemove = function(id, size) {
  if (confirm('Remove this piece? 💔')) {
    removeFromCart(id, size);
    showToast('Removed from cart 💔', 'error');
    render();
  }
};

render();
