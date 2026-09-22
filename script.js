// =============================================
//  EXPEDIENTES JURÁSICOS — script.js
// =============================================

// Merge all species parts (defined in separate JS files)
var ALL_SPECIES = [].concat(SPECIES_PART1, SPECIES_PART2, SPECIES_PART3);

// Image map: species name → local filename
var IMG_MAP = {
    "Acrocanthosaurus":    "Acrocanthosaurus.png",
    "Albertosaurus":       "Albertosaurus.png",
    "Allosaurus":          "Allosaurus.png",
    "Amargasaurus":        "Amargasaurus.png",
    "Ankylosaurus":        "Ankylosaurus.png",
    "Baryonyx":            "Baryonyx.png",
    "Brachiosaurus":       "Brachiosaurus.png",
    "Carnotaurus":         "Carnotaurus.png",
    "Cearadactylus":       "Cearadactylus.png",
    "Ceratosaurus":        "Ceratosaurus.png",
    "Chasmosaurus":        "Chasmosaurus.png",
    "Coelurosauravus":     "Coelurosauravus.png",
    "Compsognathus":       "Compsognathus.png",
    "Concavenator":        "Concavenator.png",
    "Corythosaurus":       "Corythosaurus.png",
    "Cryolophosaurus":     "Cryolophosaurus.png",
    "Deinosuchus":         "Deinosuchus.png",
    "Diabloceratops":      "Diabloceratops.png",
    "Dilophosaurus":       "Dilophosaurus.png",
    "Dimetrodon":          "Dimetrodon.png",
    "Diplodocus":          "Diplodocus.png",
    "Dracorex":            "Dracorex.png",
    "Dryosaurus":          "Dryosaurus.png",
    "Edmontosaurus":       "Edmontosaurus.png",
    "Elasmosaurus":        "Elasmosaurus.png",
    "Euoplocephalus":      "Euoplocephalus.png",
    "Gallimimus":          "Gallimimus.png",
    "Geosternbergia":      "Geosternbergia.png",
    "Giganotosaurus":      "Giganotosaurus.png",
    "Gorgonopsid":         "Gorgonopsid.png",
    "Herrerasaurus":       "Herrerasaurus.png",
    "Hypsilophodon":       "Hypsilophodon.png",
    "Liopleurodon":        "Liopleurodon.png",
    "Maiasaura":           "Maiasaura.png",
    "Mamenchisaurus":      "Mamenchisaurus.png",
    "Metriacanthosaurus":  "Metriacanthosaurus.png",
    "Microceratus":        "Microceratus.png",
    "Microraptor":         "Microraptor.png",
    "Ornithocheirus":      "Ornithocheirus.png",
    "Ornithomimus":        "Ornithomimus.png",
    "Pachycephalosaurus":  "Pachycephalosaurus.png",
    "Pachyrhinosaurus":    "Pachyrhinosaurus.png",
    "Parasaurolophus":     "Parasaurolophus.png",
    "Plateosaurus":        "Plateosaurus.png",
    "Plesiosaurus":        "Plesiosaurus.png",
    "Proceratosaurus":     "Proceratosaurus.png",
    "Pteranodon":          "Pteranodon.png",
    "Quetzalcoatlus":      "Quetzalcoatlus.png",
    "Scutosaurus":         "Scutosaurus.png",
    "Segisaurus":          "Segisaurus.png",
    "Spinosaurus":         "Spinosaurus.png",
    "Stegosaurus":         "Stegosaurus.png",
    "Stygimoloch":         "Stygimoloch.png",
    "Styracosaurus":       "Styracosaurus.png",
    "Suchomimus":          "Suchomimus.png",
    "Tanystropheus":       "Tanystropheus.png",
    "Tapejara":            "Tapejara.png",
    "Therizinosaurus":     "Therizinosaurus.png",
    "Torosaurus":          "Torosaurus.png",
    "Triceratops":         "Triceratops.png",
    "Troodon":             "Troodon.png",
    "Tylosaurus":          "Tylosaurus.png",
    "Tyrannosaurus Rex":   "Tyrannosaurus Rex.png",
    "Ultimate Predator (Híbrido)": null,
    "Utahraptor":          "Utahraptor.png",
    "Velociraptor":        "Velociraptor.png"
};

