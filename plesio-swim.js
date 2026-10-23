// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡ESCAPE DEL PLESIOSAURUS! (PLESIO SWIM)
//  Minijuego: Bucea velozmente en el recinto acuático, encuentra
//  las 4 llaves escondidas en rocas y corales, sal a respirar
//  cada 10 segundos y esquiva los ataques del Plesiosaurus.
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('plesio-swim-fab')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×670) ----
    var LW = 1200, LH = 670;
    var GAME_DURATION = 120; // 2 minutos en segundos
    var OXYGEN_MAX = 10.0;    // 10 segundos máximos de oxígeno
    var TOTAL_HIDING_SPOTS = 10;
    var KEYS_TO_FIND = 4;
    var SURFACE_Y = 160;      // Nivel de la superficie del agua (donde flota el barco en el fondo)

    // Dimensiones de los sprites (esbelto y alargado como en la referencia)
    var DIVER_W = 125, DIVER_H = 56;
    var PLESIO_W = 280, PLESIO_H = 78; // Alargado y proporcionado
    var KEY_W = 46, KEY_H = 46;

    // Recortes de los sprites para eliminar los márgenes transparentes de los PNGs
    var SPRITES = {
        subIzq:    { sx: 107, sy: 361, sw: 2198, sh: 985, w: 125, h: 56 },
        subDer:    { sx: 110, sy: 362, sw: 2181, sh: 984, w: 125, h: 56 },
        plesioIzq: { sx: 116, sy: 693, sw: 2182, sh: 608, w: 280, h: 78 },
        plesioDer: { sx: 163, sy: 692, sw: 2121, sh: 604, w: 280, h: 78 },
        coral1:    { sx: 670, sy: 244, sw: 1069, sh: 841, w: 82,  h: 65 },
        coral2:    { sx: 439, sy: 154, sw: 1521, sh: 1061, w: 102, h: 71 },
        rock1:     { sx: 619, sy: 233, sw: 1161, sh: 922, w: 92,  h: 73 },
        rock2:     { sx: 319, sy: 74,  sw: 1741, sh: 1181, w: 116, h: 79 },
        key:       { sx: 720, sy: 134, sw: 1000, sh: 1060, w: 46,  h: 49 }
    };

    // ---- ESTADO DEL JUEGO ----
    var state = 'idle'; // idle | playing | won | lost_drowned | lost_time
    var timeLeft = GAME_DURATION;
    var oxygenLeft = OXYGEN_MAX;
    var keysFound = 0;

    // Buzo (Jugador)
    var diver = {
        x: 600,
        y: 120,
        vx: 0,
        vy: 0,
        speed: 260, // px/s
        facing: 1,  // 1 = derecha (Sub der), -1 = izquierda (Sub izq)
        invulnerableTimer: 0, // Inmunidad parpadeante tras golpe
        isBreathing: false
    };

    // Plesiosaurios activos
    var plesiosaurs = [];

    // Escondites (10 elementos: corales y rocas)
    var hidingSpots = [];

    // Partículas (burbujas submarinas y destellos)
    var bubbles = [];
    var floatingTexts = []; // { text, x, y, color, life, maxLife }
    var shakeTimer = 0;
    var shakeMag = 0;

    // Bucle y canvas
    var aniFrame = null;
    var lastTime = 0;
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;

    // Controles
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    var mouseTarget = null; // {x, y} si se usa mouse/touch
    var isPointerDown = false;

    // ---- IMÁGENES ----
    var imgs = {
        bg:        new Image(),
        subIzq:    new Image(),
        subDer:    new Image(),
        plesioIzq: new Image(),
        plesioDer: new Image(),
        coral1:    new Image(),
        coral2:    new Image(),
        rock1:     new Image(),
        rock2:     new Image(),
        key:       new Image()
    };

    // ---- AUDIO ----
    var sndMusic  = null;
    var sndAttack = null;

    // ============================================================
    //  RESOLUCIÓN DE ARCHIVOS (RAÍZ + CARPETA DE RESPALDO)
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudio(filename, loop, vol) {
        var primary  = resolveURI(filename);
        var fallback = 'Plesio%20Swim/' + resolveURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function () {
            if (a.src.indexOf('Plesio%20Swim') === -1 && a.src.indexOf('Plesio Swim') === -1) {
                a.src = fallback;
            }
        });
        return a;
    }

    function loadImageWithFallback(img, filename, onDone) {
        var primary  = resolveURI(filename);
        var fallback = 'Plesio%20Swim/' + resolveURI(filename);
        var finished = false;
        function markDone() {
            if (!finished) { finished = true; if (onDone) onDone(); }
        }
        img.onload  = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Plesio%20Swim') === -1 && img.src.indexOf('Plesio Swim') === -1) {
                img.src = fallback;
            } else {
                console.warn('[PlesioSwim] No se pudo cargar:', filename);
                markDone();
            }
        };
        img.src = primary;
    }

    function loadAllImages(cb) {
        var count = 0, total = Object.keys(imgs).length;
        function done() { if (++count >= total) { if (cb) cb(); } }
        loadImageWithFallback(imgs.bg,        'Fondo Ocean.jpg', done);
        loadImageWithFallback(imgs.subIzq,    'Sub izq.png',     done);
        loadImageWithFallback(imgs.subDer,    'Sub der.png',     done);
        loadImageWithFallback(imgs.plesioIzq, 'Plesio izq.png',  done);
        loadImageWithFallback(imgs.plesioDer, 'Plesio der.png',  done);
        loadImageWithFallback(imgs.coral1,    'Coral 1.png',     done);
        loadImageWithFallback(imgs.coral2,    'Coral 2.png',     done);
        loadImageWithFallback(imgs.rock1,     'Rock 1.png',      done);
        loadImageWithFallback(imgs.rock2,     'Rock 2.png',      done);
        loadImageWithFallback(imgs.key,       'Key.png',         done);
    }

    function initAudio() {
        sndMusic  = createAudio('Ocean Level.mp4',  true,  0.45);
        sndAttack = createAudio('Plesiosaurus.mp4', false, 0.95);
    }

    function playAudio(snd) {
        if (!snd) return;
        try {
            snd.currentTime = 0;
            snd.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        [sndMusic, sndAttack].forEach(function (s) {
            if (s) { try { s.pause(); s.currentTime = 0; } catch (e) {} }
        });
    }

    // Audio sintético para efectos acuáticos y recompensas
    var audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            var AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(function () {});
        }
        return audioCtx;
    }

    function playKeyFoundFX() {
        try {
            var ctxA = getAudioCtx();
            if (!ctxA) return;
            var now = ctxA.currentTime;
            var osc = ctxA.createOscillator();
            var gain = ctxA.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);       // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.3);// C6
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start(now);
            osc.stop(now + 0.56);
        } catch (e) {}
    }

    function playBreatheFX() {
        try {
            var ctxA = getAudioCtx();
            if (!ctxA) return;
            var now = ctxA.currentTime;
            var osc = ctxA.createOscillator();
            var gain = ctxA.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(580, now + 0.25);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    }

    function playErrorFX() {
        try {
            var ctxA = getAudioCtx();
            if (!ctxA) return;
            var now = ctxA.currentTime;
            var osc = ctxA.createOscillator();
            var gain = ctxA.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start(now);
            osc.stop(now + 0.26);
        } catch (e) {}
    }

    // ============================================================
    //  GENERACIÓN DE ESCONDITES Y PLESIOSAURIOS
    // ============================================================
    function initGameEntities() {
        // 1. Resetear Buceador (en la superficie cerca del barco turístico)
        diver.x = 560;
        diver.y = 160;
        diver.vx = 0;
        diver.vy = 0;
        diver.facing = 1;
        diver.invulnerableTimer = 0;
        diver.isBreathing = true;
        oxygenLeft = OXYGEN_MAX;
        timeLeft = GAME_DURATION;
        keysFound = 0;

        // 2. Generar 10 Escondites (rocas y corales distribuidos exactamente como en la imagen de referencia)
        var spotPositions = [
            { x: 95,  y: 555, type: 'coral1' },
            { x: 175, y: 445, type: 'coral1' },
            { x: 280, y: 575, type: 'rock1'  },
            { x: 385, y: 485, type: 'rock2'  },
            { x: 475, y: 565, type: 'rock2'  },
            { x: 535, y: 375, type: 'rock1'  },
            { x: 580, y: 495, type: 'coral2' },
            { x: 685, y: 575, type: 'rock2'  },
            { x: 790, y: 485, type: 'rock2'  },
            { x: 890, y: 565, type: 'rock1'  }
        ];

        // Exactamente 4 de los 10 tienen llave
        var hasKeyFlags = [true, true, true, true, false, false, false, false, false, false];
        // Barajar llaves
        for (var i = hasKeyFlags.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = hasKeyFlags[i]; hasKeyFlags[i] = hasKeyFlags[r]; hasKeyFlags[r] = tmp;
        }

        hidingSpots = [];
        for (var s = 0; s < TOTAL_HIDING_SPOTS; s++) {
            var p = spotPositions[s];
            var spDef = SPRITES[p.type] || { w: 90, h: 70 };
            hidingSpots.push({
                x: p.x,
                y: p.y,
                w: spDef.w,
                h: spDef.h,
                type: p.type,
                hasKey: hasKeyFlags[s],
                checked: false,
                revealAnim: 0
            });
        }

        // 3. Iniciar con 1 Plesiosaurus patrullando (alargado y esbelto bajo el barco)
        plesiosaurs = [];
        spawnPlesiosaur(225, -1);
    }

    function spawnPlesiosaur(customY, customDir) {
        var yPositions = [225, 295, 365, 435, 505];
        var chosenY = (typeof customY === 'number') ? customY : yPositions[plesiosaurs.length % yPositions.length];
        var dir = customDir || (Math.random() < 0.5 ? 1 : -1);
        var startX = (dir > 0) ? -PLESIO_W - 40 : LW + 40;
        var speed = 110 + Math.random() * 60; // Velocidad de patrullaje

        plesiosaurs.push({
            x: startX,
            y: chosenY,
            w: PLESIO_W,
            h: PLESIO_H,
            speed: speed,
            dir: dir,           // 1 = derecha, -1 = izquierda
            sinOffset: Math.random() * Math.PI * 2,
            sinSpeed: 1.2 + Math.random() * 1.2,
            sinAmp: 14 + Math.random() * 10
        });
    }

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('plesio-swim-style')) return;
        var s = document.createElement('style');
        s.id = 'plesio-swim-style';
        s.textContent = [
            '/* --- BOTÓN FLOTANTE FAB (AZUL OCÉANO / CIAN ACUÁTICO) --- */',
            '#plesio-swim-fab {',
            '    position: fixed;',
            '    bottom: 368px; right: 28px;',
            '    left: auto;',
            '    z-index: 99990;',
            '    display: flex; align-items: center; gap: 0.55rem;',
            '    padding: 0.65rem 1.3rem 0.65rem 0.9rem;',
            '    background: rgba(3, 22, 38, 0.92);',
            '    border: 2px solid #00d2d3; border-radius: 50px;',
            '    cursor: pointer; user-select: none;',
            '    color: #00d2d3;',
            "    font-family: 'Orbitron','Share Tech Mono',monospace;",
            '    font-size: 0.78rem; font-weight: 700;',
            '    letter-spacing: 1.5px; text-transform: uppercase;',
            '    box-shadow: 0 0 22px rgba(0,210,211,.45), 0 4px 16px rgba(0,0,0,.6);',
            '    backdrop-filter: blur(8px);',
            '    transition: all .22s ease;',
            '    animation: ps-fab-pulse 2.8s ease-in-out infinite;',
            '}',
            '#plesio-swim-fab:hover {',
            '    background: rgba(0,210,211,.22);',
            '    box-shadow: 0 0 44px rgba(0,210,211,.75), 0 4px 20px rgba(0,0,0,.7);',
            '    transform: scale(1.07) translateY(-2px);',
            '    color: #55efc4;',
            '}',
            '#plesio-swim-fab img {',
            '    width: 44px; height: auto; max-height: 32px;',
            '    object-fit: contain;',
            '    filter: drop-shadow(0 0 6px rgba(0,210,211,.7));',
            '    pointer-events: none;',
            '}',
            '.ps-fab-title { display:block; font-size:.78rem; }',
            ".ps-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#81ecec; letter-spacing:1px; opacity:.85; }",
            '@keyframes ps-fab-pulse {',
            '    0%,100%{ box-shadow:0 0 22px rgba(0,210,211,.45),0 4px 16px rgba(0,0,0,.6); }',
            '    50%    { box-shadow:0 0 44px rgba(0,210,211,.75),0 4px 20px rgba(0,0,0,.7); }',
            '}',
            '',
            '/* --- OVERLAY PANTALLA COMPLETA --- */',
            '#plesio-swim-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: #000;',
            '    display: none; flex-direction: column;',
            '    user-select: none;',
            '}',
            '#plesio-swim-overlay.open { display: flex; }',
            '',
            '/* Header */',
            '#ps-header {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.2rem;',
            '    background: rgba(2, 16, 28, .92);',
            '    border-bottom: 2px solid #00d2d3;',
            '    backdrop-filter: blur(4px);',
            '    z-index: 10;',
            '    gap: 1rem;',
            '}',
            '#ps-header-left { display: flex; align-items: center; gap: .8rem; }',
            '#ps-header-title {',
            "    font-family:'Orbitron',monospace; font-size:.9rem; font-weight:900;",
            '    color:#00d2d3; letter-spacing:2px; text-transform:uppercase;',
            '}',
            '#ps-header-timer {',
            "    font-family:'Orbitron',monospace; font-size:.95rem; font-weight:700;",
            '    color:#f1c40f; background:rgba(0,0,0,.6); padding:.25rem .7rem;',
            '    border:1px solid rgba(241,196,15,.5); border-radius:4px;',
            '    letter-spacing:1px;',
            '}',
            '#ps-oxygen-meter-wrap {',
            '    display: flex; align-items: center; gap: .5rem;',
            "    font-family:'Share Tech Mono',monospace; font-size:.78rem; color:#81ecec;",
            '}',
            '#ps-oxygen-bar-bg {',
            '    width: 120px; height: 12px; background: rgba(0,0,0,.6);',
            '    border: 1px solid #00d2d3; border-radius: 10px; overflow: hidden;',
            '}',
            '#ps-oxygen-bar-fill {',
            '    width: 100%; height: 100%;',
            '    background: linear-gradient(90deg, #0984e3, #00d2d3);',
            '    transition: width .15s, background .2s;',
            '}',
            '#ps-oxygen-bar-fill.danger {',
            '    background: linear-gradient(90deg, #d63031, #ff7675);',
            '    animation: ps-danger-pulse .35s infinite alternate;',
            '}',
            '@keyframes ps-danger-pulse {',
            '    from { opacity: .6; }',
            '    to   { opacity: 1; }',
            '}',
            '#ps-keys-tracker {',
            '    display: flex; align-items: center; gap: .35rem;',
            "    font-family:'Orbitron',monospace; font-size:.8rem; font-weight:700;",
            '    color:#f1c40f; background:rgba(241,196,15,.12); padding:.25rem .75rem;',
            '    border:1px solid rgba(241,196,15,.4); border-radius:4px;',
            '}',
            '#ps-close-btn {',
            '    background:transparent; border:1px solid rgba(0,210,211,.4); color:#00d2d3;',
            "    font-family:'Share Tech Mono',monospace; font-size:.75rem;",
            '    padding:.35rem .9rem; border-radius:3px; cursor:pointer;',
            '    letter-spacing:1px; transition:all .2s;',
            '}',
            '#ps-close-btn:hover { background:rgba(0,210,211,.2); color:#fff; border-color:#00d2d3; }',
            '',
            '/* Canvas wrap y stage */',
            '#ps-canvas-wrap {',
            '    flex: 1;',
            '    position: relative;',
            '    display: flex; align-items: center; justify-content: center;',
            '    overflow: hidden;',
            '    background: #010a12;',
            '}',
            '#ps-canvas-stage {',
            '    position: relative;',
            '    overflow: hidden;',
            '    box-shadow: 0 0 35px rgba(0,0,0,.85);',
            '}',
            '#ps-canvas { display: block; touch-action: none; cursor: crosshair; }',
            '',
            '/* Status bar inferior */',
            '#ps-status-bar {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.4rem;',
            '    background: rgba(2, 16, 28, .94);',
            '    border-top: 1px solid rgba(0, 210, 211, .35);',
            "    font-family:'Share Tech Mono',monospace; font-size:.82rem;",
            '    backdrop-filter: blur(4px); z-index:10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#ps-mission-text {',
            "    color: #00d2d3; font-family:'Share Tech Mono',monospace; font-size:.82rem; font-weight:700;",
            '    letter-spacing: 1px;',
            '}',
            '#ps-tip-text { color: #81ecec; font-size:.8rem; }',
            '',
            '/* --- PANTALLAS MODALES --- */',
            '.ps-screen {',
            '    position: absolute; inset: 0; z-index: 25;',
            '    display: none; flex-direction: column;',
            '    align-items: center; justify-content: center;',
            '    text-align: center;',
            '    background: rgba(1, 10, 18, .88);',
            '    backdrop-filter: blur(8px);',
            "    font-family: 'Share Tech Mono',monospace;",
            '    padding: 1.2rem;',
            '    box-sizing: border-box;',
            '}',
            '.ps-screen.show { display: flex; animation: ps-pop .3s ease-out; }',
            '@keyframes ps-pop {',
            '    from { opacity: 0; transform: scale(.95); }',
            '    to   { opacity: 1; transform: scale(1); }',
            '}',
            '.ps-screen-title {',
            "    font-family:'Orbitron',monospace;",
            '    font-size: clamp(1.4rem, 4vw, 2.3rem);',
            '    font-weight: 900; letter-spacing: 3px; text-transform: uppercase;',
            '    margin-bottom: .5rem;',
            '}',
            '.ps-screen-sub {',
            '    font-size: clamp(.75rem, 1.8vw, .95rem); color: #ccc;',
            '    margin-bottom: 1.6rem; max-width: 620px; line-height: 1.6;',
            '}',
            '.ps-instruct {',
            '    display: flex; gap: 1.4rem; margin: .6rem 0 1.6rem;',
            '    flex-wrap: wrap; justify-content: center;',
            '    font-size: .78rem; color: #ddd;',
            '}',
            '.ps-inst-item {',
            '    display:flex; flex-direction:column; align-items:center; gap:.3rem;',
            '    background:rgba(255,255,255,.05); border:1px solid rgba(0,210,211,.25);',
            '    border-radius:6px; padding:.65rem .85rem; min-width:115px;',
            '    box-sizing: border-box;',
            '}',
            '.ps-inst-icon { font-size: 1.6rem; }',
            '',
            '/* BOTONES */',
            '.ps-btn {',
            "    font-family:'Orbitron',monospace; font-size:.85rem; font-weight:700;",
            '    letter-spacing:1.5px; text-transform:uppercase;',
            '    padding:.75rem 2.2rem; border-radius:4px; cursor:pointer;',
            '    transition:all .2s; border:none; margin:.3rem;',
            '    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;',
            '    width: auto; max-width: 340px; box-sizing: border-box; flex: 0 0 auto;',
            '}',
            '.ps-btn-primary { background:#00d2d3; color:#011422; box-shadow:0 0 16px rgba(0,210,211,.5); }',
            '.ps-btn-primary:hover { background:#55efc4; box-shadow:0 0 30px rgba(85,239,196,.75); transform:translateY(-2px); }',
            '.ps-btn-secondary { background:transparent; border:1px solid #00d2d3; color:#00d2d3; }',
            '.ps-btn-secondary:hover { background:rgba(0,210,211,.15); }',
            '.ps-btn-danger { background:transparent; border:1px solid #e74c3c; color:#e74c3c; }',
            '.ps-btn-danger:hover { background:rgba(231,76,60,.15); }',
            '',
            '/* Responsive */',
            '@media (max-width: 600px) {',
            '    #plesio-swim-fab { bottom: 232px; right: 16px; padding: .5rem .9rem .5rem .65rem; }',
            '    #plesio-swim-fab img { width: 36px; max-height: 26px; }',
            '    .ps-fab-title { font-size:.65rem; }',
            '    .ps-fab-sub   { display:none; }',
            '    #ps-status-bar { font-size:.68rem; padding:.35rem .6rem; }',
            '    #ps-header { padding:.35rem .6rem; }',
            '    #ps-header-title { font-size:.72rem; }',
            '    #ps-oxygen-bar-bg { width: 75px; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'plesio-swim-overlay';

        // ---- HEADER ----
        var header = document.createElement('div');
        header.id  = 'ps-header';

        var headerLeft = document.createElement('div');
        headerLeft.id  = 'ps-header-left';

        var title = document.createElement('div');
        title.id   = 'ps-header-title';
        title.textContent = '🌊 RECINTO ACUÁTICO — ¡ESCAPE DEL PLESIOSAURUS!';

        var timerEl = document.createElement('div');
        timerEl.id = 'ps-header-timer';
        timerEl.textContent = '⏱ 02:00';

        headerLeft.appendChild(title);
        headerLeft.appendChild(timerEl);

        var headerRight = document.createElement('div');
        headerRight.style.cssText = 'display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;';

        // Medidor de Oxígeno
        var oxygenWrap = document.createElement('div');
        oxygenWrap.id = 'ps-oxygen-meter-wrap';
        oxygenWrap.innerHTML = '🤿 OXÍGENO: <div id="ps-oxygen-bar-bg"><div id="ps-oxygen-bar-fill"></div></div> <span id="ps-oxygen-val">10.0s</span>';

        // Contador de Llaves
        var keysTracker = document.createElement('div');
        keysTracker.id = 'ps-keys-tracker';
        keysTracker.innerHTML = '🔑 LLAVES: <span id="ps-keys-val">0</span>/4';

        var closeBtn = document.createElement('button');
        closeBtn.id  = 'ps-close-btn';
        closeBtn.textContent = '✕ CERRAR';
        closeBtn.addEventListener('click', closeGame);

        headerRight.appendChild(oxygenWrap);
        headerRight.appendChild(keysTracker);
        headerRight.appendChild(closeBtn);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);
        ov.appendChild(header);

        // ---- CANVAS WRAP Y STAGE CENTRADO ----
        var wrap = document.createElement('div');
        wrap.id  = 'ps-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'ps-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'ps-canvas';
        stage.appendChild(canvas);

        // ---- PANTALLA INICIO ----
        var startScreen = document.createElement('div');
        startScreen.id  = 'ps-start-screen';
        startScreen.className = 'ps-screen show';

        var sTitle = document.createElement('div');
        sTitle.className = 'ps-screen-title';
        sTitle.style.color = '#00d2d3';
        sTitle.textContent = '🌊 ¡ESCAPE DEL PLESIOSAURUS!';

        var sSub = document.createElement('div');
        sSub.className = 'ps-screen-sub';
        sSub.innerHTML = 'Estás atrapado en las profundidades del recinto acuático InGen.<br>' +
            'Debes nadar velozmente y encontrar las <strong style="color:#f1c40f;">4 llaves</strong> ocultas tras las rocas y corales.<br><br>' +
            '⚠️ <strong>REGLAS VITALES:</strong><br>' +
            '🤿 <strong>Oxígeno:</strong> Debes <strong style="color:#00d2d3;">subir a la superficie a respirar cada 10 segundos</strong> o te ahogarás.<br>' +
            '🦕 <strong>Plesiosaurus:</strong> ¡Cada llave que encuentres atraerá a otro depredador! Evita chocar o perderás 15 segundos.<br>' +
            '🪨 <strong>Rocas y Corales:</strong> Hay 10 escondites. Si revisas uno vacío, recibirás una penalización de 10 segundos.<br>' +
            '<em>¡Tienes 2 minutos para conseguir las 4 llaves y escapar a la superficie!</em>';

        var instruct = document.createElement('div');
        instruct.className = 'ps-instruct';

        var cards = [
            { icon: '🏊‍♂️', label: 'Nada con Flechas/WASD', desc: 'O SIGUE EL MOUSE' },
            { icon: '🤿', label: 'Respira cada 10s', desc: 'SUBE A SUPERFICIE' },
            { icon: '🔑', label: 'Encuentra 4 Llaves', desc: 'ROCAS Y CORALES' },
            { icon: '🦕', label: 'Esquiva Plesiosaurus', desc: 'QUITAN 15 SEGUNDOS' }
        ];
        for (var ci = 0; ci < cards.length; ci++) {
            var card = document.createElement('div');
            card.className = 'ps-inst-item';
            var iconEl = document.createElement('div');
            iconEl.className = 'ps-inst-icon';
            iconEl.textContent = cards[ci].icon;
            var textWrap = document.createElement('div');
            textWrap.innerHTML = cards[ci].label + '<br><strong>' + cards[ci].desc + '</strong>';
            card.appendChild(iconEl);
            card.appendChild(textWrap);
            instruct.appendChild(card);
        }

        var startBtn = document.createElement('button');
        startBtn.className = 'ps-btn ps-btn-primary';
        startBtn.id = 'ps-start-btn';
        startBtn.textContent = '▶ COMENZAR INMERSIÓN';
        startBtn.addEventListener('click', startGame);

        startScreen.appendChild(sTitle);
        startScreen.appendChild(sSub);
        startScreen.appendChild(instruct);
        startScreen.appendChild(startBtn);
        stage.appendChild(startScreen);

        // ---- PANTALLA VICTORIA ----
        var winScreen = document.createElement('div');
        winScreen.id  = 'ps-win-screen';
        winScreen.className = 'ps-screen';

        var wTitle = document.createElement('div');
        wTitle.className = 'ps-screen-title';
        wTitle.style.color = '#55efc4';
        wTitle.textContent = '🎉 ¡ESCAPASTE DEL RECINTO ACUÁTICO!';

        var wSub = document.createElement('div');
        wSub.className = 'ps-screen-sub';
        wSub.id = 'ps-win-sub';
        wSub.innerHTML = '¡Conseguiste las 4 llaves y saliste a la superficie antes de ser devorado!<br>' +
            'El equipo de rescate te sacó del agua sano y salvo. <strong style="color:#55efc4;">¡Gran habilidad de buceo!</strong>';

        var wBtns = document.createElement('div');
        var wRetry = document.createElement('button');
        wRetry.className = 'ps-btn ps-btn-primary';
        wRetry.textContent = '🔄 JUGAR DE NUEVO';
        wRetry.addEventListener('click', function () { showScreen(null); startGame(); });
        var wClose = document.createElement('button');
        wClose.className = 'ps-btn ps-btn-secondary';
        wClose.textContent = 'CERRAR';
        wClose.addEventListener('click', closeGame);
        wBtns.appendChild(wRetry); wBtns.appendChild(wClose);

        winScreen.appendChild(wTitle);
        winScreen.appendChild(wSub);
        winScreen.appendChild(wBtns);
        stage.appendChild(winScreen);

        // ---- PANTALLA DERROTA: AHOGADO ----
        var drownScreen = document.createElement('div');
        drownScreen.id  = 'ps-drown-screen';
        drownScreen.className = 'ps-screen';

        var dTitle = document.createElement('div');
        dTitle.className = 'ps-screen-title';
        dTitle.style.color = '#00d2d3';
        dTitle.textContent = '🤿 ¡TE HAS QUEDADO SIN OXÍGENO!';

        var dSub = document.createElement('div');
        dSub.className = 'ps-screen-sub';
        dSub.innerHTML = 'Pasaron más de 10 segundos sin salir a la superficie a respirar.<br>' +
            'Tus pulmones colapsaron bajo la presión del agua.<br>' +
            '<strong style="color:#f1c40f;">Consejo:</strong> Vigila tu barra de oxígeno y sube a la superficie regularmente.';

        var dBtns = document.createElement('div');
        var dRetry = document.createElement('button');
        dRetry.className = 'ps-btn ps-btn-primary';
        dRetry.textContent = '🔄 INTENTAR DE NUEVO';
        dRetry.addEventListener('click', function () { showScreen(null); startGame(); });
        var dClose = document.createElement('button');
        dClose.className = 'ps-btn ps-btn-danger';
        dClose.textContent = 'CERRAR';
        dClose.addEventListener('click', closeGame);
        dBtns.appendChild(dRetry); dBtns.appendChild(dClose);

        drownScreen.appendChild(dTitle);
        drownScreen.appendChild(dSub);
        drownScreen.appendChild(dBtns);
        stage.appendChild(drownScreen);

        // ---- PANTALLA DERROTA: TIEMPO AGOTADO ----
        var timeScreen = document.createElement('div');
        timeScreen.id  = 'ps-time-screen';
        timeScreen.className = 'ps-screen';

        var tTitle = document.createElement('div');
        tTitle.className = 'ps-screen-title';
        tTitle.style.color = '#e74c3c';
        tTitle.textContent = '⏱ ¡TIEMPO AGOTADO!';

        var tSub = document.createElement('div');
        tSub.className = 'ps-screen-sub';
        tSub.innerHTML = 'Los 2 minutos se terminaron antes de reunir las 4 llaves.<br>' +
            'Los Plesiosaurios cerraron el perímetro y te acorralaron.<br>' +
            'No abras escondites vacíos para evitar perder 10 segundos.';

        var tBtns = document.createElement('div');
        var tRetry = document.createElement('button');
        tRetry.className = 'ps-btn ps-btn-primary';
        tRetry.textContent = '🔄 INTENTAR DE NUEVO';
        tRetry.addEventListener('click', function () { showScreen(null); startGame(); });
        var tClose = document.createElement('button');
        tClose.className = 'ps-btn ps-btn-danger';
        tClose.textContent = 'CERRAR';
        tClose.addEventListener('click', closeGame);
        tBtns.appendChild(tRetry); tBtns.appendChild(tClose);

        timeScreen.appendChild(tTitle);
        timeScreen.appendChild(tSub);
        timeScreen.appendChild(tBtns);
        stage.appendChild(timeScreen);

        wrap.appendChild(stage);
        ov.appendChild(wrap);

        // ---- STATUS BAR ----
        var statusBar = document.createElement('div');
        statusBar.id  = 'ps-status-bar';
        var mission = document.createElement('div');
        mission.id   = 'ps-mission-text';
        mission.textContent = '🌊 MISIÓN: Encuentra las 4 llaves tras las rocas y corales y escapa a la superficie';
        var tip = document.createElement('div');
        tip.id   = 'ps-tip-text';
        tip.textContent = '💡 Controles: Flechas / WASD / Clic con mouse | Sube a la superficie (arriba) para respirar';
        statusBar.appendChild(mission);
        statusBar.appendChild(tip);
        ov.appendChild(statusBar);

        document.body.appendChild(ov);
        ctx = canvas.getContext('2d');

        // Eventos de entrada
        setupInputHandlers();
    }

    // ============================================================
    //  FAB — BOTÓN FLOTANTE
    // ============================================================
    function buildFAB() {
        var fab = document.createElement('div');
        fab.id  = 'plesio-swim-fab';
        fab.title = '¡Escape del Plesiosaurus!';

        var fabImg = document.createElement('img');
        fabImg.alt = 'Plesiosaurus';
        loadImageWithFallback(fabImg, 'Plesio der.png', function () {});

        var fabText = document.createElement('span');
        var fabTitle = document.createElement('span');
        fabTitle.className = 'ps-fab-title';
        fabTitle.textContent = '¡ESCAPE DEL PLESIOSAURUS!';
        var fabSub = document.createElement('span');
        fabSub.className = 'ps-fab-sub';
        fabSub.textContent = 'BUCEO EN EL RECINTO';
        fabText.appendChild(fabTitle);
        fabText.appendChild(fabSub);

        fab.appendChild(fabImg);
        fab.appendChild(fabText);
        fab.addEventListener('click', openGame);
        document.body.appendChild(fab);
    }

    // ============================================================
    //  GESTIÓN DE ENTRADA (TECLADO + MOUSE / TOUCH)
    // ============================================================
    function setupInputHandlers() {
        window.addEventListener('keydown', function (e) {
            if (state !== 'playing') return;
            switch (e.code) {
                case 'ArrowLeft': case 'KeyA':
                    keys.left = true; e.preventDefault(); break;
                case 'ArrowRight': case 'KeyD':
                    keys.right = true; e.preventDefault(); break;
                case 'ArrowUp': case 'KeyW':
                    keys.up = true; e.preventDefault(); break;
                case 'ArrowDown': case 'KeyS':
                    keys.down = true; e.preventDefault(); break;
                case 'Space':
                    interactClosestSpot(); e.preventDefault(); break;
            }
        });

        window.addEventListener('keyup', function (e) {
            switch (e.code) {
                case 'ArrowLeft': case 'KeyA': keys.left = false; break;
                case 'ArrowRight': case 'KeyD': keys.right = false; break;
                case 'ArrowUp': case 'KeyW': keys.up = false; break;
                case 'ArrowDown': case 'KeyS': keys.down = false; break;
            }
        });

        function updatePointer(e) {
            if (!canvas) return;
            var rect = canvas.getBoundingClientRect();
            var px = (e.clientX - rect.left) / scale;
            var py = (e.clientY - rect.top) / scale;
            mouseTarget = { x: px, y: py };
        }

        canvas.addEventListener('pointerdown', function (e) {
            if (state !== 'playing') return;
            isPointerDown = true;
            updatePointer(e);
            // Si hace clic sobre una roca/coral, interactúa
            checkSpotClick(mouseTarget.x, mouseTarget.y);
        });

        window.addEventListener('pointermove', function (e) {
            if (isPointerDown && state === 'playing') {
                updatePointer(e);
            }
        });

        window.addEventListener('pointerup', function () {
            isPointerDown = false;
            mouseTarget = null;
        });

        canvas.addEventListener('pointerleave', function () {
            if (!isPointerDown) mouseTarget = null;
        });
    }

    // Interacción al acercarse a un escondite
    function interactClosestSpot() {
        var closest = null;
        var minDist = 90;
        for (var i = 0; i < hidingSpots.length; i++) {
            var spot = hidingSpots[i];
            if (spot.checked) continue;
            var dist = Math.hypot(diver.x - spot.x, diver.y - spot.y);
            if (dist < minDist) {
                minDist = dist;
                closest = spot;
            }
        }
        if (closest) inspectSpot(closest);
    }

    function checkSpotClick(clickX, clickY) {
        for (var i = 0; i < hidingSpots.length; i++) {
            var spot = hidingSpots[i];
            if (spot.checked) continue;
            var dx = clickX - spot.x;
            var dy = clickY - spot.y;
            if (Math.abs(dx) < spot.w / 2 + 20 && Math.abs(dy) < spot.h / 2 + 20) {
                // Si el buzo está razonablemente cerca o se nada hacia allá
                var distToDiver = Math.hypot(diver.x - spot.x, diver.y - spot.y);
                if (distToDiver < 140) {
                    inspectSpot(spot);
                    return;
                }
            }
        }
    }

    function inspectSpot(spot) {
        if (spot.checked || state !== 'playing') return;
        spot.checked = true;

        if (spot.hasKey) {
            // ¡LLAVE ENCONTRADA!
            keysFound++;
            playKeyFoundFX();
            createFloatingText('🔑 ¡LLAVE ENCONTRADA! (' + keysFound + '/4)', spot.x, spot.y - 30, '#f1c40f');

            // Partículas doradas
            for (var b = 0; b < 18; b++) {
                bubbles.push({
                    x: spot.x + (Math.random() * 40 - 20),
                    y: spot.y + (Math.random() * 40 - 20),
                    vx: (Math.random() * 80 - 40),
                    vy: -(30 + Math.random() * 90),
                    r: 3 + Math.random() * 4,
                    color: '#f1c40f',
                    life: 0.9
                });
            }

            // Aparece otro Plesiosaurus ("cuando encuentra una llave aparece otro plesiosaurus")
            spawnPlesiosaur();

            // Comprobar si ya tiene las 4 llaves
            if (keysFound >= KEYS_TO_FIND) {
                createFloatingText('🚀 ¡TIENES LAS 4 LLAVES! ¡SUBE A LA SUPERFICIE!', LW / 2, 90, '#55efc4', 3.5);
                var tipEl = document.getElementById('ps-tip-text');
                if (tipEl) {
                    tipEl.innerHTML = '<strong style="color:#55efc4;">¡ESCAPA! Nada a la superficie (arriba) para abrir la compuerta</strong>';
                }
            }
        } else {
            // Escondite vacío: penalización de tiempo
            timeLeft = Math.max(0, timeLeft - 10);
            playErrorFX();
            shakeScreen(8, 0.35);
            createFloatingText('❌ -10s ¡ESCONDITE VACÍO!', spot.x, spot.y - 30, '#e74c3c');
        }

        updateHUD();
    }

    function shakeScreen(mag, duration) {
        shakeMag = mag;
        shakeTimer = duration;
    }

    function createFloatingText(text, x, y, color, customLife) {
        var life = customLife || 1.8;
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color || '#fff',
            life: life,
            maxLife: life
        });
    }

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('ps-canvas-wrap');
        if (!wrap || !canvas || !stage) return;
        var vw = wrap.clientWidth  || window.innerWidth;
        var vh = wrap.clientHeight || (window.innerHeight - 90);
        scale   = Math.min(vw / LW, vh / LH);
        canvasW = Math.round(LW * scale);
        canvasH = Math.round(LH * scale);

        stage.style.width   = canvasW + 'px';
        stage.style.height  = canvasH + 'px';
        canvas.width        = canvasW;
        canvas.height       = canvasH;
        canvas.style.width  = canvasW + 'px';
        canvas.style.height = canvasH + 'px';

        drawScene();
    }

    // ============================================================
    //  BUCLE DE ACTUALIZACIÓN Y FÍSICAS (60 FPS)
    // ============================================================
    function updateGame(dt) {
        if (state !== 'playing') return;

        // 1. Actualizar Cronómetro
        timeLeft -= dt;
        if (timeLeft <= 0) {
            timeLeft = 0;
            triggerLose('time');
            return;
        }

        // 2. Actualizar Oxígeno
        // Si el buzo está en la superficie del agua (cerca del barco turístico, y <= SURFACE_Y + 15), respira y recarga
        if (diver.y <= SURFACE_Y + 15) {
            if (!diver.isBreathing) {
                diver.isBreathing = true;
                playBreatheFX();
                createFloatingText('🫧 ¡RESPIRANDO! +OXÍGENO', diver.x, 130, '#00d2d3', 1.0);
            }
            oxygenLeft = OXYGEN_MAX;

            // Si además ya tiene las 4 llaves y llega a la superficie: ¡VICTORIA!
            if (keysFound >= KEYS_TO_FIND) {
                triggerWin();
                return;
            }
        } else {
            diver.isBreathing = false;
            oxygenLeft -= dt;
            if (oxygenLeft <= 0) {
                oxygenLeft = 0;
                triggerLose('drowned');
                return;
            }
        }

        // 3. Movimiento del Buceador
        var moveX = 0, moveY = 0;

        // Control por teclado
        if (keys.left)  moveX -= 1;
        if (keys.right) moveX += 1;
        if (keys.up)    moveY -= 1;
        if (keys.down)  moveY += 1;

        // Control por mouse/touch hacia el objetivo
        if (mouseTarget) {
            var tdx = mouseTarget.x - diver.x;
            var tdy = mouseTarget.y - diver.y;
            var tdist = Math.hypot(tdx, tdy);
            if (tdist > 16) {
                moveX = tdx / tdist;
                moveY = tdy / tdist;
            }
        }

        // Normalizar vector diagonal
        var len = Math.hypot(moveX, moveY);
        if (len > 0.01) {
            moveX = (moveX / len) * diver.speed;
            moveY = (moveY / len) * diver.speed;
            // Orientación del modelo: Sub izq o Sub der
            if (moveX < -5) diver.facing = -1;
            else if (moveX > 5) diver.facing = 1;
        }

        // Fricción suave en el agua
        diver.vx = diver.vx * 0.85 + moveX * 0.15;
        diver.vy = diver.vy * 0.85 + moveY * 0.15;

        diver.x += diver.vx * dt;
        diver.y += diver.vy * dt;

        // Límites del recinto acuático (la superficie empieza en y = 148 junto al barco)
        var halfW = DIVER_W / 2;
        var halfH = DIVER_H / 2;
        diver.x = Math.max(halfW + 10, Math.min(LW - halfW - 10, diver.x));
        diver.y = Math.max(148, Math.min(LH - halfH - 25, diver.y));

        // Burbujas que salen del buzo
        if (Math.random() < 0.35) {
            bubbles.push({
                x: diver.x + (diver.facing > 0 ? -DIVER_W * 0.35 : DIVER_W * 0.35),
                y: diver.y,
                vx: (Math.random() * 20 - 10),
                vy: -(40 + Math.random() * 50),
                r: 2 + Math.random() * 3.5,
                color: 'rgba(255,255,255,0.7)',
                life: 1.5
            });
        }

        // Auto-interacción por proximidad (si el buzo nada muy cerca de una roca)
        for (var h = 0; h < hidingSpots.length; h++) {
            var spot = hidingSpots[h];
            if (!spot.checked) {
                var dDist = Math.hypot(diver.x - spot.x, diver.y - spot.y);
                if (dDist < 58) {
                    inspectSpot(spot);
                }
            }
        }

        // Temporizador de invulnerabilidad tras ser golpeado
        if (diver.invulnerableTimer > 0) {
            diver.invulnerableTimer -= dt;
        }

        // 4. Actualizar Plesiosaurios
        for (var p = 0; p < plesiosaurs.length; p++) {
            var ple = plesiosaurs[p];
            ple.x += ple.dir * ple.speed * dt;
            ple.sinOffset += dt * ple.sinSpeed;
            // Ondulación vertical orgánica
            var waveY = ple.y + Math.sin(ple.sinOffset) * ple.sinAmp;

            // Rebotar en los extremos del recinto
            if (ple.dir > 0 && ple.x > LW + 60) {
                ple.dir = -1;
                ple.y = 160 + Math.random() * 360;
            } else if (ple.dir < 0 && ple.x < -PLESIO_W - 60) {
                ple.dir = 1;
                ple.y = 160 + Math.random() * 360;
            }

            // Colisión con el buzo
            if (diver.invulnerableTimer <= 0) {
                var cdx = Math.abs(diver.x - ple.x);
                var cdy = Math.abs(diver.y - waveY);
                // Hitbox del plesiosaurio
                if (cdx < (PLESIO_W * 0.38) && cdy < (PLESIO_H * 0.42)) {
                    // ¡COLISIÓN / ATAQUE!
                    playAudio(sndAttack);
                    shakeScreen(14, 0.5);
                    diver.invulnerableTimer = 1.6; // 1.6s de invulnerabilidad
                    timeLeft = Math.max(0, timeLeft - 15); // -15 segundos
                    createFloatingText('💥 -15s ¡ATAQUE DEL PLESIOSAURUS!', diver.x, diver.y - 40, '#ff7675', 2.0);

                    // Empuje físico lejos del plesiosaurio
                    diver.vy += (diver.y < waveY) ? -180 : 180;
                    diver.vx += (ple.dir > 0) ? 200 : -200;

                    if (timeLeft <= 0) {
                        triggerLose('time');
                        return;
                    }
                }
            }
        }

        // 5. Actualizar Partículas de Burbujas
        for (var b = bubbles.length - 1; b >= 0; b--) {
            var bub = bubbles[b];
            bub.x += bub.vx * dt;
            bub.y += bub.vy * dt;
            bub.life -= dt;
            if (bub.y <= SURFACE_Y || bub.life <= 0) {
                bubbles.splice(b, 1);
            }
        }

        // 6. Actualizar Textos Flotantes
        for (var t = floatingTexts.length - 1; t >= 0; t--) {
            var txt = floatingTexts[t];
            txt.y -= 24 * dt;
            txt.life -= dt;
            if (txt.life <= 0) {
                floatingTexts.splice(t, 1);
            }
        }

        // 7. Sacudida de pantalla
        if (shakeTimer > 0) {
            shakeTimer -= dt;
        }

        updateHUD();
    }

    // ============================================================
    //  DIBUJO DE LA ESCENA EN EL CANVAS
    // ============================================================
    function drawScene() {
        if (!ctx) return;
        ctx.save();
        ctx.clearRect(0, 0, canvasW, canvasH);

        // Sacudida de pantalla (shake)
        if (shakeTimer > 0) {
            var ox = (Math.random() * 2 - 1) * shakeMag * scale;
            var oy = (Math.random() * 2 - 1) * shakeMag * scale;
            ctx.translate(ox, oy);
        }

        // 1. Fondo Marino (Fondo Ocean.jpg - ya contiene el cielo, montañas, barco turístico y superficie del agua)
        if (imgs.bg.complete && imgs.bg.naturalWidth) {
            ctx.drawImage(imgs.bg, 0, 0, canvasW, canvasH);
        } else {
            ctx.fillStyle = '#05233d';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        var timeSec = performance.now() * 0.003;

        // 2. Escondites (Rocas y Corales) + Llaves
        for (var i = 0; i < hidingSpots.length; i++) {
            var spot = hidingSpots[i];
            var sx = (spot.x - spot.w / 2) * scale;
            var sy = (spot.y - spot.h / 2) * scale;
            var sw = spot.w * scale;
            var sh = spot.h * scale;

            // Si está abierto y tenía llave: dibujar la llave Key.png flotando con resplandor dorado
            if (spot.checked && spot.hasKey) {
                var kDef = SPRITES.key;
                var kw = KEY_W * scale;
                var kh = KEY_H * scale;
                var kx = (spot.x - KEY_W / 2) * scale;
                var ky = (spot.y - KEY_H / 2 - 14 + Math.sin(timeSec * 2.5) * 5) * scale;
                if (imgs.key.complete && imgs.key.naturalWidth) {
                    ctx.save();
                    ctx.shadowColor = '#f1c40f';
                    ctx.shadowBlur = 18 * scale;
                    ctx.drawImage(
                        imgs.key,
                        kDef.sx, kDef.sy, kDef.sw, kDef.sh,
                        kx, ky, kw, kh
                    );
                    ctx.restore();
                }
            }

            // Imagen de la Roca o Coral recortada para eliminar márgenes transparentes
            var spDef = SPRITES[spot.type];
            var sImg = imgs[spot.type];
            if (sImg && sImg.complete && sImg.naturalWidth && spDef) {
                ctx.save();
                if (spot.checked) {
                    ctx.globalAlpha = 0.48; // Semi-transparente cuando ya fue inspeccionado
                }
                ctx.drawImage(
                    sImg,
                    spDef.sx, spDef.sy, spDef.sw, spDef.sh,
                    sx, sy, sw, sh
                );
                ctx.restore();
            }

            // Indicador sutil de proximidad cuando el buzo se acerca
            if (!spot.checked && state === 'playing') {
                var pDist = Math.hypot(diver.x - spot.x, diver.y - spot.y);
                if (pDist < 120) {
                    ctx.beginPath();
                    ctx.arc(spot.x * scale, (spot.y - spot.h / 2) * scale, 5 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = '#00d2d3';
                    ctx.shadowColor = '#00d2d3';
                    ctx.shadowBlur = 10 * scale;
                    ctx.fill();
                }
            }
        }

        // 3. Plesiosaurios (Alargados y esbeltos como en la imagen de referencia)
        for (var p = 0; p < plesiosaurs.length; p++) {
            var ple = plesiosaurs[p];
            var waveY = ple.y + Math.sin(ple.sinOffset) * ple.sinAmp;
            var px = (ple.x - ple.w / 2) * scale;
            var py = (waveY - ple.h / 2) * scale;
            var pw = ple.w * scale;
            var ph = ple.h * scale;

            // Modelo y recorte según dirección: Plesio der o Plesio izq
            var spPle = (ple.dir > 0) ? SPRITES.plesioDer : SPRITES.plesioIzq;
            var pImg = (ple.dir > 0) ? imgs.plesioDer : imgs.plesioIzq;
            if (pImg.complete && pImg.naturalWidth) {
                ctx.save();
                ctx.drawImage(
                    pImg,
                    spPle.sx, spPle.sy, spPle.sw, spPle.sh,
                    px, py, pw, ph
                );
                ctx.restore();
            }
        }

        // 4. El Buceador (Jugador - recortado sin márgenes transparentes)
        ctx.save();
        // Parpadeo si es invulnerable tras recibir daño
        if (diver.invulnerableTimer > 0) {
            if (Math.floor(performance.now() / 100) % 2 === 0) {
                ctx.globalAlpha = 0.35;
            }
        }

        var dx = (diver.x - DIVER_W / 2) * scale;
        var dy = (diver.y - DIVER_H / 2) * scale;
        var dw = DIVER_W * scale;
        var dh = DIVER_H * scale;

        // Modelo y recorte según dirección: Sub der o Sub izq
        var spDiver = (diver.facing > 0) ? SPRITES.subDer : SPRITES.subIzq;
        var dImg = (diver.facing > 0) ? imgs.subDer : imgs.subIzq;
        if (dImg.complete && dImg.naturalWidth) {
            ctx.drawImage(
                dImg,
                spDiver.sx, spDiver.sy, spDiver.sw, spDiver.sh,
                dx, dy, dw, dh
            );
        } else {
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(dx, dy, dw, dh);
        }
        ctx.restore();

        // 5. Burbujas
        for (var b = 0; b < bubbles.length; b++) {
            var bub = bubbles[b];
            ctx.beginPath();
            ctx.arc(bub.x * scale, bub.y * scale, bub.r * scale, 0, Math.PI * 2);
            ctx.fillStyle = bub.color;
            ctx.fill();
        }

        // 6. Textos Flotantes
        for (var t = 0; t < floatingTexts.length; t++) {
            var txt = floatingTexts[t];
            var alpha = Math.max(0, Math.min(1, txt.life / (txt.maxLife * 0.3)));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold ' + Math.round(18 * scale) + "px 'Orbitron', monospace";
            ctx.fillStyle = txt.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 6 * scale;
            ctx.fillText(txt.text, txt.x * scale, txt.y * scale);
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  ACTUALIZACIÓN DEL HUD
    // ============================================================
    function updateHUD() {
        // 1. Cronómetro
        var timerEl = document.getElementById('ps-header-timer');
        if (timerEl) {
            var mins = Math.floor(timeLeft / 60);
            var secs = Math.floor(timeLeft % 60);
            var formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
            timerEl.textContent = '⏱ ' + formatted;
            if (timeLeft < 25) {
                timerEl.style.color = '#e74c3c';
                timerEl.style.borderColor = '#e74c3c';
            } else {
                timerEl.style.color = '#f1c40f';
                timerEl.style.borderColor = 'rgba(241,196,15,.5)';
            }
        }

        // 2. Medidor de Oxígeno
        var fillEl = document.getElementById('ps-oxygen-bar-fill');
        var valEl  = document.getElementById('ps-oxygen-val');
        if (fillEl && valEl) {
            var pct = Math.max(0, Math.min(100, (oxygenLeft / OXYGEN_MAX) * 100));
            fillEl.style.width = pct + '%';
            valEl.textContent = oxygenLeft.toFixed(1) + 's';
            if (oxygenLeft <= 3.2) {
                fillEl.className = 'danger';
                valEl.style.color = '#ff7675';
            } else {
                fillEl.className = '';
                valEl.style.color = '#81ecec';
            }
        }

        // 3. Contador de Llaves
        var keysEl = document.getElementById('ps-keys-val');
        if (keysEl) {
            keysEl.textContent = keysFound;
        }
    }

    // ============================================================
    //  GESTIÓN DE PANTALLAS MODALES
    // ============================================================
    function showScreen(id) {
        var screens = ['ps-start-screen', 'ps-win-screen', 'ps-drown-screen', 'ps-time-screen'];
        for (var i = 0; i < screens.length; i++) {
            var el = document.getElementById(screens[i]);
            if (el) el.classList.remove('show');
        }
        if (id) {
            var target = document.getElementById(id);
            if (target) target.classList.add('show');
        }
    }

    // ============================================================
    //  LÓGICA DEL JUEGO: INICIO, VICTORIA Y DERROTA
    // ============================================================
    function startGame() {
        showScreen(null);
        state = 'playing';

        initGameEntities();
        updateHUD();
        drawScene();

        lastTime = performance.now();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        gameLoop(lastTime);

        if (sndMusic) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }
    }

    function gameLoop(now) {
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.1) dt = 0.1; // Limitar salto de frames si se minimiza

        updateGame(dt);
        drawScene();

        if (state === 'playing') {
            aniFrame = requestAnimationFrame(gameLoop);
        }
    }

    function triggerWin() {
        state = 'won';
        if (aniFrame) cancelAnimationFrame(aniFrame);

        var mins = Math.floor(timeLeft / 60);
        var secs = Math.floor(timeLeft % 60);
        var formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

        var subEl = document.getElementById('ps-win-sub');
        if (subEl) {
            subEl.innerHTML = '¡Conseguiste las 4 llaves y saliste a la superficie con <strong style="color:#f1c40f;">' + formatted + '</strong> restantes!<br>' +
                'Lograste esquivar a los ' + plesiosaurs.length + ' Plesiosaurios y escapar del recinto acuático.<br>' +
                '<strong style="color:#55efc4;">¡Gran habilidad de buceo!</strong>';
        }

        showScreen('ps-win-screen');
    }

    function triggerLose(reason) {
        state = (reason === 'drowned') ? 'lost_drowned' : 'lost_time';
        if (aniFrame) cancelAnimationFrame(aniFrame);

        if (reason === 'drowned') {
            showScreen('ps-drown-screen');
        } else {
            showScreen('ps-time-screen');
        }
    }

    // ============================================================
    //  ABRIR / CERRAR MINIJUEGO
    // ============================================================
    function openGame() {
        var ov = document.getElementById('plesio-swim-overlay');
        if (!ov) return;
        ov.classList.add('open');
        state = 'idle';

        initGameEntities();
        showScreen('ps-start-screen');

        setTimeout(function () {
            resize();
            drawScene();
            updateHUD();
        }, 40);

        if (sndMusic) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }
    }

    function closeGame() {
        var ov = document.getElementById('plesio-swim-overlay');
        if (ov) ov.classList.remove('open');
        if (aniFrame) cancelAnimationFrame(aniFrame);
        stopAllAudio();
        state = 'idle';
        showScreen(null);
    }

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        loadAllImages(function () {});
        buildOverlay();
        buildFAB();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('plesio-swim-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
