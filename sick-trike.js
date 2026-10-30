// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡CURA AL TRICERATOPS! (SICK TRIKE)
//  Minijuego: Encuentra el medicamento en el excremento del
//  Triceratops antes de recoger 3 Lilas de Persia mortales.
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('sick-trike-fab')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×670) ----
    var LW = 1200, LH = 670;
    var TOTAL_DOTS  = 8;
    var MAX_STRIKES = 3;

    // Dimensiones de la montaña de excremento (al frente, derecha)
    var POOP_X = 580, POOP_Y = 250, POOP_W = 580, POOP_H = 430;
    // Zona donde se dispersan los 8 puntos verdes (estrictamente DENTRO de la silueta de la popó)
    var POOP_CX = 870, POOP_CY = 480, POOP_RX = 130, POOP_RY = 80;

    // Dimensiones del Triceratops enfermo (DETRÁS de la popó, izquierda-centro, GRANDE según referencia)
    var TRIKE_SRC_X = 60, TRIKE_SRC_Y = 215, TRIKE_SRC_W = 1040, TRIKE_SRC_H = 470;
    var TRIKE_X = 20, TRIKE_Y = 145, TRIKE_W = 960, TRIKE_H = 434;

    // ---- ESTADO ----
    var state       = 'idle';  // idle | playing | revealed | won | lost
    var strikes     = 0;
    var clickOrder  = 0;
    var dots        = [];
    var dotTypes    = [];
    var revealTimer = null;
    var sickTimer   = null;
    var scale       = 1;
    var canvasW     = 0, canvasH = 0;
    var canvas, ctx;

    // ---- IMÁGENES ----
    var imgs = {
        bg:     new Image(),
        sick:   new Image(),
        poop:   new Image(),
        flower: new Image(),
        med:    new Image(),
        trike:  new Image()
    };

    // ---- AUDIO ----
    var sndMusic  = null;
    var sndSick   = null;
    var sndCurado = null;
    var isMuted   = false;
    var isPaused  = false;

    // ============================================================
    //  RESOLUCIÓN DE ARCHIVOS (RAÍZ + CARPETA DE RESPALDO)
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudio(filename, loop, vol) {
        var primary  = resolveURI(filename);
        var fallback = 'Sick%20Trike/' + resolveURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function () {
            if (a.src.indexOf('Sick%20Trike') === -1 && a.src.indexOf('Sick Trike') === -1) {
                a.src = fallback;
            }
        });
        return a;
    }

    function loadImageWithFallback(img, filename, onDone) {
        var primary  = resolveURI(filename);
        var fallback = 'Sick%20Trike/' + resolveURI(filename);
        var finished = false;
        function markDone() {
            if (!finished) { finished = true; if (onDone) onDone(); }
        }
        img.onload  = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Sick%20Trike') === -1 && img.src.indexOf('Sick Trike') === -1) {
                img.src = fallback;
            } else {
                console.warn('[SickTrike] No se pudo cargar:', filename);
                markDone();
            }
        };
        img.src = primary;
    }

    function loadAllImages(cb) {
        var count = 0, total = Object.keys(imgs).length;
        function done() { if (++count >= total) { if (cb) cb(); } }
        loadImageWithFallback(imgs.bg,     'Remove_grass_in_video_game_2K_20261022151005.jpg', done);
        loadImageWithFallback(imgs.sick,   'Sick Trike Model.png',  done);
        loadImageWithFallback(imgs.poop,   'Poop Model.png',        done);
        loadImageWithFallback(imgs.flower, 'Flower Model.png',      done);
        loadImageWithFallback(imgs.med,    'Medicine Model.png',    done);
        loadImageWithFallback(imgs.trike,  'Trike Model.png',       done);
    }

    function initAudio() {
        sndMusic  = createAudio('Trike Music.mp4', true,  0.45);
        sndSick   = createAudio('sick.mp4',        false, 0.9);
        sndCurado = createAudio('Curado.mp4',      false, 1.0);
    }

    function playAudio(snd) {
        if (!snd) return;
        try { snd.currentTime = 0; snd.play().catch(function () {}); } catch (e) {}
    }

    function stopAllAudio() {
        [sndMusic, sndSick, sndCurado].forEach(function (s) {
            if (s) { try { s.pause(); s.currentTime = 0; } catch (e) {} }
        });
    }

    // ============================================================
    //  GENERACIÓN DE PUNTOS VERDES (DISTRIBUCIÓN EN LA POPÓ)
    // ============================================================
    function generateDots() {
        dots       = [];
        dotTypes   = [];
        clickOrder = 0;

        // Probabilidades según especificación:
        // 1er intento: SIEMPRE Flor (Lila de Persia)
        // 2do intento: Rara vez Medicamento (~7%), normalmente Flor
        // 3er intento en adelante: 22% de probabilidad de Medicamento cada uno
        // Dificultad reducida (mayor probabilidad de hallar la medicina):
        // 1er intento: 40% Medicamento, 60% Flor
        // 2do intento: 75% Medicamento, 25% Flor
        // 3er intento en adelante: 100% Medicamento garantizado
        dotTypes[0] = (Math.random() < 0.40) ? 'medicine' : 'flower';
        dotTypes[1] = (Math.random() < 0.75) ? 'medicine' : 'flower';
        for (var j = 2; j < TOTAL_DOTS; j++) {
            dotTypes[j] = 'medicine';
        }

        // Posiciones dentro de la montaña de excremento
        var positions = [];
        var attempts  = 0;
        while (positions.length < TOTAL_DOTS && attempts < 900) {
            attempts++;
            var angle = Math.random() * Math.PI * 2;
            var r     = Math.sqrt(Math.random());
            var x     = Math.round(POOP_CX + r * Math.cos(angle) * POOP_RX);
            var y     = Math.round(POOP_CY + r * Math.sin(angle) * POOP_RY);

            var ok = true;
            for (var i = 0; i < positions.length; i++) {
                var dx = positions[i].x - x, dy = positions[i].y - y;
                if (Math.sqrt(dx * dx + dy * dy) < 52) { ok = false; break; }
            }
            if (!ok) continue;
            positions.push({ x: x, y: y });
        }

        // Barajar posiciones para que el orden visual sea aleatorio
        for (var k = positions.length - 1; k > 0; k--) {
            var ri = Math.floor(Math.random() * (k + 1));
            var tmp = positions[k]; positions[k] = positions[ri]; positions[ri] = tmp;
        }

        for (var m = 0; m < positions.length; m++) {
            dots.push({ x: positions[m].x, y: positions[m].y, used: false });
        }
    }

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('sick-trike-style')) return;
        var s = document.createElement('style');
        s.id = 'sick-trike-style';
        s.textContent = [
            '/* --- BOTÓN FLOTANTE FAB (VERDE / CLÍNICA INGEN) --- */',
            '#sick-trike-fab {',
            '    position: fixed;',
            '    bottom: 300px; right: 28px;',
            '    left: auto;',
            '    z-index: 99990;',
            '    display: flex; align-items: center; gap: 0.55rem;',
            '    padding: 0.65rem 1.3rem 0.65rem 0.9rem;',
            '    background: rgba(4, 24, 12, 0.92);',
            '    border: 2px solid #2ecc71; border-radius: 50px;',
            '    cursor: pointer; user-select: none;',
            '    color: #2ecc71;',
            "    font-family: 'Orbitron','Share Tech Mono',monospace;",
            '    font-size: 0.78rem; font-weight: 700;',
            '    letter-spacing: 1.5px; text-transform: uppercase;',
            '    box-shadow: 0 0 22px rgba(46,204,113,.45), 0 4px 16px rgba(0,0,0,.6);',
            '    backdrop-filter: blur(8px);',
            '    transition: all .22s ease;',
            '    animation: st-fab-pulse 2.8s ease-in-out infinite;',
            '}',
            '#sick-trike-fab:hover {',
            '    background: rgba(46,204,113,.22);',
            '    box-shadow: 0 0 44px rgba(46,204,113,.75), 0 4px 20px rgba(0,0,0,.7);',
            '    transform: scale(1.07) translateY(-2px);',
            '    color: #a8ff3e;',
            '}',
            '#sick-trike-fab img {',
            '    width: 44px; height: auto; max-height: 32px;',
            '    object-fit: contain;',
            '    filter: drop-shadow(0 0 6px rgba(46,204,113,.7));',
            '    pointer-events: none;',
            '}',
            '.st-fab-title { display:block; font-size:.78rem; }',
            ".st-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#a8ff3e; letter-spacing:1px; opacity:.85; }",
            '@keyframes st-fab-pulse {',
            '    0%,100%{ box-shadow:0 0 22px rgba(46,204,113,.45),0 4px 16px rgba(0,0,0,.6); }',
            '    50%    { box-shadow:0 0 44px rgba(46,204,113,.75),0 4px 20px rgba(0,0,0,.7); }',
            '}',
            '',
            '/* --- OVERLAY PANTALLA COMPLETA --- */',
            '#sick-trike-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: #000;',
            '    display: none; flex-direction: column;',
            '    user-select: none;',
            '}',
            '#sick-trike-overlay.open { display: flex; }',
            '',
            '/* Header */',
            '#st-header {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.2rem;',
            '    background: rgba(3, 14, 8, .92);',
            '    border-bottom: 2px solid #2ecc71;',
            '    backdrop-filter: blur(4px);',
            '    z-index: 10;',
            '    gap: 1rem;',
            '}',
            '#st-header-left { display: flex; align-items: center; gap: .8rem; }',
            '#st-header-title {',
            "    font-family:'Orbitron',monospace; font-size:.9rem; font-weight:900;",
            '    color:#2ecc71; letter-spacing:2px; text-transform:uppercase;',
            '}',
            '#st-header-tracker {',
            "    font-family: 'Share Tech Mono', monospace; font-size: .8rem; font-weight: 700;",
            '    padding: .25rem .75rem; border-radius: 4px; letter-spacing: 1px;',
            '    border: 1px solid rgba(46,204,113,.4); color: #2ecc71; background: rgba(46,204,113,.12);',
            '}',
            '#st-header-tracker.danger {',
            '    border-color: #e74c3c; color: #ff7675; background: rgba(231,76,60,.25);',
            '}',
            '#st-header-strikes {',
            '    display: flex; align-items: center; gap: .4rem;',
            "    font-family:'Share Tech Mono',monospace; font-size:.78rem; color:#aaa;",
            '}',
            '.st-flower-slot { display:inline-flex; align-items:center; }',
            '.st-flower-slot img {',
            '    width: 22px; height: 22px; object-fit: contain;',
            '    transition: filter .3s, opacity .3s;',
            '}',
            '.st-flower-slot img.empty  { filter: grayscale(1); opacity: .22; }',
            '.st-flower-slot img.filled { filter: drop-shadow(0 0 5px #f80); opacity: 1; }',
            '#st-strikes-label {',
            "    font-family:'Share Tech Mono',monospace; font-size:.75rem;",
            '    color:#aaa; margin-left:.4rem; white-space:nowrap;',
            '}',
            '',
            '#st-close-btn {',
            '    background:transparent; border:1px solid rgba(46,204,113,.4); color:#2ecc71;',
            "    font-family:'Share Tech Mono',monospace; font-size:.75rem;",
            '    padding:.35rem .9rem; border-radius:3px; cursor:pointer;',
            '    letter-spacing:1px; transition:all .2s;',
            '}',
            '#st-close-btn:hover { background:rgba(46,204,113,.2); color:#fff; border-color:#2ecc71; }',
            '#st-fullscreen-btn { background:rgba(46,204,113,.15); border:1px solid rgba(46,204,113,.4); color:#2ecc71; font-family:\'Share Tech Mono\',monospace; font-size:.75rem; padding:.35rem .85rem; border-radius:3px; cursor:pointer; letter-spacing:1px; transition:all .2s; }',
            '#st-fullscreen-btn:hover { background:#2ecc71; color:#020b06; }',
            '',
            '/* Canvas wrap y stage */',
            '#st-canvas-wrap {',
            '    flex: 1;',
            '    position: relative;',
            '    display: flex; align-items: center; justify-content: center;',
            '    overflow: hidden;',
            '    background: #020603;',
            '}',
            '#st-canvas-stage {',
            '    position: relative;',
            '    overflow: hidden;',
            '    box-shadow: 0 0 35px rgba(0,0,0,.85);',
            '}',
            '#st-canvas { display: block; touch-action: none; }',
            '',
            '/* Status bar inferior */',
            '#st-status-bar {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.4rem;',
            '    background: rgba(3, 14, 8, .94);',
            '    border-top: 1px solid rgba(46, 204, 113, .35);',
            "    font-family:'Share Tech Mono',monospace; font-size:.82rem;",
            '    backdrop-filter: blur(4px); z-index:10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#st-mission-text {',
            "    color: #2ecc71; font-family:'Share Tech Mono',monospace; font-size:.82rem; font-weight:700;",
            '    letter-spacing: 1px;',
            '}',
            '#st-counter-text { color: #888; font-size:.8rem; }',
            '',
            '/* --- PANTALLAS MODALES (IDÉNTICAS A CLÍNICA / DILOPHOSAURUS) --- */',
            '.st-screen {',
            '    position: absolute; inset: 0; z-index: 25;',
            '    display: none; flex-direction: column;',
            '    align-items: center; justify-content: center;',
            '    text-align: center;',
            '    background: rgba(2, 6, 4, .88);',
            '    backdrop-filter: blur(8px);',
            "    font-family: 'Share Tech Mono',monospace;",
            '    padding: 1.2rem;',
            '    box-sizing: border-box;',
            '}',
            '.st-screen.show { display: flex; animation: st-pop .3s ease-out; }',
            '@keyframes st-pop {',
            '    from { opacity: 0; transform: scale(.95); }',
            '    to   { opacity: 1; transform: scale(1); }',
            '}',
            '.st-screen-title {',
            "    font-family:'Orbitron',monospace;",
            '    font-size: clamp(1.4rem, 4vw, 2.3rem);',
            '    font-weight: 900; letter-spacing: 3px; text-transform: uppercase;',
            '    margin-bottom: .5rem;',
            '}',
            '.st-screen-sub {',
            '    font-size: clamp(.75rem, 1.8vw, .95rem); color: #ccc;',
            '    margin-bottom: 1.6rem; max-width: 620px; line-height: 1.6;',
            '}',
            '.st-instruct {',
            '    display: flex; gap: 1.4rem; margin: .6rem 0 1.6rem;',
            '    flex-wrap: wrap; justify-content: center;',
            '    font-size: .78rem; color: #ddd;',
            '}',
            '.st-inst-item {',
            '    display:flex; flex-direction:column; align-items:center; gap:.3rem;',
            '    background:rgba(255,255,255,.05); border:1px solid rgba(46,204,113,.25);',
            '    border-radius:6px; padding:.65rem .85rem; min-width:115px;',
            '    box-sizing: border-box;',
            '}',
            '.st-inst-icon { font-size: 1.6rem; }',
            '',
            '/* BOTONES IDÉNTICOS A DILOPHOSAURUS / CLÍNICA */',
            '.st-btn {',
            "    font-family:'Orbitron',monospace; font-size:.85rem; font-weight:700;",
            '    letter-spacing:1.5px; text-transform:uppercase;',
            '    padding:.75rem 2.2rem; border-radius:4px; cursor:pointer;',
            '    transition:all .2s; border:none; margin:.3rem;',
            '    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;',
            '    width: auto; max-width: 320px; box-sizing: border-box; flex: 0 0 auto;',
            '}',
            '.st-btn-primary { background:#2ecc71; color:#031408; box-shadow:0 0 16px rgba(46,204,113,.5); }',
            '.st-btn-primary:hover { background:#a8ff3e; box-shadow:0 0 30px rgba(168,255,62,.75); transform:translateY(-2px); }',
            '.st-btn-secondary { background:transparent; border:1px solid #2ecc71; color:#2ecc71; }',
            '.st-btn-secondary:hover { background:rgba(46,204,113,.15); }',
            '.st-btn-danger { background:transparent; border:1px solid #e74c3c; color:#e74c3c; }',
            '.st-btn-danger:hover { background:rgba(231,76,60,.15); }',
            '',
            '/* Reveal popup */',
            '#st-reveal {',
            '    position: absolute; inset: 0; z-index: 30;',
            '    display: none; flex-direction: column;',
            '    align-items: center; justify-content: center;',
            '    background: rgba(0,0,0,.84);',
            '    backdrop-filter: blur(6px);',
            '}',
            '#st-reveal.show { display: flex; animation: st-pop .25s ease-out; }',
            '#st-reveal-img {',
            '    max-width: 260px; max-height: 260px;',
            '    object-fit: contain;',
            '    filter: drop-shadow(0 0 28px rgba(255,255,255,.25));',
            '    border-radius: 12px;',
            '}',
            '#st-reveal-title {',
            '    margin-top: 16px;',
            "    font-family:'Orbitron',monospace; font-size:1.1rem; font-weight:900;",
            '    letter-spacing:2px; text-transform:uppercase;',
            '}',
            '#st-reveal-sub {',
            '    margin-top: 6px;',
            "    font-family:'Share Tech Mono',monospace; font-size:.8rem; color:#bbb;",
            '}',
            '',
            '/* Puntos verdes en la popó */',
            '.st-dot {',
            '    position: absolute;',
            '    width: 22px; height: 22px; border-radius: 50%;',
            '    background: radial-gradient(circle, #cfffcf 25%, #2ecc71 70%);',
            '    box-shadow: 0 0 10px #2ecc71, 0 0 22px rgba(46,204,113,.6);',
            '    cursor: pointer;',
            '    transform: translate(-50%, -50%);',
            '    animation: st-dot-pulse 1.3s ease-in-out infinite;',
            '    transition: opacity .3s, transform .2s;',
            '    pointer-events: auto;',
            '}',
            '.st-dot:hover { transform: translate(-50%,-50%) scale(1.4); box-shadow: 0 0 18px #2ecc71, 0 0 36px rgba(46,204,113,.9); }',
            '@keyframes st-dot-pulse {',
            '    0%,100%{ box-shadow:0 0 8px #2ecc71,0 0 16px rgba(46,204,113,.4); }',
            '    50%    { box-shadow:0 0 18px #2ecc71,0 0 34px rgba(46,204,113,.8); }',
            '}',
            '',
            '/* Fila de flores en derrota */',
            '.st-flower-row {',
            '    display: flex; gap: 12px; align-items: center; justify-content: center;',
            '    margin: 1rem 0;',
            '}',
            '.st-flower-row img {',
            '    width: 64px; height: 64px; object-fit: contain;',
            '    filter: drop-shadow(0 0 8px #f80);',
            '}',
            '/* Trike curado en victoria */',
            '.st-trike-win {',
            '    width: 170px; height: 170px; object-fit: contain;',
            '    filter: drop-shadow(0 0 22px #2ecc71);',
            '    margin: 1rem 0;',
            '}',
            '',
            '/* Responsive móvil */',
            '@media (max-width: 600px) {',
            '    #sick-trike-fab { bottom: 180px; right: 16px; padding: .5rem .9rem .5rem .65rem; }',
            '    #sick-trike-fab img { width: 36px; max-height: 26px; }',
            '    .st-fab-title { font-size:.65rem; }',
            '    .st-fab-sub   { display:none; }',
            '    #st-status-bar { font-size:.68rem; padding:.35rem .6rem; }',
            '    #st-header { padding:.35rem .6rem; }',
            '    #st-header-title { font-size:.72rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'sick-trike-overlay';

        // ---- HEADER ----
        var header = document.createElement('div');
        header.id  = 'st-header';

        var headerLeft = document.createElement('div');
        headerLeft.id  = 'st-header-left';

        var title = document.createElement('div');
        title.id   = 'st-header-title';
        title.textContent = '🩺 INGEN VETERINARIA — ¡CURA AL TRICERATOPS!';

        var tracker = document.createElement('div');
        tracker.id = 'st-header-tracker';
        tracker.textContent = '🌿 BUSCANDO MEDICAMENTO';

        headerLeft.appendChild(title);
        headerLeft.appendChild(tracker);

        var headerRight = document.createElement('div');
        headerRight.style.cssText = 'display:flex;align-items:center;gap:.7rem;';

        var strikesBox = document.createElement('div');
        strikesBox.id  = 'st-header-strikes';

        for (var fi = 1; fi <= 3; fi++) {
            var slot = document.createElement('span');
            slot.id  = 'st-fslot-' + fi;
            slot.className = 'st-flower-slot';
            var fImg = new Image();
            fImg.id  = 'st-fimg-' + fi;
            fImg.className = 'empty';
            fImg.alt = 'Lila';
            loadImageWithFallback(fImg, 'Flower Model.png', function () {});
            slot.appendChild(fImg);
            strikesBox.appendChild(slot);
        }

        var strikesLabel = document.createElement('span');
        strikesLabel.id  = 'st-strikes-label';
        strikesLabel.textContent = 'LILAS: 0/3';
        strikesBox.appendChild(strikesLabel);

        headerRight.className = 'ej-header-actions';

        var muteBtn = document.createElement('button');
        muteBtn.id = 'st-mute-btn';
        muteBtn.className = 'ej-btn-header';
        muteBtn.innerHTML = '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
        muteBtn.addEventListener('click', function () {
            isMuted = !isMuted;
            muteBtn.innerHTML = isMuted ? '<span class="ej-ic">🔇</span><span class="ej-btn-lbl"> SILENCIADO</span>' : '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
            if (sndMusic) sndMusic.muted = isMuted;
            if (sndSick) sndSick.muted = isMuted;
            if (sndCurado) sndCurado.muted = isMuted;
        });

    var isPaused = false;

    function togglePause() {
        if (state !== 'playing' && state !== 'revealed') return;
        isPaused = !isPaused;
        var pScreen = document.getElementById('st-pause-screen');
        var pBtn = document.getElementById('st-pause-btn');
        if (isPaused) {
            if (pScreen) {
                pScreen.style.display = 'flex';
                pScreen.classList.add('active');
            }
            if (pBtn) pBtn.innerHTML = '<span class="ej-ic">▶</span><span class="ej-btn-lbl"> REANUDAR</span>';
            if (sndMusic) sndMusic.pause();
            if (sndSick) sndSick.pause();
        } else {
            if (pScreen) {
                pScreen.style.display = 'none';
                pScreen.classList.remove('active');
            }
            if (pBtn) pBtn.innerHTML = '<span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span>';
            if (sndMusic && !isMuted) sndMusic.play().catch(function () {});
            drawScene();
        }
    }

        var pauseBtn = document.createElement('button');
        pauseBtn.id = 'st-pause-btn';
        pauseBtn.className = 'ej-btn-header';
        pauseBtn.innerHTML = '<span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span>';
        pauseBtn.addEventListener('click', togglePause);

        var fullBtn = document.createElement('button');
        fullBtn.id  = 'st-fullscreen-btn';
        fullBtn.className = 'ej-btn-header';
        fullBtn.innerHTML = '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('sick-trike-overlay') || document.documentElement;
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        });

        var closeBtn = document.createElement('button');
        closeBtn.id  = 'st-close-btn';
        closeBtn.className = 'ej-btn-header ej-btn-header-danger';
        closeBtn.innerHTML = '<span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span>';
        closeBtn.addEventListener('click', closeGame);

        headerRight.appendChild(strikesBox);
        headerRight.appendChild(muteBtn);
        headerRight.appendChild(pauseBtn);
        headerRight.appendChild(fullBtn);
        headerRight.appendChild(closeBtn);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);
        ov.appendChild(header);

        // ---- CANVAS WRAP Y STAGE CENTRADO ----
        var wrap = document.createElement('div');
        wrap.id  = 'st-canvas-wrap';

        var stage = document.createElement('div');
        stage.id = 'st-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'st-canvas';
        stage.appendChild(canvas);

        // Reveal popup
        var reveal = document.createElement('div');
        reveal.id = 'st-reveal';
        var rImg = document.createElement('img');
        rImg.id  = 'st-reveal-img'; rImg.alt = '';
        var rTitle = document.createElement('div');
        rTitle.id  = 'st-reveal-title';
        var rSub   = document.createElement('div');
        rSub.id    = 'st-reveal-sub';
        reveal.appendChild(rImg);
        reveal.appendChild(rTitle);
        reveal.appendChild(rSub);
        stage.appendChild(reveal);

        // ---- PANTALLA INICIO (MISMO DISEÑO EXACTO QUE CLÍNICA) ----
        var startScreen = document.createElement('div');
        startScreen.id  = 'st-start-screen';
        startScreen.className = 'st-screen show';

        var sTitle = document.createElement('div');
        sTitle.className = 'st-screen-title';
        sTitle.style.color = '#2ecc71';
        sTitle.textContent = '🩺 ¡CURA AL TRICERATOPS!';

        var sSub = document.createElement('div');
        sSub.className = 'st-screen-sub';
        sSub.innerHTML = 'Jackson necesita tu ayuda urgente. El <strong>Triceratops</strong> está gravemente enfermo por intoxicación.<br>' +
            'El único medicamento está oculto en la enorme montaña de su <strong style="color:#2ecc71;">excremento</strong>.<br><br>' +
            '⚠️ <strong>ATENCIÓN:</strong> Toca los <strong style="color:#2ecc71;">puntos verdes</strong> para examinar el interior de la popó.<br>' +
            '<strong style="color:#f1c40f;">¡Encuentra el medicamento antes de recoger 3 Lilas de Persia!</strong><br>' +
            'Cada Lila que toques acelerará el envenenamiento del dinosaurio.<br>' +
            '<em>Si juntas 3 Lilas, el Triceratops morirá. ¡Salva a la criatura!</em>';

        var instruct = document.createElement('div');
        instruct.className = 'st-instruct';

        var cards = [
            { icon: '🟢', label: 'Puntos Verdes', desc: 'TOCA Y BUSCA' },
            { icon: '💊', label: 'Medicamento =', desc: '¡CURA AL TRIKE!' },
            { icon: '🌸', label: 'Lilas de Persia =', desc: '¡VENENO MORTAL!' },
            { icon: '💔', label: 'Límite Fallos', desc: 'MÁXIMO 3 LILAS' }
        ];
        for (var ci = 0; ci < cards.length; ci++) {
            var card = document.createElement('div');
            card.className = 'st-inst-item';
            var iconEl = document.createElement('div');
            iconEl.className = 'st-inst-icon';
            iconEl.textContent = cards[ci].icon;
            var textWrap = document.createElement('div');
            textWrap.innerHTML = cards[ci].label + '<br><strong>' + cards[ci].desc + '</strong>';
            card.appendChild(iconEl);
            card.appendChild(textWrap);
            instruct.appendChild(card);
        }

        var startBtn = document.createElement('button');
        startBtn.className = 'st-btn st-btn-primary';
        startBtn.id = 'st-start-btn';
        startBtn.textContent = '▶ COMENZAR BÚSQUEDA';
        startBtn.addEventListener('click', startGame);

        startScreen.appendChild(sTitle);
        startScreen.appendChild(sSub);
        startScreen.appendChild(instruct);
        startScreen.appendChild(startBtn);
        stage.appendChild(startScreen);

        // ---- PANTALLA VICTORIA ----
        var winScreen = document.createElement('div');
        winScreen.id  = 'st-win-screen';
        winScreen.className = 'st-screen';

        var wTitle = document.createElement('div');
        wTitle.className = 'st-screen-title';
        wTitle.style.color = '#2ecc71';
        wTitle.textContent = '🎉 ¡TRICERATOPS CURADO!';

        var wImg = document.createElement('img');
        wImg.className = 'st-trike-win';
        wImg.id = 'st-win-trike-img'; wImg.alt = 'Trike sano';

        var wSub = document.createElement('div');
        wSub.className = 'st-screen-sub';
        wSub.innerHTML = '¡Jackson logró administrar el medicamento a tiempo!<br>' +
            'El Triceratops expulsó el veneno y se recuperó por completo. <strong style="color:#2ecc71;">¡Excelente trabajo veterinario!</strong>';

        var wBtns = document.createElement('div');
        wBtns.className = 'ej-modal-actions';
        var wRetry = document.createElement('button');
        wRetry.className = 'ej-btn-replay';
        wRetry.textContent = '↺ Volver a jugar';
        wRetry.addEventListener('click', function () { if (window.registerMinigameAttempt) window.registerMinigameAttempt('sick-trike'); showScreen(null); startGame(); });
        var wClose = document.createElement('button');
        wClose.className = 'ej-btn-return';
        wClose.textContent = '✕ Regresar al sitio';
        wClose.addEventListener('click', closeGame);
        wBtns.appendChild(wRetry); wBtns.appendChild(wClose);

        winScreen.appendChild(wTitle);
        winScreen.appendChild(wImg);
        winScreen.appendChild(wSub);
        winScreen.appendChild(wBtns);
        stage.appendChild(winScreen);

        // ---- PANTALLA DERROTA ----
        var loseScreen = document.createElement('div');
        loseScreen.id  = 'st-lose-screen';
        loseScreen.className = 'st-screen';

        var lTitle = document.createElement('div');
        lTitle.className = 'st-screen-title';
        lTitle.style.color = '#e74c3c';
        lTitle.textContent = '💔 EL TRICERATOPS NO SOBREVIVIÓ';

        var lFlowers = document.createElement('div');
        lFlowers.id = 'st-lose-flowers';
        lFlowers.className = 'st-flower-row';

        var lSub = document.createElement('div');
        lSub.className = 'st-screen-sub';
        lSub.innerHTML = 'Recogiste 3 Lilas de Persia seguidas...<br>' +
            'La dosis de toxinas superó la resistencia del animal.<br>' +
            'Jackson está consternado por la pérdida.';

        var lBtns = document.createElement('div');
        lBtns.className = 'ej-modal-actions';
        var lRetry = document.createElement('button');
        lRetry.className = 'ej-btn-replay';
        lRetry.textContent = '↺ Volver a jugar';
        lRetry.addEventListener('click', function () { if (window.registerMinigameAttempt) window.registerMinigameAttempt('sick-trike'); showScreen(null); startGame(); });
        var lClose = document.createElement('button');
        lClose.className = 'ej-btn-return';
        lClose.textContent = '✕ Regresar al sitio';
        lClose.addEventListener('click', closeGame);
        lBtns.appendChild(lRetry); lBtns.appendChild(lClose);

        loseScreen.appendChild(lTitle);
        loseScreen.appendChild(lFlowers);
        loseScreen.appendChild(lSub);
        loseScreen.appendChild(lBtns);
        stage.appendChild(loseScreen);

        var pauseModal = document.createElement('div');
        pauseModal.className = 'ej-pause-overlay';
        pauseModal.id = 'st-pause-screen';
        pauseModal.style.display = 'none';
        pauseModal.innerHTML = [
            '<div class="ej-pause-card">',
            '  <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>',
            '  <div class="ej-pause-sub">Tratamiento veterinario en pausa</div>',
            '  <button class="ej-btn-resume" id="st-btn-resume">▶ REANUDAR</button>',
            '</div>'
        ].join('');
        stage.appendChild(pauseModal);
        var stResume = pauseModal.querySelector('#st-btn-resume'); if (stResume) stResume.addEventListener('click', togglePause);


        wrap.appendChild(stage);
        ov.appendChild(wrap);

        // ---- STATUS BAR ----
        var statusBar = document.createElement('div');
        statusBar.id  = 'st-status-bar';
        var mission = document.createElement('div');
        mission.id   = 'st-mission-text';
        mission.textContent = '🌿 MISIÓN: Encuentra el medicamento dentro del excremento antes de que muera';
        var counter = document.createElement('div');
        counter.id   = 'st-counter-text';
        counter.textContent = 'Puntos restantes: 8 | Lilas: 0/3';
        statusBar.appendChild(mission);
        statusBar.appendChild(counter);
        ov.appendChild(statusBar);

        document.body.appendChild(ov);
        ctx = canvas.getContext('2d');
    }

    // ============================================================
    //  FAB — BOTÓN FLOTANTE
    // ============================================================
    function buildFAB() {
        var fab = document.createElement('div');
        fab.id  = 'sick-trike-fab';
        fab.title = '¡Cura al Triceratops!';

        var fabImg = document.createElement('img');
        fabImg.alt = 'Trike';
        loadImageWithFallback(fabImg, 'Sick Trike Model.png', function () {});

        var fabText = document.createElement('span');
        var fabTitle = document.createElement('span');
        fabTitle.className = 'st-fab-title';
        fabTitle.textContent = '¡CURA AL TRICERATOPS!';
        var fabSub = document.createElement('span');
        fabSub.className = 'st-fab-sub';
        fabSub.textContent = 'BUSCA EL MEDICAMENTO';
        fabText.appendChild(fabTitle);
        fabText.appendChild(fabSub);

        fab.appendChild(fabImg);
        fab.appendChild(fabText);
        fab.addEventListener('click', openGame);
        document.body.appendChild(fab);
    }

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('st-canvas-wrap');
        var stage = document.getElementById('st-canvas-stage');
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

        // Reposicionar los puntos verdes según la escala
        var dotEls = stage.querySelectorAll('.st-dot');
        for (var i = 0; i < dotEls.length; i++) {
            var idx = parseInt(dotEls[i].dataset.idx, 10);
            if (!isNaN(idx) && dots[idx] && !dots[idx].used) {
                dotEls[i].style.left = (dots[idx].x * scale) + 'px';
                dotEls[i].style.top  = (dots[idx].y * scale) + 'px';
            }
        }

        drawScene();
    }

    // ============================================================
    //  DIBUJO DE LA ESCENA
    // ============================================================
    function drawScene() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Fondo natural de pastizal/selva
        if (imgs.bg.complete && imgs.bg.naturalWidth) {
            ctx.drawImage(imgs.bg, 0, 0, canvasW, canvasH);
        } else {
            ctx.fillStyle = '#1b2c15';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // 2. Triceratops enfermo acostado — DETRÁS DE LA POPÓ Y MUCHO MÁS GRANDE (imagen de referencia)
        if (imgs.sick.complete && imgs.sick.naturalWidth) {
            ctx.drawImage(imgs.sick,
                TRIKE_SRC_X, TRIKE_SRC_Y, TRIKE_SRC_W, TRIKE_SRC_H,
                TRIKE_X * scale, TRIKE_Y * scale,
                TRIKE_W * scale, TRIKE_H * scale);
        }

        // 3. Montaña de excremento — DELANTE DEL TRICERATOPS (cubriendo su parte trasera)
        if (imgs.poop.complete && imgs.poop.naturalWidth) {
            ctx.drawImage(imgs.poop,
                POOP_X * scale, POOP_Y * scale,
                POOP_W * scale, POOP_H * scale);
        }
    }

    // ============================================================
    //  HUD (MARCADOR Y CONTADORES)
    // ============================================================
    function updateHUD() {
        for (var i = 1; i <= 3; i++) {
            var fImg = document.getElementById('st-fimg-' + i);
            if (fImg) {
                fImg.className = (i <= strikes) ? 'filled' : 'empty';
            }
        }
        var lbl = document.getElementById('st-strikes-label');
        if (lbl) lbl.textContent = 'LILAS: ' + strikes + '/3';

        var tracker = document.getElementById('st-header-tracker');
        if (tracker) {
            if (strikes >= 2) {
                tracker.className = 'danger';
                tracker.textContent = '⚠️ ¡PELIGRO: 2 LILAS ENCONTRADAS!';
            } else {
                tracker.className = 'normal';
                tracker.textContent = '🌿 BUSCANDO MEDICAMENTO';
            }
        }

        var remaining = 0;
        for (var j = 0; j < dots.length; j++) {
            if (!dots[j].used) remaining++;
        }
        var counter = document.getElementById('st-counter-text');
        if (counter) {
            counter.textContent = 'Puntos restantes: ' + remaining + ' | Lilas: ' + strikes + '/3';
        }
    }

    // ============================================================
    //  GESTIÓN DE PANTALLAS MODALES
    // ============================================================
    function showScreen(id) {
        var screens = ['st-start-screen', 'st-win-screen', 'st-lose-screen'];
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
    //  CREACIÓN Y REMOCIÓN DE PUNTOS VERDES EN EL DOM
    // ============================================================
    function placeDotElements() {
        var stage = document.getElementById('st-canvas-stage');
        if (!stage) return;
        for (var i = 0; i < dots.length; i++) {
            (function (dot, idx) {
                var el = document.createElement('div');
                el.className   = 'st-dot';
                el.dataset.idx = String(idx);
                el.style.left  = (dot.x * scale) + 'px';
                el.style.top   = (dot.y * scale) + 'px';
                el.title       = 'Examinar excremento';
                el.addEventListener('pointerdown', function (e) {
                    if (e.cancelable) e.preventDefault();
                    onDotClick(idx);
                });
                el.addEventListener('click', function (e) {
                    onDotClick(idx);
                });
                stage.appendChild(el);
            })(dots[i], i);
        }
    }

    function removeDotElements() {
        var stage = document.getElementById('st-canvas-stage');
        if (!stage) return;
        var dotEls = stage.querySelectorAll('.st-dot');
        for (var i = 0; i < dotEls.length; i++) {
            dotEls[i].parentNode.removeChild(dotEls[i]);
        }
    }

    // ============================================================
    //  LÓGICA DEL JUEGO
    // ============================================================
    function startGame() {
        // OCULTAR LA PANTALLA DE INICIO PARA PODER ENTRAR AL JUEGO
        showScreen(null);

        state      = 'playing';
        strikes    = 0;
        clickOrder = 0;

        generateDots();
        removeDotElements();
        drawScene();
        updateHUD();
        placeDotElements();

        // Audio de Triceratops enfermo sonando periódicamente cada 6 segundos
        clearInterval(sickTimer);
        playAudio(sndSick);
        sickTimer = setInterval(function () {
            if (state === 'playing' || state === 'revealed') {
                playAudio(sndSick);
            }
        }, 6000);
    }

    function onDotClick(idx) {
        if (state !== 'playing' || isPaused) return;
        var dot = dots[idx];
        if (!dot || dot.used) return;

        dot.used = true;
        state = 'revealed';

        // Animación de desaparición del punto verde tocado
        var stage = document.getElementById('st-canvas-stage');
        var dotEl = stage ? stage.querySelector('.st-dot[data-idx="' + idx + '"]') : null;
        if (dotEl) {
            dotEl.style.opacity   = '0';
            dotEl.style.transform = 'translate(-50%,-50%) scale(0)';
            setTimeout(function () {
                if (dotEl.parentNode) dotEl.parentNode.removeChild(dotEl);
            }, 300);
        }

        // Determinar qué objeto se encontró según el orden de intentos
        var resultType = dotTypes[clickOrder] || 'flower';
        clickOrder++;

        showReveal(resultType, function () {
            state = 'playing'; isPaused = false;
            if (resultType === 'flower') {
                strikes++;
                updateHUD();
                if (strikes >= MAX_STRIKES) {
                    triggerLose();
                }
            } else {
                triggerWin();
            }
        });
    }

    function showReveal(type, callback) {
        var popup  = document.getElementById('st-reveal');
        var rImg   = document.getElementById('st-reveal-img');
        var rTitle = document.getElementById('st-reveal-title');
        var rSub   = document.getElementById('st-reveal-sub');
        if (!popup) { if (callback) callback(); return; }

        if (type === 'medicine') {
            loadImageWithFallback(rImg, 'Medicine Model.png', function () {});
            rTitle.textContent = '💊 ¡MEDICAMENTO ENCONTRADO!';
            rTitle.style.color = '#2ecc71';
            rSub.textContent   = '¡El antídoto salvará la vida del Triceratops!';
        } else {
            loadImageWithFallback(rImg, 'Flower Model.png', function () {});
            // Enumeración correcta: 1/3, 2/3 o 3/3
            rTitle.textContent = '🌸 LILA DE PERSIA (' + (strikes + 1) + '/3)';
            rTitle.style.color = '#f39c12';
            rSub.textContent   = '¡Cuidado! Esta flor es tóxica para el dinosaurio.';
        }

        popup.classList.add('show');
        clearTimeout(revealTimer);
        revealTimer = setTimeout(function () {
            popup.classList.remove('show');
            if (callback) callback();
        }, 1800);
    }

    function triggerWin() {
        state = 'won';
        clearInterval(sickTimer);
        if (sndSick) { try { sndSick.pause(); } catch (e) {} }
        removeDotElements();

        var wImg = document.getElementById('st-win-trike-img');
        if (wImg) loadImageWithFallback(wImg, 'Trike Model.png', function () {});

        playAudio(sndCurado);
        showScreen('st-win-screen');
    }

    function triggerLose() {
        state = 'lost';
        clearInterval(sickTimer);
        if (sndSick) { try { sndSick.pause(); } catch (e) {} }
        removeDotElements();

        var row = document.getElementById('st-lose-flowers');
        if (row) {
            row.innerHTML = '';
            for (var i = 0; i < 3; i++) {
                var fi = new Image();
                fi.alt = 'Lila';
                loadImageWithFallback(fi, 'Flower Model.png', function () {});
                row.appendChild(fi);
            }
        }

        showScreen('st-lose-screen');
    }

    // ============================================================
    //  ABRIR / CERRAR MINIJUEGO
    // ============================================================
    function openGame() {
        var ov = document.getElementById('sick-trike-overlay');
        window.openSickTrike = openGame;
        if (!ov) return;
        ov.classList.add('open');
        state      = 'idle';
        strikes    = 0;
        clickOrder = 0;
        dots       = [];

        removeDotElements();
        showScreen('st-start-screen');

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
        if (isPaused) togglePause();
        var pScreen = document.getElementById('st-pause-screen');
        if (pScreen) {
            pScreen.style.display = 'none';
            pScreen.classList.remove('active');
        }
        var ov = document.getElementById('sick-trike-overlay');
        if (ov) ov.classList.remove('open');
        clearInterval(sickTimer);
        clearTimeout(revealTimer);
        stopAllAudio();
        state = 'idle';
        removeDotElements();
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
            var ov = document.getElementById('sick-trike-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    // Exponer función global para abrir desde la tarjeta de minijuegos
    window.openSickTrike = openGame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
