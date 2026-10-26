// ============================================================
//  EXPEDIENTES JURÁSICOS — SOBREVIVIR EN LA ISLA
//  MINIJUEGO: ¡ESCAPE DE SORNA!
//  Vuelo de evacuación en helicóptero InGen a través del espacio
//  aéreo de Isla Sorna, esquivando Geosternbergias y Brachiosaurus.
// ============================================================

(function () {
    'use strict';

    // Dimensiones virtuales del juego
    var LW = 1200, LH = 670;

    // Duración total del vuelo hacia la costa (segundos)
    var TOTAL_FLIGHT_TIME = 65;
    var TOTAL_DISTANCE_M = 2500; // metros

    // Estado del juego
    var state = 'idle'; // idle | briefing | playing | won | lost
    var aniFrame = null;
    var lastTime = 0;

    // Progreso del vuelo
    var flightTimer = 0;
    var progress = 0; // 0 a 100
    var distanceRemaining = TOTAL_DISTANCE_M;

    // Helicóptero
    var heli = {
        x: 160,
        y: LH / 2,
        w: 175,
        h: 95,
        vy: 0,
        speed: 380, // px/s
        pitch: 0,   // grados de inclinación
        hull: 3,    // 3 puntos de fuselaje
        maxHull: 3,
        invulnerableTimer: 0,
        rotorAngle: 0
    };

    // Partículas (humo del helicóptero y chispas)
    var particles = [];

    // Obstáculos
    var geosternbergias = [];
    var brachiosaurs = [];
    var nextGeoSpawnTimer = 1.8;
    var lastGeoRoarTime = -10;

    // Escala del canvas y responsive
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;

    // Entrada del usuario
    var keys = {
        up: false,
        down: false
    };
    var touchTargetY = null;

    // Sonidos e imágenes
    var imagesCache = {};
    var sndMusic = null;
    var activeRoars = [];
    var isMuted = false;
    var audioCtx = null;

    // Lista de Brachiosaurus pre-planificados (en % de progreso)
    var BRACHIO_TRIGGERS = [
        { progress: 66, spawned: false },
        { progress: 74, spawned: false },
        { progress: 82, spawned: false }
    ];

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('escape-sorna-styles')) return;
        var style = document.createElement('style');
        style.id = 'escape-sorna-styles';
        style.textContent = [
            '#eds-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: rgba(2, 6, 4, 0.98); backdrop-filter: blur(8px);',
            '    display: none; flex-direction: column;',
            '    font-family: "Share Tech Mono", monospace; color: #fff;',
            '    user-select: none;',
            '}',
            '#eds-overlay.open { display: flex; animation: eds-fade-in 0.25s ease-out; }',
            '@keyframes eds-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '',
            '/* Header de control */',
            '#eds-header {',
            '    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;',
            '    padding: 0.55rem 1.4rem; background: rgba(4, 16, 10, 0.96);',
            '    border-bottom: 2px solid rgba(0, 210, 211, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.85); z-index: 10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#eds-header-left { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }',
            '#eds-header-title {',
            '    font-family: "Orbitron", monospace; font-size: 0.95rem; font-weight: 900;',
            '    color: #00d2d3; letter-spacing: 1.5px; text-transform: uppercase;',
            '}',
            '#eds-distance-pill {',
            '    background: rgba(0, 210, 211, 0.15); border: 1px solid rgba(0, 210, 211, 0.4);',
            '    padding: 0.2rem 0.65rem; border-radius: 3px; font-size: 0.8rem;',
            '    color: #00d2d3; letter-spacing: 1px;',
            '}',
            '#eds-hull-box {',
            '    font-family: "Orbitron", monospace; font-size: 0.82rem; font-weight: 700;',
            '    color: #2ecc71; padding: 0.2rem 0.65rem; background: rgba(46, 204, 113, 0.15);',
            '    border: 1px solid rgba(46, 204, 113, 0.4); border-radius: 3px;',
            '}',
            '#eds-hull-box.warning { color: #f39c12; background: rgba(243, 156, 18, 0.2); border-color: #f39c12; }',
            '#eds-hull-box.critical { color: #ff6b6b; background: rgba(231, 76, 60, 0.25); border-color: #e74c3c; animation: eds-blink 0.5s infinite; }',
            '@keyframes eds-blink { 50% { opacity: 0.4; } }',
            '',
            '#eds-header-right { display: flex; align-items: center; gap: 8px; }',
            '.eds-btn-header {',
            '    background: rgba(0, 210, 211, 0.15); border: 1px solid #00d2d3; color: #00d2d3;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.8rem; border-radius: 3px; cursor: pointer;',
            '    letter-spacing: 1px; transition: all 0.2s;',
            '    display: inline-flex; align-items: center; gap: 5px;',
            '}',
            '.eds-btn-header:hover { background: #00d2d3; color: #020b06; }',
            '#eds-close-btn {',
            '    background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ff6b6b;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.9rem; border-radius: 3px; cursor: pointer; transition: all 0.2s;',
            '}',
            '#eds-close-btn:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* Canvas Wrap y Stage */',
            '#eds-canvas-wrap {',
            '    flex: 1; position: relative; display: flex; align-items: center;',
            '    justify-content: center; overflow: hidden; background: #020604;',
            '}',
            '#eds-canvas-stage { position: relative; overflow: hidden; box-shadow: 0 0 35px rgba(0,0,0,0.9); }',
            '#eds-canvas { display: block; }',
            '',
            '/* HUD en Canvas: Barra de progreso a la costa */',
            '#eds-progress-bar-wrap {',
            '    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);',
            '    width: 60%; max-width: 520px; background: rgba(0, 20, 15, 0.8);',
            '    border: 1px solid rgba(0, 210, 211, 0.4); border-radius: 4px; padding: 4px 6px;',
            '    z-index: 15; box-shadow: 0 4px 15px rgba(0,0,0,0.8);',
            '}',
            '#eds-progress-bar-fill {',
            '    height: 10px; background: linear-gradient(90deg, #00d2d3, #2ecc71);',
            '    border-radius: 2px; width: 0%; transition: width 0.15s linear;',
            '}',
            '#eds-progress-text {',
            '    display: flex; justify-content: space-between; font-size: 0.72rem;',
            '    color: #a8f5f5; margin-top: 3px; letter-spacing: 1px;',
            '}',
            '',
            '/* Controles táctiles virtuales para celulares */',
            '#eds-touch-controls {',
            '    position: absolute; bottom: 20px; right: 20px; z-index: 25;',
            '    display: none; flex-direction: column; gap: 12px;',
            '}',
            '.eds-touch-btn {',
            '    width: 62px; height: 62px; border-radius: 50%;',
            '    background: rgba(0, 210, 211, 0.25); border: 2px solid #00d2d3;',
            '    color: #00d2d3; font-family: "Orbitron", monospace; font-size: 1.4rem;',
            '    font-weight: 900; display: flex; align-items: center; justify-content: center;',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.8); backdrop-filter: blur(4px);',
            '    user-select: none; touch-action: none;',
            '}',
            '.eds-touch-btn:active { background: #00d2d3; color: #02120e; transform: scale(0.94); }',
            '@media (max-width: 900px) {',
            '    #eds-touch-controls { display: flex; }',
            '}',
            '',
            '/* Banner de alerta */',
            '#eds-warning-banner {',
            '    position: absolute; top: 60px; left: 50%; transform: translateX(-50%);',
            '    background: rgba(231, 76, 60, 0.9); border: 2px solid #ff6b6b;',
            '    color: #fff; font-family: "Orbitron", monospace; font-size: 0.95rem;',
            '    font-weight: 900; letter-spacing: 2px; padding: 0.45rem 1.4rem;',
            '    border-radius: 4px; box-shadow: 0 0 25px rgba(231, 76, 60, 0.8);',
            '    z-index: 20; display: none; text-transform: uppercase;',
            '    animation: eds-blink 0.4s infinite;',
            '}',
            '',
            '/* Pantallas modales (Briefing / Victoria / Derrota) */',
            '.eds-modal-screen {',
            '    position: absolute; inset: 0; z-index: 40; display: none;',
            '    flex-direction: column; align-items: center; justify-content: center;',
            '    text-align: center; background: rgba(2, 6, 4, 0.94); backdrop-filter: blur(8px);',
            '    padding: 1.5rem; box-sizing: border-box;',
            '}',
            '.eds-modal-screen.show { display: flex; animation: eds-fade-in 0.25s ease-out; }',
            '.eds-modal-title { font-family: "Orbitron", monospace; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.8rem; }',
            '.eds-modal-desc { font-size: 0.95rem; line-height: 1.6; max-width: 650px; color: #ddd; margin-bottom: 1.6rem; }',
            '.eds-modal-tip { background: rgba(0, 210, 211, 0.1); border: 1px solid rgba(0, 210, 211, 0.3); padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.85rem; color: #00d2d3; margin-bottom: 1.4rem; max-width: 550px; }',
            '.eds-btn {',
            '    font-family: "Orbitron", monospace; font-size: 0.88rem; font-weight: 700;',
            '    letter-spacing: 1.5px; padding: 0.75rem 2rem; border-radius: 4px;',
            '    cursor: pointer; border: none; transition: all 0.2s; text-transform: uppercase;',
            '}',
            '.eds-btn-cyan { background: #00d2d3; color: #02120e; box-shadow: 0 0 20px rgba(0, 210, 211, 0.5); }',
            '.eds-btn-cyan:hover { background: #48dbfb; box-shadow: 0 0 35px rgba(72, 219, 251, 0.8); transform: translateY(-2px); }',
            '.eds-btn-green { background: #2ecc71; color: #02140a; box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }',
            '.eds-btn-green:hover { background: #55efc4; box-shadow: 0 0 35px rgba(85, 239, 196, 0.8); transform: translateY(-2px); }',
            '.eds-btn-red { background: #e74c3c; color: #fff; box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }',
            '.eds-btn-red:hover { background: #ff4757; box-shadow: 0 0 35px rgba(255, 71, 87, 0.8); transform: translateY(-2px); }'
        ].join('\n');
        document.head.appendChild(style);
    }

    // ============================================================
    //  LOADER CON FALLBACK (RAÍZ Y SUBDIRECTORIO)
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudioWithFallback(filename, loop, vol) {
        var a = new Audio();
        if (loop) a.loop = true;
        if (typeof vol === 'number') a.volume = vol;
        var triedFolder = false;
        a.src = resolveURI(filename);
        a.addEventListener('error', function () {
            if (!triedFolder) {
                triedFolder = true;
                a.src = 'Escape%20de%20Sorna/' + resolveURI(filename);
            }
        });
        return a;
    }

    function getImage(filename) {
        if (imagesCache[filename]) return imagesCache[filename];
        var img = new Image();
        img.onload = function () {
            if (state === 'playing') render();
        };
        img.onerror = function () {
            // Intentar con subdirectorio
            if (img.src.indexOf('Escape%20de%20Sorna') === -1 && img.src.indexOf('Escape de Sorna') === -1) {
                img.src = 'Escape%20de%20Sorna/' + resolveURI(filename);
            } else if (filename === 'Fondo movible.png') {
                // Si falla el PNG de 84MB, usar la versión optimizada en JPG
                img.src = 'Fondo%20movible.jpg';
            }
        };
        img.src = resolveURI(filename);
        imagesCache[filename] = img;
        return img;
    }

    function preloadAll() {
        ['Helicoptero Model.png', 'Geosternbergia Model.png', 'Brachiosaurus Model.png', 'Fondo movible.png', 'Fondo movible.jpg'].forEach(getImage);
    }

    function initAudio() {
        try {
            sndMusic = createAudioWithFallback('Sorna.mp4', true, 0.7);
        } catch (e) {}
    }

    function stopAllAudio() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        activeRoars.forEach(function (r) {
            try { r.pause(); } catch (e) {}
        });
        activeRoars = [];
    }

    function playRoar(filename, vol) {
        if (isMuted) return;
        try {
            var roar = createAudioWithFallback(filename, false, typeof vol === 'number' ? vol : 1.0);
            roar.play().catch(function(){});
            activeRoars.push(roar);
            roar.addEventListener('ended', function () {
                var idx = activeRoars.indexOf(roar);
                if (idx !== -1) activeRoars.splice(idx, 1);
            });
        } catch (e) {}
    }

    // Efectos de sonido sintetizados Web Audio (impactos, alarmas)
    function playSynthBeep(freq, type, duration) {
        if (isMuted) return;
        try {
            if (!audioCtx) {
                var AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtx = new AudioContext();
            }
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    // ============================================================
    //  CONSTRUCCIÓN DEL DOM
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'eds-overlay';

        // Header
        var header = document.createElement('div');
        header.id = 'eds-header';

        var hLeft = document.createElement('div');
        hLeft.id = 'eds-header-left';

        var title = document.createElement('div');
        title.id = 'eds-header-title';
        title.innerHTML = '🚁 ESCAPE DE LA ISLA SORNA — SOBREVIVIR EN LA ISLA';

        var distPill = document.createElement('div');
        distPill.id = 'eds-distance-pill';
        distPill.textContent = 'META: ESCAPAR DE ISLA SORNA | COSTA: 2,500 M';

        var hullBox = document.createElement('div');
        hullBox.id = 'eds-hull-box';
        hullBox.textContent = '🛡️ FUSELAJE: 3/3 (100%)';

        hLeft.appendChild(title);
        hLeft.appendChild(distPill);
        hLeft.appendChild(hullBox);

        var hRight = document.createElement('div');
        hRight.id = 'eds-header-right';

        var muteBtn = document.createElement('button');
        muteBtn.id = 'eds-mute-btn';
        muteBtn.className = 'eds-btn-header';
        muteBtn.innerHTML = '🔊 SONIDO';
        muteBtn.addEventListener('click', function () {
            isMuted = !isMuted;
            if (isMuted) {
                muteBtn.innerHTML = '🔇 SILENCIO';
                if (sndMusic) sndMusic.muted = true;
                activeRoars.forEach(function (r) { r.muted = true; });
            } else {
                muteBtn.innerHTML = '🔊 SONIDO';
                if (sndMusic) sndMusic.muted = false;
                activeRoars.forEach(function (r) { r.muted = false; });
            }
        });

        var fullBtn = document.createElement('button');
        fullBtn.id = 'eds-fullscreen-btn';
        fullBtn.className = 'eds-btn-header';
        fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('eds-overlay') || document.documentElement;
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                fullBtn.innerHTML = '🗗 SALIR';
            } else {
                if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
            }
        });
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
            else fullBtn.innerHTML = '🗗 SALIR';
        });

        var closeBtn = document.createElement('button');
        closeBtn.id = 'eds-close-btn';
        closeBtn.textContent = '✕ CERRAR';
        closeBtn.addEventListener('click', closeGame);

        hRight.appendChild(muteBtn);
        hRight.appendChild(fullBtn);
        hRight.appendChild(closeBtn);

        header.appendChild(hLeft);
        header.appendChild(hRight);
        ov.appendChild(header);

        // Canvas Wrap
        var wrap = document.createElement('div');
        wrap.id = 'eds-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'eds-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'eds-canvas';
        stage.appendChild(canvas);

        // Barra de progreso hacia la costa
        var progWrap = document.createElement('div');
        progWrap.id = 'eds-progress-bar-wrap';
        progWrap.innerHTML = [
            '<div id="eds-progress-bar-fill"></div>',
            '<div id="eds-progress-text">',
            '    <span>BASE INGEN</span>',
            '    <span id="eds-prog-pct">0%</span>',
            '    <span>META: ESCAPE DE LA ISLA</span>',
            '</div>'
        ].join('');
        stage.appendChild(progWrap);

        // Banner de advertencia (Colosos en el valle)
        var warnBanner = document.createElement('div');
        warnBanner.id = 'eds-warning-banner';
        warnBanner.textContent = '⚠️ ¡ALERTA! COLOSOS EN EL VALLE';
        stage.appendChild(warnBanner);

        // Controles táctiles virtuales para celulares
        var touchWrap = document.createElement('div');
        touchWrap.id = 'eds-touch-controls';
        touchWrap.innerHTML = [
            '<button class="eds-touch-btn" id="eds-touch-up">▲</button>',
            '<button class="eds-touch-btn" id="eds-touch-down">▼</button>'
        ].join('');
        stage.appendChild(touchWrap);

        // Pantalla de Inicio / Briefing
        var briefScreen = document.createElement('div');
        briefScreen.id = 'eds-brief-screen';
        briefScreen.className = 'eds-modal-screen show';
        briefScreen.innerHTML = [
            '<div class="eds-modal-title" style="color:#00d2d3;">🚁 META: ESCAPAR DE LA ISLA SORNA</div>',
            '<div class="eds-modal-desc">',
            'El helipuerto principal de InGen ha caído. Tu objetivo principal es <strong>ESCAPAR DE LA ISLA SORNA</strong> pilotando el helicóptero de rescate a través del espacio aéreo hostil hasta cruzar la costa hacia aguas internacionales.<br><br>',
            '• <strong>Geosternbergias:</strong> Bandadas de pterosaurios territoriales te interceptarán en vuelo; mientras más avances, más veloces serán.<br>',
            '• <strong>Brachiosaurus:</strong> En el valle profundo, colosales saurópodos emergen del dosel vegetal. ¡Elude sus inmensos cuellos para no estrellarte!',
            '</div>',
            '<div class="eds-modal-tip">',
            '🎮 <strong>CONTROLES:</strong> Usa las <strong>Flechas Arriba / Abajo</strong> o las teclas <strong>W / S</strong>. En celulares, desliza tu dedo en la pantalla o usa los botones virtuales ▲ / ▼.',
            '</div>',
            '<button class="eds-btn eds-btn-cyan" id="eds-btn-start">DESPEGAR HELICÓPTERO ▶</button>'
        ].join('');
        stage.appendChild(briefScreen);

        // Pantalla de Victoria (Escape Exitoso)
        var winScreen = document.createElement('div');
        winScreen.id = 'eds-win-screen';
        winScreen.className = 'eds-modal-screen';
        winScreen.innerHTML = [
            '<div class="eds-modal-title" style="color:#2ecc71;">🎉 ¡HAS ESCAPADO DE LA ISLA SORNA!</div>',
            '<div class="eds-modal-desc">',
            '¡Has alcanzado las aguas abiertas del Pacífico! Has logrado esquivar las feroces arremetidas de los Geosternbergias y sobrevolar los colosales cuellos de los Brachiosaurus sin destruir la aeronave.<br><br>',
            '<strong style="color:#2ecc71;">¡LA TRIPULACIÓN ESTÁ A SALVO EN RUMBO A TIERRA FIRME!</strong>',
            '</div>',
            '<button class="eds-btn eds-btn-green" id="eds-btn-win-replay">VOLVER A VOLAR ↺</button>'
        ].join('');
        stage.appendChild(winScreen);

        // Pantalla de Derrota (Helicóptero Derribado)
        var loseScreen = document.createElement('div');
        loseScreen.id = 'eds-lose-screen';
        loseScreen.className = 'eds-modal-screen';
        loseScreen.innerHTML = [
            '<div class="eds-modal-title" style="color:#ff6b6b;">💥 HELICÓPTERO DERRIBADO</div>',
            '<div class="eds-modal-desc">',
            'El fuselaje del helicóptero no soportó los impactos y la aeronave se precipitó sobre la espesura de Isla Sorna.<br><br>',
            '<strong style="color:#ff6b6b;">DEBERÁS INICIAR UNA NUEVA MANIOBRA DE EVACUACIÓN.</strong>',
            '</div>',
            '<button class="eds-btn eds-btn-red" id="eds-btn-lose-retry">REINTENTAR ESCAPE ↺</button>'
        ].join('');
        stage.appendChild(loseScreen);

        wrap.appendChild(stage);
        ov.appendChild(wrap);
        document.body.appendChild(ov);

        // Eventos de botones
        document.getElementById('eds-btn-start').addEventListener('click', startGame);
        document.getElementById('eds-btn-win-replay').addEventListener('click', startGame);
        document.getElementById('eds-btn-lose-retry').addEventListener('click', startGame);

        // Eventos táctiles para botones virtuales
        var btnUp = document.getElementById('eds-touch-up');
        var btnDown = document.getElementById('eds-touch-down');

        function setupTouchBtn(btn, key) {
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                keys[key] = true;
            }, { passive: false });
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                keys[key] = false;
            }, { passive: false });
            btn.addEventListener('mousedown', function() { keys[key] = true; });
            btn.addEventListener('mouseup', function() { keys[key] = false; });
            btn.addEventListener('mouseleave', function() { keys[key] = false; });
        }
        setupTouchBtn(btnUp, 'up');
        setupTouchBtn(btnDown, 'down');

        // Arrastre táctil directo en el canvas
        canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', function () { touchTargetY = null; }, { passive: false });

        function handleTouchMove(e) {
            if (state !== 'playing') return;
            e.preventDefault();
            var rect = canvas.getBoundingClientRect();
            var touch = e.touches[0];
            if (touch) {
                var cy = (touch.clientY - rect.top) / scale;
                touchTargetY = cy;
            }
        }
    }

    // ============================================================
    //  EVENTOS DE TECLADO
    // ============================================================
    window.addEventListener('keydown', function (e) {
        var ov = document.getElementById('eds-overlay');
        if (!ov || !ov.classList.contains('open')) return;

        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            keys.up = true;
            touchTargetY = null;
            e.preventDefault();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            keys.down = true;
            touchTargetY = null;
            e.preventDefault();
        } else if (e.key === 'Escape') {
            closeGame();
        }
    });

    window.addEventListener('keyup', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            keys.up = false;
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            keys.down = false;
        }
    });

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('eds-canvas-wrap');
        if (!wrap || !canvas || !stage) return;
        var vw = wrap.clientWidth  || window.innerWidth;
        var vh = wrap.clientHeight || (window.innerHeight - 80);
        scale   = Math.min(vw / LW, vh / LH);
        canvasW = Math.round(LW * scale);
        canvasH = Math.round(LH * scale);
        canvas.width  = canvasW;
        canvas.height = canvasH;
        stage.style.width  = canvasW + 'px';
        stage.style.height = canvasH + 'px';
        render();
    }

    function showModal(id) {
        ['eds-brief-screen', 'eds-win-screen', 'eds-lose-screen'].forEach(function(s) {
            var el = document.getElementById(s);
            if (el) el.classList.remove('show');
        });
        if (id) {
            var target = document.getElementById(id);
            if (target) target.classList.add('show');
        }
    }

    // ============================================================
    //  LÓGICA DEL JUEGO
    // ============================================================
    function startGame() {
        showModal(null);
        state = 'playing';

        flightTimer = 0;
        progress = 0;
        distanceRemaining = TOTAL_DISTANCE_M;

        heli.y = LH / 2;
        heli.vy = 0;
        heli.pitch = 0;
        heli.hull = heli.maxHull;
        heli.invulnerableTimer = 0;

        particles = [];
        geosternbergias = [];
        brachiosaurs = [];
        nextGeoSpawnTimer = 1.5;
        lastGeoRoarTime = -10;

        BRACHIO_TRIGGERS.forEach(function (b) { b.spawned = false; });

        var warnBanner = document.getElementById('eds-warning-banner');
        if (warnBanner) warnBanner.style.display = 'none';

        updateHUD();

        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function(){});
        }

        lastTime = performance.now();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        aniFrame = requestAnimationFrame(gameLoop);
    }

    function updateHUD() {
        var distEl = document.getElementById('eds-distance-pill');
        var hullEl = document.getElementById('eds-hull-box');
        var barFill = document.getElementById('eds-progress-bar-fill');
        var pctEl   = document.getElementById('eds-prog-pct');

        if (distEl) {
            distEl.textContent = 'META: ESCAPE DE SORNA | COSTA: ' + Math.max(0, Math.round(distanceRemaining)).toLocaleString() + ' M';
        }

        if (pctEl) {
            pctEl.textContent = Math.min(100, Math.round(progress)) + '%';
        }

        if (barFill) {
            barFill.style.width = Math.min(100, progress) + '%';
        }

        if (hullEl) {
            var pctHull = Math.round((heli.hull / heli.maxHull) * 100);
            hullEl.textContent = '🛡️ FUSELAJE: ' + heli.hull + '/' + heli.maxHull + ' (' + pctHull + '%)';
            hullEl.className = '';
            if (heli.hull === 2) hullEl.className = 'warning';
            else if (heli.hull <= 1) hullEl.className = 'critical';
        }
    }

    function gameLoop(now) {
        if (state !== 'playing') return;
        var dt = Math.min(0.06, (now - lastTime) / 1000);
        lastTime = now;

        update(dt);
        render();

        aniFrame = requestAnimationFrame(gameLoop);
    }

    // ============================================================
    //  ACTUALIZACIÓN FÍSICA Y ENTIDADES
    // ============================================================
    function update(dt) {
        // Progreso temporal
        flightTimer += dt;
        progress = (flightTimer / TOTAL_FLIGHT_TIME) * 100;
        distanceRemaining = TOTAL_DISTANCE_M * (1 - (flightTimer / TOTAL_FLIGHT_TIME));

        updateHUD();

        // Verificar victoria
        if (flightTimer >= TOTAL_FLIGHT_TIME) {
            triggerWin();
            return;
        }

        // Movimiento del helicóptero
        var targetVy = 0;
        if (touchTargetY !== null) {
            var diff = touchTargetY - (heli.y + heli.h / 2);
            if (Math.abs(diff) > 12) {
                targetVy = (diff > 0 ? 1 : -1) * heli.speed;
            }
        } else {
            if (keys.up) targetVy -= heli.speed;
            if (keys.down) targetVy += heli.speed;
        }

        // Aceleración suave
        heli.vy += (targetVy - heli.vy) * 10 * dt;
        heli.y += heli.vy * dt;

        // Inclinación aerodinámica
        var targetPitch = (heli.vy / heli.speed) * 9;
        heli.pitch += (targetPitch - heli.pitch) * 8 * dt;

        // Límites verticales de vuelo
        var minY = 35;
        var maxY = LH - heli.h - 45;
        if (heli.y < minY) { heli.y = minY; heli.vy = 0; }
        if (heli.y > maxY) { heli.y = maxY; heli.vy = 0; }

        // Rotor
        heli.rotorAngle += dt * 35;

        // Invulnerabilidad
        if (heli.invulnerableTimer > 0) {
            heli.invulnerableTimer -= dt;
        }

        // Partículas de daño del helicóptero
        if (heli.hull < heli.maxHull) {
            var pRate = (heli.hull === 1) ? 0.03 : 0.08;
            if (Math.random() < dt / pRate) {
                particles.push({
                    x: heli.x + 25,
                    y: heli.y + 35,
                    vx: -120 - Math.random() * 60,
                    vy: (Math.random() - 0.5) * 40,
                    size: 4 + Math.random() * 6,
                    maxLife: 0.6 + Math.random() * 0.4,
                    life: 0,
                    color: (heli.hull === 1 && Math.random() > 0.4) ? '#f39c12' : '#888'
                });
            }
        }

        // Actualizar partículas
        for (var p = particles.length - 1; p >= 0; p--) {
            var pt = particles[p];
            pt.life += dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.size += dt * 8;
            if (pt.life >= pt.maxLife) {
                particles.splice(p, 1);
            }
        }

        // ========================================================
        // GENERACIÓN Y MOVIMIENTO DE GEOSTERNBERGIAS
        // ========================================================
        nextGeoSpawnTimer -= dt;
        if (nextGeoSpawnTimer <= 0 && progress < 94) {
            // Frecuencia de aparición más intensa a medida que avanza
            var baseInterval = Math.max(1.1, 2.8 - (progress / 100) * 1.6);
            nextGeoSpawnTimer = baseInterval + Math.random() * 0.7;

            // Velocidad: mientras más avanza, más rápido se mueven
            var speed = 330 + (progress / 100) * 220 + Math.random() * 60;
            var spawnY = 50 + Math.random() * (LH - 200);

            geosternbergias.push({
                x: LW + 120,
                baseY: spawnY,
                y: spawnY,
                w: 145,
                h: 75,
                speed: speed,
                sineOffset: Math.random() * Math.PI * 2,
                sineFreq: 2.5 + Math.random() * 2,
                sineAmp: 25 + Math.random() * 30
            });

            // Reproducir rugido del Geosternbergia al aparecer (con cooldown)
            if (flightTimer - lastGeoRoarTime > 5.0) {
                lastGeoRoarTime = flightTimer;
                playRoar('Geosternbergia Roar.mp4', 0.85);
            }
        }

        // Mover Geosternbergias
        for (var g = geosternbergias.length - 1; g >= 0; g--) {
            var geo = geosternbergias[g];
            geo.x -= geo.speed * dt;
            geo.y = geo.baseY + Math.sin(flightTimer * geo.sineFreq + geo.sineOffset) * geo.sineAmp;

            // Colisión con helicóptero
            if (heli.invulnerableTimer <= 0 && checkCollision(heli, geo, 22, 18)) {
                handleHit('geosternbergia');
                geosternbergias.splice(g, 1);
                continue;
            }

            // Fuera de pantalla
            if (geo.x < -geo.w - 50) {
                geosternbergias.splice(g, 1);
            }
        }

        // ========================================================
        // GENERACIÓN Y MOVIMIENTO DE BRACHIOSAURUS
        // ========================================================
        BRACHIO_TRIGGERS.forEach(function (trigger) {
            if (!trigger.spawned && progress >= trigger.progress) {
                trigger.spawned = true;

                // Dimensiones del coloso con proporción anatómica exacta
                var bh = 480;
                var bw = Math.round(bh * (1089 / 1254)); // 417

                brachiosaurs.push({
                    x: LW + 140,
                    y: LH - bh + 20, // emerge desde la base del dosel
                    w: bw,
                    h: bh,
                    speed: 210, // se mueve con la velocidad del paisaje
                    swayOffset: Math.random() * Math.PI
                });

                // Alerta en HUD
                var warnBanner = document.getElementById('eds-warning-banner');
                if (warnBanner) {
                    warnBanner.style.display = 'block';
                    setTimeout(function () {
                        if (warnBanner) warnBanner.style.display = 'none';
                    }, 3500);
                }

                // Rugido profundo del Brachiosaurus al aparecer
                playRoar('Brachiosaurus Roar.mp4', 1.0);
            }
        });

        // Mover Brachiosaurus
        for (var b = brachiosaurs.length - 1; b >= 0; b--) {
            var brach = brachiosaurs[b];
            brach.x -= brach.speed * dt;

            // Cuello oscila sutilmente
            brach.currentY = brach.y + Math.sin(flightTimer * 1.5 + brach.swayOffset) * 8;

            // Colisión con cuello y cabeza del Brachiosaurus
            // El Brachiosaurus es un obstáculo alto en x=[brach.x+50, brach.x+170]
            if (heli.invulnerableTimer <= 0 && checkBrachioCollision(heli, brach)) {
                handleHit('brachiosaurus');
            }

            if (brach.x < -brach.w - 80) {
                brachiosaurs.splice(b, 1);
            }
        }
    }

    // ============================================================
    //  COLISIONES Y DAÑO
    // ============================================================
    function checkCollision(h, obj, padX, padY) {
        var hx = h.x + padX;
        var hy = h.y + padY;
        var hw = h.w - padX * 2;
        var hh = h.h - padY * 2;

        var ox = obj.x + padX;
        var oy = obj.y + padY;
        var ow = obj.w - padX * 2;
        var oh = obj.h - padY * 2;

        return (hx < ox + ow && hx + hw > ox && hy < oy + oh && hy + hh > oy);
    }

    function checkBrachioCollision(h, b) {
        var hx = h.x + 25;
        var hy = h.y + 18;
        var hw = h.w - 50;
        var hh = h.h - 36;

        // Hitbox cuello superior y cabeza (zona más crítica para el vuelo)
        var headX = b.x + 40;
        var headY = b.currentY + 15;
        var headW = 140;
        var headH = 260;

        if (hx < headX + headW && hx + hw > headX && hy < headY + headH && hy + hh > headY) {
            return true;
        }

        // Hitbox cuerpo inferior
        var bodyX = b.x + 80;
        var bodyY = b.currentY + 260;
        var bodyW = b.w - 120;
        var bodyH = 220;

        return (hx < bodyX + bodyW && hx + hw > bodyX && hy < bodyY + bodyH && hy + hh > bodyY);
    }

    function handleHit(source) {
        heli.hull--;
        heli.invulnerableTimer = 1.6;
        updateHUD();

        // Chispas de impacto
        for (var i = 0; i < 20; i++) {
            particles.push({
                x: heli.x + heli.w / 2,
                y: heli.y + heli.h / 2,
                vx: (Math.random() - 0.5) * 260,
                vy: (Math.random() - 0.5) * 260,
                size: 3 + Math.random() * 5,
                maxLife: 0.4 + Math.random() * 0.3,
                life: 0,
                color: Math.random() > 0.3 ? '#ff4757' : '#ffa502'
            });
        }

        // Audio del impacto
        playSynthBeep(140, 'sawtooth', 0.28);
        if (source === 'geosternbergia') {
            playRoar('Geosternbergia Roar.mp4', 1.0);
        } else if (source === 'brachiosaurus') {
            playRoar('Brachiosaurus Roar.mp4', 1.0);
        }

        if (heli.hull <= 0) {
            triggerLose();
        }
    }

    function triggerWin() {
        state = 'won';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        render();
        showModal('eds-win-screen');
    }

    function triggerLose() {
        state = 'lost';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        render();
        showModal('eds-lose-screen');
    }

    // ============================================================
    //  RENDERIZADO EN CANVAS
    // ============================================================
    function render() {
        if (!ctx || !canvas) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ========================================================
        // 1. FONDO MOVIBLE INTERACTIVO
        // ========================================================
        var bgImg = getImage('Fondo movible.png');
        if (!bgImg.complete || !bgImg.naturalWidth) {
            bgImg = getImage('Fondo movible.jpg');
        }

        if (bgImg.complete && bgImg.naturalWidth) {
            // El fondo mide 16384 x 2455
            var aspect = LW / LH;
            var srcH = bgImg.naturalHeight;
            var srcW = srcH * aspect; // recorte proporcional al canvas 1200x670
            var maxSrcX = Math.max(0, bgImg.naturalWidth - srcW);
            var curSrcX = (progress / 100) * maxSrcX;

            ctx.drawImage(bgImg, curSrcX, 0, srcW, srcH, 0, 0, canvasW, canvasH);
        } else {
            // Fallback de degradado atmosférico
            var grad = ctx.createLinearGradient(0, 0, 0, canvasH);
            grad.addColorStop(0, '#1a102f');
            grad.addColorStop(0.4, '#e17055');
            grad.addColorStop(0.7, '#2d3436');
            grad.addColorStop(1, '#0c2417');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // ========================================================
        // 2. BRACHIOSAURUS (COLOSOS EMERGENTES)
        // ========================================================
        var brachImg = getImage('Brachiosaurus Model.png');
        if (brachImg.complete && brachImg.naturalWidth) {
            for (var b = 0; b < brachiosaurs.length; b++) {
                var br = brachiosaurs[b];
                var bx = br.x * scale;
                var by = (br.currentY || br.y) * scale;
                var bw = br.w * scale;
                var bh = br.h * scale;

                ctx.save();
                // Proporción anatómica original: bounding box (824, 45, 1089, 1254)
                ctx.drawImage(brachImg, 824, 45, 1089, 1254, bx, by, bw, bh);
                ctx.restore();
            }
        }

        // ========================================================
        // 3. GEOSTERNBERGIAS (PTEROSAURIOS)
        // ========================================================
        var geoImg = getImage('Geosternbergia Model.png');
        if (geoImg.complete && geoImg.naturalWidth) {
            for (var g = 0; g < geosternbergias.length; g++) {
                var ge = geosternbergias[g];
                var gx = ge.x * scale;
                var gy = ge.y * scale;
                var gw = ge.w * scale;
                var gh = ge.h * scale;

                ctx.save();
                // Recorte ajustado de la textura (176, 109, 2136, 1063)
                ctx.drawImage(geoImg, 170, 100, 2150, 1080, gx, gy, gw, gh);
                ctx.restore();
            }
        }

        // ========================================================
        // 4. PARTÍCULAS (HUMO Y CHISPAS)
        // ========================================================
        for (var p = 0; p < particles.length; p++) {
            var pt = particles[p];
            var alpha = 1 - (pt.life / pt.maxLife);
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(pt.x * scale, pt.y * scale, pt.size * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // ========================================================
        // 5. HELICÓPTERO INGEN
        // ========================================================
        var heliImg = getImage('Helicoptero Model.png');
        if (heliImg.complete && heliImg.naturalWidth) {
            var hx = heli.x * scale;
            var hy = heli.y * scale;
            var hw = heli.w * scale;
            var hh = heli.h * scale;

            ctx.save();
            ctx.translate(hx + hw / 2, hy + hh / 2);
            ctx.rotate((heli.pitch * Math.PI) / 180);

            // Efecto de parpadeo por invulnerabilidad
            if (heli.invulnerableTimer > 0) {
                ctx.globalAlpha = (Math.floor(performance.now() / 80) % 2 === 0) ? 0.35 : 0.9;
            }

            // Recorte ajustado de la textura (122, 113, 2173, 1132)
            ctx.drawImage(heliImg, 120, 110, 2180, 1140, -hw / 2, -hh / 2, hw, hh);

            // Simulación visual de aspas del rotor girando
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            var rotorW = hw * 1.15;
            var rotorH = 3 * scale;
            var rotorY = -hh / 2 + 5 * scale;
            var rotorOsc = Math.sin(heli.rotorAngle) * rotorW;
            ctx.fillRect(-rotorOsc / 2, rotorY, rotorOsc, rotorH);

            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  CONTROL DE APERTURA Y CIERRE
    // ============================================================
    function openGame() {
        var ov = document.getElementById('eds-overlay');
        if (!ov) return;
        ov.classList.add('open');

        if (!ctx) ctx = canvas.getContext('2d');
        resize();

        state = 'briefing';
        showModal('eds-brief-screen');

        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function(){});
        }
    }

    function closeGame() {
        var ov = document.getElementById('eds-overlay');
        if (ov) ov.classList.remove('open');
        stopAllAudio();
        state = 'idle';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        showModal(null);
    }

    // Exponer globalmente
    window.openEscapeSorna = openGame;

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        buildOverlay();
        preloadAll();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('eds-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
