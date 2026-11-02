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
    var sndError       = null;
    var isMuted        = false;
    var isPaused       = false;

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
        if (!snd || isMuted) return;
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
        if (isMuted) return;
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
                -webkit-user-select: none;
                touch-action: none;
            }
            #dilopho-overlay.open { display: flex; }

            /* Header */
            #dilopho-header {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .5rem 1.2rem;
                background: rgba(3, 14, 8, .94);
                border-bottom: 2px solid #2ecc71;
                backdrop-filter: blur(6px);
                z-index: 10;
                gap: 0.8rem;
            }
            #dilopho-header-left {
                display: flex; align-items: center; gap: .75rem;
                min-width: 0;
            }
            #dilopho-header-title {
                font-family:'Orbitron',monospace; font-size:.9rem; font-weight:900;
                color:#2ecc71; letter-spacing:2px; text-transform:uppercase;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            #dilopho-header-timer {
                font-family:'Orbitron',monospace; font-size:.95rem; font-weight:700;
                color:#f1c40f; background:rgba(0,0,0,.6); padding:.25rem .7rem;
                border:1px solid rgba(241,196,15,.5); border-radius:4px;
                letter-spacing:1px; flex-shrink: 0;
            }

            /* Marcador de Estado en el Header */
            #dilopho-header-tracker {
                font-family: 'Share Tech Mono', monospace; font-size: .8rem; font-weight: 700;
                padding: .25rem .75rem; border-radius: 4px; letter-spacing: 1px;
                border: 1px solid rgba(46,204,113,.4); color: #2ecc71; background: rgba(46,204,113,.12);
                transition: all .2s; flex-shrink: 0;
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

            /* Botón linterna de cabecera (escritorio) */
            #dilopho-torch-btn {
                background: #f1c40f; color: #111;
                border: 2px solid #f39c12; border-radius: 4px;
                font-family: 'Orbitron', monospace; font-size: .8rem; font-weight: 900;
                padding: .45rem 1.1rem; cursor: pointer;
                letter-spacing: 1.5px; transition: all .18s ease;
                box-shadow: 0 0 15px rgba(241,196,15,.6);
                white-space: nowrap;
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

            /* Botón Flotante Linterna para Celulares */
            .dilopho-floating-torch-btn {
                display: none;
                position: absolute;
                bottom: 24px;
                right: 20px;
                z-index: 60;
                background: rgba(241, 196, 15, 0.95);
                color: #111;
                border: 2.5px solid #f39c12;
                border-radius: 50px;
                padding: 0.75rem 1.4rem;
                font-family: 'Orbitron', monospace;
                font-size: 0.85rem;
                font-weight: 900;
                letter-spacing: 1.2px;
                cursor: pointer;
                box-shadow: 0 0 22px rgba(241, 196, 15, 0.75), 0 4px 14px rgba(0,0,0,0.85);
                touch-action: manipulation;
                align-items: center;
                gap: 0.55rem;
                transition: all 0.2s ease;
                user-select: none;
                -webkit-user-select: none;
            }
            .dilopho-floating-torch-btn.off {
                background: rgba(10, 26, 16, 0.94);
                color: #2ecc71;
                border-color: #2ecc71;
                box-shadow: 0 0 16px rgba(46, 204, 113, 0.5);
            }
            .dilopho-floating-torch-btn.danger-pulse {
                animation: dilopho-torch-alert 0.32s infinite alternate;
            }
            .dilopho-floating-torch-btn.prowling-locked {
                background: rgba(24, 12, 2, 0.94);
                color: #f39c12;
                border-color: #f39c12;
                box-shadow: 0 0 16px rgba(243, 156, 18, 0.5);
                opacity: 0.9;
            }

            /* Botones estándar de cabecera (.ej-btn-header) */
            .ej-header-actions {
                display: flex; align-items: center; gap: 0.5rem;
                flex-shrink: 0;
            }
            .ej-btn-header {
                display: inline-flex; align-items: center; gap: 0.35rem;
                background: rgba(4, 28, 14, 0.88);
                color: #2ecc71; border: 1.5px solid #2ecc71;
                border-radius: 4px; padding: 0.45rem 0.85rem;
                font-family: 'Orbitron', monospace; font-size: 0.78rem; font-weight: 700;
                cursor: pointer; letter-spacing: 1px;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .ej-btn-header:hover {
                background: #2ecc71; color: #020b06;
                box-shadow: 0 0 14px rgba(46, 204, 113, 0.6);
            }
            .ej-btn-header-danger {
                background: rgba(30, 6, 6, 0.88);
                color: #ff4757; border-color: #ff4757;
            }
            .ej-btn-header-danger:hover {
                background: #ff4757; color: #fff;
                box-shadow: 0 0 14px rgba(255, 71, 87, 0.7);
            }

            /* Canvas wrap */
            #dilopho-canvas-wrap {
                flex: 1;
                position: relative;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                background: #020403;
                touch-action: none;
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
                display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
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

            /* --- PANTALLAS MODALES (Inicio, Derrota, Victoria, Pausa) --- */
            .dilopho-screen {
                position: absolute; inset: 0; z-index: 100;
                display: none; flex-direction: column;
                align-items: center; justify-content: flex-start;
                text-align: center;
                background: rgba(2, 6, 4, .92);
                backdrop-filter: blur(8px);
                font-family: 'Share Tech Mono',monospace;
                padding: 1.2rem;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                box-sizing: border-box;
            }
            .dilopho-screen.show { display: flex; animation: dilopho-pop .3s ease-out; }
            @keyframes dilopho-pop {
                from { opacity: 0; transform: scale(.96); }
                to   { opacity: 1; transform: scale(1); }
            }
            .dilopho-screen-card {
                margin: auto;
                max-width: 760px;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .dilopho-screen-title {
                font-family:'Orbitron',monospace;
                font-size: clamp(1.3rem, 3.8vw, 2.2rem);
                font-weight: 900; letter-spacing: 3px; text-transform: uppercase;
                margin-bottom: .5rem;
            }
            .dilopho-screen-sub {
                font-size: clamp(.75rem, 1.8vw, .95rem); color: #ccc;
                margin-bottom: 1.2rem; max-width: 620px; line-height: 1.55;
            }

            /* Banner de Pantalla Completa en el Inicio */
            .dilopho-mobile-fs-banner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.9rem;
                background: linear-gradient(135deg, rgba(6, 44, 23, 0.94) 0%, rgba(2, 24, 12, 0.98) 100%);
                border: 1.5px solid #2ecc71;
                border-radius: 8px;
                padding: 0.75rem 1.15rem;
                margin: 0.5rem auto 1rem;
                max-width: 650px;
                width: 96%;
                box-shadow: 0 0 20px rgba(46, 204, 113, 0.3);
            }
            .dilopho-fs-banner-info {
                display: flex;
                align-items: center;
                gap: 0.8rem;
                text-align: left;
            }
            .dilopho-fs-icon {
                font-size: 1.7rem;
                line-height: 1;
                filter: drop-shadow(0 0 8px rgba(46, 204, 113, 0.7));
            }
            .dilopho-fs-text strong {
                display: block;
                color: #2ecc71;
                font-family: 'Orbitron', monospace;
                font-size: 0.82rem;
                letter-spacing: 1px;
            }
            .dilopho-fs-text span {
                display: block;
                color: #bbf7d0;
                font-size: 0.73rem;
                line-height: 1.35;
            }
            .dilopho-btn-fs-toggle {
                background: rgba(46, 204, 113, 0.22);
                border: 1.5px solid #2ecc71;
                color: #2ecc71;
                font-family: 'Orbitron', monospace;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 0.5rem 0.95rem;
                border-radius: 5px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
            }
            .dilopho-btn-fs-toggle:hover {
                background: #2ecc71;
                color: #031408;
                box-shadow: 0 0 16px rgba(46, 204, 113, 0.7);
            }

            .dilopho-instruct {
                display: flex; gap: 1rem; margin: .5rem 0 1.3rem;
                flex-wrap: wrap; justify-content: center;
                font-size: .78rem; color: #ddd;
            }
            .dilopho-inst-item {
                display:flex; flex-direction:column; align-items:center; gap:.3rem;
                background:rgba(255,255,255,.05); border:1px solid rgba(46,204,113,.25);
                border-radius:6px; padding:.65rem .85rem; min-width:125px;
                font-size: .73rem;
            }
            .dilopho-inst-icon { font-size: 1.5rem; }

            /* Acciones Inicio */
            .dilopho-start-actions {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
                margin-top: 0.5rem;
            }
            .dilopho-btn {
                font-family:'Orbitron',monospace; font-size:.85rem; font-weight:700;
                letter-spacing:1.5px; text-transform:uppercase;
                padding:.75rem 1.8rem; border-radius:5px; cursor:pointer;
                transition:all .2s; border:none; margin:.25rem;
                display: inline-flex; align-items: center; gap: 0.5rem;
            }
            .dilopho-btn-primary {
                background:#2ecc71; color:#031408;
                box-shadow:0 0 16px rgba(46,204,113,.5);
            }
            .dilopho-btn-primary:hover {
                background:#a8ff3e; box-shadow:0 0 30px rgba(168,255,62,.75);
                transform:translateY(-2px);
            }
            .dilopho-btn-fullscreen {
                background: linear-gradient(135deg, #00f5ff 0%, #0984e3 100%);
                color: #011422;
                border: 2px solid #00f5ff;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.45);
                font-weight: 900;
            }
            .dilopho-btn-fullscreen:hover {
                background: #00f5ff;
                color: #000;
                box-shadow: 0 0 32px rgba(0, 245, 255, 0.85);
                transform: translateY(-2px);
            }

            /* --- OVERLAY DE PAUSA --- */
            .ej-pause-overlay {
                position: absolute; inset: 0; z-index: 70;
                background: rgba(1, 10, 5, 0.92);
                backdrop-filter: blur(10px);
                display: flex; align-items: center; justify-content: center;
                animation: dilopho-pop 0.25s ease-out;
            }
            .ej-pause-card {
                background: rgba(3, 20, 10, 0.95);
                border: 2px solid #2ecc71;
                border-radius: 10px;
                padding: 2.2rem 3rem;
                text-align: center;
                box-shadow: 0 0 35px rgba(46, 204, 113, 0.4);
                max-width: 440px; width: 90%;
            }
            .ej-pause-title {
                font-family: 'Orbitron', monospace;
                font-size: 1.6rem; font-weight: 900;
                color: #2ecc71; letter-spacing: 2px;
                margin-bottom: 0.6rem;
            }
            .ej-pause-sub {
                font-family: 'Share Tech Mono', monospace;
                font-size: 0.85rem; color: #a8ff3e;
                margin-bottom: 1.6rem; letter-spacing: 1px;
            }
            .ej-btn-resume {
                background: #2ecc71; color: #020b06;
                border: none; border-radius: 5px;
                font-family: 'Orbitron', monospace; font-size: 0.95rem; font-weight: 900;
                padding: 0.8rem 2.2rem; cursor: pointer; letter-spacing: 1.5px;
                box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
                transition: all 0.2s ease;
            }
            .ej-btn-resume:hover {
                background: #a8ff3e; transform: translateY(-2px);
                box-shadow: 0 0 30px rgba(168, 255, 62, 0.8);
            }


            /* --- OPTIMIZACIÓN CELULAR HORIZONTAL (LANDSCAPE) --- */
            @media (max-height: 520px) {
                #dilopho-torch-btn { display: none !important; }
                #dilopho-header-tracker { display: none !important; }
                #dilopho-header { padding: 0.25rem 0.8rem; gap: 0.4rem; }
                #dilopho-header-title { font-size: 0.75rem; max-width: 40vw; }
                #dilopho-header-timer { font-size: 0.8rem; padding: 0.15rem 0.45rem; }
                .ej-header-actions .ej-btn-lbl { display: none !important; }
                .ej-header-actions .ej-btn-header { padding: 0.28rem 0.5rem; font-size: 0.75rem; }
                #dilopho-status-bar { padding: 0.25rem 0.8rem; font-size: 0.68rem; gap: 0.3rem; }
                .dilopho-item-slot { padding: 0.15rem 0.4rem; font-size: 0.65rem; }
                .dilopho-floating-torch-btn {
                    bottom: 12px;
                    right: 14px;
                    padding: 0.45rem 1rem;
                    font-size: 0.76rem;
                }
                .dilopho-screen { padding: 0.5rem 1rem; }
                .dilopho-screen-title { font-size: 1.15rem; margin-bottom: 0.2rem; }
                .dilopho-screen-sub { font-size: 0.72rem; margin-bottom: 0.4rem; line-height: 1.35; }
                .dilopho-mobile-fs-banner { padding: 0.35rem 0.75rem; margin: 0.25rem auto 0.45rem; }
                .dilopho-fs-icon { font-size: 1.2rem; }
                .dilopho-fs-text strong { font-size: 0.75rem; }
                .dilopho-fs-text span { font-size: 0.66rem; }
                .dilopho-btn-fs-toggle { font-size: 0.7rem; padding: 0.35rem 0.7rem; }
                .dilopho-instruct { display: none !important; }
                .dilopho-start-actions { margin-top: 0.3rem; }
                .dilopho-btn { padding: 0.48rem 1.2rem; font-size: 0.78rem; }
            }

            /* --- RESPONSIVE MÓVIL --- */
            @media (max-width: 900px), (hover: none) and (pointer: coarse) {
                .dilopho-floating-torch-btn {
                    display: inline-flex;
                }
            }

            @media (max-width: 720px) {
                #dilopho-header {
                    padding: .4rem .6rem;
                    gap: .4rem;
                }
                #dilopho-header-left {
                    gap: .4rem;
                }
                #dilopho-header-title {
                    font-size: .72rem;
                    max-width: 34vw;
                }
                #dilopho-header-timer {
                    font-size: .8rem;
                    padding: .2rem .45rem;
                }
                #dilopho-header-tracker {
                    display: none;
                }
                #dilopho-torch-btn {
                    display: none;
                }
                .ej-header-actions {
                    gap: 4px;
                }
                .ej-btn-header {
                    padding: 0.35rem 0.5rem;
                    font-size: 0.72rem;
                }
                .ej-btn-header .ej-btn-lbl {
                    display: none;
                }
                #dilopho-status-bar {
                    font-size: .68rem;
                    padding: .35rem .6rem;
                    gap: .4rem;
                }
                #dilopho-status-bar > div:first-child {
                    font-size: .65rem;
                }
                #dilopho-items-wrap {
                    gap: .3rem;
                }
                .dilopho-item-slot {
                    font-size: .65rem;
                    padding: .22rem .4rem;
                }
                .dilopho-mobile-fs-banner {
                    flex-direction: column;
                    text-align: center;
                    padding: .65rem .75rem;
                    gap: .55rem;
                }
                .dilopho-fs-banner-info {
                    flex-direction: column;
                    text-align: center;
                    gap: .35rem;
                }
                .dilopho-fs-text strong {
                    font-size: .78rem;
                }
                .dilopho-fs-text span {
                    font-size: .68rem;
                }
                .dilopho-btn-fs-toggle {
                    width: 100%;
                    justify-content: center;
                }
                .dilopho-instruct {
                    gap: .5rem;
                    margin: .4rem 0 .9rem;
                }
                .dilopho-inst-item {
                    width: 44%;
                    min-width: 110px;
                    padding: .45rem .5rem;
                    font-size: .68rem;
                }
                .dilopho-inst-icon {
                    font-size: 1.25rem;
                }
                .dilopho-start-actions {
                    flex-direction: column;
                    width: 100%;
                }
                .dilopho-start-actions .dilopho-btn {
                    width: 100%;
                    justify-content: center;
                    box-sizing: border-box;
                }
                .dilopho-floating-torch-btn {
                    bottom: 16px;
                    right: 14px;
                    padding: 0.65rem 1.1rem;
                    font-size: 0.76rem;
                }
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
                <button id="dilopho-torch-btn">🔦 APAGAR LINTERNA (ESPACIO)</button>
                <div class="ej-header-actions">
                    <button id="dilopho-mute-btn" class="ej-btn-header" title="Silenciar / Activar Sonido"><span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span></button>
                    <button id="dilopho-pause-btn" class="ej-btn-header" title="Pausar / Reanudar"><span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span></button>
                    <button id="dilopho-fullscreen-btn" class="ej-btn-header" title="Pantalla Completa"><span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span></button>
                    <button id="dilopho-close-btn" class="ej-btn-header ej-btn-header-danger" title="Cerrar"><span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span></button>
                </div>
            </div>

            <div id="dilopho-canvas-wrap">
                <canvas id="dilopho-canvas"></canvas>

                <div id="dilopho-alert-banner"></div>

                <!-- Botón táctil flotante de linterna para celulares -->
                <button id="dilopho-mobile-torch" class="dilopho-floating-torch-btn">
                    <span class="dilopho-torch-ico">🔦</span>
                    <span class="dilopho-torch-txt">APAGAR LINTERNA</span>
                </button>

                <!-- Pantalla inicio -->
                <div class="dilopho-screen show" id="dilopho-start-screen">
                    <div class="dilopho-screen-card">
                        <div class="dilopho-screen-title" style="color:#2ecc71;">🏥 ACOSO EN LA CLÍNICA</div>
                        <div class="dilopho-screen-sub">
                            Samuel se encuentra dentro de la clínica abandonada de Nublar. Explora con tu linterna para encontrar los 5 suministros clasificados en 2 minutos, pero apaga la luz inmediatamente cuando escuches la advertencia del Dilophosaurus acechando.
                        </div>

                        <!-- Acciones Principales y Pantalla Completa Visibles de Inmediato -->
                        <div class="dilopho-start-actions">
                            <button class="dilopho-btn dilopho-btn-fullscreen" id="dilopho-start-fullscreen-btn">
                                <span style="font-size:1.15rem;">⛶</span> JUGAR EN PANTALLA COMPLETA
                            </button>
                            <button class="dilopho-btn dilopho-btn-primary" id="dilopho-start-btn">
                                <span>▶</span> COMENZAR BÚSQUEDA
                            </button>
                        </div>

                        <!-- Opción destacada de Pantalla Completa -->
                        <div class="dilopho-mobile-fs-banner">
                            <div class="dilopho-fs-banner-info">
                                <span class="dilopho-fs-icon">📱⛶</span>
                                <div class="dilopho-fs-text">
                                    <strong>MODO PANTALLA COMPLETA RECOMENDADO</strong>
                                    <span>Para celulares: mayor precisión al iluminar con el dedo y sin barras molestas.</span>
                                </div>
                            </div>
                            <button type="button" class="dilopho-btn-fs-toggle" id="dilopho-start-fs-toggle-btn">
                                <span class="ej-ic">⛶</span> ACTIVAR
                            </button>
                        </div>

                        <div class="dilopho-instruct">
                            <div class="dilopho-inst-item">
                                <div class="dilopho-inst-icon">🔦</div>
                                <div>Arrastra dedo/mouse<br><strong>ILUMINA Y BUSCA</strong></div>
                            </div>
                            <div class="dilopho-inst-item">
                                <div class="dilopho-inst-icon">👂</div>
                                <div>Audio Alerta =<br><strong>¡APAGA LINTERNA!</strong></div>
                            </div>
                            <div class="dilopho-inst-item">
                                <div class="dilopho-inst-icon">⏳</div>
                                <div>Espera a que<br><strong>SE MARCHE (0s)</strong></div>
                            </div>
                            <div class="dilopho-inst-item">
                                <div class="dilopho-inst-icon">🎒</div>
                                <div>Toca para rescatar<br><strong>5 SUMINISTROS</strong></div>
                            </div>
                        </div>

                        <div style="font-size:0.7rem;color:#888;margin-top:0.4rem;letter-spacing:0.5px;">
                            💡 En celular, puedes girar la pantalla a horizontal para mayor visión panorámica.
                        </div>
                    </div>
                </div>

                <!-- Pantalla derrota (Dilophosaurus ataca) -->
                <div class="dilopho-screen" id="dilopho-lose-attack-screen">
                    <div class="dilopho-screen-card">
                        <div class="dilopho-screen-title" style="color:#e74c3c;">💀 ¡EL DILOPHOSAURUS TE CEGÓ Y DEVORÓ!</div>
                        <div class="dilopho-screen-sub">
                            No apagaste la linterna a tiempo o encendiste la luz mientras el dinosaurio aún estaba en la sala.<br>
                            Su veneno corrosivo impactó directamente en tus ojos.
                        </div>
                        <div class="ej-modal-actions">
                            <button class="ej-btn-replay" id="dilopho-retry-btn">↺ Volver a jugar</button>
                            <button class="ej-btn-return" id="dilopho-lose-close">✕ Regresar al sitio</button>
                        </div>
                    </div>
                </div>

                <!-- Pantalla derrota (Tiempo agotado) -->
                <div class="dilopho-screen" id="dilopho-lose-time-screen">
                    <div class="dilopho-screen-card">
                        <div class="dilopho-screen-title" style="color:#e67e22;">⏳ ¡TIEMPO AGOTADO!</div>
                        <div class="dilopho-screen-sub">
                            Pasaron los 2 minutos sin recuperar todos los suministros.<br>
                            Los sistemas de seguridad se bloquearon por completo y la clínica quedó sellada.
                        </div>
                        <div class="ej-modal-actions">
                            <button class="ej-btn-replay" id="dilopho-retry-time-btn">↺ Volver a jugar</button>
                            <button class="ej-btn-return" id="dilopho-lose-time-close">✕ Regresar al sitio</button>
                        </div>
                    </div>
                </div>

                <!-- Pantalla victoria -->
                <div class="dilopho-screen" id="dilopho-win-screen">
                    <div class="dilopho-screen-card">
                        <div class="dilopho-screen-title" style="color:#2ecc71;">🏆 ¡ESCAPASTE DE LA CLÍNICA!</div>
                        <div class="dilopho-screen-sub">
                            ¡Has recuperado los 5 objetos clasificados burlando al Dilophosaurus en la oscuridad total!<br>
                            El laboratorio de la Dra. Sorkin y los embriones Barbasol están asegurados.
                        </div>
                        <div class="ej-modal-actions">
                            <button class="ej-btn-replay" id="dilopho-win-replay">↺ Volver a jugar</button>
                            <button class="ej-btn-return" id="dilopho-win-close">✕ Regresar al sitio</button>
                        </div>
                    </div>
                </div>
            
                <!-- Overlay de Pausa -->
                <div class="ej-pause-overlay" id="dilopho-pause-screen" style="display:none;">
                    <div class="ej-pause-card">
                        <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>
                        <div class="ej-pause-sub">Exploración de la clínica en pausa</div>
                        <button class="ej-btn-resume" id="dilopho-btn-resume">▶ REANUDAR</button>
                    </div>
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
        var mobBtn = document.getElementById('dilopho-mobile-torch');

        // Botón de cabecera
        if (btn) {
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

        // Botón táctil flotante en celular
        if (mobBtn) {
            if (state !== 'searching' && state !== 'warning' && state !== 'prowling') {
                mobBtn.style.display = 'none';
                return;
            } else {
                mobBtn.style.display = '';
            }
            mobBtn.className = 'dilopho-floating-torch-btn';
            if (flashlightOn) {
                mobBtn.innerHTML = '<span class="dilopho-torch-ico">🔦</span><span class="dilopho-torch-txt">APAGAR LINTERNA</span>';
            } else {
                mobBtn.classList.add('off');
                mobBtn.innerHTML = '<span class="dilopho-torch-ico">💡</span><span class="dilopho-torch-txt">ENCENDER LINTERNA</span>';
            }

            if (state === 'warning') {
                if (flashlightOn) {
                    mobBtn.classList.add('danger-pulse');
                    mobBtn.innerHTML = '<span class="dilopho-torch-ico">🚨</span><span class="dilopho-torch-txt">¡APAGA LA LINTERNA!</span>';
                }
            } else if (state === 'prowling') {
                mobBtn.classList.add('prowling-locked');
                mobBtn.innerHTML = '<span class="dilopho-torch-ico">👁️</span><span class="dilopho-torch-txt">ACECHANDO... NO ENCENDER</span>';
            }
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

        // La interacción funciona dentro del cono/radio de luz de la linterna
        var distToTorch = Math.hypot(lx - mouseX, ly - mouseY);
        if (distToTorch > FLASHLIGHT_RADIUS) return;

        var isMobile = (window.innerWidth <= 800) || ('ontouchstart' in window);
        var hitPadding = isMobile ? 18 : 12;

        // 1. Comprobar si golpeó un objetivo legítimo
        for (var i = 0; i < TARGET_ITEMS.length; i++) {
            var item = TARGET_ITEMS[i];
            if (item.collected) continue;

            var img = imgs[item.id];
            var aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 1;
            var itemW = item.h * aspect;
            var halfW = Math.max(22, (itemW / 2) + hitPadding);
            var halfH = Math.max(22, (item.h / 2) + hitPadding);

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

    function togglePause() {
        if (state !== 'searching' && state !== 'warning' && state !== 'prowling') return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('dilopho-pause-btn');
        var pauseScreen = document.getElementById('dilopho-pause-screen');
        if (isPaused) {
            if (sndTension) try { sndTension.pause(); } catch(e){}
            if (sndAdvertencia) try { sndAdvertencia.pause(); } catch(e){}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndTension && !isMuted) try { sndTension.play().catch(function(){}); } catch(e){}
            lastTime = performance.now();
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '⏸️';
                if (lbl) lbl.textContent = ' PAUSA';
            }
            if (pauseScreen) pauseScreen.style.display = 'none';
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        var btnMute = document.getElementById('dilopho-mute-btn');
        if (isMuted) {
            stopAllAudio();
            if (btnMute) {
                var ic = btnMute.querySelector('.ej-ic');
                var lbl = btnMute.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '🔇';
                if (lbl) lbl.textContent = ' MUTE';
            }
        } else {
            if (btnMute) {
                var ic = btnMute.querySelector('.ej-ic');
                var lbl = btnMute.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '🔊';
                if (lbl) lbl.textContent = ' SONIDO';
            }
            if ((state === 'searching' || state === 'warning' || state === 'prowling') && !isPaused) {
                playAudio(sndTension);
            }
        }
    }

    function updateFullscreenButtons(isFs) {
        var fullBtn = document.getElementById('dilopho-fullscreen-btn');
        var startFsToggle = document.getElementById('dilopho-start-fs-toggle-btn');
        var startFsPrimary = document.getElementById('dilopho-start-fullscreen-btn');

        if (fullBtn) {
            fullBtn.innerHTML = isFs 
                ? '<span class="ej-ic">🗗</span><span class="ej-btn-lbl"> SALIR</span>' 
                : '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        }
        if (startFsToggle) {
            startFsToggle.innerHTML = isFs 
                ? '<span class="ej-ic">🗗</span> SALIR DE PANTALLA COMPLETA' 
                : '<span class="ej-ic">⛶</span> ACTIVAR PANTALLA COMPLETA';
        }
        if (startFsPrimary) {
            startFsPrimary.innerHTML = isFs 
                ? '<span style="font-size:1.15rem;">▶</span> JUGAR AHORA (PANTALLA COMPLETA)' 
                : '<span style="font-size:1.15rem;">⛶</span> JUGAR EN PANTALLA COMPLETA';
        }
    }

    function toggleFullscreen() {
        var target = document.getElementById('dilopho-overlay') || document.documentElement;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

        if (!isFs) {
            var p = null;
            if (target.requestFullscreen) {
                p = target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) {
                p = target.webkitRequestFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                p = document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                p = document.documentElement.webkitRequestFullscreen();
            }
            if (p && p.catch) p.catch(function () {});
            updateFullscreenButtons(true);
        } else {
            var ep = null;
            if (document.exitFullscreen) {
                ep = document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                ep = document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                ep = document.mozCancelFullScreen();
            }
            if (ep && ep.catch) ep.catch(function () {});
            updateFullscreenButtons(false);
        }
    }
    function gameLoop(now) {
        if (isPaused) {
            lastTime = now;
            if (state === 'searching' || state === 'warning' || state === 'prowling') {
                aniFrame = requestAnimationFrame(gameLoop);
            }
            return;
        }
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
                    state = 'searching'; isPaused = false;
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
        state = 'searching'; isPaused = false;
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
        var ov = document.getElementById('dilopho-overlay');
        if (ov) ov.classList.remove('open');
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFs) {
            try {
                if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            } catch(e) {}
        }
    }

    // ============================================================
    //  ENLACE DE EVENTOS
    // ============================================================
    function bindEvents() {
        var ov = document.getElementById('dilopho-overlay');
        var fab = document.getElementById('dilopho-fab');
        var closeBtn = document.getElementById('dilopho-close-btn');
        var torchBtn = document.getElementById('dilopho-torch-btn');
        var mobileTorchBtn = document.getElementById('dilopho-mobile-torch');
        var startBtn = document.getElementById('dilopho-start-btn');
        var startFsPrimary = document.getElementById('dilopho-start-fullscreen-btn');
        var startFsToggle = document.getElementById('dilopho-start-fs-toggle-btn');
        var muteBtn = document.getElementById('dilopho-mute-btn');
        var pauseBtn = document.getElementById('dilopho-pause-btn');
        var resumeBtn = document.getElementById('dilopho-btn-resume');
        var fullBtn = document.getElementById('dilopho-fullscreen-btn');

        var retryBtn = document.getElementById('dilopho-retry-btn');
        var retryTimeBtn = document.getElementById('dilopho-retry-time-btn');
        var loseClose = document.getElementById('dilopho-lose-close');
        var loseTimeClose = document.getElementById('dilopho-lose-time-close');
        var winReplay = document.getElementById('dilopho-win-replay');
        var winClose = document.getElementById('dilopho-win-close');

        function openGame() {
            ov.classList.add('open');
            setTimeout(resizeCanvas, 60);
            hideScreens();
            var mobTorch = document.getElementById('dilopho-mobile-torch');
            if (mobTorch) mobTorch.style.display = 'none';
            document.getElementById('dilopho-start-screen').classList.add('show');
            state = 'idle';
            var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            updateFullscreenButtons(isFs);
        }
        window.openDilophoGame = openGame;
        if (fab) fab.addEventListener('click', openGame);

        if (closeBtn) closeBtn.addEventListener('click', closeGame);

        // Pantalla completa
        if (fullBtn) fullBtn.addEventListener('click', toggleFullscreen);
        if (startFsToggle) startFsToggle.addEventListener('click', toggleFullscreen);
        if (startFsPrimary) {
            startFsPrimary.addEventListener('click', function () {
                if (window.registerMinigameAttempt) window.registerMinigameAttempt('dilopho');
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    var target = document.getElementById('dilopho-overlay') || document.documentElement;
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){});
                }
                startGame();
            });
        }

        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'].forEach(function(evt) {
            document.addEventListener(evt, function() {
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
                updateFullscreenButtons(isFs);
                setTimeout(resizeCanvas, 150);
            });
        });

        // Controles de audio y pausa
        if (muteBtn) muteBtn.addEventListener('click', toggleMute);
        if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
        if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

        // Cierre y reintentos en modales de fin de partida
        if (loseClose) loseClose.addEventListener('click', closeGame);
        if (loseTimeClose) loseTimeClose.addEventListener('click', closeGame);
        if (winClose) winClose.addEventListener('click', closeGame);

        if (startBtn) startBtn.addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('dilopho');
            startGame();
        });
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

        // Botones linterna
        if (torchBtn) torchBtn.addEventListener('click', toggleFlashlight);
        if (mobileTorchBtn) mobileTorchBtn.addEventListener('click', toggleFlashlight);

        // Teclas rápidas
        window.addEventListener('keydown', function (e) {
            if (!ov.classList.contains('open')) return;
            if (e.code === 'Space' || e.key === ' ' || e.code === 'KeyF' || e.key === 'f') {
                e.preventDefault();
                toggleFlashlight();
            } else if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                togglePause();
            } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                toggleMute();
            } else if (e.key === 'Escape') {
                if (isPaused) {
                    togglePause();
                } else {
                    closeGame();
                }
            }
        });

        // Seguimiento del mouse para linterna en PC
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

        // Soporte táctil optimizado para celulares: arrastrar ilumina, toque rápido selecciona
        var touchStartX = 0, touchStartY = 0, touchStartTime = 0;
        var touchMoved = false;

        function updateTouchPos(touch) {
            var rect = canvas.getBoundingClientRect();
            mouseX = (touch.clientX - rect.left) / scale;
            mouseY = (touch.clientY - rect.top) / scale;
            isMouseInside = true;
        }

        canvas.addEventListener('touchstart', function (e) {
            if (e.touches && e.touches[0]) {
                var t = e.touches[0];
                touchStartX = t.clientX;
                touchStartY = t.clientY;
                touchStartTime = Date.now();
                touchMoved = false;
                updateTouchPos(t);
            }
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            if (e.touches && e.touches[0]) {
                var t = e.touches[0];
                var dx = t.clientX - touchStartX;
                var dy = t.clientY - touchStartY;
                if (Math.hypot(dx, dy) > 8) {
                    touchMoved = true;
                }
                updateTouchPos(t);
            }
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', function (e) {
            var duration = Date.now() - touchStartTime;
            if (!touchMoved && duration < 500) {
                // Toque intencional (tap): interactuar o recoger objeto
                onCanvasClick(touchStartX, touchStartY);
            }
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

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