function getImg(name) {
    return IMG_MAP[name] || null;
}

function dietClass(diet) {
    return 'diet-' + diet;
}

// ---- INCIDENT ACCORDION ----
window.toggleIncident = function(id) {
    var body = document.getElementById('body-' + id);
    var toggle = document.getElementById('toggle-' + id);
    if (!body) return;
    var isOpen = body.classList.contains('open');
    // Close all first
    document.querySelectorAll('.incident-body.open').forEach(function(el) {
        el.classList.remove('open');
        var t = document.getElementById('toggle-' + el.id.replace('body-',''));
        if (t) t.textContent = '▼';
    });
    // Open clicked if it was closed
    if (!isOpen) {
        body.classList.add('open');
        if (toggle) toggle.textContent = '▲';
    }
};

// ---- BUILD TIMELINE ----
function buildTimeline() {
    var container = document.getElementById('timeline-container');
    if (!container || typeof CRONOLOGIA === 'undefined') return;
    container.innerHTML = '';
    CRONOLOGIA.forEach(function(entry, idx) {
        var isCritical = entry.severity === 'critical';
        var isWarning  = entry.severity === 'warning';
        var card = document.createElement('div');
        card.className = 'tl-card' + (isCritical ? ' tl-card--critical' : isWarning ? ' tl-card--warning' : '');
        card.id = 'tl-card-' + idx;
        card.innerHTML =
            '<div class="tl-card-header" onclick="toggleTimeline(' + idx + ')">' +
                '<div class="tl-card-year' + (isCritical ? ' tl-year--red' : isWarning ? ' tl-year--amber' : '') + '">' + entry.year + '</div>' +
                '<div class="tl-card-title">' + entry.title + '</div>' +
                '<div class="tl-card-toggle" id="tltoggle-' + idx + '">▼</div>' +
            '</div>' +
            '<div class="tl-card-body" id="tl-body-' + idx + '">' +
                '<div class="tl-card-body-inner">' + entry.content + '</div>' +
            '</div>';
        container.appendChild(card);
    });
}

window.toggleTimeline = function(idx) {
    var body = document.getElementById('tl-body-' + idx);
    var toggle = document.getElementById('tltoggle-' + idx);
    if (!body) return;
    var isOpen = body.classList.contains('open');
    document.querySelectorAll('.tl-card-body.open').forEach(function(el) {
        el.classList.remove('open');
        var i = el.id.replace('tl-body-','');
        var t = document.getElementById('tltoggle-' + i);
        if (t) t.textContent = '▼';
    });
    if (!isOpen) {
        body.classList.add('open');
        if (toggle) toggle.textContent = '▲';
    }
};

// ---- BUILD SPECIES CARDS ----
function buildCards(list) {
    var grid = document.getElementById('species-grid');
    grid.innerHTML = '';
    if (!list.length) {
        grid.innerHTML = '<div style="color:var(--text2);font-family:var(--font-mono);font-size:.8rem;grid-column:1/-1;text-align:center;padding:3rem">⚠ SIN RESULTADOS PARA ESE FILTRO</div>';
        return;
    }
    list.forEach(function(sp) {
        var img = getImg(sp.name);
        var imgHTML = img
            ? '<img class="species-img" src="' + img + '" alt="' + sp.name + '" loading="lazy" onerror="this.style.display=\'none\'">'
            : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;color:rgba(255,255,255,0.1);">' + (sp.emoji || '🦖') + '</div>';

        var card = document.createElement('div');
        card.className = 'species-card';
        card.setAttribute('data-diet', sp.diet);
        card.setAttribute('data-name', sp.name.toLowerCase());
        card.setAttribute('data-key', sp.key);
        card.innerHTML =
            '<div class="species-img-wrap">' +
                imgHTML +
                '<span class="species-diet-badge ' + dietClass(sp.diet) + '">' + sp.dietLabel + '</span>' +
            '</div>' +
            '<div class="species-info">' +
                '<div class="species-key">' + sp.key + '</div>' +
                '<div class="species-name">' + sp.emoji + ' ' + sp.name + '</div>' +
                '<div class="species-family">' + sp.family + '</div>' +
                '<div class="species-ingen">' + sp.ingen + '</div>' +
            '</div>' +
            '<div class="species-card-footer">VER FICHA COMPLETA →</div>';

        card.addEventListener('click', function() { openModal(sp); });
        grid.appendChild(card);
    });
    updateCount(list.length);
}

