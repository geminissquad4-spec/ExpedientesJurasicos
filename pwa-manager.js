/* ==========================================================================
   EXPEDIENTES JURÁSICOS - PWA & OFFLINE MANAGER
   Gestiona la instalación de la aplicación, el Service Worker,
   el estado de red (Online/Offline) y las notificaciones InGen.
   ========================================================================== */

(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // 1. REGISTRO DEL SERVICE WORKER
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    var isSecureOrigin = window.location.protocol === 'https:' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    if (!isSecureOrigin) {
      console.info('[PWA] Protocolo local (' + window.location.protocol + '). Service Worker activo en localhost o HTTPS.');
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
              showToast('NUEVA ACTUALIZACIÓN INGEN DISPONIBLE.', 'info');
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

  // 2. DETECCIÓN DEL PROMPT DE INSTALACIÓN NATIVO
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    actualizarBotonesInstalacion();
  });

  window.addEventListener('appinstalled', function () {
    isInstalled = true;
    deferredInstallPrompt = null;
    ocultarUIInstalacion();
    showToast('✓ APLICACIÓN INSTALADA. LISTA PARA FUNCIONAR SIN INTERNET.', 'success');
  });

  // 3. MONITOR DE CONECTIVIDAD (ONLINE / OFFLINE)
  window.addEventListener('online', function () {
    showToast('🟢 CONEXIÓN RESTABLECIDA — SISTEMAS INGEN EN LÍNEA', 'success');
  });

  window.addEventListener('offline', function () {
    showToast('🔴 MODO SIN CONEXIÓN — NAVEGANDO BASE DE DATOS LOCAL', 'warning');
  });

  // 4. UI: INSERCIÓN DE BOTONES Y MODAL DE INSTALACIÓN
  function injectPWAStyles() {
    if (document.getElementById('ej-pwa-custom-styles')) return;

    var style = document.createElement('style');
    style.id = 'ej-pwa-custom-styles';
    style.textContent = [
      '/* BOTÓN TOPBAR TELEMETRÍA */',
      '.ingen-install-badge {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 0.4rem;',
      '  background: rgba(0, 229, 176, 0.12);',
      '  border: 1px solid #00e5b0;',
      '  border-radius: 20px;',
      '  padding: 0.32rem 0.85rem;',
      '  font-family: "Orbitron", sans-serif;',
      '  font-size: 0.72rem;',
      '  font-weight: 700;',
      '  color: #00e5b0;',
      '  letter-spacing: 1px;',
      '  cursor: pointer;',
      '  box-shadow: 0 0 10px rgba(0, 229, 176, 0.2);',
      '  transition: all 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '.ingen-install-badge:hover {',
      '  background: #00e5b0;',
      '  color: #06090d;',
      '  box-shadow: 0 0 18px rgba(0, 229, 176, 0.6);',
      '  transform: translateY(-1px);',
      '}',

      '/* CARD FLOTANTE INFERIOR DERECHA */',
      '#ej-pwa-floating-btn {',
      '  position: fixed;',
      '  bottom: 1.2rem;',
      '  right: 1.2rem;',
      '  z-index: 99998;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.65rem;',
      '  background: rgba(6, 14, 18, 0.94);',
      '  border: 1px solid #00e5b0;',
      '  border-radius: 8px;',
      '  padding: 0.65rem 1rem;',
      '  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 229, 176, 0.25);',
      '  backdrop-filter: blur(8px);',
      '  cursor: pointer;',
      '  transition: all 0.25s ease;',
      '  font-family: "Share Tech Mono", monospace;',
      '}',
      '#ej-pwa-floating-btn:hover {',
      '  border-color: #5dff6a;',
      '  box-shadow: 0 6px 30px rgba(0, 229, 176, 0.45);',
      '  transform: translateY(-2px);',
      '}',
      '#ej-pwa-floating-btn .pwa-icon {',
      '  font-size: 1.35rem;',
      '  line-height: 1;',
      '}',
      '#ej-pwa-floating-btn .pwa-texts {',
      '  text-align: left;',
      '}',
      '#ej-pwa-floating-btn .pwa-title {',
      '  font-family: "Orbitron", sans-serif;',
      '  font-size: 0.74rem;',
      '  font-weight: 700;',
      '  color: #00e5b0;',
      '  letter-spacing: 1px;',
      '}',
      '#ej-pwa-floating-btn .pwa-sub {',
      '  font-size: 0.65rem;',
      '  color: #7fa490;',
      '}',
      '#ej-pwa-floating-btn .pwa-close-x {',
      '  color: #4b6655;',
      '  font-size: 1rem;',
      '  margin-left: 0.4rem;',
      '  padding: 0 0.2rem;',
      '  line-height: 1;',
      '}',
      '#ej-pwa-floating-btn .pwa-close-x:hover {',
      '  color: #ff3030;',
      '}',

      '/* MODAL DE INSTRUCCIONES INGEN */',
      '#ej-pwa-modal-overlay {',
      '  position: fixed;',
      '  top: 0;',
      '  left: 0;',
      '  width: 100vw;',
      '  height: 100vh;',
      '  background: rgba(3, 7, 10, 0.88);',
      '  backdrop-filter: blur(8px);',
      '  z-index: 999999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 1rem;',
      '  box-sizing: border-box;',
      '  animation: pwaFadeIn 0.25s ease-out;',
      '}',
      '#ej-pwa-modal-card {',
      '  background: #070d12;',
      '  border: 1px solid #00e5b0;',
      '  box-shadow: 0 0 35px rgba(0, 229, 176, 0.25);',
      '  max-width: 560px;',
      '  width: 100%;',
      '  border-radius: 8px;',
      '  padding: 1.5rem;',
      '  color: #d1eae0;',
      '  font-family: "Share Tech Mono", monospace;',
      '  position: relative;',
      '}',
      '@keyframes pwaFadeIn {',
      '  from { opacity: 0; transform: scale(0.96); }',
      '  to { opacity: 1; transform: scale(1); }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function crearElementosUI() {
    if (isInstalled) return;
    injectPWAStyles();

    // 1. Inyectar botón en la barra superior de telemetría (al lado de Visitantes)
    var telemetryWrap = document.getElementById('ingen-telemetry-wrap');
    if (telemetryWrap && !document.getElementById('ej-topbar-install-btn')) {
      var topBtn = document.createElement('button');
      topBtn.id = 'ej-topbar-install-btn';
      topBtn.className = 'ingen-install-badge';
      topBtn.innerHTML = '📲 MODO APP';
      topBtn.title = 'Abrir o instalar como aplicación independiente sin internet';
      topBtn.addEventListener('click', handleInstallClick);
      telemetryWrap.appendChild(topBtn);
    }

    // 2. Inyectar tarjeta flotante en la esquina inferior derecha
    if (!document.getElementById('ej-pwa-floating-btn') && document.body) {
      var floatCard = document.createElement('div');
      floatCard.id = 'ej-pwa-floating-btn';
      floatCard.innerHTML = [
        '<span class="pwa-icon">📲</span>',
        '<div class="pwa-texts">',
        '  <div class="pwa-title">MODO APLICACIÓN OFFLINE</div>',
        '  <div class="pwa-sub">Usar sin conexión / Pantalla completa</div>',
        '</div>',
        '<span class="pwa-close-x" title="Cerrar aviso">✕</span>'
      ].join('');

      floatCard.addEventListener('click', function (e) {
        if (e.target.classList.contains('pwa-close-x')) {
          e.stopPropagation();
          floatCard.style.display = 'none';
        } else {
          handleInstallClick();
        }
      });

      document.body.appendChild(floatCard);
    }
  }

  function handleInstallClick() {
    // Si el navegador tiene el prompt nativo listo (en HTTPS o localhost)
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') {
          console.log('[PWA] Instalación aceptada.');
          ocultarUIInstalacion();
        }
        deferredInstallPrompt = null;
      });
      return;
    }

    // Si está ejecutándose desde archivo local o navegador sin prompt automático
    abrirModalInstrucciones();
  }

  function abrirModalInstrucciones() {
    if (document.getElementById('ej-pwa-modal-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'ej-pwa-modal-overlay';
    overlay.innerHTML = [
      '<div id="ej-pwa-modal-card">',
      '  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,229,176,0.3);padding-bottom:0.75rem;margin-bottom:1.1rem;">',
      '    <div style="font-family:\'Orbitron\',sans-serif;font-weight:700;font-size:0.92rem;color:#00e5b0;letter-spacing:1px;">',
      '      📲 EXPEDIENTES JURÁSICOS // MODO APLICACIÓN',
      '    </div>',
      '    <button id="ej-modal-close-x" style="background:transparent;border:none;color:#ff3030;font-size:1.2rem;cursor:pointer;line-height:1;">✕</button>',
      '  </div>',
      '  <p style="font-size:0.82rem;line-height:1.45;color:#c8dac0;margin-bottom:1.2rem;">',
      '    Puedes ejecutar <strong>Expedientes Jurásicos</strong> como una aplicación nativa en tu computadora o dispositivo móvil para jugar y consultar archivos <strong>100% sin conexión a internet</strong>:',
      '  </p>',
      '  <div style="display:flex;flex-direction:column;gap:0.85rem;margin-bottom:1.4rem;">',
      '    <div style="background:rgba(0,229,176,0.06);border:1px solid rgba(0,229,176,0.3);border-radius:6px;padding:0.75rem 0.9rem;">',
      '      <div style="font-family:\'Orbitron\',sans-serif;font-size:0.78rem;font-weight:700;color:#00e5b0;margin-bottom:0.25rem;">💻 EN PC / WINDOWS (MÉTODO RECOMENDADO)</div>',
      '      <div style="font-size:0.75rem;color:#a8c4b4;line-height:1.4;">',
      '        Ve a la carpeta de tu juego y haz doble clic en:<br>',
      '        <code style="background:#03080b;border:1px solid #00e5b0;color:#5dff6a;padding:0.2rem 0.5rem;border-radius:4px;display:inline-block;margin-top:0.35rem;font-weight:bold;">Iniciar_App_Offline.bat</code><br>',
      '        <span style="font-size:0.68rem;color:#607868;">Se abrirá en su propia ventana de aplicación de escritorio, sin barras de navegación y con máxima velocidad.</span>',
      '      </div>',
      '    </div>',
      '    <div style="background:rgba(0,229,176,0.06);border:1px solid rgba(0,229,176,0.3);border-radius:6px;padding:0.75rem 0.9rem;">',
      '      <div style="font-family:\'Orbitron\',sans-serif;font-size:0.78rem;font-weight:700;color:#00e5b0;margin-bottom:0.25rem;">🌐 DESDE TU NAVEGADOR (EDGE O CHROME)</div>',
      '      <div style="font-size:0.75rem;color:#a8c4b4;line-height:1.4;">',
      '        1. Haz clic en el menú <strong>(•••)</strong> de tu navegador arriba a la derecha.<br>',
      '        2. Selecciona <strong>"Aplicaciones"</strong>.<br>',
      '        3. Pulsa <strong>"Instalar este sitio como aplicación"</strong>.',
      '      </div>',
      '    </div>',
      '    <div style="background:rgba(0,229,176,0.06);border:1px solid rgba(0,229,176,0.3);border-radius:6px;padding:0.75rem 0.9rem;">',
      '      <div style="font-family:\'Orbitron\',sans-serif;font-size:0.78rem;font-weight:700;color:#00e5b0;margin-bottom:0.25rem;">📱 EN CELULARES (ANDROID O IPHONE)</div>',
      '      <div style="font-size:0.75rem;color:#a8c4b4;line-height:1.4;">',
      '        Abre el menú del navegador en tu móvil y elige <strong>"Agregar a pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div style="text-align:right;">',
      '    <button id="ej-modal-btn-ok" style="background:#00e5b0;color:#06090d;border:none;font-family:\'Orbitron\',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:1px;padding:0.6rem 1.4rem;border-radius:4px;cursor:pointer;transition:all 0.2s;">ENTENDIDO</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(overlay);

    var close = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    document.getElementById('ej-modal-close-x').addEventListener('click', close);
    document.getElementById('ej-modal-btn-ok').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
  }

  function actualizarBotonesInstalacion() {
    var floatCard = document.getElementById('ej-pwa-floating-btn');
    if (floatCard && !isInstalled) {
      floatCard.style.display = 'flex';
    }
  }

  function ocultarUIInstalacion() {
    var floatCard = document.getElementById('ej-pwa-floating-btn');
    if (floatCard) floatCard.style.display = 'none';
    var topBtn = document.getElementById('ej-topbar-install-btn');
    if (topBtn) topBtn.style.display = 'none';
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
    showModal: abrirModalInstrucciones,
    promptInstall: handleInstallClick,
    isInstalled: function () {
      return isInstalled;
    }
  };

  // Inicializar UI al cargar
  function initUI() {
    crearElementosUI();
    // Reintentar vincular al topbar si site-access-system.js tardó en crearlo
    setTimeout(crearElementosUI, 600);
    setTimeout(crearElementosUI, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
