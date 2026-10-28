// ============================================================
//  EXPEDIENTES JURÁSICOS — SOBREVIVIR EN LA ISLA
//  MINIJUEGO: ¡IDENTIFICA LA ESPECIE!
//  Evaluación taxonómica para pasantía en el laboratorio de Isla Sorna
//  Dra. Kate Vanegas & Dr. Boris Wong
// ============================================================

(function () {
    'use strict';

    // Dimensiones virtuales
    var LW = 1200, LH = 670;

    // Catálogo de las 12 especies a evaluar
    var SPECIES_DATA = [
        { name: 'Hypsilophodon',   model: 'Hypsi Model.png',       bg: 'DinosFondo.jpg',       roar: 'Hypsilophodon roar.mp4' },
        { name: 'Edmontosaurus',   model: 'Edmonto Model.png',     bg: 'DinosFondo.jpg',       roar: 'Edmontosaurus roar.mp4' },
        { name: 'Deinosuchus',     model: 'Deino Model.png',       bg: 'DinosFondo.jpg',       roar: 'Deinosuchus roar.mp4' },
        { name: 'Chasmosaurus',    model: 'Chasmo Model.png',      bg: 'DinosFondo.jpg',       roar: 'Chasmosaurus roar.mp4' },
        { name: 'Allosaurus',      model: 'Allo Model.png',        bg: 'DinosFondo.jpg',       roar: 'Allosaurus roar.mp4' },
        { name: 'Acrocanthosaurus',model: 'Acro Model.png',        bg: 'DinosFondo.jpg',       roar: 'Acrocanthosaurus roar.mp4' },
        { name: 'Pachyrhinosaurus',model: 'Pachyrhino Model.png',  bg: 'DinosFondo.jpg',       roar: 'Pachyrhinosaurus roar.mp4' },
        { name: 'Baryonyx',        model: 'Baryonyx Model.png',    bg: 'Baryonyx Fondo.jpg',   roar: 'Baryonyx roar.mp4' },
        { name: 'Carnotaurus',     model: 'CarnoC Model.png',      bg: 'DinosFondo.jpg',       roar: 'Carnotaurus Camaleon roar.mp4' },
        { name: 'T Rex',           model: 'Rex Alpha Model.png',   bg: 'DinosFondo.jpg',       roar: 'T Rex Roar.mp4' },
        { name: 'Mamenchisaurus',  model: 'Mamenchi Model.png',    bg: 'MamenchiFondo.jpg',    roar: 'Mamenchisaurus roar.mp4' },
        { name: 'Stegosaurus',     model: 'Stego Model.png',       bg: 'DinosFondo.jpg',       roar: 'Stegosaurus Roar.mp4' }
    ];

    // Modelos de jaulas rotativas
    var CAGE_FILES = [
        'Jaula1.png',
        'Jaula 2.png',
        'Jaula 3.png',
        'Jaula 4.png',
        'Jaula 5.png',
        'Jaula 6.png'
    ];

    // Diálogo inicial (Kate y Boris)
    var INTRO_DIALOGUE = [
        {
            speaker: 'DRA. KATE VANEGAS',
            char: 'kate',
            text: '¡Buenas tardes, Doctor Boris Wong! Soy la Dra. Kate Vanegas. He viajado a Isla Sorna con la firme convicción de postularme como pasante en su prestigioso laboratorio genético.'
        },
        {
            speaker: 'DR. BORIS WONG',
            char: 'boris',
            text: 'Bienvenida, Dra. Vanegas. Pero en InGen no aceptamos a cualquiera. Trabajamos con especímenes clonados de altísimo riesgo biológico y extrema complejidad taxonómica.'
        },
        {
            speaker: 'DRA. KATE VANEGAS',
            char: 'kate',
            text: 'Comprendo el nivel de exigencia, Doctor. Conozco cada espécimen prehistórico clasificado en los expedientes de InGen Corporation.'
        },
        {
            speaker: 'DR. BORIS WONG',
            char: 'boris',
            text: 'Eso lo comprobaremos ahora mismo. Tenemos 12 especies retenidas en jaulas de máxima contención. Si logras identificar a cada una de ellas a través de los barrotes, la pasantía será tuya. Con 3 errores quedarás descartada.'
        },
        {
            speaker: 'DRA. KATE VANEGAS',
            char: 'kate',
            text: '¡Acepto el desafío, Doctor! Estoy lista para iniciar la evaluación taxonómica.'
        }
    ];

    // Estado del juego
    var state = 'idle'; // idle | intro | playing | round_success | won | lost
    var dialogueIdx = 0;
    var quizSpecies = [];
    var currentRound = 0;
    var strikes = 0;
    var maxStrikes = 3;
    var showCage = true;

    // Canvas y responsive
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;
    var aniFrame = null;

    // Caché de imágenes y audios
    var imagesCache = {};
    var sndMusic = null;
    var currentRoar = null;

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('identifica-especie-styles')) return;
        var style = document.createElement('style');
        style.id = 'identifica-especie-styles';
        style.textContent = [
            '#ide-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: rgba(2, 6, 4, 0.98); backdrop-filter: blur(8px);',
            '    display: none; flex-direction: column;',
            '    font-family: "Share Tech Mono", monospace; color: #fff;',
            '    user-select: none;',
            '}',
            '#ide-overlay.open { display: flex; animation: ide-fade-in 0.25s ease-out; }',
            '@keyframes ide-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '',
            '/* Header de control */',
            '#ide-header {',
            '    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;',
            '    padding: 0.55rem 1.4rem; background: rgba(4, 16, 10, 0.96);',
            '    border-bottom: 2px solid rgba(46, 204, 113, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.85); z-index: 10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#ide-header-left { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }',
            '#ide-header-title {',
            '    font-family: "Orbitron", monospace; font-size: 0.95rem; font-weight: 900;',
            '    color: #2ecc71; letter-spacing: 1.5px; text-transform: uppercase;',
            '}',
            '#ide-round-pill {',
            '    background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.4);',
            '    padding: 0.2rem 0.65rem; border-radius: 3px; font-size: 0.8rem;',
            '    color: #2ecc71; letter-spacing: 1px;',
            '}',
            '#ide-strikes-box {',
            '    font-family: "Orbitron", monospace; font-size: 0.85rem; font-weight: 700;',
            '    color: #ff6b6b; padding: 0.2rem 0.65rem; background: rgba(231, 76, 60, 0.15);',
            '    border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 3px;',
            '}',
            '#ide-header-right { display: flex; align-items: center; gap: 8px; }',
            '.ide-btn-header {',
            '    background: rgba(0, 229, 176, 0.15); border: 1px solid #00e5b0; color: #00e5b0;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.8rem; border-radius: 3px; cursor: pointer;',
            '    letter-spacing: 1px; transition: all 0.2s;',
            '    display: inline-flex; align-items: center; gap: 5px;',
            '}',
            '.ide-btn-header:hover { background: #00e5b0; color: #020b06; }',
            '#ide-close-btn {',
            '    background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #ff6b6b;',
            '    font-family: "Share Tech Mono", monospace; font-size: 0.75rem;',
            '    padding: 0.35rem 0.9rem; border-radius: 3px; cursor: pointer; transition: all 0.2s;',
            '}',
            '#ide-close-btn:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* Canvas wrap y stage */',
            '#ide-canvas-wrap {',
            '    flex: 1; position: relative; display: flex; align-items: center;',
            '    justify-content: center; overflow: hidden; background: #020604;',
            '}',
            '#ide-canvas-stage { position: relative; overflow: hidden; box-shadow: 0 0 35px rgba(0,0,0,0.9); }',
            '#ide-canvas { display: block; }',
            '',
            '/* Consola de diálogo (Intro) */',
            '#ide-dialogue-console {',
            '    position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);',
            '    width: 92%; max-width: 950px; background: rgba(5, 18, 12, 0.94);',
            '    border: 2px solid #2ecc71; border-radius: 8px; padding: 1.1rem 1.4rem;',
            '    box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(46, 204, 113, 0.25);',
            '    z-index: 20; display: none; flex-direction: column; gap: 0.7rem;',
            '    backdrop-filter: blur(8px); box-sizing: border-box;',
            '}',
            '#ide-speaker-badge {',
            '    font-family: "Orbitron", monospace; font-size: 0.9rem; font-weight: 900;',
            '    color: #f1c40f; letter-spacing: 1.5px; text-transform: uppercase;',
            '}',
            '#ide-dialogue-text {',
            '    font-size: 1.05rem; line-height: 1.5; color: #eafbf2;',
            '    min-height: 48px;',
            '}',
            '#ide-dialogue-actions {',
            '    display: flex; align-items: center; justify-content: flex-end; gap: 10px;',
            '}',
            '.ide-diag-btn {',
            '    font-family: "Orbitron", monospace; font-size: 0.8rem; font-weight: 700;',
            '    padding: 0.5rem 1.2rem; border-radius: 4px; cursor: pointer; border: none;',
            '    letter-spacing: 1px; transition: all 0.2s;',
            '}',
            '.ide-diag-btn-primary { background: #2ecc71; color: #03140a; }',
            '.ide-diag-btn-primary:hover { background: #55efc4; transform: scale(1.04); }',
            '.ide-diag-btn-secondary { background: rgba(255,255,255,0.12); color: #ccc; }',
            '.ide-diag-btn-secondary:hover { background: rgba(255,255,255,0.25); color: #fff; }',
            '',
            '/* Opciones de respuesta */',
            '#ide-choices-wrap {',
            '    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);',
            '    width: 94%; max-width: 980px; z-index: 25; display: none;',
            '    grid-template-columns: repeat(2, 1fr); gap: 12px; box-sizing: border-box;',
            '}',
            '@media (max-width: 650px) {',
            '    #ide-choices-wrap { grid-template-columns: 1fr; gap: 8px; bottom: 8px; }',
            '}',
            '.ide-choice-btn {',
            '    background: rgba(3, 16, 10, 0.92); border: 1.5px solid rgba(46, 204, 113, 0.4);',
            '    color: #fff; font-family: "Orbitron", monospace; font-size: 0.95rem;',
            '    font-weight: 700; padding: 0.85rem 1rem; border-radius: 6px;',
            '    cursor: pointer; letter-spacing: 1.5px; text-transform: uppercase;',
            '    box-shadow: 0 4px 16px rgba(0,0,0,0.7); backdrop-filter: blur(6px);',
            '    transition: all 0.2s; text-align: center; display: flex;',
            '    align-items: center; justify-content: center; gap: 8px;',
            '}',
            '.ide-choice-btn:hover {',
            '    background: rgba(46, 204, 113, 0.22); border-color: #2ecc71;',
            '    color: #2ecc71; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(46, 204, 113, 0.35);',
            '}',
            '.ide-choice-btn.correct {',
            '    background: #2ecc71 !important; color: #021609 !important;',
            '    border-color: #2ecc71 !important; box-shadow: 0 0 30px #2ecc71 !important;',
            '}',
            '.ide-choice-btn.wrong {',
            '    background: #e74c3c !important; color: #fff !important;',
            '    border-color: #e74c3c !important; box-shadow: 0 0 30px #e74c3c !important;',
            '}',
            '',
            '/* Banner de retroalimentación */',
            '#ide-feedback-banner {',
            '    position: absolute; top: 20px; left: 50%; transform: translateX(-50%);',
            '    padding: 0.65rem 1.6rem; border-radius: 4px; font-family: "Orbitron", monospace;',
            '    font-size: 1.05rem; font-weight: 900; letter-spacing: 2px; z-index: 30;',
            '    display: none; text-transform: uppercase; box-shadow: 0 8px 30px rgba(0,0,0,0.8);',
            '    animation: ide-banner-pop 0.3s ease-out;',
            '}',
            '@keyframes ide-banner-pop { from { transform: translate(-50%, -15px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }',
            '#ide-feedback-banner.success {',
            '    background: rgba(46, 204, 113, 0.95); color: #031409;',
            '    border: 2px solid #a8ff3e;',
            '}',
            '#ide-feedback-banner.error {',
            '    background: rgba(231, 76, 60, 0.95); color: #fff;',
            '    border: 2px solid #ff6b6b;',
            '}',
            '',
            '/* Pantallas modales (Victoria / Derrota) */',
            '.ide-modal-screen {',
            '    position: absolute; inset: 0; z-index: 40; display: none;',
            '    flex-direction: column; align-items: center; justify-content: center;',
            '    text-align: center; background: rgba(2, 6, 4, 0.94); backdrop-filter: blur(8px);',
            '    padding: 1.5rem; box-sizing: border-box;',
            '}',
            '.ide-modal-screen.show { display: flex; animation: ide-fade-in 0.25s ease-out; }',
            '.ide-modal-title { font-family: "Orbitron", monospace; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.8rem; }',
            '.ide-modal-desc { font-size: 0.95rem; line-height: 1.6; max-width: 640px; color: #ddd; margin-bottom: 1.6rem; }',
            '.ide-btn {',
            '    font-family: "Orbitron", monospace; font-size: 0.88rem; font-weight: 700;',
            '    letter-spacing: 1.5px; padding: 0.75rem 2rem; border-radius: 4px;',
            '    cursor: pointer; border: none; transition: all 0.2s; text-transform: uppercase;',
            '}',
            '.ide-btn-green { background: #2ecc71; color: #02140a; box-shadow: 0 0 20px rgba(46, 204, 113, 0.5); }',
            '.ide-btn-green:hover { background: #55efc4; box-shadow: 0 0 35px rgba(85, 239, 196, 0.8); transform: translateY(-2px); }',
            '.ide-btn-red   { background: #e74c3c; color: #fff; box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }',
            '.ide-btn-red:hover   { background: #ff4757; box-shadow: 0 0 35px rgba(255, 71, 87, 0.8); transform: translateY(-2px); }'
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
                a.src = 'Identificated%20Game/' + resolveURI(filename);
            }
        });
        return a;
    }

    function getImage(filename) {
        if (imagesCache[filename]) return imagesCache[filename];
        var img = new Image();
        img.onload = function () {
            render();
        };
        img.onerror = function () {
            if (img.src.indexOf('Identificated%20Game') === -1 && img.src.indexOf('Identificated Game') === -1) {
                img.src = 'Identificated%20Game/' + resolveURI(filename);
            }
        };
        img.src = resolveURI(filename);
        imagesCache[filename] = img;
        return img;
    }

    function preloadAll() {
        ['DinosFondo.jpg', 'Baryonyx Fondo.jpg', 'MamenchiFondo.jpg', 'Lab fondo.jpg',
         'Kate Model.png', 'Boris Model.png', 'Kate gana.png', 'Kate decepcionada.png'].forEach(getImage);
        CAGE_FILES.forEach(getImage);
        SPECIES_DATA.forEach(function (s) { getImage(s.model); });
    }

    function initAudio() {
        try {
            sndMusic = createAudioWithFallback('Localiza.mp4', true, 0.75);
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

    function playRoar(filename) {
        if (currentRoar) {
            try { currentRoar.pause(); } catch (e) {}
        }
        currentRoar = createAudioWithFallback(filename, false, 1.0);
        currentRoar.play().catch(function(){});
    }

    // ============================================================
    //  CONSTRUCCIÓN DEL DOM
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'ide-overlay';

        // Header
        var header = document.createElement('div');
        header.id = 'ide-header';

        var hLeft = document.createElement('div');
        hLeft.id = 'ide-header-left';

        var title = document.createElement('div');
        title.id = 'ide-header-title';
        title.innerHTML = '🧬 IDENTIFICA LA ESPECIE — SOBREVIVIR EN LA ISLA';

        var roundPill = document.createElement('div');
        roundPill.id = 'ide-round-pill';
        roundPill.textContent = 'ESPECIE 1/12';

        var strikesBox = document.createElement('div');
        strikesBox.id = 'ide-strikes-box';
        strikesBox.textContent = '❌ FALLOS: 0/3';

        hLeft.appendChild(title);
        hLeft.appendChild(roundPill);
        hLeft.appendChild(strikesBox);

        var hRight = document.createElement('div');
        hRight.id = 'ide-header-right';

        var fullBtn = document.createElement('button');
        fullBtn.id = 'ide-fullscreen-btn';
        fullBtn.className = 'ide-btn-header';
        fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('ide-overlay') || document.documentElement;
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
        closeBtn.id = 'ide-close-btn';
        closeBtn.textContent = '✕ CERRAR';
        closeBtn.addEventListener('click', closeGame);

        hRight.appendChild(fullBtn);
        hRight.appendChild(closeBtn);

        header.appendChild(hLeft);
        header.appendChild(hRight);
        ov.appendChild(header);

        // Canvas Wrap
        var wrap = document.createElement('div');
        wrap.id = 'ide-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'ide-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'ide-canvas';
        stage.appendChild(canvas);

        // Feedback Banner
        var banner = document.createElement('div');
        banner.id = 'ide-feedback-banner';
        stage.appendChild(banner);

        // Consola de Diálogo (Intro)
        var diag = document.createElement('div');
        diag.id = 'ide-dialogue-console';
        diag.innerHTML = [
            '<div id="ide-speaker-badge">DRA. KATE VANEGAS</div>',
            '<div id="ide-dialogue-text">...</div>',
            '<div id="ide-dialogue-actions">',
            '    <button class="ide-diag-btn ide-diag-btn-secondary" id="ide-btn-skip">⏭ SALTAR INTRO</button>',
            '    <button class="ide-diag-btn ide-diag-btn-primary" id="ide-btn-next">SIGUIENTE ▶</button>',
            '</div>'
        ].join('');
        stage.appendChild(diag);

        // Opciones de Respuesta
        var choicesWrap = document.createElement('div');
        choicesWrap.id = 'ide-choices-wrap';
        stage.appendChild(choicesWrap);

        // Pantalla Victoria (Kate gana)
        var winScreen = document.createElement('div');
        winScreen.id = 'ide-win-screen';
        winScreen.className = 'ide-modal-screen';
        winScreen.innerHTML = [
            '<div class="ide-modal-title" style="color:#2ecc71;">🎉 ¡EVALUACIÓN APROBADA!</div>',
            '<div class="ide-modal-desc">',
            '<strong>Dr. Boris Wong:</strong> "¡Excelente trabajo taxonómico, Dra. Vanegas! Ha demostrado una agudeza visual impecable identificando a los 12 especímenes en sus celdas.<br><br>',
            '<strong style=\\"color:#2ecc71;\\">¡OFICIALMENTE HA SIDO ACEPTADA COMO PASANTE EN EL LABORATORIO GENÉTICO DE ISLA SORNA!</strong>"',
            '</div>',
            '<button class="ide-btn ide-btn-green" id="ide-btn-win-replay">EVALUAR OTRA VEZ</button>'
        ].join('');
        stage.appendChild(winScreen);

        // Pantalla Derrota (Kate decepcionada)
        var loseScreen = document.createElement('div');
        loseScreen.id = 'ide-lose-screen';
        loseScreen.className = 'ide-modal-screen';
        loseScreen.innerHTML = [
            '<div class="ide-modal-title" style="color:#ff6b6b;">⚠️ EVALUACIÓN REPROBADA</div>',
            '<div class="ide-modal-desc">',
            '<strong>Dr. Boris Wong:</strong> "Lo lamento mucho, Dra. Vanegas. Ha acumulado 3 errores taxonómicos. En este laboratorio no podemos permitirnos confusiones de especies con organismos de esta envergadura.<br><br>',
            '<strong style=\\"color:#ff6b6b;\\">NO HA SIDO ADMITIDA A LA PASANTÍA. DEBERÁ REPASAR LOS EXPEDIENTES.</strong>"',
            '</div>',
            '<button class="ide-btn ide-btn-red" id="ide-btn-lose-retry">REINTENTAR EVALUACIÓN</button>'
        ].join('');
        stage.appendChild(loseScreen);

        wrap.appendChild(stage);
        ov.appendChild(wrap);
        document.body.appendChild(ov);

        // Eventos de diálogo y pantallas finales
        document.getElementById('ide-btn-next').addEventListener('click', advanceDialogue);
        document.getElementById('ide-btn-skip').addEventListener('click', skipDialogue);
        document.getElementById('ide-btn-win-replay').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('identifica-especie');
            showModal(null);
            startGame();
        });
        document.getElementById('ide-btn-lose-retry').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('identifica-especie');
            showModal(null);
            startGame();
        });
    }

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('ide-canvas-wrap');
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
        ['ide-win-screen', 'ide-lose-screen'].forEach(function(s) {
            var el = document.getElementById(s);
            if (el) el.classList.remove('show');
        });
        if (id) {
            var target = document.getElementById(id);
            if (target) target.classList.add('show');
        }
    }

    // ============================================================
    //  LÓGICA DEL DIÁLOGO (INTRO)
    // ============================================================
    function startIntro() {
        state = 'intro';
        dialogueIdx = 0;
        showModal(null);

        var diag = document.getElementById('ide-dialogue-console');
        var choices = document.getElementById('ide-choices-wrap');
        var banner = document.getElementById('ide-feedback-banner');
        if (diag) diag.style.display = 'flex';
        if (choices) choices.style.display = 'none';
        if (banner) banner.style.display = 'none';

        updateDialogueUI();
        render();

        if (sndMusic) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function(){});
        }
    }

    function updateDialogueUI() {
        if (dialogueIdx >= INTRO_DIALOGUE.length) {
            startGame();
            return;
        }
        var line = INTRO_DIALOGUE[dialogueIdx];
        var badge = document.getElementById('ide-speaker-badge');
        var text  = document.getElementById('ide-dialogue-text');
        var nextBtn = document.getElementById('ide-btn-next');

        if (badge) {
            badge.textContent = line.speaker;
            badge.style.color = (line.char === 'kate') ? '#2ecc71' : '#f1c40f';
        }
        if (text) text.textContent = line.text;
        if (nextBtn) {
            nextBtn.textContent = (dialogueIdx === INTRO_DIALOGUE.length - 1) ? '🧪 ¡INICIAR EVALUACIÓN!' : 'SIGUIENTE ▶';
        }
        render();
    }

    function advanceDialogue() {
        dialogueIdx++;
        updateDialogueUI();
    }

    function skipDialogue() {
        startGame();
    }

    // ============================================================
    //  LÓGICA DEL JUEGO (IDENTIFICACIÓN)
    // ============================================================
    function startGame() {
        state = 'playing';
        currentRound = 0;
        strikes = 0;
        showCage = true;

        // Mezclar las 12 especies aleatoriamente
        quizSpecies = SPECIES_DATA.slice();
        for (var i = quizSpecies.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = quizSpecies[i];
            quizSpecies[i] = quizSpecies[j];
            quizSpecies[j] = temp;
        }

        var diag = document.getElementById('ide-dialogue-console');
        if (diag) diag.style.display = 'none';

        updateHUD();
        loadRound(currentRound);
    }

    function updateHUD() {
        var pill = document.getElementById('ide-round-pill');
        var strk = document.getElementById('ide-strikes-box');
        if (pill) pill.textContent = 'ESPECIE ' + (currentRound + 1) + '/12';
        if (strk) strk.textContent = '❌ FALLOS: ' + strikes + '/3';
    }

    function loadRound(idx) {
        currentRound = idx;
        showCage = true;
        state = 'playing';
        updateHUD();

        var banner = document.getElementById('ide-feedback-banner');
        if (banner) banner.style.display = 'none';

        buildChoices();
        render();
    }

    function buildChoices() {
        var wrap = document.getElementById('ide-choices-wrap');
        if (!wrap) return;
        wrap.innerHTML = '';
        wrap.style.display = 'grid';

        var correctSpecies = quizSpecies[currentRound];

        // Escoger 3 opciones incorrectas aleatorias
        var pool = SPECIES_DATA.filter(function (s) { return s.name !== correctSpecies.name; });
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
        }
        var options = [correctSpecies.name, pool[0].name, pool[1].name, pool[2].name];

        // Mezclar las 4 opciones
        for (var k = options.length - 1; k > 0; k--) {
            var r = Math.floor(Math.random() * (k + 1));
            var ot = options[k]; options[k] = options[r]; options[r] = ot;
        }

        options.forEach(function (optName) {
            var btn = document.createElement('button');
            btn.className = 'ide-choice-btn';
            btn.textContent = optName;
            btn.addEventListener('pointerdown', function (e) {
                if (e.cancelable) e.preventDefault();
                handleChoice(optName, btn);
            });
            btn.addEventListener('click', function () {
                handleChoice(optName, btn);
            });
            wrap.appendChild(btn);
        });
    }

    function handleChoice(selectedName, btnEl) {
        if (state !== 'playing') return;
        var correctSpecies = quizSpecies[currentRound];

        var banner = document.getElementById('ide-feedback-banner');

        if (selectedName === correctSpecies.name) {
            // ¡RESPUESTA CORRECTA!
            state = 'round_success';
            showCage = false; // Se retira la jaula revelando la especie
            btnEl.classList.add('correct');

            if (banner) {
                banner.className = 'success';
                banner.textContent = '✅ ¡CORRECTO! ' + correctSpecies.name.toUpperCase();
                banner.style.display = 'block';
            }

            // Reproducir rugido de la especie
            playRoar(correctSpecies.roar);
            render();

            // Deshabilitar botones temporalmente
            var allBtns = document.querySelectorAll('.ide-choice-btn');
            allBtns.forEach(function (b) { b.disabled = true; });

            // Avanzar al siguiente tras 2.2s
            setTimeout(function () {
                if (currentRound + 1 < quizSpecies.length) {
                    loadRound(currentRound + 1);
                } else {
                    // ¡VICTORIA!
                    triggerWin();
                }
            }, 2200);

        } else {
            // RESPUESTA INCORRECTA
            strikes++;
            updateHUD();
            btnEl.classList.add('wrong');
            btnEl.disabled = true;

            if (banner) {
                banner.className = 'error';
                banner.textContent = '❌ INCORRECTO — ESA NO ES LA ESPECIE';
                banner.style.display = 'block';
            }

            if (strikes >= maxStrikes) {
                // DERROTA POR 3 FALLOS
                setTimeout(function () {
                    triggerLose();
                }, 1000);
            }
        }
    }

    function triggerWin() {
        state = 'won';
        var wrap = document.getElementById('ide-choices-wrap');
        var banner = document.getElementById('ide-feedback-banner');
        if (wrap) wrap.style.display = 'none';
        if (banner) banner.style.display = 'none';

        render();
        showModal('ide-win-screen');
    }

    function triggerLose() {
        state = 'lost';
        var wrap = document.getElementById('ide-choices-wrap');
        var banner = document.getElementById('ide-feedback-banner');
        if (wrap) wrap.style.display = 'none';
        if (banner) banner.style.display = 'none';

        render();
        showModal('ide-lose-screen');
    }

    // ============================================================
    //  RENDERIZADO EN CANVAS
    // ============================================================
    function render() {
        if (!ctx || !canvas) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ========================================================
        // CASO 1: PANTALLA DE INTRO (LABORATORIO CON KATE Y BORIS)
        // ========================================================
        if (state === 'intro') {
            var labBg = getImage('Lab fondo.jpg');
            if (labBg.complete && labBg.naturalWidth) {
                ctx.drawImage(labBg, 0, 0, canvasW, canvasH);
            } else {
                ctx.fillStyle = '#06160f';
                ctx.fillRect(0, 0, canvasW, canvasH);
            }

            // Personaje Kate (Izquierda)
            var kateImg = getImage('Kate Model.png');
            if (kateImg.complete && kateImg.naturalWidth) {
                var kw = 340 * scale;
                var kh = 455 * scale;
                var kx = 110 * scale;
                var ky = (LH - 455) * scale;
                ctx.save();
                if (INTRO_DIALOGUE[dialogueIdx].char === 'kate') {
                    ctx.shadowColor = '#2ecc71';
                    ctx.shadowBlur = 30 * scale;
                } else {
                    ctx.filter = 'brightness(0.65)';
                }
                ctx.drawImage(kateImg, kx, ky, kw, kh);
                ctx.restore();
            }

            // Personaje Boris (Derecha)
            var borisImg = getImage('Boris Model.png');
            if (borisImg.complete && borisImg.naturalWidth) {
                var bw = 340 * scale;
                var bh = 455 * scale;
                var bx = (LW - 450) * scale;
                var by = (LH - 455) * scale;
                ctx.save();
                if (INTRO_DIALOGUE[dialogueIdx].char === 'boris') {
                    ctx.shadowColor = '#f1c40f';
                    ctx.shadowBlur = 30 * scale;
                } else {
                    ctx.filter = 'brightness(0.65)';
                }
                ctx.drawImage(borisImg, bx, by, bw, bh);
                ctx.restore();
            }

            ctx.restore();
            return;
        }

        // ========================================================
        // CASO 2: VICTORIA (KATE GANA)
        // ========================================================
        if (state === 'won') {
            var labBgWin = getImage('Lab fondo.jpg');
            if (labBgWin.complete && labBgWin.naturalWidth) {
                ctx.drawImage(labBgWin, 0, 0, canvasW, canvasH);
            }
            var kateGana = getImage('Kate gana.png');
            if (kateGana.complete && kateGana.naturalWidth) {
                var gw = 380 * scale;
                var gh = 510 * scale;
                var gx = (LW - 380) / 2 * scale;
                var gy = (LH - 510) * scale;
                ctx.save();
                ctx.shadowColor = '#2ecc71';
                ctx.shadowBlur = 40 * scale;
                ctx.drawImage(kateGana, gx, gy, gw, gh);
                ctx.restore();
            }
            ctx.restore();
            return;
        }

        // ========================================================
        // CASO 3: DERROTA (KATE DECEPCIONADA)
        // ========================================================
        if (state === 'lost') {
            var labBgLose = getImage('Lab fondo.jpg');
            if (labBgLose.complete && labBgLose.naturalWidth) {
                ctx.drawImage(labBgLose, 0, 0, canvasW, canvasH);
            }
            var kateDec = getImage('Kate decepcionada.png');
            if (kateDec.complete && kateDec.naturalWidth) {
                var dw = 380 * scale;
                var dh = 510 * scale;
                var dx = (LW - 380) / 2 * scale;
                var dy = (LH - 510) * scale;
                ctx.save();
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 40 * scale;
                ctx.drawImage(kateDec, dx, dy, dw, dh);
                ctx.restore();
            }
            ctx.restore();
            return;
        }

        // ========================================================
        // CASO 4: JUEGO ACTIVO (ESPECIE Y JAULA)
        // Capas estrictas: 1. Fondo, 2. Especie, 3. Jaula
        // ========================================================
        if (quizSpecies.length > 0 && currentRound < quizSpecies.length) {
            var sp = quizSpecies[currentRound];

            // 1. CAPA 1: Dinos Fondo (o fondo específico de Baryonyx o Mamenchisaurus)
            var bgImg = getImage(sp.bg);
            if (bgImg.complete && bgImg.naturalWidth) {
                ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
            } else {
                ctx.fillStyle = '#06140e';
                ctx.fillRect(0, 0, canvasW, canvasH);
            }

            // 2. CAPA 2: Modelo de la especie prehistórica
            var dinoImg = getImage(sp.model);
            if (dinoImg.complete && dinoImg.naturalWidth) {
                ctx.save();
                if (!showCage) {
                    // Resplandor verde de acierto taxonómico al retirar la jaula
                    ctx.shadowColor = '#2ecc71';
                    ctx.shadowBlur = 35 * scale;
                }

                if (sp.name === 'Mamenchisaurus') {
                    // Mamenchisaurus: escala reducida en 15% (1.50 -> 1.28) y ajuste vertical
                    var mw = canvasW * 1.28;
                    var mh = canvasH * 1.28;
                    var mx = (canvasW - mw) / 2;
                    var my = (canvasH - mh) - Math.round(15 * scale);
                    ctx.drawImage(dinoImg, mx, my, mw, mh);
                } else {
                    // Todas las demás especies dibujadas a lienzo completo (0, 0, canvasW, canvasH)
                    ctx.drawImage(dinoImg, 0, 0, canvasW, canvasH);
                }
                ctx.restore();
            }

            // 3. CAPA 3: Jaula superpuesta (se retira al acertar)
            if (showCage) {
                var cageIdx = currentRound % CAGE_FILES.length;
                var cageFile = CAGE_FILES[cageIdx];
                var cageImg = getImage(cageFile);
                if (cageImg.complete && cageImg.naturalWidth) {
                    ctx.drawImage(cageImg, 0, 0, canvasW, canvasH);
                }
            }
        }

        ctx.restore();
    }

    // ============================================================
    //  CONTROL DE APERTURA Y CIERRE
    // ============================================================
    function openGame() {
        var ov = document.getElementById('ide-overlay');
        if (!ov) return;
        ov.classList.add('open');

        if (typeof window.interruptBgMusic === 'function') {
            window.interruptBgMusic();
        }

        if (!ctx) ctx = canvas.getContext('2d');
        resize();
        startIntro();
    }

    function closeGame() {
        var ov = document.getElementById('ide-overlay');
        if (ov) ov.classList.remove('open');
        stopAllAudio();
        state = 'idle';
        showModal(null);

        if (typeof window.releaseBgMusic === 'function') {
            window.releaseBgMusic();
        }
    }

    // Exponer globalmente
    window.openIdentificaEspecie = openGame;

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        buildOverlay();
        preloadAll();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('ide-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
