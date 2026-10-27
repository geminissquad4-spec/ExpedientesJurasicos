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
    var slipSpeed = 12; // px/s de resbalamiento si no se pulsa espacio

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
    var audioCtx = null;

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('cueva-baryonyx-styles')) return;
        var style = document.createElement('style');
        style.id = 'cueva-baryonyx-styles';
        style.textContent = [
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
            '    padding: 0.55rem 1.4rem; background: rgba(4, 16, 10, 0.96);',
            '    border-bottom: 2px solid rgba(0, 210, 211, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.85); z-index: 10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#cb-header-left { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }',
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
            '.cb-btn-red:hover { background: #ff4757; box-shadow: 0 0 35px rgba(255, 71, 87, 0.8); transform: translateY(-2px); }'
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
        title.innerHTML = '🐊 LA CUEVA DEL BARYONYX — SOBREVIVIR EN LA ISLA';

        var climbPill = document.createElement('div');
        climbPill.id = 'cb-climb-pill';
        climbPill.textContent = 'ALTURA: 0%';

        var dangerBox = document.createElement('div');
        dangerBox.id = 'cb-danger-box';
        dangerBox.textContent = '⚠️ BARYONYX ACECHANDO';

        hLeft.appendChild(title);
        hLeft.appendChild(climbPill);
        hLeft.appendChild(dangerBox);

        var hRight = document.createElement('div');
        hRight.id = 'cb-header-right';

        var muteBtn = document.createElement('button');
        muteBtn.id = 'cb-mute-btn';
        muteBtn.className = 'cb-btn-header';
        muteBtn.innerHTML = '🔊 SONIDO';
        muteBtn.addEventListener('click', function () {
            isMuted = !isMuted;
            if (isMuted) {
                muteBtn.innerHTML = '🔇 SILENCIO';
                if (sndMusic) sndMusic.muted = true;
                if (currentRoar) currentRoar.muted = true;
            } else {
                muteBtn.innerHTML = '🔊 SONIDO';
                if (sndMusic) sndMusic.muted = false;
                if (currentRoar) currentRoar.muted = false;
            }
        });

        var fullBtn = document.createElement('button');
        fullBtn.id = 'cb-fullscreen-btn';
        fullBtn.className = 'cb-btn-header';
        fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('cb-overlay') || document.documentElement;
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
        closeBtn.id = 'cb-close-btn';
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
        stage.appendChild(progWrap);

        // Indicador central de tecla ESPACIO
        var spaceHint = document.createElement('div');
        spaceHint.id = 'cb-space-hint';
        spaceHint.textContent = '⌨️ PULSA [ESPACIO] RÁPIDAMENTE PARA SUBIR';
        stage.appendChild(spaceHint);

        // Botón táctil para móviles
        var touchBtn = document.createElement('button');
        touchBtn.id = 'cb-touch-climb-btn';
        touchBtn.innerHTML = '⬆️ TREPAR';
        touchBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            handleClimb();
        }, { passive: false });
        touchBtn.addEventListener('click', handleClimb);
        stage.appendChild(touchBtn);

        // Pantalla de Inicio / Briefing
        var briefScreen = document.createElement('div');
        briefScreen.id = 'cb-brief-screen';
        briefScreen.className = 'cb-modal-screen show';
        briefScreen.innerHTML = [
            '<div class="cb-modal-title" style="color:#00d2d3;">🧗 MISIÓN: LA CUEVA DEL BARYONYX</div>',
            '<div class="cb-modal-desc">',
            'El soldado <strong>Antony Benton</strong> ha caído en la caverna subterránea del Baryonyx. Una cuerda cuelga desde la abertura superior iluminada por el sol.<br><br>',
            '• Pulsa repetidamente la tecla <strong>ESPACIO</strong> (o toca la pantalla / botón <strong>⬆️ TREPAR</strong>) para escalar.<br>',
            '• A medida que subas, la cuerda se agitará con más fuerza y el Baryonyx acelerará el paso para cazarte.<br>',
            '• ¡Escala hasta la superficie antes de que el carnívoro alcance tus pies!',
            '</div>',
            '<div class="cb-modal-tip">',
            '🎮 <strong>CONTROLES:</strong> Pulsa la <strong>BARRA ESPACIADORA</strong> de forma continua y veloz. En móviles, pulsa el botón verde o cualquier parte de la pantalla.',
            '</div>',
            '<button class="cb-btn cb-btn-cyan" id="cb-btn-start">INICIAR ESCALADA ▶</button>'
        ].join('');
        stage.appendChild(briefScreen);

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
            '<button class="cb-btn cb-btn-green" id="cb-btn-win-replay">ESCALAR OTRA VEZ ↺</button>'
        ].join('');
        stage.appendChild(winScreen);

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
            '<button class="cb-btn cb-btn-red" id="cb-btn-lose-retry">REINTENTAR ESCAPE ↺</button>'
        ].join('');
        stage.appendChild(loseScreen);

        wrap.appendChild(stage);
        ov.appendChild(wrap);
        document.body.appendChild(ov);

        // Eventos
        document.getElementById('cb-btn-start').addEventListener('click', startGame);
        document.getElementById('cb-btn-win-replay').addEventListener('click', startGame);
        document.getElementById('cb-btn-lose-retry').addEventListener('click', startGame);

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
        state = 'playing';

        climbProgress = 0;
        antony.climbOffset = 0;
        antony.swayAngle = 0;

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
                dangerBox.textContent = '🚨 ¡BARYONYX AL ACECHO: ' + distToRope + ' M!';
                dangerBox.className = 'danger';
            } else {
                dangerBox.textContent = '⚠️ BARYONYX ACERCÁNDOSE: ' + distToRope + ' M';
                dangerBox.className = '';
            }
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
    //  ACTUALIZACIÓN FÍSICA
    // ============================================================
    function update(dt) {
        // 1. Resbalamiento suave si no se trepa activamente
        if (antony.climbOffset > 0) {
            antony.climbOffset = Math.max(0, antony.climbOffset - slipSpeed * dt);
        }

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

            ctx.drawImage(antImg, drawX, drawY, aw, ah);
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

        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function(){});
        }
    }

    function closeGame() {
        var ov = document.getElementById('cb-overlay');
        if (ov) ov.classList.remove('open');
        stopAllAudio();
        state = 'idle';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        showModal(null);

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
