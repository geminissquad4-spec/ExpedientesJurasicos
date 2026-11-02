// ============================================================
//  EXPEDIENTES JURÁSICOS — SOBREVIVIR EN LA ISLA
//  MINIJUEGO: ¡LA CUEVA DEL BARYONYX!
//  Ayuda al soldado Antony Benton a escapar de la caverna
//  trepando la cuerda antes de que el Baryonyx lo alcance.
// ============================================================

(function () {
    'use strict';

    // Dimensiones virtuales del juego (aspect ratio 2.31 de la cueva)
    var LW = 1200, LH = 520;

    // Estado del juego
    var state = 'idle'; // idle | briefing | playing | won | lost
    var aniFrame = null;
    var lastTime = 0;

    // Progreso de escalada de Antony (0 a 100%)
    var climbProgress = 0;
    var maxClimbDistance = 330; // píxeles de elevación vertical
    var slipSpeed = 24; // px/s de resbalamiento si no se pulsa espacio
    var slipTimer = 0;
    var nextSlipTime = 3.5 + Math.random() * 2.0;
    var slipAlertTimer = 0;
    var slipAlertAmount = 0;

    // Posición y oscilación de Antony y la cuerda
    // En la referencia: ax = 905, ay = -23 en canvas de 1200x520
    var antony = {
        baseX: 905,
        baseY: -23,
        w: 348,
        h: 517,
        climbOffset: 0, // se incrementa al trepar (hacia arriba)
        swayAngle: 0,
        swaySpeed: 4.5,
        swayAmp: 0.015 // radianes
    };

    // Baryonyx (tamaño reducido y situado en el suelo rocoso de la caverna)
    var bary = {
        baseX: -220,
        x: -220,
        by: 155,
        w: 645,
        h: 360,
        currentStep: 'paso1', // 'paso1' | 'paso2'
        stepTimer: 0,
        stepInterval: 0.45,
        paso2Count: 0,
        baseSpeed: 36, // px/s
        targetX: 410   // punto donde alcanza la cuerda
    };

    // Escala del canvas y responsive
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;

    // Caché de imágenes y audios
    var imagesCache = {};
    var sndMusic = null;
    var currentRoar = null;
    var isMuted = false;
    var isPaused = false;
    var audioCtx = null;

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('cueva-baryonyx-styles')) return;
        var style = document.createElement('style');
        style.id = 'cueva-baryonyx-styles';
        style.textContent = [
            '.ej-btn-header { background: rgba(0, 20, 20, 0.85) !important; border: 1.5px solid #00f5ff !important; color: #00f5ff !important; font-family: "Share Tech Mono", monospace !important; font-size: 0.75rem !important; font-weight: 700 !important; padding: 0.35rem 0.75rem !important; border-radius: 4px !important; cursor: pointer !important; letter-spacing: 1px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 5px !important; text-transform: uppercase !important; transition: all 0.2s ease !important; height: 32px !important; box-sizing: border-box !important; touch-action: manipulation !important; }',
            '.ej-btn-header:hover { background: rgba(0, 245, 255, 0.25) !important; color: #fff !important; }',
            '.ej-btn-header-danger { background: rgba(255, 71, 87, 0.12) !important; border-color: #ff4757 !important; color: #ff4757 !important; }',
            '.ej-btn-header-danger:hover { background: #ff4757 !important; color: #fff !important; }',
            '#cb-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: rgba(2, 6, 4, 0.98); backdrop-filter: blur(8px);',
            '    display: none; flex-direction: column;',
            '    font-family: "Share Tech Mono", monospace; color: #fff;',
            '    user-select: none;',
            '}',
            '#cb-overlay.open { display: flex; animation: cb-fade-in 0.25s ease-out; }',
            '@keyframes cb-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '',
            '/* Header de control */',
            '#cb-header {',
            '    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;',
            '    padding: 0 0.8rem; height: 40px; min-height: 40px; max-height: 40px;',
            '    background: rgba(4, 16, 10, 0.96); border-bottom: 2px solid rgba(0, 210, 211, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.85); z-index: 10;',
            '    gap: 0.5rem; flex-wrap: nowrap; overflow: hidden; white-space: nowrap;',
            '}',
            '#cb-header-left { display: flex; align-items: center; gap: 0.6rem; flex-wrap: nowrap; overflow: hidden; }',
            '#cb-header-right { display: flex; align-items: center; gap: 0.35rem; flex-wrap: nowrap; flex-shrink: 0; }',
            '#cb-header-title {',
            '    font-family: "Orbitron", monospace; font-size: 0.95rem; font-weight: 900;',
            '    color: #00d2d3; letter-spacing: 1.5px; text-transform: uppercase;',
            '}',
            '#cb-climb-pill {',
            '    background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.4);',
            '    padding: 0.2rem 0.65rem; border-radius: 3px; font-size: 0.8rem;',
            '    color: #2ecc71; letter-spacing: 1px;',
            '}',
            '#cb-danger-box {',
            '    font-family: "Orbitron", monospace; font-size: 0.82rem; font-weight: 700;',
            '    color: #ff6b6b; padding: 0.2rem 0.65rem; background: rgba(231, 76, 60, 0.15);',
            '    border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 3px;',
            '}',
            '#cb-danger-box.danger { animation: cb-blink 0.5s infinite; background: rgba(231, 76, 60, 0.35); }',
            '@keyframes cb-blink { 50% { opacity: 0.4; } }',
            '',
            '#cb-header-right { display: flex; align-items: center; gap: 8px; }',
            '.cb-btn-header {',
            '    background: rgba(0, 210, 211, 0.15); border: 1px solid #00d2d3; color: #00d2d3;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.8rem; border-radius: 3px; cursor: pointer;',
            '    letter-spacing: 1px; transition: all 0.2s;',
            '    display: inline-flex; align-items: center; gap: 5px;',
            '}',
            '.cb-btn-header:hover { background: #00d2d3; color: #020b06; }',
            '#cb-close-btn {',
            '    background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ff6b6b;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.9rem; border-radius: 3px; cursor: pointer; transition: all 0.2s;',
            '}',
            '#cb-close-btn:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* Canvas Wrap y Stage */',
            '#cb-canvas-wrap {',
            '    flex: 1; position: relative; display: flex; align-items: center;',
            '    justify-content: center; overflow: hidden; background: #020604;',
            '}',
            '#cb-canvas-stage { position: relative; overflow: hidden; box-shadow: 0 0 35px rgba(0,0,0,0.9); }',
            '#cb-canvas { display: block; }',
            '',
            '/* HUD: Barra de altura de escape */',
            '#cb-progress-bar-wrap {',
            '    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);',
            '    width: 55%; max-width: 480px; background: rgba(0, 20, 15, 0.85);',
            '    border: 1px solid rgba(46, 204, 113, 0.4); border-radius: 4px; padding: 4px 6px;',
            '    z-index: 15; box-shadow: 0 4px 15px rgba(0,0,0,0.8);',
            '}',
            '#cb-progress-bar-fill {',
            '    height: 10px; background: linear-gradient(90deg, #f1c40f, #2ecc71);',
            '    border-radius: 2px; width: 0%; transition: width 0.08s linear;',
            '}',
            '#cb-progress-text {',
            '    display: flex; justify-content: space-between; font-size: 0.72rem;',
            '    color: #a8f5f5; margin-top: 3px; letter-spacing: 1px;',
            '}',
            '',
            '/* Botón táctil para celulares */',
            '#cb-touch-climb-btn {',
            '    position: absolute; bottom: 20px; right: 30px; z-index: 25;',
            '    background: rgba(46, 204, 113, 0.3); border: 2px solid #2ecc71; color: #a8ff3e;',
            '    font-family: "Orbitron", monospace; font-size: 1.1rem; font-weight: 900;',
            '    padding: 0.85rem 1.6rem; border-radius: 30px; cursor: pointer;',
            '    box-shadow: 0 0 25px rgba(46, 204, 113, 0.6); backdrop-filter: blur(6px);',
            '    letter-spacing: 1.5px; user-select: none; touch-action: manipulation;',
            '    display: flex; align-items: center; gap: 8px;',
            '}',
            '#cb-touch-climb-btn:active { background: #2ecc71; color: #02120e; transform: scale(0.95); }',
            '@media (min-width: 850px) {',
            '    #cb-touch-climb-btn { bottom: 25px; font-size: 1rem; }',
            '}',
            '',
            '/* Indicador central de tecla ESPACIO */',
            '#cb-space-hint {',
            '    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);',
            '    background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255, 255, 255, 0.25);',
            '    padding: 0.4rem 1.2rem; border-radius: 4px; font-size: 0.82rem; color: #eee;',
            '    letter-spacing: 1px; z-index: 15; pointer-events: none;',
            '}',
            '',
            '/* Pantallas modales (Briefing / Victoria / Derrota) */',
            '.cb-modal-screen {',
            '    position: absolute; inset: 0; z-index: 40; display: none;',
            '    flex-direction: column; align-items: center; justify-content: center;',
            '    text-align: center; background: rgba(2, 6, 4, 0.94); backdrop-filter: blur(8px);',
            '    padding: 1.5rem; box-sizing: border-box;',
            '}',
            '.cb-modal-screen.show { display: flex; animation: cb-fade-in 0.25s ease-out; }',
            '.cb-modal-title { font-family: "Orbitron", monospace; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.8rem; }',
            '.cb-modal-desc { font-size: 0.95rem; line-height: 1.6; max-width: 650px; color: #ddd; margin-bottom: 1.6rem; }',
            '.cb-modal-tip { background: rgba(0, 210, 211, 0.1); border: 1px solid rgba(0, 210, 211, 0.3); padding: 0.6rem 1rem; border-radius: 4px; font-size: 0.85rem; color: #00d2d3; margin-bottom: 1.4rem; max-width: 550px; }',
            '.cb-btn {',
            '    font-family: "Orbitron", monospace; font-size: 0.88rem; font-weight: 700;',
            '    letter-spacing: 1.5px; padding: 0.75rem 2rem; border-radius: 4px;',
            '    cursor: pointer; border: none; transition: all 0.2s; text-transform: uppercase;',
            '}',
            '.cb-btn-cyan { background: #00d2d3; color: #02120e; box-shadow: 0 0 20px rgba(0, 210, 211, 0.5); }',
            '.cb-btn-cyan:hover { background: #48dbfb; box-shadow: 0 0 35px rgba(72, 219, 251, 0.8); transform: translateY(-2px); }',
            '.cb-btn-green { background: #2ecc71; color: #02140a; box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }',
            '.cb-btn-green:hover { background: #55efc4; box-shadow: 0 0 35px rgba(85, 239, 196, 0.8); transform: translateY(-2px); }',
            '.cb-btn-red { background: #e74c3c; color: #fff; box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }',
            '.cb-btn-red:hover { background: #ff4757; box-shadow: 0 0 35px rgba(255, 71, 87, 0.8); transform: translateY(-2px); }',
            '',
            '/* Card y banner del modal de inicio */',
            '.cb-modal-card {',
            '    background: linear-gradient(135deg, rgba(4, 24, 20, 0.96), rgba(2, 12, 10, 0.98));',
            '    border: 2px solid rgba(0, 210, 211, 0.55);',
            '    border-radius: 8px;',
            '    padding: 1.6rem 2rem;',
            '    max-width: 620px;',
            '    width: 92%;',
            '    box-shadow: 0 0 45px rgba(0, 210, 211, 0.35);',
            '    margin: auto;',
            '    max-height: 88dvh;',
            '    overflow-y: auto;',
            '    -webkit-overflow-scrolling: touch;',
            '    box-sizing: border-box;',
            '    text-align: center;',
            '}',
            '.cb-modal-sub {',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.86rem;',
            '    color: #ddd;',
            '    line-height: 1.5;',
            '    margin-bottom: 1rem;',
            '}',
            '.cb-rules-box {',
            '    background: rgba(0, 0, 0, 0.65);',
            '    border-left: 3px solid #00d2d3;',
            '    padding: 0.65rem 0.9rem;',
            '    text-align: left;',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.76rem;',
            '    color: #eee;',
            '    margin-bottom: 1.1rem;',
            '    line-height: 1.45;',
            '}',
            '.cb-fs-banner {',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: space-between;',
            '    gap: 0.8rem;',
            '    background: rgba(0, 210, 211, 0.12);',
            '    border: 1.5px solid #00d2d3;',
            '    border-radius: 6px;',
            '    padding: 0.6rem 0.9rem;',
            '    margin-bottom: 1.2rem;',
            '    box-shadow: 0 0 16px rgba(0, 210, 211, 0.25);',
            '    text-align: left;',
            '    box-sizing: border-box;',
            '    width: 100%;',
            '}',
            '.cb-fs-text {',
            '    display: flex;',
            '    align-items: center;',
            '    gap: 0.5rem;',
            '    font-family: "Share Tech Mono", monospace;',
            '    font-size: 0.76rem;',
            '    color: #48dbfb;',
            '    line-height: 1.35;',
            '}',
            '.cb-fs-icon { font-size: 1.25rem; flex-shrink: 0; }',
            '.cb-fs-toggle-btn {',
            '    background: #00d2d3;',
            '    color: #02120e;',
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
            '.cb-fs-toggle-btn:hover { background: #48dbfb; box-shadow: 0 0 14px rgba(0, 210, 211, 0.8); }',
            '.cb-start-actions {',
            '    display: flex;',
            '    gap: 0.75rem;',
            '    flex-wrap: wrap;',
            '    justify-content: center;',
            '    align-items: center;',
            '    width: 100%;',
            '}',
            '.cb-start-fullscreen-btn {',
            '    background: linear-gradient(135deg, #00d2d3, #0984e3) !important;',
            '    color: #02120e !important;',
            '    border: none !important;',
            '    padding: 0.75rem 1.6rem !important;',
            '    border-radius: 4px !important;',
            '    font-family: "Orbitron", monospace !important;',
            '    font-size: 0.85rem !important;',
            '    font-weight: 900 !important;',
            '    letter-spacing: 1.5px !important;',
            '    cursor: pointer !important;',
            '    box-shadow: 0 0 20px rgba(0, 210, 211, 0.55) !important;',
            '    transition: all 0.25s ease !important;',
            '    touch-action: manipulation !important;',
            '    text-transform: uppercase !important;',
            '    display: inline-flex !important;',
            '    align-items: center !important;',
            '    gap: 6px !important;',
            '}',
            '.cb-start-fullscreen-btn:hover {',
            '    background: linear-gradient(135deg, #48dbfb, #00cec9) !important;',
            '    box-shadow: 0 0 32px rgba(0, 210, 211, 0.9) !important;',
            '    transform: translateY(-2px);',
            '}',
            '.cb-start-btn {',
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
            '.cb-start-btn:hover {',
            '    background: rgba(255, 255, 255, 0.25) !important;',
            '    border-color: #fff !important;',
            '}',
            '',
            '.cb-title-short, .cb-danger-short { display: none; }',
            '/* Responsivo Celulares */',
            '@media (max-width: 900px), (max-height: 520px) {',
            '    .cb-title-full { display: none !important; }',
            '    .cb-title-short { display: inline !important; }',
            '    #cb-header-title { font-size: 0.85rem !important; }',
            '}',
            '@media (max-width: 768px), (max-height: 520px) {',
            '    #cb-header {',
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
            '    #cb-climb-pill, #cb-danger-box {',
            '        padding: 0.15rem 0.4rem !important;',
            '        font-size: 0.72rem !important;',
            '    }',
            '}',
            '@media (max-width: 580px) {',
            '    #cb-header-title { display: none !important; }',
            '    .cb-danger-long { display: none !important; }',
            '    .cb-danger-short { display: inline !important; }',
            '    #cb-progress-bar-wrap { width: 88% !important; max-width: 360px !important; }',
            '    #cb-progress-text { font-size: 0.66rem !important; }',
            '    #cb-space-hint { display: none !important; }',
            '    #cb-touch-climb-btn {',
            '        bottom: 20px !important;',
            '        right: 50% !important;',
            '        transform: translateX(50%) !important;',
            '        min-width: 180px !important;',
            '        justify-content: center !important;',
            '    }',
            '    .cb-modal-title { font-size: 1.15rem !important; margin-bottom: 0.35rem !important; }',
            '    .cb-modal-card { padding: 0.85rem 0.95rem !important; width: 94% !important; max-height: 94dvh !important; }',
            '    .cb-modal-sub { font-size: 0.74rem !important; line-height: 1.3 !important; margin-bottom: 0.5rem !important; }',
            '    .cb-rules-box { font-size: 0.70rem !important; padding: 0.45rem 0.65rem !important; margin-bottom: 0.55rem !important; line-height: 1.35 !important; }',
            '    .cb-fs-banner { padding: 0.4rem 0.6rem !important; margin-bottom: 0.55rem !important; }',
            '    .cb-fs-text { font-size: 0.70rem !important; }',
            '    .cb-start-actions { flex-direction: column !important; gap: 0.4rem !important; }',
            '    .cb-start-fullscreen-btn, .cb-start-btn { width: 100% !important; justify-content: center !important; padding: 0.55rem 1rem !important; font-size: 0.78rem !important; }',
            '}',
            '@media (max-height: 520px) {',
            '    .cb-modal-card {',
            '        padding: 0.6rem 1rem !important;',
            '        max-height: 94dvh !important;',
            '        max-width: 92vw !important;',
            '    }',
            '    .cb-modal-title { font-size: 1.05rem !important; margin-bottom: 0.25rem !important; }',
            '    .cb-modal-sub { font-size: 0.72rem !important; line-height: 1.3 !important; margin-bottom: 0.35rem !important; }',
            '    .cb-rules-box { display: none !important; }',
            '    .cb-fs-banner { padding: 0.3rem 0.55rem !important; margin-bottom: 0.4rem !important; }',
            '    .cb-fs-text { font-size: 0.68rem !important; }',
            '    .cb-fs-toggle-btn { padding: 0.25rem 0.55rem !important; font-size: 0.68rem !important; }',
            '    .cb-start-fullscreen-btn, .cb-start-btn { padding: 0.4rem 1rem !important; font-size: 0.76rem !important; }',
            '    #cb-space-hint { display: none !important; }',
            '    #cb-touch-climb-btn {',
            '        bottom: 14px !important;',
            '        right: 20px !important;',
            '        font-size: 0.88rem !important;',
            '        padding: 0.55rem 1.2rem !important;',
            '    }',
            '}'
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
                a.src = 'Baryonyx%20Cave/' + resolveURI(filename);
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
            if (filename === 'Perdiste_Baryonyx.png') {
                img.src = 'Baryonyx%20Cave/Perdiste.png';
                return;
            }
            if (img.src.indexOf('Baryonyx%20Cave') === -1 && img.src.indexOf('Baryonyx Cave') === -1) {
                img.src = 'Baryonyx%20Cave/' + resolveURI(filename);
            } else if (filename === 'Baryonyx Cueva Fondo.png') {
                img.src = 'Baryonyx%20Cueva%20Fondo.jpg';
            }
        };
        img.src = resolveURI(filename);
        imagesCache[filename] = img;
        return img;
    }

    function preloadAll() {
        ['Antony.png', 'Baryonyx Cueva Fondo.png', 'Baryonyx Cueva Fondo.jpg', 'Paso 1.png', 'Paso 2.png', 'Perdiste_Baryonyx.png'].forEach(getImage);
    }

    function initAudio() {
        try {
            sndMusic = createAudioWithFallback('Cueva.mp4', true, 0.7);
        } catch (e) {}
    }

    function stopAllAudio() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        if (currentRoar) {
            try { currentRoar.pause(); currentRoar.currentTime = 0; } catch (e) {}
            currentRoar = null;
        }
    }

    function playBaryonyxRoar(vol) {
        if (isMuted) return;
        try {
            if (currentRoar) {
                try { currentRoar.pause(); } catch(e){}
            }
            currentRoar = createAudioWithFallback('Baryonyx Rugido.mp4', false, typeof vol === 'number' ? vol : 1.0);
            currentRoar.play().catch(function(){});
        } catch (e) {}
    }

        function playSlipSound() {
        if (isMuted) return;
        try {
            if (!audioCtx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (AC) audioCtx = new AC();
            }
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.28);
            gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.28);
        } catch(e){}
    }

