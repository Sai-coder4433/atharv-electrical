import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.'),
      },
    },
    server: {
      port: 3001,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/cashfree/create-order': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          headers: {
            origin: 'https://atharvelectrical.com',
          },
          rewrite: (path) => path.replace(/^\/api\/cashfree\/create-order/, '/createCashfreeOrder'),
        },
        '/api/cashfree/verify-payment': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cashfree\/verify-payment/, '/verifyCashfreePayment'),
        },
        '/api/cashfree/order-status': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cashfree\/order-status/, '/cashfreeOrderStatus'),
        },
        '/api/cashfree/refund': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cashfree\/refund/, '/cashfreeRefund'),
        },
        '/api/cashfree/webhook': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cashfree\/webhook/, '/cashfreeWebhook'),
        },
        '/api/create-razorpay-order': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/create-razorpay-order/, '/createRazorpayOrder'),
        },
        '/api/verify-razorpay-payment': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/verify-razorpay-payment/, '/verifyRazorpayPayment'),
        },
        '/api/shiprocket/check-serviceability': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/check-serviceability/, '/shiprocketCheckServiceability'),
        },
        '/api/shiprocket/create-shipment': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/create-shipment/, '/shiprocketCreateShipment'),
        },
        '/api/shiprocket/generate-awb': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/generate-awb/, '/shiprocketGenerateAwb'),
        },
        '/api/shiprocket/schedule-pickup': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/schedule-pickup/, '/shiprocketSchedulePickup'),
        },
        '/api/shiprocket/generate-label': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/generate-label/, '/shiprocketGenerateLabel'),
        },
        '/api/shiprocket/track': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/track/, '/shiprocketTrackShipment'),
        },
        '/api/shiprocket/cancel': {
          target: 'https://us-central1-atharv-electrical-chakan.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shiprocket\/cancel/, '/shiprocketCancelShipment'),
        },
      },
    },
  };
});
