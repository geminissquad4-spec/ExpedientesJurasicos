/* ============================================================
   EXPEDIENTES JURÁSICOS - CAOS EN LA ISLA
   MINIJUEGO: HIBRIDACIÓN DE ADN - PROYECTO QUIMERA
   Dr. Daniel Moreno // Desarrollo de Bioarmas Genéticas
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 1. CATÁLOGO DE ESPECIES (BANCO GENÉTICO)
    // ------------------------------------------------------------
    var GENETIC_CATALOG = [
        { id: 'aguila', name: 'Águila', cat: 'aves', file: 'Aguila Scan.jpg' },
        { id: 'amargasaurus', name: 'Amargasaurus', cat: 'dinos', file: 'Amargasaurus Scan.jpg' },
        { id: 'anaconda', name: 'Anaconda', cat: 'reptiles', file: 'Anaconda Scan.jpg' },
        { id: 'ankylosaurus', name: 'Ankylosaurus', cat: 'dinos', file: 'Ankylosaurus Scan.jpg' },
        { id: 'camaleon', name: 'Camaleón', cat: 'reptiles', file: 'Camaleon Scan.jpg', altFile: 'Camaleón.jpg' },
        { id: 'carnotaurus', name: 'Carnotaurus', cat: 'dinos', file: 'Carnotaurus Scan.jpg' },
        { id: 'ceratosaurus', name: 'Ceratosaurus', cat: 'dinos', file: 'Ceratosaurus Scan.jpg' },
        { id: 'compsognathus', name: 'Compsognathus', cat: 'dinos', file: 'Compsognathus Scan.jpg' },
        { id: 'giganotosaurus', name: 'Giganotosaurus', cat: 'dinos', file: 'Giganotosaurus Scan.jpg' },
        { id: 'gorgonopsid', name: 'Gorgonopsid', cat: 'mamiferos', file: 'Gorgonopsid Scan.jpg' },
        { id: 'halcon', name: 'Halcón', cat: 'aves', file: 'Halcón Scan.jpg' },
        { id: 'hypsilophodon', name: 'Hypsilophodon', cat: 'dinos', file: 'Hypsilophodon Scan.jpg' },
        { id: 'lagartija', name: 'Lagartija', cat: 'reptiles', file: 'Lagartija Scan.jpg' },
        { id: 'microraptor', name: 'Microraptor', cat: 'dinos', file: 'Microraptor Scan.jpg' },
        { id: 'murcielago', name: 'Murciélago', cat: 'mamiferos', file: 'Murcielago Scan.jpg' },
        { id: 'parasaurolophus', name: 'Parasaurolophus', cat: 'dinos', file: 'Parasaurolophus Scan.jpg', altFile: 'Prasaurolophus.jpg' },
        { id: 'pez_leon', name: 'Pez León', cat: 'marinos', file: 'Pez León Scan.jpg' },
        { id: 'pteranodon', name: 'Pteranodon', cat: 'dinos', file: 'Pteranodon Scan.jpg' },
        { id: 'puerco_espin', name: 'Puerco Espín', cat: 'mamiferos', file: 'Puerco Espín Scan.jpg' },
        { id: 'rana', name: 'Rana', cat: 'reptiles', file: 'Rana Scan.jpg' },
        { id: 'serpiente_coralillo', name: 'Serpiente de coralillo', cat: 'reptiles', file: 'Serpiente de coralillo Scan.jpg' },
        { id: 'stegosaurus', name: 'Stegosaurus', cat: 'dinos', file: 'Stegosaurus Scan.jpg' },
        { id: 'suchomimus', name: 'Suchomimus', cat: 'dinos', file: 'Suchomimus Scan.jpg' },
        { id: 'tanystropheus', name: 'Tanystropheus', cat: 'marinos', file: 'Tanystropheus Scan.jpg' },
        { id: 'therizinosaurus', name: 'Therizinosaurus', cat: 'dinos', file: 'Therizinosaurus Scan.jpg' },
        { id: 'tigre', name: 'Tigre', cat: 'mamiferos', file: 'Tigre Scan.jpg' },
        { id: 'triceratops', name: 'Triceratops', cat: 'dinos', file: 'Triceratops Scan.jpg' },
        { id: 'tyrannosaurus', name: 'Tyrannosaurus', cat: 'dinos', file: 'Tyrannosaurus Scan.jpg' },
        { id: 'utahraptor', name: 'Utahraptor', cat: 'dinos', file: 'Utahraptor Scan.jpg' },
        { id: 'velociraptor', name: 'Velociraptor', cat: 'dinos', file: 'Velociraptor Scan.jpg' }
    ];

    // ------------------------------------------------------------
    // 2. CATÁLOGO DE HÍBRIDOS (PROYECTO QUIMERA MILITAR)
    // ------------------------------------------------------------
    var HYBRIDS = [
        {
            id: 'tanaconda',
            name: 'Tanaconda',
            img: 'Tanaconda.png',
            roar: 'Tanaconda Roar.mp4',
            role: 'Bioarma Táctica de Emboscada y Asfixia Subacuática',
            genes: [
                {
                    targetId: 'tanystropheus',
                    clue: 'Iniciaremos con una prueba controlada. Para la estructura base, requiero el ADN de una especie reptiliana acuática del Triásico, conocida por su cuello desproporcionadamente largo que superaba la longitud de su propio cuerpo...'
                },
                {
                    targetId: 'anaconda',
                    clue: 'Excelente empalme primario. Ahora necesitamos el genoma de un reptil moderno capaz de manipular ese cuello enorme con una fuerza muscular descomunal para atrapar a sus presas y estrangularlas hasta quebrar sus huesos...'
                }
            ]
        },
        {
            id: 'carnoraptor',
            name: 'Carnoraptor',
            img: 'Carnoraptor.png',
            roar: 'Carnoraptor Roar.mp4',
            role: 'Unidad de Asalto Rápido e Infiltración Camuflada',
            genes: [
                {
                    targetId: 'carnotaurus',
                    clue: 'Comencemos la base ósea con un temible terópodo carnívoro de Sudamérica que posee dos cuernos frontales sobre sus ojos y una potente embestida frontal...'
                },
                {
                    targetId: 'velociraptor',
                    clue: 'Ahora debemos fusionar la inteligencia táctica de caza en jauría y la mortífera garra en forma de hoz de este dromeosáurido asiático...'
                },
                {
                    targetId: 'camaleon',
                    clue: 'Para convertirlo en el arma de infiltración definitiva, incorpora el ADN de un reptil moderno famoso por sus células cromatóforas capaces de mimetizarse con el entorno...'
                }
            ]
        },
        {
            id: 'ankyloranodon',
            name: 'Ankyloranodon',
            img: 'Ankyloranodon.png',
            roar: 'Ankyloranodon Roar.mp4',
            role: 'Bombardero Blindado Aéreo de Penetración Pesada',
            genes: [
                {
                    targetId: 'ankylosaurus',
                    clue: 'El ejército solicita una unidad aérea blindada. Como chasis defensivo, requerimos el ADN de un dinosaurio herbívoro acorazado con placas óseas y una pesada maza en la cola...'
                },
                {
                    targetId: 'pteranodon',
                    clue: 'Para otorgarle envergadura alar prehistórica, integraremos el genoma de un célebre reptil volador del Cretácico con una notable cresta craneal y alas de planeo...'
                },
                {
                    targetId: 'murcielago',
                    clue: 'Para el vuelo nocturno táctico en la más densa oscuridad, sintetizaremos los genes de un mamífero volador que domina la ecolocalización por ultrasonidos...'
                }
            ]
        },
        {
            id: 'paradeinonychus',
            name: 'Paradeinonychus',
            img: 'Paradeinonychus.png',
            roar: 'Paradeinonychus Roar.mp4',
            role: 'Rastreador Táctico de Comunicación y Asalto',
            genes: [
                {
                    targetId: 'parasaurolophus',
                    clue: 'Iniciemos con la plantilla de un ornitópodo con una cresta tubular alargada en el cráneo capaz de producir señales acústicas de largo alcance...'
                },
                {
                    targetId: 'utahraptor',
                    clue: 'Empalmaremos el poder letal del dromeosáurido más grande y robusto descubierto en Norteamérica, una verdadera máquina de matar...'
                },
                {
                    targetId: 'lagartija',
                    clue: 'Para mejorar su tasa de regeneración celular y reflejos en tierra, sumaremos el ADN de un pequeño reptil escamoso de sangre fría y movimientos fulminantes...'
                }
            ]
        },
        {
            id: 'velocirapteryx',
            name: 'Velocirapteryx',
            img: 'Velocirapteryx.png',
            roar: 'Velocirapteryx Roar.mp4',
            role: 'Interceptor Aéreo Ligero de Ataque Veloz',
            genes: [
                {
                    targetId: 'velociraptor',
                    clue: 'Diseñaremos un cazador ágil de hostigamiento. Primero, extrae el genoma del famoso terópodo carnívoro de garras curvas y visión binocular...'
                },
                {
                    targetId: 'microraptor',
                    clue: 'Añadiremos los genes de un pequeño dinosaurio arborícola provisto de plumas y cuatro alas planeadoras...'
                },
                {
                    targetId: 'aguila',
                    clue: 'Para maximizar la visión telescópica y garras aéreas letales, seleccionaremos a una majestuosa ave rapaz ápice...'
                }
            ]
        },
        {
            id: 'tyrannonops',
            name: 'Tyrannonops',
            img: 'Tyrannonops.png',
            roar: 'Tyrannonops Roar.mp4',
            role: 'Coloso Terrestre de Rompimiento de Líneas',
            genes: [
                {
                    targetId: 'tyrannosaurus',
                    clue: 'Hora de aumentar el poder destructivo. Como base primaria, requerimos al rey tirano con la mordida mandibular más poderosa de la historia...'
                },
                {
                    targetId: 'gorgonopsid',
                    clue: 'Combinaremos su ferocidad con un sinápsido prehistórico del Pérmico que dominaba con colmillos de sable aterradores...'
                },
                {
                    targetId: 'tigre',
                    clue: 'Para dotarlo de la velocidad de emboscada y reflejos felinos, integraremos el ADN del félido rayado más grande de la Tierra...'
                }
            ]
        },
        {
            id: 'amargospinus',
            name: 'Amargospinus',
            img: 'Amargospinus.png',
            roar: 'Amargospinus Roar.mp4',
            role: 'Defensor de Trinchera con Púas Punzantes Balísticas',
            genes: [
                {
                    targetId: 'amargasaurus',
                    clue: 'Para un híbrido con espinas defensivas perimetrales, utilizaremos un saurópodo sudamericano con dos hileras de espinas a lo largo del cuello...'
                },
                {
                    targetId: 'suchomimus',
                    clue: 'Añadiremos el genoma de un espinosáurido africano con morro similar al de un cocodrilo y garras curvas para desgarrar...'
                },
                {
                    targetId: 'puerco_espin',
                    clue: 'Reforzaremos su blindaje dorsal con el ADN de un mamífero roedor provisto de púas afiladas que se desprenden e incrustan al menor contacto...'
                }
            ]
        },
        {
            id: 'ceratophodon',
            name: 'Ceratophodon',
            img: 'Ceratophodon.png',
            roar: 'Ceratophodon Roar.mp4',
            role: 'Unidad de Asalto Ultrasónico en Picada',
            genes: [
                {
                    targetId: 'ceratosaurus',
                    clue: 'Base de combate: un terópodo jurásico provisto de un llamativo cuerno en el hocico y crestas supraorbitales...'
                },
                {
                    targetId: 'hypsilophodon',
                    clue: 'Para optimizar la agilidad y ligereza en carrera, añadiremos los genes de un pequeño y ágil corredor bípedo ornitópodo...'
                },
                {
                    targetId: 'halcon',
                    clue: 'Culminaremos con el ave rapaz más veloz del planeta, poseedora de ataques en picada fulminantes...'
                }
            ]
        },
        {
            id: 'compstegnathus',
            name: 'Compstegnathus',
            img: 'Compstegnathus.png',
            roar: 'Compstegnathus Roar.mp4',
            role: 'Enjambre Biológico Neurotóxico de Sabotaje',
            genes: [
                {
                    targetId: 'compsognathus',
                    clue: 'Comencemos este híbrido multi-genético con un diminuto carnívoro del tamaño de un pollo, famoso por su rapidez en enjambre...'
                },
                {
                    targetId: 'stegosaurus',
                    clue: 'Agreguemos las placas óseas dorsales y la cola armada con cuatro largas púas de un clásico tireóforo jurásico...'
                },
                {
                    targetId: 'rana',
                    clue: 'Utilizaremos ADN anfibio para interconectar los enlaces genéticos...'
                },
                {
                    targetId: 'pez_leon',
                    clue: 'Para dotarlo de neurotoxinas letales en sus púas, inyectaremos el genoma de un pez tropical rayado con espinas altamente venenosas...'
                }
            ]
        },
        {
            id: 'ultimasaurus',
            name: 'Ultimasaurus',
            img: 'Ultimasaurus.png',
            roar: 'Ultimasaurus Roar.mp4',
            role: 'EL ÁPICE SUPREMO // LA BIOARMA DEFINITIVA',
            genes: [
                { targetId: 'tyrannosaurus', clue: '¡EL PROYECTO SUPREMO! 1/9: Requerimos la fuerza y masa muscular del emperador carnívoro de Isla Nublar...' },
                { targetId: 'giganotosaurus', clue: '2/9: Añadimos la ferocidad y talla descomunal del gigante carnívoro sudamericano con dientes diseñados para cortar carne...' },
                { targetId: 'triceratops', clue: '3/9: Incorporamos la robusta gola ósea frontal y tres cuernos de penetración masiva de este ceratópsido...' },
                { targetId: 'velociraptor', clue: '4/9: La garra en hoz letal y la inteligencia táctica de caza en jauría...' },
                { targetId: 'stegosaurus', clue: '5/9: Las placas dorsales blindadas y espinas caudales thagomizer...' },
                { targetId: 'ankylosaurus', clue: '6/9: La coraza biológica indestructible de osteodermos y maza pesada de impacto...' },
                { targetId: 'therizinosaurus', clue: '7/9: Las garras manuales más colosales jamás vistas, guadañas biológicas de casi un metro...' },
                { targetId: 'serpiente_coralillo', clue: '8/9: Las potentes neurotoxinas paralizantes de un reptil venenoso de anillos coloridos...' },
                { targetId: 'rana', clue: '9/9: El código de compatibilidad metabólica y adaptabilidad anfibia para estabilizar el genoma definitivo...' }
            ]
        }
    ];

    // ------------------------------------------------------------
    // 3. ESTADO DEL JUEGO
    // ------------------------------------------------------------
    var currentHybridIdx = 0; // 0 a 9
    var currentGeneStep = 0;   // Índice del gen actual dentro del híbrido
    var currentProgress = 0;  // 0.0 a 1.0 (barra de ADN)
    var targetProgress = 0;   // Destino suave de la barra
    var state = 'briefing';    // 'briefing', 'playing', 'error', 'birth', 'victory'

    // Elementos DOM
    var overlay = null;
    var sndMusic = null;
    var currentRoar = null;
    var audioCtx = null;
    var isMuted = false;
    var isPaused = false;
    var activeCategory = 'all';
    var searchQuery = '';

    // ------------------------------------------------------------
    // 4. GESTIÓN DE AUDIO Y ASSETS
    // ------------------------------------------------------------
    function getAssetPath(filename) {
        return filename;
    }

    function initAudio() {
        if (!audioCtx) {
            try {
                var AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            } catch (e) {}
        }

        if (!sndMusic) {
            sndMusic = new Audio();
            sndMusic.src = 'Hibrida.mp4';
            sndMusic.loop = true;
            sndMusic.volume = 0.50;
            sndMusic.onerror = function () {
                if (sndMusic.src.indexOf('hibridaci') === -1) {
                    sndMusic.src = 'hibridación de adn/Hibrida.mp4';
                }
            };
        }
    }

    function playTone(freq, duration, type, vol) {
        if (isMuted) return;
        if (!audioCtx) initAudio();
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            var v = (vol !== undefined ? vol : 0.25);
            gain.gain.setValueAtTime(v, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duration || 0.25));
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (duration || 0.25));
        } catch (e) {}
    }

    function playSuccessSplice() {
        // Acorde electrónico ascendente de empalme exitoso
        [440, 554.37, 659.25, 880].forEach(function (f, idx) {
            setTimeout(function () {
                playTone(f, 0.25, 'triangle', 0.28);
            }, idx * 70);
        });
    }

    function playErrorBuzzer() {
        // Alarma estridente de incompatibilidad genética
        playTone(130, 0.5, 'sawtooth', 0.4);
        setTimeout(function () {
            playTone(98, 0.6, 'sawtooth', 0.45);
        }, 110);
    }

    function playHybridRoar(roarFile) {
        if (isMuted) return;
        if (currentRoar) {
            try { currentRoar.pause(); currentRoar.currentTime = 0; } catch (e) {}
        }
        currentRoar = new Audio();
        currentRoar.src = roarFile;
        currentRoar.onerror = function () {
            if (currentRoar.src.indexOf('hibridaci') === -1) {
                currentRoar.src = 'hibridación de adn/' + roarFile;
            }
        };
        currentRoar.volume = 1.0;
        currentRoar.play().catch(function () {});
    }

    function stopAllAudio() {
        if (sndMusic) {
            try { sndMusic.pause(); sndMusic.currentTime = 0; } catch (e) {}
        }
        if (currentRoar) {
            try { currentRoar.pause(); currentRoar.currentTime = 0; } catch (e) {}
        }
    }

    // ------------------------------------------------------------
    // 5. ESTILOS E INTERFAZ GRÁFICA
    // ------------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('ha-game-styles')) return;
        var style = document.createElement('style');
        style.id = 'ha-game-styles';
        style.textContent = [
            '#ha-overlay {',
            '  position: fixed;',
            '  inset: 0;',
            '  z-index: 100000;',
            '  background: #020704;',
            '  display: none;',
            '  flex-direction: column;',
            '  overflow: hidden;',
            '  font-family: "Share Tech Mono", monospace;',
            '  user-select: none;',
            '  -webkit-user-select: none;',
            '}',
            '#ha-overlay.open { display: flex; }',
            '',
            '/* Encabezado */',
            '#ha-header {',
            '  flex-shrink: 0;',
            '  height: 52px;',
            '  background: linear-gradient(180deg, rgba(8, 24, 16, 0.98), rgba(4, 12, 8, 0.95));',
            '  border-bottom: 2px solid rgba(46, 204, 113, 0.45);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 0 1rem;',
            '  box-shadow: 0 2px 18px rgba(0,0,0,0.85);',
            '  z-index: 25;',
            '}',
            '.ha-header-left { display: flex; align-items: center; gap: 0.8rem; }',
            '.ha-logo-badge {',
            '  background: #27ae60;',
            '  color: #03140a;',
            '  font-weight: 900;',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  letter-spacing: 1.5px;',
            '  padding: 3px 8px;',
            '  border-radius: 3px;',
            '  box-shadow: 0 0 10px rgba(46, 204, 113, 0.6);',
            '}',
            '.ha-header-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.95rem;',
            '  font-weight: 700;',
            '  color: #f1f2f6;',
            '  letter-spacing: 1.5px;',
            '}',
            '.ha-header-status { display: flex; align-items: center; gap: 1rem; }',
            '.ha-hud-chip {',
            '  background: rgba(255,255,255,0.06);',
            '  border: 1px solid rgba(46,204,113,0.3);',
            '  border-radius: 4px;',
            '  padding: 4px 10px;',
            '  font-size: 0.82rem;',
            '}',
            '.ha-tool-btn {',
            '  background: rgba(255,255,255,0.08);',
            '  border: 1px solid rgba(255,255,255,0.2);',
            '  color: #ecf0f1;',
            '  padding: 5px 10px;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.78rem;',
            '}',
            '.ha-tool-btn:hover { background: rgba(46,204,113,0.3); color: #fff; border-color: #2ecc71; }',
            '.ha-close-btn {',
            '  background: rgba(231, 76, 60, 0.25);',
            '  border: 1px solid #e74c3c;',
            '  color: #ff6b6b;',
            '  padding: 5px 12px;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  font-weight: 700;',
            '  font-size: 0.85rem;',
            '}',
            '.ha-close-btn:hover { background: #e74c3c; color: #fff; }',
            '',
            '/* Área Principal de Laboratorio */',
            '#ha-stage {',
            '  flex: 1;',
            '  position: relative;',
            '  overflow: hidden;',
            '  background-size: cover;',
            '  background-position: center;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  transition: background-image 0.6s ease-in-out;',
            '}',
            '',
            '/* Silueta de Dr. Daniel Moreno */',
            '#ha-doctor-portrait {',
            '  position: absolute;',
            '  left: 20px;',
            '  bottom: 0;',
            '  height: 82%;',
            '  max-height: 560px;',
            '  z-index: 10;',
            '  pointer-events: none;',
            '  filter: drop-shadow(0 0 25px rgba(0,0,0,0.85));',
            '  transition: transform 0.4s ease;',
            '}',
            '',
            '/* Panel de Diálogos y Pistas del Dr. Moreno */',
            '#ha-dialogue-panel {',
            '  position: absolute;',
            '  bottom: 24px;',
            '  left: 280px;',
            '  right: 28px;',
            '  background: linear-gradient(135deg, rgba(8, 22, 16, 0.95), rgba(4, 14, 10, 0.95));',
            '  border: 2px solid rgba(46, 204, 113, 0.55);',
            '  border-radius: 8px;',
            '  padding: 1.1rem 1.4rem;',
            '  box-shadow: 0 10px 35px rgba(0,0,0,0.9), 0 0 25px rgba(46, 204, 113, 0.2);',
            '  backdrop-filter: blur(10px);',
            '  z-index: 15;',
            '  box-sizing: border-box;',
            '}',
            '.ha-doc-badge {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.85rem;',
            '  font-weight: 900;',
            '  color: #2ecc71;',
            '  letter-spacing: 1.5px;',
            '  margin-bottom: 0.5rem;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '}',
            '.ha-doc-text {',
            '  font-size: 0.95rem;',
            '  line-height: 1.5;',
            '  color: #e2e8f0;',
            '  margin-bottom: 0.8rem;',
            '  min-height: 48px;',
            '}',
            '.ha-doc-clue-box {',
            '  background: rgba(0, 0, 0, 0.45);',
            '  border-left: 3px solid #feca57;',
            '  padding: 0.6rem 0.9rem;',
            '  border-radius: 0 4px 4px 0;',
            '  font-size: 0.92rem;',
            '  color: #fef08a;',
            '  margin-bottom: 0.8rem;',
            '}',
            '.ha-dialogue-actions {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  flex-wrap: wrap;',
            '  gap: 0.8rem;',
            '}',
            '',
            '/* Botón Principal para Abrir Secuenciador */',
            '.ha-btn-open-dna {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.92rem;',
            '  font-weight: 700;',
            '  letter-spacing: 1.5px;',
            '  padding: 0.75rem 1.8rem;',
            '  background: linear-gradient(135deg, #27ae60, #2ecc71);',
            '  color: #03140a;',
            '  border: none;',
            '  border-radius: 5px;',
            '  cursor: pointer;',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.45);',
            '  transition: all 0.25s;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 0.5rem;',
            '  animation: ha-pulse-btn 2s infinite alternate;',
            '}',
            '@keyframes ha-pulse-btn {',
            '  from { box-shadow: 0 0 15px rgba(46, 204, 113, 0.4); }',
            '  to   { box-shadow: 0 0 30px rgba(46, 204, 113, 0.8); transform: translateY(-1px); }',
            '}',
            '.ha-btn-open-dna:hover {',
            '  background: linear-gradient(135deg, #2ecc71, #55efc4);',
            '  transform: scale(1.02);',
            '}',
            '',
            '/* Barra de ADN en el Centro Superior */',
            '#ha-progress-container {',
            '  position: absolute;',
            '  top: 18px;',
            '  left: 50%;',
            '  transform: translateX(-50%);',
            '  background: rgba(3, 10, 7, 0.92);',
            '  border: 1.5px solid rgba(46, 204, 113, 0.5);',
            '  border-radius: 6px;',
            '  padding: 0.6rem 1.2rem;',
            '  min-width: 380px;',
            '  box-shadow: 0 8px 30px rgba(0,0,0,0.8);',
            '  z-index: 15;',
            '  text-align: center;',
            '}',
            '#ha-dna-bar-bg {',
            '  height: 14px;',
            '  background: rgba(255,255,255,0.1);',
            '  border-radius: 7px;',
            '  overflow: hidden;',
            '  margin-top: 6px;',
            '  box-shadow: inset 0 2px 4px rgba(0,0,0,0.7);',
            '}',
            '#ha-dna-bar-fill {',
            '  height: 100%;',
            '  width: 0%;',
            '  background: linear-gradient(90deg, #2ecc71, #00d2d3, #a55eea);',
            '  box-shadow: 0 0 12px #2ecc71;',
            '  transition: width 0.4s ease-out;',
            '}',
            '',
            '/* Modal del Banco de ADN (Cuadrícula de Tarjetas Scan) */',
            '#ha-dna-modal {',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(2, 6, 4, 0.94);',
            '  backdrop-filter: blur(12px);',
            '  display: none;',
            '  flex-direction: column;',
            '  z-index: 50;',
            '  padding: 1.2rem;',
            '  box-sizing: border-box;',
            '}',
            '#ha-dna-modal.open { display: flex; animation: ha-pop 0.25s ease-out; }',
            '@keyframes ha-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }',
            '.ha-modal-top {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  margin-bottom: 0.8rem;',
            '  flex-wrap: wrap;',
            '  gap: 0.8rem;',
            '}',
            '.ha-modal-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 1.2rem;',
            '  color: #2ecc71;',
            '  font-weight: 900;',
            '  letter-spacing: 1.5px;',
            '}',
            '.ha-search-input {',
            '  background: rgba(255,255,255,0.08);',
            '  border: 1px solid rgba(46,204,113,0.4);',
            '  color: #fff;',
            '  font-family: "Share Tech Mono", monospace;',
            '  font-size: 0.95rem;',
            '  padding: 6px 14px;',
            '  border-radius: 4px;',
            '  min-width: 240px;',
            '}',
            '.ha-search-input:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 12px rgba(46,204,113,0.6); }',
            '.ha-cards-grid {',
            '  flex: 1;',
            '  overflow-y: auto;',
            '  display: grid;',
            '  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));',
            '  gap: 12px;',
            '  padding: 0.5rem;',
            '  box-sizing: border-box;',
            '}',
            '.ha-scan-card {',
            '  background: rgba(10, 24, 18, 0.85);',
            '  border: 1.5px solid rgba(46, 204, 113, 0.35);',
            '  border-radius: 6px;',
            '  padding: 6px;',
            '  display: flex;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  cursor: pointer;',
            '  transition: all 0.2s;',
            '  box-shadow: 0 4px 12px rgba(0,0,0,0.6);',
            '}',
            '.ha-scan-card:hover {',
            '  transform: translateY(-3px);',
            '  border-color: #2ecc71;',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.6);',
            '  background: rgba(20, 48, 36, 0.95);',
            '}',
            '.ha-scan-img {',
            '  width: 100%;',
            '  aspect-ratio: 1 / 1;',
            '  object-fit: cover;',
            '  border-radius: 4px;',
            '  background: #010a04;',
            '}',
            '.ha-scan-name {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.72rem;',
            '  font-weight: 700;',
            '  color: #e2e8f0;',
            '  margin-top: 6px;',
            '  text-align: center;',
            '  text-transform: uppercase;',
            '  letter-spacing: 0.5px;',
            '}',
            '',
            '/* Pantalla de Nacimiento (Birth) */',
            '#ha-birth-overlay {',
            '  position: absolute;',
            '  inset: 0;',
            '  z-index: 30;',
            '  display: none;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  justify-content: center;',
            '  background: rgba(0,0,0,0.5);',
            '  backdrop-filter: blur(2px);',
            '}',
            '#ha-birth-overlay.show { display: flex; animation: ha-pop 0.4s ease-out; }',
            '#ha-creature-img {',
            '  max-height: 48vh;',
            '  max-width: 85vw;',
            '  object-fit: contain;',
            '  filter: drop-shadow(0 0 35px rgba(46,204,113,0.7));',
            '  animation: ha-birth-emerge 1.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);',
            '}',
            '@keyframes ha-birth-emerge {',
            '  from { transform: scale(0.6) translateY(40px); opacity: 0; }',
            '  to   { transform: scale(1) translateY(0); opacity: 1; }',
            '}',
            '.ha-birth-card {',
            '  background: rgba(6, 20, 14, 0.94);',
            '  border: 2px solid #2ecc71;',
            '  border-radius: 8px;',
            '  padding: 1rem 2rem;',
            '  margin-top: 1rem;',
            '  text-align: center;',
            '  box-shadow: 0 0 35px rgba(46,204,113,0.5);',
            '}',
            '.ha-birth-title {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 1.5rem;',
            '  font-weight: 900;',
            '  color: #2ecc71;',
            '  letter-spacing: 2px;',
            '}',
            '.ha-birth-role {',
            '  font-size: 0.88rem;',
            '  color: #feca57;',
            '  margin: 0.4rem 0 1rem;',
            '}',
            '',
            '/* Modales de Inicio, Error y Victoria */',
            '.ha-modal-screen {',
            '  position: absolute;',
            '  inset: 0;',
            '  z-index: 60;',
            '  background: rgba(2, 6, 4, 0.94);',
            '  backdrop-filter: blur(10px);',
            '  display: none;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 1.5rem;',
            '}',
            '.ha-modal-screen.show { display: flex; animation: ha-pop 0.3s ease-out; }',
            '.ha-card-box {',
            '  background: linear-gradient(135deg, rgba(14, 30, 22, 0.98), rgba(6, 16, 12, 0.98));',
            '  border: 2px solid rgba(46, 204, 113, 0.6);',
            '  border-radius: 8px;',
            '  padding: 2rem 2.5rem;',
            '  max-width: 660px;',
            '  width: 92%;',
            '  box-shadow: 0 0 45px rgba(46, 204, 113, 0.4);',
            '  text-align: center;',
            '}',
            '.ha-modal-btn {',
            '  font-family: "Orbitron", sans-serif;',
            '  font-size: 0.95rem;',
            '  font-weight: 700;',
            '  letter-spacing: 1.5px;',
            '  padding: 0.85rem 2.5rem;',
            '  border: none;',
            '  border-radius: 4px;',
            '  cursor: pointer;',
            '  background: linear-gradient(135deg, #27ae60, #2ecc71);',
            '  color: #03140a;',
            '  box-shadow: 0 0 20px rgba(46, 204, 113, 0.45);',
            '  transition: all 0.25s;',
            '}',
            '.ha-modal-btn:hover { background: linear-gradient(135deg, #2ecc71, #55efc4); transform: scale(1.03); }',
            '.ha-modal-btn.red {',
            '  background: linear-gradient(135deg, #e74c3c, #c0392b);',
            '  color: #fff;',
            '  box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);',
            '}',
            '.ha-modal-btn.red:hover { background: linear-gradient(135deg, #ff6b6b, #e74c3c); }',
            '',
            '/* Responsive Móviles */',
            '@media (max-width: 768px) {',
            '  #ha-doctor-portrait { height: 42%; left: -30px; opacity: 0.65; }',
            '  #ha-dialogue-panel { left: 16px; right: 16px; bottom: 14px; padding: 0.9rem; }',
            '  #ha-progress-container { min-width: 280px; top: 10px; padding: 0.4rem 0.8rem; }',
            '  .ha-cards-grid { grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; }',
            '  .ha-scan-name { font-size: 0.62rem; }',
            '  .ha-card-box { padding: 1.2rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function buildOverlayDOM() {
        if (overlay) return;
        injectStyles();

        overlay = document.createElement('div');
        overlay.id = 'ha-overlay';

        // 1. Header
        var header = document.createElement('div');
        header.id = 'ha-header';
        header.innerHTML = [
            '<div class="ha-header-left">',
            '  <div class="ha-logo-badge">LABORATORIO INGEN MILITAR</div>',
            '  <div class="ha-header-title">🧬 PROYECTO QUIMERA // HIBRIDACIÓN DE ADN</div>',
            '</div>',
            '<div class="ha-header-status">',
            '  <div class="ha-hud-chip" id="ha-hud-stage" style="color:#00d2d3;">PROYECTO: 1/10</div>',
            '  <div class="ha-hud-chip" id="ha-hud-genes" style="color:#feca57;">ADN EMPALMADO: 0/2</div>',
            '</div>',
            '<div class="ha-header-btns ej-header-actions" id="ha-header-btns">',
            '  <button class="ej-btn-header" id="ha-btn-mute" title="Sonido"><span class="ej-ic">🔊</span><span class="ej-btn-lbl"> SONIDO</span></button>',
            '  <button class="ej-btn-header" id="ha-btn-pause" title="Pausar / Reanudar"><span class="ej-ic">⏸️</span><span class="ej-btn-lbl"> PAUSA</span></button>',
            '  <button class="ej-btn-header" id="ha-btn-full" title="Pantalla Completa"><span class="ej-ic">⛶</span><span class="ej-btn-lbl"> PANTALLA COMPLETA</span></button>',
            '  <button class="ej-btn-header ej-btn-header-danger" id="ha-btn-close" title="Cerrar"><span class="ej-ic">✕</span><span class="ej-btn-lbl"> CERRAR</span></button>',
            '</div>'
        ].join('');
        overlay.appendChild(header);

        // 2. Stage principal
        var stage = document.createElement('div');
        stage.id = 'ha-stage';

        // Barra de Progreso Superior
        var progBox = document.createElement('div');
        progBox.id = 'ha-progress-container';
        progBox.innerHTML = [
            '<div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#2ecc71; font-weight:700;">',
            '  <span id="ha-target-hybrid-name">HÍBRIDO: TANACONDA</span>',
            '  <span id="ha-dna-pct-text">0% ADN SINTETIZADO</span>',
            '</div>',
            '<div id="ha-dna-bar-bg"><div id="ha-dna-bar-fill"></div></div>'
        ].join('');
        stage.appendChild(progBox);

        // Retrato del Dr. Daniel Moreno
        var docImg = document.createElement('img');
        docImg.id = 'ha-doctor-portrait';
        docImg.alt = 'Dr. Daniel Moreno';
        docImg.src = 'Daniel Moreno.png';
        docImg.onerror = function () {
            if (docImg.src.indexOf('hibridaci') === -1) {
                docImg.src = 'hibridación de adn/Daniel Moreno.png';
            }
        };
        stage.appendChild(docImg);

        // Panel de Diálogos y Pistas
        var diagPanel = document.createElement('div');
        diagPanel.id = 'ha-dialogue-panel';
        diagPanel.innerHTML = [
            '<div class="ha-doc-badge">👨‍🔬 DR. DANIEL MORENO // GENETISTA JEFE MILITAR:</div>',
            '<div class="ha-doc-text" id="ha-doc-dialogue-text">Iniciando protocolo de hibridación...</div>',
            '<div class="ha-doc-clue-box" id="ha-doc-clue-text">Pista biológica...</div>',
            '<div class="ha-dialogue-actions">',
            '  <span id="ha-dna-slot-status" style="font-size:0.82rem; color:#94a3b8;">SELECCIÓN PENDIENTE</span>',
            '  <button class="ha-btn-open-dna" id="ha-btn-open-modal">📂 ABRIR BANCO DE ADN ▶</button>',
            '</div>'
        ].join('');
        stage.appendChild(diagPanel);

        // Capa de Nacimiento (Birth)
        var birthLayer = document.createElement('div');
        birthLayer.id = 'ha-birth-overlay';
        birthLayer.innerHTML = [
            '<img id="ha-creature-img" alt="Híbrido Nacido" src="" />',
            '<div class="ha-birth-card">',
            '  <div class="ha-birth-title" id="ha-birth-hybrid-name">TANACONDA</div>',
            '  <div class="ha-birth-role" id="ha-birth-hybrid-role">Bioarma de Combate</div>',
            '  <button class="ha-modal-btn" id="ha-btn-next-hybrid">SIGUIENTE HIBRIDACIÓN ▶</button>',
            '</div>'
        ].join('');
        stage.appendChild(birthLayer);

        overlay.appendChild(stage);

        // 3. Modal del Banco Genético
        var dnaModal = document.createElement('div');
        dnaModal.id = 'ha-dna-modal';
        dnaModal.innerHTML = [
            '<div class="ha-modal-top">',
            '  <div class="ha-modal-title">📂 BANCO GENÉTICO // SELECCIONA EL ADN SOLICITADO</div>',
            '  <div style="display:flex; align-items:center; gap:10px;">',
            '    <input type="text" class="ha-search-input" id="ha-search-box" placeholder="🔍 Filtrar espécimen..." />',
            '    <button class="ha-close-btn" id="ha-btn-close-modal">✕ CERRAR</button>',
            '  </div>',
            '</div>',
            '<div class="ha-cards-grid" id="ha-cards-grid"></div>'
        ].join('');
        overlay.appendChild(dnaModal);

        // 4. Modal de Inicio (Briefing)
        var briefScreen = document.createElement('div');
        briefScreen.className = 'ha-modal-screen show';
        briefScreen.id = 'ha-modal-briefing';
        briefScreen.innerHTML = [
            '<div class="ha-card-box">',
            '  <div style="font-family:Orbitron,sans-serif; font-size:1.45rem; font-weight:900; color:#2ecc71; margin-bottom:0.8rem;">🧬 PROYECTO QUIMERA: BIOARMAS INGEN</div>',
            '  <div style="font-size:0.9rem; color:#cbd5e1; line-height:1.6; margin-bottom:1.4rem; text-align:left;">',
            '    El <strong>Dr. Daniel Moreno</strong> ha sido contratado por altos mandos del ejército para un proyecto de máxima confidencialidad: sintetizar <strong>10 criaturas híbridas</strong> con capacidades bélicas sobrehumanas combinando cadenas de ADN prehistórico y moderno.<br><br>',
            '    • <strong>Atento a las pistas:</strong> El Dr. Moreno no dirá el nombre directo de las especies, sino descripciones biológicas y anatómicas de lo que necesita.<br>',
            '    • <strong>Banco Genético:</strong> Despliega el secuenciador y elige con exactitud el ADN requerido.<br>',
            '    • <strong>Tolerancia Cero:</strong> Un empalme genético erróneo desestabilizará el embrión y se perderá la muestra.<br>',
            '    • <strong>Cámara de Incubación:</strong> El fondo avanzará conforme se sinteticen los genes hasta culminar en la cámara de nacimiento.',
            '  </div>',
            '  <button class="ha-modal-btn" id="ha-btn-start">COMENZAR HIBRIDACIONES ▶</button>',
            '</div>'
        ].join('');
        overlay.appendChild(briefScreen);

        // 5. Modal de Error / Incompatibilidad
        var errScreen = document.createElement('div');
        errScreen.className = 'ha-modal-screen';
        errScreen.id = 'ha-modal-error';
        errScreen.innerHTML = [
            '<div class="ha-card-box" style="border-color:#e74c3c; box-shadow:0 0 50px rgba(231,76,60,0.5);">',
            '  <div style="font-family:Orbitron,sans-serif; font-size:1.4rem; font-weight:900; color:#e74c3c; margin-bottom:0.8rem;">☠️ ¡FALLO DE EMPALME GENÉTICO!</div>',
            '  <div style="font-size:0.92rem; color:#cbd5e1; line-height:1.6; margin-bottom:1.5rem;" id="ha-error-msg">',
            '    El ADN seleccionado resultó incompatible con la cadena celular. El embrión ha colapsado.',
            '  </div>',
            '  <div class="ej-modal-actions">',
  '    <button class="ej-btn-replay" id="ha-btn-retry">↺ Volver a jugar</button>',
  '    <button class="ej-btn-return" id="ha-btn-err-return">✕ Regresar al sitio</button>',
  '  </div>',
            '</div>'
        ].join('');
        overlay.appendChild(errScreen);

        // 6. Modal de Victoria Final (10/10)
        var winScreen = document.createElement('div');
        winScreen.className = 'ha-modal-screen';
        winScreen.id = 'ha-modal-win';
        winScreen.innerHTML = [
            '<div class="ha-card-box" style="border-color:#2ecc71; box-shadow:0 0 50px rgba(46,204,113,0.6);">',
            '  <div style="font-family:Orbitron,sans-serif; font-size:1.5rem; font-weight:900; color:#2ecc71; margin-bottom:0.8rem;">🏆 ¡PROYECTO QUIMERA COMPLETADO!</div>',
            '  <div style="font-size:0.92rem; color:#cbd5e1; line-height:1.6; margin-bottom:1.5rem;">',
            '    ¡Excelente labor científica! Los 10 híbridos han sido sintetizados con éxito para el ejército, culminando con la creación del imparable <strong>Ultimasaurus</strong>. El Dr. Daniel Moreno ha quedado plenamente impresionado con tu destreza genética.',
            '  </div>',
            '  <div class="ej-modal-actions">',
  '    <button class="ej-btn-replay" id="ha-btn-win-restart">↺ Volver a jugar</button>',
  '    <button class="ej-btn-return" id="ha-btn-win-return">✕ Regresar al sitio</button>',
  '  </div>',
            '</div>'
        ].join('');
        overlay.appendChild(winScreen);

        var pauseModal = document.createElement('div');
        pauseModal.className = 'ej-pause-overlay';
        pauseModal.id = 'ha-pause-screen';
        pauseModal.style.display = 'none';
        pauseModal.innerHTML = [
            '<div class="ej-pause-card">',
            '  <div class="ej-pause-title">⏸️ JUEGO EN PAUSA</div>',
            '  <div class="ej-pause-sub">Laboratorio de hibridación en pausa</div>',
            '  <button class="ej-btn-resume" id="ha-btn-resume">▶ REANUDAR</button>',
            '</div>'
        ].join('');
        overlay.appendChild(pauseModal);


        document.body.appendChild(overlay);

        // Llenar cuadrícula de tarjetas del Banco de ADN
        renderGeneticCards();

        // Eventos de botones
        document.getElementById('ha-btn-close').addEventListener('click', closeGame);
        var haWinRet = document.getElementById('ha-btn-win-return');
        if (haWinRet) haWinRet.addEventListener('click', closeGame);
        var haErrRet = document.getElementById('ha-btn-err-return');
        if (haErrRet) haErrRet.addEventListener('click', closeGame);
        var haPauseBtn = document.getElementById('ha-btn-pause');
        if (haPauseBtn) haPauseBtn.addEventListener('click', togglePause);
        var haResumeBtn = document.getElementById('ha-btn-resume');
        if (haResumeBtn) haResumeBtn.addEventListener('click', togglePause);
        document.getElementById('ha-btn-start').addEventListener('click', startHybridization);
        document.getElementById('ha-btn-open-modal').addEventListener('click', openDNAModal);
        document.getElementById('ha-btn-close-modal').addEventListener('click', closeDNAModal);
        document.getElementById('ha-btn-next-hybrid').addEventListener('click', nextHybrid);
        document.getElementById('ha-btn-retry').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('hibridacion-adn');
            retryCurrentHybrid();
        });
        document.getElementById('ha-btn-win-restart').addEventListener('click', function () {
            if (window.registerMinigameAttempt) window.registerMinigameAttempt('hibridacion-adn');
            restartAll();
        });

        document.getElementById('ha-search-box').addEventListener('input', function (e) {
            searchQuery = e.target.value.toLowerCase().trim();
            renderGeneticCards();
        });

        document.getElementById('ha-btn-mute').addEventListener('click', function () {
            isMuted = !isMuted;
            this.textContent = isMuted ? '🔇' : '🔊';
            if (isMuted) {
                if (sndMusic) sndMusic.pause();
                if (currentRoar) currentRoar.pause();
            } else {
                if (sndMusic && state !== 'briefing') sndMusic.play().catch(function () {});
            }
        });

        document.getElementById('ha-btn-full').addEventListener('click', toggleFullscreen);

        // Tecla ESC para salir
        window.addEventListener('keydown', function (e) {
            if (!overlay || !overlay.classList.contains('open')) return;
            if (e.key === 'Escape') {
                var modal = document.getElementById('ha-dna-modal');
                if (modal && modal.classList.contains('open')) closeDNAModal();
                else closeGame();
            }
        });
    }

    function toggleFullscreen() {
        var target = overlay || document.documentElement;
        var btn = document.getElementById('ha-btn-full');
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (target.requestFullscreen) target.requestFullscreen().catch(function () {});
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            if (btn) btn.textContent = '🗗';
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            if (btn) btn.textContent = '⛶';
        }
    }

    // ------------------------------------------------------------
    // 6. RENDERIZADO DEL BANCO DE ADN (TARJETAS SCAN)
    // ------------------------------------------------------------
    function renderGeneticCards() {
        var grid = document.getElementById('ha-cards-grid');
        if (!grid) return;
        grid.innerHTML = '';

        var filtered = GENETIC_CATALOG.filter(function (sp) {
            if (searchQuery && sp.name.toLowerCase().indexOf(searchQuery) === -1) return false;
            return true;
        });

        filtered.forEach(function (sp) {
            var card = document.createElement('div');
            card.className = 'ha-scan-card';
            card.setAttribute('data-gene-id', sp.id);
            card.innerHTML = [
                '<img class="ha-scan-img" src="' + sp.file + '" onerror="if(this.src.indexOf(\'hibridaci\')===-1)this.src=\'hibridación de adn/' + sp.file + '\';" alt="' + sp.name + '" loading="lazy" />',
                '<div class="ha-scan-name">' + sp.name + '</div>'
            ].join('');

            card.addEventListener('pointerdown', function (e) {
                if (e.cancelable) e.preventDefault();
                handleSpeciesSelected(sp);
            });
            card.addEventListener('click', function () {
                handleSpeciesSelected(sp);
            });

            grid.appendChild(card);
        });
    }

    function openDNAModal() {
        document.getElementById('ha-search-box').value = '';
        searchQuery = '';
        renderGeneticCards();
        document.getElementById('ha-dna-modal').classList.add('open');
        playTone(520, 0.15, 'triangle', 0.2);
    }

    function closeDNAModal() {
        document.getElementById('ha-dna-modal').classList.remove('open');
    }

    // ------------------------------------------------------------
    // 7. MECÁNICA DE HIBRIDACIÓN Y EVALUACIÓN
    // ------------------------------------------------------------
    function loadHybridStep() {
        var h = HYBRIDS[currentHybridIdx];
        var totalGenes = h.genes.length;
        var stepData = h.genes[currentGeneStep];

        // Actualizar HUD superior
        document.getElementById('ha-hud-stage').textContent = 'HÍBRIDO: ' + (currentHybridIdx + 1) + '/' + HYBRIDS.length;
        document.getElementById('ha-hud-genes').textContent = 'ADN EMPALMADO: ' + currentGeneStep + '/' + totalGenes;
        document.getElementById('ha-target-hybrid-name').textContent = 'PROYECTO: ' + h.name.toUpperCase();

        // Actualizar porcentaje
        var pct = Math.round((currentGeneStep / totalGenes) * 100);
        document.getElementById('ha-dna-bar-fill').style.width = pct + '%';
        document.getElementById('ha-dna-pct-text').textContent = pct + '% ADN SINTETIZADO';

        // Actualizar Fondo del Laboratorio según el avance
        var stage = document.getElementById('ha-stage');
        if (pct < 50) {
            stage.style.backgroundImage = 'url("Fondo CE1.jpg")';
        } else {
            stage.style.backgroundImage = 'url("Fondo CE2.jpg")';
        }

        // Diálogo y pista del Dr. Moreno
        document.getElementById('ha-doc-dialogue-text').textContent = (currentGeneStep === 0 ?
            'Iniciando secuencia de incubación para ' + h.name + '. ' + h.role + '.' :
            '¡Empalme celular estabilizado! Procediendo al siguiente eslabón del genoma.'
        );
        document.getElementById('ha-doc-clue-text').textContent = '📋 PISTA DEL DR. MORENO: ' + stepData.clue;
        document.getElementById('ha-dna-slot-status').textContent = 'PASO ' + (currentGeneStep + 1) + ' DE ' + totalGenes;

        // Ocultar capa de nacimiento
        document.getElementById('ha-birth-overlay').classList.remove('show');
    }

    function handleSpeciesSelected(sp) {
        closeDNAModal();
        var h = HYBRIDS[currentHybridIdx];
        var expectedGene = h.genes[currentGeneStep];

        if (sp.id === expectedGene.targetId) {
            // ¡ACIERTO!
            playSuccessSplice();
            currentGeneStep++;
            var totalGenes = h.genes.length;

            if (currentGeneStep >= totalGenes) {
                // ¡HÍBRIDO 100% COMPLETADO!
                handleHybridBirth();
            } else {
                // Siguiente gen
                loadHybridStep();
            }
        } else {
            // ¡ERROR! Incompatibilidad genética
            handleGeneticFailure(sp.name);
        }
    }

    function handleHybridBirth() {
        var h = HYBRIDS[currentHybridIdx];
        state = 'birth';

        // Fondo Birth.jpg
        var stage = document.getElementById('ha-stage');
        stage.style.backgroundImage = 'url("Birth.jpg")';

        // Barra al 100%
        document.getElementById('ha-dna-bar-fill').style.width = '100%';
        document.getElementById('ha-dna-pct-text').textContent = '100% - ¡ESPECIE VIABLE!';

        // Mostrar criatura híbrida
        var creatureImg = document.getElementById('ha-creature-img');
        creatureImg.src = h.img;
        creatureImg.onerror = function () {
            if (creatureImg.src.indexOf('hibridaci') === -1) {
                creatureImg.src = 'hibridación de adn/' + h.img;
            }
        };

        document.getElementById('ha-birth-hybrid-name').textContent = h.name.toUpperCase();
        document.getElementById('ha-birth-hybrid-role').textContent = h.role;
        document.getElementById('ha-birth-overlay').classList.add('show');

        // Reproducir rugido característico
        playHybridRoar(h.roar);

        // Si es el último (Ultimasaurus), cambiar texto de botón
        var nextBtn = document.getElementById('ha-btn-next-hybrid');
        if (currentHybridIdx + 1 >= HYBRIDS.length) {
            nextBtn.textContent = 'FINALIZAR PROYECTO MILITAR 🏆';
        } else {
            nextBtn.textContent = 'SIGUIENTE HIBRIDACIÓN ▶';
        }
    }

    function handleGeneticFailure(wrongSpeciesName) {
        state = 'error';
        playErrorBuzzer();
        var msg = 'El ADN de <strong>' + wrongSpeciesName + '</strong> no corresponde a la secuencia requerida. La estructura cromosómica colapsó y la muestra se ha desintegrado.';
        document.getElementById('ha-error-msg').innerHTML = msg;
        document.getElementById('ha-modal-error').classList.add('show');
    }

    function nextHybrid() {
        document.getElementById('ha-birth-overlay').classList.remove('show');
        if (currentRoar) {
            try { currentRoar.pause(); } catch (e) {}
        }

        if (currentHybridIdx + 1 >= HYBRIDS.length) {
            // ¡VICTORIA TOTAL!
            state = 'victory';
            document.getElementById('ha-modal-win').classList.add('show');
        } else {
            currentHybridIdx++;
            currentGeneStep = 0;
            state = 'playing';
            loadHybridStep();
        }
    }

    function retryCurrentHybrid() {
        document.getElementById('ha-modal-error').classList.remove('show');
        currentGeneStep = 0;
        state = 'playing';
        loadHybridStep();
    }

    function restartAll() {
        document.getElementById('ha-modal-win').classList.remove('show');
        currentHybridIdx = 0;
        currentGeneStep = 0;
        state = 'playing';
        loadHybridStep();
    }

    
    function togglePause() {
        if (!overlay || !overlay.classList.contains('open')) return;
        isPaused = !isPaused;
        var btnPause = document.getElementById('ha-btn-pause');
        var pauseScreen = document.getElementById('ha-pause-screen');
        if (isPaused) {
            if (sndMusic) try { sndMusic.pause(); } catch (e) {}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '▶';
                if (lbl) lbl.textContent = ' REANUDAR';
            }
            if (pauseScreen) pauseScreen.style.display = 'flex';
        } else {
            if (sndMusic && !isMuted) try { sndMusic.play().catch(function(){}); } catch (e) {}
            if (btnPause) {
                var ic = btnPause.querySelector('.ej-ic');
                var lbl = btnPause.querySelector('.ej-btn-lbl');
                if (ic) ic.textContent = '⏸️';
                if (lbl) lbl.textContent = ' PAUSA';
            }
            if (pauseScreen) pauseScreen.style.display = 'none';
        }
    }

    function startHybridization() {
        document.getElementById('ha-modal-briefing').classList.remove('show');
        initAudio();
        if (sndMusic && !isMuted) {
            sndMusic.currentTime = 0;
            sndMusic.play().catch(function () {});
        }
        currentHybridIdx = 0;
        currentGeneStep = 0;
        state = 'playing';
        loadHybridStep();
    }

    function openGame() {
        buildOverlayDOM();

        // Pausar música de fondo del sitio
        if (window.interruptBgMusic) {
            window.interruptBgMusic();
        }

        overlay.classList.add('open');
        document.getElementById('ha-modal-briefing').classList.add('show');
        document.getElementById('ha-modal-error').classList.remove('show');
        document.getElementById('ha-modal-win').classList.remove('show');
        document.getElementById('ha-birth-overlay').classList.remove('show');

        state = 'briefing';
        currentHybridIdx = 0;
        currentGeneStep = 0;
    }

    function closeGame() {
        if (!overlay) return;
        overlay.classList.remove('open');
        stopAllAudio();

        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }

        // Reanudar música ambiental del sitio
        if (window.releaseBgMusic) {
            window.releaseBgMusic();
        }
    }

    // ------------------------------------------------------------
    // 8. EXPOSICIÓN GLOBAL
    // ------------------------------------------------------------
    window.openHibridacionADN = openGame;
    window.closeHibridacionADN = closeGame;

})();
