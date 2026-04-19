# SNEHKRITI — Agent Context File
> Give this file to any AI agent in a new chat to fully understand the project before making changes.

---

## 1. What Is This Project?

**Snehkriti** is a handcrafted clothing e-commerce website for a small business based in Bhopal, India.
- Sells hand-printed/customised tees, hoodies, and textile pieces
- Founded by **Sneha** (founder & dreamer)
- Website designed by **Rishi Thakur** (@rishithakurrr__ on Instagram)
- Instagram: [@snehkriti.in](https://www.instagram.com/snehkriti.in/)
- YouTube: [@snehkritiii](https://youtube.com/@snehkritiii)
- Email: Snehkriti.in@gmail.com
- GitHub repo: `https://github.com/Rishi043/snehkriti-2.0.git` (branch: `main`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite (`vite.config.js`) |
| Styling | Tailwind CSS (CDN) + custom `src/style.css` |
| Fonts | Google Fonts — Caveat, Homemade Apple, Playfair Display, Dancing Script, Montserrat, Hind, DM Sans, Poppins |
| Deployment | Vercel (`vercel.json` with HTML rewrites) |
| JS | Vanilla ES modules (`type="module"`) |
| No framework | Pure HTML + JS, no React/Vue/Angular |

### Dev commands
```bash
npm run dev       # start Vite dev server (opens browser)
npm run build     # production build
npm run preview   # preview production build
```

### Git workflow
```bash
git add <files> && git commit -m "message" && git push origin main
```

---

## 3. File Structure

```
snehkriti-2.0-main/
├── index.html              # Home page
├── products.html           # All collections / shop page
├── product-detail.html     # Single product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout form
├── order-confirmed.html    # Post-order confirmation
├── my-orders.html          # Order history (localStorage)
├── try-on.html             # AI Virtual Try-On feature
├── src/
│   ├── style.css           # All custom CSS (Tailwind is CDN)
│   ├── indexPage.js        # Home page JS
│   ├── productsPage.js     # Products page JS
│   ├── productDetail.js    # Product detail JS
│   ├── cartPage.js         # Cart page JS
│   ├── checkoutPage.js     # Checkout page JS
│   ├── orderConfirmed.js   # Order confirmed JS
│   ├── myOrders.js         # My orders JS
│   ├── tryOnPage.js        # Virtual try-on JS
│   ├── cart.js             # Cart state/logic (shared)
│   ├── checkout.js         # Checkout logic (shared)
│   ├── products.js         # Product data/catalog
│   ├── main.js             # Shared entry
│   └── whatsapp.js         # WhatsApp order integration
├── api/
│   ├── tryon.js            # Vercel serverless — AI try-on trigger
│   ├── tryon-status.js     # Vercel serverless — poll try-on status
│   ├── fetch-image.js      # Vercel serverless — fetch result image
│   └── hf-token.js        # Vercel serverless — HuggingFace token
├── images/                 # Product & episode images (root)
├── public/images/          # Same images (Vite public dir)
├── vercel.json             # URL rewrites for clean URLs
├── vite.config.js          # Multi-page Vite config
├── package.json            # npm scripts + Vite dep
└── hf_config.json          # HuggingFace config for try-on
```

---

## 4. Design System & Theme

### Color Palette
| Variable | Hex | Usage |
|---|---|---|
| Brand / primary | `#d4a373` | Buttons, headings, accents |
| Brand dark | `#b08968` | Hover states |
| Brand muted | `#a17852` | Subtitle text, Hindi text |
| Background | `#f8f1f0` | Page background |
| Header bg | `#f8edeb` | Header overlay |
| Text dark | `#5e503f` | Body text |
| Text muted | `#6c757d` | Taglines, italic text |
| Accent pink | `#e91e63` | Badges, alerts, try-on CTA |
| Footer bg | `#6b5b4f` → `#5e503f` | Footer gradient |

### Typography Classes
```css
.handwritten   → font-family: 'Caveat', cursive
.letter        → font-family: 'Homemade Apple', cursive  (used for "Kriti" in logo)
.casual-handwritten → font-family: 'Dancing Script', cursive
/* Body default: Playfair Display */
/* UI elements: Poppins / DM Sans */
```

### Key CSS Utilities (in `src/style.css`)
- `.watercolor-bg` — animated watercolor gradient background
- `.gradient-text` — animated rainbow gradient text
- `.floating` — gentle float up/down animation
- `.hover-notes` — card tilt + scale on hover
- `.polaroid-frame` — polaroid-style image frame
- `.washi-tape` — decorative tape element on cards
- `.skeleton` — shimmer loading placeholder
- `.filter-pill` — category filter buttons
- `.pcard` — product card (Poppins design system)
- `.submit-btn` — primary CTA button with shimmer
- `.home-scroll-container` — horizontal scroll gallery
- `.diary-card` — Print Diary episode cards

---

## 5. Page-by-Page Overview

### `index.html` — Home
- **Header**: Logo (स्नेह + *Kriti*) → "Customised Clothes" subtitle → "Printed with Love. Felt like a Hug." tagline
- **Nav**: Home, Gallery, Collections, Our Story, My Orders (sticky, with mobile hamburger)
- **Hero**: Text + Instagram reel embed + Virtual Try-On CTA button
- **Try-On Banner**: Dark purple gradient banner linking to `try-on.html`
- **Gallery**: Horizontal scroll of product cards (9 products, `home-scroll-container`)
- **Print Diary**: Film-strip style horizontal scroll of 10 episode reels (Instagram links)
- **About**: Letter-style "Our Story" section from Sneha
- **Connect**: Instagram + YouTube follow cards + stats strip (100+ customers, 50+ designs, PAN India)
- **Testimonials/CTA**: "Join Our Happy Family of 100+ Customers" card
- **Footer**: Links, social icons, contact, copyright
- **Floating cart button**: Fixed bottom-right, shows cart count badge

### `products.html` — All Collections
- Same header/nav as all pages
- Filter pills: All, Tees, Anime, Hoodies, Zodiac, K-Pop
- Product grid rendered by `productsPage.js` from `products.js` data
- Empty state if no products in category

### `product-detail.html` — Product Detail
- Loads product by `?id=` URL param
- Image gallery with thumbnail strip
- Size selector, quantity, Add to Cart
- Rendered dynamically by `productDetail.js`

### `cart.html` — Cart
- Cart items from localStorage
- Qty controls, remove items
- Order total, proceed to checkout

### `checkout.html` — Checkout
- Form: Name, Phone (+91 prefix), Email (optional), Pincode (auto-fills City/State via `api.postalpincode.in`), Full Address, Notes
- Order summary shown above form
- Submit → WhatsApp order + localStorage save

### `order-confirmed.html` — Order Confirmed
- Shows order details after successful checkout
- Links to My Orders

### `my-orders.html` — My Orders
- Reads order history from localStorage
- Shows order cards with items, address, total, status badge

### `try-on.html` — Virtual Try-On (AI Feature)
- Step 1: Upload photo (or use example male/female)
- Step 2: Pick a product design from grid
- Step 3: AI generates try-on result
- Uses HuggingFace API via Vercel serverless functions (`/api/tryon`, `/api/tryon-status`, `/api/fetch-image`)
- Beta feature — results may vary

---

## 6. Header Structure (ALL pages — identical)

Every page has this exact header pattern:

```html
<header class="relative overflow-hidden">
  <div class="absolute inset-0 bg-[#f8edeb] opacity-60"></div>
  <div class="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center">

    <!-- LOGO: Hindi "स्नेह" + cursive "Kriti" -->
    <h1 class="text-5xl md:text-7xl font-bold text-[#d4a373] mb-1 flex items-center justify-center gap-2">
      <span class="handwritten" style="font-family:'Hind',sans-serif;font-weight:600;color:#a17852;">स्नेह</span>
      <span class="letter italic" style="font-family:'Homemade Apple',cursive;transform:rotate(-2deg);color:#d4a373;">Kriti</span>
    </h1>

    <!-- SUBTITLE: small spaced caps, sits tight under logo -->
    <p style="font-family:'Montserrat',sans-serif;font-weight:300;font-size:0.5rem;letter-spacing:7px;color:#a17852;text-transform:uppercase;opacity:0.75;margin-bottom:0.75rem;">Customised Clothes</p>

    <!-- TAGLINE -->
    <p class="text-xl md:text-2xl handwritten text-[#6c757d] italic">Printed with Love. Felt like a Hug.</p>

  </div>
</header>
```

**Key styling decisions:**
- `mb-1` on h1 (not `mb-4`) — keeps subtitle tight under logo
- `font-size: 0.5rem` + `letter-spacing: 7px` — tiny, wide-spaced, artistic
- `opacity: 0.75` — subtle, not competing with logo
- `margin-bottom: 0.75rem` — clean gap before tagline

---

## 7. Product Catalog (from `src/products.js`)

| ID | Name | Price | Category |
|---|---|---|---|
| 1 | Dreamy Bloom Tee | ₹499 | Tees |
| 2 | Spider Star Tee | ₹599 | Tees |
| 3 | One Piece Luffy Tee | ₹699 | Anime |
| 4 | Bulbasaur Chill Tee | ₹499 | Anime |
| 5 | Golden Leo Vibes Tee | ₹599 | Zodiac |
| 6 | Naruto Uzumaki Tee | ₹699 | Anime |
| 7 | BT21 Cutie Tee | ₹599 | K-Pop |
| 8 | Arlovey Romance Hoodie | ₹949 | Hoodies |
| 9 | Dino Couple Hoodies | ₹1759 | Hoodies (matching pair) |

Images are in `/images/` and `/public/images/`.

---

## 8. Key Interactions & State

- **Cart**: Stored in `localStorage` — managed by `src/cart.js`
- **Orders**: Stored in `localStorage` — read by `myOrders.js`
- **Cart badge**: `#cart-count-badge-float` — updated on every page load
- **Pincode lookup**: `https://api.postalpincode.in/pincode/{pin}` — auto-fills city/state
- **WhatsApp order**: `src/whatsapp.js` — formats order and opens WhatsApp
- **Try-On AI**: HuggingFace model via Vercel serverless, config in `hf_config.json`

---

## 9. Vercel Deployment

`vercel.json` rewrites:
```
/products        → products.html
/product-detail  → product-detail.html
/cart            → cart.html
/checkout        → checkout.html
/order-confirmed → order-confirmed.html
/my-orders       → my-orders.html
/try-on          → try-on.html
```

---

## 10. Git Commit History (Key Changes)

| Commit | Description |
|---|---|
| `1eba53e` | Initial / base version |
| `afe2c41` | feat: add Customised Clothes subtitle between title and tagline on all pages |
| `e803340` | style: tighten Customised Clothes subtitle — smaller text, closer to title |

---

## 11. Conventions & Rules for Agents

1. **All 8 HTML files share the same header** — any header change must be applied to all: `index.html`, `products.html`, `cart.html`, `checkout.html`, `product-detail.html`, `order-confirmed.html`, `my-orders.html`, `try-on.html`
2. **Tailwind via CDN** — no `tailwind.config.js`, use inline Tailwind classes directly
3. **Custom CSS** goes in `src/style.css` — not inline `<style>` tags unless page-specific
4. **No framework** — pure HTML/JS, no React/Vue
5. **Font classes**: always use `.handwritten` for Caveat, `.letter` for Homemade Apple
6. **Brand color**: `#d4a373` (primary), `#b08968` (hover/dark)
7. **Images**: reference as `/images/filename.jpg` (Vite serves from `public/`)
8. **JS modules**: each page has its own `src/xxxPage.js` loaded as `type="module"`
9. **Git**: always commit with descriptive messages, push to `origin main`
10. **Line endings**: Windows CRLF warnings from Git are normal — ignore them

---

## 12. Commands Reference

```bash
# Dev
npm run dev

# Build
npm run build

# Git — stage, commit, push all HTML pages
git add index.html products.html checkout.html cart.html product-detail.html order-confirmed.html my-orders.html try-on.html && git commit -m "message" && git push origin main

# Check git status
git status

# Check last commits
git log --oneline -5

# Check if pushed
git log --oneline origin/main -3
```

---

*Last updated: Session where Customised Clothes subtitle was repositioned and restyled across all pages.*
