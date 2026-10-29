/**
 * ============================================================
 * EXPEDIENTES JURÁSICOS - ¡ESCAPA DEL CRYOLOPHOSAURUS!
 * ============================================================
 *
 * Minijuego de persecución perimetral en Isla Matanceros.
 * Carlos debe correr, saltar y barrerse para esquivar obstáculos
 * terrestres y aéreos mientras el Cryolophosaurus lo persigue.
 */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CONFIGURACIÓN Y CONSTANTES
    // ------------------------------------------------------------
    var CANVAS_W = 1280;
    var CANVAS_H = 720;
    var GROUND_Y = 570;
    var TARGET_DISTANCE = 1500; // 1,500 metros para mayor tiempo de juego

    // Catálogo de Sprites con múltiples rutas de fallback (raíz de GitHub, carpetas y codificadas)
    var SPRITE_CANDIDATES = {
        bg: [
            'Fondo Largo Opt.jpg',
            'Fondo%20Largo%20Opt.jpg',
            'Fondo Largo.png',
            'Fondo%20Largo.png',
            'Fondo Laargo.png',
            'Fondo%20Laargo.png',
            'Fondo Laargo.jpg',
            'Fondo%20Laargo.jpg',
            'Escapa del Cryolophosaurus/Fondo Largo Opt.jpg',
            'Escapa%20del%20Cryolophosaurus/Fondo%20Largo%20Opt.jpg',
            'Escapa del Cryolophosaurus/Fondo Largo.png',
            'Escapa%20del%20Cryolophosaurus/Fondo%20Largo.png'
        ],
        bunker: [
            'bunker.png',
            'Bunker.png',
            'Escapa del Cryolophosaurus/web_sprites/bunker.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/bunker.png',
            'Escapa del Cryolophosaurus/Bunker.png',
            'Escapa%20del%20Cryolophosaurus/Bunker.png'
        ],
        carlosRun1: [
            'carlos_run1.png',
            'Carlos Run1.png',
            'Carlos%20Run1.png',
            'Escapa del Cryolophosaurus/web_sprites/carlos_run1.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/carlos_run1.png',
            'Escapa del Cryolophosaurus/Carlos Run1.png',
            'Escapa%20del%20Cryolophosaurus/Carlos%20Run1.png'
        ],
        carlosRun2: [
            'carlos_run2.png',
            'Carlos Run2.png',
            'Carlos%20Run2.png',
            'Escapa del Cryolophosaurus/web_sprites/carlos_run2.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/carlos_run2.png',
            'Escapa del Cryolophosaurus/Carlos Run2.png',
            'Escapa%20del%20Cryolophosaurus/Carlos%20Run2.png'
        ],
        carlosJump: [
            'carlos_jump.png',
            'Carlos Jump.png',
            'Carlos%20Jump.png',
            'Escapa del Cryolophosaurus/web_sprites/carlos_jump.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/carlos_jump.png',
            'Escapa del Cryolophosaurus/Carlos Jump.png',
            'Escapa%20del%20Cryolophosaurus/Carlos%20Jump.png'
        ],
        carlosSlide: [
            'carlos_slide.png',
            'Carlos Barrida.png',
            'Carlos%20Barrida.png',
            'Escapa del Cryolophosaurus/web_sprites/carlos_slide.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/carlos_slide.png',
            'Escapa del Cryolophosaurus/Carlos Barrida.png',
            'Escapa%20del%20Cryolophosaurus/Carlos%20Barrida.png'
        ],
        cryoRun1: [
            'cryo_run1.png',
            'Cryo Run1.png',
            'Cryo%20Run1.png',
            'Escapa del Cryolophosaurus/web_sprites/cryo_run1.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/cryo_run1.png',
            'Escapa del Cryolophosaurus/Cryo Run1.png',
            'Escapa%20del%20Cryolophosaurus/Cryo%20Run1.png'
        ],
        cryoRun2: [
            'cryo_run2.png',
            'Cryo Run2.png',
            'Cryo%20Run2.png',
            'Escapa del Cryolophosaurus/web_sprites/cryo_run2.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/cryo_run2.png',
            'Escapa del Cryolophosaurus/Cryo Run2.png',
            'Escapa%20del%20Cryolophosaurus/Cryo%20Run2.png'
        ],
        cryoScream: [
            'cryo_scream.png',
            'Cryo Scream.png',
            'Cryo%20Scream.png',
            'Escapa del Cryolophosaurus/web_sprites/cryo_scream.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/cryo_scream.png',
            'Escapa del Cryolophosaurus/Cryo Scream.png',
            'Escapa%20del%20Cryolophosaurus/Cryo%20Scream.png'
        ],
        roca1: [
            'roca1.png',
            'RocaD1.png',
            'Escapa del Cryolophosaurus/web_sprites/roca1.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/roca1.png',
            'Escapa del Cryolophosaurus/RocaD1.png',
            'Escapa%20del%20Cryolophosaurus/RocaD1.png'
        ],
        roca2: [
            'roca2.png',
            'RocaD2.png',
            'Escapa del Cryolophosaurus/web_sprites/roca2.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/roca2.png',
            'Escapa del Cryolophosaurus/RocaD2.png',
            'Escapa%20del%20Cryolophosaurus/RocaD2.png'
        ],
        roca3: [
            'roca3.png',
            'RocaD3.png',
            'Escapa del Cryolophosaurus/web_sprites/roca3.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/roca3.png',
            'Escapa del Cryolophosaurus/RocaD3.png',
            'Escapa%20del%20Cryolophosaurus/RocaD3.png'
        ],
        hoja1: [
            'hoja1.png',
            'HojaD1.png',
            'Escapa del Cryolophosaurus/web_sprites/hoja1.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/hoja1.png',
            'Escapa del Cryolophosaurus/HojaD1.png',
            'Escapa%20del%20Cryolophosaurus/HojaD1.png'
        ],
        hoja2: [
            'hoja2.png',
            'HojaD2.png',
            'Escapa del Cryolophosaurus/web_sprites/hoja2.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/hoja2.png',
            'Escapa del Cryolophosaurus/HojaD2.png',
            'Escapa%20del%20Cryolophosaurus/HojaD2.png'
        ],
        hoja3: [
            'hoja3.png',
            'HojaD3.png',
            'Escapa del Cryolophosaurus/web_sprites/hoja3.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/hoja3.png',
            'Escapa del Cryolophosaurus/HojaD3.png',
            'Escapa%20del%20Cryolophosaurus/HojaD3.png'
        ],
        coeluroSuelo: [
            'coeluro_suelo.png',
            'CoeluroSuelo.png',
            'Escapa del Cryolophosaurus/web_sprites/coeluro_suelo.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/coeluro_suelo.png',
            'Escapa del Cryolophosaurus/CoeluroSuelo.png',
            'Escapa%20del%20Cryolophosaurus/CoeluroSuelo.png'
        ],
        coeluroFly: [
            'coeluro_fly.png',
            'CoeluroFly.png',
            'Escapa del Cryolophosaurus/web_sprites/coeluro_fly.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/coeluro_fly.png',
            'Escapa del Cryolophosaurus/CoeluroFly.png',
            'Escapa%20del%20Cryolophosaurus/CoeluroFly.png'
        ],
        pteraFly: [
            'ptera_fly.png',
            'PteraFly.png',
            'Escapa del Cryolophosaurus/web_sprites/ptera_fly.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/ptera_fly.png',
            'Escapa del Cryolophosaurus/PteraFly.png',
            'Escapa%20del%20Cryolophosaurus/PteraFly.png'
        ],
        microxGround: [
            'microx.png',
            'Microx.png',
            'Escapa del Cryolophosaurus/web_sprites/microx.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/microx.png',
            'Escapa del Cryolophosaurus/Microx.png',
            'Escapa%20del%20Cryolophosaurus/Microx.png'
        ],
        microxFly: [
            'microx.png',
            'Microx.png',
            'Escapa del Cryolophosaurus/web_sprites/microx.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/microx.png',
            'Escapa del Cryolophosaurus/Microx.png',
            'Escapa%20del%20Cryolophosaurus/Microx.png'
        ],
        huevo: [
            'huevo.png',
            'HuevoS.png',
            'Escapa del Cryolophosaurus/web_sprites/huevo.png',
            'Escapa%20del%20Cryolophosaurus/web_sprites/huevo.png',
            'Escapa del Cryolophosaurus/HuevoS.png',
            'Escapa%20del%20Cryolophosaurus/HuevoS.png'
        ]
    };

    // ------------------------------------------------------------
    // 2. SISTEMA DE AUDIO (MÚSICA + RUGIDOS + WEBAUDIO SFX)
    // ------------------------------------------------------------
    var audioCtx = null;
    var sndMusic = null;
    var sndCryo = null;
    var sndPtera = null;
    var sndCoeluro = null;
    var sndMicro = null;
    var isMuted = false;

    function getAudioCtx() {
        if (!audioCtx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioCtx = new AudioCtx();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(function () {});
        }
        return audioCtx;
    }

    function createResilientAudio(candidates, loop, vol) {
        var audio = new Audio();
        audio.loop = !!loop;
        audio.volume = vol !== undefined ? vol : 0.7;

        var idx = 0;
        function tryNextSrc() {
            if (idx >= candidates.length) return;
            var src = candidates[idx++];
            audio.src = src;
        }
        audio.addEventListener('error', function () {
            tryNextSrc();
        });
        tryNextSrc();
        return audio;
    }

    function initAudios() {
        if (!sndMusic) {
            sndMusic = createResilientAudio([
                'EscapeCryolophosaurus.mp4',
                'EscapeCryolophosaurus.mp3',
                'Escapa del Cryolophosaurus/EscapeCryolophosaurus.mp4',
                'Escapa%20del%20Cryolophosaurus/EscapeCryolophosaurus.mp4'
            ], true, 0.5);
        }
        if (!sndCryo) {
            sndCryo = createResilientAudio([
                'CryolophosaurusR.mp4',
                'CryolophosaurusR.mp3',
                'Escapa del Cryolophosaurus/CryolophosaurusR.mp4',
                'Escapa%20del%20Cryolophosaurus/CryolophosaurusR.mp4'
            ], false, 0.9);
        }
        if (!sndPtera) {
            sndPtera = createResilientAudio([
                'PteranodonR.mp4',
                'PteranodonR.mp3',
                'Escapa del Cryolophosaurus/PteranodonR.mp4',
                'Escapa%20del%20Cryolophosaurus/PteranodonR.mp4'
            ], false, 0.75);
        }
        if (!sndCoeluro) {
            sndCoeluro = createResilientAudio([
                'CoelurosauravusR.mp4',
                'CoelurosauravusR.mp3',
                'Escapa del Cryolophosaurus/CoelurosauravusR.mp4',
                'Escapa%20del%20Cryolophosaurus/CoelurosauravusR.mp4'
            ], false, 0.7);
        }
        if (!sndMicro) {
            sndMicro = createResilientAudio([
                'MicroraptorR.mp4',
                'MicroraptorR.mp3',
                'Escapa del Cryolophosaurus/MicroraptorR.mp4',
                'Escapa%20del%20Cryolophosaurus/MicroraptorR.mp4'
            ], false, 0.7);
        }
    }

    function playSoundSafe(snd) {
        if (!snd || isMuted) return;
        try {
            snd.currentTime = 0;
            snd.play().catch(function () {});
        } catch (e) {}
    }

    function playSynthBeep(freq, type, duration, vol, delay) {
        if (isMuted) return;
        try {
            var ctx = getAudioCtx();
            if (!ctx) return;
            var t = ctx.currentTime + (delay || 0);
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol || 0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + duration);
        } catch (e) {}
    }

    function sfxJump() {
        playSynthBeep(260, 'sine', 0.18, 0.2, 0);
        playSynthBeep(520, 'sine', 0.18, 0.15, 0.05);
    }

    function sfxSlide() {
        playSynthBeep(340, 'sawtooth', 0.22, 0.12, 0);
        playSynthBeep(180, 'sine', 0.22, 0.15, 0.08);
    }

    function sfxHit() {
        playSynthBeep(120, 'sawtooth', 0.35, 0.35, 0);
        playSynthBeep(80, 'square', 0.45, 0.3, 0.08);
    }

    function sfxEgg() {
        playSynthBeep(523.25, 'triangle', 0.12, 0.25, 0);
        playSynthBeep(659.25, 'triangle', 0.12, 0.25, 0.08);
        playSynthBeep(783.99, 'triangle', 0.18, 0.3, 0.16);
        playSynthBeep(1046.5, 'sine', 0.35, 0.35, 0.24);
    }

    function sfxVictory() {
        playSynthBeep(440, 'triangle', 0.15, 0.3, 0);
        playSynthBeep(554.37, 'triangle', 0.15, 0.3, 0.12);
        playSynthBeep(659.25, 'triangle', 0.18, 0.35, 0.24);
        playSynthBeep(880, 'sine', 0.5, 0.4, 0.36);
    }

    function stopAllAudios() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        if (sndCryo) {
            try { sndCryo.pause(); sndCryo.currentTime = 0; } catch (e) {}
        }
    }

    // ------------------------------------------------------------
    // 3. PRECARGA INTELIGENTE Y AUTO-PROCESAMIENTO DE SPRITES
    // ------------------------------------------------------------
    var images = {};
    var imagesLoaded = false;

    // Recorte automático de márgenes transparentes y orientación para compatibilidad con archivos directos
    function autoCropAndFlipSprite(img, needsFlip) {
        try {
            var temp = document.createElement('canvas');
            temp.width = img.naturalWidth || img.width;
            temp.height = img.naturalHeight || img.height;
            var tctx = temp.getContext('2d');
            tctx.drawImage(img, 0, 0);

            var imgData = tctx.getImageData(0, 0, temp.width, temp.height);
            var data = imgData.data;
            var minX = temp.width, minY = temp.height, maxX = 0, maxY = 0;
            var found = false;

            // Escaneo rápido saltando de 3 en 3 píxeles
            for (var y = 0; y < temp.height; y += 3) {
                for (var x = 0; x < temp.width; x += 3) {
                    var a = data[(y * temp.width + x) * 4 + 3];
                    if (a > 15) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        found = true;
                    }
                }
            }

            if (!found) return img;

            var cropW = Math.max(1, maxX - minX + 1);
            var cropH = Math.max(1, maxY - minY + 1);

            var outCanvas = document.createElement('canvas');
            outCanvas.width = cropW;
            outCanvas.height = cropH;
            var outCtx = outCanvas.getContext('2d');

            if (needsFlip) {
                outCtx.translate(cropW, 0);
                outCtx.scale(-1, 1);
            }

            outCtx.drawImage(temp, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
            return outCanvas;
        } catch (e) {
            // En caso de restricciones CORS en file://, voltear simplemente si se requiere
            if (needsFlip) {
                var fCanvas = document.createElement('canvas');
                fCanvas.width = img.naturalWidth || img.width;
                fCanvas.height = img.naturalHeight || img.height;
                var fCtx = fCanvas.getContext('2d');
                fCtx.translate(fCanvas.width, 0);
                fCtx.scale(-1, 1);
                fCtx.drawImage(img, 0, 0);
                return fCanvas;
            }
            return img;
        }
    }

    function loadCandidateImage(key, candidates, callback) {
        var idx = 0;
        function tryNext() {
            if (idx >= candidates.length) {
                callback(null);
                return;
            }
            var src = candidates[idx++];
            var img = new Image();
            img.onload = function () {
                var needsFlip = false;
                // Si se carga el archivo original del Cryolophosaurus, voltearlo para que mire a la DERECHA
                if ((key === 'cryoRun1' || key === 'cryoRun2' || key === 'cryoScream') && (src.indexOf('Cryo') !== -1 || src.indexOf('cryo') !== -1)) {
                    if (img.naturalWidth > 1000) {
                        needsFlip = true;
                    }
                }
                // Si se carga el archivo original del Microraptor (Microx), voltearlo para que mire a la IZQUIERDA
                if ((key === 'microxGround' || key === 'microxFly') && (src.indexOf('Microx') !== -1 || src.indexOf('microx') !== -1)) {
                    if (img.naturalWidth > 1000) {
                        needsFlip = true;
                    }
                }

                // Si es un sprite sin recortar de gran resolución (ej. 2400x1340 o 1919x1076)
                if (img.naturalWidth > 650 && key !== 'bg') {
                    try {
                        var processed = autoCropAndFlipSprite(img, needsFlip);
                        callback(processed);
                    } catch (e) {
                        callback(img);
                    }
                } else {
                    callback(img);
                }
            };
            img.onerror = function () {
                tryNext();
            };
            img.src = src;
        }
        tryNext();
    }

    function preloadImages(callback) {
        var keys = Object.keys(SPRITE_CANDIDATES);
        var loadedCount = 0;
        var total = keys.length;

        keys.forEach(function (key) {
            loadCandidateImage(key, SPRITE_CANDIDATES[key], function (resImg) {
                if (resImg) {
                    images[key] = resImg;
                }
                loadedCount++;
                if (loadedCount === total) {
                    imagesLoaded = true;
                    if (callback) callback();
                }
            });
        });
    }

    // ------------------------------------------------------------
    // 4. ESTADO DEL JUEGO
    // ------------------------------------------------------------
    var gameState = 'briefing'; // briefing, playing, paused, gameover, victory
    var distance = 0;
    var lives = 3;
    var maxLives = 3;
    var speed = 7.0;
    var bgX = 0;
    var frameCount = 0;
    var currentPhase = 1;
    var obstaclesDodged = 0;
    var eggsCollected = 0;
    var screenShake = 0;

    // Carlos
    var carlos = {
        x: 430,
        y: 0, // calculado
        w: 110,
        h: 152,
        baseY: 0,
        vy: 0,
        isJumping: false,
        isSliding: false,
        slideTimer: 0,
        maxSlideFrames: 46, // ~750ms a 60fps
        invulnerableTimer: 0,
        runFrame: 0
    };

    // Cryolophosaurus (+15% tamaño: 448x200 px, ~4 cm más atrás: base x en -110px)
    var cryo = {
        x: -110,
        y: 0,
        w: 448,
        h: 200,
        isScreaming: false,
        screamTimer: 0,
        screamInterval: 360, // 6 segundos a 60fps
        runFrame: 0,
        targetX: -110
    };

    // Obstáculos y Huevos
    var obstacles = [];
    var obstacleSpawnTimer = 110;
    var eggSpawnTimer = 750; // cada ~15-20s

    // Partículas y textos flotantes
    var particles = [];
    var floatingTexts = [];

    // Búnker final (Meta)
    var bunkerDoor = {
        active: false,
        x: CANVAS_W + 200,
        w: 580,
        h: 460,
        closed: false
    };

    // ------------------------------------------------------------
    // 5. DEFINICIÓN DE OBSTÁCULOS
    // ------------------------------------------------------------
    var OBSTACLE_TYPES = [
        // TERRESTRES (Requieren Saltar)
        { id: 'roca1',        type: 'ground', sprite: 'roca1',        w: 75,  h: 60,  sound: null },
        { id: 'roca2',        type: 'ground', sprite: 'roca2',        w: 80,  h: 56,  sound: null },
        { id: 'roca3',        type: 'ground', sprite: 'roca3',        w: 78,  h: 60,  sound: null },
        { id: 'hoja1',        type: 'ground', sprite: 'hoja1',        w: 82,  h: 76,  sound: null },
        { id: 'hoja2',        type: 'ground', sprite: 'hoja2',        w: 85,  h: 74,  sound: null },
        { id: 'hoja3',        type: 'ground', sprite: 'hoja3',        w: 80,  h: 78,  sound: null },
        { id: 'coeluroSuelo', type: 'ground', sprite: 'coeluroSuelo', w: 100, h: 52,  sound: 'coeluro' },
        { id: 'microxGround', type: 'ground', sprite: 'microxGround', w: 90,  h: 62,  sound: 'micro' },

        // AÉREOS (Requieren Barrida)
        { id: 'pteraFly',   type: 'air', sprite: 'pteraFly',   w: 155, h: 110, sound: 'ptera',   yOffset: 165 },
        { id: 'coeluroFly', type: 'air', sprite: 'coeluroFly', w: 100, h: 70,  sound: 'coeluro', yOffset: 140 },
        { id: 'microxFly',  type: 'air', sprite: 'microxFly',  w: 92,  h: 64,  sound: 'micro',   yOffset: 135 }
    ];

    // Mazo barajado cíclico: garantiza que TODOS los obstáculos aparezcan sin excepción
    var obstacleDeck = [];

    function getNextObstacleType() {
        if (obstacleDeck.length === 0) {
            obstacleDeck = OBSTACLE_TYPES.slice();
            for (var i = obstacleDeck.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = obstacleDeck[i];
                obstacleDeck[i] = obstacleDeck[j];
                obstacleDeck[j] = temp;
            }
        }
        return obstacleDeck.pop();
    }

    function spawnObstacle() {
        if (bunkerDoor.active) return; // No generar obstáculos una vez llegado al búnker

        // Selección garantizada por mazo barajado
        var candidate = getNextObstacleType();

        var obsY = 0;
        if (candidate.type === 'ground') {
            obsY = GROUND_Y - candidate.h;
        } else {
            // Aéreo: a la altura de la cabeza y torso de Carlos cuando corre de pie
            obsY = GROUND_Y - (candidate.yOffset || 150);
        }

        obstacles.push({
            id: candidate.id,
            type: candidate.type,
            sprite: candidate.sprite,
            x: CANVAS_W + 50,
            y: obsY,
            w: candidate.w,
            h: candidate.h,
            passed: false,
            sound: candidate.sound
        });

        // Reproducir rugido del obstáculo correspondiente
        if (candidate.sound === 'ptera') {
            playSoundSafe(sndPtera);
        } else if (candidate.sound === 'coeluro') {
            playSoundSafe(sndCoeluro);
        } else if (candidate.sound === 'micro') {
            playSoundSafe(sndMicro);
        }

        // Progresión de dificultad: intervalo de obstáculos decreciente con la distancia
        var progressRatio = Math.min(1.0, distance / TARGET_DISTANCE);
        var minFrames = Math.max(38, Math.floor(95 - (progressRatio * 55)));
        var maxFrames = Math.max(58, Math.floor(135 - (progressRatio * 70)));

        // Probabilidad de secuencia rápida (combo de obstáculos para poner a prueba reflejos)
        var comboChance = 0.20 + (progressRatio * 0.35); // 20% a 55%
        if (Math.random() < comboChance && progressRatio > 0.20) {
            obstacleSpawnTimer = Math.floor(36 + Math.random() * 20); // Reto inmediato (~0.6s)
        } else {
            obstacleSpawnTimer = Math.floor(minFrames + Math.random() * (maxFrames - minFrames));
        }
    }

    function spawnEgg() {
        if (bunkerDoor.active) return;

        // El huevo aparece flotando a una altura que Carlos puede alcanzar corriendo o saltando
        var eggH = 65;
        var eggW = 48;
        var eggY = GROUND_Y - eggH - (Math.random() > 0.5 ? 20 : 90);

        obstacles.push({
            id: 'huevo',
            type: 'collectible',
            sprite: 'huevo',
            x: CANVAS_W + 80,
            y: eggY,
            w: eggW,
            h: eggH,
            passed: false
        });

        // Intervalo de regeneración de huevo (más valioso en fases avanzadas)
        var progressRatio = Math.min(1.0, distance / TARGET_DISTANCE);
        var eggMin = Math.floor(750 + progressRatio * 400);
        eggSpawnTimer = Math.floor(eggMin + Math.random() * 300);
    }

    // ------------------------------------------------------------
    // 6. CONTROLADORES DE ACCIÓN (SALTAR Y BARRIDA)
    // ------------------------------------------------------------
    function doJump() {
        if (gameState !== 'playing') return;
        if (carlos.isJumping) return;

        // Si estaba barriéndose, cancelar barrida
        carlos.isSliding = false;
        carlos.slideTimer = 0;

        carlos.isJumping = true;
        carlos.vy = -16.8; // Impulso vertical limpio
        sfxJump();

        // Efecto de polvo al despegar
        spawnDustParticles(carlos.x + 40, GROUND_Y, 6);
    }

    function doSlide() {
        if (gameState !== 'playing') return;
        if (carlos.isJumping) return; // No se puede barrer en el aire

        if (!carlos.isSliding) {
            carlos.isSliding = true;
            carlos.slideTimer = carlos.maxSlideFrames;
            sfxSlide();
            spawnDustParticles(carlos.x + 30, GROUND_Y, 8);
        } else {
            // Refrescar tiempo si el jugador mantiene pulsado
            carlos.slideTimer = carlos.maxSlideFrames;
        }
    }

    function spawnDustParticles(x, y, count) {
        for (var i = 0; i < count; i++) {
            particles.push({
                x: x + (Math.random() * 20 - 10),
                y: y - 5,
                vx: -speed * 0.8 - Math.random() * 3,
                vy: -Math.random() * 2.5,
                alpha: 0.8,
                size: 3 + Math.random() * 4,
                color: 'rgba(180, 160, 130, '
            });
        }
    }

    function spawnEggParticles(x, y) {
        for (var i = 0; i < 18; i++) {
            var ang = Math.random() * Math.PI * 2;
            var vel = 2 + Math.random() * 5;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(ang) * vel,
                vy: Math.sin(ang) * vel,
                alpha: 1,
                size: 3 + Math.random() * 5,
                color: 'rgba(0, 245, 255, '
            });
        }
    }

    function addFloatingText(text, x, y, color) {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            alpha: 1,
            color: color || '#00f5ff'
        });
    }

    // ------------------------------------------------------------
    // 7. INICIALIZACIÓN Y BUCLE DE JUEGO (CANVAS 60 FPS)
    // ------------------------------------------------------------
    var canvas = null;
    var ctx = null;
    var animFrameId = null;

    function resetGame() {
        distance = 0;
        lives = 3;
        speed = 7.0;
        bgX = 0;
        frameCount = 0;
        currentPhase = 1;
        obstaclesDodged = 0;
        eggsCollected = 0;
        screenShake = 0;

        carlos.baseY = GROUND_Y - carlos.h;
        carlos.y = carlos.baseY;
        carlos.vy = 0;
        carlos.isJumping = false;
        carlos.isSliding = false;
        carlos.slideTimer = 0;
        carlos.invulnerableTimer = 0;

        cryo.x = -110;
        cryo.targetX = -110;
        cryo.y = GROUND_Y - cryo.h;
        cryo.isScreaming = false;
        cryo.screamTimer = 0;

        obstacles = [];
        particles = [];
        floatingTexts = [];
        obstacleSpawnTimer = 90;
        eggSpawnTimer = 600;

        bunkerDoor.active = false;
        bunkerDoor.x = CANVAS_W + 200;
        bunkerDoor.doorY = 0;
        bunkerDoor.closed = false;

        updateHUD();
    }

    function startGame() {
        resetGame();
        gameState = 'playing';

        initAudios();
        if (sndMusic && !isMuted) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }

        hideAllModals();
        if (!animFrameId) {
            animFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function update() {
        if (gameState !== 'playing') return;

        frameCount++;

        var progressRatio = Math.min(1.0, distance / TARGET_DISTANCE);

        // Curva progresiva de velocidad: comienza en 6.8 y acelera suavemente hasta 14.2 px/frame
        speed = 6.8 + (progressRatio * 7.4);

        // Detección de fases de dificultad creciente con avisos en pantalla
        if (distance >= 1000 && currentPhase < 3) {
            currentPhase = 3;
            addFloatingText('🔥 ¡FASE FINAL: PELIGRO CRÍTICO!', CANVAS_W / 2, 220, '#ff4757');
            screenShake = 16;
            playSoundSafe(sndCryo);
        } else if (distance >= 500 && currentPhase < 2) {
            currentPhase = 2;
            addFloatingText('⚠️ ¡FASE 2: VELOCIDAD AUMENTADA!', CANVAS_W / 2, 220, '#f1c40f');
            screenShake = 10;
        }

        // Actualizar distancia (ajustada para mayor tiempo de juego emocionante: ~2 a 2.5 minutos)
        distance += (speed * 0.024);
        if (distance >= TARGET_DISTANCE && !bunkerDoor.active) {
            // Iniciar llegada al búnker perimetral
            bunkerDoor.active = true;
            bunkerDoor.x = CANVAS_W + 50;
        }

        // Desplazamiento del fondo (velocidad aún más lenta para un parallax suave y panorámico)
        bgX -= (speed * 0.14);
        if (bgX <= -CANVAS_W * 2) {
            bgX = 0;
        }

        // Amortiguación del temblor de pantalla
        if (screenShake > 0) {
            screenShake *= 0.85;
            if (screenShake < 0.5) screenShake = 0;
        }

        // -------------------------
        // FÍSICA Y ESTADOS DE CARLOS
        // -------------------------
        carlos.baseY = GROUND_Y - carlos.h;

        // Salto
        if (carlos.isJumping) {
            carlos.y += carlos.vy;
            carlos.vy += 0.72; // Gravedad

            // Si toca el suelo
            if (carlos.y >= carlos.baseY) {
                carlos.y = carlos.baseY;
                carlos.vy = 0;
                carlos.isJumping = false;
                spawnDustParticles(carlos.x + 40, GROUND_Y, 5);
            }
        } else {
            carlos.y = carlos.baseY;
        }

        // Barrida
        if (carlos.isSliding) {
            carlos.slideTimer--;
            if (carlos.slideTimer <= 0) {
                carlos.isSliding = false;
            }
        }

        // Frame de animación corriendo
        if (frameCount % 9 === 0) {
            carlos.runFrame = 1 - carlos.runFrame;
        }

        // Invulnerabilidad tras recibir daño
        if (carlos.invulnerableTimer > 0) {
            carlos.invulnerableTimer--;
        }

        // -------------------------
        // INTELIGENCIA DEL CRYOLOPHOSAURUS
        // -------------------------
        cryo.y = GROUND_Y - cryo.h;

        // Frecuencia de rugido aumenta con la distancia (de cada 6.0s a cada 3.8s)
        cryo.screamInterval = Math.max(220, Math.floor(360 - (progressRatio * 130)));

        // Ciclo de rugido
        if (frameCount % cryo.screamInterval === 0 && !cryo.isScreaming) {
            cryo.isScreaming = true;
            cryo.screamTimer = 85; // ~1.4 segundos de rugido
            screenShake = 10 + (progressRatio * 6);
            playSoundSafe(sndCryo);
        }

        if (cryo.isScreaming) {
            cryo.screamTimer--;
            if (cryo.screamTimer <= 0) {
                cryo.isScreaming = false;
            }
        }

        // Frame de correr del Cryo
        if (frameCount % 10 === 0) {
            cryo.runFrame = 1 - cryo.runFrame;
        }

        // Ajustar posición X del Cryo (se aproxima gradualmente al avanzar y si Carlos pierde vidas)
        var distanceAdvance = progressRatio * 42;
        var baseCryoX = -110 + distanceAdvance + (3 - lives) * 45;
        cryo.x += (baseCryoX - cryo.x) * 0.05;

        // -------------------------
        // GENERACIÓN DE OBSTÁCULOS Y HUEVOS
        // -------------------------
        obstacleSpawnTimer--;
        if (obstacleSpawnTimer <= 0) {
            spawnObstacle();
        }

        eggSpawnTimer--;
        if (eggSpawnTimer <= 0) {
            spawnEgg();
        }

        // -------------------------
        // ACTUALIZACIÓN DE OBSTÁCULOS
        // -------------------------
        for (var i = obstacles.length - 1; i >= 0; i--) {
            var obs = obstacles[i];
            obs.x -= speed;

            // Detección de colisión con Carlos
            if (!obs.passed) {
                var hit = checkCollisionWithCarlos(obs);

                if (hit) {
                    if (obs.type === 'collectible') {
                        // ¡HUEVO RECOLECTADO!
                        obs.passed = true;
                        eggsCollected++;
                        sfxEgg();
                        spawnEggParticles(obs.x + obs.w / 2, obs.y + obs.h / 2);

                        if (lives < maxLives) {
                            lives++;
                            addFloatingText('+1 VIDA!', carlos.x + 30, carlos.y - 20, '#00f5ff');
                        } else {
                            addFloatingText('+100 PTS!', carlos.x + 30, carlos.y - 20, '#f1c40f');
                        }
                        updateHUD();
                        obstacles.splice(i, 1);
                        continue;
                    } else if (carlos.invulnerableTimer <= 0) {
                        // DAÑO POR OBSTÁCULO
                        obs.passed = true;
                        lives--;
                        carlos.invulnerableTimer = 90; // 1.5s invulnerable
                        screenShake = 14;
                        sfxHit();
                        addFloatingText('-1 VIDA', carlos.x + 30, carlos.y - 20, '#ff4757');
                        updateHUD();

                        if (lives <= 0) {
                            triggerGameOver();
                            return;
                        }
                    }
                }
            }

            // Si Carlos supera el obstáculo con éxito
            if (!obs.passed && obs.x + obs.w < carlos.x) {
                obs.passed = true;
                if (obs.type !== 'collectible') {
                    obstaclesDodged++;
                }
            }

            // Eliminar si sale de pantalla
            if (obs.x + obs.w < -100) {
                obstacles.splice(i, 1);
            }
        }

        // -------------------------
        // BÚNKER DE CONTENCIÓN FINAL
        // -------------------------
        if (bunkerDoor.active) {
            bunkerDoor.x -= speed;

            // Cuando Carlos entra al búnker (cruza la esclusa)
            if (carlos.x >= bunkerDoor.x + (bunkerDoor.w * 0.35) && !bunkerDoor.closed) {
                bunkerDoor.closed = true;
                triggerVictory();
                return;
            }
        }

        // -------------------------
        // PARTÍCULAS Y TEXTOS
        // -------------------------
        for (var p = particles.length - 1; p >= 0; p--) {
            var pt = particles[p];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 0.025;
            if (pt.alpha <= 0) {
                particles.splice(p, 1);
            }
        }

        for (var t = floatingTexts.length - 1; t >= 0; t--) {
            var ft = floatingTexts[t];
            ft.y -= 1.2;
            ft.alpha -= 0.02;
            if (ft.alpha <= 0) {
                floatingTexts.splice(t, 1);
            }
        }

        updateHUD();
    }

    // ------------------------------------------------------------
    // 8. DETECCIÓN DE COLISIONES
    // ------------------------------------------------------------
    function checkCollisionWithCarlos(obs) {
        // Caja de colisión de Carlos según estado
        var cx, cy, cw, ch;

        if (carlos.isSliding) {
            // Barrida: Carlos está extendido y muy bajo
            cx = carlos.x + 10;
            cy = GROUND_Y - 58;
            cw = carlos.w + 40;
            ch = 54;
        } else if (carlos.isJumping) {
            // Salto: elevado en el aire
            cx = carlos.x + 20;
            cy = carlos.y + 15;
            cw = carlos.w - 35;
            ch = carlos.h - 35;
        } else {
            // Corriendo de pie
            cx = carlos.x + 20;
            cy = carlos.y + 10;
            cw = carlos.w - 40;
            ch = carlos.h - 15;
        }

        // Caja de colisión del obstáculo (con 15% de margen interno justo)
        var marginX = obs.w * 0.12;
        var marginY = obs.h * 0.12;
        var ox = obs.x + marginX;
        var oy = obs.y + marginY;
        var ow = obs.w - (marginX * 2);
        var oh = obs.h - (marginY * 2);

        // Reglas de juego específicas del usuario:
        // 1. Obstáculos terrestres: si Carlos está saltando lo suficientemente alto, NO hay colisión
        if (obs.type === 'ground' && carlos.isJumping && (carlos.y + carlos.h - 15) < (obs.y + 10)) {
            return false;
        }

        // 2. Obstáculos aéreos: si Carlos se barre, pasa por debajo y NO hay colisión
        if (obs.type === 'air' && carlos.isSliding) {
            return false;
        }

        // Intersección estándar AABB
        return (
            cx < ox + ow &&
            cx + cw > ox &&
            cy < oy + oh &&
            cy + ch > oy
        );
    }

    // ------------------------------------------------------------
    // 9. RENDERIZADO EN CANVAS
    // ------------------------------------------------------------
    function render() {
        if (!ctx) return;

        // Limpiar canvas
        ctx.save();

        // Aplicar temblor de pantalla por rugido
        if (screenShake > 0) {
            var shakeX = (Math.random() - 0.5) * screenShake;
            var shakeY = (Math.random() - 0.5) * screenShake;
            ctx.translate(shakeX, shakeY);
        }

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // 1. Fondo Parallax
        drawBackground();

        // 2. Búnker perimetral si está en escena
        if (bunkerDoor.active) {
            drawBunkerDoor();
        }

        // 3. Obstáculos y Huevos
        drawObstacles();

        // 4. Carlos
        drawCarlos();

        // 5. Cryolophosaurus (Perseguidor)
        drawCryolophosaurus();

        // 6. Partículas y Textos
        drawParticlesAndTexts();

        ctx.restore();
    }

    function drawBackground() {
        var bg = images.bg;
        if (!bg) {
            // Fondo plano de reserva
            ctx.fillStyle = '#10281c';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            ctx.fillStyle = '#1d3f2d';
            ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
            return;
        }

        // Dibujar franjas continuas de Fondo Largo
        var bgRenderW = CANVAS_W * 2.5;
        var offset = bgX % bgRenderW;

        ctx.drawImage(bg, offset, 0, bgRenderW, CANVAS_H);
        ctx.drawImage(bg, offset + bgRenderW, 0, bgRenderW, CANVAS_H);
        if (offset + bgRenderW < CANVAS_W) {
            ctx.drawImage(bg, offset + (bgRenderW * 2), 0, bgRenderW, CANVAS_H);
        }

        // Suelo estilizado perimetral
        var groundGrad = ctx.createLinearGradient(0, GROUND_Y - 4, 0, CANVAS_H);
        groundGrad.addColorStop(0, 'rgba(15, 30, 20, 0.4)');
        groundGrad.addColorStop(0.15, 'rgba(8, 20, 12, 0.7)');
        groundGrad.addColorStop(1, 'rgba(3, 10, 6, 0.95)');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

        // Línea sutil de delimitación del sendero
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_W, GROUND_Y);
        ctx.stroke();
    }

    function drawCarlos() {
        var img = null;
        var dw = carlos.w;
        var dh = carlos.h;
        var dx = carlos.x;
        var dy = carlos.y;

        if (carlos.isSliding) {
            img = images.carlosSlide;
            dw = 145;
            dh = 76;
            dy = GROUND_Y - dh;
        } else if (carlos.isJumping) {
            img = images.carlosJump;
            dw = 115;
            dh = 125;
        } else {
            img = carlos.runFrame === 0 ? images.carlosRun1 : images.carlosRun2;
            dw = 110;
            dh = 152;
        }

        // Efecto de parpadeo por invulnerabilidad
        if (carlos.invulnerableTimer > 0 && Math.floor(carlos.invulnerableTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.35;
        }

        if (img) {
            ctx.drawImage(img, dx, dy, dw, dh);
        } else {
            // Cuadro provisional
            ctx.fillStyle = '#3498db';
            ctx.fillRect(dx, dy, dw, dh);
        }

        ctx.globalAlpha = 1.0;
    }

    function drawCryolophosaurus() {
        var img = null;
        if (cryo.isScreaming) {
            img = images.cryoScream;
        } else {
            img = cryo.runFrame === 0 ? images.cryoRun1 : images.cryoRun2;
        }

        var dw = cryo.w;
        var dh = cryo.h;
        var dx = cryo.x;
        var dy = cryo.y;

        // Si ruge, añadir aura amenazante
        if (cryo.isScreaming) {
            ctx.save();
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 25;
            if (img) ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
        } else if (img) {
            ctx.drawImage(img, dx, dy, dw, dh);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(dx, dy, dw, dh);
        }
    }

    function drawObstacles() {
        obstacles.forEach(function (obs) {
            var img = images[obs.sprite];

            if (obs.type === 'collectible') {
                // Huevo con resplandor dorado
                ctx.save();
                ctx.shadowColor = '#00f5ff';
                ctx.shadowBlur = 18;
                if (img) {
                    ctx.drawImage(img, obs.x, obs.y, obs.w, obs.h);
                } else {
                    ctx.fillStyle = '#f1c40f';
                    ctx.beginPath();
                    ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else {
                if (img) {
                    ctx.drawImage(img, obs.x, obs.y, obs.w, obs.h);
                } else {
                    ctx.fillStyle = obs.type === 'ground' ? '#7f8c8d' : '#9b59b6';
                    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                }
            }
        });
    }

    function drawBunkerDoor() {
        var bx = bunkerDoor.x;
        var bw = bunkerDoor.w;
        var bh = bunkerDoor.h;
        var by = GROUND_Y - bh + 10;

        // Renderizar el modelo oficial del Búnker
        if (images.bunker) {
            ctx.drawImage(images.bunker, bx, by, bw, bh);
        } else {
            // Estructura de reserva en caso de carga pendiente
            ctx.fillStyle = '#1c2833';
            ctx.fillRect(bx, by, bw, bh);
        }

        // Luz de baliza de seguridad perimetral sobre el búnker
        ctx.save();
        var beaconX = bx + bw * 0.48;
        var beaconY = by + 28;
        ctx.fillStyle = bunkerDoor.closed ? '#2ecc71' : '#f1c40f';
        ctx.shadowColor = bunkerDoor.closed ? '#2ecc71' : '#f1c40f';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 15px "Orbitron", sans-serif';
        ctx.fillStyle = bunkerDoor.closed ? '#2ecc71' : '#00f5ff';
        ctx.textAlign = 'center';
        ctx.fillText(bunkerDoor.closed ? '¡COMPUERTA CERRADA - A SALVO!' : 'BÚNKER DE CONTENCIÓN', bx + bw / 2, by - 12);
        ctx.restore();
    }

    function drawParticlesAndTexts() {
        // Partículas
        particles.forEach(function (pt) {
            ctx.fillStyle = pt.color + pt.alpha + ')';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Textos flotantes
        floatingTexts.forEach(function (ft) {
            ctx.save();
            ctx.font = 'bold 20px "Orbitron", sans-serif';
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });
    }

    function gameLoop() {
        if (gameState === 'playing') {
            update();
            render();
            animFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // ------------------------------------------------------------
    // 10. VICTORIA Y DERROTA
    // ------------------------------------------------------------
    function triggerGameOver() {
        gameState = 'gameover';
        stopAllAudios();
        playSoundSafe(sndCryo);

        setTimeout(function () {
            showGameOverModal();
        }, 600);
    }

    function triggerVictory() {
        gameState = 'victory';
        stopAllAudios();
        sfxVictory();

        setTimeout(function () {
            showVictoryModal();
        }, 700);
    }

    // ------------------------------------------------------------
    // 11. GESTIÓN DEL DOM Y MODALES
    // ------------------------------------------------------------
    var overlayEl = null;

    function buildUI() {
        if (document.getElementById('cryo-escape-overlay')) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'cryo-escape-overlay';
        overlayEl.className = 'cryo-overlay hidden';

        overlayEl.innerHTML = [
            '<!-- HEADER HUD -->',
            '<div class="cryo-header">',
            '  <div class="cryo-title-wrap">',
            '    <div class="cryo-badge-alert" id="hud-cryo-alert">🚨 FASE 1: HUIDA INICIAL</div>',
            '    <div class="cryo-title">¡ESCAPA DEL CRYOLOPHOSAURUS!</div>',
            '    <div class="cryo-sub">RECINTO NORTE &mdash; ISLA MATANCEROS</div>',
            '  </div>',
            '  <div class="cryo-hud-stats">',
            '    <div class="cryo-stat-pill" title="Vidas restantes">',
            '      <span class="pill-icon">❤️</span>',
            '      <span id="hud-cryo-lives">❤️❤️❤️</span>',
            '    </div>',
            '    <div class="cryo-stat-pill" title="Distancia recorrida">',
            '      <span class="pill-icon">🏃</span>',
            '      <span id="hud-cryo-dist">0 m</span> / 1,500 m',
            '    </div>',
            '    <div class="cryo-progress-bar-wrap" title="Progreso hacia el Búnker">',
            '      <div class="cryo-progress-fill" id="hud-cryo-progress"></div>',
            '    </div>',
            '  </div>',
            '  <div class="cryo-actions">',
            '    <button class="cryo-btn-icon" id="btn-cryo-mute" title="Silenciar / Activar sonido">🔊</button>',
            '    <button class="cryo-btn-icon" id="btn-cryo-pause" title="Pausar juego">⏸️</button>',
            '    <button class="cryo-btn-icon btn-close" id="btn-cryo-close" title="Cerrar juego">✕</button>',
            '  </div>',
            '</div>',

            '<!-- ÁREA DE JUEGO / CANVAS -->',
            '<div class="cryo-viewport">',
            '  <canvas id="cryo-canvas" width="1280" height="720"></canvas>',
            '',
            '  <!-- CONTROLES TÁCTILES MÓVILES -->',
            '  <div class="cryo-mobile-controls">',
            '    <button class="cryo-touch-btn btn-jump" id="touch-btn-jump">',
            '      <span class="t-icon">⬆️</span>',
            '      <span class="t-txt">SALTAR</span>',
            '    </button>',
            '    <button class="cryo-touch-btn btn-slide" id="touch-btn-slide">',
            '      <span class="t-icon">⬇️</span>',
            '      <span class="t-txt">BARRIDA</span>',
            '    </button>',
            '  </div>',
            '</div>',

            '<!-- MODAL: BRIEFING / INSTRUCCIONES -->',
            '<div class="cryo-modal" id="cryo-modal-briefing">',
            '  <div class="cryo-modal-card">',
            '    <div class="cryo-card-badge">INFORME DE MISIÓN</div>',
            '    <h2 class="cryo-card-title">🚨 ¡ALERTA EN ISLA MATANCEROS!</h2>',
            '    <p class="cryo-card-desc">',
            '      Carlos ha quedado atrapado dentro del recinto del <strong>Cryolophosaurus</strong>. El colosal depredador ha roto la contención y te pisa los talones. Tu objetivo es correr <strong>1,500 metros</strong> hasta el búnker de seguridad perimetral.',
            '    </p>',
            '    <div class="cryo-rules-box">',
            '      <div class="rule-row">',
            '        <span class="r-badge key-up">⬆️ ARRIBA / ESPACIO</span>',
            '        <span class="r-desc"><strong>SALTAR:</strong> Esquiva rocas, arbustos, Microraptors y Coelurosauravus en el suelo.</span>',
            '      </div>',
            '      <div class="rule-row">',
            '        <span class="r-badge key-down">⬇️ ABAJO</span>',
            '        <span class="r-desc"><strong>BARRIDA:</strong> Agáchate a toda velocidad para esquivar Pteranodons y reptiles alados en picada.</span>',
            '      </div>',
            '      <div class="rule-row">',
            '        <span class="r-badge key-egg">🥚 HUEVOS INGEN</span>',
            '        <span class="r-desc">¡Tócalos para <strong>regenerar 1 vida perdida</strong> (máximo 3 vidas)!</span>',
            '      </div>',
            '      <div class="rule-row">',
            '        <span class="r-badge key-cryo">🦖 CRYOLOPHOSAURUS</span>',
            '        <span class="r-desc">¡Ruge cada 6 segundos y se abalanza con furia si cometes errores!</span>',
            '      </div>',
            '    </div>',
            '    <button class="cryo-primary-btn" id="btn-start-game">▶ INICIAR ESCAPE</button>',
            '  </div>',
            '</div>',

            '<!-- MODAL: GAMEOVER -->',
            '<div class="cryo-modal hidden" id="cryo-modal-gameover">',
            '  <div class="cryo-modal-card danger">',
            '    <div class="cryo-card-badge danger">SEÑAL BIOMÉTRICA PERDIDA</div>',
            '    <h2 class="cryo-card-title danger">💀 ¡EL CRYOLOPHOSAURUS TE HA ATRAPADO!</h2>',
            '    <p class="cryo-card-desc">El depredador logró acortar la distancia en el recinto perimetral.</p>',
            '    <div class="cryo-stats-grid">',
            '      <div class="stat-box"><span class="s-label">Distancia:</span><strong class="s-val" id="go-dist">0 m</strong></div>',
            '      <div class="stat-box"><span class="s-label">Obstáculos:</span><strong class="s-val" id="go-dodged">0</strong></div>',
            '      <div class="stat-box"><span class="s-label">Huevos:</span><strong class="s-val" id="go-eggs">0</strong></div>',
            '    </div>',
            '    <div class="cryo-modal-actions">',
            '      <button class="cryo-primary-btn danger" id="btn-restart-game">🔄 REINTENTAR ESCAPE</button>',
            '      <button class="cryo-secondary-btn" id="btn-exit-game">✕ SALIR</button>',
            '    </div>',
            '  </div>',
            '</div>',

            '<!-- MODAL: VICTORIA -->',
            '<div class="cryo-modal hidden" id="cryo-modal-victory">',
            '  <div class="cryo-modal-card success">',
            '    <div class="cryo-card-badge success">BÚNKER SELLADO CON ÉXITO</div>',
            '    <h2 class="cryo-card-title success">🏆 ¡ESCAPE EXITOSO DE MATANCEROS!</h2>',
            '    <p class="cryo-card-desc">',
            '      ¡Carlos logró cruzar las compuertas blindadas del búnker 04! Las pesadas esclusas de acero se cerraron justo a tiempo, bloqueando al Cryolophosaurus.',
            '    </p>',
            '    <div class="cryo-stats-grid">',
            '      <div class="stat-box"><span class="s-label">Distancia:</span><strong class="s-val">1,500 m</strong></div>',
            '      <div class="stat-box"><span class="s-label">Vidas Restantes:</span><strong class="s-val" id="vic-lives">❤️❤️❤️</strong></div>',
            '      <div class="stat-box"><span class="s-label">Esquivados:</span><strong class="s-val" id="vic-dodged">0</strong></div>',
            '      <div class="stat-box"><span class="s-label">Huevos:</span><strong class="s-val" id="vic-eggs">0</strong></div>',
            '    </div>',
            '    <div class="cryo-modal-actions">',
            '      <button class="cryo-primary-btn success" id="btn-play-again">🎮 JUGAR DE NUEVO</button>',
            '      <button class="cryo-secondary-btn" id="btn-exit-victory">✕ SALIR AL CATÁLOGO</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(overlayEl);

        canvas = document.getElementById('cryo-canvas');
        if (canvas) {
            ctx = canvas.getContext('2d');
        }

        bindUIEvents();
    }

    function updateHUD() {
        var alertEl = document.getElementById('hud-cryo-alert');
        if (alertEl) {
            if (currentPhase === 3) {
                alertEl.textContent = '🔥 FASE 3: PELIGRO CRÍTICO (1000m+)';
                alertEl.style.color = '#ff4757';
            } else if (currentPhase === 2) {
                alertEl.textContent = '⚠️ FASE 2: ALERTA ELEVADA (500m+)';
                alertEl.style.color = '#f1c40f';
            } else {
                alertEl.textContent = '🚨 FASE 1: HUIDA INICIAL (0-500m)';
                alertEl.style.color = '#2ecc71';
            }
        }

        var livesEl = document.getElementById('hud-cryo-lives');
        if (livesEl) {
            var heartStr = '';
            for (var i = 0; i < maxLives; i++) {
                heartStr += (i < lives) ? '❤️' : '🖤';
            }
            livesEl.textContent = heartStr;
        }

        var distEl = document.getElementById('hud-cryo-dist');
        if (distEl) {
            distEl.textContent = Math.floor(Math.min(TARGET_DISTANCE, distance)) + ' m';
        }

        var progEl = document.getElementById('hud-cryo-progress');
        if (progEl) {
            var pct = Math.min(100, (distance / TARGET_DISTANCE) * 100);
            progEl.style.width = pct + '%';
        }
    }

    function hideAllModals() {
        var mBriefing = document.getElementById('cryo-modal-briefing');
        var mGameOver = document.getElementById('cryo-modal-gameover');
        var mVictory = document.getElementById('cryo-modal-victory');
        if (mBriefing) mBriefing.classList.add('hidden');
        if (mGameOver) mGameOver.classList.add('hidden');
        if (mVictory) mVictory.classList.add('hidden');
    }

    function showGameOverModal() {
        var mGameOver = document.getElementById('cryo-modal-gameover');
        if (mGameOver) {
            document.getElementById('go-dist').textContent = Math.floor(distance) + ' m';
            document.getElementById('go-dodged').textContent = obstaclesDodged;
            document.getElementById('go-eggs').textContent = eggsCollected;
            mGameOver.classList.remove('hidden');
        }
    }

    function showVictoryModal() {
        var mVictory = document.getElementById('cryo-modal-victory');
        if (mVictory) {
            var heartStr = '';
            for (var i = 0; i < maxLives; i++) {
                heartStr += (i < lives) ? '❤️' : '🖤';
            }
            document.getElementById('vic-lives').textContent = heartStr;
            document.getElementById('vic-dodged').textContent = obstaclesDodged;
            document.getElementById('vic-eggs').textContent = eggsCollected;
            mVictory.classList.remove('hidden');
        }
    }

    // ------------------------------------------------------------
    // 12. EVENTOS DE TECLADO Y TOUCH
    // ------------------------------------------------------------
    function bindUIEvents() {
        // Teclas
        window.addEventListener('keydown', function (e) {
            if (gameState !== 'playing') return;

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
                e.preventDefault();
                doJump();
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                doSlide();
            }
        });

        // Botones de inicio / reinicio
        var btnStart = document.getElementById('btn-start-game');
        if (btnStart) btnStart.addEventListener('click', startGame);

        var btnRestart = document.getElementById('btn-restart-game');
        if (btnRestart) btnRestart.addEventListener('click', startGame);

        var btnPlayAgain = document.getElementById('btn-play-again');
        if (btnPlayAgain) btnPlayAgain.addEventListener('click', startGame);

        // Botones de salida
        var btnClose = document.getElementById('btn-cryo-close');
        if (btnClose) btnClose.addEventListener('click', closeGame);

        var btnExit = document.getElementById('btn-exit-game');
        if (btnExit) btnExit.addEventListener('click', closeGame);

        var btnExitVic = document.getElementById('btn-exit-victory');
        if (btnExitVic) btnExitVic.addEventListener('click', closeGame);

        // Mute
        var btnMute = document.getElementById('btn-cryo-mute');
        if (btnMute) {
            btnMute.addEventListener('click', function () {
                isMuted = !isMuted;
                btnMute.textContent = isMuted ? '🔇' : '🔊';
                if (isMuted) {
                    if (sndMusic) sndMusic.pause();
                } else if (gameState === 'playing' && sndMusic) {
                    sndMusic.play().catch(function () {});
                }
            });
        }

        // Pausa
        var btnPause = document.getElementById('btn-cryo-pause');
        if (btnPause) {
            btnPause.addEventListener('click', function () {
                if (gameState === 'playing') {
                    gameState = 'paused';
                    btnPause.textContent = '▶';
                    if (sndMusic) sndMusic.pause();
                } else if (gameState === 'paused') {
                    gameState = 'playing';
                    btnPause.textContent = '⏸️';
                    if (sndMusic && !isMuted) sndMusic.play().catch(function () {});
                    animFrameId = requestAnimationFrame(gameLoop);
                }
            });
        }

        // Controles Táctiles Móviles
        var btnTouchJump = document.getElementById('touch-btn-jump');
        if (btnTouchJump) {
            btnTouchJump.addEventListener('touchstart', function (e) {
                e.preventDefault();
                doJump();
            }, { passive: false });
            btnTouchJump.addEventListener('click', doJump);
        }

        var btnTouchSlide = document.getElementById('touch-btn-slide');
        if (btnTouchSlide) {
            btnTouchSlide.addEventListener('touchstart', function (e) {
                e.preventDefault();
                doSlide();
            }, { passive: false });
            btnTouchSlide.addEventListener('click', doSlide);
        }

        // Detección de Gestos Swipe en el Canvas
        if (canvas) {
            var touchStartY = 0;
            var touchStartX = 0;

            canvas.addEventListener('touchstart', function (e) {
                if (e.touches.length > 0) {
                    touchStartY = e.touches[0].clientY;
                    touchStartX = e.touches[0].clientX;
                }
            }, { passive: true });

            canvas.addEventListener('touchend', function (e) {
                if (e.changedTouches.length > 0) {
                    var diffY = e.changedTouches[0].clientY - touchStartY;
                    var diffX = e.changedTouches[0].clientX - touchStartX;

                    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 30) {
                        if (diffY < 0) {
                            // Swipe arriba -> SALTAR
                            doJump();
                        } else {
                            // Swipe abajo -> BARRIDA
                            doSlide();
                        }
                    }
                }
            }, { passive: true });
        }
    }

    // ------------------------------------------------------------
    // 13. ABRIR Y CERRAR EL JUEGO (GLOBAL API)
    // ------------------------------------------------------------
    function openGame() {
        buildUI();
        preloadImages(function () {
            // Imágenes cargadas
        });

        if (overlayEl) {
            overlayEl.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        // Pausar música de fondo global del sitio si existe
        if (window.interruptBgMusic) {
            window.interruptBgMusic();
        }

        gameState = 'briefing';
        hideAllModals();
        var mBriefing = document.getElementById('cryo-modal-briefing');
        if (mBriefing) mBriefing.classList.remove('hidden');

        // Renderizar un frame de fondo inicial
        render();
    }

    function closeGame() {
        gameState = 'briefing';
        stopAllAudios();

        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        if (overlayEl) {
            overlayEl.classList.add('hidden');
            document.body.style.overflow = '';
        }

        // Restaurar música global del sitio si existe
        if (window.releaseBgMusic) {
            window.releaseBgMusic();
        }
    }

    window.openEscapaCryolo = openGame;
    window.closeEscapaCryolo = closeGame;

    // Precarga automática inmediata en segundo plano
    if (typeof window !== 'undefined') {
        preloadImages();
    }

    // Inicializar estilos CSS inyectados para el minijuego
    injectStyles();

    function injectStyles() {
        if (document.getElementById('ej-cryo-styles')) return;

        var css = [
            '/* ============================================================ */',
            '/* ESTILOS: ¡ESCAPA DEL CRYOLOPHOSAURUS!                        */',
            '/* ============================================================ */',
            '#cryo-escape-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  z-index: 100000;',
            '  background: radial-gradient(circle at center, rgba(10, 25, 18, 0.98) 0%, rgba(2, 8, 5, 0.99) 100%);',
            '  display: flex;',
            '  flex-direction: column;',
            '  font-family: "Orbitron", sans-serif;',
            '  color: #fff;',
            '  overflow: hidden;',
            '  touch-action: none;',
            '}',
            '#cryo-escape-overlay.hidden {',
            '  display: none !important;',
            '}',
            '',
            '/* HEADER */',
            '.cryo-header {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 0.6rem 1.4rem;',
            '  background: rgba(3, 14, 9, 0.92);',
            '  border-bottom: 2px solid rgba(46, 204, 113, 0.4);',
            '  box-shadow: 0 4px 20px rgba(0,0,0,0.8);',
            '  flex-shrink: 0;',
            '}',
            '.cryo-title-wrap { display: flex; flex-direction: column; }',
            '.cryo-badge-alert {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.7rem;',
            '  color: #e74c3c;',
            '  letter-spacing: 1.5px;',
            '}',
            '.cryo-title {',
            '  font-size: 1.15rem;',
            '  font-weight: 900;',
            '  color: #00f5ff;',
            '  letter-spacing: 1.5px;',
            '  text-shadow: 0 0 10px rgba(0, 245, 255, 0.6);',
            '}',
            '.cryo-sub {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.72rem;',
            '  color: #2ecc71;',
            '}',
            '',
            '/* STATS HUD */',
            '.cryo-hud-stats {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 1rem;',
            '}',
            '.cryo-stat-pill {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.4rem;',
            '  background: rgba(0, 20, 15, 0.85);',
            '  border: 1px solid rgba(46, 204, 113, 0.4);',
            '  border-radius: 20px;',
            '  padding: 0.35rem 0.8rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.82rem;',
            '}',
            '.cryo-progress-bar-wrap {',
            '  width: 160px;',
            '  height: 12px;',
            '  background: rgba(0,0,0,0.6);',
            '  border: 1px solid rgba(0, 245, 255, 0.5);',
            '  border-radius: 6px;',
            '  overflow: hidden;',
            '}',
            '.cryo-progress-fill {',
            '  width: 0%;',
            '  height: 100%;',
            '  background: linear-gradient(90deg, #2ecc71, #00f5ff);',
            '  box-shadow: 0 0 10px #00f5ff;',
            '  transition: width 0.15s ease;',
            '}',
            '',
            '/* ACCIONES DE VENTANA */',
            '.cryo-actions { display: flex; gap: 0.5rem; }',
            '.cryo-btn-icon {',
            '  background: rgba(3, 14, 9, 0.8);',
            '  border: 1px solid rgba(46, 204, 113, 0.5);',
            '  color: #fff;',
            '  border-radius: 6px;',
            '  padding: 0.4rem 0.75rem;',
            '  font-size: 1rem;',
            '  cursor: pointer;',
            '  transition: all 0.2s;',
            '}',
            '.cryo-btn-icon:hover {',
            '  background: rgba(46, 204, 113, 0.2);',
            '  border-color: #00f5ff;',
            '}',
            '.cryo-btn-icon.btn-close { border-color: #e74c3c; color: #ff7675; }',
            '.cryo-btn-icon.btn-close:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* VIEWPORT Y CANVAS */',
            '.cryo-viewport {',
            '  flex: 1;',
            '  position: relative;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  background: #020805;',
            '  overflow: hidden;',
            '}',
            '#cryo-canvas {',
            '  width: 100%;',
            '  height: 100%;',
            '  max-width: 100vw;',
            '  max-height: calc(100vh - 70px);',
            '  object-fit: contain;',
            '  display: block;',
            '}',
            '',
            '/* CONTROLES TÁCTILES MÓVILES */',
            '.cryo-mobile-controls {',
            '  position: absolute;',
            '  bottom: 1.2rem;',
            '  left: 1.5rem;',
            '  right: 1.5rem;',
            '  display: flex;',
            '  justify-content: space-between;',
            '  pointer-events: none;',
            '  z-index: 50;',
            '}',
            '.cryo-touch-btn {',
            '  pointer-events: auto;',
            '  width: 95px;',
            '  height: 95px;',
            '  border-radius: 50%;',
            '  display: flex;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  justify-content: center;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-weight: 900;',
            '  font-size: 0.72rem;',
            '  border: 2.5px solid #2ecc71;',
            '  box-shadow: 0 4px 25px rgba(0,0,0,0.8), 0 0 15px rgba(46, 204, 113, 0.4);',
            '  touch-action: manipulation;',
            '  user-select: none;',
            '  transition: transform 0.1s, box-shadow 0.1s;',
            '}',
            '.cryo-touch-btn.btn-jump {',
            '  background: linear-gradient(135deg, rgba(46, 204, 113, 0.85), rgba(39, 174, 96, 0.9));',
            '  color: #031409;',
            '}',
            '.cryo-touch-btn.btn-slide {',
            '  background: linear-gradient(135deg, rgba(0, 245, 255, 0.85), rgba(0, 180, 216, 0.9));',
            '  color: #001a24;',
            '  border-color: #00f5ff;',
            '  box-shadow: 0 4px 25px rgba(0,0,0,0.8), 0 0 15px rgba(0, 245, 255, 0.4);',
            '}',
            '.cryo-touch-btn:active {',
            '  transform: scale(0.92);',
            '}',
            '.cryo-touch-btn .t-icon { font-size: 1.6rem; line-height: 1; }',
            '.cryo-touch-btn .t-txt { margin-top: 0.2rem; letter-spacing: 1px; }',
            '',
            '/* MODALES FLOTANTES (BRIEFING, GAMEOVER, VICTORIA) */',
            '.cryo-modal {',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(2, 10, 6, 0.88);',
            '  backdrop-filter: blur(8px);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 1.2rem;',
            '  z-index: 100;',
            '  opacity: 1;',
            '  transition: opacity 0.3s ease;',
            '}',
            '.cryo-modal.hidden {',
            '  display: none !important;',
            '}',
            '.cryo-modal-card {',
            '  background: linear-gradient(145deg, rgba(8, 28, 18, 0.95), rgba(3, 15, 9, 0.98));',
            '  border: 1.5px solid rgba(46, 204, 113, 0.5);',
            '  border-radius: 12px;',
            '  padding: 2rem;',
            '  max-width: 580px;',
            '  width: 100%;',
            '  box-shadow: 0 0 40px rgba(46, 204, 113, 0.3), 0 20px 50px rgba(0,0,0,0.9);',
            '  text-align: center;',
            '}',
            '.cryo-modal-card.danger {',
            '  border-color: #e74c3c;',
            '  box-shadow: 0 0 40px rgba(231, 76, 60, 0.4), 0 20px 50px rgba(0,0,0,0.9);',
            '}',
            '.cryo-modal-card.success {',
            '  border-color: #00f5ff;',
            '  box-shadow: 0 0 40px rgba(0, 245, 255, 0.4), 0 20px 50px rgba(0,0,0,0.9);',
            '}',
            '.cryo-card-badge {',
            '  display: inline-block;',
            '  background: rgba(46, 204, 113, 0.15);',
            '  color: #2ecc71;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.74rem;',
            '  padding: 0.25rem 0.8rem;',
            '  border-radius: 4px;',
            '  letter-spacing: 1.5px;',
            '  margin-bottom: 0.7rem;',
            '}',
            '.cryo-card-badge.danger { background: rgba(231, 76, 60, 0.2); color: #ff7675; }',
            '.cryo-card-badge.success { background: rgba(0, 245, 255, 0.2); color: #00f5ff; }',
            '.cryo-card-title {',
            '  font-size: 1.4rem;',
            '  font-weight: 900;',
            '  color: #fff;',
            '  margin-bottom: 0.6rem;',
            '  letter-spacing: 1.5px;',
            '}',
            '.cryo-card-title.danger { color: #ff6b6b; text-shadow: 0 0 15px rgba(231, 76, 60, 0.6); }',
            '.cryo-card-title.success { color: #00f5ff; text-shadow: 0 0 15px rgba(0, 245, 255, 0.6); }',
            '.cryo-card-desc {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.85rem;',
            '  color: #b0c8bb;',
            '  line-height: 1.5;',
            '  margin-bottom: 1.2rem;',
            '}',
            '.cryo-rules-box {',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 0.65rem;',
            '  background: rgba(0, 20, 12, 0.65);',
            '  border: 1px solid rgba(46, 204, 113, 0.3);',
            '  border-radius: 8px;',
            '  padding: 1rem;',
            '  margin-bottom: 1.5rem;',
            '  text-align: left;',
            '}',
            '.rule-row {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.75rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.8rem;',
            '  color: #d1eae0;',
            '}',
            '.r-badge {',
            '  padding: 0.25rem 0.6rem;',
            '  border-radius: 4px;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  font-weight: 700;',
            '  white-space: nowrap;',
            '}',
            '.r-badge.key-up { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71; }',
            '.r-badge.key-down { background: rgba(0, 245, 255, 0.2); color: #00f5ff; border: 1px solid #00f5ff; }',
            '.r-badge.key-egg { background: rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid #f1c40f; }',
            '.r-badge.key-cryo { background: rgba(231, 76, 60, 0.2); color: #ff7675; border: 1px solid #ff7675; }',
            '.cryo-stats-grid {',
            '  display: grid;',
            '  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));',
            '  gap: 0.8rem;',
            '  margin-bottom: 1.4rem;',
            '}',
            '.stat-box {',
            '  background: rgba(0, 20, 15, 0.8);',
            '  border: 1px solid rgba(46, 204, 113, 0.35);',
            '  border-radius: 6px;',
            '  padding: 0.7rem 0.5rem;',
            '}',
            '.stat-box .s-label {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.72rem;',
            '  color: #8fa89b;',
            '  display: block;',
            '}',
            '.stat-box .s-val {',
            '  font-size: 1.15rem;',
            '  font-weight: 900;',
            '  color: #00f5ff;',
            '  margin-top: 0.2rem;',
            '  display: block;',
            '}',
            '.cryo-primary-btn {',
            '  background: linear-gradient(135deg, #2ecc71, #27ae60);',
            '  color: #031409;',
            '  border: none;',
            '  border-radius: 6px;',
            '  padding: 0.85rem 1.8rem;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.92rem;',
            '  font-weight: 900;',
            '  letter-spacing: 1.5px;',
            '  cursor: pointer;',
            '  box-shadow: 0 4px 20px rgba(46, 204, 113, 0.5);',
            '  transition: all 0.2s;',
            '}',
            '.cryo-primary-btn:hover {',
            '  background: linear-gradient(135deg, #00f5ff, #00b4d8);',
            '  transform: translateY(-2px);',
            '  box-shadow: 0 6px 25px rgba(0, 245, 255, 0.6);',
            '}',
            '.cryo-primary-btn.danger {',
            '  background: linear-gradient(135deg, #e74c3c, #c0392b);',
            '  color: #fff;',
            '  box-shadow: 0 4px 20px rgba(231, 76, 60, 0.5);',
            '}',
            '.cryo-primary-btn.success {',
            '  background: linear-gradient(135deg, #00f5ff, #00b4d8);',
            '  color: #001a24;',
            '  box-shadow: 0 4px 20px rgba(0, 245, 255, 0.5);',
            '}',
            '.cryo-secondary-btn {',
            '  background: rgba(255, 255, 255, 0.08);',
            '  border: 1px solid rgba(255, 255, 255, 0.3);',
            '  color: #fff;',
            '  border-radius: 6px;',
            '  padding: 0.85rem 1.4rem;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.85rem;',
            '  cursor: pointer;',
            '  transition: all 0.2s;',
            '}',
            '.cryo-secondary-btn:hover { background: rgba(255, 255, 255, 0.18); }',
            '.cryo-modal-actions {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 0.9rem;',
            '  flex-wrap: wrap;',
            '}',
            '',
            '/* RESPONSIVE CELULARES */',
            '@media (max-width: 768px) {',
            '  .cryo-header { padding: 0.4rem 0.8rem; }',
            '  .cryo-title { font-size: 0.95rem; }',
            '  .cryo-badge-alert, .cryo-sub { font-size: 0.65rem; }',
            '  .cryo-stat-pill { padding: 0.25rem 0.55rem; font-size: 0.72rem; }',
            '  .cryo-progress-bar-wrap { width: 90px; height: 10px; }',
            '  .cryo-modal-card { padding: 1.3rem 1rem; }',
            '  .cryo-card-title { font-size: 1.15rem; }',
            '  .cryo-touch-btn { width: 80px; height: 80px; font-size: 0.65rem; }',
            '  .cryo-touch-btn .t-icon { font-size: 1.3rem; }',
            '}'
        ].join('\n');

        var styleEl = document.createElement('style');
        styleEl.id = 'ej-cryo-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

})();
