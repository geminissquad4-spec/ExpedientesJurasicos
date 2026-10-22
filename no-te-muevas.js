// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡NO TE MUEVAS!
//  Minijuego: Ayuda a Jackson a escapar del recinto del T-Rex
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('maintenance-overlay')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×675) ----
    var LW = 1200, LH = 675;
    var HUMAN_H        = 210;  // Altura exacta proporcional
    var HUMAN_W        = Math.round(HUMAN_H * 172 / 231); // ~156px
    var JACKSON_START  = 110;  // X lógico inicio (izquierda)
    var JACKSON_EXIT   = 1120; // X lógico meta (derecha)
    var JACKSON_FLOOR  = 664;  // Y lógico pies de Jackson (en el suelo entre la vegetación)
    var MOVE_THRESHOLD = 8;    // px de movimiento permitidos cuando Rex mira
    var MAX_STEP_SPEED = 14;   // Límite de avance por evento para evitar cruzar de un solo jalón

    // Puntos de alerta obligatorios en el camino (20%, 42%, 64%, 84%)
    var CHECKPOINTS = [0.20, 0.42, 0.64, 0.84];
    var passedCheckpoints = [false, false, false, false];

    // ---- ESTADO DEL JUEGO ----
    var state        = 'idle';  // idle | eating | looking | caught | escaped
    var jacksonX     = JACKSON_START;
    var isDragging   = false;
    var dragOffsetX  = 0;
    var lastPtrX     = 0;
    var caughtDelta  = 0;
    var continuousMoveDist = 0; // Medidor de ruido por caminar sin pausa
    var customStatusMsg = '';
    var rexAlpha     = 0;       // 0=comiendo, 1=mirando (crossfade)
    var rexAlphaTarget = 0;
    var stateTimer   = 0;
    var aniFrame     = null;
    var lastTime     = 0;
    var scale        = 1;
    var canvasW      = 0, canvasH = 0;

    // ---- IMÁGENES ----
    var imgs = {
        fondo1:   new Image(),
        fondo2:   new Image(),
        rexEat:   new Image(),
        rexLook:  new Image(),
        human:    new Image()
    };

    // ---- AUDIO ----
    var sndBG   = null;
    var sndEat  = null;
    var sndRoar = null;

    // ---- DOM ----
    var canvas, ctx;

    // ============================================================
    //  ESTILOS
    // ============================================================
    function injectStyles() {
        var s = document.createElement('style');
        s.textContent = `
            /* --- FAB button --- */
            #ntm-fab {
                position: fixed;
                bottom: 96px; right: 28px;   /* Apilado justo arriba del botón Compy */
                left: auto;
                z-index: 99990;
                display: flex; align-items: center; gap: 0.55rem;
                padding: 0.65rem 1.3rem 0.65rem 0.9rem;
                background: rgba(20, 4, 2, 0.92);
                border: 2px solid #e74c3c; border-radius: 50px;
                cursor: pointer; user-select: none;
                color: #ff6b6b;
                font-family: 'Orbitron','Share Tech Mono',monospace;
                font-size: 0.78rem; font-weight: 700;
                letter-spacing: 1.5px; text-transform: uppercase;
                box-shadow: 0 0 22px rgba(231,76,60,.45), 0 4px 16px rgba(0,0,0,.6);
                backdrop-filter: blur(8px);
                transition: all .22s ease;
                animation: ntm-fab-pulse 2.8s ease-in-out infinite;
            }
            #ntm-fab:hover {
                background: rgba(231,76,60,.2);
                box-shadow: 0 0 44px rgba(231,76,60,.7), 0 4px 20px rgba(0,0,0,.7);
                transform: scale(1.07) translateY(-2px);
            }
            #ntm-fab img {
                width: 48px;
                height: auto;
                max-height: 32px;
                object-fit: contain;
                filter: drop-shadow(0 0 6px rgba(231,76,60,.7));
                pointer-events: none;
            }
            .ntm-fab-title { display:block; font-size:.78rem; }
            .ntm-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#ff9999; letter-spacing:1px; opacity:.85; }
            @keyframes ntm-fab-pulse {
                0%,100%{ box-shadow:0 0 22px rgba(231,76,60,.45),0 4px 16px rgba(0,0,0,.6); }
                50%    { box-shadow:0 0 44px rgba(231,76,60,.7), 0 4px 20px rgba(0,0,0,.7); }
            }

            /* --- Overlay principal --- */
            #ntm-overlay {
                position: fixed; inset: 0; z-index: 99995;
                background: #000;
                display: none; flex-direction: column;
            }
            #ntm-overlay.open { display: flex; }

            /* Header */
            #ntm-header {
                flex-shrink: 0;
                display: flex; align-items: center; justify-content: space-between;
                padding: .55rem 1rem;
                background: rgba(0,0,0,.88);
                border-bottom: 2px solid #e74c3c;
                backdrop-filter: blur(4px);
                z-index: 10;
            }
            #ntm-header-title {
                font-family:'Orbitron',monospace; font-size:.95rem; font-weight:900;
                color:#e74c3c; letter-spacing:2px; text-transform:uppercase;
            }
            #ntm-close-btn {
                background:transparent; border:1px solid rgba(231,76,60,.4); color:#cc8888;
                font-family:'Share Tech Mono',monospace; font-size:.75rem;
                padding:.3rem .9rem; border-radius:3px; cursor:pointer;
                letter-spacing:1px; transition:all .2s;
            }
            #ntm-close-btn:hover { background:rgba(231,76,60,.2); color:#ff6b6b; border-color:#e74c3c; }

            /* Canvas wrap */
            #ntm-canvas-wrap {
                flex: 1;
                position: relative;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                background: #0a0502;
            }
            #ntm-canvas { display:block; cursor:grab; touch-action:none; }
            #ntm-canvas:active { cursor:grabbing; }

            /* Status bar */
            #ntm-status-bar {
                flex-shrink: 0;
                display: flex; align-items: center; gap: 1rem;
                padding: .45rem 1.2rem;
                background: rgba(0,0,0,.88);
                border-top: 1px solid rgba(231,76,60,.3);
                font-family:'Share Tech Mono',monospace; font-size:.82rem;
                backdrop-filter: blur(4px); z-index:10;
            }
            #ntm-rex-status {
                font-family:'Orbitron',monospace; font-size:.8rem; font-weight:900;
                letter-spacing:1.5px; text-transform:uppercase; min-width:320px;
                transition: color .3s;
            }
            #ntm-rex-status.eating  { color:#2ecc71; }
            #ntm-rex-status.looking { color:#e74c3c; animation:ntm-flash .35s infinite alternate; }
            @keyframes ntm-flash { from{opacity:.4} to{opacity:1} }

            .ntm-prog-wrap { flex:1; display:flex; align-items:center; gap:.6rem; }
            .ntm-prog-label { color:#888; font-size:.72rem; white-space:nowrap; }
            .ntm-prog-bg { flex:1; height:10px; background:rgba(255,255,255,.08); border:1px solid #444; border-radius:2px; overflow:hidden; }
            .ntm-prog-fill { height:100%; width:0%; background:linear-gradient(90deg,#e74c3c,#f39c12,#2ecc71); transition:width .3s ease; }
            #ntm-prog-val { color:#888; font-size:.72rem; min-width:36px; text-align:right; }

            /* ---- Pantallas flotantes (inicio / derrota / victoria) ---- */
            .ntm-screen {
                position:absolute; inset:0; z-index:20;
                display:none; flex-direction:column;
                align-items:center; justify-content:center;
                text-align:center;
                background:rgba(0,0,0,.82);
                backdrop-filter:blur(7px);
                font-family:'Share Tech Mono',monospace;
                padding: 1rem;
            }
            .ntm-screen.show { display:flex; animation:ntm-pop .3s ease-out; }
            @keyframes ntm-pop {
                from { opacity:0; transform:scale(.95); }
                to   { opacity:1; transform:scale(1); }
            }

            .ntm-screen-title {
                font-family:'Orbitron',monospace;
                font-size:clamp(1.4rem,4vw,2.4rem);
                font-weight:900; letter-spacing:3px; text-transform:uppercase;
                margin-bottom:.5rem;
            }
            .ntm-screen-sub {
                font-size:clamp(.75rem,2vw,.95rem); color:#aaa;
                margin-bottom:1.8rem; max-width:540px; line-height:1.6;
            }
            .ntm-instruct {
                display:flex; gap:1.8rem; margin:.8rem 0 1.6rem;
                flex-wrap:wrap; justify-content:center;
                font-size:.78rem; color:#ccc;
            }
            .ntm-inst-item { display:flex; flex-direction:column; align-items:center; gap:.4rem; }
            .ntm-inst-icon { font-size:1.8rem; }

            .ntm-btn {
                font-family:'Orbitron',monospace; font-size:.82rem; font-weight:700;
                letter-spacing:1.5px; padding:.65rem 1.7rem;
                border:none; border-radius:4px; cursor:pointer;
                transition:all .2s ease; text-transform:uppercase; margin:.3rem;
            }
            .ntm-btn-primary { background:#e74c3c; color:#fff; box-shadow:0 0 14px rgba(231,76,60,.4); }
            .ntm-btn-primary:hover { background:#ff6b55; box-shadow:0 0 28px rgba(231,76,60,.7); transform:translateY(-2px); }
            .ntm-btn-secondary { background:transparent; border:1px solid #e74c3c; color:#e74c3c; }
            .ntm-btn-secondary:hover { background:rgba(231,76,60,.15); }

            /* ---- Responsive móvil ---- */
            @media (max-width:600px) {
                #ntm-fab { bottom:74px; right:16px; left:auto; padding:.5rem .9rem .5rem .65rem; }
                #ntm-fab img { width:38px; height:auto; max-height:26px; }
                .ntm-fab-title { font-size:.65rem; }
                .ntm-fab-sub   { display:none; }
                #ntm-status-bar { font-size:.68rem; padding:.35rem .6rem; gap:.5rem; }
                #ntm-rex-status { font-size:.65rem; min-width:160px; letter-spacing:.5px; }
                #ntm-header { padding:.35rem .7rem; }
                #ntm-header-title { font-size:.76rem; }
                .ntm-instruct { gap:1rem; }
            }
            @media (max-width:600px) and (orientation:portrait) {
                #ntm-status-bar { flex-direction:column; align-items:flex-start; gap:.25rem; }
                .ntm-prog-wrap { width:100%; }
            }
        `;
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'ntm-overlay';
        ov.innerHTML = `
            <div id="ntm-header">
                <div id="ntm-header-title">🦖 ¡NO TE MUEVAS! — RECINTO DEL TYRANNOSAURUS</div>
                <button id="ntm-close-btn">✕ CERRAR</button>
            </div>

            <div id="ntm-canvas-wrap">
                <canvas id="ntm-canvas"></canvas>

                <!-- Pantalla de inicio -->
                <div class="ntm-screen show" id="ntm-start-screen">
                    <div class="ntm-screen-title" style="color:#e74c3c;">🦖 ¡NO TE MUEVAS!</div>
                    <div class="ntm-screen-sub">
                        Ayuda a Jackson a cruzar y escapar del recinto del Tyrannosaurus.<br>
                        <strong style="color:#2ecc71;">Arrastra a Jackson</strong> con sigilo hacia la derecha mientras el Rex come.<br>
                        En partes clave del camino y cuando levante la cabeza, <strong style="color:#e74c3c;">¡SUELTA EL CURSOR Y QUÉDATE COMPLETAMENTE QUIETO!</strong>
                    </div>
                    <div class="ntm-instruct">
                        <div class="ntm-inst-item">
                            <div class="ntm-inst-icon">👣</div>
                            <div>Arrastra con sigilo<br>(¡No corras de golpe!)</div>
                        </div>
                        <div class="ntm-inst-item">
                            <div class="ntm-inst-icon">🟢</div>
                            <div>Rex comiendo =<br><strong>AVANZA</strong></div>
                        </div>
                        <div class="ntm-inst-item">
                            <div class="ntm-inst-icon">🔴</div>
                            <div>Rex alerta =<br><strong>¡CONGÉLATE!</strong></div>
                        </div>
                        <div class="ntm-inst-item">
                            <div class="ntm-inst-icon">🏁</div>
                            <div>Cruza el recinto<br>para sobrevivir</div>
                        </div>
                    </div>
                    <button class="ntm-btn ntm-btn-primary" id="ntm-start-btn">▶ COMENZAR</button>
                </div>

                <!-- Pantalla de derrota -->
                <div class="ntm-screen" id="ntm-caught-screen">
                    <div class="ntm-screen-title" style="color:#e74c3c;">💀 ¡TE HA VISTO!</div>
                    <div class="ntm-screen-sub">
                        El Tyrannosaurus detectó el movimiento de Jackson.<br>
                        Recuerda: su visión se basa en el movimiento. En cuanto levante la mirada, suelta el control y no muevas ni un píxel.
                    </div>
                    <button class="ntm-btn ntm-btn-primary" id="ntm-retry-btn">🔄 REINTENTAR</button>
                    <button class="ntm-btn ntm-btn-secondary" id="ntm-caught-close">CERRAR</button>
                </div>

                <!-- Pantalla de victoria -->
                <div class="ntm-screen" id="ntm-win-screen">
                    <div class="ntm-screen-title" style="color:#2ecc71;">🎉 ¡JACKSON LOGRÓ ESCAPAR!</div>
                    <div class="ntm-screen-sub">
                        ¡Cruzaste todo el recinto del Tyrannosaurus sin ser devorado!<br>
                        Sobreviviste a la criatura más imponente de Jurassic Park.
                    </div>
                    <button class="ntm-btn ntm-btn-primary" id="ntm-win-replay">🔄 JUGAR DE NUEVO</button>
                    <button class="ntm-btn ntm-btn-secondary" id="ntm-win-close">CERRAR</button>
                </div>
            </div>

            <div id="ntm-status-bar">
                <div id="ntm-rex-status" class="eating">🦴 REX COMIENDO — ¡AVANZA CON CUIDADO!</div>
                <div class="ntm-prog-wrap">
                    <span class="ntm-prog-label">ESCAPE:</span>
                    <div class="ntm-prog-bg"><div class="ntm-prog-fill" id="ntm-prog-fill"></div></div>
                    <span id="ntm-prog-val">0%</span>
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
        fab.id = 'ntm-fab';
        fab.title = "¡No te MUEVAS! - Minijuego Tyrannosaurus Rex";
        fab.innerHTML = `
            <img src="Rex Move/Rex Model.png" alt="Rex Model">
            <span>
                <span class="ntm-fab-title">¡No te MUEVAS!</span>
                <span class="ntm-fab-sub">Escape del Tyrannosaurus</span>
            </span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    // ============================================================
    //  AUDIO
    // ============================================================
    function initAudio() {
        sndBG   = new Audio('Rex Move/Music Fondo.mp4');  sndBG.loop = true;  sndBG.volume = 0.32;
        sndEat  = new Audio('Rex Move/T-Rex Eating - Sound Effect.mp4'); sndEat.loop = true; sndEat.volume = 0.55;
        sndRoar = new Audio('Rex Move/Tyrannosaurus Rex.mp4'); sndRoar.volume = 0.95;
    }
    function playBG()   { if(sndBG)   { sndBG.currentTime=0;   sndBG.play().catch(function(){}); } }
    function stopBG()   { if(sndBG)   { sndBG.pause(); sndBG.currentTime=0; } }
    function playEat()  { if(sndEat)  { sndEat.currentTime=0;  sndEat.play().catch(function(){}); } }
    function stopEat()  { if(sndEat)  { sndEat.pause(); sndEat.currentTime=0; } }
    function playRoar() { if(sndRoar) { sndRoar.currentTime=0; sndRoar.play().catch(function(){}); } }
    function stopAll()  { stopBG(); stopEat(); if(sndRoar){ sndRoar.pause(); sndRoar.currentTime=0; } }

    // ============================================================
    //  DIFICULTAD (tiempos de comida y mirada según avance)
    // ============================================================
    function difficulty(progress) {
        return {
            eatMs:  Math.max(850,  2400 - progress * 1550), // 2.4s al inicio -> 850ms cerca del final
            lookMs: Math.min(3600, 1900 + progress * 1700)  // 1.9s al inicio -> 3.6s al final
        };
    }

    function getProgress() {
        return Math.max(0, Math.min(1, (jacksonX - JACKSON_START) / (JACKSON_EXIT - JACKSON_START)));
    }

    // ============================================================
    //  CANVAS
    // ============================================================
    function setupCanvas() {
        canvas = document.getElementById('ntm-canvas');
        ctx    = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        var wrap = document.getElementById('ntm-canvas-wrap');
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
    //  RENDER
    // ============================================================
    function render(dt) {
        if (!ctx || !canvasW) return;
        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Fondo estático de la selva
        if (imgs.fondo1.complete) ctx.drawImage(imgs.fondo1, 0, 0, canvasW, canvasH);

        // 2. Rex con transición de postura
        var speed = (state === 'caught') ? 14 : 6;
        rexAlpha += (rexAlphaTarget - rexAlpha) * Math.min(1, (dt || 0.016) * speed);

        if (imgs.rexEat.complete && rexAlpha < 1) {
            ctx.globalAlpha = 1 - rexAlpha;
            ctx.drawImage(imgs.rexEat, 0, 0, canvasW, canvasH);
        }
        if (imgs.rexLook.complete && rexAlpha > 0) {
            ctx.globalAlpha = rexAlpha;
            ctx.drawImage(imgs.rexLook, 0, 0, canvasW, canvasH);
        }
        ctx.globalAlpha = 1;

        // 3. Vegetación frontal que cubre las patas del Rex
        if (imgs.fondo2.complete) ctx.drawImage(imgs.fondo2, 0, 0, canvasW, canvasH);

        // 4. Jackson al frente de la vegetación (pies en el suelo)
        if (imgs.human.complete && state !== 'idle') {
            var hH = Math.round(HUMAN_H * scale);
            var hW = Math.round(HUMAN_W * scale);
            var jX = Math.round(jacksonX * scale) - Math.round(hW / 2);
            var jY = Math.round(JACKSON_FLOOR * scale) - hH;
            ctx.drawImage(imgs.human, jX, jY, hW, hH);
        }

        // 5. Filtros de victoria o captura
        if (state === 'caught') {
            ctx.fillStyle = 'rgba(180,0,0,0.38)';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
        if (state === 'escaped') {
            ctx.fillStyle = 'rgba(0,180,80,0.22)';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
    }

    // ============================================================
    //  ALERTA INMEDIATA DEL REX (Checkpoints o ruido excesivo)
    // ============================================================
    function alertRex(customMsg) {
        if (state !== 'eating') return;
        state = 'looking';
        rexAlphaTarget = 1;
        caughtDelta = 0;
        continuousMoveDist = 0;
        customStatusMsg = customMsg || '';
        stopEat();
        var d = difficulty(getProgress());
        stateTimer = d.lookMs;
        updateHUD();
    }

    // ============================================================
    //  BUCLE PRINCIPAL DE JUEGO
    // ============================================================
    function gameLoop(now) {
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (state === 'eating' || state === 'looking') {
            stateTimer -= dt * 1000;

            if (state === 'eating' && stateTimer <= 0) {
                // Rex levanta la cabeza de forma natural por temporizador
                state = 'looking';
                rexAlphaTarget = 1;
                caughtDelta = 0;
                customStatusMsg = '';
                var d = difficulty(getProgress());
                stateTimer = d.lookMs;
                stopEat();
                updateHUD();
            } else if (state === 'looking' && stateTimer <= 0) {
                // Rex vuelve a alimentarse
                state = 'eating';
                rexAlphaTarget = 0;
                caughtDelta = 0;
                customStatusMsg = '';
                var d2 = difficulty(getProgress());
                stateTimer = d2.eatMs;
                playEat();
                updateHUD();
            }
        }

        render(dt);

        if (state === 'eating' || state === 'looking') {
            aniFrame = requestAnimationFrame(gameLoop);
        }
    }

    // ============================================================
    //  LÓGICA DE PARTIDA
    // ============================================================
    function startGame() {
        jacksonX       = JACKSON_START;
        state          = 'eating';
        rexAlpha       = 0;
        rexAlphaTarget = 0;
        caughtDelta    = 0;
        continuousMoveDist = 0;
        customStatusMsg = '';
        passedCheckpoints = [false, false, false, false];
        isDragging     = false;

        var d = difficulty(0);
        stateTimer     = d.eatMs;

        hideAllScreens();
        updateHUD();
        updateProgress();
        stopAll();
        playBG();
        playEat();

        if (aniFrame) cancelAnimationFrame(aniFrame);
        lastTime = performance.now();
        aniFrame = requestAnimationFrame(gameLoop);
    }

    function triggerCaught() {
        if (state === 'caught' || state === 'escaped' || state === 'idle') return;
        state = 'caught';
        rexAlphaTarget = 1;
        isDragging = false;
        stopAll();
        playRoar();
        render(0);
        setTimeout(function () {
            document.getElementById('ntm-caught-screen').classList.add('show');
        }, 900);
    }

    function triggerEscaped() {
        state = 'escaped';
        isDragging = false;
        stopAll();
        updateProgress();
        render(0);
        setTimeout(function () {
            document.getElementById('ntm-win-screen').classList.add('show');
        }, 500);
    }

    function updateHUD() {
        var el = document.getElementById('ntm-rex-status');
        if (!el) return;
        if (state === 'eating') {
            el.textContent = '🦴 REX COMIENDO — ¡AVANZA CON CUIDADO!';
            el.className = 'eating';
        } else if (state === 'looking') {
            el.textContent = customStatusMsg || '👁️ REX ALERTA — ¡NO TE MUEVAS!';
            el.className = 'looking';
        }
    }

    function updateProgress() {
        var p = getProgress();
        var fill = document.getElementById('ntm-prog-fill');
        var val  = document.getElementById('ntm-prog-val');
        if (fill) fill.style.width = (p * 100).toFixed(0) + '%';
        if (val)  val.textContent  = (p * 100).toFixed(0) + '%';
    }

    function hideAllScreens() {
        ['ntm-start-screen','ntm-caught-screen','ntm-win-screen'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('show');
        });
    }

    // ============================================================
    //  CONTROLES DE ARRASTRE Y DETECCIÓN
    // ============================================================
    function logicalX(clientX) {
        var rect = canvas.getBoundingClientRect();
        return (clientX - rect.left) / (rect.width / LW);
    }

    function onDown(clientX) {
        if (state !== 'eating' && state !== 'looking') return;
        var lx = logicalX(clientX);
        // Área táctil amplia alrededor de Jackson
        if (Math.abs(lx - jacksonX) < HUMAN_W * 1.25) {
            isDragging  = true;
            dragOffsetX = lx - jacksonX;
            lastPtrX    = lx;
        }
    }

    function onMove(clientX) {
        if (!isDragging) return;
        var lx = logicalX(clientX);
        var dx = Math.abs(lx - lastPtrX);
        lastPtrX = lx;

        // Si el Rex está mirando: cualquier movimiento detectado condena a Jackson
        if (state === 'looking') {
            caughtDelta += dx;
            if (caughtDelta > MOVE_THRESHOLD) {
                triggerCaught();
            }
            return; // No se mueve si el Rex mira
        }

        // Si el Rex está comiendo: Jackson avanza a paso sigiloso (evita saltarse el juego)
        if (state === 'eating') {
            var targetX = Math.max(JACKSON_START, Math.min(JACKSON_EXIT, lx - dragOffsetX));
            
            // Limitador de velocidad por paso
            if (targetX > jacksonX) {
                jacksonX = Math.min(targetX, jacksonX + MAX_STEP_SPEED);
            } else if (targetX < jacksonX) {
                jacksonX = Math.max(targetX, jacksonX - MAX_STEP_SPEED);
            }

            updateProgress();

            // 1. Detección de CHECKPOINTS OBLIGATORIOS en el camino
            var prog = getProgress();
            for (var i = 0; i < CHECKPOINTS.length; i++) {
                if (!passedCheckpoints[i] && prog >= CHECKPOINTS[i]) {
                    passedCheckpoints[i] = true;
                    alertRex('⚠️ ¡CRAC! RAMA ROTA — EL REX SE LEVANTA');
                    return;
                }
            }

            // 2. Detección de ruido por avance continuo sin pausa
            continuousMoveDist += dx;
            if (continuousMoveDist > 180) {
                continuousMoveDist = 0;
                alertRex('⚠️ ¡DEMASIADO RUIDO! EL REX TE ESCUCHÓ');
                return;
            }

            // Llegada a la meta
            if (jacksonX >= JACKSON_EXIT) {
                triggerEscaped();
            }
        }
    }

    function onUp() {
        isDragging = false;
        continuousMoveDist = 0; // Reinicia el contador de ruido al detenerse
    }

    function attachInput() {
        canvas.addEventListener('mousedown', function(e) { onDown(e.clientX); });
        window.addEventListener('mousemove', function(e) { if (isDragging) onMove(e.clientX); });
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault(); onDown(e.touches[0].clientX);
        }, { passive: false });
        window.addEventListener('touchmove', function(e) {
            if (isDragging) { e.preventDefault(); onMove(e.touches[0].clientX); }
        }, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    // ============================================================
    //  CARGA DE IMÁGENES
    // ============================================================
    function loadImages(cb) {
        var loaded = 0, total = Object.keys(imgs).length;
        function done() { if (++loaded >= total) cb(); }
        imgs.fondo1.onload  = done; imgs.fondo1.src  = 'Rex Move/Fondo 1.jpg';
        imgs.fondo2.onload  = done; imgs.fondo2.src  = 'Rex Move/Fondo 2.png';
        imgs.rexEat.onload  = done; imgs.rexEat.src  = 'Rex Move/Rex Eat Model.png';
        imgs.rexLook.onload = done; imgs.rexLook.src = 'Rex Move/Rex Model.png';
        imgs.human.onload   = done; imgs.human.src   = 'Rex Move/Human Model.png';
    }

    // ============================================================
    //  CIERRE
    // ============================================================
    function closeGame() {
        stopAll();
        if (aniFrame) { cancelAnimationFrame(aniFrame); aniFrame = null; }
        state = 'idle';
        document.getElementById('ntm-overlay').classList.remove('open');
    }

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        injectStyles();
        buildOverlay();
        buildFAB();
        initAudio();

        var overlay    = document.getElementById('ntm-overlay');
        var gameReady  = false;

        // Abrir overlay al pulsar el botón del Rex
        document.getElementById('ntm-fab').addEventListener('click', function () {
            overlay.classList.add('open');
            if (!gameReady) {
                gameReady = true;
                setupCanvas();
                loadImages(function () {
                    render(0); // Muestra la escena inicial
                    attachInput();
                });
            }
        });

        // Botones de pantalla
        document.getElementById('ntm-close-btn').addEventListener('click', closeGame);
        document.getElementById('ntm-start-btn').addEventListener('click', startGame);

        document.getElementById('ntm-retry-btn').addEventListener('click', function () {
            document.getElementById('ntm-caught-screen').classList.remove('show');
            stopAll(); startGame();
        });
        document.getElementById('ntm-caught-close').addEventListener('click', closeGame);

        document.getElementById('ntm-win-replay').addEventListener('click', function () {
            document.getElementById('ntm-win-screen').classList.remove('show');
            stopAll(); startGame();
        });
        document.getElementById('ntm-win-close').addEventListener('click', closeGame);

        // Escape para cerrar
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
