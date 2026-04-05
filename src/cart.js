const CART_KEY = 'snehkriti_cart';

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product, size = '', qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      qty
    });
  }
  saveCart(cart);
  updateAllBadges();
}

export function removeFromCart(productId, size) {
  const cart = getCart().filter(i => !(i.id === productId && i.size === size));
  saveCart(cart);
  updateAllBadges();
}

export function updateQty(productId, size, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(i => !(i.id === productId && i.size === size));
  } else {
    const item = cart.find(i => i.id === productId && i.size === size);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  updateAllBadges();
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateAllBadges();
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getDelivery(subtotal) {
  return subtotal >= 999 ? 0 : 80;
}

export function updateAllBadges() {
  const count = getCartCount();
  document.querySelectorAll('#cart-count-badge, #cart-count-badge-float').forEach(el => {
    el.textContent = count;
  });
}
