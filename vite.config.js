import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        orderConfirmed: resolve(__dirname, 'order-confirmed.html'),
        myOrders: resolve(__dirname, 'my-orders.html'),
        tryOn: resolve(__dirname, 'try-on.html'),
      }
    }
  },
  server: {
    open: true
  }
});
