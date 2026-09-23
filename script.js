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

// Mapa de rugidos: nombre de especie -> archivo en raíz (o carpeta Rugidos)
var RUGIDOS_MAP = {
    "Acrocanthosaurus":            "Acrocanthosaurus.mp4",
    "Albertosaurus":               "Albertosaurus.mp4",
    "Allosaurus":                  "Allosaurus.mp4",
    "Amargasaurus":                "Amargasaurus.mp4",
    "Ankylosaurus":                "Ankylosaurus.mp4",
    "Baryonyx":                    "Baryonyx.mp4",
    "Brachiosaurus":               "Brachiosaurus.mp4",
    "Carnotaurus":                 "Carnotaurus.mp4",
    "Cearadactylus":               "Cearadactylus.mp4",
    "Ceratosaurus":                "Ceratosaurus.mp4",
    "Chasmosaurus":                "Chasmosaurus.mp4",
    "Coelurosauravus":             "Coelurosauravus.mp4",
    "Compsognathus":               "Compsognathus.mp4",
    "Concavenator":                "Concavenator.mp4",
    "Corythosaurus":               "Corythosaurus.mp4",
    "Cryolophosaurus":             "Cryolophosaurus.mp4",
    "Deinosuchus":                 "Deinosuchus.mp4",
    "Diabloceratops":              "Diabloceratops.mp4",
    "Dilophosaurus":               "Dilophosaurus.mp4",
    "Dimetrodon":                  "Dimetrodon.mp4",
    "Diplodocus":                  "Diplodocus.mp4",
    "Dracorex":                    "Dracorex.mp4",
    "Dryosaurus":                  "Dryosaurus.mp4",
    "Edmontosaurus":               "Edmontosaurus.mp4",
    "Elasmosaurus":                "Elasmosaurus.mp4",
    "Euoplocephalus":              "Euoplocephalus.mp4",
    "Gallimimus":                  "Gallimimus.mp4",
    "Geosternbergia":              "Geosternbergia.mp4",
    "Giganotosaurus":              "Giganotosaurus.mp4",
    "Gorgonopsid":                 "Gorgonopsid.mp4",
    "Herrerasaurus":               "Herrerasaurus.mp4",
    "Hypsilophodon":               "Hypsilophodon.mp4",
    "Liopleurodon":                "Liopleurodon.mp4",
    "Maiasaura":                   "Maiasaura.mp4",
    "Mamenchisaurus":              "Mamenchisaurus.mp4",
    "Metriacanthosaurus":          "Metriacanthosaurus.mp4",
    "Microceratus":                "Microceratus.mp4",
    "Microraptor":                 "Microraptor.mp4",
    "Ornithocheirus":              "Ornithocheirus.mp4",
    "Ornithomimus":                "Ornithomimus.mp4",
    "Pachycephalosaurus":          "Pachycephalosaurus.mp4",
    "Pachyrhinosaurus":            "Pachyrhinosaurus.mp4",
    "Parasaurolophus":             "Parasaurolophus.mp4",
    "Plateosaurus":                "Plateosaurus.mp4",
    "Plesiosaurus":                "Plesiosaurus.mp4",
    "Proceratosaurus":             "Proceratosaurus.mp4",
    "Pteranodon":                  "Pteranodon.mp4",
    "Quetzalcoatlus":              "Quetzalcoatlus.mp4",
    "Scutosaurus":                 "Scutosaurus.mp4",
    "Segisaurus":                  "Segisaurus.mp4",
    "Spinosaurus":                 "Spinosaurus.mp4",
    "Stegosaurus":                 "Stegosaurus.mp4",
    "Stygimoloch":                 "Stygimoloch.mp4",
    "Styracosaurus":               "Styracosaurus.mp4",
    "Suchomimus":                  "Suchomimus.mp4",
    "Tanystropheus":               "Tanystropheus.mp4",
    "Tapejara":                    "Tapejara.mp4",
    "Therizinosaurus":             "Therizinosaurus.mp4",
    "Torosaurus":                  "Torosaurus.mp4",
    "Triceratops":                 "Triceratops.mp4",
    "Troodon":                     "Troodon.mp4",
    "Tylosaurus":                  "Tylosaurus.mp4",
    "Tyrannosaurus Rex":           "Tyrannosaurus Rex.mp4",
    "Ultimate Predator (Híbrido)": "Ultimate Predator.mp4",
    "Utahraptor":                  "Utahraptor.mp4",
    "Velociraptor":                "Velociraptor.mp4"
};

