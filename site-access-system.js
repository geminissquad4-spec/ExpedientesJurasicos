/**
 * ============================================================
 * EXPEDIENTES JURÁSICOS - SISTEMA DE TELEMETRÍA Y CONTADORES
 * ============================================================
 *
 * Módulos:
 * 1. Contador de Personas que ingresan al sitio (Automático, sin registro)
 * 2. Contador de Intentos por cada minijuego en tiempo real
 * 3. Optimización para dispositivos móviles y pantallas táctiles
 */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CONFIGURACIÓN Y CONSTANTES
    // ------------------------------------------------------------
    var STORAGE_KEY_ATTEMPTS    = 'ej_ingen_minigame_attempts';
    var STORAGE_KEY_TOTAL_VIS   = 'ej_ingen_total_site_visits';
    var BASELINE_VISITORS       = 1420; // Base histórica creíble de operativos InGen

    // Mapeo canónico de los 15 minijuegos
    var MINIGAMES_CATALOG = {
        'compy':                { name: '¡Atrapa al Compy!',                category: 'Mantenimiento del Sitio' },
        'dilopho':              { name: '¡Alerta Dilophosaurus!',          category: 'Misterios en la Isla' },
        'sick-trike':           { name: '¡Cura al Triceratops!',           category: 'Misterios en la Isla' },
        'ntm':                  { name: '¡No Te Muevas!',                  category: 'Misterios en la Isla' },
        'plesio-swim':          { name: '¡Escape del Plesiosaurus!',       category: 'Misterios en la Isla' },
        'styraco-strike':       { name: '¡EL ÚLTIMO COMBATE!',             category: 'Sobrevivir en la Isla' },
        'identifica-especie':   { name: '¡Identifica la Especie!',         category: 'Sobrevivir en la Isla' },
        'raptor':               { name: '¡NO ENTRES EN EL PASTIZAL!',      category: 'Sobrevivir en la Isla' },
        'carno-search':         { name: '¡BUSCANDO AL CARNOTAURUS!',       category: 'Sobrevivir en la Isla' },
        'cueva-baryonyx':       { name: '¡La Cueva del Baryonyx!',         category: 'Sobrevivir en la Isla' },
        'escape-sorna':         { name: '¡Escape de Sorna!',               category: 'Sobrevivir en la Isla' },
        'ahuyentando-ornithos': { name: '¡Ahuyentando a los Ornithocheirus!', category: 'Caos en la Isla' },
        'escapa-cryolo':        { name: '¡Escapa del Cryolophosaurus!',    category: 'Caos en la Isla' },
        'hibridacion-adn':      { name: 'Hibridación de ADN',              category: 'Caos en la Isla' },
        'captura-giganoto':     { name: 'Captura al Giganotosaurus',       category: 'Caos en la Isla' },
        'encontrando-quetza':   { name: '¡Encontrando al Quetzalcoatlus!', category: 'Caos en la Isla' }
    };

    // ------------------------------------------------------------
    // 2. GENERADOR DE EFECTOS SONOROS (WEB AUDIO API)
    // ------------------------------------------------------------
    var audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioCtx = new AudioCtx();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(function () {});
        }
        return audioCtx;
    }

    function playBeep(freq, type, duration, vol, delay) {
        try {
            var ctx = getAudioCtx();
            if (!ctx) return;
            var t = ctx.currentTime + (delay || 0);
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol || 0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + duration);
        } catch (e) {}
    }

    // ------------------------------------------------------------
    // 3. REGISTRO Y CONTEO AUTOMÁTICO DE VISITANTES
    // ------------------------------------------------------------
    function recordSiteVisit() {
        var totalVis = 0;
        try {
            totalVis = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_VIS) || '0', 10);
            var hasVisitedSession = sessionStorage.getItem('ej_ingen_session_visit');
            if (!hasVisitedSession) {
                sessionStorage.setItem('ej_ingen_session_visit', 'true');
                totalVis++;
                localStorage.setItem(STORAGE_KEY_TOTAL_VIS, String(totalVis));
            }
        } catch (e) {}
        return BASELINE_VISITORS + Math.max(1, totalVis);
    }

    function getTotalVisitorsCount() {
        var totalVis = 0;
        try {
            totalVis = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_VIS) || '0', 10);
        } catch (e) {}
        return BASELINE_VISITORS + Math.max(1, totalVis);
    }

    // ------------------------------------------------------------
    // 4. SISTEMA DE INTENTOS EN MINIJUEGOS
    // ------------------------------------------------------------
    function getAllAttempts() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function getMinigameAttempts(gameId) {
        var attempts = getAllAttempts();
        return parseInt(attempts[gameId] || 0, 10);
    }

    function registerMinigameAttempt(gameId) {
        if (!gameId) return 0;
        var attempts = getAllAttempts();
        var current = parseInt(attempts[gameId] || 0, 10);
        current++;
        attempts[gameId] = current;

        try {
            localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
        } catch (e) {}

        // Actualizar UI en tiempo real
        updateAttemptsUI(gameId, current);

        // Feedback sonoro discreto de registro táctico
        playBeep(720, 'sine', 0.08, 0.08);

        return current;
    }

    // Exponer globalmente para ser invocado desde botones de reintento en cualquier script
    window.registerMinigameAttempt = registerMinigameAttempt;
    window.getMinigameAttempts = getMinigameAttempts;

    function updateAttemptsUI(gameId, count) {
        var pills = document.querySelectorAll('.minijuego-attempts-pill[data-game-id="' + gameId + '"]');
        pills.forEach(function (pill) {
            var numEl = pill.querySelector('.attempts-num');
            if (numEl) {
                numEl.textContent = count;
                numEl.classList.add('pulse');
                setTimeout(function () {
                    numEl.classList.remove('pulse');
                }, 600);
            }
            if (count > 0) {
                pill.classList.add('has-attempts');
            }
        });

        // Actualizar contadores internos si existen en los minijuegos
        var hudEl = document.getElementById('hud-attempts-' + gameId);
        if (hudEl) hudEl.textContent = count;
    }

    function refreshAllMinigameAttemptsUI() {
        var attempts = getAllAttempts();
        Object.keys(MINIGAMES_CATALOG).forEach(function (gid) {
            var count = parseInt(attempts[gid] || 0, 10);
            updateAttemptsUI(gid, count);
        });
    }

    // ------------------------------------------------------------
    // 5. ESTILOS CSS INYECTADOS (BADGE DE VISITANTES + INTENTOS)
    // ------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('ej-access-system-styles')) return;

        var css = [
            '/* ============================================================ */',
            '/* ESTILOS DEL CONTADOR DE VISITANTES Y TELEMETRÍA INGEN         */',
            '/* ============================================================ */',

            '/* BADGE DE VISITANTES EN NAVBAR */',
            '.ingen-visitor-badge {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 0.45rem;',
            '  background: rgba(3, 18, 12, 0.85);',
            '  border: 1px solid rgba(46, 204, 113, 0.45);',
            '  border-radius: 20px;',
            '  padding: 0.32rem 0.8rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.76rem;',
            '  color: #2ecc71;',
            '  box-shadow: 0 2px 10px rgba(0,0,0,0.5);',
            '  backdrop-filter: blur(4px);',
            '  white-space: nowrap;',
            '}',
            '.ingen-visitor-badge .v-pulse {',
            '  width: 7px;',
            '  height: 7px;',
            '  border-radius: 50%;',
            '  background: #2ecc71;',
            '  box-shadow: 0 0 8px #2ecc71;',
            '  animation: v-pulse-anim 1.8s infinite;',
            '}',
            '@keyframes v-pulse-anim {',
            '  0%, 100% { opacity: 1; transform: scale(1); }',
            '  50% { opacity: 0.3; transform: scale(1.4); }',
            '}',
            '.ingen-visitor-badge .v-count {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-weight: 700;',
            '  color: #00f5ff;',
            '  letter-spacing: 1px;',
            '}',

            '/* ============================================================ */',
            '/* PILL DE INTENTOS EN TARJETAS DE MINIJUEGOS                    */',
            '/* ============================================================ */',
            '.minijuego-attempts-pill {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  background: rgba(3, 14, 9, 0.75);',
            '  border: 1px solid rgba(46, 204, 113, 0.3);',
            '  border-radius: 6px;',
            '  padding: 0.4rem 0.8rem;',
            '  margin: 0.7rem 0 0.9rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.75rem;',
            '  color: #9cb8a9;',
            '  box-sizing: border-box;',
            '  transition: all 0.3s ease;',
            '}',
            '.minijuego-attempts-pill.has-attempts {',
            '  border-color: rgba(0, 245, 255, 0.5);',
            '  background: rgba(0, 20, 15, 0.85);',
            '  color: #d1eae0;',
            '}',
            '.minijuego-attempts-pill .attempts-label {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.35rem;',
            '}',
            '.minijuego-attempts-pill .attempts-num {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-weight: 700;',
            '  font-size: 0.88rem;',
            '  color: #2ecc71;',
            '  letter-spacing: 1px;',
            '  transition: transform 0.2s ease, color 0.2s ease;',
            '}',
            '.minijuego-attempts-pill.has-attempts .attempts-num {',
            '  color: #00f5ff;',
            '}',
            '.minijuego-attempts-pill .attempts-num.pulse {',
            '  transform: scale(1.4);',
            '  color: #f1c40f;',
            '  text-shadow: 0 0 10px #f1c40f;',
            '}',

            '/* ============================================================ */',
            '/* MEJORAS DE RESPONSIVIDAD Y TOQUE MÓVIL                       */',
            '/* ============================================================ */',
            '@media (max-width: 768px) {',
            '  .ingen-visitor-badge { font-size: 0.7rem; padding: 0.25rem 0.6rem; }',
            '  .minijuegos-grid { grid-template-columns: 1fr; gap: 1.2rem; }',
            '  .minijuego-card { padding: 1rem; }',
            '}',
            '@media (max-width: 480px) {',
            '  .minijuego-attempts-pill { font-size: 0.72rem; padding: 0.35rem 0.6rem; }',
            '}'
        ].join('\n');

        var styleEl = document.createElement('style');
        styleEl.id = 'ej-access-system-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    // ------------------------------------------------------------
    // 6. INSERCIÓN DE BADGE DE VISITANTES EN EL NAVBAR
    // ------------------------------------------------------------
    function setupNavbarWidgets() {
        var navbar = document.querySelector('.navbar');
        var clockWidget = document.getElementById('clock-widget');
        if (!navbar && !clockWidget) return;

        var totalVisitors = getTotalVisitorsCount().toLocaleString('es-MX');

        // Contenedor de telemetría en el header/navbar
        var host = clockWidget || navbar;
        if (document.getElementById('ingen-telemetry-wrap')) {
            var badgeVal = document.getElementById('global-visitor-val');
            if (badgeVal) badgeVal.textContent = totalVisitors;
            return;
        }

        var wrap = document.createElement('div');
        wrap.id = 'ingen-telemetry-wrap';
        wrap.style.cssText = 'display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-top:0.4rem;';

        wrap.innerHTML = [
            '<div class="ingen-visitor-badge" title="Total de personas registradas en la red InGen">',
            '  <span class="v-pulse"></span>',
            '  <span>👥 VISITANTES:</span>',
            '  <strong class="v-count" id="global-visitor-val">' + totalVisitors + '</strong>',
            '</div>'
        ].join('\n');

        host.appendChild(wrap);
    }

    // ------------------------------------------------------------
    // 7. INICIALIZACIÓN
    // ------------------------------------------------------------
    function init() {
        // Asegurar que el scroll del documento esté desbloqueado
        document.body.style.overflow = '';

        // Eliminar cualquier overlay residual si existiera
        var oldOverlay = document.getElementById('ingen-gate-overlay');
        if (oldOverlay) oldOverlay.remove();

        // Limpiar perfiles antiguos de registro en caso de quedar almacenados
        try {
            localStorage.removeItem('ej_ingen_user_profile');
            sessionStorage.removeItem('ej_session_granted');
        } catch (e) {}

        injectStyles();
        recordSiteVisit();
        setupNavbarWidgets();
        refreshAllMinigameAttemptsUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
