// ============================================================
//  EXPEDIENTES JURÁSICOS — SOBREVIVIR EN LA ISLA
//  MINIJUEGO: ¡BUSCANDO AL CARNOTAURUS!
//  Desafío de rastreo nocturno con linterna táctica en 7 sectores
// ============================================================

(function () {
    'use strict';

    // Dimensiones virtuales del juego
    var LW = 1200, LH = 670;

    // Configuración de los 7 niveles / escenarios
    var LEVELS = [
        {
            num: 1,
            name: 'SECTOR 01: PERÍMETRO NORTE',
            bg: 'Busca 1.jpg',
            time: 20,
            x: 774, y: 314, w: 322, h: 181
        },
        {
            num: 2,
            name: 'SECTOR 02: LADERA ROCOSA',
            bg: 'Busca 2.jpg',
            time: 18,
            x: 199, y: 257, w: 287, h: 161
        },
        {
            num: 3,
            name: 'SECTOR 03: ESPESURA CENTRAL',
            bg: 'Busca 3.jpg',
            time: 16,
            x: 704, y: 240, w: 252, h: 141
        },
        {
            num: 4,
            name: 'SECTOR 04: ACANTILADO OSCURO',
            bg: 'Busca 4.jpg',
            time: 14,
            x: 129, y: 173, w: 217, h: 122
        },
        {
            num: 5,
            name: 'SECTOR 05: CLARO DE SOMBRAS',
            bg: 'Busca 5.jpg',
            time: 12,
            x: 493, y: 205, w: 189, h: 106
        },
        {
            num: 6,
            name: 'SECTOR 06: BARRANCO DE LA SELVA',
            bg: 'Busca 6.jpg',
            time: 10,
            x: 867, y: 297, w: 165, h: 92
        },
        {
            num: 7,
            name: 'SECTOR 07: NIDO DEL CAMALEÓN (FINAL)',
            bg: 'Busca 7.jpg',
            time: 8,
            x: 590, y: 269, w: 137, h: 77
        }
    ];

    // Estado del juego
    var state = 'idle'; // idle | playing | found | jumpscare | won | lost
    var currentLevelIdx = 0;
    var timeLeft = 20;
    var timerInterval = null;
    var isMuted = false;
    var isPaused = false;
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;
    var aniFrame = null;

    // Posición de la linterna (coordenadas virtuales 1200x670)
    var torch = { x: 600, y: 335, radius: 155, active: true };
    var shakeTimer = 0, shakeAmount = 0;

    // Flash y efectos de disparo
    var muzzleFlash = 0;
    var hitEffect = { x: 0, y: 0, life: 0 };

    // Multimedia
    var imgs = {
        bg: [],
        camo: new Image(),
        find: new Image(),
        attack: new Image()
    };
    var sndSearch = null;
    var sndFind   = null;
    var sndAttack = null;

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('carno-search-styles')) return;
        var style = document.createElement('style');
        style.id = 'carno-search-styles';
        style.textContent = [
            '.ej-btn-header { background: rgba(0, 20, 20, 0.85) !important; border: 1.5px solid #00f5ff !important; color: #00f5ff !important; font-family: "Share Tech Mono", monospace !important; font-size: 0.75rem !important; font-weight: 700 !important; padding: 0.35rem 0.75rem !important; border-radius: 4px !important; cursor: pointer !important; letter-spacing: 1px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 5px !important; text-transform: uppercase !important; transition: all 0.2s ease !important; height: 32px !important; box-sizing: border-box !important; touch-action: manipulation !important; }',
            '.ej-btn-header:hover { background: rgba(0, 245, 255, 0.25) !important; color: #fff !important; }',
            '.ej-btn-header-danger { background: rgba(255, 71, 87, 0.12) !important; border-color: #ff4757 !important; color: #ff4757 !important; }',
            '.ej-btn-header-danger:hover { background: #ff4757 !important; color: #fff !important; }',
            '#carno-search-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: rgba(1, 4, 3, 0.98); backdrop-filter: blur(8px);',
            '    display: none; flex-direction: column;',
            '    font-family: "Share Tech Mono", monospace; color: #fff;',
            '    user-select: none;',
            '}',
            '#carno-search-overlay.open { display: flex; animation: cs-fade-in 0.25s ease-out; }',
            '@keyframes cs-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '',
            '/* Header de control */',
            '#cs-header {',
            '    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;',
            '    padding: 0 0.8rem; height: 40px; min-height: 40px; max-height: 40px;',
            '    background: rgba(5, 14, 10, 0.95); border-bottom: 2px solid rgba(243, 156, 18, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.8); z-index: 10;',
            '    gap: 0.5rem; flex-wrap: nowrap; overflow: hidden; white-space: nowrap;',
            '}',
            '#cs-header-left { display: flex; align-items: center; gap: 0.6rem; flex-wrap: nowrap; overflow: hidden; }',
            '#cs-header-right { display: flex; align-items: center; gap: 0.35rem; flex-wrap: nowrap; flex-shrink: 0; }',
            '#cs-header-title {',
            '    font-family: "Orbitron", monospace; font-size: 1rem; font-weight: 900;',
            '    color: #f39c12; letter-spacing: 1.5px; text-transform: uppercase;',
            '}',
            '#cs-level-pill {',
            '    background: rgba(243, 156, 18, 0.15); border: 1px solid rgba(243, 156, 18, 0.4);',
            '    padding: 0.25rem 0.7rem; border-radius: 3px; font-size: 0.8rem;',
            '    color: #f1c40f; letter-spacing: 1px;',
            '}',
            '#cs-timer-box {',
            '    font-family: "Orbitron", monospace; font-size: 1.15rem; font-weight: 900;',
            '    color: #2ecc71; letter-spacing: 2px; padding: 0.2rem 0.6rem;',
            '    background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(46, 204, 113, 0.3);',
            '    border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;',
            '}',
            '#cs-timer-box.urgent { color: #ff4757; border-color: #ff4757; animation: cs-pulse-timer 0.6s infinite alternate; }',
            '@keyframes cs-pulse-timer { from { transform: scale(1); } to { transform: scale(1.06); text-shadow: 0 0 14px #ff4757; } }',
            '',
            '#cs-header-right { display: flex; align-items: center; gap: 8px; }',
            '.cs-btn-header {',
            '    background: rgba(0, 229, 176, 0.15); border: 1px solid #00e5b0; color: #00e5b0;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.4rem 0.85rem; border-radius: 3px; cursor: pointer;',
            '    letter-spacing: 1px; transition: all 0.2s;',
            '    display: inline-flex; align-items: center; gap: 5px;',
            '}',
            '.cs-btn-header:hover { background: #00e5b0; color: #020b06; }',
            '#cs-close-btn {',
            '    background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ff6b6b;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.4rem 0.95rem; border-radius: 3px; cursor: pointer; transition: all 0.2s;',
            '}',
            '#cs-close-btn:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* Canvas wrap y stage */',
            '#cs-canvas-wrap {',
            '    flex: 1; position: relative; display: flex; align-items: center;',
            '    justify-content: center; overflow: hidden; background: #000; cursor: crosshair;',
            '}',
            '#cs-canvas-stage { position: relative; overflow: hidden; box-shadow: 0 0 40px rgba(0,0,0,0.9); }',
            '#cs-canvas { display: block; touch-action: none; }',
            '',
            '/* Status bar inferior */',
            '#cs-status-bar {',
            '    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;',
            '    padding: 0.45rem 1.4rem; background: rgba(5, 12, 8, 0.95);',
            '    border-top: 1px solid rgba(243, 156, 18, 0.35); font-size: 0.8rem; color: #aaa;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#cs-status-hint { color: #f1c40f; }',
            '',
            '/* Pantallas modales */',
            '.cs-screen {',
            '    position: absolute; inset: 0; z-index: 30; display: none;',
            '    flex-direction: column; align-items: center; justify-content: center;',
            '    text-align: center; background: rgba(2, 6, 4, 0.92); backdrop-filter: blur(8px);',
            '    padding: 1.5rem; box-sizing: border-box;',
            '}',
            '.cs-screen.show { display: flex; animation: cs-fade-in 0.2s ease-out; }',
            '.cs-screen-title { font-family: "Orbitron", monospace; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.8rem; }',
            '.cs-screen-sub { font-size: 0.92rem; line-height: 1.6; max-width: 640px; color: #ddd; margin-bottom: 1.5rem; }',
            '.cs-btn {',
            '    font-family: "Orbitron", monospace; font-size: 0.9rem; font-weight: 700;',
            '    letter-spacing: 1.5px; padding: 0.75rem 2rem; border-radius: 4px;',
            '    cursor: pointer; border: none; transition: all 0.2s; text-transform: uppercase;',
            '}',
            '.cs-btn-primary { background: #f39c12; color: #110c03; box-shadow: 0 0 20px rgba(243, 156, 18, 0.5); }',
            '.cs-btn-primary:hover { background: #f1c40f; box-shadow: 0 0 35px rgba(241, 196, 15, 0.8); transform: translateY(-2px); }',
            '.cs-btn-danger { background: #e74c3c; color: #fff; box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }',
            '.cs-btn-danger:hover { background: #ff4757; box-shadow: 0 0 35px rgba(255, 71, 87, 0.8); transform: translateY(-2px); }',
            '.cs-btn-green { background: #2ecc71; color: #02140a; box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }',
            '.cs-btn-green:hover { background: #55efc4; box-shadow: 0 0 35px rgba(85, 239, 196, 0.8); transform: translateY(-2px); }',
            '',
            '/* Card y banner del modal de inicio */',
            '.cs-modal-card {',
            '    background: linear-gradient(135deg, rgba(26, 16, 5, 0.96), rgba(14, 8, 2, 0.98));',
            '    border: 2px solid rgba(243, 156, 18, 0.55);',
            '    border-radius: 8px;',
            '    padding: 1.6rem 2rem;',
            '    max-width: 620px;',
            '    width: 92%;',
            '    box-shadow: 0 0 45px rgba(243, 156, 18, 0.35);',
            '    margin: auto;',
            '    max-height: 88dvh;',
            '    overflow-y: auto;',
            '    -webkit-overflow-scrolling: touch;',
            '    box-sizing: border-box;',
            '    text-align: center;',
            '}',
            '.cs-modal-sub {',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.86rem;',
            '    color: #ddd;',
            '    line-height: 1.5;',
            '    margin-bottom: 1rem;',
            '}',
            '.cs-rules-box {',
            '    background: rgba(0, 0, 0, 0.65);',
            '    border-left: 3px solid #f39c12;',
            '    padding: 0.65rem 0.9rem;',
            '    text-align: left;',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.76rem;',
            '    color: #eee;',
            '    margin-bottom: 1.1rem;',
            '    line-height: 1.45;',
            '}',
            '.cs-fs-banner {',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: space-between;',
            '    gap: 0.8rem;',
            '    background: rgba(243, 156, 18, 0.12);',
            '    border: 1.5px solid #f39c12;',
            '    border-radius: 6px;',
            '    padding: 0.6rem 0.9rem;',
            '    margin-bottom: 1.2rem;',
            '    box-shadow: 0 0 16px rgba(243, 156, 18, 0.25);',
            '    text-align: left;',
            '    box-sizing: border-box;',
            '    width: 100%;',
            '}',
            '.cs-fs-text {',
            '    display: flex;',
            '    align-items: center;',
            '    gap: 0.5rem;',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.76rem;',
            '    color: #f1c40f;',
            '    line-height: 1.35;',
            '}',
            '.cs-fs-icon { font-size: 1.25rem; flex-shrink: 0; }',
            '.cs-fs-toggle-btn {',
            '    background: #f39c12;',
            '    color: #110c03;',
            '    border: none;',
            '    padding: 0.4rem 0.85rem;',
            '    border-radius: 4px;',
            '    font-family: "Orbitron", monospace;',
            '    font-size: 0.74rem;',
            '    font-weight: 900;',
            '    letter-spacing: 1px;',
            '    cursor: pointer;',
            '    transition: all 0.2s ease;',
            '    white-space: nowrap;',
            '    flex-shrink: 0;',
            '    touch-action: manipulation;',
            '}',
            '.cs-fs-toggle-btn:hover { background: #f1c40f; box-shadow: 0 0 14px rgba(241, 196, 15, 0.8); }',
            '.cs-start-actions {',
            '    display: flex;',
            '    gap: 0.75rem;',
            '    flex-wrap: wrap;',
            '    justify-content: center;',
            '    align-items: center;',
            '    width: 100%;',
            '}',
            '.cs-start-fullscreen-btn {',
            '    background: linear-gradient(135deg, #f39c12, #d35400) !important;',
            '    color: #110c03 !important;',
            '    border: none !important;',
            '    padding: 0.75rem 1.6rem !important;',
            '    border-radius: 4px !important;',
            '    font-family: "Orbitron", monospace !important;',
            '    font-size: 0.85rem !important;',
            '    font-weight: 900 !important;',
            '    letter-spacing: 1.5px !important;',
            '    cursor: pointer !important;',
            '    box-shadow: 0 0 20px rgba(243, 156, 18, 0.55) !important;',
            '    transition: all 0.25s ease !important;',
            '    touch-action: manipulation !important;',
            '    text-transform: uppercase !important;',
            '    display: inline-flex !important;',
            '    align-items: center !important;',
            '    gap: 6px !important;',
            '}',
            '.cs-start-fullscreen-btn:hover {',
            '    background: linear-gradient(135deg, #f1c40f, #e67e22) !important;',
            '    box-shadow: 0 0 32px rgba(241, 196, 15, 0.9) !important;',
            '    transform: translateY(-2px);',
            '}',
            '.cs-start-btn {',
            '    background: rgba(255, 255, 255, 0.12) !important;',
            '    color: #fff !important;',
            '    border: 1.5px solid rgba(255, 255, 255, 0.3) !important;',
            '    padding: 0.75rem 1.5rem !important;',
            '    border-radius: 4px !important;',
            '    font-family: "Orbitron", monospace !important;',
            '    font-size: 0.85rem !important;',
            '    font-weight: 700 !important;',
            '    letter-spacing: 1.5px !important;',
            '    cursor: pointer !important;',
            '    transition: all 0.25s ease !important;',
            '    touch-action: manipulation !important;',
            '    text-transform: uppercase !important;',
            '}',
            '.cs-start-btn:hover {',
            '    background: rgba(255, 255, 255, 0.25) !important;',
            '    border-color: #fff !important;',
            '}',
            '',
            '/* Responsivo Celulares */',
            '@media (max-width: 900px), (max-height: 520px) {',
            '    .cs-lvl-name { display: none !important; }',
            '    #cs-header-title { font-size: 0.85rem !important; }',
            '}',
            '@media (max-width: 768px), (max-height: 520px) {',
            '    #cs-header {',
            '        height: 38px !important;',
            '        min-height: 38px !important;',
            '        max-height: 38px !important;',
            '        padding: 0 0.5rem !important;',
            '        gap: 0.35rem !important;',
            '    }',
            '    .ej-btn-lbl { display: none !important; }',
            '    .ej-btn-header {',
            '        height: 28px !important;',
            '        min-width: 28px !important;',
            '        padding: 0 0.45rem !important;',
            '        font-size: 0.75rem !important;',
            '    }',
            '    #cs-level-pill, #cs-timer-box {',
            '        padding: 0.15rem 0.4rem !important;',
            '        font-size: 0.72rem !important;',
            '    }',
            '    #cs-status-bar {',
            '        padding: 0.3rem 0.8rem !important;',
            '        font-size: 0.72rem !important;',
            '    }',
            '}',
            '@media (max-width: 580px) {',
            '    #cs-header-title { display: none !important; }',
            '    #cs-status-bar { display: none !important; }',
            '    .cs-screen-title { font-size: 1.15rem !important; margin-bottom: 0.35rem !important; }',
            '    .cs-modal-card { padding: 0.85rem 0.95rem !important; width: 94% !important; max-height: 94dvh !important; }',
            '    .cs-modal-sub { font-size: 0.74rem !important; line-height: 1.3 !important; margin-bottom: 0.5rem !important; }',
            '    .cs-rules-box { font-size: 0.70rem !important; padding: 0.45rem 0.65rem !important; margin-bottom: 0.55rem !important; line-height: 1.35 !important; }',
            '    .cs-fs-banner { padding: 0.4rem 0.6rem !important; margin-bottom: 0.55rem !important; }',
            '    .cs-fs-text { font-size: 0.70rem !important; }',
            '    .cs-start-actions { flex-direction: column !important; gap: 0.4rem !important; }',
            '    .cs-start-fullscreen-btn, .cs-start-btn { width: 100% !important; justify-content: center !important; padding: 0.55rem 1rem !important; font-size: 0.78rem !important; }',
            '}',
            '@media (max-height: 520px) {',
            '    .cs-modal-card {',
            '        padding: 0.6rem 1rem !important;',
            '        max-height: 94dvh !important;',
            '        max-width: 92vw !important;',
            '    }',
            '    .cs-screen-title { font-size: 1.05rem !important; margin-bottom: 0.25rem !important; }',
            '    .cs-modal-sub { font-size: 0.72rem !important; line-height: 1.3 !important; margin-bottom: 0.35rem !important; }',
            '    .cs-rules-box { display: none !important; }',
            '    .cs-fs-banner { padding: 0.3rem 0.55rem !important; margin-bottom: 0.4rem !important; }',
            '    .cs-fs-text { font-size: 0.68rem !important; }',
            '    .cs-fs-toggle-btn { padding: 0.25rem 0.55rem !important; font-size: 0.68rem !important; }',
            '    .cs-start-fullscreen-btn, .cs-start-btn { padding: 0.4rem 1rem !important; font-size: 0.76rem !important; }',
            '    #cs-status-bar { display: none !important; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // ============================================================
    //  AUDIO CON FALLBACK (RAÍZ Y SUBDIRECTORIO)
    // ============================================================
    function createAudioWithFallback(filename, loop, vol) {
        var a = new Audio();
        if (loop) a.loop = true;
        if (typeof vol === 'number') a.volume = vol;
        var triedFolder = false;
        a.src = filename;
        a.addEventListener('error', function () {
            if (!triedFolder) {
                triedFolder = true;
                a.src = 'Carno Search/' + filename;
            }
        });
        return a;
    }

    function initAudio() {
        try {
            sndSearch = createAudioWithFallback('Search.mp4', true, 0.85);
            sndFind   = createAudioWithFallback('find.mp4', false, 1.0);
            sndAttack = createAudioWithFallback('Carno Sound.mp4', false, 1.0);
        } catch (e) {}
    }

    function stopAllAudio() {
        [sndSearch, sndFind, sndAttack].forEach(function (s) {
            if (s) {
                try { s.pause(); s.currentTime = 0; } catch (e) {}
            }
        });
    }

    // ============================================================
    //  CARGA DE IMÁGENES CON FALLBACK (RAÍZ Y SUBDIRECTORIO)
    // ============================================================
    function loadImageWithFallback(img, filename, onDone) {
        var finished = false;
        function markDone() {
            if (!finished) { finished = true; if (onDone) onDone(); }
        }
        img.onload = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Carno%20Search') === -1 && img.src.indexOf('Carno Search') === -1) {
                img.src = 'Carno Search/' + filename;
            } else {
                markDone();
            }
        };
        img.src = filename;
    }

    function loadAssets(callback) {
        var total = LEVELS.length + 3;
        var loaded = 0;
        function done() {
            loaded++;
            if (loaded >= total && callback) callback();
        }

        // Cargar fondos 1 a 7 (busca primero en raíz y luego en Carno Search/)
        for (var i = 0; i < LEVELS.length; i++) {
            var img = new Image();
            imgs.bg[i] = img;
            loadImageWithFallback(img, LEVELS[i].bg, done);
        }

        loadImageWithFallback(imgs.camo,   'CarnoC Camo.png',   done);
        loadImageWithFallback(imgs.find,   'CarnoC Find.png',   done);
        loadImageWithFallback(imgs.attack, 'CarnoC Attack.png', done);
    }

    // ============================================================
    //  CONSTRUCCIÓN DEL DOM
    // ============================================================
    function toggleCsFullscreen() {
        var target = document.getElementById('carno-search-overlay') || document.documentElement;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFs) {
            if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }

    function updateCsFullscreenUI() {
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        var fsBtn = document.getElementById('cs-fullscreen-btn');
        if (fsBtn) {
            fsBtn.innerHTML = isFs
                ? '<span class="ej-ic">🗗</span><span class="ej-btn-lbl"> SALIR PANTALLA COMPLETA</span>'
                : '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        }
        var bannerBtn = document.getElementById('cs-start-fs-toggle-btn');
        if (bannerBtn) {
            bannerBtn.innerHTML = isFs
                ? '<span class="ej-ic">🗗</span> DESACTIVAR'
                : '<span class="ej-ic">⛶</span> ACTIVAR';
        }
    }

    document.addEventListener('fullscreenchange', updateCsFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateCsFullscreenUI);

    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'carno-search-overlay';

        // Header
        var header = document.createElement('div');
        header.id = 'cs-header';

        var hLeft = document.createElement('div');
        hLeft.id = 'cs-header-left';

        var title = document.createElement('div');
        title.id = 'cs-header-title';
        title.innerHTML = '🔦 BUSCANDO AL CARNOTAURUS';

        var lvlPill = document.createElement('div');
        lvlPill.id = 'cs-level-pill';
        lvlPill.textContent = 'SECTOR 1/7';

        var timerBox = document.createElement('div');
        timerBox.id = 'cs-timer-box';
        timerBox.innerHTML = '⏱️ <span id="cs-timer-val">20.0s</span>';

        hLeft.appendChild(title);
        hLeft.appendChild(lvlPill);
        hLeft.appendChild(timerBox);

        var hRight = document.createElement('div');
        hRight.id = 'cs-header-right';
        hRight.className = 'ej-header-actions';

        var muteBtn = document.createElement('button');
        muteBtn.id = 'cs-mute-btn';
        muteBtn.className = 'ej-btn-header';
        muteBtn.innerHTML = '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
        muteBtn.addEventListener('click', function () {
            isMuted = !isMuted;
            muteBtn.innerHTML = isMuted ? '<span class="ej-ic">🔇</span><span class="ej-btn-lbl"> SILENCIADO</span>' : '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
            if (sndSearch) sndSearch.muted = isMuted;
            if (sndFind) sndFind.muted = isMuted;
            if (sndAttack) sndAttack.muted = isMuted;
        });

        var pauseBtn = document.createElement('button');
        pauseBtn.id = 'cs-pause-btn';
        pauseBtn.className = 'ej-btn-header';
        pauseBtn.innerHTML = '<span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span>';
        pauseBtn.addEventListener('click', togglePause);

        var fullBtn = document.createElement('button');
        fullBtn.id = 'cs-fullscreen-btn';
        fullBtn.className = 'ej-btn-header';
        fullBtn.innerHTML = '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        fullBtn.addEventListener('click', toggleCsFullscreen);

        var closeBtn = document.createElement('button');
        closeBtn.id = 'cs-close-btn';
        closeBtn.className = 'ej-btn-header ej-btn-header-danger';
        closeBtn.innerHTML = '<span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span>';
        closeBtn.addEventListener('click', closeGame);

        hRight.appendChild(muteBtn);
        hRight.appendChild(pauseBtn);
        hRight.appendChild(fullBtn);
        hRight.appendChild(closeBtn);

        header.appendChild(hLeft);
        header.appendChild(hRight);
        ov.appendChild(header);

        // Canvas wrap
        var wrap = document.createElement('div');
        wrap.id = 'cs-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'cs-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'cs-canvas';
        stage.appendChild(canvas);

        // Pantalla de Inicio
        var startScreen = document.createElement('div');
        startScreen.id = 'cs-start-screen';
        startScreen.className = 'cs-screen show';
        startScreen.innerHTML = [
            '<div class="cs-modal-card">',
            '    <div class="cs-screen-title" style="color:#f39c12;">🔦 BUSCANDO AL CARNOTAURUS</div>',
            '    <div class="cs-modal-sub">',
            '        Los sigilosos Carnotaurus Camaleónicos poseen la capacidad genética de camuflarse en la oscuridad de la selva. Inspecciona <strong>7 sectores clasificados</strong> con tu linterna táctica y neutralízalo antes de que el tiempo expire.',
            '    </div>',
            '    <div class="cs-rules-box">',
            '        ⚡ <strong>DIRECTRICES DE SUPERVIVENCIA:</strong><br>',
            '        • <strong>RASTREO TÁCTICO:</strong> Mueve el ratón o desliza tu dedo para iluminar con la linterna.<br>',
            '        • <strong>DISPARO RÁPIDO:</strong> Pulsa sobre el Carnotaurus para disparar y neutralizar su camuflaje.<br>',
            '        • <strong>TIEMPO CRÍTICO:</strong> Empiezas con 20 segundos y se reduce en cada nivel.<br>',
            '        • <strong>ALERTA DE EMBESTIDA:</strong> Si el cronómetro llega a 0, ¡el depredador saltará sobre ti!',
            '    </div>',
            '    <div class="cs-fs-banner" id="cs-fs-banner">',
            '        <div class="cs-fs-text">',
            '            <span class="cs-fs-icon">💡</span>',
            '            <span>RECOMENDADO EN CELULARES: Jugar en pantalla completa para apuntar y disparar con precisión táctica.</span>',
            '        </div>',
            '        <button type="button" class="cs-fs-toggle-btn" id="cs-start-fs-toggle-btn">',
            '            <span class="ej-ic">⛶</span> ACTIVAR',
            '        </button>',
            '    </div>',
            '    <div class="cs-start-actions">',
            '        <button type="button" class="cs-start-fullscreen-btn" id="cs-start-fullscreen-btn">',
            '            <span class="ej-ic">⛶</span> JUGAR EN PANTALLA COMPLETA',
            '        </button>',
            '        <button type="button" class="cs-start-btn" id="cs-btn-start">',
            '            ▶ INICIAR BÚSQUEDA',
            '        </button>',
            '    </div>',
            '</div>'
        ].join('');
        wrap.appendChild(startScreen);

        // Pantalla Victoria
        var winScreen = document.createElement('div');
        winScreen.id = 'cs-win-screen';
        winScreen.className = 'cs-screen';
        winScreen.innerHTML = [
            '<div class="cs-screen-title" style="color:#2ecc71;">🏆 ¡MISIÓN CUMPLIDA!</div>',
            '<div class="cs-screen-sub">',
            '¡Has sobrevivido a los 7 sectores de la isla y neutralizado la amenaza del Carnotaurus camaleónico!<br>',
            'Tu destreza y reflejos tácticos salvaron la expedición.',
            '</div>',
            '<div class="ej-modal-actions">',
            '  <button class="ej-btn-replay" id="cs-btn-win-replay">↺ Volver a jugar</button>',
            '  <button class="ej-btn-return" id="cs-btn-win-return">✕ Regresar al sitio</button>',
            '</div>'
        ].join('');
        wrap.appendChild(winScreen);

        // Pantalla Derrota
        var loseScreen = document.createElement('div');
        loseScreen.id = 'cs-lose-screen';
        loseScreen.className = 'cs-screen';
        loseScreen.innerHTML = [
            '<div class="cs-screen-title" style="color:#ff4757;">💀 ¡DEVORADO POR EL CARNOTAURUS!</div>',
            '<div class="cs-screen-sub">',
            'El tiempo expiró. Un Carnotaurus Camaleónico emergió de las sombras en una embestida letal.<br>',
            'La selva no perdona a quienes bajan la guardia.',
            '</div>',
            '<div class="ej-modal-actions">',
            '  <button class="ej-btn-replay" id="cs-btn-lose-retry">↺ Volver a jugar</button>',
            '  <button class="ej-btn-return" id="cs-btn-lose-return">✕ Regresar al sitio</button>',
            '</div>'
        ].join('');
        wrap.appendChild(loseScreen);

        var pauseModal = document.createElement('div');
        pauseModal.className = 'ej-pause-overlay';
        pauseModal.id = 'cs-pause-screen';
        pauseModal.style.display = 'none';
        pauseModal.innerHTML = [
            '<div class="ej-pause-card">',
            '  <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>',
            '  <div class="ej-pause-sub">Exploración táctica pausada</div>',
            '  <button class="ej-btn-resume" id="cs-btn-resume">▶ REANUDAR</button>',
            '</div>'
        ].join('');
        wrap.appendChild(pauseModal);


        wrap.appendChild(stage);
        ov.appendChild(wrap);

        // Barra inferior
        var statusBar = document.createElement('div');
        statusBar.id = 'cs-status-bar';
        statusBar.innerHTML = [
            '<div id="cs-status-hint">🎯 Haz clic o toca sobre el Carnotaurus camuflado para dispararle</div>',
            '<div>🎮 Toca y arrastra / Mueve el ratón para apuntar la linterna</div>'
        ].join('');
        ov.appendChild(statusBar);

        document.body.appendChild(ov);

        // Eventos de botones
        var startFsBtn = document.getElementById('cs-start-fullscreen-btn');
        if (startFsBtn) {
            startFsBtn.addEventListener('click', function () {
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    var target = document.getElementById('carno-search-overlay') || document.documentElement;
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                }
                startSearch();
            });
        }
        var startFsToggle = document.getElementById('cs-start-fs-toggle-btn');
        if (startFsToggle) {
            startFsToggle.addEventListener('click', toggleCsFullscreen);
        }

        document.getElementById('cs-btn-start').addEventListener('click', startSearch);
        document.getElementById('cs-btn-win-replay').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('carno-search');
            showScreen(null);
            startSearch();
        });
        document.getElementById('cs-btn-lose-retry').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('carno-search');
            showScreen(null);
            startSearch();
        });
        var csWinRet = document.getElementById('cs-btn-win-return');
        if (csWinRet) csWinRet.addEventListener('click', closeGame);
        var csLoseRet = document.getElementById('cs-btn-lose-return');
        if (csLoseRet) csLoseRet.addEventListener('click', closeGame);
        var csResumeBtn = document.getElementById('cs-btn-resume');
        if (csResumeBtn) csResumeBtn.addEventListener('click', togglePause);

        // Configurar inputs de linterna y disparo
        setupControls();
    }

    // ============================================================
    //  CONTROLES (RATÓN Y TOUCH)
    // ============================================================
    function setupControls() {
        function updatePointer(e) {
            var rect = canvas.getBoundingClientRect();
            var clientX = e.clientX;
            var clientY = e.clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            var canvasX = clientX - rect.left;
            var canvasY = clientY - rect.top;

            // Convertir a escala virtual 1200x670
            torch.x = canvasX / scale;
            torch.y = canvasY / scale;
        }

        canvas.addEventListener('mousemove', updatePointer);
        canvas.addEventListener('touchmove', function (e) {
            updatePointer(e);
            e.preventDefault();
        }, { passive: false });

        function handleShoot(e) {
            if (state !== 'playing') return;
            updatePointer(e);

            // Efecto de disparo
            muzzleFlash = 0.12;
            shakeScreen(8, 0.2);

            var lvl = LEVELS[currentLevelIdx];
            var tx = lvl.x;
            var ty = lvl.y;
            var tw = lvl.w;
            var th = lvl.h;

            // Tolerancia de disparo (hitbox generoso en móviles)
            var pad = 24;
            var isHit = (torch.x >= tx - pad && torch.x <= tx + tw + pad &&
                         torch.y >= ty - pad && torch.y <= ty + th + pad);

            if (isHit) {
                // ¡CARNOTAURUS ENCONTRADO!
                triggerFound();
            }
        }

        canvas.addEventListener('mousedown', handleShoot);
        canvas.addEventListener('touchstart', function (e) {
            handleShoot(e);
            e.preventDefault();
        }, { passive: false });
    }

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('cs-canvas-wrap');
        if (!wrap || !canvas || !stage) return;
        var vw = wrap.clientWidth  || window.innerWidth;
        var vh = wrap.clientHeight || (window.innerHeight - 90);
        scale   = Math.min(vw / LW, vh / LH);
        canvasW = Math.round(LW * scale);
        canvasH = Math.round(LH * scale);
        canvas.width  = canvasW;
        canvas.height = canvasH;
        stage.style.width  = canvasW + 'px';
        stage.style.height = canvasH + 'px';
        draw();
    }

    function showScreen(id) {
        var screens = ['cs-start-screen', 'cs-win-screen', 'cs-lose-screen'];
        screens.forEach(function (s) {
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
    function startSearch() {
        currentLevelIdx = 0;
        showScreen(null);
        loadLevel(currentLevelIdx);

        if (sndSearch) {
            sndSearch.currentTime = 0;
            sndSearch.play().catch(function(){});
        }

        if (aniFrame) cancelAnimationFrame(aniFrame);
        lastTime = performance.now();
        gameLoop(lastTime);
    }

    function loadLevel(idx) {
        currentLevelIdx = idx;
        var lvl = LEVELS[currentLevelIdx];
        timeLeft = lvl.time;
        state = 'playing'; isPaused = false;

        var lvlPill = document.getElementById('cs-level-pill');
        if (lvlPill) lvlPill.innerHTML = 'SECTOR ' + (currentLevelIdx + 1) + '/7<span class="cs-lvl-name">: ' + lvl.name + '</span>';

        var hint = document.getElementById('cs-status-hint');
        if (hint) hint.innerHTML = '🔦 SECTOR ' + (currentLevelIdx + 1) + ' — ¡Busca al Carnotaurus en las sombras antes de que se agote el tiempo!';

        startTimer();
    }

    
    function togglePause() {
        if (state !== 'playing') return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('cs-pause-btn');
        var pauseScreen = document.getElementById('cs-pause-screen');
        if (isPaused) {
            if (sndAmbience) try { sndAmbience.pause(); } catch(e){}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndAmbience && !isMuted) try { sndAmbience.play().catch(function(){}); } catch(e){}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '⏸️';
                if (lbl) lbl.textContent = ' PAUSA';
            }
            if (pauseScreen) pauseScreen.style.display = 'none';
        }
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        updateTimerDisplay();

        var lastTick = performance.now();

        timerInterval = setInterval(function () {
            if (state !== 'playing') {
                clearInterval(timerInterval);
                return;
            }
            var now = performance.now();
            var dt = (now - lastTick) / 1000;
            lastTick = now;
            if (isPaused) return;

            timeLeft = Math.max(0, timeLeft - dt);
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                triggerJumpscare();
            }
        }, 50);
    }

    function updateTimerDisplay() {
        var val = document.getElementById('cs-timer-val');
        var box = document.getElementById('cs-timer-box');
        if (val) val.textContent = timeLeft.toFixed(1) + 's';
        if (box) {
            if (timeLeft <= 5.0) box.classList.add('urgent');
            else box.classList.remove('urgent');
        }
    }

    function triggerFound() {
        state = 'found';
        if (timerInterval) clearInterval(timerInterval);

        // Sonido de acierto
        if (sndFind) {
            sndFind.currentTime = 0;
            sndFind.play().catch(function(){});
        }

        // Efecto de impacto en las coordenadas del objetivo
        var lvl = LEVELS[currentLevelIdx];
        hitEffect = { x: lvl.x + lvl.w/2, y: lvl.y + lvl.h/2, life: 1.5 };
        shakeScreen(14, 0.4);

        var hint = document.getElementById('cs-status-hint');
        if (hint) hint.innerHTML = '🎯 <strong>¡IMPACTO CONFIRMADO!</strong> Carnotaurus revelado.';

        // Esperar 1.6s y avanzar al siguiente nivel o victoria
        setTimeout(function () {
            if (state !== 'found') return;
            if (currentLevelIdx + 1 < LEVELS.length) {
                loadLevel(currentLevelIdx + 1);
            } else {
                // ¡VICTORIA TOTAL!
                triggerWin();
            }
        }, 1600);
    }

    function triggerJumpscare() {
        state = 'jumpscare';
        if (timerInterval) clearInterval(timerInterval);

        if (sndSearch) sndSearch.pause();
        if (sndAttack) {
            sndAttack.currentTime = 0;
            sndAttack.play().catch(function(){});
        }

        shakeScreen(30, 1.8);

        // Tras el jumpscare, mostrar pantalla de derrota
        setTimeout(function () {
            state = 'lost';
            showScreen('cs-lose-screen');
        }, 2200);
    }

    function triggerWin() {
        state = 'won';
        if (sndSearch) sndSearch.pause();
        showScreen('cs-win-screen');
    }

    function shakeScreen(amount, duration) {
        shakeAmount = amount;
        shakeTimer = duration;
    }

    // ============================================================
    //  RENDERIZADO (CANVAS)
    // ============================================================
    var lastTime = 0;
    function gameLoop(time) {
        var dt = (time - lastTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        lastTime = time;

        if (shakeTimer > 0) shakeTimer -= dt;
        if (muzzleFlash > 0) muzzleFlash -= dt;
        if (hitEffect.life > 0) hitEffect.life -= dt;

        draw();

        if (state !== 'idle') {
            aniFrame = requestAnimationFrame(gameLoop);
        }
    }

    function draw() {
        if (!ctx || !canvas) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Shake de pantalla
        if (shakeTimer > 0) {
            var ox = (Math.random() * 2 - 1) * shakeAmount * scale;
            var oy = (Math.random() * 2 - 1) * shakeAmount * scale;
            ctx.translate(ox, oy);
        }

        var lvl = LEVELS[currentLevelIdx];
        var bgImg = imgs.bg[currentLevelIdx];

        // 1. Dibujar escenario base a oscuras o en penumbra
        if (bgImg && bgImg.complete && bgImg.naturalWidth) {
            ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
        } else {
            ctx.fillStyle = '#0a100d';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // 2. Dibujar Carnotaurus (Camo o Find)
        var carnoImg = (state === 'found') ? imgs.find : imgs.camo;
        if (carnoImg && carnoImg.complete && carnoImg.naturalWidth) {
            var cdx = lvl.x * scale;
            var cdy = lvl.y * scale;
            var cdw = lvl.w * scale;
            var cdh = lvl.h * scale;

            ctx.save();
            if (state === 'found') {
                // Brillo y halo rojo de detección
                ctx.shadowColor = '#e74c3c';
                ctx.shadowBlur = 25 * scale;
            }
            ctx.drawImage(carnoImg, cdx, cdy, cdw, cdh);
            ctx.restore();
        }

        // 3. CAPA DE OSCURIDAD TOTAL Y LINTERNA TÁCTICA
        if (state === 'playing' || state === 'found') {
            var tx = torch.x * scale;
            var ty = torch.y * scale;
            var tr = torch.radius * scale;

            // Oscuridad en pantalla completa
            ctx.save();
            // Creamos una máscara de oscuridad usando Destination-Out
            // En un canvas auxiliar o con gradiente radial oscuro:
            var grad = ctx.createRadialGradient(tx, ty, tr * 0.25, tx, ty, tr);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
            grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
            grad.addColorStop(1, 'rgba(2, 4, 3, 0.98)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Cubrir todo fuera del radio con oscuridad absoluta
            ctx.beginPath();
            ctx.rect(0, 0, canvasW, canvasH);
            ctx.arc(tx, ty, tr, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgba(2, 4, 3, 0.98)';
            ctx.fill();

            // Dibujar aro sutil de la linterna y retícula táctica
            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(243, 156, 18, 0.35)';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Retícula de mira láser
            ctx.beginPath();
            ctx.arc(tx, ty, 6 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4757';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tx - 18 * scale, ty); ctx.lineTo(tx - 8 * scale, ty);
            ctx.moveTo(tx + 8 * scale, ty);  ctx.lineTo(tx + 18 * scale, ty);
            ctx.moveTo(tx, ty - 18 * scale); ctx.lineTo(tx, ty - 8 * scale);
            ctx.moveTo(tx, ty + 8 * scale);  ctx.lineTo(tx, ty + 18 * scale);
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();

            ctx.restore();
        }

        // 4. JUMPSCARE — Carnotaurus Attack gigante en pantalla
        if (state === 'jumpscare') {
            ctx.save();
            ctx.fillStyle = 'rgba(200, 0, 0, ' + (Math.random() * 0.45 + 0.15) + ')';
            ctx.fillRect(0, 0, canvasW, canvasH);

            if (imgs.attack.complete && imgs.attack.naturalWidth) {
                // Zoom agresivo
                var atW = canvasW * 0.92;
                var atH = canvasH * 1.15;
                var atX = (canvasW - atW) / 2;
                var atY = (canvasH - atH) / 2 - (Math.random() * 20);
                ctx.drawImage(imgs.attack, atX, atY, atW, atH);
            }
            ctx.restore();
        }

        // 5. Destello de disparo (Muzzle Flash)
        if (muzzleFlash > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 235, 160, 0.45)';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.restore();
        }

        // 6. Efecto de impacto cuando se localiza
        if (hitEffect.life > 0) {
            ctx.save();
            var hx = hitEffect.x * scale;
            var hy = hitEffect.y * scale;
            ctx.beginPath();
            ctx.arc(hx, hy, (45 + (1.5 - hitEffect.life) * 30) * scale, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 71, 87, ' + (hitEffect.life / 1.5) + ')';
            ctx.lineWidth = 4 * scale;
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  CONTROL DE CIERRE Y APERTURA
    // ============================================================
    function openGame() {
        var ov = document.getElementById('carno-search-overlay');
        if (!ov) return;
        ov.classList.add('open');

        if (typeof window.interruptBgMusic === 'function') {
            window.interruptBgMusic();
        }

        showScreen('cs-start-screen');
        state = 'idle';

        if (!ctx) ctx = canvas.getContext('2d');
        resize();
        updateCsFullscreenUI();
    }

    function closeGame() {
        if (isPaused) togglePause();
        var pScreen = document.getElementById('cs-pause-screen');
        if (pScreen) {
            pScreen.style.display = 'none';
            pScreen.classList.remove('active');
        }
        var ov = document.getElementById('carno-search-overlay');
        if (ov) ov.classList.remove('open');
        if (aniFrame) cancelAnimationFrame(aniFrame);
        if (timerInterval) clearInterval(timerInterval);
        stopAllAudio();
        state = 'idle';
        showScreen(null);

        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFs) {
            try {
                if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            } catch(e) {}
        }

        if (typeof window.releaseBgMusic === 'function') {
            window.releaseBgMusic();
        }
    }

    // Exponer globalmente
    window.openCarnoSearch = openGame;

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        loadAssets(function () {});
        buildOverlay();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('carno-search-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
