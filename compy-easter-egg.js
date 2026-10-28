// ============================================================
//  EXPEDIENTES JURÁSICOS — MINIJUEGO COMPY (EASTER EGG)
//  Botón flotante: ¡Atrapa al COMPY!
// ============================================================

(function () {
    'use strict';

    // No mostrar si estamos en modo mantenimiento
    if (document.getElementById('maintenance-overlay')) return;

    var cfg = (window.MAINTENANCE_CONFIG && window.MAINTENANCE_CONFIG.minigame) || {};

    function injectStyles() {
        var style = document.createElement('style');
        style.textContent = `
            /* ---- BOTÓN FLOTANTE COMPY ---- */
            #compy-fab {
                position: fixed;
                bottom: 28px;
                right: 28px;
                z-index: 99990;
                display: flex;
                align-items: center;
                gap: 0.55rem;
                padding: 0.65rem 1.3rem 0.65rem 0.9rem;
                background: rgba(3, 14, 8, 0.92);
                border: 2px solid #00e5b0;
                border-radius: 50px;
                cursor: pointer;
                color: #00e5b0;
                font-family: 'Orbitron', 'Share Tech Mono', monospace;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                box-shadow: 0 0 22px rgba(0, 229, 176, 0.4), 0 4px 16px rgba(0,0,0,0.6);
                backdrop-filter: blur(8px);
                transition: all 0.22s ease;
                animation: compy-fab-pulse 2.8s ease-in-out infinite;
                user-select: none;
            }
            #compy-fab:hover {
                background: rgba(0, 229, 176, 0.18);
                box-shadow: 0 0 42px rgba(0, 229, 176, 0.65), 0 4px 20px rgba(0,0,0,0.7);
                transform: scale(1.07) translateY(-2px);
            }
            #compy-fab:active { transform: scale(0.97); }
            #compy-fab img {
                width: 38px;
                height: auto;
                filter: drop-shadow(0 0 5px rgba(0,229,176,0.5));
                pointer-events: none;
            }
            #compy-fab .fab-label { line-height: 1.2; }
            #compy-fab .fab-title { display: block; font-size: 0.78rem; }
            #compy-fab .fab-sub { display: block; font-size: 0.58rem; font-family: 'Share Tech Mono', monospace; color: #88dac0; letter-spacing: 1px; opacity: 0.85; }

            @keyframes compy-fab-pulse {
                0%, 100% { box-shadow: 0 0 22px rgba(0,229,176,0.4), 0 4px 16px rgba(0,0,0,0.6); }
                50% { box-shadow: 0 0 40px rgba(0,229,176,0.65), 0 4px 20px rgba(0,0,0,0.7); }
            }

            /* ---- OVERLAY DEL MINIJUEGO ---- */
            #compy-game-overlay {
                position: fixed;
                inset: 0;
                z-index: 99995;
                background: rgba(2, 8, 5, 0.96);
                backdrop-filter: blur(6px);
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: 'Rajdhani', 'Share Tech Mono', monospace;
            }
            #compy-game-overlay.open {
                display: flex;
                animation: compy-overlay-in 0.28s ease-out;
            }
            @keyframes compy-overlay-in {
                from { opacity: 0; transform: scale(0.97); }
                to   { opacity: 1; transform: scale(1); }
            }

            /* Cabecera del overlay */
            #compy-overlay-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 96%;
                max-width: 1050px;
                padding: 0.7rem 0;
                margin-bottom: 0.5rem;
            }
            #compy-overlay-title {
                font-family: 'Orbitron', monospace;
                font-size: 1.1rem;
                font-weight: 900;
                color: #00e5b0;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            #compy-overlay-close {
                background: transparent;
                border: 1px solid rgba(0,229,176,0.4);
                color: #88a892;
                font-family: 'Share Tech Mono', monospace;
                font-size: 0.75rem;
                padding: 0.3rem 0.9rem;
                border-radius: 3px;
                cursor: pointer;
                letter-spacing: 1px;
                transition: all 0.2s;
            }
            #compy-overlay-close:hover { background: rgba(0,229,176,0.15); color: #00e5b0; border-color: #00e5b0; }

            /* Arena del juego */
            #compy-ee-arena {
                position: relative;
                width: 96%;
                max-width: 1050px;
                height: clamp(280px, 44vh, 400px);
                background: rgba(3, 10, 6, 0.85);
                border: 2px solid rgba(0, 229, 176, 0.5);
                box-shadow: 0 0 40px rgba(0,229,176,0.2), inset 0 0 40px rgba(0,0,0,0.85);
                border-radius: 10px;
                overflow: hidden;
                cursor: crosshair;
                user-select: none;
            }
            /* Cables SVG */
            #compy-ee-cables {
                position: absolute; inset: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 2;
            }
            .ee-cable { fill: none; stroke-linecap: round; }
            .ee-cable-1 { stroke: #27ae60; stroke-width: 5; }
            .ee-cable-2 { stroke: #e67e22; stroke-width: 6; }
            .ee-cable-3 { stroke: #2980b9; stroke-width: 5; stroke-dasharray: 8 6; animation: ee-glitch 0.3s infinite; }
            .ee-cable-4 { stroke: #c0392b; stroke-width: 7; }
            @keyframes ee-glitch { 0%{stroke-dashoffset:0} 50%{stroke-dashoffset:4} 100%{stroke-dashoffset:0} }

            /* Canvas partículas */
            #compy-ee-canvas {
                position: absolute; inset: 0; width: 100%; height: 100%;
                z-index: 4; pointer-events: none;
            }
            /* Sprite compy */
            #compy-ee-actor {
                position: absolute; z-index: 10;
                width: 120px; height: 44px;
                transform-origin: center;
                cursor: grab;
                transition: transform 0.08s linear;
                filter: drop-shadow(0 0 10px rgba(0,229,176,0.4));
            }
            #compy-ee-actor img { width:100%; height:100%; object-fit:contain; pointer-events:none; }
            .ee-compy-biting  { animation: ee-chomp 0.12s infinite alternate ease-in-out; }
            @keyframes ee-chomp { 0%{transform:scale(1) rotate(0deg)} 100%{transform:scale(1.06,0.94) rotate(-3deg)} }
            .ee-compy-running { animation: ee-run 0.15s infinite alternate ease-in-out; }
            @keyframes ee-run  { 0%{transform:translateY(0) rotate(1deg)} 100%{transform:translateY(-4px) rotate(-1deg)} }

            /* Jaula */
            #compy-ee-cage {
                position: absolute; z-index: 20;
                width: 160px; height: 120px;
                background: repeating-linear-gradient(90deg,rgba(231,76,60,.85) 0,rgba(231,76,60,.85) 7px,transparent 7px,transparent 20px),
                            repeating-linear-gradient(0deg,rgba(231,76,60,.85) 0,rgba(231,76,60,.85) 7px,transparent 7px,transparent 20px);
                border: 4px solid #ff3333;
                box-shadow: 0 0 30px rgba(255,51,51,.7), inset 0 0 20px rgba(255,51,51,.5);
                border-radius: 6px; display: none; pointer-events: none;
                transform: translateY(-400px);
                transition: transform 0.4s cubic-bezier(0.1,0.9,0.2,1.2);
            }
            #compy-ee-cage.drop { display: block; transform: translateY(0); }

            /* HUD inferior */
            #compy-ee-hud {
                position: absolute; bottom: 0; left: 0; width: 100%; z-index: 15;
                display: flex; justify-content: space-between; align-items: center;
                padding: 0.5rem 1.2rem; box-sizing: border-box;
                background: rgba(2,6,4,0.94);
                border-top: 1px solid rgba(0,229,176,0.35);
                font-family: 'Share Tech Mono', monospace; font-size: 0.82rem;
            }
            .ee-int-wrap { display:flex; align-items:center; gap:0.7rem; min-width:230px; }
            .ee-int-bg { width:130px; height:11px; background:rgba(255,255,255,.1); border:1px solid #446655; border-radius:2px; overflow:hidden; }
            .ee-int-fill { height:100%; width:100%; background:linear-gradient(90deg,#e74c3c,#f39c12,#2ecc71); transition:width .3s ease; }
            .ee-pip-wrap { display:flex; align-items:center; gap:0.5rem; color:#f1c40f; font-weight:700; }
            .ee-pip { display:inline-block; width:13px; height:13px; border:2px solid #f1c40f; border-radius:50%; background:transparent; transition:background .2s; }
            .ee-pip.on { background:#f1c40f; box-shadow:0 0 10px #f1c40f; }
            #ee-status { color:#00e5b0; }

            /* Misión pill */
            #ee-mission-pill {
                position:absolute; top:10px; left:12px; z-index:15;
                background:rgba(0,0,0,.85); border:1px solid rgba(231,76,60,.6);
                color:#ff6666; padding:0.35rem 0.8rem; border-radius:4px;
                font-family:'Share Tech Mono',monospace; font-size:0.78rem;
                letter-spacing:1px; pointer-events:none;
            }

            /* Modales victoria / derrota */
            .ee-modal {
                position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                z-index:30; text-align:center;
                background:rgba(2,6,4,.95); border:2px solid #00e5b0;
                box-shadow:0 0 45px rgba(0,229,176,.5);
                padding:1.6rem 2.2rem; border-radius:8px;
                display:none; max-width:90%;
            }
            .ee-modal.show { display:block; animation:ee-pop .3s ease-out; }
            @keyframes ee-pop {
                0%  { transform:translate(-50%,-50%) scale(0.8); opacity:0; }
                100%{ transform:translate(-50%,-50%) scale(1);   opacity:1; }
            }
            .ee-modal-title { font-family:'Orbitron',monospace; font-size:1.4rem; font-weight:900; letter-spacing:2px; margin-bottom:.5rem; }
            .ee-modal-title.win  { color:#2ecc71; text-shadow:0 0 15px rgba(46,204,113,.6); }
            .ee-modal-title.lose { color:#e74c3c; text-shadow:0 0 15px rgba(231,76,60,.6); }
            .ee-modal-desc { font-family:'Share Tech Mono',monospace; font-size:.9rem; color:#c8dac0; margin-bottom:1.2rem; }
            .ee-btn {
                font-family:'Orbitron',monospace; font-size:.8rem; font-weight:700;
                letter-spacing:1.5px; padding:.6rem 1.4rem;
                border:none; border-radius:4px; cursor:pointer;
                transition:all .2s ease; text-transform:uppercase; margin:0 .3rem;
            }
            .ee-btn-primary { background:#00e5b0; color:#03140d; box-shadow:0 0 15px rgba(0,229,176,.4); }
            .ee-btn-primary:hover { background:#33ffcc; box-shadow:0 0 25px rgba(0,229,176,.7); transform:translateY(-2px); }
            .ee-btn-secondary { background:transparent; border:1px solid #00e5b0; color:#00e5b0; }
            .ee-btn-secondary:hover { background:rgba(0,229,176,.15); }

            /* ---- RESPONSIVE MÓVIL ---- */

            /* Botón flotante más pequeño en móvil */
            @media (max-width: 600px) {
                #compy-fab {
                    bottom: 16px; right: 16px;
                    padding: 0.5rem 1rem 0.5rem 0.7rem;
                    font-size: 0.68rem;
                }
                #compy-fab img { width: 30px; }
                #compy-fab .fab-title { font-size: 0.68rem; }
                #compy-fab .fab-sub { font-size: 0.5rem; }
            }

            /* Overlay en portrait: pantalla completa real */
            @media (max-width: 600px) and (orientation: portrait) {
                #compy-game-overlay { justify-content: flex-start; padding-top: 0; }

                #compy-overlay-header {
                    width: 100%;
                    padding: 0.5rem 0.8rem;
                    box-sizing: border-box;
                }
                #compy-overlay-title { font-size: 0.85rem; }

                #compy-ee-arena {
                    width: 100%;
                    max-width: 100%;
                    height: calc(100dvh - 52px); /* ocupa toda la pantalla menos el header */
                    border-radius: 0;
                    border-left: none;
                    border-right: none;
                }

                /* HUD más compacto */
                #compy-ee-hud {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.25rem;
                    padding: 0.35rem 0.8rem;
                    font-size: 0.7rem;
                }
                .ee-int-bg { width: 90px; }

                /* Mission pill */
                #ee-mission-pill {
                    font-size: 0.62rem;
                    padding: 0.2rem 0.5rem;
                    max-width: 78%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Compy más grande para tocar con el dedo */
                #compy-ee-actor { width: 140px; height: 52px; }

                /* Modales */
                .ee-modal { padding: 1.2rem 1.2rem; }
                .ee-modal-title { font-size: 1.1rem; }
                .ee-modal-desc { font-size: 0.78rem; }
                .ee-btn { font-size: 0.7rem; padding: 0.5rem 0.9rem; }
            }

            /* Landscape en móvil */
            @media (max-width: 900px) and (orientation: landscape) and (max-height: 500px) {
                #compy-ee-arena { height: calc(100dvh - 48px); border-radius: 0; }
                #compy-ee-hud { font-size: 0.68rem; padding: 0.3rem 0.8rem; }
                #compy-overlay-header { padding: 0.3rem 0.8rem; }
                #compy-overlay-title { font-size: 0.8rem; }
            }
        `;
        document.head.appendChild(style);
    }

    function buildOverlay() {
        var overlay = document.createElement('div');
        overlay.id = 'compy-game-overlay';
        overlay.innerHTML = `
            <div id="compy-overlay-header">
                <div id="compy-overlay-title">⚡ ¡ATRAPA AL COMPY!</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button id="compy-fullscreen-btn" class="minigame-fullscreen-btn">⛶ PANTALLA COMPLETA</button>
                    <button id="compy-overlay-close">✕ CERRAR</button>
                </div>
            </div>
            <div id="compy-ee-arena">
                <div id="ee-mission-pill">⚠️ MISIÓN: ¡ATRAPA AL COMPY ANTES DE QUE DESTRUYA LOS CABLES!</div>
                <svg id="compy-ee-cables" viewBox="0 0 1000 400" preserveAspectRatio="none">
                    <path class="ee-cable ee-cable-1" d="M0,60 C300,130 700,20 1000,70"/>
                    <path class="ee-cable ee-cable-2" d="M0,150 C250,210 750,90 1000,170"/>
                    <path class="ee-cable ee-cable-3" d="M0,240 C350,310 650,180 1000,260"/>
                    <path class="ee-cable ee-cable-4" d="M0,320 C320,370 680,260 1000,330"/>
                </svg>
                <canvas id="compy-ee-canvas"></canvas>
                <div id="compy-ee-actor" class="ee-compy-biting">
                    <img src="compy_sprite.png" alt="Compsognathus">
                </div>
                <div id="compy-ee-cage"></div>
                <div id="compy-ee-hud">
                    <div class="ee-int-wrap">
                        <span>RED ELÉCTRICA:</span>
                        <div class="ee-int-bg"><div class="ee-int-fill" id="ee-int-fill"></div></div>
                        <span id="ee-int-val">100%</span>
                    </div>
                    <div class="ee-pip-wrap">
                        <span>CONTENCIÓN:</span>
                        <span class="ee-pip" id="ee-pip-1"></span>
                        <span class="ee-pip" id="ee-pip-2"></span>
                        <span class="ee-pip" id="ee-pip-3"></span>
                    </div>
                    <div id="ee-status">⚡ COMPY MASTICANDO CABLE</div>
                </div>
                <div class="ee-modal" id="ee-win-modal">
                    <div class="ee-modal-title win">¡COMPY CAPTURADO!</div>
                    <div class="ee-modal-desc">Has restaurado la integridad de la red eléctrica de InGen Corporation.</div>
                    <button class="ee-btn ee-btn-primary" id="ee-btn-replay">VOLVER A JUGAR</button>
                    <button class="ee-btn ee-btn-secondary" id="ee-btn-close-win">CERRAR</button>
                </div>
                <div class="ee-modal" id="ee-lose-modal">
                    <div class="ee-modal-title lose">¡FALLO TOTAL DE ENERGÍA!</div>
                    <div class="ee-modal-desc">El Compy cortó los cables principales. Reinicia los disyuntores.</div>
                    <button class="ee-btn ee-btn-primary" id="ee-btn-retry">REINTENTAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function buildFAB() {
        var fab = document.createElement('button');
        fab.id = 'compy-fab';
        fab.innerHTML = `
            <img src="compy_sprite.png" alt="Compy">
            <span class="fab-label">
                <span class="fab-title">¡Atrapa al COMPY!</span>
                <span class="fab-sub">Compy Cable Chomper</span>
            </span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    // ---- AUDIO ----
    var audioCtx = null;
    function getAC() {
        if (!audioCtx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }
    function playSparkSound() {
        try {
            var ctx = getAC(); if (!ctx) return;
            var sz = ctx.sampleRate * 0.08, buf = ctx.createBuffer(1, sz, ctx.sampleRate), d = buf.getChannelData(0);
            for (var i = 0; i < sz; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(sz*0.4));
            var n = ctx.createBufferSource(); n.buffer = buf;
            var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
            var g = ctx.createGain(); g.gain.value = 0.2;
            n.connect(f); f.connect(g); g.connect(ctx.destination); n.start();
        } catch(e) {}
    }
    function playChirp() {
        try {
            var audio = new Audio('Rugidos/Compsognathus.mp4');
            audio.currentTime = 0;
            var p = audio.play();
            if (p) p.catch(function() {
                try {
                    var ctx = getAC(); if(!ctx) return;
                    var o = ctx.createOscillator(), g = ctx.createGain();
                    o.type = 'sawtooth';
                    o.frequency.setValueAtTime(2200, ctx.currentTime);
                    o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime+0.16);
                    g.gain.setValueAtTime(0.3, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.16);
                    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.18);
                } catch(e2){}
            });
        } catch(e) {}
    }
    function playCage() {
        try {
            var ctx = getAC(); if(!ctx) return;
            var o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(240, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime+0.35);
            g.gain.setValueAtTime(0.4, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.35);
            o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.35);
        } catch(e) {}
    }

    // ---- MOTOR DEL JUEGO ----
    function initGame() {
        var arena     = document.getElementById('compy-ee-arena');
        var compy     = document.getElementById('compy-ee-actor');
        var canvas    = document.getElementById('compy-ee-canvas');
        var cage      = document.getElementById('compy-ee-cage');
        var intFill   = document.getElementById('ee-int-fill');
        var intVal    = document.getElementById('ee-int-val');
        var status    = document.getElementById('ee-status');
        var winModal  = document.getElementById('ee-win-modal');
        var loseModal = document.getElementById('ee-lose-modal');
        var btnReplay = document.getElementById('ee-btn-replay');
        var btnRetry  = document.getElementById('ee-btn-retry');
        var btnCloseW = document.getElementById('ee-btn-close-win');

        var ctx2d = canvas.getContext('2d');
        var W = arena.clientWidth || 800, H = arena.clientHeight || 400;

        function resize() { W = arena.clientWidth; H = arena.clientHeight; canvas.width = W; canvas.height = H; }
        resize();
        window.addEventListener('resize', resize);

        var targetCatches   = cfg.targetCatches   || 3;
        var baseMult        = cfg.compySpeedMultiplier || 1.4;
        var evasionRadius = cfg.evasionRadius || 110;
        // En móvil táctil, el radio de evasión es mayor (más difícil)
        if ('ontouchstart' in window) evasionRadius = Math.round(evasionRadius * 1.35);
        var damagePerBite   = cfg.damagePerBite   || 1.2;
        var biteDuration    = cfg.biteDuration    || 900;

        var cableLevels = [0.18, 0.42, 0.65, 0.82];
        var state, integrity, catches, mult, cableIdx, cX, cY, facing, biting, biteTimer, tX, tY, lastT;

        function reset() {
            state = 'playing'; integrity = 100; catches = 0; mult = baseMult;
            cableIdx = 1; cX = W*0.5; cY = H*cableLevels[1]; facing = 1;
            biting = true; biteTimer = 0; tX = cX; tY = cY; lastT = performance.now();
            cage.classList.remove('drop');
            winModal.classList.remove('show'); loseModal.classList.remove('show');
            document.querySelectorAll('.ee-pip').forEach(function(p){ p.classList.remove('on'); });
            updateHUD();
        }

        var sparks = [];
        function addSparks(x, y, n, col) {
            for (var i = 0; i < n; i++) {
                var a = Math.random()*Math.PI*2, sp = 2+Math.random()*7;
                sparks.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.5,
                    life:1, decay:0.025+Math.random()*0.04,
                    color: col || (Math.random()>0.3?'#00e5b0':'#f1c40f'),
                    size:1.5+Math.random()*2.5});
            }
        }
        function drawSparks() {
            ctx2d.clearRect(0,0,W,H);
            for (var i = sparks.length-1; i >= 0; i--) {
                var p = sparks[i];
                p.x+=p.vx; p.y+=p.vy; p.vy+=0.22; p.life-=p.decay;
                if (p.life<=0){ sparks.splice(i,1); continue; }
                ctx2d.save(); ctx2d.globalAlpha=p.life; ctx2d.fillStyle=p.color;
                ctx2d.shadowColor=p.color; ctx2d.shadowBlur=8;
                ctx2d.beginPath(); ctx2d.arc(p.x,p.y,p.size,0,Math.PI*2); ctx2d.fill(); ctx2d.restore();
            }
        }

        function chooseNewSpot() {
            biting = false;
            var next = Math.floor(Math.random()*cableLevels.length);
            if (next === cableIdx) next = (cableIdx+1)%cableLevels.length;
            cableIdx = next;
            tX = 60 + Math.random()*(W-140);
            tY = H * cableLevels[cableIdx];
        }

        function updateHUD() {
            intFill.style.width = integrity + '%';
            intVal.textContent = Math.round(integrity) + '%';
            intFill.style.background = integrity < 30 ? '#e74c3c' : integrity < 65 ? '#f39c12' : 'linear-gradient(90deg,#e74c3c,#f39c12,#2ecc71)';
        }

        function gameOver(won) {
            if (won) {
                state = 'won'; playCage();
                cage.style.left = (cX-90)+'px'; cage.style.top = (cY-60)+'px';
                cage.classList.add('drop');
                status.textContent = '🔒 ¡COMPY CONTENIDO!'; status.style.color = '#2ecc71';
                setTimeout(function(){ winModal.classList.add('show'); }, 600);
            } else {
                state = 'lost'; status.textContent = '💀 CORTE DE ENERGÍA'; status.style.color = '#ff3333';
                loseModal.classList.add('show');
            }
        }

        function loop(now) {
            var dt = Math.min((now - lastT)/1000, 0.1); lastT = now;
            if (state === 'playing') {
                if (biting) {
                    integrity -= damagePerBite * dt * (catches+1);
                    if (integrity <= 0) { integrity = 0; gameOver(false); }
                    updateHUD();
                    if (Math.random() < 0.28) { addSparks(cX+(facing===1?55:-55), cY-5, 4); if(Math.random()<0.15) playSparkSound(); }
                    biteTimer += dt*1000;
                    if (biteTimer > biteDuration) chooseNewSpot();
                } else {
                    var dx = tX-cX, dy = tY-cY, dist = Math.sqrt(dx*dx+dy*dy);
                    var spd = 320 * mult * (1 + catches*0.35);
                    if (dist < 15) {
                        cX=tX; cY=tY; biting=true; biteTimer=0;
                        compy.classList.remove('ee-compy-running'); compy.classList.add('ee-compy-biting');
                        status.textContent = '⚡ COMPY MASTICANDO CABLE (¡ATÁCALO YA!)'; status.style.color = '#ff4444';
                    } else {
                        cX += (dx/dist)*spd*dt; cY += (dy/dist)*spd*dt; facing = dx>=0?1:-1;
                        compy.classList.add('ee-compy-running'); compy.classList.remove('ee-compy-biting');
                        status.textContent = '💨 COMPY CORRIENDO...'; status.style.color = '#f1c40f';
                    }
                }
                compy.style.left = (cX-65)+'px'; compy.style.top = (cY-24)+'px';
                compy.style.transform = 'scaleX('+facing+')';
            }
            drawSparks();
            requestAnimationFrame(loop);
        }

        // Evasión del cursor
        arena.addEventListener('mousemove', function(e) {
            if (state !== 'playing') return;
            var r = arena.getBoundingClientRect();
            var mx = e.clientX - r.left, my = e.clientY - r.top;
            var dist = Math.hypot(mx-cX, my-cY);
            if (dist < evasionRadius) {
                playChirp();
                var angle = Math.atan2(cY-my, cX-mx) + (Math.random()*0.6-0.3);
                var fd = 140 + Math.random()*160;
                tX = Math.max(60, Math.min(W-80, cX + Math.cos(angle)*fd));
                cableIdx = Math.floor(Math.random()*cableLevels.length);
                tY = H * cableLevels[cableIdx];
                biting = false; biteTimer = 0;
                addSparks(cX, cY, 8, '#ff3333');
            }
        });
        arena.addEventListener('touchmove', function(e) {
            if (state !== 'playing') return;
            var r = arena.getBoundingClientRect();
            var mx = e.touches[0].clientX - r.left, my = e.touches[0].clientY - r.top;
            var dist = Math.hypot(mx-cX, my-cY);
            if (dist < evasionRadius) {
                playChirp();
                var angle = Math.atan2(cY-my, cX-mx) + (Math.random()*0.6-0.3);
                var fd = 140 + Math.random()*160;
                tX = Math.max(60, Math.min(W-80, cX + Math.cos(angle)*fd));
                cableIdx = Math.floor(Math.random()*cableLevels.length);
                tY = H * cableLevels[cableIdx];
                biting = false; biteTimer = 0;
                addSparks(cX, cY, 8, '#ff3333');
            }
        });

        // Capturar compy
        compy.addEventListener('mousedown', function(e) {
            e.stopPropagation(); if (state !== 'playing') return;
            catches++; playChirp(); addSparks(cX, cY, 30, '#f1c40f');
            var pip = document.getElementById('ee-pip-'+catches); if(pip) pip.classList.add('on');
            if (catches >= targetCatches) { gameOver(true); }
            else { mult += 0.45; status.textContent='¡IMPACTO ('+catches+'/'+targetCatches+')! ESCAPÓ...'; status.style.color='#2ecc71'; chooseNewSpot(); }
        });
        compy.addEventListener('touchstart', function(e) { e.preventDefault(); compy.dispatchEvent(new MouseEvent('mousedown')); });

        if (btnReplay) btnReplay.addEventListener('click', function() { if (window.registerMinigameAttempt) window.registerMinigameAttempt('compy'); reset(); requestAnimationFrame(loop); });
        if (btnRetry)  btnRetry.addEventListener('click',  function() { if (window.registerMinigameAttempt) window.registerMinigameAttempt('compy'); reset(); requestAnimationFrame(loop); });
        if (btnCloseW) btnCloseW.addEventListener('click', closeOverlay);

        reset();
        requestAnimationFrame(loop);
    }

    function closeOverlay() {
        var ov = document.getElementById('compy-game-overlay');
        if (ov) ov.classList.remove('open');
    }

    function init() {
        injectStyles();
        buildOverlay();
        var fab = buildFAB();
        var overlay = document.getElementById('compy-game-overlay');
        var closeBtn = document.getElementById('compy-overlay-close');
        var gameStarted = false;

        fab.addEventListener('click', function() {
            overlay.classList.add('open');
            if (!gameStarted) { gameStarted = true; initGame(); }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        var ceFullBtn = document.getElementById('compy-fullscreen-btn');
        if (ceFullBtn) {
            ceFullBtn.addEventListener('click', function () {
                var target = document.getElementById('compy-game-overlay') || document.documentElement;
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (target.requestFullscreen) target.requestFullscreen().catch(function(){});
                    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                    ceFullBtn.innerHTML = '🗗 SALIR';
                } else {
                    if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                    ceFullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
                }
            });
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) ceFullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
                else ceFullBtn.innerHTML = '🗗 SALIR';
            });
        }

        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
