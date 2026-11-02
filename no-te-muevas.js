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
    var isMuted  = false;
    var isPaused = false;

    // ---- DOM ----
    var canvas, ctx;

    // ============================================================
    //  ESTILOS
    // ============================================================
    function injectStyles() {
        var s = document.createElement('style');
        s.textContent = `
            /* --- BOTONES DE CABECERA ESTANDARIZADOS (.ej-btn-header) --- */
            .ej-header-actions {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                margin-left: auto !important;
                flex-shrink: 0 !important;
                z-index: 100 !important;
            }
            .ej-btn-header {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 5px !important;
                background: rgba(0, 20, 20, 0.85) !important;
                border: 1.5px solid #00f5ff !important;
                color: #00f5ff !important;
                font-family: 'Share Tech Mono', 'Courier New', monospace !important;
                font-size: 0.75rem !important;
                font-weight: 700 !important;
                padding: 0.35rem 0.75rem !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                letter-spacing: 1px !important;
                text-transform: uppercase !important;
                transition: all 0.2s ease !important;
                line-height: 1 !important;
                height: 32px !important;
                box-sizing: border-box !important;
                touch-action: manipulation !important;
                box-shadow: 0 0 8px rgba(0, 245, 255, 0.25) !important;
                white-space: nowrap !important;
            }
            .ej-btn-header:hover {
                background: rgba(0, 245, 255, 0.25) !important;
                box-shadow: 0 0 14px rgba(0, 245, 255, 0.6) !important;
                color: #ffffff !important;
            }
            .ej-btn-header.ej-btn-header-danger {
                border-color: #ff4757 !important;
                color: #ff4757 !important;
                background: rgba(255, 71, 87, 0.12) !important;
                box-shadow: 0 0 8px rgba(255, 71, 87, 0.3) !important;
            }
            .ej-btn-header.ej-btn-header-danger:hover {
                background: #ff4757 !important;
                color: #ffffff !important;
                box-shadow: 0 0 16px rgba(255, 71, 87, 0.7) !important;
            }

            /* --- BANNER PANTALLA COMPLETA EN INICIO --- */
            .ntm-fs-banner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.8rem;
                background: rgba(0, 245, 255, 0.1);
                border: 1.5px solid #00f5ff;
                border-radius: 8px;
                padding: 0.65rem 1rem;
                margin-bottom: 1.1rem;
                box-shadow: 0 0 18px rgba(0, 245, 255, 0.25);
                max-width: 580px;
                width: 100%;
                box-sizing: border-box;
            }
            .ntm-fs-text {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-family: 'Share Tech Mono', monospace;
                font-size: 0.78rem;
                color: #00f5ff;
                text-align: left;
                line-height: 1.35;
            }
            .ntm-fs-icon {
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            .ntm-fs-toggle-btn {
                background: #00f5ff;
                color: #020b06;
                border: none;
                padding: 0.45rem 0.95rem;
                border-radius: 4px;
                font-family: 'Orbitron', monospace;
                font-size: 0.75rem;
                font-weight: 900;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                flex-shrink: 0;
                touch-action: manipulation;
            }
            .ntm-fs-toggle-btn:hover {
                background: #55ffff;
                box-shadow: 0 0 16px rgba(0, 245, 255, 0.8);
                transform: scale(1.04);
            }
            .ntm-start-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                width: 100%;
                margin-top: 0.4rem;
            }
            .ntm-start-fullscreen-btn {
                background: linear-gradient(135deg, #00f5ff, #0099bb) !important;
                color: #020b06 !important;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.55) !important;
                font-weight: 900 !important;
            }
            .ntm-start-fullscreen-btn:hover {
                background: linear-gradient(135deg, #55ffff, #00d4ff) !important;
                box-shadow: 0 0 32px rgba(0, 245, 255, 0.9) !important;
                transform: translateY(-2px);
            }

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
            @media (max-width: 768px), (max-height: 520px) {
                #ntm-fab { bottom:74px; right:16px; left:auto; padding:.5rem .9rem .5rem .65rem; }
                #ntm-fab img { width:38px; height:auto; max-height:26px; }
                .ntm-fab-title { font-size:.65rem; }
                .ntm-fab-sub   { display:none; }
                #ntm-status-bar { font-size:.68rem; padding:.35rem .6rem; gap:.5rem; }
                #ntm-rex-status { font-size:.65rem; min-width:160px; letter-spacing:.5px; }
                #ntm-header { padding:.35rem .6rem; height: 38px; min-height: 38px; }
                #ntm-header-title { font-size:.74rem; }
                .ej-btn-header { height: 28px !important; padding: 0.25rem 0.5rem !important; font-size: 0.7rem !important; }
                .ej-btn-header .ej-btn-lbl { display: none !important; }
                .ntm-instruct { gap:0.8rem; margin: 0.4rem 0 1rem; }
                .ntm-inst-item { font-size: 0.7rem; }
                .ntm-inst-icon { font-size: 1.3rem; }
                .ntm-screen-title { font-size: 1.25rem; margin-bottom: 0.3rem; }
                .ntm-screen-sub { font-size: 0.74rem; margin-bottom: 0.8rem; line-height: 1.4; }
                .ntm-fs-banner { padding: 0.45rem 0.75rem; margin-bottom: 0.7rem; }
                .ntm-fs-text { font-size: 0.7rem; }
                .ntm-fs-toggle-btn { padding: 0.35rem 0.65rem; font-size: 0.68rem; }
                .ntm-btn { font-size: 0.75rem; padding: 0.55rem 1.2rem; }
            }
            @media (max-height: 520px) {
                .ntm-instruct { display: none !important; }
                .ntm-screen-sub { margin-bottom: 0.4rem; font-size: 0.72rem; }
                .ntm-fs-banner { margin-bottom: 0.4rem; padding: 0.35rem 0.6rem; }
                .ntm-btn { padding: 0.45rem 1rem; font-size: 0.72rem; }
            }
            @media (max-width: 600px) and (orientation:portrait) {
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
                <div class="ej-header-actions" style="display:flex;align-items:center;gap:8px;">
                    <button id="ntm-mute-btn" class="ej-btn-header"><span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span></button>
                    <button id="ntm-pause-btn" class="ej-btn-header"><span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span></button>
                    <button id="ntm-fullscreen-btn" class="ej-btn-header"><span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span></button>
                    <button id="ntm-close-btn" class="ej-btn-header ej-btn-header-danger"><span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span></button>
                </div>
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
                    <!-- Banner de recomendación pantalla completa -->
                    <div class="ntm-fs-banner" id="ntm-fs-banner">
                        <div class="ntm-fs-text">
                            <span class="ntm-fs-icon">💡</span>
                            <span>RECOMENDADO EN CELULARES: Jugar en pantalla completa para mejor visibilidad y control táctil.</span>
                        </div>
                        <button type="button" class="ntm-fs-toggle-btn" id="ntm-start-fs-toggle-btn">
                            <span class="ej-ic">⛶</span> ACTIVAR
                        </button>
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
                    <div class="ntm-start-actions">
                        <button class="ntm-btn ntm-btn-primary ntm-start-fullscreen-btn" id="ntm-start-fullscreen-btn">
                            <span class="ej-ic">⛶</span> JUGAR EN PANTALLA COMPLETA
                        </button>
                        <button class="ntm-btn ntm-btn-secondary" id="ntm-start-btn">▶ COMENZAR</button>
                    </div>
                </div>

                <!-- Pantalla de derrota -->
                <div class="ntm-screen" id="ntm-caught-screen">
                    <div class="ntm-screen-title" style="color:#e74c3c;">💀 ¡TE HA VISTO!</div>
                    <div class="ntm-screen-sub">
                        El Tyrannosaurus detectó el movimiento de Jackson.<br>
                        Recuerda: su visión se basa en el movimiento. En cuanto levante la mirada, suelta el control y no muevas ni un píxel.
                    </div>
                    <div class="ej-modal-actions">
                        <button class="ej-btn-replay" id="ntm-retry-btn">↺ Volver a jugar</button>
                        <button class="ej-btn-return" id="ntm-caught-close">✕ Regresar al sitio</button>
                    </div>
                </div>

                <!-- Pantalla de victoria -->
                <div class="ntm-screen" id="ntm-win-screen">
                    <div class="ntm-screen-title" style="color:#2ecc71;">🎉 ¡JACKSON LOGRÓ ESCAPAR!</div>
                    <div class="ntm-screen-sub">
                        ¡Cruzaste todo el recinto del Tyrannosaurus sin ser devorado!<br>
                        Sobreviviste a la criatura más imponente de Jurassic Park.
                    </div>
                    <div class="ej-modal-actions">
                        <button class="ej-btn-replay" id="ntm-win-replay">↺ Volver a jugar</button>
                        <button class="ej-btn-return" id="ntm-win-close">✕ Regresar al sitio</button>
                    </div>
                </div>
            
                <!-- Overlay de Pausa -->
                <div class="ej-pause-overlay" id="ntm-pause-screen" style="display:none;">
                    <div class="ej-pause-card">
                        <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>
                        <div class="ej-pause-sub">Escape del Tyrannosaurus en pausa</div>
                        <button class="ej-btn-resume" id="ntm-btn-resume">▶ REANUDAR</button>
                    </div>
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
            <img src="Rex%20Model.png" onerror="if(this.src.indexOf('Rex%20Move')===-1)this.src='Rex%20Move/Rex%20Model.png';" alt="Rex Model">
            <span>
                <span class="ntm-fab-title">¡No te MUEVAS!</span>
                <span class="ntm-fab-sub">Escape del Tyrannosaurus</span>
            </span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    // ============================================================
    //  AUDIO CON RESOLUCIÓN AUTOMÁTICA (RAÍZ Y CARPETA)
    // ============================================================
    function createAudioWithFallback(filename, loop, vol) {
        var primary = encodeURI(filename);
        var fallback = 'Rex%20Move/' + encodeURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function() {
            if (a.src.indexOf('Rex%20Move') === -1 && a.src.indexOf('Rex Move') === -1) {
                a.src = fallback;
            }
        });
        return a;
    }

    function initAudio() {
        sndBG   = createAudioWithFallback('Music Fondo.mp4', true, 0.32);
        sndEat  = createAudioWithFallback('T-Rex Eating - Sound Effect.mp4', true, 0.55);
        sndRoar = createAudioWithFallback('Tyrannosaurus Rex.mp4', false, 0.95);
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

    function togglePause() {
        if (state !== 'eating' && state !== 'looking') return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('ntm-pause-btn');
        var pauseScreen = document.getElementById('ntm-pause-screen');
        if (isPaused) {
            if (sndBG) try { sndBG.pause(); } catch(e){}
            if (sndEat) try { sndEat.pause(); } catch(e){}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndBG && !isMuted) try { sndBG.play().catch(function(){}); } catch(e){}
            if (sndEat && !isMuted && state === 'eating') try { sndEat.play().catch(function(){}); } catch(e){}
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
        if (isPaused) {
            lastTime = now;
            if (state !== 'idle') aniFrame = requestAnimationFrame(gameLoop);
            return;
        }
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
        // Área táctil extra amplia para dedos en pantallas móviles
        var hitTol = Math.max(HUMAN_W * 1.35, 95);
        if (Math.abs(lx - jacksonX) < hitTol) {
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
            if (e.touches && e.touches[0]) {
                if (e.cancelable) e.preventDefault();
                onDown(e.touches[0].clientX);
            }
        }, { passive: false });
        window.addEventListener('touchmove', function(e) {
            if (isDragging && e.touches && e.touches[0]) {
                if (e.cancelable) e.preventDefault();
                onMove(e.touches[0].clientX);
            }
        }, { passive: false });
        window.addEventListener('touchend', function(e) {
            if (e.cancelable) e.preventDefault();
            onUp();
        }, { passive: false });
        window.addEventListener('touchcancel', onUp);
    }

    // ============================================================
    //  CARGA DE IMÁGENES CON COMPATIBILIDAD DE RUTA
    // ============================================================
    function loadImageWithFallback(img, filename, onDone) {
        var primary = encodeURI(filename);
        var fallback = 'Rex%20Move/' + encodeURI(filename);
        var finished = false;

        function markDone() {
            if (!finished) {
                finished = true;
                onDone();
            }
        }

        img.onload = markDone;
        img.onerror = function () {
            // Si falló en la raíz, prueba dentro de la carpeta Rex Move/
            if (img.src.indexOf('Rex%20Move') === -1 && img.src.indexOf('Rex Move') === -1) {
                img.src = fallback;
            } else {
                console.warn('No se pudo cargar imagen:', filename);
                markDone();
            }
        };

        // Intenta primero en la raíz del repositorio (donde los subiste)
        img.src = primary;
    }

    function loadImages(cb) {
        var loaded = 0, total = Object.keys(imgs).length;
        function done() { if (++loaded >= total) cb(); }
        loadImageWithFallback(imgs.fondo1,  'Fondo 1.jpg', done);
        loadImageWithFallback(imgs.fondo2,  'Fondo 2.png', done);
        loadImageWithFallback(imgs.rexEat,  'Rex Eat Model.png', done);
        loadImageWithFallback(imgs.rexLook, 'Rex Model.png', done);
        loadImageWithFallback(imgs.human,   'Human Model.png', done);
    }

    // ============================================================
    //  CIERRE
    // ============================================================
    function closeGame() {
        stopAll();
        if (aniFrame) { cancelAnimationFrame(aniFrame); aniFrame = null; }
        state = 'idle'; isPaused = false;
        var ov = document.getElementById('ntm-overlay');
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
        function openGame() {
            overlay.classList.add('open');
            if (!gameReady) {
                gameReady = true;
                setupCanvas();
                loadImages(function () {
                    render(0);
                });
            }
        }
        window.openNoTeMuevas = openGame;
        document.getElementById('ntm-fab').addEventListener('click', openGame);

        // Botones de pantalla
        document.getElementById('ntm-close-btn').addEventListener('click', closeGame);

        var muteBtn = document.getElementById('ntm-mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', function () {
                isMuted = !isMuted;
                muteBtn.innerHTML = isMuted ? '<span class="ej-ic">🔇</span><span class="ej-btn-lbl"> SILENCIADO</span>' : '<span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span>';
                if (sndBG) sndBG.muted = isMuted;
                if (sndEat) sndEat.muted = isMuted;
                if (sndRoar) sndRoar.muted = isMuted;
            });
        }
        var pauseBtn = document.getElementById('ntm-pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
        var resumeBtn = document.getElementById('ntm-btn-resume');
        if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

        var ntmFullBtn = document.getElementById('ntm-fullscreen-btn');
        var startFsBtn = document.getElementById('ntm-start-fullscreen-btn');
        var bannerToggleBtn = document.getElementById('ntm-start-fs-toggle-btn');

        function toggleFullscreen() {
            var target = document.getElementById('ntm-overlay') || document.documentElement;
            var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (!isFs) {
                if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        }

        function updateFullscreenUI() {
            var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (ntmFullBtn) {
                ntmFullBtn.innerHTML = isFs 
                    ? '<span class="ej-ic">🗗</span><span class="ej-btn-lbl"> SALIR</span>' 
                    : '<span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span>';
            }
            if (bannerToggleBtn) {
                bannerToggleBtn.innerHTML = isFs 
                    ? '<span class="ej-ic">🗗</span> DESACTIVAR' 
                    : '<span class="ej-ic">⛶</span> ACTIVAR';
            }
            if (startFsBtn) {
                startFsBtn.innerHTML = isFs 
                    ? '<span class="ej-ic">▶</span> JUGAR AHORA' 
                    : '<span class="ej-ic">⛶</span> JUGAR EN PANTALLA COMPLETA';
            }
        }

        if (ntmFullBtn) ntmFullBtn.addEventListener('click', toggleFullscreen);
        if (bannerToggleBtn) bannerToggleBtn.addEventListener('click', toggleFullscreen);
        
        if (startFsBtn) {
            startFsBtn.addEventListener('click', function () {
                var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    var target = document.getElementById('ntm-overlay') || document.documentElement;
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                }
                startGame();
            });
        }

        document.addEventListener('fullscreenchange', updateFullscreenUI);
        document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

        document.getElementById('ntm-start-btn').addEventListener('click', startGame);

        document.getElementById('ntm-retry-btn').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('ntm');
            document.getElementById('ntm-caught-screen').classList.remove('show');
            stopAll(); startGame();
        });
        document.getElementById('ntm-caught-close').addEventListener('click', closeGame);

        document.getElementById('ntm-win-replay').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('ntm');
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