function getRugido(name) {
    return RUGIDOS_MAP[name] || null;
}

// ---- REPRODUCTOR DE RUGIDOS (SECCIÓN ESPECIES) ----
var speciesRoarAudio = document.getElementById('species-roar-player');
var speciesRoarVideo = document.getElementById('species-video-roar-player');
var activeSpeciesRoarName = null;
var isSpeciesRoarPlaying = false;

function stopSpeciesRoar() {
    if (speciesRoarAudio) {
        try { speciesRoarAudio.pause(); speciesRoarAudio.currentTime = 0; } catch(e){}
    }
    if (speciesRoarVideo) {
        try { speciesRoarVideo.pause(); speciesRoarVideo.currentTime = 0; } catch(e){}
    }
    isSpeciesRoarPlaying = false;
    activeSpeciesRoarName = null;
    
    document.querySelectorAll('.species-roar-chip.playing').forEach(function(el) {
        el.classList.remove('playing');
        var icon = el.querySelector('.roar-chip-icon');
        if (icon) icon.textContent = '🔊';
    });
    var modalRoarBtn = document.getElementById('species-modal-roar-btn');
    if (modalRoarBtn) {
        modalRoarBtn.classList.remove('playing');
        var textSpan = document.getElementById('species-modal-roar-text');
        if (textSpan) textSpan.textContent = 'REPRODUCIR RUGIDO';
        var icon = modalRoarBtn.querySelector('.roar-icon');
        if (icon) icon.textContent = '🔊';
    }
}

function updateSpeciesRoarButtonState(name, playing) {
    var modalRoarBtn = document.getElementById('species-modal-roar-btn');
    if (modalRoarBtn) {
        if (playing) {
            modalRoarBtn.classList.add('playing');
            var textSpan = document.getElementById('species-modal-roar-text');
            if (textSpan) textSpan.textContent = 'DETENER RUGIDO';
            var icon = modalRoarBtn.querySelector('.roar-icon');
            if (icon) icon.textContent = '⏹';
        } else {
            modalRoarBtn.classList.remove('playing');
            var textSpan = document.getElementById('species-modal-roar-text');
            if (textSpan) textSpan.textContent = 'REPRODUCIR RUGIDO';
            var icon = modalRoarBtn.querySelector('.roar-icon');
            if (icon) icon.textContent = '🔊';
        }
    }
    
    document.querySelectorAll('.species-roar-chip').forEach(function(el) {
        if (el.getAttribute('data-name') === name) {
            if (playing) {
                el.classList.add('playing');
                var icon = el.querySelector('.roar-chip-icon');
                if (icon) icon.textContent = '⏹';
            } else {
                el.classList.remove('playing');
                var icon = el.querySelector('.roar-chip-icon');
                if (icon) icon.textContent = '🔊';
            }
        } else {
            el.classList.remove('playing');
            var icon = el.querySelector('.roar-chip-icon');
            if (icon) icon.textContent = '🔊';
        }
    });
}