function updateCount(n) {
    var el = document.getElementById('species-count');
    if (el) el.textContent = n + ' DE ' + ALL_SPECIES.length + ' ESPECÍMENES';
}

// ---- FILTER & SEARCH ----
var currentFilter = 'all';
var currentSearch = '';

function applyFilters() {
    var filtered = ALL_SPECIES.filter(function(sp) {
        var matchDiet = currentFilter === 'all' || sp.diet === currentFilter;
        var matchSearch = currentSearch === '' || sp.name.toLowerCase().indexOf(currentSearch) !== -1;
        return matchDiet && matchSearch;
    });
    buildCards(filtered);
}

// Initial render
applyFilters();
buildTimeline();

document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        applyFilters();
    });
});

document.getElementById('species-search').addEventListener('input', function() {
    currentSearch = this.value.toLowerCase().trim();
    applyFilters();
});

// ---- MODAL ----
function openModal(sp) {
    var img = getImg(sp.name);
    var imgTag = img
        ? '<img class="modal-img" src="' + img + '" alt="' + sp.name + '" onerror="this.style.display=\'none\'">'
        : '<div class="modal-img" style="display:flex;align-items:center;justify-content:center;font-size:5rem;background:#0a1220;">' + (sp.emoji || '🦖') + '</div>';

    var inner = document.getElementById('modal-inner');
    // ---- Title row ----
    var titleHTML =
        '<div class="modal-title-row">' +
            '<div>' +
                '<div class="modal-name">' + sp.emoji + ' ' + sp.name + '</div>' +
                '<div class="modal-meta-row">' +
                    '<span class="modal-key">CÓDIGO: ' + sp.key + '</span>' +
                    '<span class="modal-meta-sep">|</span>' +
                    '<span class="modal-key">FAMILIA: ' + sp.family + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    // ---- Full-width image ----
    var imgHTML2 = img
        ? '<div class="modal-img-full"><img src="' + img + '" alt="' + sp.name + '" onerror="this.parentElement.style.display=\'none\'"></div>'
        : '<div class="modal-img-full modal-img-placeholder">' + (sp.emoji || '🦖') + '</div>';
    // ---- Stats grid (6 cells) ----
    var statsHTML =
        '<div class="modal-stats-grid">' +
            '<div class="stat-cell"><div class="stat-cell-label">DIETA</div><div class="stat-cell-val"><span class="modal-diet-badge ' + dietClass(sp.diet) + '">' + sp.dietLabel + '</span></div></div>' +
            '<div class="stat-cell"><div class="stat-cell-label">ALTURA</div><div class="stat-cell-val">' + sp.height + '</div></div>' +
            '<div class="stat-cell"><div class="stat-cell-label">LONGITUD</div><div class="stat-cell-val">' + sp.length + '</div></div>' +
            '<div class="stat-cell"><div class="stat-cell-label">PESO EST.</div><div class="stat-cell-val">' + sp.weight + '</div></div>' +
            '<div class="stat-cell"><div class="stat-cell-label">LOCALIZACIÓN</div><div class="stat-cell-val">' + sp.location + '</div></div>' +
            '<div class="stat-cell"><div class="stat-cell-label">CLAVE INGEN</div><div class="stat-cell-val modal-key-accent">' + sp.key + '</div></div>' +
        '</div>';
    // ---- Text sections ----
    var textHTML =
        '<div class="modal-section-label">DESCRIPCIÓN OFICIAL INGEN</div>' +
        '<div class="modal-ingen">' + sp.ingen + '</div>' +
        '<div class="modal-section-label">ANÁLISIS ADICIONAL</div>' +
        '<div class="modal-desc">' + sp.desc + '<br><br>' + sp.extra + '</div>';

    inner.innerHTML = titleHTML + imgHTML2 + statsHTML + textHTML;

    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

// ---- INCIDENT ACCORDIONS ----
['1993','1994','1996','2000','2001','2002'].forEach(function(yr) {
    var header = document.getElementById('incident-' + yr);
    var body = document.getElementById('body-' + yr);
    var toggle = document.getElementById('toggle-' + yr);
    if (!header || !body) return;
    header.querySelector('.incident-header').addEventListener('click', function() {
        var isOpen = body.classList.contains('open');
        // close all
        document.querySelectorAll('.incident-body').forEach(function(b) { b.classList.remove('open'); });
        document.querySelectorAll('.incident-toggle').forEach(function(t) { t.classList.remove('open'); });
        if (!isOpen) {
            body.classList.add('open');
            if (toggle) toggle.classList.add('open');
        }
    });
});

// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', function() {
    var nb = document.getElementById('navbar');
    if (window.scrollY > 60) {
        nb.style.background = 'rgba(5,8,16,0.98)';
    } else {
        nb.style.background = 'rgba(5,8,16,0.92)';
    }
});



