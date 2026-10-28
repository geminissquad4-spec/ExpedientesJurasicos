// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡NO ENTRES EN EL PASTIZAL!
//  Minijuego: Dispara a los Velociraptores en la hierba alta
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('maintenance-overlay')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×675) ----
    var LW = 1200, LH = 675;
    var TARGET_RAPTORS = 5;

    // ---- ESTADO DEL JUEGO ----
    var state = 'idle'; // idle | lurking | leaping | shot | hit_player | won | lost
    var killedCount = 0;
    var raptorX = 600, raptorY = 325, raptorStartY = 325;
    var raptorScale = 0.52;
    var raptorFacing = 1; // 1 = normal, -1 = flipped
    var stateTimer = 0;
    var leapDuration = 1000;
    var leapProgress = 0;
    var mouseX = LW / 2, mouseY = LH / 2;
    var isMouseInside = false;

    // Efecto de disparo ("POW!")
    var powActive = false;
    var powX = 0, powY = 0;
    var powTimer = 0;
    var powScale = 1;

    // Sacudida de pantalla (screen shake)
    var shakeTimer = 0;
    var shakeMag = 0;

    // Bucle y canvas
    var aniFrame = null;
    var lastTime = 0;
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx;

    // ---- IMÁGENES ----
    var imgs = {
        fondo:     new Image(),
        pastizal:  new Image(),
        crosshair: new Image(),
        shoot:     new Image(),
        raptor1:   new Image(),
        raptor2:   new Image()
    };

    // ---- AUDIO ----
    var sndBG    = null;
    var sndUno   = null;
    var sndDos   = null;
    var sndTres  = null;

    // ============================================================
    //  RESOLUCIÓN DE ARCHIVOS (RAÍZ + CARPETA DE RESPALDO)
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudio(filename, loop, vol) {
        var primary = resolveURI(filename);
        var fallback = 'Raptor%20Attack/' + resolveURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function () {
            if (a.src.indexOf('Raptor%20Attack') === -1 && a.src.indexOf('Raptor Attack') === -1) {
                a.src = fallback;
            }
        });
        return a;
    }

    function loadImageWithFallback(img, filename, onDone) {
        var primary = resolveURI(filename);
        var fallback = 'Raptor%20Attack/' + resolveURI(filename);
        var finished = false;

        function markDone() {
            if (!finished) {
                finished = true;
                onDone();
            }
        }

        img.onload = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Raptor%20Attack') === -1 && img.src.indexOf('Raptor Attack') === -1) {
                img.src = fallback;
            } else if (filename === 'Fondo Pastizal.png' && img.src.indexOf('Fondo%202.png') === -1) {
                // Respaldo secundario si se subió como Fondo 2.png
                img.src = 'Fondo%202.png';
            } else {
                console.warn('No se pudo cargar:', filename);
                markDone();
            }
        };
        img.src = primary;
    }

    function loadAllImages(cb) {
        var count = 0, total = Object.keys(imgs).length;
        function done() { if (++count >= total) cb(); }
        loadImageWithFallback(imgs.fondo,     'Fondo.jpg', done);
        loadImageWithFallback(imgs.pastizal,  'Fondo Pastizal.png', done);
        loadImageWithFallback(imgs.crosshair, 'Crosshair Model.png', done);
        loadImageWithFallback(imgs.shoot,     'Shoot Model.png', done);
        loadImageWithFallback(imgs.raptor1,   'Raptor Model.png', done);
        loadImageWithFallback(imgs.raptor2,   'Raptor Model 2.png', done);
    }

    function initAudio() {
        sndBG   = createAudio('Musica fondo.mp4', true, 0.35);
        sndUno  = createAudio('Sonido Uno.mp4', false, 0.95);
        sndDos  = createAudio('Sonido Dos.mp4', false, 1.0);
        sndTres = createAudio('Sonido Tres.mp4', false, 1.0);
    }

    function playAudio(snd) {
        if (!snd) return;
        try {
            snd.currentTime = 0;
            snd.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        [sndBG, sndUno, sndDos, sndTres].forEach(function (s) {
            if (s) {
                try { s.pause(); s.currentTime = 0; } catch (e) {}
            }
        });
    }

    // Efecto de sonido sintético de disparo (escopeta / rifle)
    var audioCtx = null;
    function playGunshotFX() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!audioCtx && AC) audioCtx = new AC();
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if (!audioCtx) return;

            // Ruido blanco para detonación
            var bufSize = audioCtx.sampleRate * 0.28;
            var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.18));
            }
            var noise = audioCtx.createBufferSource();
            noise.buffer = buf;

            var filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3200, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.25);

            var gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start();
        } catch (e) {}
    }

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        var s = document.createElement('style');
        s.textContent = `
            /* --- BOTÓN FLOTANTE PORTADA (AMARILLO / AMBAR RAPTOR) --- */
            #raptor-fab {
                position: fixed;
                bottom: 164px; right: 28px;
                left: auto;
                z-index: 99990;
                display: flex; align-items: center; gap: 0.55rem;
                padding: 0.65rem 1.3rem 0.65rem 0.9rem;
                background: rgba(22, 16, 2, 0.92);
                border: 2px solid #f39c12; border-radius: 50px;
                cursor: pointer; user-select: none;
                color: #f1c40f;
                font-family: 'Orbitron','Share Tech Mono',monospace;
                font-size: 0.78rem; font-weight: 700;
                letter-spacing: 1.5px; text-transform: uppercase;
                box-shadow: 0 0 22px rgba(243,156,18,.45), 0 4px 16px rgba(0,0,0,.6);
                backdrop-filter: blur(8px);
                transition: all .22s ease;
                animation: raptor-fab-pulse 2.8s ease-in-out infinite;
            }
            #raptor-fab:hover {
                background: rgba(243,156,18,.22);
                box-shadow: 0 0 44px rgba(243,156,18,.75), 0 4px 20px rgba(0,0,0,.7);
                transform: scale(1.07) translateY(-2px);
            }
            #raptor-fab img {
                width: 44px; height: auto; max-height: 32px;
                object-fit: contain;
                filter: drop-shadow(0 0 6px rgba(243,156,18,.7));
                pointer-events: none;
            }
            .raptor-fab-title { display:block; font-size:.78rem; }
            .raptor-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#f9e79f; letter-spacing:1px; opacity:.85; }
            @keyframes raptor-fab-pulse {
                0%,100%{ box-shadow:0 0 22px rgba(243,156,18,.45),0 4px 16px rgba(0,0,0,.6); }
                50%    { box-shadow:0 0 44px rgba(243,156,18,.75), 0 4px 20px rgba(0,0,0,.7); }
            }

            /* --- OVERLAY DE JUEGO PANTALLA COMPLETA --- */
            #raptor-overlay {
                position: fixed; inset: 0; z-index: 99995;
                background: #000;
                display: none; flex-direction: column;
            }
            #raptor-overlay.open { display: flex; }

            /* Header */
            #raptor-header {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .55rem 1rem;
                background: rgba(0,0,0,.88);
                border-bottom: 2px solid #f39c12;
                backdrop-filter: blur(4px);
                z-index: 10;
            }
            #raptor-header-title {
                font-family:'Orbitron',monospace; font-size:.95rem; font-weight:900;
                color:#f1c40f; letter-spacing:2px; text-transform:uppercase;
            }
            #raptor-close-btn {
                background:transparent; border:1px solid rgba(243,156,18,.4); color:#e6b800;
                font-family:'Share Tech Mono',monospace; font-size:.75rem;
                padding:.3rem .9rem; border-radius:3px; cursor:pointer;
                letter-spacing:1px; transition:all .2s;
            }
            #raptor-close-btn:hover { background:rgba(243,156,18,.2); color:#fff; border-color:#f1c40f; }

            /* Canvas wrap */
            #raptor-canvas-wrap {
                flex: 1;
                position: relative;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                background: #050608;
            }
            #raptor-canvas {
                display: block;
                cursor: none; /* Mirilla dibujada en canvas */
                touch-action: none;
            }

            /* Status HUD inferior */
            #raptor-status-bar {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .45rem 1.4rem;
                background: rgba(0,0,0,.88);
                border-top: 1px solid rgba(243,156,18,.35);
                font-family:'Share Tech Mono',monospace; font-size:.82rem;
                backdrop-filter: blur(4px); z-index:10;
            }
            #raptor-mission-text {
                color: #f1c40f; font-family:'Orbitron',monospace; font-size:.8rem; font-weight:700;
                letter-spacing: 1px;
            }
            .raptor-pips-wrap { display: flex; align-items: center; gap: 0.5rem; }
            .raptor-pip {
                display: inline-block; width: 14px; height: 14px;
                border: 2px solid #f39c12; border-radius: 50%;
                background: transparent; transition: all 0.25s ease;
            }
            .raptor-pip.filled {
                background: #f1c40f;
                box-shadow: 0 0 10px #f1c40f;
            }

            /* --- PANTALLAS MODALES --- */
            .raptor-screen {
                position: absolute; inset: 0; z-index: 20;
                display: none; flex-direction: column;
                align-items: center; justify-content: center;
                text-align: center;
                background: rgba(0,0,0,.82);
                backdrop-filter: blur(7px);
                font-family: 'Share Tech Mono',monospace;
                padding: 1rem;
            }
            .raptor-screen.show { display: flex; animation: raptor-pop .3s ease-out; }
            @keyframes raptor-pop {
                from { opacity: 0; transform: scale(.95); }
                to   { opacity: 1; transform: scale(1); }
            }
            .raptor-screen-title {
                font-family:'Orbitron',monospace;
                font-size: clamp(1.4rem, 4vw, 2.4rem);
                font-weight: 900; letter-spacing: 3px; text-transform: uppercase;
                margin-bottom: .5rem;
            }
            .raptor-screen-sub {
                font-size: clamp(.75rem, 2vw, .95rem); color: #ccc;
                margin-bottom: 1.8rem; max-width: 540px; line-height: 1.6;
            }
            .raptor-instruct {
                display: flex; gap: 1.8rem; margin: .8rem 0 1.6rem;
                flex-wrap: wrap; justify-content: center;
                font-size: .78rem; color: #ddd;
            }
            .raptor-inst-item { display:flex; flex-direction:column; align-items:center; gap:.4rem; }
            .raptor-inst-icon { font-size: 1.8rem; }

            .raptor-btn {
                font-family:'Orbitron',monospace; font-size:.82rem; font-weight:700;
                letter-spacing:1.5px; padding:.65rem 1.7rem;
                border:none; border-radius:4px; cursor:pointer;
                transition:all .2s ease; text-transform:uppercase; margin:.3rem;
            }
            .raptor-btn-primary { background:#f39c12; color:#1a1103; box-shadow:0 0 14px rgba(243,156,18,.4); }
            .raptor-btn-primary:hover { background:#f1c40f; box-shadow:0 0 28px rgba(243,156,18,.7); transform:translateY(-2px); }
            .raptor-btn-secondary { background:transparent; border:1px solid #f39c12; color:#f1c40f; }
            .raptor-btn-secondary:hover { background:rgba(243,156,18,.15); }

            /* --- RESPONSIVE MÓVIL --- */
            @media (max-width: 600px) {
                #raptor-fab { bottom: 128px; right: 16px; left: auto; padding: .5rem .9rem .5rem .65rem; }
                #raptor-fab img { width: 36px; height: auto; max-height: 26px; }
                .raptor-fab-title { font-size: .65rem; }
                .raptor-fab-sub   { display: none; }
                #raptor-status-bar { font-size: .68rem; padding: .35rem .6rem; }
                #raptor-header { padding: .35rem .7rem; }
                #raptor-header-title { font-size: .76rem; }
            }
        `;
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'raptor-overlay';
        ov.innerHTML = `
            <div id="raptor-header">
                <div id="raptor-header-title">🌾 ¡NO ENTRES EN EL PASTIZAL! — VELOCIRAPTOR</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button id="raptor-fullscreen-btn" class="minigame-fullscreen-btn">⛶ PANTALLA COMPLETA</button>
                    <button id="raptor-close-btn">✕ CERRAR</button>
                </div>
            </div>

            <div id="raptor-canvas-wrap">
                <canvas id="raptor-canvas"></canvas>

                <!-- Pantalla inicio -->
                <div class="raptor-screen show" id="raptor-start-screen">
                    <div class="raptor-screen-title" style="color:#f1c40f;">🌾 ¡NO ENTRES A LA HIERBA ALTA!</div>
                    <div class="raptor-screen-sub">
                        Los Velociraptores están cazando en la maleza.<br>
                        Escucha con atención: cuando se prepare para atacar escucharás su chillido de acecho.<br>
                        <strong style="color:#f1c40f;">Cuando salte, apunta con la mirilla y dispárale antes de que te alcance.</strong><br>
                        ¡Neutraliza a los 5 Velociraptores para sobrevivir!
                    </div>
                    <div class="raptor-instruct">
                        <div class="raptor-inst-item">
                            <div class="raptor-inst-icon">👂</div>
                            <div>Sonido 1 =<br><strong>ACECHO</strong></div>
                        </div>
                        <div class="raptor-inst-item">
                            <div class="raptor-inst-icon">⚡</div>
                            <div>Sonido 2 =<br><strong>¡SALTO!</strong></div>
                        </div>
                        <div class="raptor-inst-item">
                            <div class="raptor-inst-icon">🎯</div>
                            <div>Apunta y Dispara<br><strong>(POW!)</strong></div>
                        </div>
                        <div class="raptor-inst-item">
                            <div class="raptor-inst-icon">💀</div>
                            <div>Si falla =<br><strong>TE DEVORA</strong></div>
                        </div>
                    </div>
                    <button class="raptor-btn raptor-btn-primary" id="raptor-start-btn">▶ COMENZAR CACERÍA</button>
                </div>

                <!-- Pantalla derrota -->
                <div class="raptor-screen" id="raptor-lose-screen">
                    <div class="raptor-screen-title" style="color:#e74c3c;">💀 ¡TE HA DEVORADO!</div>
                    <div class="raptor-screen-sub">
                        El Velociraptor cayó sobre ti antes de que pudieras jalar el gatillo.<br>
                        <em>"Clever girl..."</em> Sé más rápido con el disparo en cuanto salte.
                    </div>
                    <button class="raptor-btn raptor-btn-primary" id="raptor-retry-btn">🔄 REINTENTAR</button>
                    <button class="raptor-btn raptor-btn-secondary" id="raptor-lose-close">CERRAR</button>
                </div>

                <!-- Pantalla victoria -->
                <div class="raptor-screen" id="raptor-win-screen">
                    <div class="raptor-screen-title" style="color:#2ecc71;">🏆 ¡ZONA ASEGURADA!</div>
                    <div class="raptor-screen-sub">
                        ¡Has abatido a los 5 Velociraptores con reflejos de cazador experto!<br>
                        Lograste cruzar la hierba alta de Isla Sorna con vida.
                    </div>
                    <button class="raptor-btn raptor-btn-primary" id="raptor-win-replay">🔄 JUGAR DE NUEVO</button>
                    <button class="raptor-btn raptor-btn-secondary" id="raptor-win-close">CERRAR</button>
                </div>
            </div>

            <div id="raptor-status-bar">
                <div id="raptor-mission-text">🎯 OBJETIVO: ELIMINAR 5 VELOCIRAPTORES</div>
                <div class="raptor-pips-wrap">
                    <span style="color:#aaa;margin-right:4px;">RAPTORES:</span>
                    <span class="raptor-pip" id="rp-1"></span>
                    <span class="raptor-pip" id="rp-2"></span>
                    <span class="raptor-pip" id="rp-3"></span>
                    <span class="raptor-pip" id="rp-4"></span>
                    <span class="raptor-pip" id="rp-5"></span>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
    }

    // ============================================================
    //  FAB BUTTON
    // ============================================================
    function buildFAB() {
        var fab = document.createElement('button');
        fab.id = 'raptor-fab';
        fab.title = "¡Ataque Raptor! - Minijuego de Puntería Velociraptor";
        fab.innerHTML = `
            <img src="Raptor%20Model.png" onerror="if(this.src.indexOf('Raptor%20Attack')===-1)this.src='Raptor%20Attack/Raptor%20Model.png';" alt="Velociraptor">
            <span>
                <span class="raptor-fab-title">¡Ataque Raptor!</span>
                <span class="raptor-fab-sub">Caza en la hierba alta</span>
            </span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    // ============================================================
    //  CANVAS
    // ============================================================
    function setupCanvas() {
        canvas = document.getElementById('raptor-canvas');
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        var wrap = document.getElementById('raptor-canvas-wrap');
        if (!wrap || !canvas) return;
        var W = wrap.clientWidth, H = wrap.clientHeight;
        var cw, ch;
        if (W / H > LW / LH) { ch = H; cw = Math.round(ch * LW / LH); }
        else                  { cw = W; ch = Math.round(cw * LH / LW); }
        canvas.width  = cw; canvas.height = ch;
        canvasW = cw; canvasH = ch;
        scale   = cw / LW;
    }

    // ============================================================
    //  SPAWN Y SECUENCIA DEL RAPTOR
    // ============================================================
    function spawnRaptor() {
        if (killedCount >= TARGET_RAPTORS) {
            triggerWin();
            return;
        }

        // Posición horizontal aleatoria entre 200 y 1000
        raptorX = 220 + Math.random() * (LW - 440);
        // Posición vertical asomándose justo detrás del horizonte de la hierba alta
        raptorY = 320 + Math.random() * 20;
        raptorFacing = Math.random() > 0.5 ? 1 : -1;
        raptorScale = 0.52;

        state = 'lurking';
        stateTimer = 1600 + Math.random() * 800 - (killedCount * 120); // Se vuelve más rápido cada ronda
        if (stateTimer < 1100) stateTimer = 1100;

        // Sonido Uno: llamada / acecho previo al salto
        playAudio(sndUno);
    }

    function startLeap() {
        state = 'leaping';
        leapProgress = 0;
        raptorStartY = 370;
        raptorY = 370;
        leapDuration = 1200 - (killedCount * 70); // Salto cada vez más rápido
        if (leapDuration < 800) leapDuration = 800;

        // Sonido Dos: chillido del salto / ataque aéreo
        playAudio(sndDos);
    }

    // ============================================================
    //  DISPARO Y DETECCIÓN DE IMPACTO
    // ============================================================
    function onShoot(clientX, clientY) {
        if (state !== 'lurking' && state !== 'leaping') return;

        var rect = canvas.getBoundingClientRect();
        var lx = (clientX - rect.left) / scale;
        var ly = (clientY - rect.top) / scale;

        // Activa el efecto visual "POW!" (Shoot Model)
        powActive = true;
        powX = lx;
        powY = ly;
        powTimer = 320;
        powScale = 0.85;

        // Sonido de disparo sintetizado y sacudida de pantalla
        playGunshotFX();
        shakeTimer = 180;
        shakeMag = 6;

        // Bounding box del Raptor
        var rw = 220 * raptorScale;
        var rh = 280 * raptorScale;
        var rx = raptorX - rw / 2;
        var ry = raptorY - rh / 2;

        // Solo se puede abatir al Raptor cuando está en pleno salto (visible fuera del pastizal)
        var margin = 45 * raptorScale;
        var isHit = (state === 'leaping') &&
                    (lx >= rx - margin && lx <= rx + rw + margin &&
                     ly >= ry - margin && ly <= ry + rh + margin);

        if (isHit) {
            // ¡Impacto certero!
            state = 'shot';
            killedCount++;
            updateHUD();

            if (killedCount >= TARGET_RAPTORS) {
                setTimeout(function () {
                    triggerWin();
                }, 700);
            } else {
                setTimeout(function () {
                    if (state === 'shot') {
                        spawnRaptor();
                    }
                }, 900);
            }
        }
    }

    // ============================================================
    //  VICTORIA Y DERROTA
    // ============================================================
    function triggerBitePlayer() {
        state = 'hit_player';
        stopAllAudio();
        // Sonido Tres: Ataque mortal / devorado
        playAudio(sndTres);
        shakeTimer = 600;
        shakeMag = 18;

        setTimeout(function () {
            document.getElementById('raptor-lose-screen').classList.add('show');
        }, 1100);
    }

    function triggerWin() {
        state = 'won';
        stopAllAudio();
        setTimeout(function () {
            document.getElementById('raptor-win-screen').classList.add('show');
        }, 600);
    }

    function updateHUD() {
        for (var i = 1; i <= TARGET_RAPTORS; i++) {
            var pip = document.getElementById('rp-' + i);
            if (pip) {
                if (i <= killedCount) pip.classList.add('filled');
                else pip.classList.remove('filled');
            }
        }
    }

    function hideScreens() {
        ['raptor-start-screen','raptor-lose-screen','raptor-win-screen'].forEach(function (id) {
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

        // 1. Fondo estático de la hierba alta con luna (nunca se mueve)
        if (imgs.fondo.complete) {
            ctx.drawImage(imgs.fondo, 0, 0, canvasW, canvasH);
        }

        // Función para renderizar al Raptor
        function drawRaptor() {
            var rImg = (state === 'lurking') ? imgs.raptor1 : imgs.raptor2;
            if (!rImg.complete) return;

            var drawW = Math.round(230 * raptorScale * scale);
            var drawH = Math.round(310 * raptorScale * scale);
            var drawX = Math.round(raptorX * scale) - Math.round(drawW / 2);
            var drawY = Math.round(raptorY * scale) - Math.round(drawH / 2);

            ctx.save();
            if (raptorFacing === -1) {
                ctx.translate(Math.round(raptorX * scale), Math.round(raptorY * scale));
                ctx.scale(-1, 1);
                ctx.drawImage(rImg, -Math.round(drawW / 2), -Math.round(drawH / 2), drawW, drawH);
            } else {
                ctx.drawImage(rImg, drawX, drawY, drawW, drawH);
            }

            // Si fue impactado por un disparo: flash rojo de impacto
            if (state === 'shot') {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = 'rgba(231,76,60,0.6)';
                ctx.fillRect(drawX, drawY, drawW, drawH);
            }
            ctx.restore();
        }

        // 2. Capa intermedia/frontal: Fondo Pastizal (hierba alta)
        // Durante el acecho (Sonido Uno), el Raptor está completamente oculto bajo la hierba.
        if (imgs.pastizal.complete) {
            ctx.drawImage(imgs.pastizal, 0, 0, canvasW, canvasH);
        }

        // 3. El Raptor es visible ÚNICAMENTE cuando SALTA (Sonido Dos), recibe impacto (shot) o ataca (hit_player)
        // En ese momento salta al frente de Fondo Pastizal
        if (state === 'leaping' || state === 'shot' || state === 'hit_player') {
            drawRaptor();
        }

        // 3. Efecto "POW!" (Shoot Model)
        if (powActive && imgs.shoot.complete) {
            powTimer -= dt * 1000;
            powScale += dt * 1.8;
            if (powTimer <= 0) {
                powActive = false;
            } else {
                var pw = Math.round(220 * powScale * scale);
                var ph = Math.round(124 * powScale * scale);
                var px = Math.round(powX * scale) - Math.round(pw / 2);
                var py = Math.round(powY * scale) - Math.round(ph / 2);
                ctx.drawImage(imgs.shoot, px, py, pw, ph);
            }
        }

        // 4. Flash rojo al ser mordido
        if (state === 'hit_player') {
            ctx.fillStyle = 'rgba(180, 0, 0, 0.55)';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // 5. Mirilla (Crosshair Model) sobre el cursor
        if (isMouseInside && imgs.crosshair.complete && state !== 'lost' && state !== 'won') {
            var chSize = Math.round(58 * scale);
            var chX = Math.round(mouseX * scale) - Math.round(chSize / 2);
            var chY = Math.round(mouseY * scale) - Math.round(chSize / 2);
            ctx.drawImage(imgs.crosshair, chX, chY, chSize, chSize);
        }

        ctx.restore();
    }

    // ============================================================
    //  BUCLE PRINCIPAL
    // ============================================================
    function gameLoop(now) {
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (state === 'lurking') {
            stateTimer -= dt * 1000;
            // Pequeño movimiento sutil de acecho entre las hojas
            raptorScale = 0.52 + Math.sin(now * 0.007) * 0.025;
            if (stateTimer <= 0) {
                startLeap();
            }
        } else if (state === 'leaping') {
            leapProgress += (dt * 1000) / leapDuration;
            if (leapProgress > 1) leapProgress = 1;
            // Salto arqueado hacia la cámara: escala aumenta drásticamente
            raptorScale = 0.55 + Math.pow(leapProgress, 1.4) * 2.3;
            raptorY = raptorStartY - Math.sin(leapProgress * Math.PI) * 110 + (leapProgress * 140);

            if (leapProgress >= 1) {
                // El raptor llegó a la pantalla sin ser disparado
                triggerBitePlayer();
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
        killedCount = 0;
        powActive = false;
        shakeTimer = 0;
        hideScreens();
        updateHUD();
        stopAllAudio();
        playAudio(sndBG);

        spawnRaptor();

        if (aniFrame) cancelAnimationFrame(aniFrame);
        lastTime = performance.now();
        aniFrame = requestAnimationFrame(gameLoop);
    }

    function closeGame() {
        stopAllAudio();
        if (aniFrame) { cancelAnimationFrame(aniFrame); aniFrame = null; }
        state = 'idle';
        document.getElementById('raptor-overlay').classList.remove('open');
    }

    // ============================================================
    //  EVENTOS DE ENTRADA (MOUSE Y TOUCH)
    // ============================================================
    function attachInput() {
        canvas.addEventListener('mousemove', function (e) {
            isMouseInside = true;
            var rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / scale;
            mouseY = (e.clientY - rect.top) / scale;
        });

        canvas.addEventListener('mouseleave', function () {
            isMouseInside = false;
        });

        canvas.addEventListener('mousedown', function (e) {
            isMouseInside = true;
            onShoot(e.clientX, e.clientY);
        });

        // Soporte táctil en móvil
        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            isMouseInside = true;
            var t = e.touches[0];
            var rect = canvas.getBoundingClientRect();
            mouseX = (t.clientX - rect.left) / scale;
            mouseY = (t.clientY - rect.top) / scale;
            onShoot(t.clientX, t.clientY);
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            var t = e.touches[0];
            var rect = canvas.getBoundingClientRect();
            mouseX = (t.clientX - rect.left) / scale;
            mouseY = (t.clientY - rect.top) / scale;
        }, { passive: false });
    }

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        buildOverlay();
        buildFAB();
        initAudio();

        var overlay = document.getElementById('raptor-overlay');
        var ready = false;

        document.getElementById('raptor-fab').addEventListener('click', function () {
            overlay.classList.add('open');
            if (!ready) {
                ready = true;
                setupCanvas();
                loadAllImages(function () {
                    render(0);
                    attachInput();
                });
            }
        });

        document.getElementById('raptor-close-btn').addEventListener('click', closeGame);
        var raFullBtn = document.getElementById('raptor-fullscreen-btn');
        if (raFullBtn) {
            raFullBtn.addEventListener('click', function () {
                var target = document.getElementById('raptor-overlay') || document.documentElement;
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                    raFullBtn.innerHTML = '🗗 SALIR';
                } else {
                    if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                    raFullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
                }
            });
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) raFullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
                else raFullBtn.innerHTML = '🗗 SALIR';
            });
        }
        document.getElementById('raptor-start-btn').addEventListener('click', startGame);

        document.getElementById('raptor-retry-btn').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('raptor');
            document.getElementById('raptor-lose-screen').classList.remove('show');
            startGame();
        });
        document.getElementById('raptor-lose-close').addEventListener('click', closeGame);

        document.getElementById('raptor-win-replay').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('raptor');
            document.getElementById('raptor-win-screen').classList.remove('show');
            startGame();
        });
        document.getElementById('raptor-win-close').addEventListener('click', closeGame);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) closeGame();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
