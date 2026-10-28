// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡ACOSO EN LA CLÍNICA! (VENOMOUS SPITTER)
//  Minijuego: Encuentra los 5 objetos ocultos antes de que el
//  Dilophosaurus te descubra en la oscuridad de la clínica InGen.
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('maintenance-overlay')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×670) ----
    var LW = 1200, LH = 670;
    var GAME_DURATION = 120; // 2 minutos en segundos
    var FLASHLIGHT_RADIUS = 165; // Radio del foco de la linterna

    // ---- ESTADO DEL JUEGO ----
    var state = 'idle'; // idle | searching | warning | prowling | jumpscare | won | lost
    var timeLeft = GAME_DURATION;
    var flashlightOn = true;
    var mouseX = LW / 2, mouseY = LH / 2;
    var isMouseInside = false;

    // Amenaza del Dilophosaurus
    var nextThreatTimer = 20; // Segundos hasta la primera advertencia
    var warningTimeLeft = 3.8; // Segundos para apagar la linterna
    var prowlTimeLeft = 5.0; // Segundos que el Dilopho se queda en la sala
    var postProwlSafeTimer = 0; // Segundos mostrando "¡Se ha ido! Sigue buscando"
    var jumpscareProgress = 0;

    // Efectos visuales y textos flotantes
    var shakeTimer = 0;
    var shakeMag = 0;
    var floatingTexts = []; // { text, x, y, color, life, maxLife }

    // Bucle y canvas
    var aniFrame = null;
    var lastTime = 0;
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx;

    // ---- OBJETOS A ENCONTRAR (5 OBJETIVOS CLAVE — TAMAÑO DISCRETO Y ESCONDIDOS) ----
    var TARGET_ITEMS = [
        {
            id: 'bengala',
            name: 'Bengala',
            file: 'Bengala.png',
            x: 195, y: 590, h: 56, rot: 38,
            icon: '🔴',
            desc: 'Bengala de emergencia',
            collected: false
        },
        {
            id: 'lentes',
            name: 'Lentes Nocturnos',
            file: 'Lentes Nocturnos.png',
            x: 540, y: 415, h: 32, rot: -12,
            icon: '🥽',
            desc: 'Visor nocturno InGen',
            collected: false
        },
        {
            id: 'diario',
            name: 'Diario de la Dra. Sorkin',
            file: 'Diario de la Dra. Sorkin.png',
            x: 955, y: 195, h: 42, rot: 15,
            icon: '📓',
            desc: 'Anotaciones de campo',
            collected: false
        },
        {
            id: 'jophery',
            name: 'Jophery Photo',
            file: 'Jophery Photo.png',
            fallbackFile: 'Jophery Photo.jpg',
            x: 345, y: 350, h: 30, rot: -14,
            icon: '📷',
            desc: 'Fotografía conmemorativa',
            collected: false
        },
        {
            id: 'barbasol',
            name: 'Barbasol Model',
            file: 'Barbasol Model.png',
            x: 1060, y: 550, h: 52, rot: 8,
            icon: '🥫',
            desc: 'Lata criogénica de embriones',
            collected: false
        }
    ];

    // ---- OBJETOS ERRÓNEOS / DISTRACTORES (DECOYS) ----
    var DECOY_ITEMS = [
        { id: 'frasco', name: 'Frasco de Sedante', file: 'Decoy_Frasco.png', x: 885, y: 205, h: 32, rot: 0 },
        { id: 'jeringa', name: 'Jeringa InGen', file: 'Decoy_Jeringa.png', x: 710, y: 380, h: 36, rot: 25 },
        { id: 'bisturi', name: 'Bisturí Quirúrgico', file: 'Decoy_Bisturi.png', x: 290, y: 360, h: 32, rot: -30 },
        { id: 'portapapeles', name: 'Portapapeles Manchado', file: 'Decoy_Portapapeles.png', x: 165, y: 460, h: 44, rot: -6 },
        { id: 'estetoscopio', name: 'Estetoscopio Roto', file: 'Decoy_Estetoscopio.png', x: 980, y: 430, h: 38, rot: 18 }
    ];

    // ---- PISCINA DE ESCONDITES EN LA CLÍNICA (POSICIONES LÓGICAS 1200x670) ----
    var HIDING_SPOTS = [
        { x: 195, y: 590, rot: 38 },  // Suelo rincón inferior izquierdo junto al mueble
        { x: 165, y: 460, rot: -6 },  // Lateral gaveta escritorio izquierdo
        { x: 290, y: 360, rot: -28 }, // Mesón de laboratorio izquierdo junto al lavabo
        { x: 345, y: 350, rot: -14 }, // Mesón izquierdo bajo bandejas
        { x: 230, y: 390, rot: 18 },  // Silla / bajo mueble izquierdo
        { x: 140, y: 330, rot: -12 }, // Borde estante izquierdo extremo
        { x: 540, y: 415, rot: -12 }, // Estructura inferior de la camilla médica
        { x: 620, y: 420, rot: 15 },  // Pliegue de colchón / cabecera de la camilla
        { x: 480, y: 490, rot: -35 }, // Sombra en el suelo bajo ruedas de la camilla
        { x: 670, y: 510, rot: 22 },  // Suelo cerca de la pata derecha de la camilla
        { x: 710, y: 380, rot: 25 },  // Carrito de bandejas junto a la camilla
        { x: 770, y: 440, rot: -18 }, // Entre carrito y estante vertical
        { x: 885, y: 205, rot: 0 },   // Estante superior centro tras frascos
        { x: 955, y: 195, rot: 15 },  // Estante superior derecho entre cajas de cartón
        { x: 890, y: 320, rot: -10 }, // Segundo estante fila media
        { x: 1010, y: 325, rot: 20 }, // Segundo estante borde derecho
        { x: 980, y: 430, rot: 18 },  // Tercer estante sobre cajas
        { x: 870, y: 440, rot: -15 }, // Tercer estante esquina izquierda
        { x: 1060, y: 550, rot: 8 },  // Estante inferior pata metálica
        { x: 920, y: 560, rot: -25 }, // Estante inferior suelo oscuro
        { x: 1090, y: 460, rot: 12 }, // Sombra pared derecha
        { x: 420, y: 340, rot: -8 }   // Corredor oscuro fondo
    ];

    // Asigna posiciones aleatorias a todos los objetos en cada partida
    function randomizeItemPositions() {
        var spots = HIDING_SPOTS.slice();
        // Mezclado Fisher-Yates
        for (var i = spots.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = spots[i];
            spots[i] = spots[j];
            spots[j] = temp;
        }

        // 5 escondites para objetivos clave
        for (var t = 0; t < TARGET_ITEMS.length; t++) {
            var s = spots[t];
            var jX = (Math.random() * 8) - 4;
            var jY = (Math.random() * 8) - 4;
            var jR = (Math.random() * 8) - 4;
            TARGET_ITEMS[t].x = Math.round(s.x + jX);
            TARGET_ITEMS[t].y = Math.round(s.y + jY);
            TARGET_ITEMS[t].rot = Math.round(s.rot + jR);
            TARGET_ITEMS[t].collected = false;
        }

        // 5 escondites para distractores
        for (var d = 0; d < DECOY_ITEMS.length; d++) {
            var ds = spots[TARGET_ITEMS.length + d];
            var djX = (Math.random() * 8) - 4;
            var djY = (Math.random() * 8) - 4;
            var djR = (Math.random() * 8) - 4;
            DECOY_ITEMS[d].x = Math.round(ds.x + djX);
            DECOY_ITEMS[d].y = Math.round(ds.y + djY);
            DECOY_ITEMS[d].rot = Math.round(ds.rot + djR);
        }
    }

    // ---- IMÁGENES ----
    var imgs = {
        fondo: new Image(),
        dilopho: new Image(),
        // Targets
        bengala: new Image(),
        lentes: new Image(),
        diario: new Image(),
        jophery: new Image(),
        barbasol: new Image(),
        // Decoys
        frasco: new Image(),
        jeringa: new Image(),
        bisturi: new Image(),
        portapapeles: new Image(),
        estetoscopio: new Image()
    };

    // ---- AUDIO ----
    var sndTension     = null; // Música de fondo en loop
    var sndAdvertencia = null; // Aviso previo del Dilophosaurus
    var sndAttack      = null; // Ataque y rugido mortal
    var sndError       = null; // Audio al tocar objeto erróneo

    // ============================================================
    //  RESOLUCIÓN DE ARCHIVOS (RAÍZ + CARPETA DE RESPALDO)
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudio(filename, loop, vol) {
        var primary = resolveURI(filename);
        var fallback = 'Venomous%20Spitter/' + resolveURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function () {
            if (a.src.indexOf('Venomous%20Spitter') === -1 && a.src.indexOf('Venomous Spitter') === -1) {
                a.src = fallback;
            } else if (filename === 'Tension.mp4' && a.src.indexOf('.mp3') === -1) {
                // Respaldo secundario si se sube como Tension.mp3
                a.src = 'Tension.mp3';
            } else if (filename === 'Tension.mp4' && a.src.indexOf('Venomous%20Spitter/Tension.mp3') === -1) {
                a.src = 'Venomous%20Spitter/Tension.mp3';
            }
        });
        return a;
    }

    function loadImageWithFallback(img, filename, fallbackAlt, onDone) {
        var primary = resolveURI(filename);
        var fallback = 'Venomous%20Spitter/' + resolveURI(filename);
        var finished = false;

        function markDone() {
            if (!finished) {
                finished = true;
                onDone();
            }
        }

        img.onload = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Venomous%20Spitter') === -1 && img.src.indexOf('Venomous Spitter') === -1) {
                img.src = fallback;
            } else if (fallbackAlt && img.src.indexOf(encodeURI(fallbackAlt)) === -1) {
                img.src = resolveURI(fallbackAlt);
            } else {
                console.warn('[DilophoGame] No se pudo cargar imagen:', filename);
                markDone();
            }
        };
        img.src = primary;
    }

    function loadAllImages(cb) {
        var total = 2 + TARGET_ITEMS.length + DECOY_ITEMS.length;
        var count = 0;
        function done() { if (++count >= total) cb(); }

        loadImageWithFallback(imgs.fondo, 'FONDO HOSP.jpg', null, done);
        loadImageWithFallback(imgs.dilopho, 'Dilopho Model.png', null, done);

        TARGET_ITEMS.forEach(function (item) {
            loadImageWithFallback(imgs[item.id], item.file, item.fallbackFile || null, done);
        });

        DECOY_ITEMS.forEach(function (item) {
            loadImageWithFallback(imgs[item.id], item.file, null, done);
        });
    }

    function initAudio() {
        sndTension     = createAudio('Tension.mp4', true, 0.38);
        sndAdvertencia = createAudio('Advertencia.mp4', false, 1.0);
        sndAttack      = createAudio('Attack.mp4', false, 1.0);
        sndError       = createAudio('Audio Error.ogg', false, 0.95);
    }

    function playAudio(snd) {
        if (!snd) return;
        try {
            snd.currentTime = 0;
            snd.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        [sndTension, sndAdvertencia, sndAttack, sndError].forEach(function (s) {
            if (s) {
                try { s.pause(); s.currentTime = 0; } catch (e) {}
            }
        });
    }

    // Efecto de sonido sintético de hallazgo positivo
    var audioCtx = null;
    function playPickupFX() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!audioCtx && AC) audioCtx = new AC();
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if (!audioCtx) return;

            var now = audioCtx.currentTime;
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5
            osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.28); // E6

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } catch (e) {}
    }

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        var s = document.createElement('style');
        s.textContent = `
            /* --- BOTÓN FLOTANTE PORTADA (VERDE TÓXICO / DILOPHOSAURUS) --- */
            #dilopho-fab {
                position: fixed;
                bottom: 232px; right: 28px;
                left: auto;
                z-index: 99990;
                display: flex; align-items: center; gap: 0.55rem;
                padding: 0.65rem 1.3rem 0.65rem 0.9rem;
                background: rgba(4, 24, 12, 0.92);
                border: 2px solid #2ecc71; border-radius: 50px;
                cursor: pointer; user-select: none;
                color: #2ecc71;
                font-family: 'Orbitron','Share Tech Mono',monospace;
                font-size: 0.78rem; font-weight: 700;
                letter-spacing: 1.5px; text-transform: uppercase;
                box-shadow: 0 0 22px rgba(46,204,113,.45), 0 4px 16px rgba(0,0,0,.6);
                backdrop-filter: blur(8px);
                transition: all .22s ease;
                animation: dilopho-fab-pulse 2.8s ease-in-out infinite;
            }
            #dilopho-fab:hover {
                background: rgba(46,204,113,.22);
                box-shadow: 0 0 44px rgba(46,204,113,.75), 0 4px 20px rgba(0,0,0,.7);
                transform: scale(1.07) translateY(-2px);
                color: #a8ff3e;
            }
            #dilopho-fab img {
                width: 44px; height: auto; max-height: 32px;
                object-fit: contain;
                filter: drop-shadow(0 0 6px rgba(46,204,113,.7));
                pointer-events: none;
            }
            .dilopho-fab-title { display:block; font-size:.78rem; }
            .dilopho-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#a8ff3e; letter-spacing:1px; opacity:.85; }
            @keyframes dilopho-fab-pulse {
                0%,100%{ box-shadow:0 0 22px rgba(46,204,113,.45),0 4px 16px rgba(0,0,0,.6); }
                50%    { box-shadow:0 0 44px rgba(46,204,113,.75),0 4px 20px rgba(0,0,0,.7); }
            }

            /* --- OVERLAY DE JUEGO PANTALLA COMPLETA --- */
            #dilopho-overlay {
                position: fixed; inset: 0; z-index: 99995;
                background: #000;
                display: none; flex-direction: column;
                user-select: none;
            }
            #dilopho-overlay.open { display: flex; }

            /* Header */
            #dilopho-header {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .5rem 1.2rem;
                background: rgba(3, 14, 8, .92);
                border-bottom: 2px solid #2ecc71;
                backdrop-filter: blur(4px);
                z-index: 10;
                gap: 1rem;
            }
            #dilopho-header-left {
                display: flex; align-items: center; gap: .8rem;
            }
            #dilopho-header-title {
                font-family:'Orbitron',monospace; font-size:.9rem; font-weight:900;
                color:#2ecc71; letter-spacing:2px; text-transform:uppercase;
            }
            #dilopho-header-timer {
                font-family:'Orbitron',monospace; font-size:.95rem; font-weight:700;
                color:#f1c40f; background:rgba(0,0,0,.6); padding:.25rem .7rem;
                border:1px solid rgba(241,196,15,.5); border-radius:4px;
                letter-spacing:1px;
            }

            /* Marcador de Estado en el Header */
            #dilopho-header-tracker {
                font-family: 'Share Tech Mono', monospace; font-size: .8rem; font-weight: 700;
                padding: .25rem .75rem; border-radius: 4px; letter-spacing: 1px;
                border: 1px solid rgba(46,204,113,.4); color: #2ecc71; background: rgba(46,204,113,.12);
                transition: all .2s;
            }
            #dilopho-header-tracker.warning {
                border-color: #e74c3c; color: #ff7675; background: rgba(231,76,60,.25);
                animation: banner-flash .35s infinite alternate;
            }
            #dilopho-header-tracker.prowling {
                border-color: #f39c12; color: #f1c40f; background: rgba(243,156,18,.3);
                box-shadow: 0 0 14px rgba(243,156,18,.5);
            }
            #dilopho-header-tracker.safe {
                border-color: #2ecc71; color: #a8ff3e; background: rgba(46,204,113,.3);
                box-shadow: 0 0 14px rgba(46,204,113,.5);
            }

            /* Botón linterna */
            #dilopho-torch-btn {
                background: #f1c40f; color: #111;
                border: 2px solid #f39c12; border-radius: 4px;
                font-family: 'Orbitron', monospace; font-size: .8rem; font-weight: 900;
                padding: .45rem 1.1rem; cursor: pointer;
                letter-spacing: 1.5px; transition: all .18s ease;
                box-shadow: 0 0 15px rgba(241,196,15,.6);
            }
            #dilopho-torch-btn.off {
                background: #111; color: #2ecc71;
                border-color: #2ecc71;
                box-shadow: 0 0 10px rgba(46,204,113,.3);
            }
            #dilopho-torch-btn.danger-pulse {
                animation: dilopho-torch-alert .35s infinite alternate;
            }
            @keyframes dilopho-torch-alert {
                from { background:#e74c3c; border-color:#ff7675; box-shadow:0 0 25px #e74c3c; color:#fff; }
                to   { background:#c0392b; border-color:#d63031; box-shadow:0 0 5px #c0392b; color:#ffeaa7; }
            }

            #dilopho-close-btn {
                background:transparent; border:1px solid rgba(46,204,113,.4); color:#2ecc71;
                font-family:'Share Tech Mono',monospace; font-size:.75rem;
                padding:.35rem .9rem; border-radius:3px; cursor:pointer;
                letter-spacing:1px; transition:all .2s;
            }
            #dilopho-close-btn:hover { background:rgba(46,204,113,.2); color:#fff; border-color:#2ecc71; }

            /* Canvas wrap */
            #dilopho-canvas-wrap {
                flex: 1;
                position: relative;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                background: #020403;
            }
            #dilopho-canvas {
                display: block;
                cursor: crosshair;
                touch-action: none;
            }

            /* Banner de Alerta / Estado */
            #dilopho-alert-banner {
                position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
                z-index: 50;
                font-family: 'Orbitron', monospace; font-size: clamp(.8rem, 2vw, 1.05rem);
                font-weight: 900; letter-spacing: 2px; text-transform: uppercase;
                padding: .75rem 2rem; border-radius: 6px;
                display: none; align-items: center; justify-content: center; gap: .8rem;
                box-shadow: 0 4px 25px rgba(0,0,0,.85);
                backdrop-filter: blur(8px);
                text-align: center;
                pointer-events: none;
            }
            #dilopho-alert-banner.warning {
                display: flex !important; background: rgba(192, 57, 43, 0.95);
                color: #fff; border: 2px solid #e74c3c;
                box-shadow: 0 0 35px rgba(231, 76, 60, 0.9);
                animation: banner-flash .35s infinite alternate;
            }
            #dilopho-alert-banner.prowling {
                display: flex !important; background: rgba(22, 14, 2, 0.96);
                color: #f1c40f; border: 2px solid #f39c12;
                box-shadow: 0 0 30px rgba(243, 156, 18, 0.8);
            }
            #dilopho-alert-banner.safe {
                display: flex !important; background: rgba(4, 30, 14, 0.96);
                color: #2ecc71; border: 2px solid #2ecc71;
                box-shadow: 0 0 30px rgba(46, 204, 113, 0.8);
            }
            @keyframes banner-flash {
                from { transform: translateX(-50%) scale(1); }
                to   { transform: translateX(-50%) scale(1.03); }
            }

            /* Status Bar / Inventario Inferior */
            #dilopho-status-bar {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .5rem 1.4rem;
                background: rgba(3, 14, 8, .94);
                border-top: 1px solid rgba(46, 204, 113, .35);
                font-family:'Share Tech Mono',monospace; font-size:.82rem;
                backdrop-filter: blur(4px); z-index:10;
                gap: 1rem; flex-wrap: wrap;
            }
            #dilopho-items-wrap {
                display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap;
            }
            .dilopho-item-slot {
                display: flex; align-items: center; gap: .4rem;
                padding: .35rem .75rem; border-radius: 4px;
                border: 1px solid rgba(255,255,255,.15);
                background: rgba(255,255,255,.05);
                color: #777; font-size: .75rem; font-family:'Share Tech Mono',monospace;
                transition: all .25s ease;
            }
            .dilopho-item-slot.found {
                border-color: #2ecc71; background: rgba(46,204,113,.18);
                color: #2ecc71; font-weight: 700;
                box-shadow: 0 0 12px rgba(46,204,113,.35);
                transform: translateY(-1px);
            }
            .dilopho-item-icon { font-size: .95rem; }

            /* --- PANTALLAS MODALES (Inicio, Derrota, Victoria) --- */
            .dilopho-screen {
                position: absolute; inset: 0; z-index: 25;
                display: none; flex-direction: column;
                align-items: center; justify-content: center;
                text-align: center;
                background: rgba(2, 6, 4, .88);
                backdrop-filter: blur(8px);
                font-family: 'Share Tech Mono',monospace;
                padding: 1.2rem;
            }
            .dilopho-screen.show { display: flex; animation: dilopho-pop .3s ease-out; }
            @keyframes dilopho-pop {
                from { opacity: 0; transform: scale(.95); }
                to   { opacity: 1; transform: scale(1); }
            }
            .dilopho-screen-title {
                font-family:'Orbitron',monospace;
                font-size: clamp(1.4rem, 4vw, 2.3rem);
                font-weight: 900; letter-spacing: 3px; text-transform: uppercase;
                margin-bottom: .5rem;
            }
            .dilopho-screen-sub {
                font-size: clamp(.75rem, 1.8vw, .95rem); color: #ccc;
                margin-bottom: 1.6rem; max-width: 580px; line-height: 1.6;
            }
            .dilopho-instruct {
                display: flex; gap: 1.4rem; margin: .6rem 0 1.6rem;
                flex-wrap: wrap; justify-content: center;
                font-size: .78rem; color: #ddd;
            }
            .dilopho-inst-item {
                display:flex; flex-direction:column; align-items:center; gap:.3rem;
                background:rgba(255,255,255,.05); border:1px solid rgba(46,204,113,.25);
                border-radius:6px; padding:.65rem .85rem; min-width:115px;
            }
            .dilopho-inst-icon { font-size: 1.6rem; }
            .dilopho-btn {
                font-family:'Orbitron',monospace; font-size:.85rem; font-weight:700;
                letter-spacing:1.5px; text-transform:uppercase;
                padding:.75rem 2rem; border-radius:4px; cursor:pointer;
                transition:all .2s; border:none; margin:.3rem;
            }
            .dilopho-btn-primary { background:#2ecc71; color:#031408; box-shadow:0 0 16px rgba(46,204,113,.5); }
            .dilopho-btn-primary:hover { background:#a8ff3e; box-shadow:0 0 30px rgba(168,255,62,.75); transform:translateY(-2px); }
            .dilopho-btn-secondary { background:transparent; border:1px solid #2ecc71; color:#2ecc71; }
            .dilopho-btn-secondary:hover { background:rgba(46,204,113,.15); }

            /* --- RESPONSIVE MÓVIL --- */
            @media (max-width: 600px) {
                #dilopho-fab { bottom: 180px; right: 16px; left: auto; padding: .5rem .9rem .5rem .65rem; }
                #dilopho-fab img { width: 36px; height: auto; max-height: 26px; }
                .dilopho-fab-title { font-size: .65rem; }
                .dilopho-fab-sub   { display: none; }
                #dilopho-status-bar { font-size: .68rem; padding: .35rem .6rem; }
                #dilopho-header { padding: .35rem .6rem; }
                #dilopho-header-title { font-size: .72rem; }
                #dilopho-torch-btn { font-size: .68rem; padding: .35rem .65rem; }
                .dilopho-item-slot { font-size: .65rem; padding: .25rem .45rem; }
            }
        `;
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'dilopho-overlay';
        ov.innerHTML = `
            <div id="dilopho-header">
                <div id="dilopho-header-left">
                    <div id="dilopho-header-title">🏥 CLÍNICA INGEN — AMENAZA VENENOSA</div>
                    <div id="dilopho-header-timer">⏱️ 02:00</div>
                    <div id="dilopho-header-tracker" class="normal">🟢 SALA DESPEJADA</div>
                </div>
                <div style="display:flex;align-items:center;gap:.7rem;">
                    <button id="dilopho-torch-btn">🔦 APAGAR LINTERNA (ESPACIO)</button>
                    <button id="dilopho-fullscreen-btn" class="minigame-fullscreen-btn">⛶ PANTALLA COMPLETA</button>
                    <button id="dilopho-close-btn">✕ CERRAR</button>
                </div>
            </div>

            <div id="dilopho-canvas-wrap">
                <canvas id="dilopho-canvas"></canvas>

                <div id="dilopho-alert-banner"></div>

                <!-- Pantalla inicio -->
                <div class="dilopho-screen show" id="dilopho-start-screen">
                    <div class="dilopho-screen-title" style="color:#2ecc71;">🏥 ACOSO EN LA CLÍNICA</div>
                    <div class="dilopho-screen-sub">
                        La energía principal de la clínica InGen falló y un <strong>Dilophosaurus</strong> merodea en las sombras.<br>
                        Tu misión es encontrar los <strong style="color:#2ecc71;">5 objetos clasificados en 2 minutos</strong> usando tu linterna.<br><br>
                        ⚠️ <strong>ATENCIÓN:</strong> Cuando escuches el audio de <strong>Advertencia</strong>, el Dilophosaurus se prepara para entrar.<br>
                        <strong style="color:#f1c40f;">¡Apaga la linterna inmediatamente antes de que te descubra!</strong><br>
                        Espera en silencio hasta que el dinosaurio se marche de la sala.<br>
                        <em>Cuidado con los objetos inútiles: tocarlos activará una alarma de error.</em>
                    </div>
                    <div class="dilopho-instruct">
                        <div class="dilopho-inst-item">
                            <div class="dilopho-inst-icon">🔦</div>
                            <div>Luz del Mouse<br><strong>EXPLORA</strong></div>
                        </div>
                        <div class="dilopho-inst-item">
                            <div class="dilopho-inst-icon">👂</div>
                            <div>Audio Alerta =<br><strong>¡APAGA LUZ!</strong></div>
                        </div>
                        <div class="dilopho-inst-item">
                            <div class="dilopho-inst-icon">⏳</div>
                            <div>Espera a que<br><strong>SE MARCHE</strong></div>
                        </div>
                        <div class="dilopho-inst-item">
                            <div class="dilopho-inst-icon">🎒</div>
                            <div>Encuentra los<br><strong>5 OBJETOS</strong></div>
                        </div>
                    </div>
                    <button class="dilopho-btn dilopho-btn-primary" id="dilopho-start-btn">▶ COMENZAR BÚSQUEDA</button>
                </div>

                <!-- Pantalla derrota (Dilophosaurus ataca) -->
                <div class="dilopho-screen" id="dilopho-lose-attack-screen">
                    <div class="dilopho-screen-title" style="color:#e74c3c;">💀 ¡EL DILOPHOSAURUS TE CEGÓ Y DEVORÓ!</div>
                    <div class="dilopho-screen-sub">
                        No apagaste la linterna a tiempo o encendiste la luz mientras el dinosaurio aún estaba en la sala.<br>
                        Su veneno corrosivo impactó directamente en tus ojos.
                    </div>
                    <button class="dilopho-btn dilopho-btn-primary" id="dilopho-retry-btn">🔄 REINTENTAR</button>
                    <button class="dilopho-btn dilopho-btn-secondary" id="dilopho-lose-close">CERRAR</button>
                </div>

                <!-- Pantalla derrota (Tiempo agotado) -->
                <div class="dilopho-screen" id="dilopho-lose-time-screen">
                    <div class="dilopho-screen-title" style="color:#e67e22;">⏳ ¡TIEMPO AGOTADO!</div>
                    <div class="dilopho-screen-sub">
                        Pasaron los 2 minutos sin recuperar todos los suministros.<br>
                        Los sistemas de seguridad se bloquearon por completo y la clínica quedó sellada.
                    </div>
                    <button class="dilopho-btn dilopho-btn-primary" id="dilopho-retry-time-btn">🔄 REINTENTAR</button>
                    <button class="dilopho-btn dilopho-btn-secondary" id="dilopho-lose-time-close">CERRAR</button>
                </div>

                <!-- Pantalla victoria -->
                <div class="dilopho-screen" id="dilopho-win-screen">
                    <div class="dilopho-screen-title" style="color:#2ecc71;">🏆 ¡ESCAPASTE DE LA CLÍNICA!</div>
                    <div class="dilopho-screen-sub">
                        ¡Has recuperado los 5 objetos clasificados burlando al Dilophosaurus en la oscuridad total!<br>
                        El laboratorio de la Dra. Sorkin y los embriones Barbasol están asegurados.
                    </div>
                    <button class="dilopho-btn dilopho-btn-primary" id="dilopho-win-replay">🔄 JUGAR DE NUEVO</button>
                    <button class="dilopho-btn dilopho-btn-secondary" id="dilopho-win-close">CERRAR</button>
                </div>
            </div>

            <div id="dilopho-status-bar">
                <div style="color:#2ecc71;font-weight:700;letter-spacing:1px;">OBJETOS REQUERIDOS:</div>
                <div id="dilopho-items-wrap"></div>
            </div>
        `;
        document.body.appendChild(ov);
    }

    // ============================================================
    //  FAB BUTTON
    // ============================================================
    function buildFAB() {
        var fab = document.createElement('button');
        fab.id = 'dilopho-fab';
        fab.title = "¡Acoso en la Clínica! - Minijuego Dilophosaurus";
        fab.innerHTML = `
            <img src="Dilopho%20Model.png" onerror="if(this.src.indexOf('Venomous%20Spitter')===-1)this.src='Venomous%20Spitter/Dilopho%20Model.png';" alt="Dilophosaurus">
            <span>
                <span class="dilopho-fab-title">¡Alerta Dilophosaurus!</span>
                <span class="dilopho-fab-sub">Acoso en la clínica</span>
            </span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    // ============================================================
    //  INICIALIZACIÓN DEL CANVAS Y EVENTOS
    // ============================================================
    function resizeCanvas() {
        var wrap = document.getElementById('dilopho-canvas-wrap');
        if (!wrap || !canvas) return;
        var W = wrap.clientWidth, H = wrap.clientHeight;
        var cw, ch;
        if (W / H > LW / LH) { ch = H; cw = Math.round(ch * LW / LH); }
        else                  { cw = W; ch = Math.round(cw * LH / LW); }
        canvas.width  = cw; canvas.height = ch;
        canvasW = cw; canvasH = ch;
        scale   = cw / LW;
    }

    function toggleFlashlight() {
        if (state !== 'searching' && state !== 'warning' && state !== 'prowling') return;

        flashlightOn = !flashlightOn;
        updateTorchButtonUI();

        if (flashlightOn) {
            // Si el jugador enciende la linterna MIENTRAS el Dilophosaurus está en la sala:
            if (state === 'prowling') {
                triggerJumpscare();
            }
        } else {
            // Si apagó la linterna durante la advertencia: ¡se salva! Entra en acecho
            if (state === 'warning') {
                state = 'prowling';
                prowlTimeLeft = 4.5 + Math.random() * 1.5; // Entre 4.5s y 6s
                updateAlertBanner();
            }
        }
    }

    function updateTorchButtonUI() {
        var btn = document.getElementById('dilopho-torch-btn');
        if (!btn) return;

        if (flashlightOn) {
            btn.classList.remove('off');
            btn.textContent = '🔦 APAGAR LINTERNA (ESPACIO)';
        } else {
            btn.classList.add('off');
            btn.textContent = '💡 ENCENDER LINTERNA (ESPACIO)';
        }

        if (state === 'warning' && flashlightOn) {
            btn.classList.add('danger-pulse');
        } else {
            btn.classList.remove('danger-pulse');
        }
    }

    function updateAlertBanner() {
        var banner = document.getElementById('dilopho-alert-banner');
        var tracker = document.getElementById('dilopho-header-tracker');

        if (state === 'warning') {
            if (banner) {
                banner.className = 'warning';
                banner.style.display = 'flex';
                banner.innerHTML = `⚠️ ¡DILOPHOSAURUS ACECHANDO! ¡APAGA LA LINTERNA! [${warningTimeLeft.toFixed(1)}s]`;
            }
            if (tracker) {
                tracker.className = 'warning';
                tracker.innerHTML = `🚨 ALERTA: ${warningTimeLeft.toFixed(1)}s`;
            }
        } else if (state === 'prowling') {
            if (banner) {
                banner.className = 'prowling';
                banner.style.display = 'flex';
                banner.innerHTML = `👁️ DILOPHOSAURUS EN LA SALA... ESPERA A QUE SE VAYA: [${prowlTimeLeft.toFixed(1)}s]`;
            }
            if (tracker) {
                tracker.className = 'prowling';
                tracker.innerHTML = `👁️ EN LA SALA: ${prowlTimeLeft.toFixed(1)}s`;
            }
        } else if (postProwlSafeTimer > 0) {
            if (banner) {
                banner.className = 'safe';
                banner.style.display = 'flex';
                banner.innerHTML = `✅ ¡EL DILOPHOSAURUS SE HA IDO! SIGUE BUSCANDO`;
            }
            if (tracker) {
                tracker.className = 'safe';
                tracker.innerHTML = `✅ SE HA IDO (SALA DESPEJADA)`;
            }
        } else {
            if (banner) {
                banner.className = '';
                banner.style.display = 'none';
            }
            if (tracker) {
                tracker.className = 'normal';
                tracker.innerHTML = `🟢 SALA DESPEJADA`;
            }
        }
    }

    function updateInventoryUI() {
        var wrap = document.getElementById('dilopho-items-wrap');
        if (!wrap) return;
        wrap.innerHTML = '';

        TARGET_ITEMS.forEach(function (item) {
            var el = document.createElement('div');
            el.className = 'dilopho-item-slot' + (item.collected ? ' found' : '');
            el.innerHTML = `
                <span class="dilopho-item-icon">${item.collected ? '✅' : item.icon}</span>
                <span>${item.name}</span>
            `;
            wrap.appendChild(el);
        });
    }

    function updateTimerUI() {
        var el = document.getElementById('dilopho-header-timer');
        if (!el) return;
        var m = Math.floor(timeLeft / 60);
        var s = Math.floor(timeLeft % 60);
        el.textContent = '⏱️ ' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (timeLeft <= 20) {
            el.style.color = '#e74c3c';
            el.style.borderColor = '#e74c3c';
        } else {
            el.style.color = '#f1c40f';
            el.style.borderColor = 'rgba(241,196,15,.5)';
        }
    }

    // ============================================================
    //  DIFICULTAD DINÁMICA SEGÚN OBJETOS ENCONTRADOS
    // ============================================================
    function getFoundCount() {
        var count = 0;
        for (var i = 0; i < TARGET_ITEMS.length; i++) {
            if (TARGET_ITEMS[i].collected) count++;
        }
        return count;
    }

    // Calcula el intervalo hasta la siguiente advertencia del Dilophosaurus:
    // A más objetos recuperados, el Dilophosaurus aparece más seguido e implacable
    function getNextThreatInterval() {
        var found = getFoundCount();
        // 0 encontrados: 12 - 16s
        // 1 encontrado:   9 - 13s
        // 2 encontrados:  7 - 10s
        // 3 encontrados:  5.5 - 8s
        // 4 encontrados:  4 - 6.5s
        var minTime = Math.max(4.0, 12 - (found * 2.0));
        var variance = Math.max(2.0, 4.0 - (found * 0.5));
        return minTime + Math.random() * variance;
    }

    // Tiempo para reaccionar y apagar la linterna (se reduce con el avance)
    function getWarningDuration() {
        var found = getFoundCount();
        // 0-1 objetos: ~3.3s
        // 2-3 objetos: ~2.8s
        // 4 objetos:   ~2.3s
        return Math.max(2.2, 3.4 - (found * 0.28));
    }

    // ============================================================
    //  CLIC Y DETECCIÓN DE OBJETOS
    // ============================================================
    function onCanvasClick(clientX, clientY) {
        if (state !== 'searching' && state !== 'warning') return;

        // Si la linterna está apagada, no se puede interactuar a oscuras
        if (!flashlightOn) return;

        var rect = canvas.getBoundingClientRect();
        var lx = (clientX - rect.left) / scale;
        var ly = (clientY - rect.top) / scale;

        // La interacción solo funciona dentro del cono/radio de luz de la linterna
        var distToTorch = Math.hypot(lx - mouseX, ly - mouseY);
        if (distToTorch > FLASHLIGHT_RADIUS) return;

        // 1. Comprobar si golpeó un objetivo legítimo
        for (var i = 0; i < TARGET_ITEMS.length; i++) {
            var item = TARGET_ITEMS[i];
            if (item.collected) continue;

            var img = imgs[item.id];
            var aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 1;
            var itemW = item.h * aspect;
            var halfW = Math.max(18, (itemW / 2) + 12);
            var halfH = Math.max(18, (item.h / 2) + 12);

            if (lx >= item.x - halfW && lx <= item.x + halfW &&
                ly >= item.y - halfH && ly <= item.y + halfH) {
                // ¡Encontrado!
                item.collected = true;
                playPickupFX();
                floatingTexts.push({
                    text: '✨ ¡' + item.name + ' recuperado!',
                    x: lx, y: ly - 20,
                    color: '#2ecc71',
                    life: 1.6, maxLife: 1.6
                });
                updateInventoryUI();

                // Cada objeto encontrado alerta al Dilophosaurus y hace que aparezca más rápido:
                nextThreatTimer = Math.min(nextThreatTimer, Math.max(3.0, nextThreatTimer * 0.45));

                checkVictory();
                return;
            }
        }

        // 2. Comprobar si tocó un objeto erróneo (decoy)
        for (var j = 0; j < DECOY_ITEMS.length; j++) {
            var decoy = DECOY_ITEMS[j];
            var dImg = imgs[decoy.id];
            var dAspect = (dImg && dImg.naturalWidth && dImg.naturalHeight) ? (dImg.naturalWidth / dImg.naturalHeight) : 1;
            var dW = decoy.h * dAspect;
            var dHalfW = Math.max(16, (dW / 2) + 10);
            var dHalfH = Math.max(16, (decoy.h / 2) + 10);

            if (lx >= decoy.x - dHalfW && lx <= decoy.x + dHalfW &&
                ly >= decoy.y - dHalfH && ly <= decoy.y + dHalfH) {
                // ¡Error!
                playAudio(sndError);
                shakeTimer = 160;
                shakeMag = 6;
                timeLeft = Math.max(0, timeLeft - 5); // Penalización de 5 segundos
                floatingTexts.push({
                    text: '❌ ' + decoy.name + ' (Inútil -5s)',
                    x: lx, y: ly - 20,
                    color: '#e74c3c',
                    life: 1.4, maxLife: 1.4
                });
                updateTimerUI();
                return;
            }
        }
    }

    function checkVictory() {
        var allFound = TARGET_ITEMS.every(function (t) { return t.collected; });
        if (allFound) {
            triggerWin();
        }
    }

    // ============================================================
    //  JUMPSCARE Y FIN DE PARTIDA
    // ============================================================
    function triggerJumpscare() {
        state = 'jumpscare';
        jumpscareProgress = 0;
        stopAllAudio();
        playAudio(sndAttack);
        shakeTimer = 800;
        shakeMag = 18;

        setTimeout(function () {
            document.getElementById('dilopho-lose-attack-screen').classList.add('show');
        }, 1600);
    }

    function triggerTimeOut() {
        state = 'lost';
        stopAllAudio();
        document.getElementById('dilopho-lose-time-screen').classList.add('show');
    }

    function triggerWin() {
        state = 'won';
        stopAllAudio();
        document.getElementById('dilopho-win-screen').classList.add('show');
    }

    function hideScreens() {
        ['dilopho-start-screen', 'dilopho-lose-attack-screen', 'dilopho-lose-time-screen', 'dilopho-win-screen'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('show');
        });
    }

    // ============================================================
    //  RENDER
    // ============================================================
    function render(dt) {
        if (!ctx || !canvasW) return;

        ctx.save();

        // Screen shake
        if (shakeTimer > 0) {
            shakeTimer -= dt * 1000;
            var ox = (Math.random() * 2 - 1) * shakeMag;
            var oy = (Math.random() * 2 - 1) * shakeMag;
            ctx.translate(ox, oy);
        }

        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Dibujar el fondo del hospital (FONDO HOSP.jpg)
        if (imgs.fondo.complete) {
            ctx.drawImage(imgs.fondo, 0, 0, canvasW, canvasH);
        }

        // 2. Dibujar los objetivos no recolectados y los decoys
        function drawItem(img, item) {
            if (!img || !img.complete) return;
            var dh = Math.round(item.h * scale);
            // Relación de aspecto natural del archivo para evitar cualquier deformación o estiramiento
            var aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (item.w ? (item.w / item.h) : 1);
            var dw = Math.round(dh * aspect);
            var dx = Math.round(item.x * scale);
            var dy = Math.round(item.y * scale);

            ctx.save();
            ctx.translate(dx, dy);
            if (item.rot) {
                ctx.rotate(item.rot * Math.PI / 180);
            }
            // Sombra sutil para integrarlo al entorno
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 3;
            ctx.drawImage(img, -Math.round(dw / 2), -Math.round(dh / 2), dw, dh);
            ctx.restore();
        }

        TARGET_ITEMS.forEach(function (item) {
            if (!item.collected) {
                drawItem(imgs[item.id], item);
            }
        });

        DECOY_ITEMS.forEach(function (decoy) {
            drawItem(imgs[decoy.id], decoy);
        });

        // 3. CAPA DE OSCURIDAD Y FOCO DE LINTERNA
        if (state !== 'jumpscare') {
            if (flashlightOn) {
                // Máscara radial de linterna
                ctx.save();
                var cx = Math.round(mouseX * scale);
                var cy = Math.round(mouseY * scale);
                var r = Math.round(FLASHLIGHT_RADIUS * scale);

                var grad = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
                grad.addColorStop(0, 'rgba(3, 8, 5, 0.05)');
                grad.addColorStop(0.65, 'rgba(3, 8, 5, 0.55)');
                grad.addColorStop(0.92, 'rgba(2, 6, 4, 0.94)');
                grad.addColorStop(1, 'rgba(1, 4, 2, 0.99)');

                // Dibujar sombra ambiental que cubre todo excepto el haz
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvasW, canvasH);

                // Anillo sutil del foco
                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(241, 196, 15, 0.15)';
                ctx.lineWidth = 2 * scale;
                ctx.stroke();

                ctx.restore();
            } else {
                // Linterna apagada: oscuridad absoluta
                // El Dilophosaurus NUNCA se ve aquí en la sala (solo aparece en el Jumpscare al perder)
                ctx.fillStyle = 'rgba(1, 2, 1, 0.99)';
                ctx.fillRect(0, 0, canvasW, canvasH);

                // --- MARCADOR EN PANTALLA: DILOPHOSAURUS EN LA SALA ---
                if (state === 'prowling') {
                    ctx.save();
                    var boxW = Math.min(680 * scale, canvasW - 30);
                    var boxH = 92 * scale;
                    var boxX = (canvasW - boxW) / 2;
                    var boxY = (canvasH - boxH) / 2;

                    // Cuadro táctico
                    ctx.fillStyle = 'rgba(18, 12, 2, 0.94)';
                    ctx.strokeStyle = '#f39c12';
                    ctx.lineWidth = 2.5 * scale;
                    ctx.shadowColor = '#f39c12';
                    ctx.shadowBlur = 18;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 8 * scale);
                    else ctx.rect(boxX, boxY, boxW, boxH);
                    ctx.fill();
                    ctx.stroke();

                    // Título principal
                    ctx.font = '900 ' + Math.round(18 * scale) + "px 'Orbitron', monospace";
                    ctx.fillStyle = '#f1c40f';
                    ctx.textAlign = 'center';
                    ctx.fillText('👁️ DILOPHOSAURUS EN LA SALA', canvasW / 2, boxY + 30 * scale);

                    // Subtítulo con cuenta regresiva
                    ctx.font = '700 ' + Math.round(14 * scale) + "px 'Share Tech Mono', monospace";
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 0;
                    ctx.fillText('Espera a que se vaya: ' + prowlTimeLeft.toFixed(1) + 's   (NO enciendas la linterna)', canvasW / 2, boxY + 54 * scale);

                    // Barra de progreso
                    var barW = boxW * 0.78;
                    var barH = 7 * scale;
                    var barX = (canvasW - barW) / 2;
                    var barY = boxY + 68 * scale;
                    ctx.fillStyle = 'rgba(255,255,255,0.18)';
                    ctx.fillRect(barX, barY, barW, barH);
                    var pct = Math.max(0, Math.min(1, prowlTimeLeft / 5.0));
                    ctx.fillStyle = '#f39c12';
                    ctx.fillRect(barX, barY, barW * pct, barH);

                    ctx.restore();
                }
            }
        }

        // --- MARCADOR EN PANTALLA: CUANDO EL DILOPHOSAURUS SE HA IDO ---
        if (postProwlSafeTimer > 0 && state !== 'jumpscare' && state !== 'lost' && state !== 'won') {
            ctx.save();
            var sBoxW = Math.min(640 * scale, canvasW - 30);
            var sBoxH = 68 * scale;
            var sBoxX = (canvasW - sBoxW) / 2;
            var sBoxY = 24 * scale;

            ctx.fillStyle = 'rgba(4, 30, 14, 0.94)';
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2 * scale;
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(sBoxX, sBoxY, sBoxW, sBoxH, 8 * scale);
            else ctx.rect(sBoxX, sBoxY, sBoxW, sBoxH);
            ctx.fill();
            ctx.stroke();

            ctx.font = '900 ' + Math.round(17 * scale) + "px 'Orbitron', monospace";
            ctx.fillStyle = '#2ecc71';
            ctx.textAlign = 'center';
            ctx.fillText('✅ ¡EL DILOPHOSAURUS SE HA IDO!', canvasW / 2, sBoxY + 28 * scale);

            ctx.font = '700 ' + Math.round(13 * scale) + "px 'Share Tech Mono', monospace";
            ctx.fillStyle = '#a8ff3e';
            ctx.shadowBlur = 0;
            ctx.fillText('¡Zona despejada! Enciende la linterna y sigue buscando los objetos', canvasW / 2, sBoxY + 50 * scale);

            ctx.restore();
        }

        // 4. JUMPSCARE — Dilophosaurus salta de golpe a la pantalla
        if (state === 'jumpscare' && imgs.dilopho.complete) {
            jumpscareProgress += dt * 3.5;
            if (jumpscareProgress > 1) jumpscareProgress = 1;

            var jw = Math.round((500 + jumpscareProgress * 1100) * scale);
            var jh = Math.round((670 + jumpscareProgress * 1400) * scale);
            var jx = Math.round(600 * scale) - Math.round(jw / 2);
            var jy = Math.round(360 * scale) - Math.round(jh / 2) + Math.round((1 - jumpscareProgress) * 60 * scale);

            // Destello rojo y veneno
            ctx.fillStyle = 'rgba(160, 20, 20, ' + (0.5 * jumpscareProgress) + ')';
            ctx.fillRect(0, 0, canvasW, canvasH);

            ctx.drawImage(imgs.dilopho, jx, jy, jw, jh);
        }

        // 5. Textos flotantes
        for (var k = floatingTexts.length - 1; k >= 0; k--) {
            var ft = floatingTexts[k];
            ft.life -= dt;
            ft.y -= dt * 25;
            if (ft.life <= 0) {
                floatingTexts.splice(k, 1);
                continue;
            }
            var alpha = ft.life / ft.maxLife;
            ctx.save();
            ctx.font = 'bold ' + Math.round(18 * scale) + "px 'Orbitron', monospace";
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, Math.round(ft.x * scale), Math.round(ft.y * scale));
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  BUCLE PRINCIPAL DEL JUEGO
    // ============================================================
    function gameLoop(now) {
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (state === 'searching' || state === 'warning' || state === 'prowling') {
            // Cuenta regresiva del tiempo total (2 minutos)
            timeLeft -= dt;
            if (timeLeft <= 0) {
                timeLeft = 0;
                updateTimerUI();
                triggerTimeOut();
                return;
            }
            updateTimerUI();

            // Temporizador del mensaje "Se ha ido! Sigue buscando"
            if (postProwlSafeTimer > 0) {
                postProwlSafeTimer -= dt;
                if (postProwlSafeTimer <= 0) {
                    postProwlSafeTimer = 0;
                    updateAlertBanner();
                }
            }

            // Lógica de amenaza del Dilophosaurus (frecuencia dinámica y progresiva)
            if (state === 'searching') {
                nextThreatTimer -= dt;
                if (nextThreatTimer <= 0) {
                    // ¡Inicia fase de Advertencia!
                    state = 'warning';
                    warningTimeLeft = getWarningDuration();
                    playAudio(sndAdvertencia);
                    updateTorchButtonUI();
                    updateAlertBanner();
                }
            } else if (state === 'warning') {
                warningTimeLeft -= dt;
                updateAlertBanner();

                if (warningTimeLeft <= 0) {
                    // Si el jugador no apagó la linterna: ¡Ataque mortal!
                    if (flashlightOn) {
                        triggerJumpscare();
                    } else {
                        state = 'prowling';
                        prowlTimeLeft = 4.2 + Math.random() * 1.2;
                        updateAlertBanner();
                    }
                }
            } else if (state === 'prowling') {
                prowlTimeLeft -= dt;
                updateAlertBanner();

                // Si la linterna se encendió durante prowling:
                if (flashlightOn) {
                    triggerJumpscare();
                } else if (prowlTimeLeft <= 0) {
                    // El dinosaurio se marchó a salvo
                    state = 'searching';
                    postProwlSafeTimer = 3.5;
                    nextThreatTimer = getNextThreatInterval();
                    updateTorchButtonUI();
                    updateAlertBanner();
                }
            }
        }

        render(dt);

        if (state !== 'idle') {
            aniFrame = requestAnimationFrame(gameLoop);
        }
    }

    // ============================================================
    //  INICIO Y CONTROL DE PARTIDA
    // ============================================================
    function startGame() {
        timeLeft = GAME_DURATION;
        flashlightOn = true;
        state = 'searching';
        nextThreatTimer = 12 + Math.random() * 4; // Primera advertencia rápida a los ~12-16 segundos
        postProwlSafeTimer = 0;
        floatingTexts = [];
        shakeTimer = 0;

        // Reposicionar aleatoriamente todos los objetos y distractores en cada nueva partida
        randomizeItemPositions();

        hideScreens();
        updateInventoryUI();
        updateTimerUI();
        updateTorchButtonUI();
        updateAlertBanner();

        stopAllAudio();
        playAudio(sndTension);

        if (aniFrame) cancelAnimationFrame(aniFrame);
        lastTime = performance.now();
        aniFrame = requestAnimationFrame(gameLoop);
    }

    function closeGame() {
        stopAllAudio();
        if (aniFrame) { cancelAnimationFrame(aniFrame); aniFrame = null; }
        state = 'idle';
        document.getElementById('dilopho-overlay').classList.remove('open');
    }

    // ============================================================
    //  ENLACE DE EVENTOS
    // ============================================================
    function bindEvents() {
        var ov = document.getElementById('dilopho-overlay');
        var fab = document.getElementById('dilopho-fab');
        var closeBtn = document.getElementById('dilopho-close-btn');
        var torchBtn = document.getElementById('dilopho-torch-btn');
        var startBtn = document.getElementById('dilopho-start-btn');
        var retryBtn = document.getElementById('dilopho-retry-btn');
        var retryTimeBtn = document.getElementById('dilopho-retry-time-btn');
        var loseClose = document.getElementById('dilopho-lose-close');
        var loseTimeClose = document.getElementById('dilopho-lose-time-close');
        var winReplay = document.getElementById('dilopho-win-replay');
        var winClose = document.getElementById('dilopho-win-close');

        fab.addEventListener('click', function () {
            ov.classList.add('open');
            resizeCanvas();
            hideScreens();
            document.getElementById('dilopho-start-screen').classList.add('show');
            state = 'idle';
        });

        closeBtn.addEventListener('click', closeGame);
        var fullBtn = document.getElementById('dilopho-fullscreen-btn');
        if (fullBtn) {
            fullBtn.addEventListener('click', function () {
                var target = document.getElementById('dilopho-overlay') || document.documentElement;
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
        }
        if (loseClose) loseClose.addEventListener('click', closeGame);
        if (loseTimeClose) loseTimeClose.addEventListener('click', closeGame);
        if (winClose) winClose.addEventListener('click', closeGame);

        startBtn.addEventListener('click', startGame);
        if (retryBtn) retryBtn.addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('dilopho');
            startGame();
        });
        if (retryTimeBtn) retryTimeBtn.addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('dilopho');
            startGame();
        });
        if (winReplay) winReplay.addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('dilopho');
            startGame();
        });

        torchBtn.addEventListener('click', toggleFlashlight);

        // Tecla Espacio o F para conmutar linterna rápidamente
        window.addEventListener('keydown', function (e) {
            if (!ov.classList.contains('open')) return;
            if (e.code === 'Space' || e.key === ' ' || e.code === 'KeyF' || e.key === 'f') {
                e.preventDefault();
                toggleFlashlight();
            } else if (e.key === 'Escape') {
                closeGame();
            }
        });

        // Seguimiento del mouse para la linterna
        canvas.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / scale;
            mouseY = (e.clientY - rect.top) / scale;
            isMouseInside = true;
        });

        canvas.addEventListener('mouseleave', function () {
            isMouseInside = false;
        });

        canvas.addEventListener('click', function (e) {
            onCanvasClick(e.clientX, e.clientY);
        });

        // Soporte táctil móvil
        canvas.addEventListener('touchmove', function (e) {
            if (e.touches && e.touches[0]) {
                var rect = canvas.getBoundingClientRect();
                mouseX = (e.touches[0].clientX - rect.left) / scale;
                mouseY = (e.touches[0].clientY - rect.top) / scale;
                isMouseInside = true;
            }
        }, { passive: true });

        canvas.addEventListener('touchstart', function (e) {
            if (e.touches && e.touches[0]) {
                var rect = canvas.getBoundingClientRect();
                mouseX = (e.touches[0].clientX - rect.left) / scale;
                mouseY = (e.touches[0].clientY - rect.top) / scale;
                isMouseInside = true;
                onCanvasClick(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('resize', resizeCanvas);
    }

    // ============================================================
    //  INICIO DE LA APLICACIÓN
    // ============================================================
    function init() {
        injectStyles();
        buildOverlay();
        buildFAB();
        canvas = document.getElementById('dilopho-canvas');
        ctx = canvas.getContext('2d');

        randomizeItemPositions();

        loadAllImages(function () {
            console.log('[DilophoGame] Todos los recursos cargados correctamente.');
        });
        initAudio();
        bindEvents();
        updateInventoryUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