// Animate stat counter
function animateCount(el, target, duration) {
    var start = 0;
    var step = Math.ceil(target / (duration / 30));
    var timer = setInterval(function() {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = start;
    }, 30);
}
var statEl = document.getElementById('stat-species');
if (statEl) {
    setTimeout(function() { animateCount(statEl, ALL_SPECIES.length, 800); }, 600);
}

// ---- LIVE CLOCK ----
var DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2,'0');
    var m = String(now.getMinutes()).padStart(2,'0');
    var s = String(now.getSeconds()).padStart(2,'0');
    var dayName = DAYS_ES[now.getDay()];
    var date = now.getDate();
    var month = MONTHS_ES[now.getMonth()];
    var year = now.getFullYear();
    var tEl = document.getElementById('clock-time');
    var dEl = document.getElementById('clock-date');
    if (tEl) tEl.textContent = h + ':' + m + ':' + s;
    if (dEl) dEl.textContent = dayName + ' ' + date + ' ' + month + ' ' + year;
}
updateClock();
setInterval(updateClock, 1000);

// ---- ACCESS PANEL ----
var SECRET = 'JUR@55!_H@K3R_NBSNMCF';
var accessInput = document.getElementById('access-input');
var accessBtn = document.getElementById('access-btn');
var feedback = document.getElementById('terminal-feedback');
var contestOverlay = document.getElementById('contest-overlay');
var contestClose = document.getElementById('contest-close');
var videoOverlay = document.getElementById('video-overlay');
var indominusVideo = document.getElementById('indominus-video');
var closeVideoBtn = document.getElementById('close-video');

function showCongratulations() {
    var glitchOverlay = document.getElementById('glitch-overlay');
    
    // Play a "closing" glitch effect on the video/overlay before switching
    if (videoOverlay) {
        videoOverlay.classList.add('final-glitch');
    }

    if (glitchOverlay) glitchOverlay.classList.add('active');

    setTimeout(function() {
        if (videoOverlay) {
            videoOverlay.classList.remove('open');
            videoOverlay.classList.remove('final-glitch');
        }
        if (indominusVideo) {
            indominusVideo.pause();
            indominusVideo.currentTime = 0;
        }
        if (glitchOverlay) glitchOverlay.classList.remove('active');
        
        if (contestOverlay) contestOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.body.classList.remove('screen-flicker');
    }, 800);
}

