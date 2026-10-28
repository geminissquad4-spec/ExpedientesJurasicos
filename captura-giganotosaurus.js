/* ============================================================
   EXPEDIENTES JURÁSICOS - MINIJUEGO: CAPTURA AL GIGANOTOSAURUS
   Protocolo de Bloqueo Perimetral InGen (Consola Simon Says)
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CONFIGURACIÓN Y CONSTANTES
    // ------------------------------------------------------------
    var VW = 1280; // Ancho virtual del lienzo
    var VH = 720;  // Alto virtual del lienzo
    var TOTAL_ROUNDS = 5; // 5 rondas: secuencias de 2, 3, 4, 5, 6 botones
    var ROUND_LENGTHS = [2, 3, 4, 5, 6];

    // Dimensiones y recorte de la consola (2400x1340 origen)
    var CS_CROP = { sx: 319, sy: 93, sw: 1811, sh: 1112 };
    var CONSOLE_W = 580;
    var CONSOLE_H = Math.round(CONSOLE_W * CS_CROP.sh / CS_CROP.sw); // ~356
    var CONSOLE_X = Math.round((VW - CONSOLE_W) / 2); // 350
    var CONSOLE_Y = VH - CONSOLE_H + 20; // 384

    // 10 Botones en la consola (2 filas de 5 botones)
    // Fila 1: botones 1 a 5 (índices 0..4)
    // Fila 2: botones 6 a 10 (índices 5..9)
    var COLS_REL = [0.1883, 0.3208, 0.4533, 0.5859, 0.7184];
    var ROWS_REL = [0.4065, 0.6043];
    var BTN_REL_W = 0.0828;
    var BTN_REL_H = 0.1502;

    var BUTTON_COLORS = [
        '#ff3838', // 1: Rojo neón
        '#2e86de', // 2: Azul eléctrico
        '#10ac84', // 3: Verde esmeralda
        '#feca57', // 4: Ámbar cyber
        '#a55eea', // 5: Violeta plasma
        '#ff9f43', // 6: Naranja neón
        '#00d2d3', // 7: Cian láser
        '#1dd1a1', // 8: Verde lima
        '#ff6b6b', // 9: Rosa láser
        '#ffd32a'  // 10: Oro táctico
    ];

    // Frecuencias musicales para los 10 botones (Escala pentatónica/mayor balanceada)
    var BUTTON_FREQS = [
        261.63, // C4 (Botón 1)
        293.66, // D4 (Botón 2)
        329.63, // E4 (Botón 3)
        349.23, // F4 (Botón 4)
        392.00, // G4 (Botón 5)
        440.00, // A4 (Botón 6)
        493.88, // B4 (Botón 7)
        523.25, // C5 (Botón 8)
        587.33, // D5 (Botón 9)
        659.25  // E5 (Botón 10)
    ];

    // Recorte de sprite del Giganotosaurus (2400x1792 origen)
    var GIGA_CROP = { sx: 621, sy: 189, sw: 1392, sh: 1482 };

    // ------------------------------------------------------------
    // 2. ESTADO DEL JUEGO
    // ------------------------------------------------------------
    var state = 'briefing'; // 'briefing', 'showing', 'input', 'ok', 'error', 'won', 'lost'
    var currentRound = 0;   // 0 a 4 (ronda 1 a 5)
    var sequence = [];      // Secuencia de la ronda actual
    var playerStep = 0;     // Paso que el jugador está introduciendo

    // Distancia del Giganotosaurus (100% = lejos ~160m, 0% = impacto en compuertas)
    var gigaDist = 100;
    var gigaBaseSpeed = 1.15; // Velocidad de aproximación (% por segundo)
    var gigaSpeedBoostTimer = 0; // Aumento de velocidad al cometer error
    var gigaFrameTimer = 0;
    var gigaFrameIndex = 0; // 0: Correr 1, 1: Correr 2
    var screamTimer = 6.0;   // Se reproduce cada 6 segundos

    // Compuertas InGen (0.0 = abiertas, 1.0 = completamente selladas)
    var doorProgress = 0.0;
    var targetDoorProgress = 0.0;

    // Efectos visuales de consola
    var activeLitButton = -1; // Botón actualmente iluminado (-1 = ninguno)
    var litTimer = 0;
    var isInputLocked = true;
    var shakeTimer = 0;
    var shakeIntensity = 0;
    var feedbackTimer = 0; // Temporizador para mostrar Ok / Error consola
    var feedbackType = ''; // 'ok', 'error'

    // Partículas y efectos
    var dustParticles = [];
    var sparks = [];

    // ------------------------------------------------------------
    // 3. GESTIÓN DE ELEMENTOS DOM Y CANVAS
    // ------------------------------------------------------------
    var overlay = null;
    var canvas = null;
    var ctx = null;
    var scale = 1;
    var animFrameId = null;
    var lastTimestamp = 0;

    // ------------------------------------------------------------
    // 4. GESTIÓN DE ASSETS (IMÁGENES Y AUDIO)
    // ------------------------------------------------------------
    var imageCache = {};
    var audioCtx = null;
    var sndMusic = null;
    var sndScream = null;
    var isMuted = false;

    function getImage(filename) {
        if (imageCache[filename]) return imageCache[filename];
        var img = new Image();
        img.src = filename;
        img.onerror = function () {
            if (filename === 'Perdiste_Giganotosaurus.png') {
                img.src = 'Captura al Giganotosaurus/Perdiste.png';
            } else if (img.src.indexOf('Captura al Giganotosaurus/') === -1) {
                img.src = 'Captura al Giganotosaurus/' + filename;
            }
        };
        imageCache[filename] = img;
        return img;
    }

    // Precarga de imágenes
    var preloadList = [
        'Fondo Run.jpg',
        'Correr 1.png',
        'Correr 2.png',
        'Puerta1.jpg',
        'Puerta2.jpg',
        'Consola.png',
        'Ok consola.png',
        'Error consola.png',
        'Perdiste_Giganotosaurus.png',
        'CAPTURA AL GIGANOTOSAURUS.jpg'
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
            sndMusic.src = 'Giganotosaurus Paddock.mp4';
            sndMusic.loop = true;
            sndMusic.volume = 0.50;
            sndMusic.onerror = function () {
                if (sndMusic.src.indexOf('Captura al Giganotosaurus/') === -1) {
                    sndMusic.src = 'Captura al Giganotosaurus/Giganotosaurus Paddock.mp4';
                }
            };
        }

        if (!sndScream) {
            sndScream = new Audio();
            sndScream.src = 'Giganotosaurus Scream.mp4';
            sndScream.onerror = function () {
                if (sndScream.src.indexOf('Captura al Giganotosaurus/') === -1) {
                    sndScream.src = 'Captura al Giganotosaurus/Giganotosaurus Scream.mp4';
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
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duration || 0.3));
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (duration || 0.3));
        } catch (e) {}
    }

    function playButtonTone(buttonIndex) {
        var freq = BUTTON_FREQS[buttonIndex] || 440;
        playTone(freq, 0.35, 'triangle', 0.25);
    }

    function playSuccessChime() {
        if (isMuted) return;
        // Acorde triunfal ascendente
        [523.25, 659.25, 783.99, 1046.50].forEach(function (f, idx) {
            setTimeout(function () {
                playTone(f, 0.45, 'sine', 0.28);
            }, idx * 110);
        });
    }

    function playErrorBuzzer() {
        if (isMuted) return;
        playTone(130.81, 0.55, 'sawtooth', 0.35);
        setTimeout(function () {
            playTone(110.00, 0.65, 'sawtooth', 0.4);
        }, 120);
    }

    function playDoorHydraulicSound() {
        if (isMuted) return;
        // Sonido de pistones hidráulicos pesados
        playTone(90, 0.8, 'triangle', 0.18);
    }

    function playScream() {
        if (isMuted || !sndScream) return;
        try {
            // Mientras más se acerca (gigaDist bajo), más fuerte se reproduce
            var distFraction = (100 - gigaDist) / 100; // 0.0 lejos, 1.0 al lado
            var screamVol = Math.min(1.0, Math.max(0.15, 0.15 + Math.pow(distFraction, 0.75) * 0.85));
            sndScream.volume = screamVol;
            sndScream.currentTime = 0;
            sndScream.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        if (sndScream) {
            try { sndScream.pause(); sndScream.currentTime = 0; } catch (e) {}
        }
    }

    // ------------------------------------------------------------
    // 5. CONSTRUCCIÓN DE LA INTERFAZ (CSS Y DOM)
    // ------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('cg-game-styles')) return;
        var style = document.createElement('style');
        style.id = 'cg-game-styles';
        style.textContent = [
            '#cg-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  z-index: 100000;',
            '  background: #020406;',
            '  display: none;',
            '  flex-direction: column;',
            '  overflow: hidden;',
            '  font-family: "Share Tech Mono", monospace;',
            '  user-select: none;',
            '  -webkit-user-select: none;',
            '}',
            '#cg-overlay.open { display: flex; }',
            '',
            '/* Encabezado Táctico InGen */',
            '#cg-header {',
            '  flex-shrink: 0;',
            '  height: 52px;',
            '  background: linear-gradient(180deg, rgba(8, 16, 20, 0.98), rgba(4, 8, 10, 0.95));',
            '  border-bottom: 2px solid rgba(231, 76, 60, 0.45);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 0 1rem;',
            '  box-shadow: 0 2px 18px rgba(0,0,0,0.85);',
            '  z-index: 20;',
            '}',
            '.cg-header-left { display: flex; align-items: center; gap: 0.8rem; }',
            '.cg-logo-badge {',
            '  background: #e74c3c;',
            '  color: #fff;',
            '  font-weight: 900;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  letter-spacing: 1.5px;',
            '  padding: 3px 8px;',
            '  border-radius: 3px;',
            '  box-shadow: 0 0 10px rgba(231, 76, 60, 0.6);',
            '}',
            '.cg-header-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.95rem;',
            '  font-weight: 700;',
            '  color: #f1f2f6;',
            '  letter-spacing: 1.5px;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '}',
            '.cg-header-status {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 1.5rem;',
            '}',
            '.cg-hud-chip {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '  background: rgba(255,255,255,0.05);',
            '  border: 1px solid rgba(255,255,255,0.15);',
            '  border-radius: 4px;',
            '  padding: 4px 10px;',
            '  font-size: 0.82rem;',
            '}',
            '.cg-hud-chip.alert {',
            '  border-color: #e74c3c;',
            '  color: #ff6b6b;',
            '  animation: cg-chip-pulse 1s infinite alternate;',
            '}',
            '@keyframes cg-chip-pulse {',
            '  from { background: rgba(231,76,60,0.1); }',
            '  to   { background: rgba(231,76,60,0.3); }',
            '}',
            '.cg-header-btns { display: flex; align-items: center; gap: 0.5rem; }',
            '.cg-tool-btn {',
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
            '.cg-tool-btn:hover {',
            '  background: rgba(231,76,60,0.3);',
            '  border-color: #e74c3c;',
            '  color: #fff;',
            '}',
            '.cg-close-btn {',
            '  background: rgba(231, 76, 60, 0.25);',
            '  border: 1px solid #e74c3c;',
            '  color: #ff6b6b;',
            '  padding: 5px 12px;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  font-weight: 700;',
            '  font-size: 0.85rem;',
            '}',
            '.cg-close-btn:hover {',
            '  background: #e74c3c;',
            '  color: #fff;',
            '  box-shadow: 0 0 12px rgba(231,76,60,0.8);',
            '}',
            '',
            '/* Lienzo de juego y contenedor */',
            '#cg-canvas-wrap {',
            '  flex: 1;',
            '  position: relative;',
            '  overflow: hidden;',
            '  background: #000;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  touch-action: none;',
            '}',
            '#cg-canvas {',
            '  display: block;',
            '  box-shadow: 0 0 40px rgba(0,0,0,0.9);',
            '}',
            '',
            '/* Modales (Briefing, Victoria, Derrota) */',
            '.cg-modal {',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(4, 8, 12, 0.92);',
            '  backdrop-filter: blur(10px);',
            '  display: none;',
            '  align-items: center;',
            '  justify-content: center;',
            '  flex-direction: column;',
            '  padding: 1.5rem;',
            '  z-index: 50;',
            '  text-align: center;',
            '}',
            '.cg-modal.show { display: flex; animation: cg-modal-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }',
            '@keyframes cg-modal-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
            '.cg-modal-card {',
            '  background: linear-gradient(135deg, rgba(20, 26, 32, 0.98), rgba(10, 14, 18, 0.98));',
            '  border: 2px solid rgba(231, 76, 60, 0.6);',
            '  border-radius: 8px;',
            '  padding: 2rem 2.5rem;',
            '  max-width: 660px;',
            '  width: 92%;',
            '  box-shadow: 0 0 45px rgba(231, 76, 60, 0.4);',
            '}',
            '.cg-modal-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 1.45rem;',
            '  font-weight: 900;',
            '  letter-spacing: 2px;',
            '  color: #ff6b6b;',
            '  margin-bottom: 0.8rem;',
            '  text-transform: uppercase;',
            '}',
            '.cg-modal-sub {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.88rem;',
            '  color: #cbd5e1;',
            '  line-height: 1.6;',
            '  margin-bottom: 1.5rem;',
            '  text-align: left;',
            '}',
            '.cg-modal-sub strong { color: #feca57; }',
            '.cg-rules-list {',
            '  background: rgba(0,0,0,0.4);',
            '  border-left: 3px solid #e74c3c;',
            '  padding: 0.8rem 1.2rem;',
            '  margin: 1rem 0;',
            '  border-radius: 0 6px 6px 0;',
            '  text-align: left;',
            '  font-size: 0.84rem;',
            '  color: #e2e8f0;',
            '}',
            '.cg-rules-list li { margin: 0.4rem 0; }',
            '.cg-modal-btn {',
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
            '  box-shadow: 0 0 20px rgba(231, 76, 60, 0.4);',
            '  background: linear-gradient(135deg, #e74c3c, #c0392b);',
            '  color: #fff;',
            '}',
            '.cg-modal-btn:hover {',
            '  background: linear-gradient(135deg, #ff6b6b, #e74c3c);',
            '  box-shadow: 0 0 35px rgba(255, 107, 107, 0.7);',
            '  transform: scale(1.03);',
            '}',
            '.cg-modal-btn.green {',
            '  background: linear-gradient(135deg, #27ae60, #2ecc71);',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.4);',
            '}',
            '.cg-modal-btn.green:hover {',
            '  background: linear-gradient(135deg, #2ecc71, #1abc9c);',
            '  box-shadow: 0 0 35px rgba(46, 204, 113, 0.7);',
            '}',
            '',
            '/* Responsive Móviles */',
            '@media (max-width: 768px) {',
            '  #cg-header { height: 46px; padding: 0 0.5rem; }',
            '  .cg-header-title { font-size: 0.78rem; letter-spacing: 0.5px; }',
            '  .cg-logo-badge { font-size: 0.62rem; padding: 2px 5px; }',
            '  .cg-hud-chip { padding: 3px 6px; font-size: 0.72rem; }',
            '  .cg-modal-card { padding: 1.2rem; }',
            '  .cg-modal-title { font-size: 1.15rem; }',
            '  .cg-modal-sub { font-size: 0.78rem; }',
            '  .cg-rules-list { font-size: 0.75rem; padding: 0.5rem 0.8rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function buildOverlayDOM() {
        if (overlay) return;
        injectStyles();

        overlay = document.createElement('div');
        overlay.id = 'cg-overlay';

        // 1. Barra de Encabezado HUD
        var header = document.createElement('div');
        header.id = 'cg-header';
        header.innerHTML = [
            '<div class="cg-header-left">',
            '  <div class="cg-logo-badge">INGEN PADDOCK 09</div>',
            '  <div class="cg-header-title">🦖 PROTOCOLO DE CIERRE // CAPTURA AL GIGANOTOSAURUS</div>',
            '</div>',
            '<div class="cg-header-status">',
            '  <div class="cg-hud-chip alert" id="cg-hud-dist">⚠️ DISTANCIA: 160m</div>',
            '  <div class="cg-hud-chip" id="cg-hud-doors" style="color:#00d2d3;">COMPUERTAS: 0%</div>',
            '  <div class="cg-hud-chip" id="cg-hud-round" style="color:#feca57;">RONDA: 1/5</div>',
            '</div>',
            '<div class="cg-header-btns">',
            '  <button class="cg-tool-btn" id="cg-btn-mute" title="Activar/Desactivar Sonido">🔊</button>',
            '  <button class="cg-tool-btn" id="cg-btn-full" title="Pantalla Completa">⛶</button>',
            '  <button class="cg-close-btn" id="cg-btn-close">✕ SALIR</button>',
            '</div>'
        ].join('');
        overlay.appendChild(header);

        // 2. Contenedor de Lienzo Canvas
        var canvasWrap = document.createElement('div');
        canvasWrap.id = 'cg-canvas-wrap';

        canvas = document.createElement('canvas');
        canvas.id = 'cg-canvas';
        canvasWrap.appendChild(canvas);
        ctx = canvas.getContext('2d');

        overlay.appendChild(canvasWrap);

        // 3. Modales
        // Modal de Inicio (Briefing)
        var briefModal = document.createElement('div');
        briefModal.className = 'cg-modal show';
        briefModal.id = 'cg-modal-briefing';
        briefModal.innerHTML = [
            '<div class="cg-modal-card">',
            '  <div class="cg-modal-title">🚨 PROTOCOLO DE CONTENCIÓN ALFA</div>',
            '  <div class="cg-modal-sub">',
            '    El <strong>Giganotosaurus</strong> ha escapado del sector norte y avanza furiosamente por la calzada principal hacia la base. Tu objetivo es activar el cierre perimetral de las compuertas blindadas introduciendo la secuencia de seguridad en la consola InGen antes de que el depredador rompa el cerco.',
            '  </div>',
            '  <ul class="cg-rules-list">',
            '    <li><strong>🧠 Consola Simon Says:</strong> La consola transmitirá una secuencia de botones iluminados (2, luego 3, 4, 5 y 6 botones).</li>',
            '    <li><strong>⌨️ Respuesta:</strong> Oprime exactamente los mismos botones en el mismo orden tras la demostración.</li>',
            '    <li><strong>✅ Acierto:</strong> Mostrará "OK" y las compuertas se cerrarán progresivamente un 20%.</li>',
            '    <li><strong>❌ Error:</strong> Mostrará "ERROR" y el Giganotosaurus avanzará mucho más rápido.</li>',
            '    <li><strong>📢 Rugidos:</strong> El Giganotosaurus emitirá un bramido ensordecedor cada 6 segundos; ¡mientras más cerca esté, más fuerte se escuchará!</li>',
            '  </ul>',
            '  <button class="cg-modal-btn" id="cg-btn-start">INICIAR SECUENCIA DE BLOQUEO ▶</button>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(briefModal);

        // Modal de Victoria
        var winModal = document.createElement('div');
        winModal.className = 'cg-modal';
        winModal.id = 'cg-modal-win';
        winModal.innerHTML = [
            '<div class="cg-modal-card" style="border-color:#2ecc71; box-shadow:0 0 50px rgba(46,204,113,0.5);">',
            '  <div class="cg-modal-title" style="color:#2ecc71;">🏆 ¡GIGANOTOSAURUS CAPTURADO!</div>',
            '  <div class="cg-modal-sub" style="text-align:center;">',
            '    ¡Excelente trabajo de ingeniería táctica! Las compuertas blindadas de InGen se han sellado al 100% con éxito hermético. El Giganotosaurus se estrelló contra las puertas de titanio sin poder franquear el perímetro. ¡Has salvado al personal de la base!',
            '  </div>',
            '  <button class="cg-modal-btn green" id="cg-btn-win-restart">JUGAR DE NUEVO 🔄</button>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(winModal);

        // Modal de Derrota
        var loseModal = document.createElement('div');
        loseModal.className = 'cg-modal';
        loseModal.id = 'cg-modal-lose';
        loseModal.innerHTML = [
            '<div class="cg-modal-card">',
            '  <div class="cg-modal-title">☠️ ¡PERÍMETRO DESTRUIDO!</div>',
            '  <div class="cg-modal-sub" style="text-align:center;">',
            '    El Giganotosaurus alcanzó la base antes de que pudieras cerrar las compuertas de seguridad. ¡El colosal carnívoro ha irrumpido en la sala de mando y te ha devorado!',
            '  </div>',
            '  <button class="cg-modal-btn" id="cg-btn-lose-restart">REINTENTAR BLOQUEO 🔄</button>',
            '</div>'
        ].join('');
        canvasWrap.appendChild(loseModal);

        document.body.appendChild(overlay);

        // Eventos de botones de interfaz
        document.getElementById('cg-btn-close').addEventListener('click', closeGame);
        document.getElementById('cg-btn-start').addEventListener('click', startGame);
        document.getElementById('cg-btn-win-restart').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('captura-giganoto');
            startGame();
        });
        document.getElementById('cg-btn-lose-restart').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('captura-giganoto');
            startGame();
        });

        document.getElementById('cg-btn-mute').addEventListener('click', function () {
            isMuted = !isMuted;
            this.textContent = isMuted ? '🔇' : '🔊';
            if (isMuted) {
                if (sndMusic) sndMusic.pause();
                if (sndScream) sndScream.pause();
            } else {
                if (sndMusic && state !== 'briefing') sndMusic.play().catch(function () {});
            }
        });

        document.getElementById('cg-btn-full').addEventListener('click', toggleFullscreen);

        // Entrada táctil / ratón en el lienzo
        canvasWrap.addEventListener('mousedown', handlePointerDown);
        canvasWrap.addEventListener('touchstart', handleTouchStart, { passive: false });

        window.addEventListener('resize', resizeCanvas);

        // Tecla Escape para salir
        window.addEventListener('keydown', function (e) {
            if (!overlay || !overlay.classList.contains('open')) return;
            if (e.key === 'Escape') closeGame();
        });
    }

    function toggleFullscreen() {
        var target = overlay || document.documentElement;
        var btn = document.getElementById('cg-btn-full');
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
        var wrap = document.getElementById('cg-canvas-wrap');
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
    // 7. LÓGICA DE DETECCIÓN DE BOTONES
    // ------------------------------------------------------------
    function getButtonBounds(btnIndex) {
        var row = Math.floor(btnIndex / 5);
        var col = btnIndex % 5;
        var rx = COLS_REL[col];
        var ry = ROWS_REL[row];
        var bx = CONSOLE_X + rx * CONSOLE_W;
        var by = CONSOLE_Y + ry * CONSOLE_H;
        var bw = BTN_REL_W * CONSOLE_W;
        var bh = BTN_REL_H * CONSOLE_H;
        return { x: bx, y: by, w: bw, h: bh };
    }

    function getClickedButtonIndex(virtualX, virtualY) {
        for (var i = 0; i < 10; i++) {
            var b = getButtonBounds(i);
            // Área de tolerancia ligeramente mayor para pantallas táctiles (+8px)
            var pad = 6;
            if (virtualX >= b.x - pad && virtualX <= b.x + b.w + pad &&
                virtualY >= b.y - pad && virtualY <= b.y + b.h + pad) {
                return i;
            }
        }
        return -1;
    }

    function handlePointerDown(e) {
        if (state !== 'input' || isInputLocked) return;
        var rect = canvas.getBoundingClientRect();
        var vx = (e.clientX - rect.left) / scale;
        var vy = (e.clientY - rect.top) / scale;
        processButtonPress(vx, vy);
    }

    function handleTouchStart(e) {
        if (state !== 'input' || isInputLocked) return;
        if (e.touches && e.touches.length > 0) {
            e.preventDefault();
            var rect = canvas.getBoundingClientRect();
            var vx = (e.touches[0].clientX - rect.left) / scale;
            var vy = (e.touches[0].clientY - rect.top) / scale;
            processButtonPress(vx, vy);
        }
    }

    function processButtonPress(vx, vy) {
        var btn = getClickedButtonIndex(vx, vy);
        if (btn === -1) return;

        // Vibración háptica en móviles si está disponible
        if (navigator.vibrate) {
            try { navigator.vibrate(35); } catch (e) {}
        }

        // Iluminar botón y emitir tono
        activeLitButton = btn;
        litTimer = 0.22;
        playButtonTone(btn);

        // Crear chispas visuales táctiles
        var b = getButtonBounds(btn);
        spawnButtonSparks(b.x + b.w / 2, b.y + b.h / 2, BUTTON_COLORS[btn]);

        // Verificar si coincide con la secuencia esperada
        var expectedButton = sequence[playerStep];
        if (btn === expectedButton) {
            // ¡Botón correcto!
            playerStep++;
            if (playerStep >= sequence.length) {
                // ¡Ronda completada con éxito!
                handleRoundSuccess();
            }
        } else {
            // ¡Error en la secuencia!
            handleRoundError();
        }
    }

    // ------------------------------------------------------------
    // 8. CONTROL DEL SIMON SAYS (SECUENCIAS Y RONDAS)
    // ------------------------------------------------------------
    function startRound(roundIdx) {
        currentRound = roundIdx;
        playerStep = 0;
        state = 'showing';
        isInputLocked = true;
        feedbackType = '';
        updateHUD();

        // Generar secuencia para esta ronda (2, 3, 4, 5 o 6 botones)
        var seqLen = ROUND_LENGTHS[currentRound];
        sequence = [];
        for (var i = 0; i < seqLen; i++) {
            sequence.push(Math.floor(Math.random() * 10));
        }

        // Mostrar secuencia tras breve pausa
        setTimeout(function () {
            demonstrateSequence(0);
        }, 650);
    }

    function demonstrateSequence(stepIdx) {
        if (state !== 'showing') return;
        if (stepIdx >= sequence.length) {
            // Demostración finalizada -> Turno del jugador
            setTimeout(function () {
                activeLitButton = -1;
                state = 'input';
                isInputLocked = false;
                playerStep = 0;
            }, 300);
            return;
        }

        var btn = sequence[stepIdx];
        activeLitButton = btn;
        litTimer = 0.42;
        playButtonTone(btn);

        setTimeout(function () {
            activeLitButton = -1;
            setTimeout(function () {
                demonstrateSequence(stepIdx + 1);
            }, 180);
        }, 420);
    }

    function replayCurrentSequence() {
        state = 'showing';
        isInputLocked = true;
        playerStep = 0;
        feedbackType = '';
        setTimeout(function () {
            demonstrateSequence(0);
        }, 600);
    }

    function handleRoundSuccess() {
        state = 'ok';
        isInputLocked = true;
        feedbackType = 'ok';
        feedbackTimer = 1.3;
        playSuccessChime();

        // Cerrar compuertas un 20% más
        targetDoorProgress = Math.min(1.0, (currentRound + 1) * 0.20);
        playDoorHydraulicSound();

        setTimeout(function () {
            if (currentRound + 1 >= TOTAL_ROUNDS) {
                // ¡VICTORIA! Las compuertas están 100% selladas
                targetDoorProgress = 1.0;
                setTimeout(handleGameWon, 1000);
            } else {
                startRound(currentRound + 1);
            }
        }, 1400);
    }

    function handleRoundError() {
        state = 'error';
        isInputLocked = true;
        feedbackType = 'error';
        feedbackTimer = 1.3;
        playErrorBuzzer();

        // Penalización: Giganotosaurus avanza bruscamente y acelera
        gigaDist = Math.max(0, gigaDist - 16);
        gigaSpeedBoostTimer = 4.0;
        shakeTimer = 0.55;
        shakeIntensity = 18;

        // Si la distancia cayó a 0, derrota inmediata
        if (gigaDist <= 0) {
            setTimeout(handleGameLost, 800);
            return;
        }

        // Si aún tiene distancia, reintentar la secuencia actual
        setTimeout(function () {
            replayCurrentSequence();
        }, 1400);
    }

    function handleGameWon() {
        state = 'won';
        isInputLocked = true;
        document.getElementById('cg-modal-win').classList.add('show');
    }

    function handleGameLost() {
        state = 'lost';
        isInputLocked = true;
        shakeTimer = 1.0;
        shakeIntensity = 25;

        // Sonido de rugido ensordecedor a volumen máximo
        if (sndScream && !isMuted) {
            try {
                sndScream.volume = 1.0;
                sndScream.currentTime = 0;
                sndScream.play().catch(function () {});
            } catch (e) {}
        }

        setTimeout(function () {
            document.getElementById('cg-modal-lose').classList.add('show');
        }, 800);
    }

    function updateHUD() {
        var hudDist = document.getElementById('cg-hud-dist');
        var hudDoors = document.getElementById('cg-hud-doors');
        var hudRound = document.getElementById('cg-hud-round');

        if (hudDist) {
            var meters = Math.max(0, Math.round(gigaDist * 1.6));
            hudDist.textContent = '⚠️ DISTANCIA: ' + meters + 'm';
            if (meters <= 35) {
                hudDist.style.color = '#ff3838';
                hudDist.textContent = '🚨 ¡PELIGRO CRÍTICO! ' + meters + 'm';
            } else {
                hudDist.style.color = '#ff6b6b';
            }
        }

        if (hudDoors) {
            var pct = Math.round(doorProgress * 100);
            hudDoors.textContent = 'COMPUERTAS: ' + pct + '%';
        }

        if (hudRound) {
            hudRound.textContent = 'RONDA: ' + (currentRound + 1) + '/' + TOTAL_ROUNDS;
        }
    }

    // ------------------------------------------------------------
    // 9. PARTÍCULAS (POLVO Y CHISPAS)
    // ------------------------------------------------------------
    function spawnButtonSparks(x, y, color) {
        for (var i = 0; i < 14; i++) {
            var angle = Math.random() * Math.PI * 2;
            var spd = 40 + Math.random() * 120;
            sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 0.35 + Math.random() * 0.25,
                maxLife: 0.6,
                color: color || '#feca57',
                size: 2 + Math.random() * 3
            });
        }
    }

    function spawnDustParticle(x, y) {
        var angle = Math.PI + (Math.random() - 0.5) * 1.2;
        var spd = 20 + Math.random() * 50;
        dustParticles.push({
            x: x + (Math.random() - 0.5) * 40,
            y: y,
            vx: Math.cos(angle) * spd,
            vy: -10 - Math.random() * 25,
            life: 0.6 + Math.random() * 0.4,
            maxLife: 1.0,
            size: 6 + Math.random() * 10
        });
    }

    // ------------------------------------------------------------
    // 10. BUCLE DE ACTUALIZACIÓN Y DIBUJADO (4 CAPAS)
    // ------------------------------------------------------------
    function gameLoop(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        var dt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        if (dt > 0.1) dt = 0.1; // Limitar saltos de cuadro

        update(dt);
        render();

        if (overlay && overlay.classList.contains('open')) {
            animFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function update(dt) {
        // Actualizar temporizadores
        if (litTimer > 0) {
            litTimer -= dt;
            if (litTimer <= 0) activeLitButton = -1;
        }

        if (feedbackTimer > 0) {
            feedbackTimer -= dt;
        }

        if (shakeTimer > 0) {
            shakeTimer -= dt;
        }

        // Movimiento suave de compuertas hacia su objetivo
        doorProgress += (targetDoorProgress - doorProgress) * (4.5 * dt);
        if (Math.abs(targetDoorProgress - doorProgress) < 0.002) {
            doorProgress = targetDoorProgress;
        }

        // Si el juego está en curso, avanzar el Giganotosaurus
        if (state === 'showing' || state === 'input' || state === 'ok' || state === 'error') {
            var currentSpeed = gigaBaseSpeed;
            if (gigaSpeedBoostTimer > 0) {
                gigaSpeedBoostTimer -= dt;
                currentSpeed += 2.8; // Aceleración por error
            }

            gigaDist -= currentSpeed * dt;

            // Rugido periódico cada 6 segundos
            screamTimer -= dt;
            if (screamTimer <= 0) {
                screamTimer = 6.0;
                playScream();
            }

            // Animación de zancadas al correr
            gigaFrameTimer += dt;
            if (gigaFrameTimer >= 0.16) {
                gigaFrameTimer = 0;
                gigaFrameIndex = (gigaFrameIndex + 1) % 2;

                // Generar polvo en cada paso
                var gh = 170 + (100 - gigaDist) * 4.2;
                var gy = 140 + (100 - gigaDist) * 1.55;
                spawnDustParticle(640, gy + gh * 0.95);
            }

            // Comprobar derrota por proximidad
            if (gigaDist <= 0 && state !== 'won' && state !== 'lost') {
                gigaDist = 0;
                handleGameLost();
            }

            updateHUD();
        }

        // Actualizar partículas
        for (var i = sparks.length - 1; i >= 0; i--) {
            var s = sparks[i];
            s.life -= dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            if (s.life <= 0) sparks.splice(i, 1);
        }

        for (var j = dustParticles.length - 1; j >= 0; j--) {
            var d = dustParticles[j];
            d.life -= dt;
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.size += 8 * dt;
            if (d.life <= 0) dustParticles.splice(j, 1);
        }
    }

    function render() {
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);

        // Agitación de pantalla por fallas / rugidos
        var ox = 0, oy = 0;
        if (shakeTimer > 0) {
            ox = (Math.random() - 0.5) * shakeIntensity;
            oy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(ox, oy);
        }

        // --------------------------------------------------------
        // CAPA 1: Fondo Run (2752x1536)
        // --------------------------------------------------------
        var fondoImg = getImage('Fondo Run.jpg');
        if (fondoImg.complete && fondoImg.naturalWidth) {
            ctx.drawImage(fondoImg, 0, 0, VW, VH);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, VW, VH);
        }

        // Efecto de niebla/polvo de fondo
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, VW, VH);

        // --------------------------------------------------------
        // CAPA 2: Giganotosaurus acercándose (Correr 1 / Correr 2)
        // --------------------------------------------------------
        renderGiganotosaurus();

        // Renderizado de partículas de polvo
        renderDustParticles();

        // --------------------------------------------------------
        // CAPA 3: Compuertas de Titanio InGen (Puerta2 izq, Puerta1 der)
        // --------------------------------------------------------
        renderDoors();

        // --------------------------------------------------------
        // CAPA 4: Consola InGen con Botones Táctiles
        // --------------------------------------------------------
        renderConsole();

        // Renderizado de chispas táctiles
        renderSparks();

        // Si el juego se perdió, renderizar pantalla de devorado
        if (state === 'lost') {
            renderLostDevourScreen();
        }

        ctx.restore();
    }

    // ------------------------------------------------------------
    // RENDERIZADO DETALLADO POR CAPAS
    // ------------------------------------------------------------
    function renderGiganotosaurus() {
        var gigaImgName = (gigaFrameIndex === 0 ? 'Correr 1.png' : 'Correr 2.png');
        var gigaImg = getImage(gigaImgName);

        // Altura y posición en base a la distancia (100 -> 0)
        var gh = 170 + (100 - gigaDist) * 4.2;
        var gw = gh * (GIGA_CROP.sw / GIGA_CROP.sh);
        var gx = 640 - gw / 2;
        var gy = 140 + (100 - gigaDist) * 1.55;

        // Sombra en el suelo bajo el dinosaurio
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(640, gy + gh * 0.96, gw * 0.38, 18 * (gh / 400), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (gigaImg.complete && gigaImg.naturalWidth) {
            ctx.drawImage(
                gigaImg,
                GIGA_CROP.sx, GIGA_CROP.sy, GIGA_CROP.sw, GIGA_CROP.sh,
                gx, gy, gw, gh
            );
        }
    }

    function renderDustParticles() {
        ctx.save();
        for (var i = 0; i < dustParticles.length; i++) {
            var d = dustParticles[i];
            var alpha = (d.life / d.maxLife) * 0.35;
            ctx.fillStyle = 'rgba(180, 160, 140, ' + alpha + ')';
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function renderDoors() {
        var p1 = getImage('Puerta1.jpg'); // Compuerta derecha ("en")
        var p2 = getImage('Puerta2.jpg'); // Compuerta izquierda ("inG")

        var doorW = 640;
        var doorH = 720;

        // Desplazamiento horizontal según doorProgress (0.0 abierta, 1.0 cerrada)
        // Puerta izq se mueve desde -640 hasta 0
        var leftX = -doorW * (1.0 - doorProgress);
        // Puerta der se mueve desde 1280 hasta 640
        var rightX = 640 + doorW * (1.0 - doorProgress);

        // Puerta Izquierda (Puerta2)
        if (p2.complete && p2.naturalWidth) {
            ctx.drawImage(p2, leftX, 0, doorW, doorH);
        } else {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(leftX, 0, doorW, doorH);
        }

        // Puerta Derecha (Puerta1)
        if (p1.complete && p1.naturalWidth) {
            ctx.drawImage(p1, rightX, 0, doorW, doorH);
        } else {
            ctx.fillStyle = '#34495e';
            ctx.fillRect(rightX, 0, doorW, doorH);
        }

        // Sombra de sellado y luces de advertencia en las compuertas
        if (doorProgress > 0) {
            ctx.save();
            // Luces de peligro superiores en el marco de la compuerta
            var lampBlink = (Math.sin(Date.now() / 200) > 0);
            ctx.fillStyle = lampBlink ? '#ff3838' : '#7f1d1d';
            ctx.shadowColor = '#ff3838';
            ctx.shadowBlur = lampBlink ? 20 : 5;
            ctx.beginPath();
            ctx.arc(leftX + doorW - 20, 40, 8, 0, Math.PI * 2);
            ctx.arc(rightX + 20, 40, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function renderConsole() {
        var consoleImg = getImage('Consola.png');
        if (feedbackType === 'ok' && feedbackTimer > 0) {
            var okImg = getImage('Ok consola.png');
            if (okImg.complete && okImg.naturalWidth) consoleImg = okImg;
        } else if (feedbackType === 'error' && feedbackTimer > 0) {
            var errImg = getImage('Error consola.png');
            if (errImg.complete && errImg.naturalWidth) consoleImg = errImg;
        }

        // Sombra proyectada por la consola hacia el fondo
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = -10;

        if (consoleImg.complete && consoleImg.naturalWidth) {
            ctx.drawImage(
                consoleImg,
                CS_CROP.sx, CS_CROP.sy, CS_CROP.sw, CS_CROP.sh,
                CONSOLE_X, CONSOLE_Y, CONSOLE_W, CONSOLE_H
            );
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(CONSOLE_X, CONSOLE_Y, CONSOLE_W, CONSOLE_H);
        }
        ctx.restore();

        // Dibujar los 10 botones interactivos
        for (var i = 0; i < 10; i++) {
            var b = getButtonBounds(i);
            var isLit = (activeLitButton === i);
            var color = BUTTON_COLORS[i];

            ctx.save();
            if (isLit) {
                // Brillo neón intenso al estar activo / presionado
                ctx.shadowColor = color;
                ctx.shadowBlur = 28;
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.85;
                roundRect(ctx, b.x, b.y, b.w, b.h, 6);
                ctx.fill();

                // Borde blanco interior resplandeciente
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // Destello central
                var radGrad = ctx.createRadialGradient(
                    b.x + b.w / 2, b.y + b.h / 2, 2,
                    b.x + b.w / 2, b.y + b.h / 2, b.w * 0.7
                );
                radGrad.addColorStop(0, '#ffffff');
                radGrad.addColorStop(0.5, color);
                radGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = radGrad;
                ctx.fill();
            } else {
                // Estado normal sutil: borde tenue y número legible
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                roundRect(ctx, b.x, b.y, b.w, b.h, 4);
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.stroke();
            }

            // Etiqueta del número del botón (1 a 10)
            ctx.font = 'bold 15px "Orbitron", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isLit ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
            ctx.fillText((i + 1), b.x + b.w / 2, b.y + b.h / 2);

            ctx.restore();
        }

        // Barra de estado de secuencia en la consola
        renderConsoleStatusBar();
    }

    function renderConsoleStatusBar() {
        ctx.save();
        var barW = CONSOLE_W * 0.65;
        var barH = 26;
        var barX = CONSOLE_X + (CONSOLE_W - barW) / 2;
        var barY = CONSOLE_Y + 18;

        ctx.fillStyle = 'rgba(5, 10, 15, 0.85)';
        ctx.strokeStyle = 'rgba(0, 210, 211, 0.4)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, barX, barY, barW, barH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (state === 'showing') {
            ctx.fillStyle = '#feca57';
            ctx.fillText('TRANSMITIENDO CÓDIGO INGEN... OBSERVA LA SECUENCIA', barX + barW / 2, barY + barH / 2);
        } else if (state === 'input') {
            ctx.fillStyle = '#00d2d3';
            var dots = '';
            for (var k = 0; k < sequence.length; k++) {
                dots += (k < playerStep ? ' ●' : ' ○');
            }
            ctx.fillText('TU TURNO: INTRODUCE EL CÓDIGO [' + dots + ' ]', barX + barW / 2, barY + barH / 2);
        } else if (state === 'ok') {
            ctx.fillStyle = '#2ecc71';
            ctx.fillText('¡CÓDIGO CORRECTO! COMPUERTAS ACCIONADAS', barX + barW / 2, barY + barH / 2);
        } else if (state === 'error') {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('¡ERROR DE FRECUENCIA! REINICIANDO SECUENCIA', barX + barW / 2, barY + barH / 2);
        }

        ctx.restore();
    }

    function renderSparks() {
        ctx.save();
        for (var i = 0; i < sparks.length; i++) {
            var s = sparks[i];
            var a = s.life / s.maxLife;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = a;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function renderLostDevourScreen() {
        var perdisteImg = getImage('Perdiste_Giganotosaurus.png');
        ctx.save();
        ctx.fillStyle = 'rgba(15, 0, 0, 0.85)';
        ctx.fillRect(0, 0, VW, VH);

        if (perdisteImg.complete && perdisteImg.naturalWidth) {
            // Ajustar imagen de derrota centrada
            var pw = 780;
            var ph = pw * (perdisteImg.naturalHeight / perdisteImg.naturalWidth);
            var px = (VW - pw) / 2;
            var py = (VH - ph) / 2;
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 45;
            ctx.drawImage(perdisteImg, px, py, pw, ph);
        }
        ctx.restore();
    }

    function roundRect(context, x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + w - r, y);
        context.quadraticCurveTo(x + w, y, x + w, y + r);
        context.lineTo(x + w, y + h - r);
        context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        context.lineTo(x + r, y + h);
        context.quadraticCurveTo(x, y + h, x, y + h - r);
        context.lineTo(x, y + r);
        context.quadraticCurveTo(x, y, x + r, y);
        context.closePath();
    }

    // ------------------------------------------------------------
    // 11. INICIO Y CONTROL DE PARTIDA
    // ------------------------------------------------------------
    function startGame() {
        document.getElementById('cg-modal-briefing').classList.remove('show');
        document.getElementById('cg-modal-win').classList.remove('show');
        document.getElementById('cg-modal-lose').classList.remove('show');

        initAudio();
        if (sndMusic && !isMuted) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }

        gigaDist = 100;
        gigaSpeedBoostTimer = 0;
        screamTimer = 5.0; // Primer rugido a los 5 segundos
        doorProgress = 0.0;
        targetDoorProgress = 0.0;
        currentRound = 0;
        sparks = [];
        dustParticles = [];

        startRound(0);
    }

    function openGame() {
        buildOverlayDOM();
        resizeCanvas();

        // Pausar música principal del sitio
        if (window.interruptBgMusic) {
            window.interruptBgMusic();
        }

        overlay.classList.add('open');
        document.getElementById('cg-modal-briefing').classList.add('show');
        document.getElementById('cg-modal-win').classList.remove('show');
        document.getElementById('cg-modal-lose').classList.remove('show');

        state = 'briefing';
        gigaDist = 100;
        doorProgress = 0.0;
        targetDoorProgress = 0.0;
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

        // Salir de pantalla completa si estaba activa
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
    // 12. EXPOSICIÓN GLOBAL
    // ------------------------------------------------------------
    window.openCapturaGiganoto = openGame;
    window.closeCapturaGiganoto = closeGame;

})();
