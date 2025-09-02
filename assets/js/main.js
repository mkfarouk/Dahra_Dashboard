// assets/js/main.js
import { AppController } from './controller/AppController.js';

function start() {
  try { AppController.init(); } catch (e) { console.error('App init failed:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
