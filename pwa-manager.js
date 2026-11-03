/* ==========================================================================
   EXPEDIENTES JURÁSICOS - PWA & OFFLINE MANAGER
   Gestiona la instalación de la aplicación, el Service Worker,
   el estado de red (Online/Offline) y las notificaciones InGen.
   ========================================================================== */

(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var isInstalled = false;

  // 1. REGISTRO DEL SERVICE WORKER
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    var isSecureOrigin = window.location.protocol === 'https:' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    if (!isSecureOrigin) {
      console.info('[PWA] El protocolo actual (' + window.location.protocol + ') no soporta Service Workers directamente. Para probar offline, utiliza un servidor local (http://localhost) o HTTPS.');
      return;
    }

    navigator.serviceWorker.register('./sw.js')
      .then(function (registration) {
        console.log('[PWA] Service Worker registrado con éxito. Ámbito:', registration.scope);

        registration.addEventListener('updatefound', function () {
          var newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('NUEVA ACTUALIZACIÓN INGEN DISPONIBLE. REINICIANDO...', 'info');
            }
          });
        });
      })
      .catch(function (error) {
        console.warn('[PWA] Error al registrar el Service Worker:', error);
      });
  }

  // Ejecutar inmediatamente o en load
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }

  // 2. DETECCIÓN DEL PROMPT DE INSTALACIÓN (beforeinstallprompt)
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    mostrarBotonInstalar();
  });

  window.addEventListener('appinstalled', function () {
    isInstalled = true;
    deferredInstallPrompt = null;
    ocultarBotonInstalar();
    showToast('✓ APLICACIÓN INSTALADA. LISTA PARA FUNCIONAR SIN INTERNET.', 'success');
  });

  // 3. MONITOR DE CONECTIVIDAD (ONLINE / OFFLINE)
  window.addEventListener('online', function () {
    showToast('🟢 CONEXIÓN RESTABLECIDA — SISTEMAS INGEN EN LÍNEA', 'success');
  });

  window.addEventListener('offline', function () {
    showToast('🔴 MODO SIN CONEXIÓN — NAVEGANDO BASE DE DATOS LOCAL', 'warning');
  });

  // 4. UI: BOTÓN FLOTANTE / NOTIFICACIÓN DE INSTALACIÓN
  function crearUIInstalacion() {
    if (document.getElementById('ej-pwa-install-container')) return;
    if (!document.body) return;

    var container = document.createElement('div');
    container.id = 'ej-pwa-install-container';
    container.style.cssText = [
      'position: fixed',
      'bottom: 1.2rem',
      'right: 1.2rem',
      'z-index: 99998',
      'display: none',
      'background: rgba(6, 12, 16, 0.95)',
      'border: 1px solid #00e5b0',
      'box-shadow: 0 4px 20px rgba(0, 229, 176, 0.25)',
      'padding: 0.8rem 1.1rem',
      'border-radius: 6px',
      'font-family: "Share Tech Mono", monospace',
      'color: #00e5b0',
      'backdrop-filter: blur(8px)',
      'animation: pwaFadeIn 0.3s ease-out'
    ].join(';');

    container.innerHTML = [
      '<div style="display:flex;align-items:center;gap:0.75rem;">',
      '  <span style="font-size:1.3rem;">📲</span>',
      '  <div>',
      '    <div style="font-family:\'Orbitron\',sans-serif;font-weight:700;font-size:0.8rem;letter-spacing:1px;color:#ffffff;">INSTALAR EXPEDIENTES JURÁSICOS</div>',
      '    <div style="font-size:0.68rem;color:#607868;margin-top:2px;">Funciona 100% sin conexión a internet</div>',
      '  </div>',
      '  <button id="ej-btn-pwa-install" style="background:#00e5b0;color:#06090d;border:none;padding:0.45rem 0.8rem;font-family:\'Orbitron\',sans-serif;font-weight:700;font-size:0.72rem;letter-spacing:1px;border-radius:4px;cursor:pointer;margin-left:0.5rem;transition:all 0.2s;">INSTALAR</button>',
      '  <button id="ej-btn-pwa-dismiss" style="background:transparent;color:#607868;border:none;font-size:1rem;cursor:pointer;padding:0 0.2rem;line-height:1;" title="Cerrar">✕</button>',
      '</div>'
    ].join('');

    document.body.appendChild(container);

    var installBtn = document.getElementById('ej-btn-pwa-install');
    var dismissBtn = document.getElementById('ej-btn-pwa-dismiss');

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function (choice) {
          if (choice.outcome === 'accepted') {
            console.log('[PWA] Instalación aceptada por el usuario');
          }
          deferredInstallPrompt = null;
          ocultarBotonInstalar();
        });
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        ocultarBotonInstalar();
      });
    }
  }

  function mostrarBotonInstalar() {
    crearUIInstalacion();
    var c = document.getElementById('ej-pwa-install-container');
    if (c) c.style.display = 'block';
  }

  function ocultarBotonInstalar() {
    var c = document.getElementById('ej-pwa-install-container');
    if (c) c.style.display = 'none';
  }

  // 5. SISTEMA DE TOASTS INGEN (AVISOS EN PANTALLA)
  function showToast(mensaje, tipo) {
    if (!document.body) return;
    var existing = document.getElementById('ej-pwa-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'ej-pwa-toast';

    var borderColor = '#00e5b0';
    var textColor = '#00e5b0';
    if (tipo === 'warning') {
      borderColor = '#ffb300';
      textColor = '#ffb300';
    } else if (tipo === 'error') {
      borderColor = '#ff3030';
      textColor = '#ff3030';
    }

    toast.style.cssText = [
      'position: fixed',
      'bottom: 1.2rem',
      'left: 50%',
      'transform: translateX(-50%)',
      'z-index: 99999',
      'background: rgba(6, 12, 16, 0.94)',
      'border: 1px solid ' + borderColor,
      'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6)',
      'padding: 0.65rem 1.2rem',
      'border-radius: 4px',
      'font-family: "Share Tech Mono", monospace',
      'font-size: 0.78rem',
      'letter-spacing: 1px',
      'color: ' + textColor,
      'text-align: center',
      'pointer-events: none',
      'backdrop-filter: blur(6px)',
      'transition: opacity 0.4s ease, transform 0.4s ease'
    ].join(';');

    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 450);
    }, 4000);
  }

  // Exponer API global
  window.EJ_PWA = {
    showToast: showToast,
    register: registerServiceWorker,
    promptInstall: function () {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
      } else {
        alert('Para instalar en tu navegador, usa el menú del navegador y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".');
      }
    },
    isInstalled: function () {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    },
    showStatus: function () {
      var status = navigator.onLine ? 'ONLINE' : 'OFFLINE';
      showToast('[ ESTADO DE RED: ' + status + ' ]', navigator.onLine ? 'success' : 'warning');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', crearUIInstalacion);
  } else {
    crearUIInstalacion();
  }
})();