function playSpeciesRoar(src, name) {
    if (isSpeciesRoarPlaying && activeSpeciesRoarName === name) {
        stopSpeciesRoar();
        return;
    }
    
    if (typeof stopFichaSound === 'function') stopFichaSound();
    if (typeof stopFichaNarrate === 'function') stopFichaNarrate();
    stopSpeciesRoar();
    
    if (!src) return;
    
    activeSpeciesRoarName = name;
    isSpeciesRoarPlaying = true;
    updateSpeciesRoarButtonState(name, true);
    
    var fileName = src.split('/').pop();
    var candidates = [
        src,
        encodeURI(src),
        'Rugidos/' + fileName,
        'Rugidos/' + encodeURIComponent(fileName),
        'rugidos/' + fileName,
        'rugidos/' + encodeURIComponent(fileName),
        fileName,
        encodeURIComponent(fileName)
    ];
    
    // Eliminar duplicados
    candidates = candidates.filter(function(item, pos) {
        return candidates.indexOf(item) === pos;
    });

    var cIdx = 0;
    function tryNext() {
        if (!isSpeciesRoarPlaying || activeSpeciesRoarName !== name) return;
        if (cIdx >= candidates.length) {
            console.warn('No se pudo reproducir el rugido para:', name, 'Rutas intentadas:', candidates);
            stopSpeciesRoar();
            return;
        }
        var currentUrl = candidates[cIdx++];
        
        if (speciesRoarAudio) {
            speciesRoarAudio.src = currentUrl;
            var p = speciesRoarAudio.play();
            if (p !== undefined) {
                p.then(function() {
                    // Reproduciendo con éxito
                }).catch(function() {
                    if (speciesRoarVideo) {
                        speciesRoarVideo.src = currentUrl;
                        speciesRoarVideo.play().catch(function() {
                            tryNext();
                        });
                    } else {
                        tryNext();
                    }
                });
            } else {
                speciesRoarAudio.onerror = function() {
                    speciesRoarAudio.onerror = null;
                    tryNext();
                };
            }
        } else if (speciesRoarVideo) {
            speciesRoarVideo.src = currentUrl;
            speciesRoarVideo.play().catch(function() {
                tryNext();
            });
        } else {
            // Fallback creación dinámica de objeto Audio
            var a = new Audio(currentUrl);
            a.play().catch(function() {
                tryNext();
            });
        }
    }
    tryNext();
}

