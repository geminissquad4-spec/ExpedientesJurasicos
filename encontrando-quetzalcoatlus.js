/* ============================================================
   EXPEDIENTES JURÁSICOS - CAOS EN LA ISLA
   MINIJUEGO: ¡ENCONTRANDO AL QUETZALCOATLUS!
   Recinto de Pterosaurios en Isla Matanceros - Ed y su Equipo
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CONFIGURACIÓN Y CONSTANTES
    // ------------------------------------------------------------
    var VW = 1280; // Ancho virtual del lienzo
    var VH = 720;  // Alto virtual del lienzo
    var TOTAL_LEVELS = 4; // 4 niveles: 1, 2, 3 y 4 Quetzalcoatlus

    // Configuración por nivel
    var LEVEL_CONFIGS = [
        { level: 1, modelsCount: 1, brunchesCount: 7,  timeLimit: 10.0, name: "FASE 1: RASTREO INICIAL" },
        { level: 2, modelsCount: 2, brunchesCount: 11, timeLimit: 10.0, name: "FASE 2: PAREJA DE VIGÍAS" },
        { level: 3, modelsCount: 3, brunchesCount: 15, timeLimit: 10.0, name: "FASE 3: NIDADA EN LA ARBOLEDA" },
        { level: 4, modelsCount: 4, brunchesCount: 19, timeLimit: 10.0, name: "FASE 4: BANDADA PRINCIPAL" }
    ];

    // Dimensiones y aspectos de sprites
    var MODEL_ASPECT = 251 / 449;    // ~0.559
    var BRUNCH_ASPECT = 1340 / 2400; // ~0.558
    var FLY_ASPECT = 2400 / 1340;    // ~1.791

    // ------------------------------------------------------------
    // 2. ESTADO DEL JUEGO
    // ------------------------------------------------------------
    var state = 'briefing'; // 'briefing', 'playing', 'level_cleared', 'flying', 'level_transition', 'attack', 'won', 'lost'
    var currentLevelIdx = 0; // 0 a 3 (Nivel 1 a 4)
    var timeLeft = 10.0;     // Segundos restantes en el nivel
    var attemptsLeft = 5;    // Vidas restantes (5 vidas)
    var entities = [];       // Lista combinada de Quetza Models y Quetza Brunches
    var spottedCount = 0;    // Modelos encontrados en el nivel actual
    var isLevelTransitioning = false; // Candado para evitar saltos múltiples de nivel

    // Temporizadores de efectos y cinemáticas
    var flyingTimer = 0;     // Duración de la animación de vuelo
    var screenFlashAlpha = 0;
    var shakeTimer = 0;
    var shakeIntensity = 0;
    var attackTimer = 0;
    var levelBannerTimer = 0; // Mostrar título al iniciar cada nivel

    // Efectos visuales interactivos (retículas de fijación, fallos, partículas)
    var markers = [];        // Marcas de acierto y fallo
    var windParticles = [];  // Hojas y viento al emprender vuelo

    // ------------------------------------------------------------
    // 3. ELEMENTOS DOM Y CANVAS
    // ------------------------------------------------------------
    var overlay = null;
    var canvas = null;
    var ctx = null;
    var scale = 1;
    var animFrameId = null;
    var lastTimestamp = 0;

    // ------------------------------------------------------------
    // 4. GESTIÓN DE ASSETS (IMÁGENES Y AUDIOS)
    // ------------------------------------------------------------
    var imageCache = {};
    var audioCtx = null;
    var sndMusic = null;
    var sndRoar = null;
    var isMuted = false;
    var isPaused = false;

    function getImage(filename) {
        if (imageCache[filename]) return imageCache[filename];
        var img = new Image();
        img.src = filename;
        img.onerror = function () {
            if (img.src.indexOf('ENCONTRANDO AL QUETZALCOATLUS/') === -1) {
                img.src = 'ENCONTRANDO AL QUETZALCOATLUS/' + filename;
            }
        };
        imageCache[filename] = img;
        return img;
    }

    // Precarga de recursos gráficos
    var preloadList = [
        'Capa 1.jpg',
        'Capa 2.png',
        'Capa 3.png',
        'Quetza Model.png',
        'Quetza Brunch.png',
        'Quetza Fly.png',
        'Quetza Attack.png',
        'ENCONTRANDO AL QUETZALCOATLUS.jpg'
    ];
    preloadList.forEach(getImage);

    // Sistema de Audio Web + Sintetizador
    function initAudio() {
        if (!audioCtx) {
            try {
                var AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            } catch (e) {}
        }

        if (!sndMusic) {
            sndMusic = new Audio();
            sndMusic.src = 'Quetza Paddock.mp4';
            sndMusic.loop = true;
            sndMusic.volume = 0.50;
            sndMusic.onerror = function () {
                if (sndMusic.src.indexOf('ENCONTRANDO AL QUETZALCOATLUS/') === -1) {
                    sndMusic.src = 'ENCONTRANDO AL QUETZALCOATLUS/Quetza Paddock.mp4';
                }
            };
        }

        if (!sndRoar) {
            sndRoar = new Audio();
            sndRoar.src = 'Quetzalcoatlus Roarr.mp4';
            sndRoar.onerror = function () {
                if (sndRoar.src.indexOf('ENCONTRANDO AL QUETZALCOATLUS/') === -1) {
                    sndRoar.src = 'ENCONTRANDO AL QUETZALCOATLUS/Quetzalcoatlus Roarr.mp4';
                }
            };
        }
    }

    function playTone(freq, duration, type, vol) {
        if (isMuted) return;
        if (!audioCtx) initAudio();
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            var v = (vol !== undefined ? vol : 0.22);
            gain.gain.setValueAtTime(v, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duration || 0.25));
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (duration || 0.25));
        } catch (e) {}
    }

    function playSpotSound() {
        // Tono afirmativo de fijación de blanco
        playTone(587.33, 0.15, 'triangle', 0.28);
        setTimeout(function () {
            playTone(880.00, 0.28, 'sine', 0.35);
        }, 80);
    }

    function playMissSound() {
        // Sonido de rama seca quebrándose / fallo
        playTone(164.81, 0.22, 'sawtooth', 0.32);
        setTimeout(function () {
            playTone(110.00, 0.30, 'sawtooth', 0.35);
        }, 70);
    }

    function playTickWarning() {
        // Pulso tenso cuando queda poco tiempo
        playTone(659.25, 0.08, 'sine', 0.18);
    }

    function playRoarAudio(fullVolume) {
        if (isMuted || !sndRoar) return;
        try {
            sndRoar.volume = fullVolume ? 1.0 : 0.75;
            sndRoar.currentTime = 0;
            sndRoar.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        if (sndRoar) {
            try { sndRoar.pause(); sndRoar.currentTime = 0; } catch (e) {}
        }
    }

    // ------------------------------------------------------------
    // 5. ESTILOS CSS E INTERFAZ DOM
    // ------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('eq-game-styles')) return;
        var style = document.createElement('style');
        style.id = 'eq-game-styles';
        style.textContent = [
            '#eq-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  z-index: 100000;',
            '  background: #020604;',
            '  display: none;',
            '  flex-direction: column;',
            '  overflow: hidden;',
            '  font-family: "Share Tech Mono", monospace;',
            '  user-select: none;',
            '  -webkit-user-select: none;',
            '}',
            '#eq-overlay.open { display: flex; }',
            '',
            '/* Encabezado Táctico */',
            '#eq-header {',
            '  flex-shrink: 0;',
            '  height: 52px;',
            '  background: linear-gradient(180deg, rgba(6, 20, 14, 0.98), rgba(3, 10, 7, 0.95));',
            '  border-bottom: 2px solid rgba(46, 204, 113, 0.45);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 0 1rem;',
            '  box-shadow: 0 2px 18px rgba(0,0,0,0.85);',
            '  z-index: 20;',
            '}',
            '.eq-header-left { display: flex; align-items: center; gap: 0.8rem; }',
            '.eq-logo-badge {',
            '  background: #27ae60;',
            '  color: #03140a;',
            '  font-weight: 900;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  letter-spacing: 1.5px;',
            '  padding: 3px 8px;',
            '  border-radius: 3px;',
            '  box-shadow: 0 0 10px rgba(46, 204, 113, 0.6);',
            '}',
            '.eq-header-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.95rem;',
            '  font-weight: 700;',
            '  color: #f1f2f6;',
            '  letter-spacing: 1.5px;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '}',
            '.eq-header-status {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 1.2rem;',
            '}',
            '.eq-hud-chip {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '  background: rgba(255,255,255,0.05);',
            '  border: 1px solid rgba(255,255,255,0.15);',
            '  border-radius: 4px;',
            '  padding: 4px 10px;',
            '  font-size: 0.82rem;',
            '}',
            '.eq-hud-timer-wrap {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 6px;',
            '  background: rgba(0,0,0,0.5);',
            '  border: 1px solid rgba(46,204,113,0.35);',
            '  padding: 3px 10px;',
            '  border-radius: 4px;',
            '  min-width: 130px;',
            '}',
            '#eq-timer-bar {',
            '  width: 65px;',
            '  height: 8px;',
            '  background: rgba(255,255,255,0.15);',
            '  border-radius: 4px;',
            '  overflow: hidden;',
            '}',
            '#eq-timer-fill {',
            '  height: 100%;',
            '  width: 100%;',
            '  background: #2ecc71;',
            '  transition: width 0.1s linear, background-color 0.2s;',
            '}',
            '.eq-header-btns { display: flex; align-items: center; gap: 0.5rem; }',
            '.eq-tool-btn {',
            '  background: rgba(255,255,255,0.08);',
            '  border: 1px solid rgba(255,255,255,0.2);',
            '  color: #ecf0f1;',
            '  padding: 5px 10px;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.78rem;',
            '  transition: all 0.2s;',
            '}',
            '.eq-tool-btn:hover {',
            '  background: rgba(46, 204, 113, 0.3);',
            '  border-color: #2ecc71;',
            '  color: #fff;',
            '}',
            '.eq-close-btn {',
            '  background: rgba(231, 76, 60, 0.25);',
            '  border: 1px solid #e74c3c;',
            '  color: #ff6b6b;',
            '  padding: 5px 12px;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  font-weight: 700;',
            '  font-size: 0.85rem;',
            '}',
            '.eq-close-btn:hover {',
            '  background: #e74c3c;',
            '  color: #fff;',
            '  box-shadow: 0 0 12px rgba(231,76,60,0.8);',
            '}',
            '',
            '/* Contenedor del Lienzo */',
            '#eq-canvas-wrap {',
            '  flex: 1;',
            '  position: relative;',
            '  overflow: hidden;',
            '  background: #000;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  touch-action: none;',
            '  cursor: crosshair;',
            '}',
            '#eq-canvas {',
            '  display: block;',
            '  box-shadow: 0 0 40px rgba(0,0,0,0.9);',
            '}',
            '',
            '/* Modales (Briefing, Victoria, Derrota) */',
            '.eq-modal {',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(2, 8, 5, 0.92);',
            '  backdrop-filter: blur(10px);',
            '  display: none;',
            '  align-items: center;',
            '  justify-content: center;',
            '  flex-direction: column;',
            '  padding: 1.5rem;',
            '  z-index: 50;',
            '  text-align: center;',
            '}',
            '.eq-modal.show { display: flex; animation: eq-modal-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }',
            '@keyframes eq-modal-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
            '.eq-modal-card {',
            '  background: linear-gradient(135deg, rgba(14, 30, 22, 0.98), rgba(6, 16, 12, 0.98));',
            '  border: 2px solid rgba(46, 204, 113, 0.6);',
            '  border-radius: 8px;',
            '  padding: 2rem 2.5rem;',
            '  max-width: 660px;',
            '  width: 92%;',
            '  box-shadow: 0 0 45px rgba(46, 204, 113, 0.4);',
            '}',
            '.eq-modal-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 1.45rem;',
            '  font-weight: 900;',
            '  letter-spacing: 2px;',
            '  color: #2ecc71;',
            '  margin-bottom: 0.8rem;',
            '  text-transform: uppercase;',
            '}',
            '.eq-modal-sub {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.88rem;',
            '  color: #cbd5e1;',
            '  line-height: 1.6;',
            '  margin-bottom: 1.5rem;',
            '  text-align: left;',
            '}',
            '.eq-modal-sub strong { color: #feca57; }',
            '.eq-rules-list {',
            '  background: rgba(0,0,0,0.4);',
            '  border-left: 3px solid #2ecc71;',
            '  padding: 0.8rem 1.2rem;',
            '  margin: 1rem 0;',
            '  border-radius: 0 6px 6px 0;',
            '  text-align: left;',
            '  font-size: 0.84rem;',
            '  color: #e2e8f0;',
            '}',
            '.eq-rules-list li { margin: 0.4rem 0; }',
            '.eq-modal-btn {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.95rem;',
            '  font-weight: 700;',
            '  letter-spacing: 1.5px;',
            '  padding: 0.85rem 2.5rem;',
            '  border: none;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  transition: all 0.25s;',
            '  text-transform: uppercase;',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.4);',
            '  background: linear-gradient(135deg, #27ae60, #2ecc71);',
            '  color: #03140a;',
            '}',
            '.eq-modal-btn:hover {',
            '  background: linear-gradient(135deg, #2ecc71, #55efc4);',
            '  box-shadow: 0 0 35px rgba(46, 204, 113, 0.7);',
            '  transform: scale(1.03);',
            '}',
            '.eq-modal-btn.red {',
            '  background: linear-gradient(135deg, #e74c3c, #c0392b);',
            '  color: #fff;',
            '  box-shadow: 0 0 20px rgba(231, 76, 60, 0.4);',
            '}',
            '.eq-modal-btn.red:hover {',
            '  background: linear-gradient(135deg, #ff6b6b, #e74c3c);',
            '  box-shadow: 0 0 35px rgba(255, 107, 107, 0.7);',
            '}',
            '',
            '/* Responsive Móviles */',
            '@media (max-width: 768px) {',
            '  #eq-header { height: 46px; padding: 0 0.5rem; }',
            '  .eq-header-title { font-size: 0.75rem; letter-spacing: 0.5px; }',
            '  .eq-logo-badge { font-size: 0.60rem; padding: 2px 5px; }',
            '  .eq-hud-chip { padding: 3px 6px; font-size: 0.70rem; }',
            '  .eq-modal-card { padding: 1.2rem; }',
            '  .eq-modal-title { font-size: 1.15rem; }',
            '  .eq-modal-sub { font-size: 0.78rem; }',
            '  .eq-rules-list { font-size: 0.75rem; padding: 0.5rem 0.8rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function buildOverlayDOM() {
        if (overlay) return;
        injectStyles();

        overlay = document.createElement('div');
        overlay.id = 'eq-overlay';

        // 1. Encabezado HUD
        var header = document.createElement('div');
        header.id = 'eq-header';
        header.innerHTML = [
            '<div class="eq-header-left">',
            '  <div class="eq-logo-badge">ISLA MATANCEROS</div>',
            '  <div class="eq-header-title">🪶 ¡ENCONTRANDO AL QUETZALCOATLUS!</div>',
            '</div>',
            '<div class="eq-header-status">',
            '  <div class="eq-hud-chip" id="eq-hud-level" style="color:#00d2d3;">NIVEL 1/4</div>',
            '  <div class="eq-hud-chip" id="eq-hud-targets" style="color:#feca57;">QUETZALS: 0/1</div>',
            '  <div class="eq-hud-chip" id="eq-hud-lives" style="color:#ff6b6b;">❤️❤️❤️❤️❤️ VIDAS: 5</div>',
            '  <div class="eq-hud-timer-wrap">',
            '    <span style="font-size:0.75rem; color:#aaa;">⏱</span>',
            '    <div id="eq-timer-bar"><div id="eq-timer-fill"></div></div>',
            '    <span id="eq-timer-text" style="font-weight:700; color:#2ecc71;">10.0s</span>',
            '  </div>',
            '</div>',
            '<div class="eq-header-btns ej-header-actions" id="eq-header-btns">',
            '  <button class="ej-btn-header" id="eq-btn-mute" title="Activar/Desactivar Sonido"><span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span></button>',
            '  <button class="ej-btn-header" id="eq-btn-pause" title="Pausar / Reanudar"><span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span></button>',
            '  <button class="ej-btn-header" id="eq-btn-full" title="Pantalla Completa"><span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span></button>',
            '  <button class="ej-btn-header ej-btn-header-danger" id="eq-btn-close" title="Cerrar"><span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span></button>',
            '</div>'
        ].join('');
        overlay.appendChild(header);

        // 2. Lienzo Canvas
        var canvasWrap = document.createElement('div');
        canvasWrap.id = 'eq-canvas-wrap';

        canvas = document.createElement('canvas');
        canvas.id = 'eq-canvas';
        canvasWrap.appendChild(canvas);
        ctx = canvas.getContext('2d');

        overlay.appendChild(canvasWrap);

        // 3. Modales
        // Briefing Modal
        var briefModal = document.createElement('div');
        briefModal.className = 'eq-modal show';
        briefModal.id = 'eq-modal-briefing';
        briefModal.innerHTML = [
            '<div class="cg-modal-card eq-modal-card">',
            '  <div class="eq-modal-title">🪶 EXPEDICIÓN EN ISLA MATANCEROS</div>',
            '  <div class="eq-modal-sub">',
            '    Ed y su equipo de biólogos han ingresado al recinto de contención del <strong>Quetzalcoatlus</strong>. La espesa vegetación oculta a estos gigantescos pterosaurios camuflados entre las ramas y troncos secos. Tu misión es localizarlos con tu visor antes de que noten tu presencia y te ataquen.',
            '  </div>',
            '  <ul class="eq-rules-list">',
            '    <li><strong>🎯 4 Niveles Progresivos:</strong> Nivel 1 (1 Quetzal), Nivel 2 (2 Quetzals), Nivel 3 (3 Quetzals) y Nivel 4 (4 Quetzals).</li>',
            '    <li><strong>🌿 Señuelos:</strong> Ignora los <em>Quetza Brunch</em> (ramas secas con forma de Quetzalcoatlus).</li>',
            '    <li><strong>⏱ Límite de Tiempo (10s):</strong> Dispones de 10 segundos en cada fase para localizar a los Quetzalcoatlus antes de que adviertan tu presencia.</li>',
            '    <li><strong>❤️ 5 Vidas:</strong> Si tocas ramas falsas o el entorno 5 veces, alertarás a la bandada y perderás.</li>',
            '    <li><strong>🦅 Vuelo y Progreso:</strong> Al encontrarlos, desplegarán sus alas (<em>Quetza Fly</em>), emitirán su bramido y emprenderán el vuelo. La pantalla parpadeará y pasarás al siguiente nivel.</li>',
            '  </ul>',
            '  <button class="eq-modal-btn" id="eq-btn-start">INICIAR EXPEDICIÓN ▶</button>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(briefModal);

        // Win Modal
        var winModal = document.createElement('div');
        winModal.className = 'eq-modal';
        winModal.id = 'eq-modal-win';
        winModal.innerHTML = [
            '<div class="eq-modal-card" style="border-color:#2ecc71; box-shadow:0 0 50px rgba(46,204,113,0.5);">',
            '  <div class="eq-modal-title" style="color:#2ecc71;">🏆 ¡EXPEDICIÓN EXITOSA!</div>',
            '  <div class="eq-modal-sub" style="text-align:center;">',
            '    ¡Impresionante agudeza visual! Ed y su equipo lograron rastrear y catalogar a los 4 Quetzalcoatlus a lo largo de los 4 niveles sin perturbar a la bandada. Los reyes del cielo han remontado el vuelo libremente sobre el dosel de la selva de Isla Matanceros.',
            '  </div>',
            '  <div class="ej-modal-actions">',
  '    <button class="ej-btn-replay" id="eq-btn-win-restart">↺ Volver a jugar</button>',
  '    <button class="ej-btn-return" id="eq-btn-win-return">✕ Regresar al sitio</button>',
  '  </div>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(winModal);

        // Lose Modal
        var loseModal = document.createElement('div');
        loseModal.className = 'eq-modal';
        loseModal.id = 'eq-modal-lose';
        loseModal.innerHTML = [
            '<div class="eq-modal-card" style="border-color:#e74c3c; box-shadow:0 0 50px rgba(231,76,60,0.5);">',
            '  <div class="eq-modal-title" style="color:#e74c3c;">☠️ ¡EL QUETZALCOATLUS TE HA ATACADO!</div>',
            '  <div class="eq-modal-sub" id="eq-lose-desc" style="text-align:center;">',
            '    El gigantesco pterosaurio se sintió amenazado por tus movimientos y se ha abalanzado furiosamente sobre el equipo.',
            '  </div>',
            '  <div class="ej-modal-actions">',
  '    <button class="ej-btn-replay" id="eq-btn-lose-restart">↺ Volver a jugar</button>',
  '    <button class="ej-btn-return" id="eq-btn-lose-return">✕ Regresar al sitio</button>',
  '  </div>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(loseModal);

        var pauseModal = document.createElement('div');
        pauseModal.className = 'ej-pause-overlay';
        pauseModal.id = 'eq-pause-screen';
        pauseModal.style.display = 'none';
        pauseModal.innerHTML = [
            '<div class="ej-pause-card">',
            '  <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>',
            '  <div class="ej-pause-sub">Expedición suspendida temporalmente</div>',
            '  <button class="ej-btn-resume" id="eq-btn-resume">▶ REANUDAR</button>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(pauseModal);


        document.body.appendChild(overlay);

        // Eventos de botones
        document.getElementById('eq-btn-close').addEventListener('click', closeGame);
        var eqWinRet = document.getElementById('eq-btn-win-return');
        if (eqWinRet) eqWinRet.addEventListener('click', closeGame);
        var eqLoseRet = document.getElementById('eq-btn-lose-return');
        if (eqLoseRet) eqLoseRet.addEventListener('click', closeGame);
        var eqPauseBtn = document.getElementById('eq-btn-pause');
        if (eqPauseBtn) eqPauseBtn.addEventListener('click', togglePause);
        var eqResumeBtn = document.getElementById('eq-btn-resume');
        if (eqResumeBtn) eqResumeBtn.addEventListener('click', togglePause);
        document.getElementById('eq-btn-start').addEventListener('click', startGame);
        document.getElementById('eq-btn-win-restart').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('encontrando-quetza');
            startGame();
        });
        document.getElementById('eq-btn-lose-restart').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('encontrando-quetza');
            startGame();
        });

        document.getElementById('eq-btn-mute').addEventListener('click', function () {
            isMuted = !isMuted;
            this.textContent = isMuted ? '🔇' : '🔊';
            if (isMuted) {
                if (sndMusic) sndMusic.pause();
                if (sndRoar) sndRoar.pause();
            } else {
                if (sndMusic && state !== 'briefing') sndMusic.play().catch(function () {});
            }
        });

        document.getElementById('eq-btn-full').addEventListener('click', toggleFullscreen);

        // Eventos táctiles y de ratón
        canvasWrap.addEventListener('mousedown', handlePointerDown);
        canvasWrap.addEventListener('touchstart', handleTouchStart, { passive: false });

        window.addEventListener('resize', resizeCanvas);

        // Tecla ESC para salir
        window.addEventListener('keydown', function (e) {
            if (!overlay || !overlay.classList.contains('open')) return;
            if (e.key === 'Escape') closeGame();
        });
    }

    function toggleFullscreen() {
        var target = overlay || document.documentElement;
        var btn = document.getElementById('eq-btn-full');
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (target.requestFullscreen) target.requestFullscreen().catch(function () {});
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            if (btn) btn.textContent = '🗗';
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            if (btn) btn.textContent = '⛶';
        }
    }

    // ------------------------------------------------------------
    // 6. GESTIÓN RESPONSIVA DEL LIENZO (16:9)
    // ------------------------------------------------------------
    function resizeCanvas() {
        if (!canvas) return;
        var wrap = document.getElementById('eq-canvas-wrap');
        if (!wrap) return;

        var ww = wrap.clientWidth || window.innerWidth;
        var wh = wrap.clientHeight || (window.innerHeight - 52);

        scale = Math.min(ww / VW, wh / VH);
        canvas.width = Math.round(VW * scale);
        canvas.height = Math.round(VH * scale);
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
    }

    // ------------------------------------------------------------
    // 7. GENERACIÓN ALEATORIA DE NIVELES Y ENTIDADES (+10% TAMAÑO)
    // ------------------------------------------------------------
    function spawnLevel(levelIdx) {
        currentLevelIdx = levelIdx;
        var cfg = LEVEL_CONFIGS[currentLevelIdx];
        timeLeft = cfg.timeLimit;
        spottedCount = 0;
        state = 'playing';
        isLevelTransitioning = false;
        levelBannerTimer = 2.0; // Mostrar banner de nivel al inicio
        entities = [];
        markers = [];
        windParticles = [];
        screenFlashAlpha = 0;

        // Puntos horizontales disponibles a lo largo del suelo (x entre 70 y 1140)
        var usedXs = [];

        function getNonOverlappingX() {
            for (var attempt = 0; attempt < 100; attempt++) {
                var candX = 70 + Math.random() * 1050;
                var ok = true;
                for (var i = 0; i < usedXs.length; i++) {
                    if (Math.abs(usedXs[i] - candX) < 72) { // Separación mínima ajustada (+20%)
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    usedXs.push(candX);
                    return candX;
                }
            }
            var fallbackX = 70 + Math.random() * 1050;
            usedXs.push(fallbackX);
            return fallbackX;
        }

        // 1. Generar Quetza Models reales (+15% de tamaño adicional)
        for (var m = 0; m < cfg.modelsCount; m++) {
            var mh = 297 + Math.random() * 46;
            var mw = Math.round(mh * MODEL_ASPECT);
            var mx = Math.round(getNonOverlappingX());
            var my = Math.round(315 + Math.random() * 45); // Al ras del suelo
            entities.push({
                type: 'model',
                id: 'model_' + m,
                x: mx,
                y: my,
                w: mw,
                h: mh,
                found: false,
                foundTime: 0,
                flyProgress: 0,
                flyX: mx,
                flyY: my,
                flyVx: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 140),
                flyVy: -(280 + Math.random() * 160)
            });
        }

        // 2. Generar Quetza Brunches falsos (+15% de tamaño adicional)
        for (var b = 0; b < cfg.brunchesCount; b++) {
            var bh = 290 + Math.random() * 53;
            var bw = Math.round(bh * BRUNCH_ASPECT);
            var bx = Math.round(getNonOverlappingX());
            var by = Math.round(310 + Math.random() * 45); // Al ras del suelo
            entities.push({
                type: 'brunch',
                id: 'brunch_' + b,
                x: bx,
                y: by,
                w: bw,
                h: bh,
                flip: Math.random() > 0.5
            });
        }

        entities.sort(function (a, b) {
            return (a.y + a.h) - (b.y + b.h);
        });

        updateHUD();
    }

    // ------------------------------------------------------------
    // 8. MANEJO DE ENTRADA TÁCTIL Y RATÓN
    // ------------------------------------------------------------
    function handlePointerDown(e) {
        if (state !== 'playing' || isLevelTransitioning) return;
        var rect = canvas.getBoundingClientRect();
        var vx = (e.clientX - rect.left) / scale;
        var vy = (e.clientY - rect.top) / scale;
        processClick(vx, vy);
    }

    function handleTouchStart(e) {
        if (state !== 'playing' || isLevelTransitioning) return;
        if (e.touches && e.touches.length > 0) {
            e.preventDefault();
            var rect = canvas.getBoundingClientRect();
            var vx = (e.touches[0].clientX - rect.left) / scale;
            var vy = (e.touches[0].clientY - rect.top) / scale;
            processClick(vx, vy);
        }
    }

    function processClick(vx, vy) {
        if (state !== 'playing' || isLevelTransitioning) return;

        // Comprobar si acertó sobre un Quetza Model no descubierto
        // Área de tolerancia táctil amigable (+16px)
        var hitModel = null;
        for (var i = entities.length - 1; i >= 0; i--) {
            var ent = entities[i];
            if (ent.type === 'model' && !ent.found) {
                var pad = 18;
                if (vx >= ent.x - pad && vx <= ent.x + ent.w + pad &&
                    vy >= ent.y - pad && vy <= ent.y + ent.h + pad) {
                    hitModel = ent;
                    break;
                }
            }
        }

        if (hitModel) {
            // ¡ACIERTO! Quetzalcoatlus real localizado
            hitModel.found = true;
            spottedCount++;
            playSpotSound();

            if (navigator.vibrate) {
                try { navigator.vibrate(60); } catch (e) {}
            }

            // Marcador visual de éxito
            markers.push({
                x: hitModel.x + hitModel.w / 2,
                y: hitModel.y + hitModel.h / 2,
                type: 'target_lock',
                life: 1.6,
                maxLife: 1.6
            });

            // Reiniciar el temporizador de 5 segundos para buscar al siguiente (si quedan en esta fase)
            var cfg = LEVEL_CONFIGS[currentLevelIdx];
            if (spottedCount < cfg.modelsCount) {
                timeLeft = cfg.timeLimit;
            }

            updateHUD();

            // ¿Se encontraron todos los Quetza Models del nivel?
            if (spottedCount >= cfg.modelsCount) {
                handleAllModelsFound();
            }
            return;
        }

        // Si no dio a un Quetza Model, comprobar si tocó un Quetza Brunch o el entorno (Fallo)
        handleMissClick(vx, vy);
    }

    function handleMissClick(vx, vy) {
        attemptsLeft--;
        playMissSound();
        shakeTimer = 0.25;
        shakeIntensity = 8;

        if (navigator.vibrate) {
            try { navigator.vibrate([40, 40, 40]); } catch (e) {}
        }

        // Marcador visual de fallo (Cruz roja con onda de choque)
        markers.push({
            x: vx,
            y: vy,
            type: 'miss',
            life: 1.0,
            maxLife: 1.0
        });

        updateHUD();

        // Si se agotaron los 3 intentos: derrota por alerta de bandada
        if (attemptsLeft <= 0) {
            triggerAttackGameOver('¡ALERTA PERIMETRAL! Agotaste tus 5 vidas. El ruido de las ramas secas alertó a la bandada y te han atacado.');
        }
    }

    // ------------------------------------------------------------
    // 9. FLUJO DE NIVEL, VUELO Y CINEMÁTICA (4 NIVELES ROBUSTOS)
    // ------------------------------------------------------------
    function handleAllModelsFound() {
        if (state === 'level_cleared' || state === 'flying' || isLevelTransitioning) return;
        state = 'level_cleared';

        // Espera de suspense antes de que desplieguen alas y vuelen
        setTimeout(function () {
            if (state === 'level_cleared') {
                startFlightSequence();
            }
        }, 1600);
    }

    function startFlightSequence() {
        state = 'flying';
        flyingTimer = 2.4;
        playRoarAudio(false);

        // Generar ráfagas de viento y hojas
        spawnWindParticles();
    }

    function completeLevel() {
        if (isLevelTransitioning) return;
        isLevelTransitioning = true;
        state = 'level_transition';
        screenFlashAlpha = 0.90; // Destello blanco en pantalla

        setTimeout(function () {
            isLevelTransitioning = false;
            var nextLvl = currentLevelIdx + 1;

            if (nextLvl >= TOTAL_LEVELS) {
                // ¡VICTORIA TOTAL AL COMPLETAR EL NIVEL 4!
                handleGameWon();
            } else {
                // Avanzar al siguiente nivel (Nivel 2, 3 o 4)
                attemptsLeft = 5;
                spawnLevel(nextLvl);
            }
        }, 450);
    }

    function triggerAttackGameOver(reason) {
        state = 'attack';
        attackTimer = 2.0;
        shakeTimer = 1.0;
        shakeIntensity = 28;
        playRoarAudio(true); // Rugido a todo volumen

        var descEl = document.getElementById('eq-lose-desc');
        if (descEl) descEl.textContent = reason;

        setTimeout(function () {
            document.getElementById('eq-modal-lose').classList.add('show');
        }, 1200);
    }

    function handleGameWon() {
        state = 'won';
        document.getElementById('eq-modal-win').classList.add('show');
    }

    // ------------------------------------------------------------
    // 10. PARTÍCULAS Y MARCADORES
    // ------------------------------------------------------------
    function spawnWindParticles() {
        for (var i = 0; i < 40; i++) {
            windParticles.push({
                x: Math.random() * VW,
                y: 350 + Math.random() * 300,
                vx: -80 + (Math.random() - 0.5) * 200,
                vy: -150 - Math.random() * 250,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 5,
                size: 8 + Math.random() * 14,
                life: 1.5 + Math.random() * 1.0,
                maxLife: 2.5,
                color: (Math.random() > 0.4 ? '#2ecc71' : '#f1c40f')
            });
        }
    }

    function updateHUD() {
        var hudLevel = document.getElementById('eq-hud-level');
        var hudTargets = document.getElementById('eq-hud-targets');
        var hudLives = document.getElementById('eq-hud-lives');
        var timerFill = document.getElementById('eq-timer-fill');
        var timerText = document.getElementById('eq-timer-text');

        var cfg = LEVEL_CONFIGS[currentLevelIdx] || LEVEL_CONFIGS[0];

        if (hudLevel) hudLevel.textContent = 'NIVEL ' + (currentLevelIdx + 1) + '/' + TOTAL_LEVELS;
        if (hudTargets) hudTargets.textContent = 'QUETZALS: ' + spottedCount + '/' + cfg.modelsCount;

        if (hudLives) {
            var hearts = '';
            for (var h = 0; h < 5; h++) {
                hearts += (h < attemptsLeft ? '❤️' : '🖤');
            }
            hudLives.textContent = hearts + ' VIDAS: ' + attemptsLeft;
        }

        if (timerFill && timerText) {
            var pct = Math.max(0, Math.min(100, (timeLeft / cfg.timeLimit) * 100));
            timerFill.style.width = pct + '%';
            timerText.textContent = timeLeft.toFixed(1) + 's';

            if (timeLeft <= 1.8) {
                timerFill.style.backgroundColor = '#ff3838';
                timerText.style.color = '#ff3838';
            } else if (timeLeft <= 3.0) {
                timerFill.style.backgroundColor = '#feca57';
                timerText.style.color = '#feca57';
            } else {
                timerFill.style.backgroundColor = '#2ecc71';
                timerText.style.color = '#2ecc71';
            }
        }
    }

    // ------------------------------------------------------------
    // 11. BUCLE PRINCIPAL DE ACTUALIZACIÓN Y DIBUJADO (CAPAS 1, 2, 3)
    // ------------------------------------------------------------
        function togglePause() {
        if (!overlay || !overlay.classList.contains('open') || gameState === 'win' || gameState === 'lose') return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('eq-btn-pause');
        var pauseScreen = document.getElementById('eq-pause-screen');
        if (isPaused) {
            if (sndMusic) try { sndMusic.pause(); } catch (e) {}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndMusic && !isMuted) try { sndMusic.play().catch(function(){}); } catch (e) {}
            lastTimestamp = performance.now();
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '⏸️';
                if (lbl) lbl.textContent = ' PAUSA';
            }
            if (pauseScreen) pauseScreen.style.display = 'none';
        }
    }

    function gameLoop(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        var dt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        if (dt > 0.1) dt = 0.1;

        if (isPaused) {
            if (overlay && overlay.classList.contains('open')) {
                animFrameId = requestAnimationFrame(gameLoop);
            }
            return;
        }

        update(dt);
        render();

        if (overlay && overlay.classList.contains('open')) {
            animFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function update(dt) {
        // Temporizador del banner de nivel
        if (levelBannerTimer > 0) {
            levelBannerTimer -= dt;
        }

        // Temporizador de cuenta regresiva durante la búsqueda activa
        if (state === 'playing') {
            timeLeft -= dt;

            // Alerta acústica en los últimos 2 segundos
            if (timeLeft <= 2.0 && Math.floor(timeLeft * 4) % 2 === 0) {
                playTickWarning();
            }

            if (timeLeft <= 0) {
                timeLeft = 0;
                triggerAttackGameOver('¡TIEMPO AGOTADO (10s)! No encontraste a los Quetzalcoatlus a tiempo y han detectado tu presencia.');
            }
            updateHUD();
        }

        // Animación de vuelo al superar el nivel
        if (state === 'flying') {
            flyingTimer -= dt;
            for (var i = 0; i < entities.length; i++) {
                var ent = entities[i];
                if (ent.type === 'model' && ent.found) {
                    ent.flyProgress += dt * 0.9;
                    ent.flyX += ent.flyVx * dt;
                    ent.flyY += ent.flyVy * dt;
                    ent.w += 150 * dt; // Expande envergadura al desplegar alas
                    ent.h = ent.w / FLY_ASPECT;
                }
            }
            if (flyingTimer <= 0) {
                state = 'level_transition';
                completeLevel();
            }
        }

        // Parpadeo de transición
        if (screenFlashAlpha > 0) {
            screenFlashAlpha -= dt * 2.5;
            if (screenFlashAlpha < 0) screenFlashAlpha = 0;
        }

        // Agitación de pantalla
        if (shakeTimer > 0) {
            shakeTimer -= dt;
        }

        // Partículas de viento
        for (var p = windParticles.length - 1; p >= 0; p--) {
            var wp = windParticles[p];
            wp.life -= dt;
            wp.x += wp.vx * dt;
            wp.y += wp.vy * dt;
            wp.rot += wp.vrot * dt;
            if (wp.life <= 0) windParticles.splice(p, 1);
        }

        // Marcadores
        for (var m = markers.length - 1; m >= 0; m--) {
            markers[m].life -= dt;
            if (markers[m].life <= 0) markers.splice(m, 1);
        }
    }

    function render() {
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);

        // Agitación de pantalla por ataque o fallo
        if (shakeTimer > 0) {
            var ox = (Math.random() - 0.5) * shakeIntensity;
            var oy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(ox, oy);
        }

        // --------------------------------------------------------
        // CAPA 1: Capa 1.jpg (Fondo del recinto en Isla Matanceros)
        // --------------------------------------------------------
        var capa1Img = getImage('Capa 1.jpg');
        if (capa1Img.complete && capa1Img.naturalWidth) {
            ctx.drawImage(capa1Img, 0, 0, VW, VH);
        } else {
            ctx.fillStyle = '#0f2418';
            ctx.fillRect(0, 0, VW, VH);
        }

        // --------------------------------------------------------
        // ENTIDADES INTERMEDIAS (Al ras del suelo):
        // Quetza Brunch (falsos) y Quetza Model (reales)
        // --------------------------------------------------------
        renderGroundEntities();

        // --------------------------------------------------------
        // CAPA 2: Capa 2.png (Vegetación media que oculta siluetas)
        // --------------------------------------------------------
        var capa2Img = getImage('Capa 2.png');
        if (capa2Img.complete && capa2Img.naturalWidth) {
            ctx.drawImage(capa2Img, 0, 0, VW, VH);
        }

        // --------------------------------------------------------
        // CAPA 3: Capa 3.png (Vegetación cercana y follaje frontal)
        // --------------------------------------------------------
        var capa3Img = getImage('Capa 3.png');
        if (capa3Img.complete && capa3Img.naturalWidth) {
            ctx.drawImage(capa3Img, 0, 0, VW, VH);
        }

        // --------------------------------------------------------
        // ENTIDADES EN VUELO (Quetza Fly volando sobre el dosel)
        // --------------------------------------------------------
        if (state === 'flying') {
            renderFlyingQuetzas();
            renderWindParticles();
        }

        // Marcadores de acierto / fallo
        renderMarkers();

        // Banner informativo de nivel o estado
        if (levelBannerTimer > 0 && state === 'playing') {
            renderLevelBanner();
        } else if (state === 'level_cleared') {
            renderClearedBanner();
        }

        // --------------------------------------------------------
        // CINEMÁTICA DE DERROTA: Quetza Attack abalanzándose
        // --------------------------------------------------------
        if (state === 'attack' || state === 'lost') {
            renderAttackScreen();
        }

        // Destello de parpadeo ("la imagen parapadeará")
        if (screenFlashAlpha > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + screenFlashAlpha + ')';
            ctx.fillRect(0, 0, VW, VH);
            ctx.restore();
        }

        ctx.restore();
    }

    function renderLevelBanner() {
        var cfg = LEVEL_CONFIGS[currentLevelIdx] || LEVEL_CONFIGS[0];
        ctx.save();
        ctx.fillStyle = 'rgba(6, 20, 14, 0.88)';
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        var bw = 520, bh = 54;
        var bx = (VW - bw) / 2, by = 26;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        ctx.font = 'bold 15px "Orbitron", monospace';
        ctx.fillStyle = '#2ecc71';
        ctx.textAlign = 'center';
        ctx.fillText('NIVEL ' + (currentLevelIdx + 1) + ': ' + cfg.name, VW / 2, by + 22);

        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.fillStyle = '#feca57';
        ctx.fillText('ENCUENTRA ' + cfg.modelsCount + (cfg.modelsCount > 1 ? ' QUETZALCOATLUS REALES' : ' QUETZALCOATLUS REAL') + ' EN 10 SEGUNDOS', VW / 2, by + 42);
        ctx.restore();
    }

    function renderClearedBanner() {
        var cfg = LEVEL_CONFIGS[currentLevelIdx] || LEVEL_CONFIGS[0];
        ctx.save();
        ctx.fillStyle = 'rgba(6, 24, 16, 0.92)';
        ctx.strokeStyle = '#00d2d3';
        ctx.lineWidth = 2;
        var bw = 540, bh = 54;
        var bx = (VW - bw) / 2, by = 26;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        ctx.font = 'bold 15px "Orbitron", monospace';
        ctx.fillStyle = '#00d2d3';
        ctx.textAlign = 'center';
        ctx.fillText('¡QUETZALCOATLUS LOCALIZADO' + (cfg.modelsCount > 1 ? 'S' : '') + '!', VW / 2, by + 22);

        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DESPLEGANDO ALAS... EMPRENDIENDO EL VUELO', VW / 2, by + 42);
        ctx.restore();
    }

    function renderGroundEntities() {
        var brunchImg = getImage('Quetza Brunch.png');
        var modelImg = getImage('Quetza Model.png');

        for (var i = 0; i < entities.length; i++) {
            var ent = entities[i];

            if (ent.type === 'brunch') {
                if (brunchImg.complete && brunchImg.naturalWidth) {
                    ctx.save();
                    if (ent.flip) {
                        ctx.translate(ent.x + ent.w, ent.y);
                        ctx.scale(-1, 1);
                        ctx.drawImage(brunchImg, 0, 0, ent.w, ent.h);
                    } else {
                        ctx.drawImage(brunchImg, ent.x, ent.y, ent.w, ent.h);
                    }
                    ctx.restore();
                }
            } else if (ent.type === 'model') {
                // Si está en pleno vuelo, se dibuja en la capa superior de vuelo
                if (state === 'flying' && ent.found) continue;

                if (modelImg.complete && modelImg.naturalWidth) {
                    ctx.save();
                    // Sombra sutil al ras del suelo
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                    ctx.beginPath();
                    ctx.ellipse(ent.x + ent.w / 2, ent.y + ent.h * 0.96, ent.w * 0.38, 9, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Si ya fue encontrado pero aún no vuela, resaltar con resplandor
                    if (ent.found) {
                        ctx.shadowColor = '#2ecc71';
                        ctx.shadowBlur = 24;
                    }

                    ctx.drawImage(modelImg, ent.x, ent.y, ent.w, ent.h);
                    ctx.restore();
                }
            }
        }
    }

    function renderFlyingQuetzas() {
        var flyImg = getImage('Quetza Fly.png');
        if (!flyImg.complete || !flyImg.naturalWidth) return;

        for (var i = 0; i < entities.length; i++) {
            var ent = entities[i];
            if (ent.type === 'model' && ent.found) {
                ctx.save();
                ctx.shadowColor = '#00d2d3';
                ctx.shadowBlur = 18;
                ctx.drawImage(flyImg, ent.flyX, ent.flyY, ent.w, ent.h);
                ctx.restore();
            }
        }
    }

    function renderWindParticles() {
        ctx.save();
        for (var i = 0; i < windParticles.length; i++) {
            var p = windParticles[i];
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    function renderMarkers() {
        ctx.save();
        for (var i = 0; i < markers.length; i++) {
            var m = markers[i];
            var a = m.life / m.maxLife;
            ctx.globalAlpha = a;

            if (m.type === 'target_lock') {
                // Retícula verde de blanco fijado
                ctx.strokeStyle = '#2ecc71';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(m.x, m.y, 32 * (1.5 - a * 0.5), 0, Math.PI * 2);
                ctx.stroke();

                // Cruz interior
                ctx.beginPath();
                ctx.moveTo(m.x - 18, m.y); ctx.lineTo(m.x + 18, m.y);
                ctx.moveTo(m.x, m.y - 18); ctx.lineTo(m.x, m.y + 18);
                ctx.stroke();

                ctx.font = 'bold 12px "Orbitron", monospace';
                ctx.fillStyle = '#2ecc71';
                ctx.textAlign = 'center';
                ctx.fillText('¡QUETZAL IDENTIFICADO!', m.x, m.y - 38);
            } else if (m.type === 'miss') {
                // Cruz roja de fallo
                ctx.strokeStyle = '#ff3838';
                ctx.lineWidth = 3;
                var r = 18;
                ctx.beginPath();
                ctx.moveTo(m.x - r, m.y - r); ctx.lineTo(m.x + r, m.y + r);
                ctx.moveTo(m.x + r, m.y - r); ctx.lineTo(m.x - r, m.y + r);
                ctx.stroke();

                ctx.font = 'bold 11px "Share Tech Mono", monospace';
                ctx.fillStyle = '#ff6b6b';
                ctx.textAlign = 'center';
                ctx.fillText('RAMA SECA / FALLO', m.x, m.y - 24);
            }
        }
        ctx.restore();
    }

    function renderAttackScreen() {
        var attackImg = getImage('Quetza Attack.png');
        ctx.save();
        ctx.fillStyle = 'rgba(20, 0, 0, 0.82)';
        ctx.fillRect(0, 0, VW, VH);

        if (attackImg.complete && attackImg.naturalWidth) {
            var aw = 1120;
            var ah = aw * (attackImg.naturalHeight / attackImg.naturalWidth);
            var ax = (VW - aw) / 2;
            var ay = (VH - ah) / 2 + 20;

            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 45;
            ctx.drawImage(attackImg, ax, ay, aw, ah);
        }
        ctx.restore();
    }

    // ------------------------------------------------------------
    // 12. INICIO Y CONTROL DE EXPEDICIÓN
    // ------------------------------------------------------------
    function startGame() {
        document.getElementById('eq-modal-briefing').classList.remove('show');
        document.getElementById('eq-modal-win').classList.remove('show');
        document.getElementById('eq-modal-lose').classList.remove('show');

        initAudio();
        if (sndMusic && !isMuted) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }

        attemptsLeft = 5;
        currentLevelIdx = 0;
        isLevelTransitioning = false;
        spawnLevel(0);
    }

    function openGame() {
        buildOverlayDOM();
        resizeCanvas();

        // Pausar música ambiental del sitio
        if (window.interruptBgMusic) {
            window.interruptBgMusic();
        }

        overlay.classList.add('open');
        document.getElementById('eq-modal-briefing').classList.add('show');
        document.getElementById('eq-modal-win').classList.remove('show');
        document.getElementById('eq-modal-lose').classList.remove('show');

        state = 'briefing';
        attemptsLeft = 5;
        currentLevelIdx = 0;
        isLevelTransitioning = false;
        updateHUD();

        lastTimestamp = 0;
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function closeGame() {
        if (!overlay) return;
        overlay.classList.remove('open');
        cancelAnimationFrame(animFrameId);
        stopAllAudio();

        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }

        // Reanudar música ambiental del sitio
        if (window.releaseBgMusic) {
            window.releaseBgMusic();
        }
    }

    // ------------------------------------------------------------
    // 13. EXPOSICIÓN GLOBAL
    // ------------------------------------------------------------
    window.openEncontrandoQuetza = openGame;
    window.closeEncontrandoQuetza = closeGame;

})();
