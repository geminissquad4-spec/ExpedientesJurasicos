/**
 * ============================================================
 * EXPEDIENTES JURÁSICOS - SISTEMA DE CONTROL DE ACCESO INGEN,
 * CONTADOR DE VISITANTES Y REGISTRO DE INTENTOS EN MINIJUEGOS
 * ============================================================
 *
 * Módulos:
 * 1. Modal de Identificación Obligatoria (Correo + Apodo)
 * 2. Contador de Personas que ingresan al sitio
 * 3. Contador de Intentos por cada minijuego en tiempo real
 * 4. Optimización para dispositivos móviles y pantallas táctiles
 */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CONFIGURACIÓN Y CONSTANTES
    // ------------------------------------------------------------
    var STORAGE_KEY_USER        = 'ej_ingen_user_profile';
    var STORAGE_KEY_ALL_USERS   = 'ej_ingen_all_visitors';
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
        'hibridacion-adn':      { name: 'Hibridación de ADN',              category: 'Caos en la Isla' },
        'captura-giganoto':     { name: 'Captura al Giganotosaurus',       category: 'Caos en la Isla' },
        'encontrando-quetza':   { name: '¡Encontrando al Quetzalcoatlus!', category: 'Caos en la Isla' }
    };

    // ------------------------------------------------------------
    // 2. GENERADOR DE EFECTOS SONOROS (WEB AUDIO API - ZERO ASSETS)
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

    function playAccessGrantedSound() {
        // Acorde tecno-militar ascendente InGen
        playBeep(440, 'triangle', 0.12, 0.2, 0.0);
        playBeep(554.37, 'triangle', 0.12, 0.2, 0.08);
        playBeep(659.25, 'triangle', 0.14, 0.25, 0.16);
        playBeep(880, 'sine', 0.35, 0.3, 0.24);
    }

    function playAccessDeniedSound() {
        playBeep(180, 'sawtooth', 0.2, 0.25, 0.0);
        playBeep(140, 'sawtooth', 0.3, 0.3, 0.15);
    }

    // ------------------------------------------------------------
    // 3. PERSISTENCIA Y MODELO DE DATOS
    // ------------------------------------------------------------
    function getUserProfile() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveUserProfile(profile) {
        try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
        } catch (e) {}
    }

    function clearUserProfile() {
        try {
            localStorage.removeItem(STORAGE_KEY_USER);
            sessionStorage.removeItem('ej_session_granted');
        } catch (e) {}
    }

    function getAllVisitorsList() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY_ALL_USERS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function recordVisitor(email, nickname) {
        var list = getAllVisitorsList();
        var normalizedEmail = String(email).trim().toLowerCase();
        var normalizedNick = String(nickname).trim();
        var foundIndex = -1;

        for (var i = 0; i < list.length; i++) {
            if (list[i].email && list[i].email.toLowerCase() === normalizedEmail) {
                foundIndex = i;
                break;
            }
        }

        var now = Date.now();
        var isNewPerson = false;

        if (foundIndex === -1) {
            list.push({
                email: normalizedEmail,
                nickname: normalizedNick,
                firstSeen: now,
                lastSeen: now,
                visitCount: 1
            });
            isNewPerson = true;
        } else {
            list[foundIndex].nickname = normalizedNick;
            list[foundIndex].lastSeen = now;
            list[foundIndex].visitCount = (list[foundIndex].visitCount || 1) + 1;
        }

        try {
            localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(list));
        } catch (e) {}

        // Incrementar visitas totales
        var totalVis = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_VIS) || '0', 10);
        totalVis++;
        try {
            localStorage.setItem(STORAGE_KEY_TOTAL_VIS, String(totalVis));
        } catch (e) {}

        return { isNewPerson: isNewPerson, totalPersons: list.length };
    }

    function getUniqueVisitorsCount() {
        var list = getAllVisitorsList();
        return BASELINE_VISITORS + list.length;
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
    // 5. ESTILOS CSS INYECTADOS (MODAL DE ACCESO + VISITOR BADGE + INTENTOS)
    // ------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('ej-access-system-styles')) return;

        var css = [
            '/* ============================================================ */',
            '/* ESTILOS DEL SISTEMA DE ACCESO INGEN Y VISITANTES             */',
            '/* ============================================================ */',

            '/* OVERLAY DE ACCESO / GATEKEEPER */',
            '#ingen-gate-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  z-index: 999999;',
            '  background: radial-gradient(circle at center, rgba(5, 20, 14, 0.98) 0%, rgba(1, 8, 5, 0.99) 100%);',
            '  backdrop-filter: blur(12px);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 1rem;',
            '  box-sizing: border-box;',
            '  font-family: "Orbitron", sans-serif;',
            '  color: #fff;',
            '  opacity: 1;',
            '  transition: opacity 0.4s ease, visibility 0.4s ease;',
            '  touch-action: pan-y;',
            '  overscroll-behavior: contain;',
            '}',
            '#ingen-gate-overlay.hidden {',
            '  opacity: 0;',
            '  visibility: hidden;',
            '  pointer-events: none;',
            '}',

            '/* TARJETA CENTRAL DE SEGURIDAD */',
            '.ingen-gate-card {',
            '  background: linear-gradient(145deg, rgba(8, 28, 18, 0.95), rgba(3, 15, 9, 0.98));',
            '  border: 1.5px solid rgba(46, 204, 113, 0.5);',
            '  border-radius: 12px;',
            '  box-shadow: 0 0 50px rgba(46, 204, 113, 0.25), 0 20px 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(46, 204, 113, 0.08);',
            '  max-width: 520px;',
            '  width: 100%;',
            '  padding: 2rem 2.2rem;',
            '  box-sizing: border-box;',
            '  position: relative;',
            '  overflow: hidden;',
            '}',
            '.ingen-gate-card::before {',
            '  content: "";',
            '  position: absolute;',
            '  top: 0; left: 0; right: 0; height: 3px;',
            '  background: linear-gradient(90deg, #00f5ff, #2ecc71, #f39c12, #e74c3c);',
            '}',

            '/* HEADER DEL MODAL */',
            '.ingen-gate-header {',
            '  text-align: center;',
            '  margin-bottom: 1.5rem;',
            '}',
            '.ingen-gate-logo {',
            '  width: 70px;',
            '  height: 70px;',
            '  border-radius: 50%;',
            '  object-fit: cover;',
            '  border: 2px solid #2ecc71;',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);',
            '  margin-bottom: 0.8rem;',
            '}',
            '.ingen-gate-title {',
            '  font-size: 1.25rem;',
            '  font-weight: 900;',
            '  color: #00f5ff;',
            '  letter-spacing: 2px;',
            '  text-shadow: 0 0 12px rgba(0, 245, 255, 0.6);',
            '  margin-bottom: 0.3rem;',
            '}',
            '.ingen-gate-subtitle {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.78rem;',
            '  color: #2ecc71;',
            '  letter-spacing: 1.5px;',
            '  text-transform: uppercase;',
            '}',
            '.ingen-gate-desc {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.82rem;',
            '  color: #a4c2b2;',
            '  line-height: 1.5;',
            '  margin: 0.8rem 0 1.2rem;',
            '  text-align: center;',
            '  background: rgba(0, 20, 10, 0.5);',
            '  padding: 0.6rem 0.8rem;',
            '  border-left: 3px solid #2ecc71;',
            '  border-radius: 4px;',
            '}',

            '/* FORMULARIO Y CAMPOS */',
            '.ingen-gate-form {',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 1.1rem;',
            '}',
            '.ingen-field-group {',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 0.4rem;',
            '}',
            '.ingen-field-label {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.76rem;',
            '  font-weight: 700;',
            '  color: #2ecc71;',
            '  letter-spacing: 1px;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.4rem;',
            '}',
            '.ingen-field-input {',
            '  background: rgba(3, 14, 9, 0.85);',
            '  border: 1.5px solid rgba(46, 204, 113, 0.4);',
            '  border-radius: 6px;',
            '  padding: 0.85rem 1rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.95rem;',
            '  color: #fff;',
            '  outline: none;',
            '  box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);',
            '  transition: all 0.25s ease;',
            '  touch-action: manipulation;',
            '}',
            '.ingen-field-input:focus {',
            '  border-color: #00f5ff;',
            '  box-shadow: 0 0 16px rgba(0, 245, 255, 0.5), inset 0 2px 8px rgba(0,0,0,0.7);',
            '}',
            '.ingen-field-input::placeholder {',
            '  color: rgba(160, 190, 175, 0.45);',
            '}',

            '/* BOTÓN DE ACCESO */',
            '.ingen-gate-submit {',
            '  background: linear-gradient(135deg, #2ecc71, #27ae60);',
            '  color: #031409;',
            '  border: none;',
            '  border-radius: 6px;',
            '  padding: 0.95rem 1.4rem;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.92rem;',
            '  font-weight: 900;',
            '  letter-spacing: 1.8px;',
            '  cursor: pointer;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 0.6rem;',
            '  box-shadow: 0 4px 20px rgba(46, 204, 113, 0.5);',
            '  transition: all 0.25s ease;',
            '  margin-top: 0.4rem;',
            '  touch-action: manipulation;',
            '}',
            '.ingen-gate-submit:hover {',
            '  background: linear-gradient(135deg, #00f5ff, #00d2d3);',
            '  color: #001f24;',
            '  transform: translateY(-2px);',
            '  box-shadow: 0 6px 25px rgba(0, 245, 255, 0.6);',
            '}',
            '.ingen-gate-submit:active {',
            '  transform: translateY(0);',
            '}',

            '/* MENSAJE DE FEEDBACK */',
            '.ingen-gate-feedback {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.8rem;',
            '  padding: 0.6rem 0.8rem;',
            '  border-radius: 4px;',
            '  display: none;',
            '  margin-top: 0.6rem;',
            '  text-align: center;',
            '}',
            '.ingen-gate-feedback.error {',
            '  display: block;',
            '  background: rgba(231, 76, 60, 0.15);',
            '  border: 1px solid #e74c3c;',
            '  color: #ff6b6b;',
            '}',
            '.ingen-gate-feedback.success {',
            '  display: block;',
            '  background: rgba(46, 204, 113, 0.15);',
            '  border: 1px solid #2ecc71;',
            '  color: #2ecc71;',
            '}',

            '/* MODO OPERATIVO YA CONOCIDO (WELCOME BACK) */',
            '.ingen-welcome-box {',
            '  background: rgba(0, 25, 15, 0.7);',
            '  border: 1.5px solid rgba(0, 245, 255, 0.4);',
            '  border-radius: 8px;',
            '  padding: 1.2rem;',
            '  text-align: center;',
            '  margin-bottom: 1.2rem;',
            '}',
            '.ingen-wb-badge {',
            '  display: inline-block;',
            '  background: rgba(0, 245, 255, 0.15);',
            '  color: #00f5ff;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.72rem;',
            '  padding: 0.2rem 0.6rem;',
            '  border-radius: 3px;',
            '  letter-spacing: 1px;',
            '  margin-bottom: 0.6rem;',
            '}',
            '.ingen-wb-nick {',
            '  font-size: 1.2rem;',
            '  font-weight: 800;',
            '  color: #fff;',
            '  margin-bottom: 0.25rem;',
            '}',
            '.ingen-wb-email {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.82rem;',
            '  color: #8da698;',
            '}',
            '.ingen-wb-actions {',
            '  display: flex;',
            '  gap: 0.8rem;',
            '  margin-top: 1rem;',
            '}',
            '.ingen-wb-btn-primary {',
            '  flex: 2;',
            '  background: linear-gradient(135deg, #00f5ff, #00b4d8);',
            '  color: #001a24;',
            '  border: none;',
            '  border-radius: 6px;',
            '  padding: 0.85rem;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.85rem;',
            '  font-weight: 800;',
            '  cursor: pointer;',
            '  letter-spacing: 1.2px;',
            '  box-shadow: 0 4px 15px rgba(0, 245, 255, 0.4);',
            '  transition: all 0.2s;',
            '}',
            '.ingen-wb-btn-secondary {',
            '  flex: 1;',
            '  background: rgba(231, 76, 60, 0.15);',
            '  border: 1px solid rgba(231, 76, 60, 0.5);',
            '  color: #ff7675;',
            '  border-radius: 6px;',
            '  padding: 0.85rem 0.5rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.78rem;',
            '  cursor: pointer;',
            '  transition: all 0.2s;',
            '}',

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

            '/* BADGE DE AGENTE ACTIVO EN NAVBAR */',
            '.ingen-agent-pill {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '  background: rgba(0, 30, 20, 0.9);',
            '  border: 1px solid rgba(0, 245, 255, 0.4);',
            '  border-radius: 20px;',
            '  padding: 0.32rem 0.85rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.76rem;',
            '  color: #fff;',
            '  box-shadow: 0 2px 10px rgba(0,0,0,0.5);',
            '  white-space: nowrap;',
            '}',
            '.ingen-agent-nick {',
            '  color: #00f5ff;',
            '  font-weight: 700;',
            '}',
            '.ingen-btn-switch {',
            '  background: transparent;',
            '  border: none;',
            '  color: #e74c3c;',
            '  font-size: 0.72rem;',
            '  cursor: pointer;',
            '  padding: 0 0.2rem;',
            '  margin-left: 0.2rem;',
            '  opacity: 0.8;',
            '  transition: opacity 0.2s;',
            '}',
            '.ingen-btn-switch:hover { opacity: 1; text-decoration: underline; }',

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
            '  .ingen-gate-card {',
            '    padding: 1.5rem 1.2rem;',
            '    max-width: 95vw;',
            '  }',
            '  .ingen-gate-title { font-size: 1.1rem; }',
            '  .ingen-gate-subtitle { font-size: 0.7rem; }',
            '  .ingen-gate-desc { font-size: 0.75rem; padding: 0.5rem; }',
            '  .ingen-field-input { font-size: 0.9rem; padding: 0.75rem 0.85rem; }',
            '  .ingen-gate-submit { font-size: 0.82rem; padding: 0.85rem; }',
            '  .ingen-visitor-badge, .ingen-agent-pill { font-size: 0.7rem; padding: 0.25rem 0.6rem; }',
            '  .minijuegos-grid { grid-template-columns: 1fr; gap: 1.2rem; }',
            '  .minijuego-card { padding: 1rem; }',
            '}',
            '@media (max-width: 480px) {',
            '  .ingen-wb-actions { flex-direction: column; }',
            '  .minijuego-attempts-pill { font-size: 0.72rem; padding: 0.35rem 0.6rem; }',
            '}'
        ].join('\n');

        var styleEl = document.createElement('style');
        styleEl.id = 'ej-access-system-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    // ------------------------------------------------------------
    // 6. CREACIÓN Y GESTIÓN DEL MODAL DE ACCESO (GATEKEEPER)
    // ------------------------------------------------------------
    var gateOverlay = null;

    function buildGatekeeperModal() {
        if (document.getElementById('ingen-gate-overlay')) return;

        gateOverlay = document.createElement('div');
        gateOverlay.id = 'ingen-gate-overlay';

        var existingUser = getUserProfile();

        renderGatekeeperContent(existingUser);
        document.body.appendChild(gateOverlay);
    }

    function renderGatekeeperContent(existingUser) {
        if (!gateOverlay) return;

        var totalVisitors = getUniqueVisitorsCount();
        var visitorsFormatted = totalVisitors.toLocaleString('es-MX');

        var html = [
            '<div class="ingen-gate-card">',
            '  <div class="ingen-gate-header">',
            '    <img class="ingen-gate-logo" src="Expedientes%20Jur%C3%A1sicos%20logo.jpg" onerror="this.src=\'logo.jpg\';" alt="InGen" />',
            '    <div class="ingen-gate-title">EXPEDIENTES JURÁSICOS</div>',
            '    <div class="ingen-gate-subtitle">SISTEMA DE CONTROL DE ACCESO PERIMETRAL</div>',
            '  </div>'
        ];

        if (existingUser && existingUser.nickname && existingUser.email) {
            // Caso: El usuario ya se había identificado previamente
            html.push(
                '<div class="ingen-welcome-box">',
                '  <div class="ingen-wb-badge">CREDENCIAL DETECTADA EN TERMINAL</div>',
                '  <div class="ingen-wb-nick">Agente ' + escapeHtml(existingUser.nickname) + '</div>',
                '  <div class="ingen-wb-email">' + escapeHtml(existingUser.email) + '</div>',
                '  <div class="ingen-wb-actions">',
                '    <button class="ingen-wb-btn-primary" id="ingen-wb-confirm-btn">▶ CONTINUAR COMO ' + escapeHtml(existingUser.nickname.toUpperCase()) + '</button>',
                '    <button class="ingen-wb-btn-secondary" id="ingen-wb-switch-btn">🔄 CAMBIAR</button>',
                '  </div>',
                '</div>'
            );
        } else {
            // Caso: Registro inicial / Usuario nuevo
            html.push(
                '<div class="ingen-gate-desc">',
                '  Identificación obligatoria para ingresar a los archivos desclasificados de InGen y simuladores tácticos de campo.',
                '</div>',
                '<form class="ingen-gate-form" id="ingen-gate-form" onsubmit="return false;">',
                '  <div class="ingen-field-group">',
                '    <label class="ingen-field-label" for="ingen-gate-email">📧 CORREO ELECTRÓNICO (OBLIGATORIO)</label>',
                '    <input class="ingen-field-input" type="email" id="ingen-gate-email" placeholder="operativo@ingen-security.com" required autocomplete="email" />',
                '  </div>',
                '  <div class="ingen-field-group">',
                '    <label class="ingen-field-label" for="ingen-gate-nickname">👤 APODO / CLAVE DE OPERATIVO (OBLIGATORIO)</label>',
                '    <input class="ingen-field-input" type="text" id="ingen-gate-nickname" placeholder="Ej: Operativo_Grant, Ian_Chaos, Hunter_01..." maxlength="25" required autocomplete="nickname" />',
                '  </div>',
                '  <button class="ingen-gate-submit" type="submit" id="ingen-gate-submit-btn">',
                '    ▶ AUTORIZAR CREDENCIAL E INGRESAR',
                '  </button>',
                '  <div class="ingen-gate-feedback" id="ingen-gate-feedback"></div>',
                '</form>'
            );
        }

        html.push(
            '  <div style="margin-top:1.2rem; text-align:center; font-family:\'Share Tech Mono\',monospace; font-size:0.73rem; color:#607868; display:flex; align-items:center; justify-content:center; gap:0.5rem;">',
            '    <span style="color:#2ecc71;">●</span> Personas que han ingresado al sitio: <strong style="color:#00f5ff; font-family:\'Orbitron\',sans-serif;">' + visitorsFormatted + '</strong>',
            '  </div>',
            '</div>'
        );

        gateOverlay.innerHTML = html.join('\n');
        attachGateEvents();
    }

    function attachGateEvents() {
        var form = document.getElementById('ingen-gate-form');
        var submitBtn = document.getElementById('ingen-gate-submit-btn');
        var confirmBtn = document.getElementById('ingen-wb-confirm-btn');
        var switchBtn = document.getElementById('ingen-wb-switch-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                var profile = getUserProfile();
                if (profile) {
                    grantAccess(profile.email, profile.nickname);
                }
            });
        }

        if (switchBtn) {
            switchBtn.addEventListener('click', function () {
                clearUserProfile();
                renderGatekeeperContent(null);
            });
        }

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit();
            });
        }

        if (submitBtn && form) {
            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handleFormSubmit();
            });
        }
    }

    function handleFormSubmit() {
        var emailInput = document.getElementById('ingen-gate-email');
        var nickInput = document.getElementById('ingen-gate-nickname');
        var feedback = document.getElementById('ingen-gate-feedback');

        var email = emailInput ? emailInput.value.trim() : '';
        var nick = nickInput ? nickInput.value.trim() : '';

        // Validaciones
        if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
            showFeedback('⚠️ Por favor ingresa un correo electrónico válido (ejemplo: agente@ingen.com).', 'error');
            playAccessDeniedSound();
            if (emailInput) emailInput.focus();
            return;
        }

        if (!nick || nick.length < 2) {
            showFeedback('⚠️ Por favor ingresa un apodo o alias de operativo de al menos 2 caracteres.', 'error');
            playAccessDeniedSound();
            if (nickInput) nickInput.focus();
            return;
        }

        grantAccess(email, nick);
    }

    function showFeedback(msg, type) {
        var fb = document.getElementById('ingen-gate-feedback');
        if (!fb) return;
        fb.textContent = msg;
        fb.className = 'ingen-gate-feedback ' + (type || 'error');
        fb.style.display = 'block';
    }

    function grantAccess(email, nickname) {
        // Registrar o actualizar visitante
        var rec = recordVisitor(email, nickname);

        // Guardar perfil actual
        var profile = {
            email: email,
            nickname: nickname,
            loginTime: Date.now()
        };
        saveUserProfile(profile);
        sessionStorage.setItem('ej_session_granted', 'true');

        // Efectos sonoros y visuales
        playAccessGrantedSound();
        showFeedback('✅ CREDENCIALES VALIDADAS — BIENVENIDO OPERATIVO ' + nickname.toUpperCase(), 'success');

        // Actualizar badges en navbar
        updateNavbarBadges(nickname);

        setTimeout(function () {
            if (gateOverlay) {
                gateOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 750);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .split('&').join('&amp;')
            .split('<').join('&lt;')
            .split('>').join('&gt;')
            .split('"').join('&quot;')
            .split("'").join('&#39;');
    }

    // ------------------------------------------------------------
    // 7. INSERCIÓN DE BADGES EN EL NAVBAR Y HERO
    // ------------------------------------------------------------
    function updateNavbarBadges(nickname) {
        var totalVisitors = getUniqueVisitorsCount().toLocaleString('es-MX');

        // Actualizar o crear badge de visitantes
        var visitorVal = document.getElementById('global-visitor-val');
        if (visitorVal) {
            visitorVal.textContent = totalVisitors;
        }

        // Actualizar o crear badge de agente activo
        var agentNick = document.getElementById('ingen-agent-nick-val');
        if (agentNick) {
            agentNick.textContent = nickname || 'Operativo';
        }
    }

    function setupNavbarWidgets() {
        var navbar = document.querySelector('.navbar');
        var clockWidget = document.getElementById('clock-widget');
        if (!navbar && !clockWidget) return;

        var profile = getUserProfile();
        var currentNick = profile ? profile.nickname : 'Operativo';
        var totalVisitors = getUniqueVisitorsCount().toLocaleString('es-MX');

        // Contenedor de telemetría en el header/navbar
        var host = clockWidget || navbar;
        if (document.getElementById('ingen-telemetry-wrap')) return;

        var wrap = document.createElement('div');
        wrap.id = 'ingen-telemetry-wrap';
        wrap.style.cssText = 'display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-top:0.4rem;';

        wrap.innerHTML = [
            '<div class="ingen-visitor-badge" title="Total de personas registradas en la red InGen">',
            '  <span class="v-pulse"></span>',
            '  <span>👥 VISITANTES:</span>',
            '  <strong class="v-count" id="global-visitor-val">' + totalVisitors + '</strong>',
            '</div>',
            '<div class="ingen-agent-pill" title="Credencial InGen activa">',
            '  <span>🪪</span>',
            '  <span class="ingen-agent-nick" id="ingen-agent-nick-val">' + escapeHtml(currentNick) + '</span>',
            '  <button class="ingen-btn-switch" id="ingen-btn-reopen-gate" title="Cambiar usuario / Ingresar con otra credencial">🔄 Cambiar</button>',
            '</div>'
        ].join('\n');

        host.appendChild(wrap);

        var switchBtn = document.getElementById('ingen-btn-reopen-gate');
        if (switchBtn) {
            switchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (gateOverlay) {
                    renderGatekeeperContent(getUserProfile());
                    gateOverlay.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }

    // ------------------------------------------------------------
    // 8. INICIALIZACIÓN
    // ------------------------------------------------------------
    function init() {
        injectStyles();

        var profile = getUserProfile();
        var isSessionGranted = sessionStorage.getItem('ej_session_granted') === 'true';

        buildGatekeeperModal();
        setupNavbarWidgets();
        refreshAllMinigameAttemptsUI();

        if (profile && isSessionGranted) {
            // Ya validado en esta sesión, ocultar gate
            if (gateOverlay) {
                gateOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        } else {
            // Obligar a identificarse antes de acceder
            if (gateOverlay) {
                gateOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