if (speciesRoarAudio) {
    speciesRoarAudio.addEventListener('ended', stopSpeciesRoar);
}
if (speciesRoarVideo) {
    speciesRoarVideo.addEventListener('ended', stopSpeciesRoar);
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

        var rugidoSrc = getRugido(sp.name);
        var roarChip = rugidoSrc
            ? '<button class="species-roar-chip" data-name="' + sp.name + '" title="Reproducir rugido de ' + sp.name + '"><span class="roar-chip-icon">🔊</span> RUGIDO</button>'
            : '';

        var card = document.createElement('div');
        card.className = 'species-card';
        card.setAttribute('data-diet', sp.diet);
        card.setAttribute('data-name', sp.name.toLowerCase());
        card.setAttribute('data-key', sp.key);
        card.innerHTML =
            '<div class="species-img-wrap">' +
                roarChip +
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

        if (rugidoSrc) {
            var chip = card.querySelector('.species-roar-chip');
            if (chip) {
                chip.addEventListener('click', function(e) {
                    e.stopPropagation();
                    playSpeciesRoar(rugidoSrc, sp.name);
                });
            }
        }

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

    var rugidoSrc = getRugido(sp.name);
    var roarBtnHTML = rugidoSrc
        ? '<button class="btn-primary species-modal-roar-btn" id="species-modal-roar-btn" data-name="' + sp.name + '"><span class="roar-icon">🔊</span> <span id="species-modal-roar-text">REPRODUCIR RUGIDO</span></button>'
        : '';

    var inner = document.getElementById('modal-inner');
    // ---- Title row ----
    var titleHTML =
        '<div class="modal-title-row">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;width:100%">' +
                '<div>' +
                    '<div class="modal-name">' + sp.emoji + ' ' + sp.name + '</div>' +
                    '<div class="modal-meta-row">' +
                        '<span class="modal-key">CÓDIGO: ' + sp.key + '</span>' +
                        '<span class="modal-meta-sep">|</span>' +
                        '<span class="modal-key">FAMILIA: ' + sp.family + '</span>' +
                    '</div>' +
                '</div>' +
                (roarBtnHTML ? '<div>' + roarBtnHTML + '</div>' : '') +
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

    if (rugidoSrc) {
        var mBtn = inner.querySelector('#species-modal-roar-btn');
        if (mBtn) {
            mBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                playSpeciesRoar(rugidoSrc, sp.name);
            });
            if (isSpeciesRoarPlaying && activeSpeciesRoarName === sp.name) {
                updateSpeciesRoarButtonState(sp.name, true);
            }
        }
    }

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
    stopSpeciesRoar();
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

    // Elementos de CRT TV Video (fichas 118-126)
    var fichaVideoBtn = document.getElementById('ficha-video-btn');
    var fichaVideoText = document.getElementById('ficha-video-text');
    var crtOverlay = document.getElementById('crt-tv-overlay');
    var crtWrapper = document.getElementById('crt-tv-wrapper');
    var crtVideo = document.getElementById('crt-tv-video');
    var crtCloseBtn = document.getElementById('crt-tv-close');
    var isCrtClosing = false;

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
            if (!f) return;
            var fNum = parseInt(f.num || f.id, 10);
            var isSoundAllowed = ((fNum >= 1 && fNum <= 103) || (fNum >= 109 && fNum <= 117));
            if (isSoundAllowed && f.sonido) {
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

    // Funciones del Reproductor CRT TV (Fichas 118-126)
    function openCrtTV(videoSrc, numStr) {
        stopFichaSound();
        stopFichaNarrate();
        if (typeof stopSpeciesRoar === 'function') {
            try { stopSpeciesRoar(); } catch(e) {}
        }

        if (!crtOverlay || !crtVideo || !crtWrapper) return;

        var crtChannel = crtWrapper.querySelector('.crt-channel');
        if (crtChannel && numStr) {
            crtChannel.innerHTML = 'CH 03 &bull; EXPEDIENTE #' + numStr + ' &bull; INGEN ARCHIVE';
        }

        // Priorizar archivo en la raíz (ej. 118.mp4), con fallback a videosjp/118.mp4
        var primarySrc = numStr ? (numStr + '.mp4') : videoSrc;
        var secondarySrc = numStr ? ('videosjp/' + numStr + '.mp4') : null;

        var triedFallback = false;
        crtVideo.onerror = function() {
            if (!triedFallback && secondarySrc && (!crtVideo.currentSrc || crtVideo.currentSrc.indexOf('videosjp/') === -1)) {
                triedFallback = true;
                console.log('Intentando fallback para video:', secondarySrc);
                crtVideo.src = secondarySrc;
                crtVideo.load();
                crtVideo.play().catch(function(){});
            }
        };

        crtVideo.pause();
        crtVideo.src = primarySrc;
        crtVideo.load();

        crtWrapper.style.animation = 'crtTurnOn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards';
        crtOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        var p = crtVideo.play();
        if (p !== undefined) {
            p.catch(function(err) {
                console.log('Video autoplay aviso:', err);
            });
        }
    }

    function closeCrtTV() {
        if (!crtOverlay || !crtOverlay.classList.contains('open') || isCrtClosing) return;
        isCrtClosing = true;
        if (crtWrapper) {
            crtWrapper.style.animation = 'crtTurnOff 0.4s ease forwards';
        }
        setTimeout(function() {
            if (crtVideo) {
                try {
                    crtVideo.pause();
                    crtVideo.removeAttribute('src');
                    crtVideo.load();
                } catch(e) {}
            }
            if (crtOverlay) crtOverlay.classList.remove('open');
            if (crtWrapper) crtWrapper.style.animation = '';
            if (!fichaModal || !fichaModal.classList.contains('open')) {
                document.body.style.overflow = '';
            }
            isCrtClosing = false;
        }, 380);
    }

    if (crtCloseBtn) crtCloseBtn.addEventListener('click', closeCrtTV);
    if (crtVideo) crtVideo.addEventListener('ended', closeCrtTV);
    if (crtOverlay) {
        crtOverlay.addEventListener('click', function(e) {
            if (e.target === crtOverlay) closeCrtTV();
        });
    }

    if (fichaVideoBtn) {
        fichaVideoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var f = FICHAS[currentFichaIndex];
            if (!f) return;
            var fNum = parseInt(f.num || f.id, 10);
            var isVideoFicha = (fNum >= 118 && fNum <= 174);
            if (isVideoFicha) {
                openCrtTV(f.video || (f.num + '.mp4'), f.num);
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

            var fNum = parseInt(f.num || f.id, 10);
            var isSoundAllowed = ((fNum >= 1 && fNum <= 103) || (fNum >= 109 && fNum <= 117));

            var soundChip = (isSoundAllowed && f.sonido) ? '<button class="ficha-sound-chip" data-num="' + f.id + '" title="Reproducir sonido de la ficha #' + f.num + '"><span class="sound-chip-icon">🔊</span> SONIDO</button>' : '';
            var hasVideo = (fNum >= 118 && fNum <= 174);
            var videoChip = hasVideo ? '<button class="ficha-video-chip" data-num="' + f.id + '" title="Ver video de la escena en televisor CRT"><span class="video-chip-icon">🎬</span> VIDEO</button>' : '';
            var frenteContent = '<img class="ficha-img" src="' + f.frenteImg + '" alt="Ficha ' + f.num + ' frente" loading="lazy" onerror="if(!this.dataset.triedRoot){this.dataset.triedRoot=true;this.src=\'frente_' + f.num + '.jpg\';}else{this.parentElement.innerHTML=\'<div class=ficha-placeholder><div class=ficha-placeholder-num>#' + f.num + '</div><div class=ficha-placeholder-label>FRENTE</div></div>\';}">';

            wrapper.innerHTML =
                '<div class="ficha-inner">' +
                    '<div class="ficha-front">' +
                        soundChip +
                        videoChip +
                        frenteContent +
                        '<span class="ficha-badge">' + f.categoria + '</span>' +
                        '<span class="ficha-num-tag">#' + f.num + '</span>' +
                        '<span class="ficha-flip-hint">🔍 AMPLIAR FICHA</span>' +
                    '</div>' +
                '</div>';

            if (isSoundAllowed && f.sonido) {
                var chip = wrapper.querySelector('.ficha-sound-chip');
                if (chip) {
                    chip.addEventListener('click', function(e) {
                        e.stopPropagation();
                        playFichaSound(f.sonido, f.id);
                    });
                }
            }



            if (hasVideo) {
                var vChip = wrapper.querySelector('.ficha-video-chip');
                if (vChip) {
                    vChip.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openCrtTV(f.video || (f.num + '.mp4'), f.num);
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
        closeCrtTV();
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

        // Configurar botón de sonido en el modal (SÓLO Especies 1-103 y Personajes 109-117)
        // Empresa (104-108), Película (118-198), Novela (199-244), Tributo (245) y Juguetes (246-315) NUNCA muestran sonido
        if (fichaSoundBtn) {
            var fNum = parseInt(f.num || f.id, 10);
            var isSoundAllowed = ((fNum >= 1 && fNum <= 103) || (fNum >= 109 && fNum <= 117));
            if (isSoundAllowed && f.sonido) {
                fichaSoundBtn.style.display = 'inline-flex';
                fichaSoundBtn.classList.remove('hidden');
                updateSoundButtonState(isSoundPlaying && activeSoundFichaId === f.id);
            } else {
                fichaSoundBtn.style.display = 'none';
                fichaSoundBtn.classList.add('hidden');
            }
        }

        // Configurar botón de narración de IA en el modal
        if (fichaNarrateBtn) {
            if (f.narracion) {
                fichaNarrateBtn.style.display = 'inline-flex';
                fichaNarrateBtn.classList.remove('hidden');
                updateNarrateButtonState(isNarratePlaying && activeNarrateFichaId === f.id);
            } else {
                fichaNarrateBtn.style.display = 'none';
                fichaNarrateBtn.classList.add('hidden');
            }
        }

        // Configurar botón de video en el modal (SÓLO Película 118-174)
        if (fichaVideoBtn) {
            var fNumVideo = parseInt(f.num || f.id, 10);
            var hasVideo = (fNumVideo >= 118 && fNumVideo <= 174);
            if (hasVideo) {
                fichaVideoBtn.style.display = 'inline-flex';
                fichaVideoBtn.classList.remove('hidden');
            } else {
                fichaVideoBtn.style.display = 'none';
                fichaVideoBtn.classList.add('hidden');
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
        closeCrtTV();
        currentFichaIndex = (currentFichaIndex - 1 + FICHAS.length) % FICHAS.length;
        isShowingBack = false;
        updateFichaModalContent();
    }

    function nextFicha() {
        stopFichaSound();
        stopFichaNarrate();
        closeCrtTV();
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
        if (e.key === 'Escape') {
            if (crtOverlay && crtOverlay.classList.contains('open')) {
                closeCrtTV();
                return;
            }
            if (fichaModal && fichaModal.classList.contains('open')) {
                closeFichaModal();
            }
            return;
        }
        if (!fichaModal || !fichaModal.classList.contains('open')) return;
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
