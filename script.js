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

function tryAccess() {
    var val = accessInput ? accessInput.value.trim() : '';
    if (val === SECRET) {
        if (feedback) {
            feedback.textContent = '> ACCESO CONCEDIDO — Verificando identidad...';
            feedback.className = 'terminal-feedback feedback-ok';
        }
        setTimeout(function() {
            if (contestOverlay) contestOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
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
