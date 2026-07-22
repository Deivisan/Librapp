/* ============================================
   Librapp - PWA Install + Service Worker
   ============================================ */

let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/libras/sw.js';
    navigator.serviceWorker.register(swUrl, { scope: '/libras/', updateViaCache: 'none' })
      .then(reg => {
        console.log('[PWA] SW registrado:', reg.scope);
        // Force update check to pick up new SW immediately
        reg.update();
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated') {
              console.log('[PWA] Novo SW ativado, cache recriado');
              // Notify all tabs to refresh
              navigator.serviceWorker.controller?.postMessage({ type: 'SW_UPDATED' });
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Erro SW:', err));
  });
}

// Detect install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Detect installed app
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  hideInstallButton();
  console.log('[PWA] App instalado!');
});

function showInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.classList.remove('hidden');
}

function hideInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.classList.add('hidden');
}

// Install function called from button
function installPWA() {
  if (!deferredPrompt) {
    // Fallback: show how to install manually
    alert('Para instalar o Librapp:\n\n1. Abra o menu do navegador (⋮)\n2. Toque em "Adicionar à tela inicial"');
    return;
  }

  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou instalar');
    } else {
      console.log('[PWA] Usuário recusou');
    }
    deferredPrompt = null;
    hideInstallButton();
  });
}

// Check if already installed (display-mode: standalone)
function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}

// iOS standalone detection
if (window.navigator.standalone) {
  document.documentElement.classList.add('pwa-standalone');
}

// Listen for standalone mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.classList.add('pwa-standalone');
    hideInstallButton();
  } else {
    document.documentElement.classList.remove('pwa-standalone');
  }
});