function tryAccess() {
    var val = accessInput ? accessInput.value.trim() : '';
    if (val === SECRET) {
        if (feedback) {
            feedback.textContent = '> ACCESO CONCEDIDO — Iniciando transmisión clasificada...';
            feedback.className = 'terminal-feedback feedback-ok';
        }
        setTimeout(function() {
            // Start flicker and glitch effects
            document.body.classList.add('screen-flicker');
            var glitchOverlay = document.getElementById('glitch-overlay');
            if (glitchOverlay) glitchOverlay.classList.add('active');

            setTimeout(function() {
                if (videoOverlay) {
                    videoOverlay.classList.add('open');
                    document.body.style.overflow = 'hidden';
                    if (indominusVideo) {
                        indominusVideo.play().catch(function(err) {
                            console.error("Error playing video:", err);
                            showCongratulations(); // Fallback if video fails
                        });
                    }
                } else {
                    showCongratulations();
                }
                // Stop the intense background glitch once video is on
                if (glitchOverlay) glitchOverlay.classList.remove('active');
            }, 1500); // 1.5s of flickering/glitching
        }, 800);
    } else if (val === '') {
        if (feedback) {
            feedback.textContent = '> ERROR: Campo de operativo vacío.';
            feedback.className = 'terminal-feedback feedback-err';
        }
    } else {
        if (feedback) {
            feedback.textContent = '> ACCESO DENEGADO — Credenciales no reconocidas. Intento registrado.';
            feedback.className = 'terminal-feedback feedback-err';
        }
        if (accessInput) accessInput.value = '';
    }
}

if (accessBtn) accessBtn.addEventListener('click', tryAccess);
if (accessInput) accessInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') tryAccess();
});

if (indominusVideo) {
    indominusVideo.addEventListener('ended', showCongratulations);
}

if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', showCongratulations);
}

if (contestClose) contestClose.addEventListener('click', function() {
    if (contestOverlay) contestOverlay.classList.remove('open');
    document.body.style.overflow = '';
});
if (contestOverlay) contestOverlay.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// ---- MOBILE NAV TOGGLE ----
var navToggle = document.getElementById('nav-toggle');
var navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            navLinks.classList.remove('open');
        });
    });
}

