// ============================================================
//  EXPEDIENTES JURÁSICOS — ¡EL ÚLTIMO COMBATE!
//  Juego de Combate: Styracosaurus vs Carnotaurus "Demon"
// ============================================================

(function () {
    'use strict';

    if (document.getElementById('styraco-strike-fab')) return;

    // ---- CONSTANTES DE DISEÑO (espacio lógico 1200×670) ----
    var LW = 1200, LH = 670;
    var FLOOR_Y = 618; // Nivel del suelo del helipuerto donde pisan las patas

    // Dimensiones proporcionales basadas en la imagen de referencia
    var STYRACO_W = 480, STYRACO_H = 287;
    var CARNO_W   = 595, CARNO_H   = 320;

    // Factores de escala para mantener proporciones anatómicas idénticas (sin estirar escudo/muerte)
    var STYRACO_SCALE_X = STYRACO_W / 1916.0;
    var STYRACO_SCALE_Y = STYRACO_H / 1146.0;
    var CARNO_SCALE_X   = CARNO_W / 2170.0;
    var CARNO_SCALE_Y   = CARNO_H / 1168.0;

    // Recortes de contenido de los sprites (2400x1340)
    var CROPS = {
        // Styracosaurus (invertido horizontalmente al dibujar)
        stNeutral:  { sx: 361, sy: 107, sw: 1916, sh: 1146 },
        stWalk:     { sx: 361, sy: 110, sw: 1917, sh: 1143 },
        stShield:   { sx: 361, sy: 111, sw: 1879, sh: 1140 },
        stJump:     { sx: 361, sy: 112, sw: 1840, sh: 1078 },
        stAttack:   { sx: 279, sy: 99,  sw: 1913, sh: 1153 },
        stDead:     { sx: 361, sy: 111, sw: 1867, sh: 914 },

        // Carnotaurus "Demon"
        cnNeutral:  { sx: 121, sy: 128, sw: 2170, sh: 1168 },
        cnWalk:     { sx: 120, sy: 127, sw: 2157, sh: 1169 },
        cnShield:   { sx: 128, sy: 318, sw: 2137, sh: 975 },
        cnJump:     { sx: 120, sy: 128, sw: 2171, sh: 1129 },
        cnAttack:   { sx: 98,  sy: 274, sw: 2193, sh: 1022 },
        cnDead:     { sx: 187, sy: 378, sw: 2088, sh: 685 }
    };

    // ---- ESTADO DEL JUEGO ----
    var state = 'idle'; // idle | fighting | won | lost
    var scale = 1;
    var canvasW = 0, canvasH = 0;
    var canvas, ctx, stage;
    var aniFrame = null;
    var lastTime = 0;

    // Shake y partículas
    var shakeTimer = 0;
    var shakeMag = 0;
    var bloodParticles = []; // { x, y, vx, vy, size, life, maxLife }
    var floatingTexts = [];

    // ---- LUCHADOR: STYRACOSAURUS (JUGADOR) ----
    var styraco = {
        hp: 100,
        maxHp: 100,
        x: 120, // Posicionado dentro del helipuerto
        y: FLOOR_Y - STYRACO_H, // Top Y
        baseY: FLOOR_Y - STYRACO_H,
        vy: 0,
        action: 'neutral', // neutral | walk | shield | jump | attack | dead
        isGrounded: true,
        attackTimer: 0,
        attackCooldown: 0,
        hitCooldown: 0,
        hurtFlash: 0,
        speed: 240
    };

    // ---- LUCHADOR: CARNOTAURUS "DEMON" (IA DIFÍCIL Y LETAL) ----
    var carno = {
        hp: 180,
        maxHp: 180,
        x: 600, // Siempre dentro de la pantalla visible del helipuerto
        y: FLOOR_Y - CARNO_H,
        baseY: FLOOR_Y - CARNO_H,
        vy: 0,
        action: 'neutral', // neutral | walk | shield | jump | attack | dead
        isGrounded: true,
        attackTimer: 0,
        attackCooldown: 0,
        hitCooldown: 0,
        hurtFlash: 0,
        speed: 235,

        // Estado y temporizadores de la IA
        aiState: 'approach', // approach | retreat | attack_prep | shielding | jump_attack
        aiTimer: 0.8,
        reactionDelay: 0.22
    };

    // Teclas presionadas
    var keys = {
        a: false,
        d: false,
        w: false,
        s: false,
        space: false
    };

    // ---- IMÁGENES ----
    var imgs = {
        bg:          new Image(),
        stNeutral:   new Image(),
        stWalk:      new Image(),
        stShield:    new Image(),
        stJump:      new Image(),
        stAttack:    new Image(),
        stDead:      new Image(),
        cnNeutral:   new Image(),
        cnWalk:      new Image(),
        cnShield:    new Image(),
        cnJump:      new Image(),
        cnAttack:    new Image(),
        cnDead:      new Image()
    };

    // ---- AUDIO ----
    var sndMusic   = null;
    var sndStyraco = null;
    var sndCarno   = null;

    // ============================================================
    //  RESOLUCIÓN DE ARCHIVOS
    // ============================================================
    function resolveURI(filename) {
        return encodeURI(filename);
    }

    function createAudio(filename, loop, vol) {
        var primary  = resolveURI(filename);
        var fallback = 'Styraco%20Strike/' + resolveURI(filename);
        var a = new Audio(primary);
        a.loop = !!loop;
        if (typeof vol === 'number') a.volume = vol;
        a.addEventListener('error', function () {
            if (a.src.indexOf('Styraco%20Strike') === -1 && a.src.indexOf('Styraco Strike') === -1) {
                a.src = fallback;
            }
        });
        return a;
    }

    function loadImageWithFallback(img, filename, onDone) {
        var primary  = resolveURI(filename);
        var fallback = 'Styraco%20Strike/' + resolveURI(filename);
        var finished = false;
        function markDone() {
            if (!finished) { finished = true; if (onDone) onDone(); }
        }
        img.onload  = markDone;
        img.onerror = function () {
            if (img.src.indexOf('Styraco%20Strike') === -1 && img.src.indexOf('Styraco Strike') === -1) {
                img.src = fallback;
            } else {
                console.warn('[StyracoStrike] No se pudo cargar:', filename);
                markDone();
            }
        };
        img.src = primary;
    }

    function loadAllImages(cb) {
        var count = 0, total = Object.keys(imgs).length;
        function done() { if (++count >= total) { if (cb) cb(); } }
        loadImageWithFallback(imgs.bg,        'Fondo pelea.jpg',       done);
        loadImageWithFallback(imgs.stNeutral, 'Styraco neutral.png',   done);
        loadImageWithFallback(imgs.stWalk,    'Styraco Caminando.png', done);
        loadImageWithFallback(imgs.stShield,  'Styraco escudo.png',    done);
        loadImageWithFallback(imgs.stJump,    'Styraco saltando.png',  done);
        loadImageWithFallback(imgs.stAttack,  'Styraco Atacando.png',  done);
        loadImageWithFallback(imgs.stDead,    'Styraco muerto.png',    done);
        loadImageWithFallback(imgs.cnNeutral, 'Carno Neutral.png',     done);
        loadImageWithFallback(imgs.cnWalk,    'Carno Caminando.png',   done);
        loadImageWithFallback(imgs.cnShield,  'Carno escudo.png',      done);
        loadImageWithFallback(imgs.cnJump,    'Carno Saltando.png',    done);
        loadImageWithFallback(imgs.cnAttack,  'Carno Atacando.png',    done);
        loadImageWithFallback(imgs.cnDead,    'Carno muerto.png',      done);
    }

    function initAudio() {
        sndMusic   = createAudio('Fight Music.mp4',   true,  0.5);
        sndStyraco = createAudio('Styraco Sound.mp4', false, 0.95);
        sndCarno   = createAudio('Carno Sound.mp4',   false, 1.0);
    }

    function playAudio(snd) {
        if (!snd) return;
        try {
            snd.currentTime = 0;
            snd.play().catch(function () {});
        } catch (e) {}
    }

    function stopAllAudio() {
        [sndMusic, sndStyraco, sndCarno].forEach(function (s) {
            if (s) { try { s.pause(); s.currentTime = 0; } catch (e) {} }
        });
    }

    // ============================================================
    //  ESTILOS CSS
    // ============================================================
    function injectStyles() {
        if (document.getElementById('styraco-strike-style')) return;
        var s = document.createElement('style');
        s.id = 'styraco-strike-style';
        s.textContent = [
            '/* --- BOTÓN FLOTANTE FAB (ROJO FUEGO / DEMON) --- */',
            '#styraco-strike-fab {',
            '    position: fixed;',
            '    bottom: 436px; right: 28px;',
            '    left: auto;',
            '    z-index: 99990;',
            '    display: flex; align-items: center; gap: 0.55rem;',
            '    padding: 0.65rem 1.3rem 0.65rem 0.9rem;',
            '    background: rgba(35, 8, 4, 0.92);',
            '    border: 2px solid #e74c3c; border-radius: 50px;',
            '    cursor: pointer; user-select: none;',
            '    color: #ff6b6b;',
            "    font-family: 'Orbitron','Share Tech Mono',monospace;",
            '    font-size: 0.78rem; font-weight: 700;',
            '    letter-spacing: 1.5px; text-transform: uppercase;',
            '    box-shadow: 0 0 22px rgba(231,76,60,.45), 0 4px 16px rgba(0,0,0,.6);',
            '    backdrop-filter: blur(8px);',
            '    transition: all .22s ease;',
            '    animation: ss-fab-pulse 2.8s ease-in-out infinite;',
            '}',
            '#styraco-strike-fab:hover {',
            '    background: rgba(231,76,60,.22);',
            '    box-shadow: 0 0 44px rgba(231,76,60,.75), 0 4px 20px rgba(0,0,0,.7);',
            '    transform: scale(1.07) translateY(-2px);',
            '    color: #ff9f43;',
            '}',
            '#styraco-strike-fab img {',
            '    width: 44px; height: auto; max-height: 32px;',
            '    object-fit: contain;',
            '    filter: drop-shadow(0 0 6px rgba(231,76,60,.7));',
            '    pointer-events: none;',
            '}',
            '.ss-fab-title { display:block; font-size:.78rem; }',
            ".ss-fab-sub   { display:block; font-size:.57rem; font-family:'Share Tech Mono',monospace; color:#feca57; letter-spacing:1px; opacity:.85; }",
            '@keyframes ss-fab-pulse {',
            '    0%,100%{ box-shadow:0 0 22px rgba(231,76,60,.45),0 4px 16px rgba(0,0,0,.6); }',
            '    50%    { box-shadow:0 0 44px rgba(231,76,60,.75),0 4px 20px rgba(0,0,0,.7); }',
            '}',
            '',
            '/* --- OVERLAY PANTALLA COMPLETA --- */',
            '#styraco-strike-overlay {',
            '    position: fixed; inset: 0; z-index: 99995;',
            '    background: #000;',
            '    display: none; flex-direction: column;',
            '    user-select: none;',
            '}',
            '#styraco-strike-overlay.open { display: flex; }',
            '',
            '/* Header de Combate (HUD Street Fighter) */',
            '#ss-header {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.4rem;',
            '    background: rgba(14, 5, 4, .94);',
            '    border-bottom: 2px solid #e74c3c;',
            '    backdrop-filter: blur(4px);',
            '    z-index: 10;',
            '    gap: 1rem;',
            '}',
            '#ss-bars-wrap {',
            '    flex: 1;',
            '    display: flex; align-items: center; justify-content: center; gap: 1rem;',
            '    max-width: 950px; margin: 0 auto;',
            '}',
            '.ss-fighter-box {',
            '    flex: 1; display: flex; flex-direction: column; gap: .25rem;',
            '}',
            '.ss-fighter-box.right { align-items: flex-end; }',
            '.ss-fighter-name {',
            "    font-family:'Orbitron',monospace; font-size:.82rem; font-weight:900;",
            '    letter-spacing:1.5px; text-transform:uppercase;',
            '}',
            '.ss-health-bg {',
            '    width: 100%; height: 16px; background: rgba(0,0,0,.7);',
            '    border: 2px solid #555; border-radius: 4px; overflow: hidden;',
            '    box-shadow: inset 0 0 8px #000;',
            '}',
            '#ss-hp-styraco {',
            '    width: 100%; height: 100%;',
            '    background: linear-gradient(90deg, #2ecc71, #27ae60);',
            '    transition: width .15s ease;',
            '}',
            '#ss-hp-carno {',
            '    width: 100%; height: 100%;',
            '    background: linear-gradient(90deg, #e74c3c, #c0392b);',
            '    transition: width .15s ease;',
            '    float: right;',
            '}',
            '#ss-vs-badge {',
            "    font-family:'Orbitron',monospace; font-size:1.1rem; font-weight:900;",
            '    color:#f1c40f; text-shadow:0 0 10px #e67e22; padding: 0 .4rem;',
            '}',
            '#ss-close-btn {',
            '    background:transparent; border:1px solid rgba(231,76,60,.4); color:#ff6b6b;',
            "    font-family:'Share Tech Mono',monospace; font-size:.75rem;",
            '    padding:.35rem .9rem; border-radius:3px; cursor:pointer;',
            '    letter-spacing:1px; transition:all .2s;',
            '}',
            '#ss-close-btn:hover { background:rgba(231,76,60,.2); color:#fff; border-color:#e74c3c; }',
            '#ss-fullscreen-btn { background:rgba(46,204,113,.15); border:1px solid rgba(46,204,113,.4); color:#2ecc71; font-family:\'Share Tech Mono\',monospace; font-size:.75rem; padding:.35rem .9rem; border-radius:3px; cursor:pointer; letter-spacing:1px; transition:all .2s; }',
            '#ss-fullscreen-btn:hover { background:#2ecc71; color:#020b06; }',
            '',
            '/* Canvas wrap y stage */',
            '#ss-canvas-wrap {',
            '    flex: 1;',
            '    position: relative;',
            '    display: flex; align-items: center; justify-content: center;',
            '    overflow: hidden;',
            '    background: #020101;',
            '}',
            '#ss-canvas-stage {',
            '    position: relative;',
            '    overflow: hidden;',
            '    box-shadow: 0 0 35px rgba(0,0,0,.85);',
            '}',
            '#ss-canvas { display: block; touch-action: none; }',
            '',
            '/* Status bar inferior con controles */',
            '#ss-status-bar {',
            '    flex-shrink: 0;',
            '    display: flex; align-items: center; justify-content: space-between;',
            '    padding: .5rem 1.4rem;',
            '    background: rgba(14, 5, 4, .95);',
            '    border-top: 1px solid rgba(231, 76, 60, .35);',
            "    font-family:'Share Tech Mono',monospace; font-size:.82rem;",
            '    backdrop-filter: blur(4px); z-index:10;',
            '    gap: 1rem; flex-wrap: wrap;',
            '}',
            '#ss-mission-text {',
            "    color: #f39c12; font-family:'Share Tech Mono',monospace; font-size:.82rem; font-weight:700;",
            '    letter-spacing: 1px;',
            '}',
            '#ss-controls-hint { color: #ccc; font-size:.8rem; }',
            '.ss-key-badge {',
            '    display: inline-block; background: rgba(255,255,255,.1); padding: .1rem .4rem;',
            '    border: 1px solid #777; border-radius: 3px; font-weight: 700; color: #fff;',
            '}',
            '',
            '/* --- PANTALLAS MODALES --- */',
            '.ss-screen {',
            '    position: absolute; inset: 0; z-index: 25;',
            '    display: none; flex-direction: column;',
            '    align-items: center; justify-content: center;',
            '    text-align: center;',
            '    background: rgba(10, 2, 2, .88);',
            '    backdrop-filter: blur(8px);',
            "    font-family: 'Share Tech Mono',monospace;",
            '    padding: 1.2rem;',
            '    box-sizing: border-box;',
            '}',
            '.ss-screen.show { display: flex; animation: ss-pop .3s ease-out; }',
            '@keyframes ss-pop {',
            '    from { opacity: 0; transform: scale(.95); }',
            '    to   { opacity: 1; transform: scale(1); }',
            '}',
            '.ss-screen-title {',
            "    font-family:'Orbitron',monospace;",
            '    font-size: clamp(1.4rem, 4vw, 2.3rem);',
            '    font-weight: 900; letter-spacing: 3px; text-transform: uppercase;',
            '    margin-bottom: .5rem;',
            '}',
            '.ss-screen-sub {',
            '    font-size: clamp(.75rem, 1.8vw, .95rem); color: #ccc;',
            '    margin-bottom: 1.6rem; max-width: 620px; line-height: 1.6;',
            '}',
            '.ss-instruct {',
            '    display: flex; gap: 1.2rem; margin: .6rem 0 1.6rem;',
            '    flex-wrap: wrap; justify-content: center;',
            '    font-size: .78rem; color: #ddd;',
            '}',
            '.ss-inst-item {',
            '    display:flex; flex-direction:column; align-items:center; gap:.3rem;',
            '    background:rgba(255,255,255,.05); border:1px solid rgba(231,76,60,.3);',
            '    border-radius:6px; padding:.65rem .85rem; min-width:115px;',
            '    box-sizing: border-box;',
            '}',
            '.ss-inst-icon { font-size: 1.6rem; }',
            '',
            '/* BOTONES */',
            '.ss-btn {',
            "    font-family:'Orbitron',monospace; font-size:.85rem; font-weight:700;",
            '    letter-spacing:1.5px; text-transform:uppercase;',
            '    padding:.75rem 2.2rem; border-radius:4px; cursor:pointer;',
            '    transition:all .2s; border:none; margin:.3rem;',
            '    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;',
            '    width: auto; max-width: 340px; box-sizing: border-box; flex: 0 0 auto;',
            '}',
            '.ss-btn-primary { background:#e74c3c; color:#fff; box-shadow:0 0 16px rgba(231,76,60,.5); }',
            '.ss-btn-primary:hover { background:#ff6b6b; box-shadow:0 0 30px rgba(255,107,107,.75); transform:translateY(-2px); }',
            '.ss-btn-secondary { background:transparent; border:1px solid #e74c3c; color:#ff6b6b; }',
            '.ss-btn-secondary:hover { background:rgba(231,76,60,.15); }',
            '',
            '/* Controles táctiles virtuales para celulares */',
            '#ss-touch-controls {',
            '    position: absolute; bottom: 12px; left: 0; right: 0;',
            '    display: none; justify-content: space-between; align-items: flex-end;',
            '    padding: 0 16px; pointer-events: none; z-index: 20;',
            '}',
            '@media (max-width: 1024px), (hover: none) and (pointer: coarse) {',
            '    #ss-touch-controls { display: flex; }',
            '}',
            '.ss-touch-dpad, .ss-touch-actions {',
            '    display: flex; gap: 10px; pointer-events: auto;',
            '}',
            '.ss-touch-btn {',
            '    width: 56px; height: 56px; border-radius: 50%;',
            '    background: rgba(14, 5, 4, 0.78); border: 2px solid rgba(231, 76, 60, 0.6);',
            '    color: #fff; font-family: "Orbitron", monospace; font-size: 1.15rem;',
            '    font-weight: 900; display: flex; align-items: center; justify-content: center;',
            '    user-select: none; -webkit-user-select: none; touch-action: none;',
            '    box-shadow: 0 4px 15px rgba(0,0,0,0.6); transition: transform 0.1s, background 0.1s, border-color 0.1s;',
            '    cursor: pointer;',
            '}',
            '.ss-touch-btn:active, .ss-touch-btn.active {',
            '    background: rgba(231, 76, 60, 0.7); border-color: #ff6b6b;',
            '    box-shadow: 0 0 20px rgba(255, 107, 107, 0.85); transform: scale(0.92);',
            '}',
            '.ss-touch-btn.attack {',
            '    width: 66px; height: 66px; background: rgba(231, 76, 60, 0.88);',
            '    border-color: #ff7675; font-size: 0.82rem;',
            '}',
            '.ss-touch-btn.attack:active, .ss-touch-btn.attack.active {',
            '    background: #ff4757; box-shadow: 0 0 25px rgba(255, 71, 87, 0.95);',
            '}',
            '.ss-touch-btn.shield {',
            '    background: rgba(46, 204, 113, 0.55); border-color: #2ecc71;',
            '    font-size: 0.85rem;',
            '}',
            '.ss-touch-btn.shield:active, .ss-touch-btn.shield.active {',
            '    background: rgba(46, 204, 113, 0.9); box-shadow: 0 0 20px rgba(46, 204, 113, 0.95);',
            '}',
            '',
            '/* Responsive */',
            '@media (max-width: 600px) {',
            '    #styraco-strike-fab { bottom: 284px; right: 16px; padding: .5rem .9rem .5rem .65rem; }',
            '    #styraco-strike-fab img { width: 36px; max-height: 26px; }',
            '    .ss-fab-title { font-size:.65rem; }',
            '    .ss-fab-sub   { display:none; }',
            '    #ss-status-bar { font-size:.68rem; padding:.35rem .6rem; }',
            '    #ss-header { padding:.35rem .6rem; }',
            '    .ss-fighter-name { font-size:.7rem; }',
            '    .ss-health-bg { height: 12px; }',
            '    .ss-touch-btn { width: 50px; height: 50px; font-size: 1rem; }',
            '    .ss-touch-btn.attack { width: 60px; height: 60px; font-size: 0.78rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ============================================================
    //  HTML DEL OVERLAY
    // ============================================================
    function buildOverlay() {
        var ov = document.createElement('div');
        ov.id = 'styraco-strike-overlay';

        // ---- HEADER (HUD DE COMBATE) ----
        var header = document.createElement('div');
        header.id  = 'ss-header';

        var barsWrap = document.createElement('div');
        barsWrap.id  = 'ss-bars-wrap';

        // Styracosaurus
        var stBox = document.createElement('div');
        stBox.className = 'ss-fighter-box';
        var stName = document.createElement('div');
        stName.className = 'ss-fighter-name';
        stName.style.color = '#2ecc71';
        stName.textContent = '🛡️ STYRACOSAURUS';
        var stHpBg = document.createElement('div');
        stHpBg.className = 'ss-health-bg';
        var stHp = document.createElement('div');
        stHp.id = 'ss-hp-styraco';
        stHpBg.appendChild(stHp);
        stBox.appendChild(stName);
        stBox.appendChild(stHpBg);

        // VS Badge
        var vsBadge = document.createElement('div');
        vsBadge.id = 'ss-vs-badge';
        vsBadge.textContent = 'VS';

        // Carnotaurus "Demon"
        var cnBox = document.createElement('div');
        cnBox.className = 'ss-fighter-box right';
        var cnName = document.createElement('div');
        cnName.className = 'ss-fighter-name';
        cnName.style.color = '#e74c3c';
        cnName.textContent = 'CARNOTAURUS "DEMON" 😈';
        var cnHpBg = document.createElement('div');
        cnHpBg.className = 'ss-health-bg';
        var cnHp = document.createElement('div');
        cnHp.id = 'ss-hp-carno';
        cnHpBg.appendChild(cnHp);
        cnBox.appendChild(cnName);
        cnBox.appendChild(cnHpBg);

        barsWrap.appendChild(stBox);
        barsWrap.appendChild(vsBadge);
        barsWrap.appendChild(cnBox);

        var btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.alignItems = 'center';
        btnGroup.style.gap = '8px';

        var fullBtn = document.createElement('button');
        fullBtn.id = 'ss-fullscreen-btn';
        fullBtn.innerHTML = '⛶ PANTALLA COMPLETA';
        fullBtn.addEventListener('click', function () {
            var target = document.getElementById('styraco-strike-overlay') || document.documentElement;
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
        closeBtn.id  = 'ss-close-btn';
        closeBtn.textContent = '✕ CERRAR';
        closeBtn.addEventListener('click', closeGame);

        btnGroup.appendChild(fullBtn);
        btnGroup.appendChild(closeBtn);

        header.appendChild(barsWrap);
        header.appendChild(btnGroup);
        ov.appendChild(header);

        // ---- CANVAS WRAP Y STAGE CENTRADO ----
        var wrap = document.createElement('div');
        wrap.id  = 'ss-canvas-wrap';

        stage = document.createElement('div');
        stage.id = 'ss-canvas-stage';

        canvas = document.createElement('canvas');
        canvas.id = 'ss-canvas';
        stage.appendChild(canvas);

        // Controles táctiles virtuales para celulares
        var touchWrap = document.createElement('div');
        touchWrap.id = 'ss-touch-controls';
        touchWrap.innerHTML = [
            '<div class="ss-touch-dpad">',
            '    <button class="ss-touch-btn" id="ss-touch-left" title="Retroceder">◀</button>',
            '    <button class="ss-touch-btn" id="ss-touch-right" title="Avanzar">▶</button>',
            '</div>',
            '<div class="ss-touch-actions">',
            '    <button class="ss-touch-btn shield" id="ss-touch-shield" title="Escudo">🛡️</button>',
            '    <button class="ss-touch-btn" id="ss-touch-jump" title="Salto">▲</button>',
            '    <button class="ss-touch-btn attack" id="ss-touch-attack" title="Ataque">⚔️</button>',
            '</div>'
        ].join('');
        stage.appendChild(touchWrap);

        // ---- PANTALLA INICIO ----
        var startScreen = document.createElement('div');
        startScreen.id  = 'ss-start-screen';
        startScreen.className = 'ss-screen show';

        var sTitle = document.createElement('div');
        sTitle.className = 'ss-screen-title';
        sTitle.style.color = '#e74c3c';
        sTitle.textContent = '⚔️ ¡EL ÚLTIMO COMBATE!';

        var sSub = document.createElement('div');
        sSub.className = 'ss-screen-sub';
        sSub.innerHTML = 'Enfréntate en un duelo a muerte en el helipuerto de la isla.<br>' +
            'Controlas al poderoso <strong style="color:#2ecc71;">Styracosaurus</strong>. ' +
            'Tu rival es el implacable <strong style="color:#e74c3c;">Carnotaurus "Demon"</strong>.<br><br>' +
            '🎮 <strong>CONTROLES:</strong><br>' +
            '• <span class="ss-key-badge">A</span> y <span class="ss-key-badge">D</span>: Retroceder y Avanzar<br>' +
            '• <span class="ss-key-badge">S</span>: <strong>ESCUDO</strong> (bloqueo total: ningún ataque te dañará)<br>' +
            '• <span class="ss-key-badge">W</span>: <strong>SALTAR</strong> para esquivar arremetidas<br>' +
            '• <span class="ss-key-badge">ESPACIO</span>: <strong>ATACAR</strong> con tus cuernos frontales<br>' +
            '📱 <em>En celulares: usa los botones virtuales en pantalla (◀, ▶, 🛡️, ▲, ⚔️).</em><br>' +
            '<em>¡Ten cuidado! Demon es un depredador experto que contraataca con combos brutales.</em>';

        var instruct = document.createElement('div');
        instruct.className = 'ss-instruct';

        var cards = [
            { icon: '🛡️', label: 'Tecla S = Escudo', desc: 'BLOQUEA TODO DAÑO' },
            { icon: '⚔️', label: 'Espacio = Ataque', desc: 'CORNADA LETAL' },
            { icon: '🦘', label: 'Tecla W = Salto', desc: 'ESQUIVA EMBESTIDAS' },
            { icon: '😈', label: 'Demon es Rápido', desc: 'BUSCA SU APERTURA' }
        ];
        for (var ci = 0; ci < cards.length; ci++) {
            var card = document.createElement('div');
            card.className = 'ss-inst-item';
            var iconEl = document.createElement('div');
            iconEl.className = 'ss-inst-icon';
            iconEl.textContent = cards[ci].icon;
            var textWrap = document.createElement('div');
            textWrap.innerHTML = cards[ci].label + '<br><strong>' + cards[ci].desc + '</strong>';
            card.appendChild(iconEl);
            card.appendChild(textWrap);
            instruct.appendChild(card);
        }

        var startBtn = document.createElement('button');
        startBtn.className = 'ss-btn ss-btn-primary';
        startBtn.id = 'ss-start-btn';
        startBtn.textContent = '⚔️ ¡INICIAR COMBATE!';
        startBtn.addEventListener('click', startGame);

        startScreen.appendChild(sTitle);
        startScreen.appendChild(sSub);
        startScreen.appendChild(instruct);
        startScreen.appendChild(startBtn);
        stage.appendChild(startScreen);

        // ---- PANTALLA VICTORIA ----
        var winScreen = document.createElement('div');
        winScreen.id  = 'ss-win-screen';
        winScreen.className = 'ss-screen';

        var wTitle = document.createElement('div');
        wTitle.className = 'ss-screen-title';
        wTitle.style.color = '#2ecc71';
        wTitle.textContent = '🏆 ¡VICTORIA! DEMON HA CAÍDO';

        var wSub = document.createElement('div');
        wSub.className = 'ss-screen-sub';
        wSub.innerHTML = '¡El Styracosaurus se impuso en el helipuerto!<br>' +
            'El temible Carnotaurus Demon fue derribado por tus formidables cuernos.<br>' +
            '<strong style="color:#2ecc71;">¡Eres el verdadero rey de la defensa!</strong>';

        var wBtns = document.createElement('div');
        var wRetry = document.createElement('button');
        wRetry.className = 'ss-btn ss-btn-primary';
        wRetry.textContent = '🔄 PELEAR DE NUEVO';
        wRetry.addEventListener('click', function () { showScreen(null); startGame(); });
        var wClose = document.createElement('button');
        wClose.className = 'ss-btn ss-btn-secondary';
        wClose.textContent = 'CERRAR';
        wClose.addEventListener('click', closeGame);
        wBtns.appendChild(wRetry); wBtns.appendChild(wClose);

        winScreen.appendChild(wTitle);
        winScreen.appendChild(wSub);
        winScreen.appendChild(wBtns);
        stage.appendChild(winScreen);

        // ---- PANTALLA DERROTA ----
        var loseScreen = document.createElement('div');
        loseScreen.id  = 'ss-lose-screen';
        loseScreen.className = 'ss-screen';

        var lTitle = document.createElement('div');
        lTitle.className = 'ss-screen-title';
        lTitle.style.color = '#e74c3c';
        lTitle.textContent = '💀 EL STYRACOSAURUS HA SIDO DERROTADO';

        var lSub = document.createElement('div');
        lSub.className = 'ss-screen-sub';
        lSub.innerHTML = 'Demon fue más veloz y quebró tu resistencia.<br>' +
            'Recuerda usar la tecla <strong style="color:#fff;">S</strong> para levantar el escudo y anular completamente sus embestidas.<br>' +
            '¡Aprovecha cuando él falle para contraatacar!';

        var lBtns = document.createElement('div');
        var lRetry = document.createElement('button');
        lRetry.className = 'ss-btn ss-btn-primary';
        lRetry.textContent = '🔄 REINTENTAR';
        lRetry.addEventListener('click', function () { showScreen(null); startGame(); });
        var lClose = document.createElement('button');
        lClose.className = 'ss-btn ss-btn-secondary';
        lClose.textContent = 'CERRAR';
        lClose.addEventListener('click', closeGame);
        lBtns.appendChild(lRetry); lBtns.appendChild(lClose);

        loseScreen.appendChild(lTitle);
        loseScreen.appendChild(lSub);
        loseScreen.appendChild(lBtns);
        stage.appendChild(loseScreen);

        wrap.appendChild(stage);
        ov.appendChild(wrap);

        // ---- STATUS BAR INFERIOR ----
        var statusBar = document.createElement('div');
        statusBar.id  = 'ss-status-bar';
        var mission = document.createElement('div');
        mission.id   = 'ss-mission-text';
        mission.textContent = '⚔️ DUELO EN EL HELIPUERTO: Derrota a Carnotaurus Demon';
        var hints = document.createElement('div');
        hints.id   = 'ss-controls-hint';
        hints.innerHTML = '<span class="ss-key-badge">A/D</span> Moverse | <span class="ss-key-badge">W</span> Saltar | <span class="ss-key-badge">S</span> Escudo (Inmune) | <span class="ss-key-badge">Espacio</span> Atacar';
        statusBar.appendChild(mission);
        statusBar.appendChild(hints);
        ov.appendChild(statusBar);

        document.body.appendChild(ov);
        ctx = canvas.getContext('2d');

        setupInput();
    }

    // ============================================================
    //  FAB — BOTÓN FLOTANTE
    // ============================================================
    function buildFAB() {
        var fab = document.createElement('div');
        fab.id  = 'styraco-strike-fab';
        fab.title = '¡Styraco Strike!';

        var fabImg = document.createElement('img');
        fabImg.alt = 'Carno';
        loadImageWithFallback(fabImg, 'Carno Neutral.png', function () {});

        var fabText = document.createElement('span');
        var fabTitle = document.createElement('span');
        fabTitle.className = 'ss-fab-title';
        fabTitle.textContent = '¡EL ÚLTIMO COMBATE!';
        var fabSub = document.createElement('span');
        fabSub.className = 'ss-fab-sub';
        fabSub.textContent = 'VS CARNOTAURUS "DEMON"';
        fabText.appendChild(fabTitle);
        fabText.appendChild(fabSub);

        fab.appendChild(fabImg);
        fab.appendChild(fabText);
        fab.addEventListener('click', openGame);
        document.body.appendChild(fab);
    }

    // ============================================================
    //  GESTIÓN DE ENTRADA (TECLADO)
    // ============================================================
    function setupInput() {
        window.addEventListener('keydown', function (e) {
            if (state !== 'fighting') return;
            switch (e.code) {
                case 'KeyA': case 'ArrowLeft':  keys.a = true; e.preventDefault(); break;
                case 'KeyD': case 'ArrowRight': keys.d = true; e.preventDefault(); break;
                case 'KeyW': case 'ArrowUp':    keys.w = true; e.preventDefault(); break;
                case 'KeyS': case 'ArrowDown':  keys.s = true; e.preventDefault(); break;
                case 'Space':                   keys.space = true; e.preventDefault(); break;
            }
        });

        window.addEventListener('keyup', function (e) {
            switch (e.code) {
                case 'KeyA': case 'ArrowLeft':  keys.a = false; break;
                case 'KeyD': case 'ArrowRight': keys.d = false; break;
                case 'KeyW': case 'ArrowUp':    keys.w = false; break;
                case 'KeyS': case 'ArrowDown':  keys.s = false; break;
                case 'Space':                   keys.space = false; break;
            }
        });

        // Controles táctiles virtuales para celulares y tablets
        function bindTouchBtn(id, keyName) {
            var btn = document.getElementById(id);
            if (!btn) return;
            function press(e) {
                if (e) e.preventDefault();
                if (state !== 'fighting') return;
                keys[keyName] = true;
                btn.classList.add('active');
            }
            function release(e) {
                if (e) e.preventDefault();
                keys[keyName] = false;
                btn.classList.remove('active');
            }
            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('touchcancel', release, { passive: false });
            btn.addEventListener('pointerdown', press);
            btn.addEventListener('pointerup', release);
            btn.addEventListener('pointercancel', release);
        }

        bindTouchBtn('ss-touch-left', 'a');
        bindTouchBtn('ss-touch-right', 'd');
        bindTouchBtn('ss-touch-jump', 'w');
        bindTouchBtn('ss-touch-shield', 's');
        bindTouchBtn('ss-touch-attack', 'space');
    }

    // ============================================================
    //  RESIZE RESPONSIVO
    // ============================================================
    function resize() {
        var wrap = document.getElementById('ss-canvas-wrap');
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

        drawScene();
    }

    // ============================================================
    //  FÍSICAS, IA Y COMBATE
    // ============================================================
    function initFighters() {
        styraco.hp = styraco.maxHp = 100;
        styraco.x = 120;
        styraco.y = FLOOR_Y - STYRACO_H;
        styraco.baseY = FLOOR_Y - STYRACO_H;
        styraco.vy = 0;
        styraco.action = 'neutral';
        styraco.isGrounded = true;
        styraco.attackTimer = 0;
        styraco.attackCooldown = 0;
        styraco.hitCooldown = 0;
        styraco.hurtFlash = 0;

        carno.hp = carno.maxHp = 180;
        carno.speed = 235;
        carno.x = 600;
        carno.y = FLOOR_Y - CARNO_H;
        carno.baseY = FLOOR_Y - CARNO_H;
        carno.vy = 0;
        carno.action = 'neutral';
        carno.isGrounded = true;
        carno.attackTimer = 0;
        carno.attackCooldown = 0;
        carno.hitCooldown = 0;
        carno.hurtFlash = 0;
        carno.aiState = 'approach';
        carno.aiTimer = 0.4;

        bloodParticles = [];
        floatingTexts = [];
        shakeTimer = 0;
    }

    function spawnBlood(x, y, count) {
        var n = count || 16;
        for (var i = 0; i < n; i++) {
            bloodParticles.push({
                x: x + (Math.random() * 30 - 15),
                y: y + (Math.random() * 30 - 15),
                vx: (Math.random() * 260 - 130),
                vy: -(Math.random() * 220 + 40),
                size: 2.5 + Math.random() * 3.5,
                life: 0.5 + Math.random() * 0.4,
                maxLife: 0.9
            });
        }
    }

    function createFloatingText(text, x, y, color) {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color || '#fff',
            life: 1.2,
            maxLife: 1.2
        });
    }

    function shakeScreen(mag, dur) {
        shakeMag = mag;
        shakeTimer = dur;
    }

    function updateFighters(dt) {
        // ---- 1. ACTUALIZAR STYRACOSAURUS (JUGADOR) ----
        if (styraco.hurtFlash > 0) styraco.hurtFlash -= dt;
        if (styraco.attackCooldown > 0) styraco.attackCooldown -= dt;
        if (styraco.hitCooldown > 0) styraco.hitCooldown -= dt;

        if (styraco.hp > 0) {
            // Escudo con S
            if (keys.s && styraco.isGrounded) {
                styraco.action = 'shield';
                styraco.attackTimer = 0;
            }
            // Ataque con Espacio
            else if (keys.space && styraco.attackCooldown <= 0 && styraco.action !== 'shield') {
                styraco.action = 'attack';
                styraco.attackTimer = 0.42; // Duración de la embestida
                styraco.attackCooldown = 0.65;
                playAudio(sndStyraco);
                // Ligero impulso hacia adelante al atacar
                styraco.x += 35;
            }
            // Temporizador de ataque activo
            else if (styraco.attackTimer > 0) {
                styraco.attackTimer -= dt;
                styraco.action = 'attack';
                if (styraco.attackTimer <= 0) {
                    styraco.action = 'neutral';
                }
            }
            // Movimiento lateral A / D y Salto W
            else {
                var moving = false;
                if (keys.a) {
                    styraco.x -= styraco.speed * dt;
                    moving = true;
                }
                if (keys.d) {
                    styraco.x += styraco.speed * dt;
                    moving = true;
                }

                // Salto con W
                if (keys.w && styraco.isGrounded) {
                    styraco.vy = -540; // Impulso vertical
                    styraco.isGrounded = false;
                    styraco.action = 'jump';
                }

                // Estado base según esté en el suelo o aire
                if (!styraco.isGrounded) {
                    styraco.action = 'jump';
                } else if (moving) {
                    styraco.action = 'walk';
                } else {
                    styraco.action = 'neutral';
                }
            }

            // Gravedad del Styraco
            if (!styraco.isGrounded) {
                styraco.vy += 1200 * dt; // Gravedad
                styraco.y += styraco.vy * dt;
                if (styraco.y >= styraco.baseY) {
                    styraco.y = styraco.baseY;
                    styraco.vy = 0;
                    styraco.isGrounded = true;
                }
            }

            // Límites de pantalla para Styraco (nunca sale de la pantalla visible)
            styraco.x = Math.max(20, Math.min(carno.x - 170, styraco.x));
        } else {
            styraco.action = 'dead';
        }

        // ---- 2. ACTUALIZAR CARNOTAURUS "DEMON" (IA) ----
        if (carno.hurtFlash > 0) carno.hurtFlash -= dt;
        if (carno.attackCooldown > 0) carno.attackCooldown -= dt;
        if (carno.hitCooldown > 0) carno.hitCooldown -= dt;

        if (carno.hp > 0) {
            carno.aiTimer -= dt;

            // Distancia entre ambos dinosaurios
            var dist = carno.x - (styraco.x + STYRACO_W * 0.45);

            // Toma de decisiones de la IA
            if (carno.aiTimer <= 0) {
                var rand = Math.random();

                // Si Styraco está atacando, Demon reacciona velozmente
                if (styraco.action === 'attack' && dist < 240) {
                    if (rand < 0.60) {
                        carno.aiState = 'shielding';
                        carno.aiTimer = 0.45;
                    } else if (rand < 0.88 && carno.isGrounded) {
                        carno.aiState = 'jump_evade';
                        carno.vy = -540;
                        carno.isGrounded = false;
                        carno.aiTimer = 0.55;
                    } else {
                        carno.aiState = 'retreat';
                        carno.aiTimer = 0.35;
                    }
                }
                // Si están muy cerca, lanzar ataque feroz inmediato
                else if (dist < 180) {
                    if (rand < 0.72 && carno.attackCooldown <= 0) {
                        carno.aiState = 'attack_prep';
                        carno.action = 'attack';
                        carno.attackTimer = 0.45;
                        carno.attackCooldown = 0.52;
                        carno.aiTimer = 0.45;
                        playAudio(sndCarno);
                    } else if (rand < 0.88) {
                        carno.aiState = 'shielding';
                        carno.aiTimer = 0.4;
                    } else {
                        carno.aiState = 'retreat';
                        carno.aiTimer = 0.35;
                    }
                }
                // Si están a distancia media, embestida o ataque aéreo letal
                else if (dist < 380) {
                    if (rand < 0.55) {
                        carno.aiState = 'approach';
                        carno.aiTimer = 0.5;
                    } else if (rand < 0.85 && carno.isGrounded) {
                        carno.aiState = 'jump_attack';
                        carno.vy = -500;
                        carno.isGrounded = false;
                        carno.aiTimer = 0.65;
                    } else {
                        carno.aiState = 'retreat';
                        carno.aiTimer = 0.35;
                    }
                }
                // Si están lejos, acechar agresivamente
                else {
                    carno.aiState = 'approach';
                    carno.aiTimer = 0.5;
                }
            }

            // Ejecución del estado actual de la IA
            if (carno.attackTimer > 0) {
                carno.attackTimer -= dt;
                carno.action = 'attack';
                carno.x -= 70 * dt; // Embestida hacia adelante
            } else if (carno.aiState === 'shielding' && carno.isGrounded) {
                carno.action = 'shield';
            } else if (!carno.isGrounded) {
                carno.action = 'jump';
                if (carno.aiState === 'jump_attack') carno.x -= carno.speed * 0.8 * dt;
                if (carno.aiState === 'jump_evade')  carno.x += carno.speed * 0.8 * dt;
            } else if (carno.aiState === 'approach') {
                carno.action = 'walk';
                carno.x -= carno.speed * dt;
            } else if (carno.aiState === 'retreat') {
                carno.action = 'walk';
                // Solo retroceder si no está ya al borde derecho visible
                if (carno.x < 610) {
                    carno.x += carno.speed * 0.9 * dt;
                }
            } else {
                carno.action = 'neutral';
            }

            // Gravedad del Carno
            if (!carno.isGrounded) {
                carno.vy += 1200 * dt;
                carno.y += carno.vy * dt;
                if (carno.y >= carno.baseY) {
                    carno.y = carno.baseY;
                    carno.vy = 0;
                    carno.isGrounded = true;
                }
            }

            // Límites de pantalla para Carno: máximo x=620 para que su cuerpo entero siempre esté visible
            carno.x = Math.max(styraco.x + 170, Math.min(620, carno.x));
        } else {
            carno.action = 'dead';
        }

        // ---- 3. RESOLUCIÓN DE DAÑO Y COLISIONES DE ATAQUE ----
        var combatDist = carno.x - (styraco.x + STYRACO_W * 0.35);

        // [A] STYRACO ATACA A CARNO
        if (styraco.action === 'attack' && styraco.attackTimer > 0.1 && styraco.hitCooldown <= 0) {
            if (combatDist < 200 && combatDist > -40) {
                styraco.hitCooldown = 0.45; // Evita multi-golpes en el mismo frame

                // Si Carno tiene escudo: daño reducido a 0
                if (carno.action === 'shield') {
                    createFloatingText('🛡️ ¡BLOQUEADO!', carno.x, carno.y + 40, '#f1c40f');
                    carno.x += 25; // Retroceso por impacto
                } else {
                    // ¡GOLPE EXITOSO AL CARNO!
                    var dmg = 12 + Math.floor(Math.random() * 5); // 12-16 daño (Carno tiene 180 HP, más difícil de vencer)
                    carno.hp = Math.max(0, carno.hp - dmg);
                    carno.hurtFlash = 0.22;
                    carno.x = Math.min(620, carno.x + 30); // Retroceso limitado para no salirse de pantalla
                    shakeScreen(12, 0.35);
                    spawnBlood(carno.x + 40, carno.y + 110, 24);
                    playAudio(sndCarno);
                    createFloatingText('-' + dmg + ' HP', carno.x + 30, carno.y + 20, '#e74c3c');

                    if (carno.hp <= 0) {
                        triggerWin();
                        return;
                    }
                }
            }
        }

        // [B] CARNO ATACA A STYRACO (MÁS DAÑINO)
        if (carno.action === 'attack' && carno.attackTimer > 0.1 && carno.hitCooldown <= 0) {
            if (combatDist < 210 && combatDist > -50) {
                carno.hitCooldown = 0.48;

                // SI STYRACO TIENE ESCUDO (S): NINGÚN ATAQUE LO DAÑA
                if (styraco.action === 'shield') {
                    createFloatingText('🛡️ ¡ESCUDO TOTAL! 0 DAÑO', styraco.x + STYRACO_W * 0.4, styraco.y + 40, '#2ecc71');
                    styraco.x -= 18; // Retroceso mínimo
                } else {
                    // ¡DEMON ASURCA UN GOLPE DEVASTADOR! (30-38 daño normal, 38-46 en salto)
                    var isJumpAtk = (carno.aiState === 'jump_attack');
                    var cDmg = isJumpAtk ? (38 + Math.floor(Math.random() * 9)) : (30 + Math.floor(Math.random() * 8));
                    styraco.hp = Math.max(0, styraco.hp - cDmg);
                    styraco.hurtFlash = 0.25;
                    styraco.x = Math.max(20, styraco.x - 40); // Retroceso limitado
                    shakeScreen(20, 0.45);
                    spawnBlood(styraco.x + STYRACO_W * 0.45, styraco.y + 120, 32);
                    playAudio(sndStyraco);
                    createFloatingText((isJumpAtk ? '💥 ¡CRÍTICO EN SALTO! -' : '⚠️ -') + cDmg + ' HP', styraco.x + STYRACO_W * 0.35, styraco.y + 30, '#ff4757');

                    if (styraco.hp <= 0) {
                        triggerLose();
                        return;
                    }
                }
            }
        }

        // ---- 4. ACTUALIZAR PARTÍCULAS Y TEXTOS ----
        for (var b = bloodParticles.length - 1; b >= 0; b--) {
            var bp = bloodParticles[b];
            bp.x += bp.vx * dt;
            bp.vy += (600 * dt); // Gravedad de sangre
            bp.y += bp.vy * dt;
            bp.life -= dt;
            if (bp.y >= FLOOR_Y) bp.y = FLOOR_Y; // Salpica en el suelo
            if (bp.life <= 0) bloodParticles.splice(b, 1);
        }

        for (var t = floatingTexts.length - 1; t >= 0; t--) {
            var ft = floatingTexts[t];
            ft.y -= 25 * dt;
            ft.life -= dt;
            if (ft.life <= 0) floatingTexts.splice(t, 1);
        }

        if (shakeTimer > 0) shakeTimer -= dt;

        updateHUD();
    }

    // ============================================================
    //  DIBUJO DE LA ESCENA
    // ============================================================
    function drawScene() {
        if (!ctx) return;
        ctx.save();
        ctx.clearRect(0, 0, canvasW, canvasH);

        // Sacudida de pantalla (shake)
        if (shakeTimer > 0) {
            var ox = (Math.random() * 2 - 1) * shakeMag * scale;
            var oy = (Math.random() * 2 - 1) * shakeMag * scale;
            ctx.translate(ox, oy);
        }

        // 1. Fondo del Helipuerto Nocturno (Fondo pelea.jpg)
        if (imgs.bg.complete && imgs.bg.naturalWidth) {
            ctx.drawImage(imgs.bg, 0, 0, canvasW, canvasH);
        } else {
            ctx.fillStyle = '#0a101d';
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // 2. Dibujar Styracosaurus (JUGADOR) — ¡INVERTIDO HORIZONTALMENTE Y PROPORCIONAL!
        var stImgKey = 'stNeutral';
        if (styraco.action === 'dead')        stImgKey = 'stDead';
        else if (styraco.action === 'attack') stImgKey = 'stAttack';
        else if (styraco.action === 'shield') stImgKey = 'stShield';
        else if (styraco.action === 'jump')   stImgKey = 'stJump';
        else if (styraco.action === 'walk')   stImgKey = 'stWalk';

        var stImg = imgs[stImgKey];
        var stCrop = CROPS[stImgKey] || CROPS.stNeutral;

        if (stImg && stImg.complete && stImg.naturalWidth) {
            ctx.save();
            // Dimensiones proporcionales manteniendo escala anatómica exacta
            var dw = (stCrop.sw * STYRACO_SCALE_X) * scale;
            var dh = (stCrop.sh * STYRACO_SCALE_Y) * scale;
            var dx = styraco.x * scale;
            // Alinear pies/cuerpo con la base del suelo
            var dy = (styraco.y + (STYRACO_H - stCrop.sh * STYRACO_SCALE_Y)) * scale;

            // Invertir horizontalmente para que mire a la derecha hacia Carno
            ctx.translate(dx + dw, dy);
            ctx.scale(-1, 1);

            // Flash rojo al sufrir daño
            if (styraco.hurtFlash > 0) {
                ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(6)';
            }

            ctx.drawImage(
                stImg,
                stCrop.sx, stCrop.sy, stCrop.sw, stCrop.sh,
                0, 0, dw, dh
            );
            ctx.restore();
        }

        // 3. Dibujar Carnotaurus "Demon" (IA) — ¡PROPORCIONES EXACTAS EN ESCUDO Y MUERTE!
        var cnImgKey = 'cnNeutral';
        if (carno.action === 'dead')        cnImgKey = 'cnDead';
        else if (carno.action === 'attack') cnImgKey = 'cnAttack';
        else if (carno.action === 'shield') cnImgKey = 'cnShield';
        else if (carno.action === 'jump')   cnImgKey = 'cnJump';
        else if (carno.action === 'walk')   cnImgKey = 'cnWalk';

        var cnImg = imgs[cnImgKey];
        var cnCrop = CROPS[cnImgKey] || CROPS.cnNeutral;

        if (cnImg && cnImg.complete && cnImg.naturalWidth) {
            ctx.save();
            // Tamaño proporcional al recorte real para no agrandar el escudo ni el cuerpo al morir
            var cdw = (cnCrop.sw * CARNO_SCALE_X) * scale;
            var cdh = (cnCrop.sh * CARNO_SCALE_Y) * scale;
            var cdx = carno.x * scale;
            // Alinear pies/cuerpo a la base del helipuerto
            var cdy = (carno.y + (CARNO_H - cnCrop.sh * CARNO_SCALE_Y)) * scale;

            // Flash rojo al sufrir daño
            if (carno.hurtFlash > 0) {
                ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(6)';
            }

            ctx.drawImage(
                cnImg,
                cnCrop.sx, cnCrop.sy, cnCrop.sw, cnCrop.sh,
                cdx, cdy, cdw, cdh
            );
            ctx.restore();
        }

        // 4. Partículas de sangre
        for (var b = 0; b < bloodParticles.length; b++) {
            var bp = bloodParticles[b];
            ctx.beginPath();
            ctx.arc(bp.x * scale, bp.y * scale, bp.size * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#c0392b';
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 4 * scale;
            ctx.fill();
        }

        // 5. Textos flotantes (Daño / Bloqueos)
        for (var t = 0; t < floatingTexts.length; t++) {
            var ft = floatingTexts[t];
            var alpha = Math.max(0, Math.min(1, ft.life / (ft.maxLife * 0.4)));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold ' + Math.round(18 * scale) + "px 'Orbitron', monospace";
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 6 * scale;
            ctx.fillText(ft.text, ft.x * scale, ft.y * scale);
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  ACTUALIZACIÓN DEL HUD DE COMBATE
    // ============================================================
    function updateHUD() {
        var stHpEl = document.getElementById('ss-hp-styraco');
        var cnHpEl = document.getElementById('ss-hp-carno');
        if (stHpEl) {
            var stPct = Math.max(0, Math.min(100, (styraco.hp / styraco.maxHp) * 100));
            stHpEl.style.width = stPct + '%';
        }
        if (cnHpEl) {
            var cnPct = Math.max(0, Math.min(100, (carno.hp / carno.maxHp) * 100));
            cnHpEl.style.width = cnPct + '%';
        }
        var stName = document.querySelector('.ss-fighter-box:first-child .ss-fighter-name');
        var cnName = document.querySelector('.ss-fighter-box:last-child .ss-fighter-name');
        if (stName) stName.textContent = '🌿 STYRACOSAURUS (' + Math.ceil(styraco.hp) + '/' + styraco.maxHp + ' HP)';
        if (cnName) cnName.textContent = 'CARNOTAURUS "DEMON" 😈 (' + Math.ceil(carno.hp) + '/' + carno.maxHp + ' HP)';
    }

    // ============================================================
    //  PANTALLAS MODALES
    // ============================================================
    function showScreen(id) {
        var screens = ['ss-start-screen', 'ss-win-screen', 'ss-lose-screen'];
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
    //  INICIO Y CONTROL DE LA PELEA
    // ============================================================
    function startGame() {
        showScreen(null);
        state = 'fighting';

        initFighters();
        updateHUD();
        drawScene();

        lastTime = performance.now();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        fightLoop(lastTime);

        if (sndMusic) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }
    }

    function fightLoop(now) {
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.08) dt = 0.08;

        updateFighters(dt);
        drawScene();

        if (state === 'fighting') {
            aniFrame = requestAnimationFrame(fightLoop);
        }
    }

    function triggerWin() {
        state = 'won';
        carno.action = 'dead';
        drawScene();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        setTimeout(function () {
            showScreen('ss-win-screen');
        }, 600);
    }

    function triggerLose() {
        state = 'lost';
        styraco.action = 'dead';
        drawScene();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        setTimeout(function () {
            showScreen('ss-lose-screen');
        }, 600);
    }

    // ============================================================
    //  ABRIR / CERRAR
    // ============================================================
    function openGame() {
        var ov = document.getElementById('styraco-strike-overlay');
        if (!ov) return;
        ov.classList.add('open');
        state = 'idle';

        initFighters();
        showScreen('ss-start-screen');

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
        var ov = document.getElementById('styraco-strike-overlay');
        if (ov) ov.classList.remove('open');
        if (aniFrame) cancelAnimationFrame(aniFrame);
        stopAllAudio();
        state = 'idle';
        showScreen(null);
    }

    // Exponer función para abrir desde la sección de minijuegos del sitio
    window.openStyracoStrike = openGame;

    // ============================================================
    //  INIT
    // ============================================================
    function init() {
        injectStyles();
        initAudio();
        loadAllImages(function () {});
        buildOverlay();
        buildFAB();

        window.addEventListener('resize', function () {
            var ov = document.getElementById('styraco-strike-overlay');
            if (ov && ov.classList.contains('open')) resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
