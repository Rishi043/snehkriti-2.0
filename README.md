# SNEHKRITI — Hand-Painted Textile E-Commerce

> Printed with Love. Felt like a Hug.

## Folder Structure

```
snehkriti/
├── index.html              # Home page
├── products.html           # All products listing
├── product-detail.html     # Single product (dynamic via ?id=)
├── cart.html               # Shopping cart
├── checkout.html           # Checkout form
├── order-confirmed.html    # Order confirmation + QR payment
├── src/
│   ├── style.css           # All shared styles
│   ├── main.js             # Shared init: toast, carousel, badge updater
│   ├── products.js         # Product data (9 products)
│   ├── cart.js             # Cart logic (localStorage)
│   ├── checkout.js         # Form validation + order creation
│   └── whatsapp.js         # WhatsApp message builder (owner + customer)
├── images/                 # Product images + payment QR
├── vite.config.js
├── vercel.json
├── package.json
└── README.md
```

## Setup

```bash
npm install
npm run dev       # Start dev server (opens browser automatically)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Go-Live Checklist

### 1. Set Owner WhatsApp Number
Open `src/whatsapp.js` and replace:
```js
export const OWNER_PHONE = "919XXXXXXXXX";
```
with your actual number (country code + number, no `+` or spaces):
```js
export const OWNER_PHONE = "919876543210";
```

### 2. Add Payment QR Image
Place your UPI QR code image at:
```
images/payment-qr.png
```
This is shown on the order confirmation page for customers to scan and pay.

### 3. Verify Product Images
All product images must exist in the `images/` folder with exact filenames:
- `Pinterest Flower Tee.jpg`
- `Spider Web Tee.jpg`
- `Luffy Anime Tee.jpg`
- `Bulbasaur.jpg`
- `leo.jpg`
- `Naruto.jpg`
- `BT21.jpg`
- `Hoodie.jpg`
- `CoupleHoodie_1.jpg` through `CoupleHoodie_4.jpg`

### 4. Deploy to Vercel
```bash
npm run build
```
Then push to GitHub and connect to Vercel. The `vercel.json` handles clean URL rewrites automatically.

### 5. Update Instagram/Social Links
Search for `snehkriti.in` across all HTML files to verify all social links are correct.

## Cart & Order Flow

1. Customer browses `products.html` or `product-detail.html`
2. Adds items to cart → stored in `localStorage` as `snehkriti_cart`
3. Goes to `checkout.html` → fills address form
4. Clicks "Place Order" → order saved to `localStorage` as `snehkriti_last_order`
5. WhatsApp opens with full order details sent to owner
6. Redirected to `order-confirmed.html` → scans QR to pay
7. Customer sends payment screenshot via WhatsApp

## Delivery Logic
- Orders below ₹999 → ₹80 delivery charge
- Orders ₹999 and above → FREE delivery

## Customisation Notes
- All design tokens (colors, fonts, animations) are in `src/style.css`
- Primary color: `#d4a373` (warm gold)
- To add new products: edit `src/products.js` array
- To change delivery threshold: edit `getDelivery()` in `src/cart.js`