// =============================================
// ---- FICHAS DE HISTORIA ----
// =============================================
(function() {
    'use strict';

    var fichasGrid = document.getElementById('fichas-grid');
    if (!fichasGrid) return;
    if (typeof FICHAS === 'undefined') return;

    var currentCat = 'all';

    // Modal Elements
    var fichaModal = document.getElementById('ficha-modal');
    var fichaModalClose = document.getElementById('ficha-modal-close');
    var fichaModalTitle = document.getElementById('ficha-modal-title');
    var fichaModalBadge = document.getElementById('ficha-modal-badge');
    var fichaModalImg = document.getElementById('ficha-modal-img');
    var fichaModalImgWrap = document.getElementById('ficha-modal-img-wrap');
    var fichaToggleSide = document.getElementById('ficha-toggle-side');
    var fichaToggleText = document.getElementById('ficha-toggle-text');
    var fichaPrev = document.getElementById('ficha-prev');
    var fichaNext = document.getElementById('ficha-next');

    var fichaSoundBtn = document.getElementById('ficha-sound-btn');
    var fichaSoundText = document.getElementById('ficha-sound-text');
    var fichaAudioPlayer = document.getElementById('ficha-audio-player');
    var fichaVideoPlayer = document.getElementById('ficha-video-audio-player');
    var activeSoundFichaId = null;
    var isSoundPlaying = false;

    // Elementos de Narración de IA
    var fichaNarrateBtn = document.getElementById('ficha-narrate-btn');
    var fichaNarrateText = document.getElementById('ficha-narrate-text');
    var fichaNarratePlayer = document.getElementById('ficha-narrate-player');
    var activeNarrateFichaId = null;
    var isNarratePlaying = false;

    var currentFichaIndex = 0;
    var isShowingBack = false;

    function stopFichaSound() {
        if (fichaAudioPlayer) {
            try {
                fichaAudioPlayer.pause();
                fichaAudioPlayer.currentTime = 0;
            } catch(e) {}
        }
        if (fichaVideoPlayer) {
            try {
                fichaVideoPlayer.pause();
                fichaVideoPlayer.currentTime = 0;
            } catch(e) {}
        }
        isSoundPlaying = false;
        activeSoundFichaId = null;
        updateSoundButtonState(false);
        document.querySelectorAll('.ficha-sound-chip.playing').forEach(function(el) {
            el.classList.remove('playing');
            var icon = el.querySelector('.sound-chip-icon');
            if (icon) icon.textContent = '🔊';
        });
    }

    function stopFichaNarrate() {
        if (fichaNarratePlayer) {
            try {
                fichaNarratePlayer.pause();
                fichaNarratePlayer.currentTime = 0;
            } catch(e) {}
        }
        isNarratePlaying = false;
        activeNarrateFichaId = null;
        updateNarrateButtonState(false);
    }

    function updateSoundButtonState(playing) {
        if (!fichaSoundBtn) return;
        if (playing) {
            fichaSoundBtn.classList.add('playing');
            if (fichaSoundText) fichaSoundText.textContent = 'DETENER SONIDO';
            var icon = fichaSoundBtn.querySelector('.sound-icon');
            if (icon) icon.textContent = '⏹';
        } else {
            fichaSoundBtn.classList.remove('playing');
            if (fichaSoundText) fichaSoundText.textContent = 'REPRODUCIR SONIDO';
            var icon = fichaSoundBtn.querySelector('.sound-icon');
            if (icon) icon.textContent = '🔊';
        }
    }

    function updateNarrateButtonState(playing) {
        if (!fichaNarrateBtn) return;
        if (playing) {
            fichaNarrateBtn.classList.add('playing');
            if (fichaNarrateText) fichaNarrateText.textContent = 'DETENER NARRACIÓN';
            var icon = fichaNarrateBtn.querySelector('.narrate-icon');
            if (icon) icon.textContent = '⏹';
        } else {
            fichaNarrateBtn.classList.remove('playing');
            if (fichaNarrateText) fichaNarrateText.textContent = 'NARRAR EXPEDIENTE';
            var icon = fichaNarrateBtn.querySelector('.narrate-icon');
            if (icon) icon.textContent = '🎙️';
        }
    }

    function playFichaNarrate(narrateSrc, fichaId) {
        if (isNarratePlaying && activeNarrateFichaId === fichaId) {
            stopFichaNarrate();
            return;
        }

        stopFichaSound();
        stopFichaNarrate();
        if (!narrateSrc) return;

        activeNarrateFichaId = fichaId;
        isNarratePlaying = true;
        updateNarrateButtonState(true);

        if (fichaNarratePlayer) {
            fichaNarratePlayer.src = narrateSrc;
            var p = fichaNarratePlayer.play();
            if (p !== undefined) {
                p.catch(function(err) {
                    console.warn('Error al reproducir narración:', err);
                    stopFichaNarrate();
                });
            }
        }
    }

    function playFichaSound(soundSrc, fichaId) {
        if (isSoundPlaying && activeSoundFichaId === fichaId) {
            stopFichaSound();
            return;
        }

        stopFichaSound();
        stopFichaNarrate();
        if (!soundSrc) return;

        activeSoundFichaId = fichaId;
        isSoundPlaying = true;
        updateSoundButtonState(true);

        var gridChip = document.querySelector('.ficha-sound-chip[data-num="' + fichaId + '"]');
        if (gridChip) {
            gridChip.classList.add('playing');
            var chipIcon = gridChip.querySelector('.sound-chip-icon');
            if (chipIcon) chipIcon.textContent = '⏹';
        }

        // Primero reproducir con audio tag, con fallback a video oculto y ruta alternativa
        var tryPlay = function(srcToTry) {
            if (fichaAudioPlayer) {
                fichaAudioPlayer.src = srcToTry;
                var p = fichaAudioPlayer.play();
                if (p !== undefined) {
                    p.catch(function() {
                        if (fichaVideoPlayer) {
                            fichaVideoPlayer.src = srcToTry;
                            fichaVideoPlayer.play().catch(function(e) {
                                if (!srcToTry.startsWith('sonidos/')) {
                                    tryPlay('sonidos/' + srcToTry);
                                } else {
                                    console.warn('Error al reproducir audio:', e);
                                    stopFichaSound();
                                }
                            });
                        }
                    });
                }
            }
        };
        tryPlay(soundSrc);
    }

    if (fichaAudioPlayer) {
        fichaAudioPlayer.addEventListener('ended', function() {
            stopFichaSound();
        });
    }
    if (fichaVideoPlayer) {
        fichaVideoPlayer.addEventListener('ended', function() {
            stopFichaSound();
        });
    }
    if (fichaNarratePlayer) {
        fichaNarratePlayer.addEventListener('ended', function() {
            stopFichaNarrate();
        });
    }

    if (fichaSoundBtn) {
        fichaSoundBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var f = FICHAS[currentFichaIndex];
            if (f && f.sonido) {
                playFichaSound(f.sonido, f.id);
            }
        });
    }

    if (fichaNarrateBtn) {
        fichaNarrateBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var f = FICHAS[currentFichaIndex];
            if (f && f.narracion) {
                playFichaNarrate(f.narracion, f.id);
            }
        });
    }

    // Construir las tarjetas
    function buildFichas() {
        fichasGrid.innerHTML = '';
        FICHAS.forEach(function(f, idx) {
            var wrapper = document.createElement('div');
            wrapper.className = 'ficha-wrapper ' + f.clase;
            wrapper.setAttribute('data-cat', f.categoria);
            wrapper.setAttribute('data-num', f.id);

            var soundChip = f.sonido ? '<button class="ficha-sound-chip" data-num="' + f.id + '" title="Reproducir sonido de la ficha #' + f.num + '"><span class="sound-chip-icon">🔊</span> SONIDO</button>' : '';
            var frenteContent = '<img class="ficha-img" src="' + f.frenteImg + '" alt="Ficha ' + f.num + ' frente" loading="lazy" onerror="if(!this.dataset.triedRoot){this.dataset.triedRoot=true;this.src=\'frente_' + f.num + '.jpg\';}else{this.parentElement.innerHTML=\'<div class=ficha-placeholder><div class=ficha-placeholder-num>#' + f.num + '</div><div class=ficha-placeholder-label>FRENTE</div></div>\';}">';

            wrapper.innerHTML =
                '<div class="ficha-inner">' +
                    '<div class="ficha-front">' +
                        soundChip +
                        frenteContent +
                        '<span class="ficha-badge">' + f.categoria + '</span>' +
                        '<span class="ficha-num-tag">#' + f.num + '</span>' +
                        '<span class="ficha-flip-hint">🔍 AMPLIAR FICHA</span>' +
                    '</div>' +
                '</div>';

            if (f.sonido) {
                var chip = wrapper.querySelector('.ficha-sound-chip');
                if (chip) {
                    chip.addEventListener('click', function(e) {
                        e.stopPropagation();
                        playFichaSound(f.sonido, f.id);
                    });
                }
            }

            // Al hacer clic, abre la vista en grande (modal)
            wrapper.addEventListener('click', function() {
                openFichaModal(idx, false);
            });

            fichasGrid.appendChild(wrapper);
        });

        updateFichaCount();
    }

    function openFichaModal(index, showBack) {
        currentFichaIndex = index;
        isShowingBack = !!showBack;
        updateFichaModalContent();
        if (fichaModal) fichaModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeFichaModal() {
        stopFichaSound();
        stopFichaNarrate();
        if (fichaModal) fichaModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function updateFichaModalContent() {
        var f = FICHAS[currentFichaIndex];
        if (!f) return;

        if (fichaModalTitle) fichaModalTitle.textContent = 'FICHA DE HISTORIA #' + f.num;
        if (fichaModalBadge) {
            fichaModalBadge.textContent = f.categoria;
            fichaModalBadge.className = 'ficha-badge ' + f.clase;
        }

        var imgSrc = isShowingBack ? f.reversoImg : f.frenteImg;
        var fallbackSrc = (isShowingBack ? 'reverso_' : 'frente_') + f.num + '.jpg';
        if (fichaModalImg) {
            fichaModalImg.onerror = function() {
                this.onerror = null;
                this.src = fallbackSrc;
            };
            fichaModalImg.src = imgSrc;
            fichaModalImg.alt = 'Ficha #' + f.num + (isShowingBack ? ' reverso' : ' frente');
        }

        if (fichaToggleText) {
            fichaToggleText.textContent = isShowingBack ? 'VER FRENTE DE LA FICHA' : 'VER REVERSO DE LA FICHA';
        }

        // Configurar botón de sonido en el modal
        if (fichaSoundBtn) {
            if (f.sonido) {
                fichaSoundBtn.style.display = 'inline-flex';
                updateSoundButtonState(isSoundPlaying && activeSoundFichaId === f.id);
            } else {
                fichaSoundBtn.style.display = 'none';
            }
        }

        // Configurar botón de narración de IA en el modal
        if (fichaNarrateBtn) {
            if (f.narracion) {
                fichaNarrateBtn.style.display = 'inline-flex';
                updateNarrateButtonState(isNarratePlaying && activeNarrateFichaId === f.id);
            } else {
                fichaNarrateBtn.style.display = 'none';
            }
        }
    }

    function toggleModalSide() {
        isShowingBack = !isShowingBack;
        if (fichaModalImgWrap) {
            fichaModalImgWrap.classList.add('flipping');
            setTimeout(function() {
                updateFichaModalContent();
                fichaModalImgWrap.classList.remove('flipping');
            }, 150);
        } else {
            updateFichaModalContent();
        }
    }

    function prevFicha() {
        stopFichaSound();
        stopFichaNarrate();
        currentFichaIndex = (currentFichaIndex - 1 + FICHAS.length) % FICHAS.length;
        isShowingBack = false;
        updateFichaModalContent();
    }

    function nextFicha() {
        stopFichaSound();
        stopFichaNarrate();
        currentFichaIndex = (currentFichaIndex + 1) % FICHAS.length;
        isShowingBack = false;
        updateFichaModalContent();
    }


    if (fichaToggleSide) fichaToggleSide.addEventListener('click', toggleModalSide);
    if (fichaPrev) fichaPrev.addEventListener('click', prevFicha);
    if (fichaNext) fichaNext.addEventListener('click', nextFicha);
    if (fichaModalClose) fichaModalClose.addEventListener('click', closeFichaModal);
    if (fichaModal) fichaModal.addEventListener('click', function(e) {
        if (e.target === this) closeFichaModal();
    });

    document.addEventListener('keydown', function(e) {
        if (!fichaModal || !fichaModal.classList.contains('open')) return;
        if (e.key === 'Escape') closeFichaModal();
        if (e.key === 'ArrowLeft') prevFicha();
        if (e.key === 'ArrowRight') nextFicha();
        if (e.key === ' ') { e.preventDefault(); toggleModalSide(); }
    });

    // Aplicar filtro de categoría
    function applyFichaFilter(cat) {
        currentCat = cat;
        var wrappers = fichasGrid.querySelectorAll('.ficha-wrapper');
        wrappers.forEach(function(w) {
            if (cat === 'all' || w.getAttribute('data-cat') === cat) {
                w.classList.remove('hidden');
            } else {
                w.classList.add('hidden');
            }
        });
        updateFichaCount();
    }

    function updateFichaCount() {
        var visible = fichasGrid.querySelectorAll('.ficha-wrapper:not(.hidden)').length;
        var countEl = document.getElementById('fcount-all');
        if (countEl) countEl.textContent = '(' + visible + ')';
    }

    // Conectar botones de filtro
    var filterBtns = document.querySelectorAll('.ficha-filter-btn');
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            applyFichaFilter(this.getAttribute('data-cat'));
        });
    });

    // Construir al cargar
    buildFichas();

})();
