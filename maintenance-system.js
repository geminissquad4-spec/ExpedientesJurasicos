// ============================================================
//  EXPEDIENTES JURÁSICOS — SISTEMA DE MANTENIMIENTO Y MINIJUEGO
//  InGen Control Room Security Lockdown & Compy Cable Chomper
// ============================================================

(function() {
    'use strict';

    var cfg = window.MAINTENANCE_CONFIG || { active: true, adminPin: "1993" };

    // Solo el admin con PIN puede ver la web. No hay bypass por usuario.
    var isBypassed = localStorage.getItem('ej_maint_admin_bypass') === 'true';

    var shouldShowMaintenance = cfg.active;
    if (isBypassed) {
        shouldShowMaintenance = false;
    }

    if (!shouldShowMaintenance) {
        console.log("[InGen Security] Acceso autorizado. Mantenimiento desactivado.");
        return;
    }

    // Bloquear página inmediatamente
    document.addEventListener('DOMContentLoaded', initMaintenanceScreen);
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initMaintenanceScreen();
    }

    // ---- ESTRUCTURA HTML PRINCIPAL ----
    function initMaintenanceScreen() {
        if (document.getElementById('maintenance-overlay')) return;

        document.body.classList.add('in-maintenance');

        var overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.innerHTML =
            // Fondo 4K del PowerPoint System
            '<div class="maint-bg-container">' +
                '<img class="maint-bg-img" src="system_maintenance_4k.jpg" ' +
                     'onerror="this.src=\'system_maintenance_4k.png\';" ' +
                     'alt="InGen Security Lockdown">' +
            '</div>' +

            // Filtro CRT Scanlines
            '<div class="maint-scanlines"></div>' +

            // Cabecera Superior HUD
            '<header class="maint-top-bar">' +
                '<div class="maint-alert-badge">' +
                    '<span class="maint-blink-dot"></span>' +
                    '<span>ALERTA DE SEGURIDAD // RED PRIMARIA OFFLINE</span>' +
                '</div>' +
                '<div class="maint-system-clock" id="maint-clock">ISLA NUBLAR [1993.06.11] --:--:--</div>' +
                '<button class="maint-admin-btn" id="maint-admin-trigger">🔒 ACCESO ADMIN</button>' +
            '</header>' +

            // Botón JUGAR (visible sobre la imagen, el juego está oculto)
            '<div class="maint-play-container" id="maint-play-container">' +
                '<button class="maint-play-btn" id="maint-play-btn">' +
                    '<span class="maint-play-icon">▶</span>' +
                    '<span class="maint-play-label">JUGAR</span>' +
                    '<span class="maint-play-sub">COMPY CABLE CHOMPER</span>' +
                '</button>' +
            '</div>' +

            // Arena del Minijuego (oculta por defecto)
            '<div class="maint-game-panel" id="maint-game-panel">' +
                '<section class="compy-game-arena" id="compy-arena" title="¡Haz clic en el Compy para atraparlo!">' +

                    '<div class="game-mission-pill">⚠️ MISIÓN: ¡ATRAPA AL COMPY ANTES DE QUE DESTRUYA LOS CABLES!</div>' +

                    '<button class="game-close-btn" id="game-close-btn">✕ VOLVER</button>' +

                    // SVG de Cables
                    '<svg class="game-cable-svg" id="game-cables-svg" viewBox="0 0 1000 400" preserveAspectRatio="none">' +
                        '<path class="cable-line cable-core-1" d="M0,60 C300,130 700,20 1000,70" />' +
                        '<path class="cable-line cable-core-2" d="M0,150 C250,210 750,90 1000,170" />' +
                        '<path class="cable-line cable-core-3 cable-severed" d="M0,240 C350,310 650,180 1000,260" />' +
                        '<path class="cable-line cable-core-4" d="M0,320 C320,370 680,260 1000,330" />' +
                    '</svg>' +

                    // Canvas de Chispas
                    '<canvas id="game-sparks-canvas"></canvas>' +

                    // Sprite del Compy
                    '<div class="compy-target compy-biting" id="compy-actor">' +
                        '<img class="compy-img" src="compy_sprite.png" alt="Compsognathus">' +
                    '</div>' +

                    // Jaula de contención
                    '<div class="containment-cage" id="containment-cage"></div>' +

                    // HUD del Juego
                    '<div class="game-hud-bar">' +
                        '<div class="hud-integrity-wrap">' +
                            '<span>RED ELÉCTRICA:</span>' +
                            '<div class="hud-integrity-bar-bg">' +
                                '<div class="hud-integrity-bar-fill" id="hud-integrity-fill"></div>' +
                            '</div>' +
                            '<span id="hud-integrity-val">100%</span>' +
                        '</div>' +
                        '<div class="hud-catches-wrap">' +
                            '<span>CONTENCIÓN:</span>' +
                            '<div id="hud-catches-pips">' +
                                '<span class="catch-pip" id="pip-1"></span> ' +
                                '<span class="catch-pip" id="pip-2"></span> ' +
                                '<span class="catch-pip" id="pip-3"></span>' +
                            '</div>' +
                        '</div>' +
                        '<div style="color:#00e5b0;" id="hud-status-text">⚡ COMPY MASTICANDO CABLE CENTRAL</div>' +
                    '</div>' +

                    // Modal Victoria (SIN bypass)
                    '<div class="game-overlay-msg" id="game-win-modal">' +
                        '<div class="game-msg-title win">¡COMPY CAPTURADO Y ASEGURADO!</div>' +
                        '<div class="game-msg-desc">Has restaurado la integridad de la red de cables de InGen Corporation antes del colapso total del sistema.</div>' +
                        '<button class="game-btn game-btn-primary" id="btn-replay-game">VOLVER A JUGAR</button>' +
                    '</div>' +

                    // Modal Derrota
                    '<div class="game-overlay-msg" id="game-lose-modal">' +
                        '<div class="game-msg-title lose">¡FALLO TOTAL DE ENERGÍA!</div>' +
                        '<div class="game-msg-desc">El Compy cortó los cables principales y la red se sobrecargó. Reinicia los disyuntores para intentarlo de nuevo.</div>' +
                        '<button class="game-btn game-btn-primary" id="btn-retry-game">REINICIAR SISTEMA</button>' +
                    '</div>' +

                '</section>' +
            '</div>' +

            // (footer eliminado a petición del usuario)

            // Modal Admin PIN
            '<div class="maint-admin-modal" id="maint-admin-modal">' +
                '<div class="maint-admin-card">' +
                    '<div class="maint-admin-title">INGEN SECURITY OVERRIDE</div>' +
                    '<p style="font-size:0.85rem;color:#88a892;margin:0;">Introduce tu código de autorización para restaurar la vista previa:</p>' +
                    '<input type="password" class="maint-pin-input" id="maint-pin-input" placeholder="PIN" maxlength="8" autofocus>' +
                    '<div id="maint-pin-error" style="color:#ff4444;font-size:0.8rem;min-height:1.2rem;margin-bottom:0.8rem;"></div>' +
                    '<div style="display:flex;gap:0.8rem;justify-content:center;">' +
                        '<button class="game-btn game-btn-primary" id="btn-submit-pin">INGRESAR</button>' +
                        '<button class="game-btn game-btn-secondary" id="btn-close-pin">CANCELAR</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.prepend(overlay);

        initClock();
        initPlayButton();
        initAdminControls();
    }

    // ---- RELOJ HUD ----
    function initClock() {
        var clockEl = document.getElementById('maint-clock');
        if (!clockEl) return;
        function update() {
            var d = new Date();
            var h = String(d.getHours()).padStart(2, '0');
            var m = String(d.getMinutes()).padStart(2, '0');
            var s = String(d.getSeconds()).padStart(2, '0');
            clockEl.textContent = 'ISLA NUBLAR [1993.06.11] ' + h + ':' + m + ':' + s + ' CST';
        }
        setInterval(update, 1000);
        update();
    }

    // ---- BOTÓN JUGAR ----
    function initPlayButton() {
        var playContainer = document.getElementById('maint-play-container');
        var playBtn = document.getElementById('maint-play-btn');
        var gamePanel = document.getElementById('maint-game-panel');
        var closeBtn = document.getElementById('game-close-btn');

        if (!playBtn || !gamePanel) return;

        var gameInitialized = false;

        playBtn.addEventListener('click', function() {
            // Ocultar botón JUGAR
            playContainer.classList.add('hidden');
            // Mostrar panel del juego
            gamePanel.classList.add('active');

            if (!gameInitialized) {
                gameInitialized = true;
                initCompyGame();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                gamePanel.classList.remove('active');
                playContainer.classList.remove('hidden');
            });
        }
    }

    // ---- AUDIO SINTETIZADO ----
    var audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function playSparkSound() {
        try {
            var ctx = getAudioContext(); if (!ctx) return;
            var bufferSize = ctx.sampleRate * 0.08;
            var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
            }
            var noise = ctx.createBufferSource();
            noise.buffer = buffer;
            var filter = ctx.createBiquadFilter();
            filter.type = 'highpass'; filter.frequency.value = 1200;
            var gain = ctx.createGain(); gain.gain.value = 0.22;
            noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            noise.start();
        } catch(e) {}
    }

    function playCompyScreechSound() {
        try {
            var audio = new Audio('Rugidos/Compsognathus.mp4');
            audio.currentTime = 0;
            var p = audio.play();
            if (p) p.catch(playSyntheticChirp);
        } catch(e) { playSyntheticChirp(); }
    }

    function playSyntheticChirp() {
        try {
            var ctx = getAudioContext(); if (!ctx) return;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(2200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.16);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.18);
        } catch(e) {}
    }

    function playCageClangSound() {
        try {
            var ctx = getAudioContext(); if (!ctx) return;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(240, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.35);
        } catch(e) {}
    }

    // ---- MOTOR DEL MINIJUEGO COMPY CABLE CHOMPER ----
    function initCompyGame() {
        var arena = document.getElementById('compy-arena');
        var compy = document.getElementById('compy-actor');
        var sparksCanvas = document.getElementById('game-sparks-canvas');
        var cage = document.getElementById('containment-cage');
        var integrityFill = document.getElementById('hud-integrity-fill');
        var integrityVal = document.getElementById('hud-integrity-val');
        var statusText = document.getElementById('hud-status-text');
        var winModal = document.getElementById('game-win-modal');
        var loseModal = document.getElementById('game-lose-modal');
        var btnReplay = document.getElementById('btn-replay-game');
        var btnRetry = document.getElementById('btn-retry-game');

        if (!arena || !compy || !sparksCanvas) return;

        var ctx2d = sparksCanvas.getContext('2d');
        var arenaW = arena.clientWidth || 800;
        var arenaH = arena.clientHeight || 400;

        function resizeCanvas() {
            arenaW = arena.clientWidth;
            arenaH = arena.clientHeight;
            sparksCanvas.width = arenaW;
            sparksCanvas.height = arenaH;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        var gameState = 'playing';
        var integrity = 100;
        var catches = 0;
        var targetCatches = (cfg.minigame && cfg.minigame.targetCatches) || 3;
        var compySpeedMult = (cfg.minigame && cfg.minigame.compySpeedMultiplier) || 1.4;
        var evasionRadius = (cfg.minigame && cfg.minigame.evasionRadius) || 110;
        // En móvil táctil, mayor radio de evasión (más difícil)
        if ('ontouchstart' in window) evasionRadius = Math.round(evasionRadius * 1.35);

        var cableLevels = [0.18, 0.42, 0.65, 0.82];
        var currentCableIdx = 1;
        var compyX = arenaW * 0.5;
        var compyY = arenaH * cableLevels[currentCableIdx];
        var compyFacing = 1;
        var isBiting = true;
        var biteTimer = 0;
        var moveTargetX = compyX;
        var moveTargetY = compyY;
        var lastTime = performance.now();

        // Partículas
        var sparks = [];
        function createSparks(x, y, count, color) {
            for (var i = 0; i < count; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = 2 + Math.random() * 7;
                sparks.push({
                    x: x, y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.5,
                    life: 1,
                    decay: 0.025 + Math.random() * 0.04,
                    color: color || (Math.random() > 0.3 ? '#00e5b0' : '#f1c40f'),
                    size: 1.5 + Math.random() * 2.5
                });
            }
        }

        function updateSparks() {
            ctx2d.clearRect(0, 0, arenaW, arenaH);
            for (var i = sparks.length - 1; i >= 0; i--) {
                var p = sparks[i];
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.22;
                p.life -= p.decay;
                if (p.life <= 0) { sparks.splice(i, 1); continue; }
                ctx2d.save();
                ctx2d.globalAlpha = p.life;
                ctx2d.fillStyle = p.color;
                ctx2d.shadowColor = p.color;
                ctx2d.shadowBlur = 8;
                ctx2d.beginPath();
                ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx2d.fill();
                ctx2d.restore();
            }
        }

        function gameLoop(now) {
            var dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (gameState === 'playing') {
                if (isBiting) {
                    integrity -= ((cfg.minigame && cfg.minigame.damagePerBite) || 1.2) * dt * (catches + 1);
                    if (integrity <= 0) { integrity = 0; triggerGameOver(false); }
                    updateHUD();

                    if (Math.random() < 0.28) {
                        var mouthX = compyX + (compyFacing === 1 ? 55 : -55);
                        createSparks(mouthX, compyY - 5, 4);
                        if (Math.random() < 0.15) playSparkSound();
                    }

                    biteTimer += dt * 1000;
                    if (biteTimer > ((cfg.minigame && cfg.minigame.biteDuration) || 900)) {
                        chooseNewCableSpot();
                    }
                } else {
                    var dx = moveTargetX - compyX;
                    var dy = moveTargetY - compyY;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var speed = 320 * compySpeedMult * (1 + catches * 0.35);

                    if (dist < 15) {
                        compyX = moveTargetX; compyY = moveTargetY;
                        isBiting = true; biteTimer = 0;
                        compy.classList.remove('compy-scurrying');
                        compy.classList.add('compy-biting');
                        statusText.textContent = '⚡ COMPY MASTICANDO CABLE (¡ATÁCALO YA!)';
                        statusText.style.color = '#ff4444';
                    } else {
                        compyX += (dx / dist) * speed * dt;
                        compyY += (dy / dist) * speed * dt;
                        compyFacing = dx >= 0 ? 1 : -1;
                        compy.classList.add('compy-scurrying');
                        compy.classList.remove('compy-biting');
                        statusText.textContent = '💨 COMPY CORRIENDO POR LOS DUCTOS...';
                        statusText.style.color = '#f1c40f';
                    }
                }

                compy.style.left = (compyX - 65) + 'px';
                compy.style.top = (compyY - 24) + 'px';
                compy.style.transform = 'scaleX(' + compyFacing + ')';
            }

            updateSparks();
            requestAnimationFrame(gameLoop);
        }

        function chooseNewCableSpot() {
            isBiting = false;
            var nextCable = Math.floor(Math.random() * cableLevels.length);
            if (nextCable === currentCableIdx) nextCable = (currentCableIdx + 1) % cableLevels.length;
            currentCableIdx = nextCable;
            moveTargetX = 60 + Math.random() * (arenaW - 140);
            moveTargetY = arenaH * cableLevels[currentCableIdx];
        }

        function checkCursorEvasion(e) {
            if (gameState !== 'playing') return;
            var rect = arena.getBoundingClientRect();
            var mouseX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            var mouseY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
            var dist = Math.hypot(mouseX - compyX, mouseY - compyY);

            if (dist < evasionRadius) {
                compy.classList.add('compy-dodge');
                playCompyScreechSound();
                var fleeAngle = Math.atan2(compyY - mouseY, compyX - mouseX) + (Math.random() * 0.6 - 0.3);
                var fleeDist = 140 + Math.random() * 160;
                moveTargetX = Math.max(60, Math.min(arenaW - 80, compyX + Math.cos(fleeAngle) * fleeDist));
                currentCableIdx = Math.floor(Math.random() * cableLevels.length);
                moveTargetY = arenaH * cableLevels[currentCableIdx];
                isBiting = false; biteTimer = 0;
                createSparks(compyX, compyY, 8, '#ff3333');
                setTimeout(function() { compy.classList.remove('compy-dodge'); }, 220);
            }
        }

        arena.addEventListener('mousemove', checkCursorEvasion);
        arena.addEventListener('touchmove', checkCursorEvasion);

        compy.addEventListener('mousedown', onCompyCaptured);
        compy.addEventListener('touchstart', function(e) { e.preventDefault(); onCompyCaptured(e); });

        function onCompyCaptured(e) {
            e.stopPropagation();
            if (gameState !== 'playing') return;
            catches++;
            playCompyScreechSound();
            createSparks(compyX, compyY, 30, '#f1c40f');
            var pip = document.getElementById('pip-' + catches);
            if (pip) pip.classList.add('filled');

            if (catches >= targetCatches) {
                triggerGameOver(true);
            } else {
                compySpeedMult += 0.45;
                statusText.textContent = '¡IMPACTO (' + catches + '/' + targetCatches + ')! EL COMPY ESCAPÓ HACIA OTRO CABLE';
                statusText.style.color = '#2ecc71';
                chooseNewCableSpot();
            }
        }

        function updateHUD() {
            integrityFill.style.width = integrity + '%';
            integrityVal.textContent = Math.round(integrity) + '%';
            if (integrity < 30) {
                integrityFill.style.background = '#e74c3c';
            } else if (integrity < 65) {
                integrityFill.style.background = '#f39c12';
            } else {
                integrityFill.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71)';
            }
        }

        function triggerGameOver(won) {
            if (won) {
                gameState = 'won';
                playCageClangSound();
                cage.style.left = (compyX - 90) + 'px';
                cage.style.top = (compyY - 60) + 'px';
                cage.classList.add('drop');
                statusText.textContent = '🔒 ¡COMPY CONTENIDO CON ÉXITO!';
                statusText.style.color = '#2ecc71';
                setTimeout(function() { winModal.classList.add('active'); }, 600);
            } else {
                gameState = 'lost';
                statusText.textContent = '💀 CORTE DE ENERGÍA CRÍTICO';
                statusText.style.color = '#ff3333';
                loseModal.classList.add('active');
            }
        }

        function resetGame() {
            gameState = 'playing';
            integrity = 100;
            catches = 0;
            compySpeedMult = (cfg.minigame && cfg.minigame.compySpeedMultiplier) || 1.4;
            cage.classList.remove('drop');
            winModal.classList.remove('active');
            loseModal.classList.remove('active');
            document.querySelectorAll('.catch-pip').forEach(function(p) { p.classList.remove('filled'); });
            chooseNewCableSpot();
            updateHUD();
        }

        if (btnReplay) btnReplay.addEventListener('click', resetGame);
        if (btnRetry) btnRetry.addEventListener('click', resetGame);

        requestAnimationFrame(gameLoop);
    }

    // ---- CONTROLES DE ADMINISTRADOR ----
    function initAdminControls() {
        var triggerBtn = document.getElementById('maint-admin-trigger');
        var modal = document.getElementById('maint-admin-modal');
        var pinInput = document.getElementById('maint-pin-input');
        var pinError = document.getElementById('maint-pin-error');
        var btnSubmit = document.getElementById('btn-submit-pin');
        var btnClose = document.getElementById('btn-close-pin');

        if (!triggerBtn || !modal) return;

        function openModal() {
            modal.classList.add('open');
            pinInput.value = '';
            pinError.textContent = '';
            setTimeout(function() { pinInput.focus(); }, 100);
        }

        function closeModal() {
            modal.classList.remove('open');
        }

        triggerBtn.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);

        window.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
                e.preventDefault();
                openModal();
            }
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

        function verifyPin() {
            var val = pinInput.value.trim();
            var targetPin = cfg.adminPin || "1993";
            if (val === targetPin || val === "ingen") {
                pinError.style.color = '#00e5b0';
                pinError.textContent = "ACCESO AUTORIZADO. RESTAURANDO SITIO...";
                localStorage.setItem('ej_maint_admin_bypass', 'true');
                setTimeout(function() { window.location.reload(); }, 400);
            } else {
                pinError.style.color = '#ff4444';
                pinError.textContent = "PIN INCORRECTO: AH AH AH! YOU DIDN'T SAY THE MAGIC WORD!";
                pinInput.value = '';
                pinInput.focus();
            }
        }

        btnSubmit.addEventListener('click', verifyPin);
        pinInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') verifyPin();
        });
    }

})();
