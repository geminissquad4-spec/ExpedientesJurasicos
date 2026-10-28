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
            x: 820, y: 340, w: 230, h: 129
        },
        {
            num: 2,
            name: 'SECTOR 02: LADERA ROCOSA',
            bg: 'Busca 2.jpg',
            time: 18,
            x: 240, y: 280, w: 205, h: 115
        },
        {
            num: 3,
            name: 'SECTOR 03: ESPESURA CENTRAL',
            bg: 'Busca 3.jpg',
            time: 16,
            x: 740, y: 260, w: 180, h: 101
        },
        {
            num: 4,
            name: 'SECTOR 04: ACANTILADO OSCURO',
            bg: 'Busca 4.jpg',
            time: 14,
            x: 160, y: 190, w: 155, h: 87
        },
        {
            num: 5,
            name: 'SECTOR 05: CLARO DE SOMBRAS',
            bg: 'Busca 5.jpg',
            time: 12,
            x: 520, y: 220, w: 135, h: 76
        },
        {
            num: 6,
            name: 'SECTOR 06: BARRANCO DE LA SELVA',
            bg: 'Busca 6.jpg',
            time: 10,
            x: 890, y: 310, w: 118, h: 66
        },
        {
            num: 7,
            name: 'SECTOR 07: NIDO DEL CAMALEÓN (FINAL)',
            bg: 'Busca 7.jpg',
            time: 8,
            x: 610, y: 280, w: 98, h: 55
        }
    ];

    // Estado del juego
    var state = 'idle'; // idle | playing | found | jumpscare | won | lost
    var currentLevelIdx = 0;
    var timeLeft = 20;
    var timerInterval = null;
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
            '    padding: 0.6rem 1.4rem; background: rgba(5, 14, 10, 0.95);',
            '    border-bottom: 2px solid rgba(243, 156, 18, 0.4);',
            '    box-shadow: 0 4px 20px rgba(0,0,0,0.8); z-index: 10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#cs-header-left { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }',
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
            '.cs-btn-green:hover { background: #55efc4; box-shadow: 0 0 35px rgba(85, 239, 196, 0.8); transform: translateY(-2px); }'
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

        var fullBtn = document.createElement('button');
        fullBtn.id = 'cs-fullscreen-btn';
        fullBtn.className = 'cs-btn-header';
        fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('carno-search-overlay') || document.documentElement;
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
        closeBtn.id = 'cs-close-btn';
        closeBtn.textContent = '✕ CERRAR';
        closeBtn.addEventListener('click', closeGame);

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
            '<div class="cs-screen-title" style="color:#f39c12;">🔦 BUSCANDO AL CARNOTAURUS</div>',
            '<div class="cs-screen-sub">',
            'Los sigilosos Carnotaurus Camaleónicos poseen la capacidad genética de camuflarse en la oscuridad de la selva.<br>',
            'Deberás inspeccionar <strong>7 sectores clasificados</strong> con tu linterna táctica y dispararle antes de que se agote el tiempo.<br><br>',
            '⚡ <strong>REGLAS DE SUPERVIVENCIA:</strong><br>',
            '• Usa el ratón o desliza el dedo en tu celular para mover el foco de luz de la linterna.<br>',
            '• Haz clic o pulsa sobre el Carnotaurus para disparar y revelar su camuflaje.<br>',
            '• Empiezas con <strong>20 segundos</strong>, pero el tiempo se reducirá en cada nivel.<br>',
            '• <em>Si el tiempo expira sin encontrarlo, ¡el Carnotaurus Camaleónico saltará a atacarte!</em>',
            '</div>',
            '<button class="cs-btn cs-btn-primary" id="cs-btn-start">INICIAR BÚSQUEDA</button>'
        ].join('');
        stage.appendChild(startScreen);

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
            '<button class="cs-btn cs-btn-green" id="cs-btn-win-replay">JUGAR DE NUEVO</button>'
        ].join('');
        stage.appendChild(winScreen);

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
            '<button class="cs-btn cs-btn-danger" id="cs-btn-lose-retry">REINTENTAR</button>'
        ].join('');
        stage.appendChild(loseScreen);

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
        state = 'playing';

        var lvlPill = document.getElementById('cs-level-pill');
        if (lvlPill) lvlPill.textContent = 'SECTOR ' + (currentLevelIdx + 1) + '/7: ' + lvl.name;

        var hint = document.getElementById('cs-status-hint');
        if (hint) hint.innerHTML = '🔦 SECTOR ' + (currentLevelIdx + 1) + ' — ¡Busca al Carnotaurus en las sombras antes de que se agote el tiempo!';

        startTimer();
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        updateTimerDisplay();

        var startTime = performance.now();
        var initial = timeLeft;

        timerInterval = setInterval(function () {
            if (state !== 'playing') {
                clearInterval(timerInterval);
                return;
            }
            var elapsed = (performance.now() - startTime) / 1000;
            timeLeft = Math.max(0, initial - elapsed);
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
        showScreen('cs-start-screen');
        state = 'idle';

        if (!ctx) ctx = canvas.getContext('2d');
        resize();
    }

    function closeGame() {
        var ov = document.getElementById('carno-search-overlay');
        if (ov) ov.classList.remove('open');
        if (aniFrame) cancelAnimationFrame(aniFrame);
        if (timerInterval) clearInterval(timerInterval);
        stopAllAudio();
        state = 'idle';
        showScreen(null);
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
