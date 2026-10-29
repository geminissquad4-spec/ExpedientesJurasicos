/**
 * ====================================================================
 *  EXPEDIENTES JURÁSICOS - CAOS EN LA ISLA
 *  MINIJUEGO 12: AHUYENTANDO A LOS ORNITHOCHEIRUS
 * ====================================================================
 *  Misión: Salvar a 4 aldeanos indefensos de un enjambre de feroces
 *  Ornithocheirus disparándoles con tu mira táctica.
 *  - Aldeanos con proporciones exactas y naturales (sin compresión).
 *  - Enjambre creciente: se van sumando más Ornithocheirus (hasta 6) conforme
 *    aumentan los impactos, volviendo la misión rápida y desafiante.
 *  - Picadas simultáneas y veloces en fases avanzadas.
 *  - Solo se les puede disparar cuando estén EN PICADA.
 *  - Audio de advertencia: 'Ornithocheirus Attack.mp4'.
 *  - Meta: Conectar 15 disparos certeros para ahuyentar a toda la bandada.
 *  - Derrota: Si los 4 aldeanos son capturados.
 *  - Música de fondo: 'Salvation.mp4'.
 * ====================================================================
 */

(function () {
    'use strict';

    // ============================================================
    //  VARIABLES DE ESTADO DEL JUEGO
    // ============================================================
    var state = 'idle'; // 'idle' | 'briefing' | 'playing' | 'won' | 'lost'
    var hits = 0;
    var targetHits = 15;
    var isMuted = false;
    var aniFrame = null;
    var lastTime = 0;
    var shakeDuration = 0;
    var shakeMagnitude = 0;

    // Canvas y contexto
    var canvas = null;
    var ctx = null;
    var canvasW = 1280;
    var canvasH = 720;
    var scale = 1;
    var offsetX = 0;
    var offsetY = 0;

    // Cursor / Mira
    var mousePos = { x: 640, y: 360 };
    var isMouseInside = false;

    // Partículas y efectos flotantes
    var particles = [];
    var floatingTexts = [];
    var muzzleFlashes = [];

    // ============================================================
    //  ALDEANOS (4 objetivos en el suelo con bboxes exactas)
    // ============================================================
    // Cada aldeano tiene su rectángulo fuente sx, sy, sw, sh exacto
    // para evitar cualquier deformación o compresión de aspecto.
    var villagers = [
        {
            id: 1,
            name: 'Aldeano 1 (Hombre)',
            file: 'Aldeano 1.png',
            sx: 915, sy: 54, sw: 615, sh: 1233,
            x: 200,
            y: 515,
            vh: 165,
            alive: true,
            alertTimer: 0,
            fadeAlpha: 1.0
        },
        {
            id: 2,
            name: 'Aldeano 2 (Anciano)',
            file: 'Aldeano 2.png',
            sx: 898, sy: 89, sw: 576, sh: 1166,
            x: 425,
            y: 525,
            vh: 160,
            alive: true,
            alertTimer: 0,
            fadeAlpha: 1.0
        },
        {
            id: 3,
            name: 'Aldeano 3 (Campesino)',
            file: 'Aldeano 3.png',
            sx: 798, sy: 70, sw: 753, sh: 1226,
            x: 645,
            y: 520,
            vh: 165,
            alive: true,
            alertTimer: 0,
            fadeAlpha: 1.0
        },
        {
            id: 4,
            name: 'Aldeano 4 (Madre y bebé)',
            file: 'Aldeano 4.png',
            sx: 982, sy: 68, sw: 510, sh: 1210,
            x: 870,
            y: 515,
            vh: 165,
            alive: true,
            alertTimer: 0,
            fadeAlpha: 1.0
        }
    ];

    // ============================================================
    //  ORNITHOCHEIRUS (Bandada de hasta 6 atacantes)
    // ============================================================
    // Se activan progresivamente según los impactos para máxima dificultad:
    // P1, P2: desde el inicio (0 impactos)
    // P3: a partir de 3 impactos
    // P4: a partir de 6 impactos
    // P5: a partir de 9 impactos
    // P6: a partir de 12 impactos (¡Enjambre masivo final!)
    var ornithos = [
        {
            id: 1,
            unlockHits: 0,
            active: true,
            state: 'soaring',
            x: 220,
            y: 70,
            baseAltitude: 70,
            vx: 140,
            flapTimer: 0,
            currentFrame: 'Ornitho 1.png',
            diveTimer: 2.0,
            diveProgress: 0,
            diveDuration: 2.3,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 68
        },
        {
            id: 2,
            unlockHits: 0,
            active: true,
            state: 'soaring',
            x: 960,
            y: 110,
            baseAltitude: 110,
            vx: -150,
            flapTimer: 0.12,
            currentFrame: 'Ornitho 2.png',
            diveTimer: 4.8,
            diveProgress: 0,
            diveDuration: 2.2,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 68
        },
        {
            id: 3,
            unlockHits: 3,
            active: false,
            state: 'soaring',
            x: 150,
            y: 50,
            baseAltitude: 50,
            vx: 165,
            flapTimer: 0.06,
            currentFrame: 'Ornitho 1.png',
            diveTimer: 3.5,
            diveProgress: 0,
            diveDuration: 1.9,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 65
        },
        {
            id: 4,
            unlockHits: 6,
            active: false,
            state: 'soaring',
            x: 1050,
            y: 135,
            baseAltitude: 135,
            vx: -175,
            flapTimer: 0.18,
            currentFrame: 'Ornitho 2.png',
            diveTimer: 2.8,
            diveProgress: 0,
            diveDuration: 1.7,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 65
        },
        {
            id: 5,
            unlockHits: 9,
            active: false,
            state: 'soaring',
            x: 400,
            y: 90,
            baseAltitude: 90,
            vx: 185,
            flapTimer: 0.09,
            currentFrame: 'Ornitho 1.png',
            diveTimer: 2.2,
            diveProgress: 0,
            diveDuration: 1.5,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 65
        },
        {
            id: 6,
            unlockHits: 12,
            active: false,
            state: 'soaring',
            x: 820,
            y: 150,
            baseAltitude: 150,
            vx: -195,
            flapTimer: 0.15,
            currentFrame: 'Ornitho 2.png',
            diveTimer: 1.8,
            diveProgress: 0,
            diveDuration: 1.35,
            diveStartX: 0,
            diveStartY: 0,
            diveTargetX: 0,
            diveTargetY: 0,
            targetVillagerId: null,
            recoilTimer: 0,
            hitBoxRadius: 65
        }
    ];

    // ============================================================
    //  GESTIÓN DE ASSETS (IMÁGENES Y AUDIO CON FALLBACKS)
    // ============================================================
    var imageCache = {};
    var audioCtx = null;

    function getImage(filename) {
        if (imageCache[filename]) return imageCache[filename];
        var img = new Image();
        img.src = filename;
        img.onerror = function () {
            if (img.src.indexOf('Ahuyentando a los Ornithos/') === -1) {
                img.src = 'Ahuyentando a los Ornithos/' + filename;
            }
        };
        imageCache[filename] = img;
        return img;
    }

    // Precargar imágenes principales
    var preloadList = [
        'Fondo aldea.jpg',
        'Aldeano 1.png',
        'Aldeano 2.png',
        'Aldeano 3.png',
        'Aldeano 4.png',
        'Ornitho 1.png',
        'Ornitho 2.png',
        'En picada.png',
        'Crosshair.png'
    ];
    preloadList.forEach(getImage);

    // Sistema de Audio
    var sndMusic = null;
    var sndAttack = null;

    function initAudio() {
        if (!sndMusic) {
            sndMusic = new Audio();
            sndMusic.src = 'Salvation.mp4';
            sndMusic.loop = true;
            sndMusic.volume = 0.45;
            sndMusic.onerror = function () {
                if (sndMusic.src.indexOf('Ahuyentando a los Ornithos/') === -1) {
                    sndMusic.src = 'Ahuyentando a los Ornithos/Salvation.mp4';
                }
            };
        }

        if (!sndAttack) {
            sndAttack = new Audio();
            sndAttack.src = 'Ornithocheirus Attack.mp4';
            sndAttack.volume = 0.85;
            sndAttack.onerror = function () {
                if (sndAttack.src.indexOf('Ahuyentando a los Ornithos/') === -1) {
                    sndAttack.src = 'Ahuyentando a los Ornithos/Ornithocheirus Attack.mp4';
                }
            };
        }
    }

    function getAudioContext() {
        if (!audioCtx) {
            var AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Efecto de Disparo de Rifle potente
    function playGunshotSound() {
        if (isMuted) return;
        try {
            var actx = getAudioContext();
            if (!actx) return;
            var now = actx.currentTime;

            // 1. Ruido blanco para la deflagración
            var bufferSize = Math.floor(actx.sampleRate * 0.22);
            var buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (actx.sampleRate * 0.035));
            }
            var noise = actx.createBufferSource();
            noise.buffer = buffer;

            var filter = actx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3200, now);
            filter.frequency.exponentialRampToValueAtTime(260, now + 0.16);

            var gain = actx.createGain();
            gain.gain.setValueAtTime(0.95, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(actx.destination);
            noise.start(now);

            // 2. Golpe de percusión grave
            var osc = actx.createOscillator();
            var oscGain = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.15);
            oscGain.gain.setValueAtTime(0.85, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.connect(oscGain);
            oscGain.connect(actx.destination);
            osc.start(now);
            osc.stop(now + 0.17);
        } catch (e) {}
    }

    // Efecto de Impacto en Ornithocheirus
    function playHitSound() {
        if (isMuted) return;
        try {
            var actx = getAudioContext();
            if (!actx) return;
            var now = actx.currentTime;
            var osc = actx.createOscillator();
            var gain = actx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.26);
            gain.gain.setValueAtTime(0.55, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
        } catch (e) {}
    }

    // Efecto de advertencia cuando se dispara fuera de picada
    function playDeflectSound() {
        if (isMuted) return;
        try {
            var actx = getAudioContext();
            if (!actx) return;
            var now = actx.currentTime;
            var osc = actx.createOscillator();
            var gain = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(now);
            osc.stop(now + 0.14);
        } catch (e) {}
    }

    function playDiveAttackRoar() {
        if (isMuted) return;
        try {
            if (sndAttack) {
                // Clonar o reiniciar para permitir sonidos simultáneos en picadas múltiples
                var a = sndAttack.cloneNode();
                a.volume = 0.85;
                a.play().catch(function () {});
            }
        } catch (e) {}
    }

    function stopAllAudio() {
        if (sndMusic) {
            sndMusic.pause();
            sndMusic.currentTime = 0;
        }
        if (sndAttack) {
            sndAttack.pause();
            sndAttack.currentTime = 0;
        }
    }

    // ============================================================
    //  INYECCIÓN DEL DOM Y ESTILOS
    // ============================================================
    function injectHTMLAndStyles() {
        if (document.getElementById('ao-overlay')) return;

        var styleEl = document.createElement('style');
        styleEl.id = 'ao-styles';
        styleEl.textContent = [
            '/* ---- OVERLAY AHUYENTANDO A LOS ORNITHOCHEIRUS ---- */',
            '#ao-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  background: rgba(3, 8, 6, 0.96);',
            '  backdrop-filter: blur(8px);',
            '  z-index: 100000;',
            '  display: none;',
            '  flex-direction: column;',
            '  font-family: "Orbitron", sans-serif;',
            '  color: #fff;',
            '  overflow: hidden;',
            '  user-select: none;',
            '  -webkit-user-select: none;',
            '}',
            '#ao-overlay.open { display: flex; animation: ao-fade-in 0.25s ease-out; }',
            '@keyframes ao-fade-in { from { opacity: 0; } to { opacity: 1; } }',
            '',
            '/* Barra Superior */',
            '#ao-header {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 0.55rem 1.2rem;',
            '  background: linear-gradient(180deg, rgba(15, 30, 22, 0.98), rgba(8, 16, 12, 0.95));',
            '  border-bottom: 2px solid rgba(231, 76, 60, 0.45);',
            '  box-shadow: 0 4px 18px rgba(0,0,0,0.8);',
            '  flex-shrink: 0;',
            '  gap: 0.8rem;',
            '}',
            '#ao-title {',
            '  font-size: 0.92rem;',
            '  font-weight: 900;',
            '  letter-spacing: 2px;',
            '  color: #ff6b6b;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.6rem;',
            '}',
            '#ao-hud-center {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.8rem;',
            '  flex-wrap: wrap;',
            '}',
            '.ao-pill {',
            '  background: rgba(0, 0, 0, 0.65);',
            '  border: 1px solid rgba(231, 76, 60, 0.4);',
            '  border-radius: 4px;',
            '  padding: 0.25rem 0.75rem;',
            '  font-size: 0.76rem;',
            '  letter-spacing: 1px;',
            '  font-family: "Share Tech Mono", monospace;',
            '  color: #ffb8b8;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.4rem;',
            '}',
            '.ao-pill-flock {',
            '  border-color: rgba(243, 156, 18, 0.6);',
            '  color: #f1c40f;',
            '}',
            '.ao-pill-villager {',
            '  transition: all 0.3s ease;',
            '  font-size: 0.72rem;',
            '}',
            '.ao-pill-villager.alive {',
            '  border-color: rgba(46, 204, 113, 0.5);',
            '  color: #2ecc71;',
            '}',
            '.ao-pill-villager.lost {',
            '  border-color: rgba(231, 76, 60, 0.6);',
            '  color: #e74c3c;',
            '  text-decoration: line-through;',
            '  opacity: 0.65;',
            '}',
            '#ao-header-right {',
            '  display: flex;',
            '  gap: 0.5rem;',
            '}',
            '.ao-ctrl-btn {',
            '  background: rgba(0, 0, 0, 0.65);',
            '  border: 1px solid rgba(255, 255, 255, 0.2);',
            '  color: #ddd;',
            '  padding: 0.35rem 0.8rem;',
            '  border-radius: 4px;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  cursor: pointer;',
            '  transition: all 0.2s ease;',
            '}',
            '.ao-ctrl-btn:hover {',
            '  border-color: #ff6b6b;',
            '  color: #ff6b6b;',
            '}',
            '#ao-btn-close:hover {',
            '  background: #e74c3c;',
            '  color: #fff;',
            '  border-color: #e74c3c;',
            '}',
            '',
            '/* Contenedor del Canvas */',
            '#ao-canvas-wrap {',
            '  flex: 1;',
            '  position: relative;',
            '  overflow: hidden;',
            '  background: #000;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  cursor: none;',
            '}',
            '#ao-canvas {',
            '  display: block;',
            '}',
            '',
            '/* Pantallas Modales (Briefing, Win, Lose) */',
            '.ao-modal {',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(3, 10, 7, 0.92);',
            '  backdrop-filter: blur(10px);',
            '  display: none;',
            '  align-items: center;',
            '  justify-content: center;',
            '  flex-direction: column;',
            '  padding: 1.5rem;',
            '  z-index: 100;',
            '  text-align: center;',
            '  overflow-y: auto;',
            '  -webkit-overflow-scrolling: touch;',
            '}',
            '.ao-modal.show { display: flex; animation: ao-modal-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }',
            '@keyframes ao-modal-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
            '.ao-modal-card {',
            '  background: linear-gradient(135deg, rgba(20, 40, 30, 0.95), rgba(10, 20, 15, 0.98));',
            '  border: 2px solid rgba(231, 76, 60, 0.5);',
            '  border-radius: 8px;',
            '  padding: 2rem 2.5rem;',
            '  max-width: 650px;',
            '  width: 90%;',
            '  box-shadow: 0 0 45px rgba(231, 76, 60, 0.35);',
            '  margin: auto;',
            '  max-height: 88dvh;',
            '  overflow-y: auto;',
            '  -webkit-overflow-scrolling: touch;',
            '  box-sizing: border-box;',
            '}',
            '.ao-modal-title {',
            '  font-size: 1.45rem;',
            '  font-weight: 900;',
            '  letter-spacing: 2px;',
            '  color: #ff6b6b;',
            '  margin-bottom: 0.8rem;',
            '  text-transform: uppercase;',
            '}',
            '.ao-modal-sub {',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.88rem;',
            '  color: #bbb;',
            '  line-height: 1.6;',
            '  margin-bottom: 1.5rem;',
            '}',
            '.ao-rules-box {',
            '  background: rgba(0, 0, 0, 0.6);',
            '  border-left: 3px solid #ff6b6b;',
            '  padding: 0.8rem 1rem;',
            '  text-align: left;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.8rem;',
            '  color: #ddd;',
            '  margin-bottom: 1.5rem;',
            '  line-height: 1.5;',
            '}',
            '.ao-primary-btn {',
            '  background: linear-gradient(135deg, #e74c3c, #c0392b);',
            '  color: #fff;',
            '  border: none;',
            '  padding: 0.75rem 2.2rem;',
            '  border-radius: 4px;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.88rem;',
            '  font-weight: 900;',
            '  letter-spacing: 2px;',
            '  cursor: pointer;',
            '  box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);',
            '  transition: all 0.25s ease;',
            '}',
            '.ao-primary-btn:hover {',
            '  background: linear-gradient(135deg, #ff6b6b, #e74c3c);',
            '  box-shadow: 0 0 35px rgba(255, 107, 107, 0.8);',
            '  transform: scale(1.04);',
            '}',
            '.ao-btn-green {',
            '  background: linear-gradient(135deg, #2ecc71, #27ae60);',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);',
            '}',
            '.ao-btn-green:hover {',
            '  background: linear-gradient(135deg, #a8ff3e, #2ecc71);',
            '  box-shadow: 0 0 35px rgba(168, 255, 62, 0.8);',
            '}',
            '',
            '/* Barra Inferior */',
            '#ao-footer {',
            '  background: #040906;',
            '  padding: 0.4rem 1.2rem;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.72rem;',
            '  color: #888;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  border-top: 1px solid rgba(255, 255, 255, 0.08);',
            '  flex-shrink: 0;',
            '}',
            '',
            '/* Optimizaciones Mobile y Pantallas Táctiles */',
            '@media (max-width: 768px) {',
            '  #ao-header {',
            '    padding: 0.35rem 0.6rem;',
            '    flex-wrap: wrap;',
            '    gap: 0.35rem;',
            '    justify-content: space-between;',
            '  }',
            '  #ao-title {',
            '    font-size: 0.78rem;',
            '    letter-spacing: 1px;',
            '    gap: 0.4rem;',
            '  }',
            '  #ao-hud-center {',
            '    order: 3;',
            '    width: 100%;',
            '    justify-content: center;',
            '    gap: 0.3rem;',
            '  }',
            '  .ao-pill {',
            '    font-size: 0.68rem;',
            '    padding: 0.2rem 0.45rem;',
            '  }',
            '  #ao-header-right {',
            '    gap: 0.35rem;',
            '  }',
            '  .ao-ctrl-btn {',
            '    padding: 0.3rem 0.55rem;',
            '    font-size: 0.68rem;',
            '    min-height: 36px;',
            '  }',
            '  .ao-modal {',
            '    padding: 0.6rem;',
            '  }',
            '  .ao-modal-card {',
            '    width: 95%;',
            '    max-width: 95vw;',
            '    padding: 1.2rem 1rem;',
            '    max-height: 86dvh;',
            '  }',
            '  .ao-modal-title {',
            '    font-size: 1.15rem;',
            '    margin-bottom: 0.5rem;',
            '  }',
            '  .ao-modal-sub {',
            '    font-size: 0.82rem;',
            '    line-height: 1.45;',
            '    margin-bottom: 0.8rem;',
            '  }',
            '  .ao-rules-box {',
            '    font-size: 0.74rem;',
            '    line-height: 1.4;',
            '    padding: 0.55rem 0.75rem;',
            '    margin-bottom: 0.9rem;',
            '  }',
            '  .ao-primary-btn {',
            '    width: 100%;',
            '    min-height: 48px;',
            '    font-size: 0.95rem;',
            '    padding: 0.8rem 1.2rem;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    box-sizing: border-box;',
            '    touch-action: manipulation;',
            '  }',
            '  #ao-footer {',
            '    font-size: 0.64rem;',
            '    padding: 0.25rem 0.6rem;',
            '    flex-direction: column;',
            '    text-align: center;',
            '    gap: 0.2rem;',
            '  }',
            '}',
            '@media (max-width: 480px) {',
            '  #ao-title { font-size: 0.72rem; }',
            '  .ao-pill-villager { font-size: 0.62rem; padding: 0.15rem 0.35rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(styleEl);

        // Crear Overlay
        var ov = document.createElement('div');
        ov.id = 'ao-overlay';
        ov.innerHTML = [
            '<div id="ao-header">',
            '  <div id="ao-title"><span>🦅</span> AHUYENTANDO A LOS ORNITHOCHEIRUS</div>',
            '  <div id="ao-hud-center">',
            '    <div class="ao-pill" id="ao-hits-pill">🎯 IMPACTOS: <span id="ao-hits-txt" style="color:#ff6b6b;font-weight:900;">0 / 15</span></div>',
            '    <div class="ao-pill ao-pill-flock" id="ao-flock-pill">🦅 BANDADA: <span id="ao-flock-txt" style="font-weight:900;">2</span></div>',
            '    <div class="ao-pill ao-pill-villager alive" id="ao-v1">👤 Aldeano 1</div>',
            '    <div class="ao-pill ao-pill-villager alive" id="ao-v2">👴 Aldeano 2</div>',
            '    <div class="ao-pill ao-pill-villager alive" id="ao-v3">🧑 Aldeano 3</div>',
            '    <div class="ao-pill ao-pill-villager alive" id="ao-v4">👩 Aldeano 4</div>',
            '  </div>',
            '  <div id="ao-header-right">',
            '    <button class="ao-ctrl-btn" id="ao-btn-mute">🔊 SONIDO</button>',
            '    <button class="ao-ctrl-btn" id="ao-btn-fs">⛶ PANTALLA COMPLETA</button>',
            '    <button class="ao-ctrl-btn" id="ao-btn-close">✕ CERRAR</button>',
            '  </div>',
            '</div>',
            '<div id="ao-canvas-wrap">',
            '  <canvas id="ao-canvas"></canvas>',
            '</div>',
            '<!-- Modal Briefing -->',
            '  <div class="ao-modal show" id="ao-brief-screen">',
            '    <div class="ao-modal-card">',
            '      <div class="ao-modal-title">⚔️ DEFENDIENDO LA ALDEA</div>',
            '      <div class="ao-modal-sub">Una bandada de feroces Ornithocheirus desciende en picada sobre la aldea tribal en Costa Rica. Apunta con tu mira y dispara justo cuando los reptiles alados se lancen en picada para salvar a los 4 aldeanos. ¡Conecta 15 disparos para ahuyentarlos!</div>',
            '      <div class="ao-rules-box">',
            '        ⚠️ <strong>REGLAS Y DIFICULTAD CRECIENTE:</strong><br>',
            '        • <strong>SOLO DISPARA EN PICADA:</strong> Mientras planean en el cielo son inalcanzables. Dispárales justo cuando se lancen a atacar.<br>',
            '        • <strong>BANDADA CRECIENTE:</strong> Conforme avances, se sumarán más Ornithocheirus (hasta 6) coordinando veloces picadas simultáneas.<br>',
            '        • <strong>CHILLIDO DE ALERTA:</strong> Escucharás su rugido de ataque cuando inicien la picada.<br>',
            '        • <strong>OBJETIVO:</strong> Logra <strong>15 impactos certeros</strong> para ahuyentar definitivamente a la bandada.',
            '      </div>',
            '      <button class="ao-primary-btn" id="ao-btn-start">▶ INICIAR JUEGO</button>',
            '    </div>',
            '  </div>',
            '  <!-- Modal Victoria -->',
            '  <div class="ao-modal" id="ao-win-screen">',
            '    <div class="ao-modal-card" style="border-color: rgba(46, 204, 113, 0.6); box-shadow: 0 0 50px rgba(46, 204, 113, 0.4);">',
            '      <div class="ao-modal-title" style="color: #2ecc71;">🏆 ¡MISIÓN CUMPLIDA!</div>',
            '      <div class="ao-modal-sub">Has conectado <strong>15 impactos certeros</strong> superando el feroz asedio aéreo. La bandada ha sido repelida y los aldeanos están a salvo.</div>',
            '      <div class="ao-rules-box" style="border-left-color: #2ecc71;" id="ao-win-stats">',
            '        • Impactos logrados: 15 / 15<br>',
            '        • Aldeanos rescatados: 4 / 4<br>',
            '        • Estado de la aldea: PROTEGIDA',
            '      </div>',
            '      <button class="ao-primary-btn ao-btn-green" id="ao-btn-win-replay">↺ JUGAR DE NUEVO</button>',
            '    </div>',
            '  </div>',
            '  <!-- Modal Derrota -->',
            '  <div class="ao-modal" id="ao-lose-screen">',
            '    <div class="ao-modal-card">',
            '      <div class="ao-modal-title">☠️ ALDEA CAÍDA</div>',
            '      <div class="ao-modal-sub">El enjambre de Ornithocheirus superó las defensas y capturó a todos los aldeanos.</div>',
            '      <div class="ao-rules-box" id="ao-lose-stats">',
            '        • Impactos logrados: 0 / 15<br>',
            '        • Aldeanos perdidos: 4 / 4<br>',
            '        • Recuerda disparar de inmediato en cuanto escuches el chillido de picada.',
            '      </div>',
            '      <button class="ao-primary-btn" id="ao-btn-lose-retry">↺ REINTENTAR MISIÓN</button>',
            '    </div>',
            '  </div>',
            '<div id="ao-footer">',
            '  <span>🎯 CONTROL: Mueve el cursor para apuntar | CLIC IZQUIERDO para disparar en plena picada</span>',
            '  <span>COSTA RICA // CAOS EN LA ISLA</span>',
            '</div>'
        ].join('\n');
        document.body.appendChild(ov);

        canvas = document.getElementById('ao-canvas');
        ctx = canvas.getContext('2d');

        // Eventos de controles con soporte táctil inmediato para móviles
        function bindTouchBtn(id, fn) {
            var el = document.getElementById(id);
            if (!el) return;
            var lastCall = 0;
            function trigger(e) {
                var now = Date.now();
                if (now - lastCall < 300) return;
                lastCall = now;
                if (e) {
                    if (e.cancelable) e.preventDefault();
                    e.stopPropagation();
                }
                fn();
            }
            el.addEventListener('click', trigger);
            el.addEventListener('touchend', trigger);
        }

        bindTouchBtn('ao-btn-start', startGame);
        bindTouchBtn('ao-btn-win-replay', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('ahuyentando-ornithos');
            startGame();
        });
        bindTouchBtn('ao-btn-lose-retry', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('ahuyentando-ornithos');
            startGame();
        });

        bindTouchBtn('ao-btn-mute', function () {
            isMuted = !isMuted;
            var btnMute = document.getElementById('ao-btn-mute');
            if (btnMute) btnMute.textContent = isMuted ? '🔇 SILENCIADO' : '🔊 SONIDO';
            if (sndMusic) {
                if (isMuted) sndMusic.pause();
                else if (state === 'playing') sndMusic.play().catch(function () {});
            }
        });

        bindTouchBtn('ao-btn-fs', function () {
            var el = document.getElementById('ao-overlay');
            if (!document.fullscreenElement) {
                if (el.requestFullscreen) el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        });

        bindTouchBtn('ao-btn-close', closeGame);

        // Control de mira y disparo en canvas (Ratón y Táctil Móvil)
        var wrap = document.getElementById('ao-canvas-wrap');

        wrap.addEventListener('mousemove', function (e) {
            updateMousePos(e.clientX, e.clientY);
            isMouseInside = true;
        });

        wrap.addEventListener('mouseenter', function () {
            isMouseInside = true;
        });

        wrap.addEventListener('mouseleave', function () {
            isMouseInside = false;
        });

        wrap.addEventListener('mousedown', function (e) {
            if (state !== 'playing') return;
            if (e.button === 0) {
                updateMousePos(e.clientX, e.clientY);
                handleShoot();
            }
        });

        // Soporte táctil móvil directo para disparar tocando la pantalla
        function onTouchShoot(e) {
            if (state !== 'playing') return;
            if (!e.touches || e.touches.length === 0) return;
            if (e.cancelable) e.preventDefault();
            isMouseInside = true;
            updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
            handleShoot();
        }

        function onTouchMove(e) {
            if (state !== 'playing') return;
            if (!e.touches || e.touches.length === 0) return;
            if (e.cancelable) e.preventDefault();
            isMouseInside = true;
            updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
        }

        canvas.addEventListener('touchstart', onTouchShoot, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        wrap.addEventListener('touchstart', function (e) {
            if (state !== 'playing') return;
            onTouchShoot(e);
        }, { passive: false });
        wrap.addEventListener('touchmove', function (e) {
            if (state !== 'playing') return;
            onTouchMove(e);
        }, { passive: false });

        window.addEventListener('resize', resizeCanvas);
    }

    function updateMousePos(clientX, clientY) {
        var rect = canvas.getBoundingClientRect();
        var canvasPxX = clientX - rect.left;
        var canvasPxY = clientY - rect.top;
        mousePos.x = (canvasPxX - offsetX) / scale;
        mousePos.y = (canvasPxY - offsetY) / scale;
    }

    // Tecla ESC para salir
    window.addEventListener('keydown', function (e) {
        var ov = document.getElementById('ao-overlay');
        if (!ov || !ov.classList.contains('open')) return;
        if (e.key === 'Escape') closeGame();
    });

    // ============================================================
    //  RESIZE RESPONSIVO (Ratio 16:9 - 1280x720)
    // ============================================================
    function resizeCanvas() {
        if (!canvas) return;
        var wrap = document.getElementById('ao-canvas-wrap');
        if (!wrap) return;

        var ww = wrap.clientWidth;
        var wh = wrap.clientHeight;
        if (ww <= 0 || wh <= 0) return;

        canvas.width = ww;
        canvas.height = wh;

        scale = Math.min(ww / canvasW, wh / canvasH);
        offsetX = Math.round((ww - canvasW * scale) / 2);
        offsetY = Math.round((wh - canvasH * scale) / 2);
    }

    function showModal(id) {
        ['ao-brief-screen', 'ao-win-screen', 'ao-lose-screen'].forEach(function (s) {
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
        hits = 0;
        particles = [];
        floatingTexts = [];
        muzzleFlashes = [];
        shakeDuration = 0;

        // Reiniciar aldeanos
        villagers.forEach(function (v) {
            v.alive = true;
            v.alertTimer = 0;
            v.fadeAlpha = 1.0;
        });

        // Reiniciar Ornithos
        ornithos.forEach(function (orn, idx) {
            orn.active = (orn.unlockHits === 0);
            orn.state = 'soaring';
            orn.diveProgress = 0;
            orn.targetVillagerId = null;
            orn.recoilTimer = 0;
            orn.y = orn.baseAltitude;

            if (idx === 0) {
                orn.x = 220;
                orn.diveTimer = 2.0;
            } else if (idx === 1) {
                orn.x = 960;
                orn.diveTimer = 4.5;
            } else {
                orn.diveTimer = 2.0 + Math.random() * 2.5;
            }
        });

        updateHUD();

        initAudio();
        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function () {});
        }

        lastTime = performance.now();
        if (aniFrame) cancelAnimationFrame(aniFrame);
        aniFrame = requestAnimationFrame(gameLoop);
    }

    function getLivingVillagers() {
        return villagers.filter(function (v) { return v.alive; });
    }

    function updateHUD() {
        var hitsTxt = document.getElementById('ao-hits-txt');
        if (hitsTxt) hitsTxt.textContent = hits + ' / ' + targetHits;

        var activeCount = ornithos.filter(function (o) { return o.active; }).length;
        var flockTxt = document.getElementById('ao-flock-txt');
        if (flockTxt) {
            flockTxt.textContent = activeCount + (activeCount >= 5 ? ' (¡PELIGRO MÁXIMO!)' : (activeCount >= 3 ? ' (BANDADA)' : ''));
            flockTxt.style.color = (activeCount >= 5) ? '#ff4757' : ((activeCount >= 3) ? '#f1c40f' : '#2ecc71');
        }

        villagers.forEach(function (v, idx) {
            var pill = document.getElementById('ao-v' + (idx + 1));
            if (pill) {
                if (v.alive) {
                    pill.className = 'ao-pill ao-pill-villager alive';
                    pill.innerHTML = (v.alertTimer > 0 ? '⚠️ ' : '👤 ') + 'Aldeano ' + v.id;
                } else {
                    pill.className = 'ao-pill ao-pill-villager lost';
                    pill.innerHTML = '☠️ Aldeano ' + v.id;
                }
            }
        });
    }

    // ============================================================
    //  SISTEMA DE DISPARO
    // ============================================================
    function handleShoot() {
        if (state !== 'playing') return;

        playGunshotSound();

        // Crear fogonazo en la posición de la mira
        muzzleFlashes.push({
            x: mousePos.x,
            y: mousePos.y,
            life: 0.12,
            maxLife: 0.12
        });

        // Comprobar si algún Ornithocheirus en picada fue alcanzado
        var hitAny = false;
        for (var i = 0; i < ornithos.length; i++) {
            var orn = ornithos[i];
            if (!orn.active) continue;

            if (orn.state === 'diving') {
                // Posición actual del centro del Ornitho en picada
                var dx = mousePos.x - orn.x;
                var dy = mousePos.y - orn.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                // Hitbox generosa para buena jugabilidad (con margen extra en pantallas táctiles móviles)
                var isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
                var touchBonus = isTouchDevice ? 26 : 0;
                if (dist <= orn.hitBoxRadius + 28 + touchBonus) {
                    hitAny = true;
                    registerHit(orn);
                    break;
                }
            } else if (orn.state === 'soaring') {
                // Si el usuario dispara a un Ornitho que planea
                var dx2 = mousePos.x - orn.x;
                var dy2 = mousePos.y - orn.y;
                var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 <= orn.hitBoxRadius) {
                    playDeflectSound();
                    addFloatingText(mousePos.x, mousePos.y - 30, '¡SOLO EN PICADA!', '#f39c12');
                }
            }
        }

        if (!hitAny) {
            // Disparo fallido
            addParticles(mousePos.x, mousePos.y, 4, '#e67e22');
        }
    }

    function registerHit(orn) {
        hits++;
        playHitSound();

        // Efectos visuales de impacto
        addParticles(orn.x, orn.y, 22, '#ff6b6b');
        addFloatingText(orn.x, orn.y - 45, '+1 ¡AHUYENTADO!', '#2ecc71');

        // Cancelar peligro sobre el aldeano objetivo
        if (orn.targetVillagerId !== null) {
            var v = villagers.find(function (item) { return item.id === orn.targetVillagerId; });
            if (v) v.alertTimer = 0;
            orn.targetVillagerId = null;
        }

        // Ornitho retrocede y asciende de inmediato
        orn.state = 'recoiling';
        orn.recoilTimer = 0.45;

        // Comprobar si desbloquea nuevos atacantes para escalar dificultad
        checkFlockSpawns();

        updateHUD();

        // Comprobar victoria
        if (hits >= targetHits) {
            triggerWin();
        }
    }

    function checkFlockSpawns() {
        for (var i = 0; i < ornithos.length; i++) {
            var orn = ornithos[i];
            if (!orn.active && hits >= orn.unlockHits) {
                orn.active = true;
                orn.state = 'soaring';
                orn.y = orn.baseAltitude;
                orn.diveTimer = 1.2 + Math.random() * 1.8;

                var count = ornithos.filter(function (o) { return o.active; }).length;
                if (count === 3) {
                    addFloatingText(640, 160, '¡REFUERZO AÉREO! ¡3 ORNITHOCHEIRUS AL ACECHO!', '#f1c40f');
                } else if (count === 4) {
                    addFloatingText(640, 160, '¡BANDADA EN AUMENTO! ¡4 DEPREDADORES EN EL CIELO!', '#e67e22');
                } else if (count === 5) {
                    addFloatingText(640, 160, '¡PELIGRO EXTREMO! ¡5 ORNITHOCHEIRUS ENJAMBRANDO!', '#ff4757');
                } else if (count >= 6) {
                    addFloatingText(640, 160, '¡CAOS TOTAL! ¡6 ORNITHOCHEIRUS ATACANDO A LA VEZ!', '#ff1744');
                }
            }
        }
    }

    function addParticles(x, y, count, color) {
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var spd = 70 + Math.random() * 200;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 0.35 + Math.random() * 0.35,
                maxLife: 0.6,
                color: color,
                size: 2.5 + Math.random() * 3.5
            });
        }
    }

    function addFloatingText(x, y, text, color) {
        floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color || '#fff',
            life: 1.0,
            maxLife: 1.0
        });
    }

    function triggerWin() {
        state = 'won';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        render();

        var livingCount = getLivingVillagers().length;
        var statsEl = document.getElementById('ao-win-stats');
        if (statsEl) {
            statsEl.innerHTML = [
                '• <strong>Impactos certeros:</strong> 15 / 15<br>',
                '• <strong>Aldeanos salvados:</strong> ' + livingCount + ' / 4<br>',
                '• <strong>Bandada repelida:</strong> ¡VICTORIA TOTAL SOBRE EL ENJAMBRE!'
            ].join('');
        }
        showModal('ao-win-screen');
    }

    function triggerLose() {
        state = 'lost';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        render();

        var statsEl = document.getElementById('ao-lose-stats');
        if (statsEl) {
            statsEl.innerHTML = [
                '• <strong>Impactos logrados:</strong> ' + hits + ' / 15<br>',
                '• <strong>Aldeanos restantes:</strong> 0 / 4<br>',
                '• <em>Dispara rápidamente a los depredadores en picada antes de que toquen tierra.</em>'
            ].join('');
        }
        showModal('ao-lose-screen');
    }

    // ============================================================
    //  BUCLE PRINCIPAL (GAME LOOP)
    // ============================================================
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
        // Reducir temblor de pantalla
        if (shakeDuration > 0) {
            shakeDuration -= dt;
            if (shakeDuration <= 0) shakeMagnitude = 0;
        }

        // Comprobar spawn de más atacantes según impactos
        checkFlockSpawns();

        // Actualizar aldeanos (alertas)
        villagers.forEach(function (v) {
            if (v.alertTimer > 0) v.alertTimer -= dt;
        });

        // Contar cuántos Ornithocheirus están en picada actualmente
        var currentDivers = ornithos.filter(function (o) { return o.active && o.state === 'diving'; }).length;

        // Límite de picadas simultáneas según dificultad
        // Hits 0-2: 1 a la vez
        // Hits 3-5: 1 a la vez con descansos mínimos
        // Hits 6-8: hasta 2 picadas simultáneas
        // Hits 9-11: hasta 2 picadas simultáneas más rápidas
        // Hits 12-14: hasta 3 picadas simultáneas ultra veloces
        var maxSimultaneousDives = (hits >= 12) ? 3 : ((hits >= 6) ? 2 : 1);

        // Actualizar cada Ornithocheirus
        for (var i = 0; i < ornithos.length; i++) {
            updateOrnitho(ornithos[i], dt, currentDivers, maxSimultaneousDives);
        }

        // Actualizar partículas
        for (var p = particles.length - 1; p >= 0; p--) {
            var pt = particles[p];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
            if (pt.life <= 0) particles.splice(p, 1);
        }

        // Actualizar textos flotantes
        for (var t = floatingTexts.length - 1; t >= 0; t--) {
            var ft = floatingTexts[t];
            ft.y -= 42 * dt;
            ft.life -= dt;
            if (ft.life <= 0) floatingTexts.splice(t, 1);
        }

        // Actualizar fogonazos
        for (var m = muzzleFlashes.length - 1; m >= 0; m--) {
            var mf = muzzleFlashes[m];
            mf.life -= dt;
            if (mf.life <= 0) muzzleFlashes.splice(m, 1);
        }
    }

    function updateOrnitho(orn, dt, currentDivers, maxSimultaneousDives) {
        if (!orn.active) return;

        // Aleteo continuo en vuelo horizontal
        orn.flapTimer += dt;
        if (orn.flapTimer >= 0.2) {
            orn.flapTimer = 0;
            orn.currentFrame = (orn.currentFrame === 'Ornitho 1.png') ? 'Ornitho 2.png' : 'Ornitho 1.png';
        }

        // ESTADO 1: PLANEANDO EN EL CIELO
        if (orn.state === 'soaring') {
            orn.x += orn.vx * dt;
            orn.y += Math.sin(performance.now() * 0.0022 + orn.id * 1.5) * 0.9;

            // Rebotar en los extremos del cielo
            if (orn.vx > 0 && orn.x > 1160) orn.vx = -Math.abs(orn.vx);
            else if (orn.vx < 0 && orn.x < 120) orn.vx = Math.abs(orn.vx);

            // Temporizador de picada
            orn.diveTimer -= dt;
            if (orn.diveTimer <= 0 && currentDivers < maxSimultaneousDives) {
                var living = getLivingVillagers();
                if (living.length > 0) {
                    // Elegir un aldeano vivo como objetivo
                    var target = living[Math.floor(Math.random() * living.length)];
                    orn.targetVillagerId = target.id;
                    target.alertTimer = 3.0;

                    // Proporciones del aldeano para centrar la picada
                    var vw = Math.round(target.vh * (target.sw / target.sh));
                    var vh = target.vh;

                    // Inicializar picada
                    orn.state = 'diving';
                    orn.diveProgress = 0;
                    orn.diveStartX = orn.x;
                    orn.diveStartY = orn.y;
                    orn.diveTargetX = target.x + vw / 2;
                    orn.diveTargetY = target.y + vh / 2 - 15;

                    // Duración de la picada (más rápida a mayor progreso = DIFICULTAD CRECIENTE)
                    if (hits >= 12) {
                        orn.diveDuration = 1.35; // Picada fulgurante
                    } else if (hits >= 9) {
                        orn.diveDuration = 1.55;
                    } else if (hits >= 6) {
                        orn.diveDuration = 1.8;
                    } else if (hits >= 3) {
                        orn.diveDuration = 2.05;
                    } else {
                        orn.diveDuration = 2.35;
                    }

                    playDiveAttackRoar();
                    addFloatingText(orn.diveStartX, orn.diveStartY - 25, '⚠️ ¡EN PICADA!', '#ff4757');
                    updateHUD();
                } else {
                    triggerLose();
                }
            }
        }

        // ESTADO 2: EN PICADA DESCENDENTE HACIA EL ALDEANO
        else if (orn.state === 'diving') {
            orn.diveProgress += dt / orn.diveDuration;
            var t = orn.diveProgress;

            // Interpolación acelerada hacia el objetivo
            orn.x = orn.diveStartX + (orn.diveTargetX - orn.diveStartX) * t;
            var linearY = orn.diveStartY + (orn.diveTargetY - orn.diveStartY) * t;
            // Arco de trayectoria en picada
            var swoopArc = Math.sin(t * Math.PI) * 40;
            orn.y = linearY + swoopArc;

            // Llegó al aldeano sin haber sido alcanzado por disparos
            if (orn.diveProgress >= 1.0) {
                var targetV = villagers.find(function (v) { return v.id === orn.targetVillagerId; });
                if (targetV && targetV.alive) {
                    targetV.alive = false;
                    targetV.alertTimer = 0;
                    addFloatingText(targetV.x + 35, targetV.y - 40, '☠️ ¡ALDEANO CAPTURADO!', '#e74c3c');
                    addParticles(targetV.x + 40, targetV.y + 60, 25, '#c0392b');

                    // Temblor de pantalla
                    shakeDuration = 0.45;
                    shakeMagnitude = 14;
                    updateHUD();

                    // Comprobar derrota
                    if (getLivingVillagers().length === 0) {
                        triggerLose();
                        return;
                    }
                }

                // El Ornitho asciende nuevamente
                orn.state = 'recoiling';
                orn.recoilTimer = 0.55;
                orn.targetVillagerId = null;
            }
        }

        // ESTADO 3: RETROCESO Y ASCENSO TRAS IMPACTO O ATAQUE
        else if (orn.state === 'recoiling') {
            orn.recoilTimer -= dt;
            orn.y -= 280 * dt;
            orn.x += (orn.vx > 0 ? 90 : -90) * dt;

            if (orn.recoilTimer <= 0 || orn.y <= orn.baseAltitude + 30) {
                orn.state = 'soaring';
                orn.y = orn.baseAltitude + (Math.random() - 0.5) * 20;

                // Intervalo para la siguiente picada según dificultad
                if (hits >= 12) {
                    orn.diveTimer = 0.5 + Math.random() * 0.8; // Ataques casi continuos
                } else if (hits >= 9) {
                    orn.diveTimer = 0.8 + Math.random() * 1.2;
                } else if (hits >= 6) {
                    orn.diveTimer = 1.2 + Math.random() * 1.6;
                } else if (hits >= 3) {
                    orn.diveTimer = 1.6 + Math.random() * 2.0;
                } else {
                    orn.diveTimer = 2.4 + Math.random() * 2.6;
                }
            }
        }
    }

    // ============================================================
    //  RENDERIZADO EN CANVAS
    // ============================================================
    function render() {
        if (!ctx || !canvas) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aplicar temblor de pantalla si hay impacto
        var shakeX = 0;
        var shakeY = 0;
        if (shakeMagnitude > 0) {
            shakeX = (Math.random() - 0.5) * shakeMagnitude * scale;
            shakeY = (Math.random() - 0.5) * shakeMagnitude * scale;
        }

        ctx.translate(offsetX + shakeX, offsetY + shakeY);

        // ========================================================
        // 1. FONDO DE LA ALDEA (Fondo aldea.jpg)
        // ========================================================
        var bgImg = getImage('Fondo aldea.jpg');
        if (bgImg.complete && bgImg.naturalWidth) {
            ctx.drawImage(bgImg, 0, 0, canvasW * scale, canvasH * scale);
        } else {
            ctx.fillStyle = '#1e382b';
            ctx.fillRect(0, 0, canvasW * scale, canvasH * scale);
        }

        // ========================================================
        // 2. DIBUJAR ALDEANOS EN EL SUELO (PROPORCIONES EXACTAS)
        // ========================================================
        villagers.forEach(function (v) {
            // Calcular ancho proporcional exacto según su bbox sin compresión
            var vw = Math.round(v.vh * (v.sw / v.sh));
            var vh = v.vh;

            if (!v.alive) {
                // Dibujar lápida / indicador de aldeano perdido
                ctx.save();
                ctx.fillStyle = 'rgba(231, 76, 60, 0.45)';
                ctx.font = 'bold ' + Math.round(13 * scale) + 'px Orbitron';
                ctx.textAlign = 'center';
                ctx.fillText('☠️ CAÍDO', (v.x + vw / 2) * scale, (v.y + vh - 10) * scale);
                ctx.restore();
                return;
            }

            var vImg = getImage(v.file);
            if (vImg.complete && vImg.naturalWidth) {
                var vx = v.x * scale;
                var vy = v.y * scale;
                var vdw = vw * scale;
                var vdh = vh * scale;

                ctx.save();
                // Si el aldeano está bajo ataque inminente, parpadea en rojo/amarillo
                if (v.alertTimer > 0) {
                    var pulse = (Math.sin(performance.now() * 0.02) + 1) / 2;
                    ctx.shadowColor = '#ff4757';
                    ctx.shadowBlur = (15 + pulse * 25) * scale;

                    // Baliza de peligro
                    ctx.font = 'bold ' + Math.round(22 * scale) + 'px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚠️', (v.x + vw / 2) * scale, (v.y - 14 - pulse * 12) * scale);
                }

                // DIBUJAR CON CROP EXACTO (sx, sy, sw, sh): CERO COMPRESIÓN
                ctx.drawImage(vImg, v.sx, v.sy, v.sw, v.sh, vx, vy, vdw, vdh);
                ctx.restore();
            }
        });

        // ========================================================
        // 3. DIBUJAR ORNITHOCHEIRUS (VUELO / PICADA)
        // ========================================================
        for (var i = 0; i < ornithos.length; i++) {
            var orn = ornithos[i];
            if (!orn.active) continue;

            ctx.save();
            var ox = orn.x * scale;
            var oy = orn.y * scale;

            if (orn.state === 'diving') {
                // MODELO EN PICADA (En picada.png) con crop exacto (866, 57, 799, 1103)
                var picImg = getImage('En picada.png');
                if (picImg.complete && picImg.naturalWidth) {
                    ctx.shadowColor = '#ff4757';
                    ctx.shadowBlur = 25 * scale;

                    var diveAngle = Math.atan2(orn.diveTargetY - orn.diveStartY, orn.diveTargetX - orn.diveStartX) - Math.PI / 2;
                    ctx.translate(ox, oy);
                    ctx.rotate(diveAngle * 0.35);

                    var pw = Math.round(150 * (799 / 1103)) * scale;
                    var ph = 150 * scale;
                    ctx.drawImage(picImg, 866, 57, 799, 1103, -pw / 2, -ph / 2, pw, ph);
                }
            } else {
                // MODELOS EN PLANEO HORIZONTAL (Ornitho 1 / Ornitho 2)
                var flyImg = getImage(orn.currentFrame);
                if (flyImg.complete && flyImg.naturalWidth) {
                    ctx.translate(ox, oy);
                    // Orientar según dirección horizontal de vuelo
                    if (orn.vx < 0) ctx.scale(-1, 1);

                    var crop = (orn.currentFrame === 'Ornitho 1.png') ?
                        { sx: 70, sy: 58, sw: 1656, sh: 1982 } :
                        { sx: 39, sy: 97, sw: 1721, sh: 1806 };

                    var ow = 160 * scale;
                    var oh = Math.round(160 * (crop.sh / crop.sw)) * scale;
                    ctx.drawImage(flyImg, crop.sx, crop.sy, crop.sw, crop.sh, -ow / 2, -oh / 2, ow, oh);
                }
            }
            ctx.restore();
        }

        // ========================================================
        // 4. PARTÍCULAS
        // ========================================================
        particles.forEach(function (pt) {
            ctx.save();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
            ctx.beginPath();
            ctx.arc(pt.x * scale, pt.y * scale, pt.size * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // ========================================================
        // 5. FOGONAZOS DE DISPARO (Muzzle Flash)
        // ========================================================
        muzzleFlashes.forEach(function (mf) {
            ctx.save();
            var alpha = mf.life / mf.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 35 * scale;
            ctx.beginPath();
            ctx.arc(mf.x * scale, mf.y * scale, (22 * alpha + 8) * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // ========================================================
        // 6. TEXTOS FLOTANTES (+1 IMPACTO, ALERTAS)
        // ========================================================
        floatingTexts.forEach(function (ft) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
            ctx.font = '900 ' + Math.round(18 * scale) + 'px Orbitron';
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 15 * scale;
            ctx.fillText(ft.text, ft.x * scale, ft.y * scale);
            ctx.restore();
        });

        // ========================================================
        // 7. MIRA RETÍCULA (Crosshair.png)
        // ========================================================
        if (state === 'playing' && isMouseInside) {
            var chImg = getImage('Crosshair.png');
            var cx = mousePos.x * scale;
            var cy = mousePos.y * scale;
            var chSize = 64 * scale;

            ctx.save();
            if (chImg.complete && chImg.naturalWidth) {
                ctx.drawImage(chImg, cx - chSize / 2, cy - chSize / 2, chSize, chSize);
            } else {
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx - 30 * scale, cy);
                ctx.lineTo(cx + 30 * scale, cy);
                ctx.moveTo(cx, cy - 30 * scale);
                ctx.lineTo(cx, cy + 30 * scale);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
    }

    // ============================================================
    //  APERTURA Y CIERRE DEL MINIJUEGO
    // ============================================================
    function openGame() {
        injectHTMLAndStyles();
        var ov = document.getElementById('ao-overlay');
        if (!ov) return;
        ov.classList.add('open');

        // Pausar música de fondo del sitio
        if (typeof window.interruptBgMusic === 'function') {
            window.interruptBgMusic();
        }

        resizeCanvas();
        state = 'briefing';
        showModal('ao-brief-screen');

        initAudio();
        if (sndMusic) {
            sndMusic.currentTime = 0;
            if (!isMuted) sndMusic.play().catch(function () {});
        }
    }

    function closeGame() {
        var ov = document.getElementById('ao-overlay');
        if (ov) ov.classList.remove('open');
        stopAllAudio();
        state = 'idle';
        if (aniFrame) cancelAnimationFrame(aniFrame);
        showModal(null);

        // Reanudar música de fondo del sitio
        if (typeof window.releaseBgMusic === 'function') {
            window.releaseBgMusic();
        }
    }

    // Exponer globalmente
    window.openAhuyentandoOrnithos = openGame;

    // Inicialización al cargar la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHTMLAndStyles);
    } else {
        injectHTMLAndStyles();
    }

})();