function playBaryonyxGrowl() {
        if (isMuted) return;
        try {
            if (!audioCtx) {
                var AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtx = new AudioContext();
            }
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            // Gruñido sordo de paso
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(85, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } catch (e) {}
    }

    // ============================================================
    //  CONSTRUCCIÓN DEL DOM
    // ============================================================
    function toggleCbFullscreen() {
        var target = document.getElementById('cb-overlay') || document.documentElement;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFs) {
            if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }

    function updateCbFullscreenUI() {
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        var fsBtn = document.getElementById('cb-fullscreen-btn');
        if (fsBtn) {
            fsBtn.innerHTML = isFs
                ? '<span class="ej-ic">🗗</span><span class="ej-btn-lbl"> SALIR PANTALLA COMPLETA</span>'
                : '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        }
        var bannerBtn = document.getElementById('cb-start-fs-toggle-btn');
        if (bannerBtn) {
            bannerBtn.innerHTML = isFs
                ? '<span class="ej-ic">🗗</span> DESACTIVAR'
                : '<span class="ej-ic">⛶</span> ACTIVAR';
        }
    }

    document.addEventListener('fullscreenchange', updateCbFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateCbFullscreenUI);

    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'cb-overlay';

        // Header
        var header = document.createElement('div');
        header.id = 'cb-header';

        var hLeft = document.createElement('div');
        hLeft.id = 'cb-header-left';

        var title = document.createElement('div');
        title.id = 'cb-header-title';
        title.innerHTML = '<span class="cb-title-full">🐊 LA CUEVA DEL BARYONYX — SOBREVIVIR EN LA ISLA</span><span class="cb-title-short">🐊 CUEVA DEL BARYONYX</span>';

        var climbPill = document.createElement('div');
        climbPill.id = 'cb-climb-pill';
        climbPill.textContent = 'ALTURA: 0%';

        var dangerBox = document.createElement('div');
        dangerBox.id = 'cb-danger-box';
        dangerBox.innerHTML = '⚠️ <span class="cb-danger-short">BARYONYX</span><span class="cb-danger-long">BARYONYX ACECHANDO</span>';

        hLeft.appendChild(title);
        hLeft.appendChild(climbPill);
        hLeft.appendChild(dangerBox);

        var hRight = document.createElement('div');
        hRight.id = 'cb-header-right';
        hRight.className = 'ej-header-actions';

        var muteBtn = document.createElement('button');
        muteBtn.id = 'cb-mute-btn';
        muteBtn.className = 'ej-btn-header';
        muteBtn.innerHTML = '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
        muteBtn.addEventListener('click', function () {
            isMuted = !isMuted;
            if (isMuted) {
                muteBtn.innerHTML = '<span class="ej-ic">🔇</span><span class="ej-btn-lbl"> SILENCIADO</span>';
                if (sndMusic) sndMusic.muted = true;
                if (currentRoar) currentRoar.muted = true;
            } else {
                muteBtn.innerHTML = '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
                if (sndMusic) sndMusic.muted = false;
                if (currentRoar) currentRoar.muted = false;
            }
        });

        var pauseBtn = document.createElement('button');
        pauseBtn.id = 'cb-pause-btn';
        pauseBtn.className = 'ej-btn-header';
        pauseBtn.innerHTML = '<span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span>';
        pauseBtn.addEventListener('click', togglePause);

        var fullBtn = document.createElement('button');
        fullBtn.id = 'cb-fullscreen-btn';
        fullBtn.className = 'ej-btn-header';
        fullBtn.innerHTML = '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        fullBtn.addEventListener('click', toggleCbFullscreen);

        var closeBtn = document.createElement('button');
        closeBtn.id = 'cb-close-btn';
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

        // Canvas Wrap
        var wrap = document.createElement('div');
        wrap.id = 'cb-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'cb-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'cb-canvas';
        stage.appendChild(canvas);

        // Barra de progreso de subida
        var progWrap = document.createElement('div');
        progWrap.id = 'cb-progress-bar-wrap';
        progWrap.innerHTML = [
            '<div id="cb-progress-bar-fill"></div>',
            '<div id="cb-progress-text">',
            '    <span>FONDO DE LA CUEVA</span>',
            '    <span id="cb-prog-pct">0%</span>',
            '    <span>SUPERFICIE (SALIDA)</span>',
            '</div>'
        ].join('');
        wrap.appendChild(progWrap);

        // Indicador central de tecla ESPACIO
        var spaceHint = document.createElement('div');
        spaceHint.id = 'cb-space-hint';
        spaceHint.textContent = '⌨️ PULSA [ESPACIO] RÁPIDAMENTE PARA SUBIR';
        wrap.appendChild(spaceHint);

        // Botón táctil para móviles
        var touchBtn = document.createElement('button');
        touchBtn.id = 'cb-touch-climb-btn';
        touchBtn.innerHTML = '⬆️ TREPAR';
        touchBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            handleClimb();
        }, { passive: false });
        touchBtn.addEventListener('click', handleClimb);
        wrap.appendChild(touchBtn);

        // Pantalla de Inicio / Briefing
        var briefScreen = document.createElement('div');
        briefScreen.id = 'cb-brief-screen';
        briefScreen.className = 'cb-modal-screen show';
        briefScreen.innerHTML = [
            '<div class="cb-modal-card">',
            '    <div class="cb-modal-title" style="color:#00d2d3;">🧗 LA CUEVA DEL BARYONYX</div>',
            '    <div class="cb-modal-sub">',
            '        El soldado <strong>Antony Benton</strong> ha caído en la caverna subterránea del letal Baryonyx. Una cuerda cuelga desde la abertura superior iluminada por el sol.',
            '    </div>',
            '    <div class="cb-rules-box">',
            '        ⚠️ <strong>DIRECTRICES DE ESCAPADA:</strong><br>',
            '        • <strong>TREPADA CONTINUA:</strong> Pulsa repetidamente la tecla ESPACIO o pulsa el botón ⬆️ TREPAR en tu celular.<br>',
            '        • <strong>PRESIÓN DEL DEPREDADOR:</strong> A mayor altura, la cuerda oscilará con más fuerza y el Baryonyx acelerará su embestida.<br>',
            '        • <strong>OBJETIVO:</strong> Alcanza el 100% de la altura para trepar a la superficie y salvarte.',
            '    </div>',
            '    <div class="cb-fs-banner" id="cb-fs-banner">',
            '        <div class="cb-fs-text">',
            '            <span class="cb-fs-icon">💡</span>',
            '            <span>RECOMENDADO EN CELULARES: Jugar en pantalla completa para trepar y reaccionar con máxima velocidad.</span>',
            '        </div>',
            '        <button type="button" class="cb-fs-toggle-btn" id="cb-start-fs-toggle-btn">',
            '            <span class="ej-ic">⛶</span> ACTIVAR',
            '        </button>',
            '    </div>',
            '    <div class="cb-start-actions">',
            '        <button type="button" class="cb-start-fullscreen-btn" id="cb-start-fullscreen-btn">',
            '            <span class="ej-ic">⛶</span> JUGAR EN PANTALLA COMPLETA',
            '        </button>',
            '        <button type="button" class="cb-start-btn" id="cb-btn-start">',
            '            ▶ INICIAR ESCALADA',
            '        </button>',
            '    </div>',
            '</div>'
        ].join('');
        wrap.appendChild(briefScreen);

        // Pantalla de Victoria
        var winScreen = document.createElement('div');
        winScreen.id = 'cb-win-screen';
        winScreen.className = 'cb-modal-screen';
        winScreen.innerHTML = [
            '<div class="cb-modal-title" style="color:#2ecc71;">🎉 ¡ESCAPE EXITOSO DE LA CUEVA!</div>',
            '<div class="cb-modal-desc">',
            '¡Antony Benton logró trepar a tiempo hacia la superficie de Isla Sorna! El Baryonyx mordió el aire vacío en la profundidad de la caverna.<br><br>',
            '<strong style="color:#2ecc71;">¡EL SOLDADO HA SOBREVIVIDO AL ENCUENTRO!</strong>',
            '</div>',
            '<div class="ej-modal-actions">',
            '  <button class="ej-btn-replay" id="cb-btn-win-replay">↺ Volver a jugar</button>',
            '  <button class="ej-btn-return" id="cb-btn-win-return">✕ Regresar al sitio</button>',
            '</div>'
        ].join('');
        wrap.appendChild(winScreen);

        // Pantalla de Derrota
        var loseScreen = document.createElement('div');
        loseScreen.id = 'cb-lose-screen';
        loseScreen.className = 'cb-modal-screen';
        loseScreen.innerHTML = [
            '<div class="cb-modal-title" style="color:#ff6b6b;">💥 ¡DEVORADO POR EL BARYONYX!</div>',
            '<div class="cb-modal-desc">',
            'Antony no logró escalar la cuerda a tiempo y el colosal depredador lo alcanzó con sus mandíbulas.<br><br>',
            '<strong style="color:#ff6b6b;">DEBERÁS REINTENTAR LA ESCALADA Y SUBIR MÁS RÁPIDO.</strong>',
            '</div>',
            '<div class="ej-modal-actions">',
            '  <button class="ej-btn-replay" id="cb-btn-lose-retry">↺ Volver a jugar</button>',
            '  <button class="ej-btn-return" id="cb-btn-lose-return">✕ Regresar al sitio</button>',
            '</div>'
        ].join('');
        wrap.appendChild(loseScreen);

        var pauseModal = document.createElement('div');
        pauseModal.className = 'ej-pause-overlay';
        pauseModal.id = 'cb-pause-screen';
        pauseModal.style.display = 'none';
        pauseModal.innerHTML = [
            '<div class="ej-pause-card">',
            '  <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>',
            '  <div class="ej-pause-sub">Escalada de cuerda suspendida</div>',
            '  <button class="ej-btn-resume" id="cb-btn-resume">▶ REANUDAR</button>',
            '</div>'
        ].join('');
        wrap.appendChild(pauseModal);


        wrap.appendChild(stage);
        ov.appendChild(wrap);
        document.body.appendChild(ov);

        // Eventos
        var startFsBtn = document.getElementById('cb-start-fullscreen-btn');
        if (startFsBtn) {
            startFsBtn.addEventListener('click', function () {
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    var target = document.getElementById('cb-overlay') || document.documentElement;
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                }
                startGame();
            });
        }
        var startFsToggle = document.getElementById('cb-start-fs-toggle-btn');
        if (startFsToggle) {
            startFsToggle.addEventListener('click', toggleCbFullscreen);
        }

        document.getElementById('cb-btn-start').addEventListener('click', startGame);
        document.getElementById('cb-btn-win-replay').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('cueva-baryonyx');
            startGame();
        });
        document.getElementById('cb-btn-lose-retry').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('cueva-baryonyx');
            startGame();
        });
        var cbWinRet = document.getElementById('cb-btn-win-return');
        if (cbWinRet) cbWinRet.addEventListener('click', closeGame);
        var cbLoseRet = document.getElementById('cb-btn-lose-return');
        if (cbLoseRet) cbLoseRet.addEventListener('click', closeGame);
        var cbResumeBtn = document.getElementById('cb-btn-resume');
        if (cbResumeBtn) cbResumeBtn.addEventListener('click', togglePause);

        // Tocar el lienzo también ayuda a escalar en móvil
        canvas.addEventListener('touchstart', function (e) {
            if (state === 'playing') {
                e.preventDefault();
                handleClimb();
            }
        }, { passive: false });
    }

    // ============================================================
    //  EVENTOS DE TECLADO
    // ============================================================
    window.addEventListener('keydown', function (e) {
        var ov = document.getElementById('cb-overlay');
        if (!ov || !ov.classList.contains('open')) return;

        if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
            e.preventDefault();
            if (state === 'playing') {
                handleClimb();
            }
        } else if (e.key === 'Escape') {
            closeGame();
        }
    });

    function handleClimb() {
        if (state !== 'playing') return;

        // Cada pulsación impulsa a Antony hacia arriba
        antony.climbOffset += 11;
        if (antony.climbOffset >= maxClimbDistance * 0.95) {
            antony.climbOffset = maxClimbDistance;
            climbProgress = 100;
            updateHUD();
            triggerWin();
            return;
        }

        // Impulso en la oscilación de la cuerda al dar el tirón
        antony.swayAngle += (Math.random() - 0.5) * 0.04;
    }

    // ============================================================
    //  RESIZE RESPONSIVO (Ratio 1200x520)
    // ============================================================
    function resize() {
        var wrap = document.getElementById('cb-canvas-wrap');
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
        ['cb-brief-screen', 'cb-win-screen', 'cb-lose-screen'].forEach(function(s) {
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
        state = 'playing'; isPaused = false;

        climbProgress = 0;
        antony.climbOffset = 0;
        antony.swayAngle = 0; slipTimer = 0; slipAlertTimer = 0;

        bary.x = bary.baseX;
        bary.currentStep = 'paso1';
        bary.stepTimer = 0;
        bary.paso2Count = 0;

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
        var pct = Math.min(100, Math.round((antony.climbOffset / maxClimbDistance) * 100));
        var climbPill = document.getElementById('cb-climb-pill');
        var barFill   = document.getElementById('cb-progress-bar-fill');
        var progPct   = document.getElementById('cb-prog-pct');
        var dangerBox = document.getElementById('cb-danger-box');

        if (climbPill) climbPill.textContent = 'ALTURA: ' + pct + '%';
        if (barFill)   barFill.style.width = pct + '%';
        if (progPct)   progPct.textContent = pct + '%';

        // Distancia restante del Baryonyx hacia la cuerda
        var distToRope = Math.max(0, Math.round((bary.targetX - bary.x) / 18));
        if (dangerBox) {
            if (distToRope <= 8) {
                dangerBox.innerHTML = '🚨 <span class="cb-danger-short">' + distToRope + 'M</span><span class="cb-danger-long">¡BARYONYX: ' + distToRope + ' M!</span>';
                dangerBox.className = 'danger';
            } else {
                dangerBox.innerHTML = '⚠️ <span class="cb-danger-short">' + distToRope + 'M</span><span class="cb-danger-long">BARYONYX: ' + distToRope + ' M</span>';
                dangerBox.className = '';
            }
        }
    }


    function togglePause() {
        if (state !== 'playing') return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('cb-pause-btn');
        var pauseScreen = document.getElementById('cb-pause-screen');
        if (isPaused) {
            if (sndMusic) try { sndMusic.pause(); } catch(e){}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndMusic && !isMuted) try { sndMusic.play().catch(function(){}); } catch(e){}
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

    function gameLoop(now) {
        if (state !== 'playing') return;
        if (isPaused) {
            lastTime = now;
            aniFrame = requestAnimationFrame(gameLoop);
            return;
        }
        var dt = Math.min(0.06, (now - lastTime) / 1000);
        lastTime = now;

        update(dt);
        render();

        aniFrame = requestAnimationFrame(gameLoop);
    }

    // ============================================================
    //  ACTUALIZACIÓN FÍSICA
    // ============================================================
    function update(dt) {
        // 1. Resbalamiento activo y caídas por cuerda resbalosa
        if (antony.climbOffset > 0) {
            antony.climbOffset = Math.max(0, antony.climbOffset - slipSpeed * dt);
        }

        // Riesgo de resbalón súbito si Antony está subiendo
        if (antony.climbOffset > 35) {
            slipTimer += dt;
            if (slipTimer >= nextSlipTime) {
                slipTimer = 0;
                nextSlipTime = 3.2 + Math.random() * 2.8;
                slipAlertAmount = Math.round(28 + Math.random() * 20); // pierde altura
                antony.climbOffset = Math.max(0, antony.climbOffset - slipAlertAmount);
                slipAlertTimer = 1.4;
                antony.swayAngle += (Math.random() > 0.5 ? 1 : -1) * 0.08;
                playSlipSound();
            }
        }
        if (slipAlertTimer > 0) slipAlertTimer -= dt;

        // Progreso porcentual
        climbProgress = (antony.climbOffset / maxClimbDistance) * 100;
        updateHUD();

        // 2. Condición de victoria: alcanzar la parte alta de la cuerda y salir
        if (climbProgress >= 95) {
            triggerWin();
            return;
        }

        // 3. Oscilación de la cuerda (mientras más sube, más se agita)
        // Amplitud aumenta con la altura
        var dynamicAmp = 0.012 + (climbProgress / 100) * 0.045; // 0.012 a 0.057 rad (~3.3 grados)
        var dynamicFreq = 4.0 + (climbProgress / 100) * 3.5;
        antony.swayAngle = Math.sin(performance.now() * 0.001 * dynamicFreq) * dynamicAmp;

        // 4. Avance del Baryonyx
        // "mientras más esté arriba el Baryonyx avanza más rápido"
        var dynamicSpeed = bary.baseSpeed + (climbProgress / 100) * 85;
        bary.x += dynamicSpeed * dt;

        // 5. Alternancia de pasos (Paso 1 y Paso 2) y ciclo de sonidos
        bary.stepInterval = Math.max(0.24, 0.44 - (climbProgress / 100) * 0.18);
        bary.stepTimer += dt;

        if (bary.stepTimer >= bary.stepInterval) {
            bary.stepTimer = 0;
            if (bary.currentStep === 'paso1') {
                bary.currentStep = 'paso2';
                bary.paso2Count++;

                // Secuencia de audio solicitada:
                // Paso 2 (1º): emite un ruido / gruñido
                // Paso 2 (2º): se queda callado
                // Paso 2 (3º): vuelve a activar el sonido de Baryonyx Rugido
                var mod = bary.paso2Count % 3;
                if (mod === 1) {
                    playBaryonyxGrowl();
                } else if (mod === 2) {
                    // Callado
                } else if (mod === 0) {
                    playBaryonyxRoar(0.9);
                }
            } else {
                bary.currentStep = 'paso1';
            }
        }

        // 6. Condición de encuentro en la cuerda
        // El Baryonyx llega al punto de la cuerda (bary.targetX)
        if (bary.x >= bary.targetX) {
            if (climbProgress < 75) {
                // Antony no subió lo suficiente: es alcanzado por el Baryonyx
                triggerLose();
            } else {
                // Antony trepó a salvo: el Baryonyx muerde el aire por debajo y Antony escapa
                triggerWin();
            }
            return;
        }
    }

    function triggerWin() {
        state = 'won';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        render();
        showModal('cb-win-screen');
    }

    function triggerLose() {
        state = 'lost';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        playBaryonyxRoar(1.0);
        render();
        showModal('cb-lose-screen');
    }

    // ============================================================
    //  RENDERIZADO EN CANVAS
    // ============================================================
    function render() {
        if (!ctx || !canvas) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ========================================================
        // 1. FONDO DE LA CUEVA
        // ========================================================
        var bgImg = getImage('Baryonyx Cueva Fondo.png');
        if (!bgImg.complete || !bgImg.naturalWidth) {
            bgImg = getImage('Baryonyx Cueva Fondo.jpg');
        }

        if (bgImg.complete && bgImg.naturalWidth) {
            ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
        } else {
            ctx.fillStyle = '#0a1a14';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // ========================================================
        // 2. CASO DERROTA: MOSTRAR IMAGEN DE PERDISTE
        // ========================================================
        if (state === 'lost') {
            var perdisteImg = getImage('Perdiste_Baryonyx.png');
            if (perdisteImg.complete && perdisteImg.naturalWidth) {
                // Dibujar en el lugar del ataque
                var pw = bary.w * scale;
                var ph = bary.h * scale;
                var px = (bary.targetX - 180) * scale;
                var py = bary.by * scale;
                ctx.save();
                ctx.shadowColor = '#e74c3c';
                ctx.shadowBlur = 35 * scale;
                ctx.drawImage(perdisteImg, px, py, pw, ph);
                ctx.restore();
            }
            ctx.restore();
            return;
        }

        // ========================================================
        // 3. BARYONYX (PASO 1 / PASO 2)
        // ========================================================
        var baryFile = (bary.currentStep === 'paso1') ? 'Paso 1.png' : 'Paso 2.png';
        var baryImg = getImage(baryFile);
        if (baryImg.complete && baryImg.naturalWidth) {
            var bx = bary.x * scale;
            var by = bary.by * scale;
            var bw = bary.w * scale;
            var bh = bary.h * scale;

            ctx.save();
            ctx.drawImage(baryImg, bx, by, bw, bh);
            ctx.restore();
        }

        // ========================================================
        // 4. ANTONY BENTON Y LA CUERDA
        // ========================================================
        var antImg = getImage('Antony.png');
        if (antImg.complete && antImg.naturalWidth) {
            var aw = antony.w * scale;
            var ah = antony.h * scale;

            // Punto de anclaje de la cuerda en el techo de la cueva
            var ropeAnchorX = (antony.baseX + antony.w / 2 - 12) * scale;
            var ropeAnchorY = 0;

            ctx.save();
            // Rotar alrededor del anclaje superior de la cuerda para simular la oscilación
            ctx.translate(ropeAnchorX, ropeAnchorY);
            ctx.rotate(antony.swayAngle);

            // Posición vertical con la elevación de escalada
            var drawX = -aw / 2;
            var drawY = (antony.baseY - antony.climbOffset) * scale;

            if (slipAlertTimer > 0) {
                // Parpadeo de alerta en rojo al resbalar
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 18 * scale;
            }
            ctx.drawImage(antImg, drawX, drawY, aw, ah);

            if (slipAlertTimer > 0) {
                ctx.save();
                ctx.font = 'bold ' + Math.round(14 * scale) + 'px Orbitron, sans-serif';
                ctx.fillStyle = '#ff4757';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 6;
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ ¡RESBALÓN! -' + slipAlertAmount + 'm', drawX + aw/2, drawY - 12 * scale);
                ctx.restore();
            }
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  CONTROL DE APERTURA Y CIERRE
    // ============================================================
    function openGame() {
        var ov = document.getElementById('cb-overlay');
        if (!ov) return;
        ov.classList.add('open');

        if (typeof window.interruptBgMusic === 'function') {
            window.interruptBgMusic();
        }

        if (!ctx) ctx = canvas.getContext('2d');
        resize();

        state = 'briefing';
        showModal('cb-brief-screen');
        updateCbFullscreenUI();

        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function(){});
        }
    }

    function closeGame() {
        if (isPaused) togglePause();
        var pScreen = document.getElementById('cb-pause-screen');
        if (pScreen) {
            pScreen.style.display = 'none';
            pScreen.classList.remove('active');
        }
        var ov = document.getElementById('cb-overlay');
        if (ov) ov.classList.remove('open');
        stopAllAudio();
        state = 'idle';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        showModal(null);

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
    window.openCuevaBaryonyx = openGame;

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        buildOverlay();
        preloadAll();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('cb-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
