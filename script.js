// ============================================================
// EXPEDIENTES JURÁSICOS — script.js
// ============================================================

// Combine all species from the three data files
var ALL_SPECIES = [].concat(SPECIES_PART1, SPECIES_PART2, SPECIES_PART3);

// Sort alphabetically
ALL_SPECIES.sort(function (a, b) { return a.name.localeCompare(b.name); });

// Active diet filter
var activeFilter = 'all';

// ── LIVE CLOCK ──────────────────────────────────────────────
function updateClock() {
    var el = document.getElementById('liveTime');
    if (!el) return;
    var d = new Date();
    el.textContent = d.toLocaleTimeString('es-MX', { hour12: false }) + ' | ' +
        d.toLocaleDateString('es-MX');
}
updateClock();
setInterval(updateClock, 1000);

// ── INCIDENT TOGGLE ─────────────────────────────────────────
function toggleIncident(id) {
    var card = document.getElementById(id);
    if (!card) return;
    var isOpen = card.classList.contains('open');
    // Close all first
    document.querySelectorAll('.incident-card.open').forEach(function (c) {
        c.classList.remove('open');
    });
    // Open clicked if it was previously closed
    if (!isOpen) {
        card.classList.add('open');
        setTimeout(function () {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// ── RENDER SPECIES GRID ─────────────────────────────────────
function renderGrid(list) {
    var grid = document.getElementById('speciesGrid');
    grid.innerHTML = '';
    list.forEach(function (sp) {
        var card = document.createElement('div');
        card.className = 'species-card';
        card.setAttribute('data-name', sp.name.toLowerCase());
        card.setAttribute('data-diet', sp.diet);
        card.innerHTML =
            '<div class="sp-name">' + sp.name + '</div>' +
            '<div class="sp-diet-badge diet-' + sp.diet + '">' + sp.dietLabel + '</div>' +
            '<div class="sp-location">' + sp.emoji + ' ' + sp.location + '</div>' +
            '<div class="sp-click-hint">VER FICHA »</div>';
        card.addEventListener('click', function () { openModal(sp); });
        grid.appendChild(card);
    });
}

// ── FILTER SPECIES ──────────────────────────────────────────
function filterSpecies() {
    var query = document.getElementById('speciesSearch').value.toLowerCase();
    var filtered = ALL_SPECIES.filter(function (sp) {
        var matchName = sp.name.toLowerCase().includes(query);
        var matchDiet = (activeFilter === 'all') || (sp.diet === activeFilter);
        return matchName && matchDiet;
    });
    renderGrid(filtered);
}

function filterDiet(diet, btnEl) {
    activeFilter = diet;
    document.querySelectorAll('.pill').forEach(function (b) { b.classList.remove('active'); });
    btnEl.classList.add('active');
    filterSpecies();
}

// ── SPECIES MODAL ────────────────────────────────────────────
function getSpeciesImageSrc(name) {
    // Priority: Local images copied from the 'dinos' folder
    // Web-safe filenames: lowercase and no spaces
    var fileName = name.trim().toLowerCase().replace(/\s+/g, '-');
    return 'images/' + fileName + '.jpg';
}

function openModal(sp) {
    var modal = document.getElementById('speciesModal');
    var content = document.getElementById('modalContent');
    var imgSrc = getSpeciesImageSrc(sp.name);
    // Build image section — use a placeholder div, swap to img if URL exists
    var imgHtml = '<div class="modal-placeholder-img" id="imgHolder_' + sp.key + '"><div class="sp-emoji">' + sp.emoji + '</div><p>' + sp.name + '</p></div>';
    if (imgSrc) {
        // Try loading image; if it fails keep the emoji placeholder
        var testImg = new Image();
        testImg.onload = function () {
            var holder = document.getElementById('imgHolder_' + sp.key);
            if (holder) {
                holder.outerHTML = '<img src="' + imgSrc + '" alt="' + sp.name + '" class="modal-image"/>';
            }
        };
        testImg.src = imgSrc;
    }

    content.innerHTML =
        '<div class="modal-header">' +
        '<div class="modal-sp-name">' + sp.name + '</div>' +
        '<div class="modal-sp-key">CÓDIGO: ' + sp.key + ' &nbsp;|&nbsp; FAMILIA: ' + sp.family + '</div>' +
        '</div>' +
        imgHtml +
        '<div class="modal-stats-grid">' +
        '<div class="stat-box"><div class="stat-label">DIETA</div><div class="stat-value diet-' + sp.diet + ' sp-diet-badge">' + sp.dietLabel + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">ALTURA</div><div class="stat-value">' + sp.height + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">LONGITUD</div><div class="stat-value">' + sp.length + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">PESO EST.</div><div class="stat-value">' + sp.weight + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">LOCALIZACIÓN</div><div class="stat-value" style="font-size:11px;">' + sp.location + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">CLAVE INGEN</div><div class="stat-value" style="font-size:11px;color:var(--accent-amber)">' + sp.key + '</div></div>' +
        '</div>' +
        '<div class="modal-desc-title">DESCRIPCIÓN OFICIAL INGEN</div>' +
        '<p class="modal-desc">' + sp.desc + '</p>' +
        '<div class="modal-desc-title" style="margin-top:16px;">ANÁLISIS ADICIONAL</div>' +
        '<p class="modal-desc">' + sp.extra + '</p>' +
        '<div class="modal-ingen-note">⚠ NOTA INGEN: ' + sp.ingen + '</div>';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    var modal = document.getElementById('speciesModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    if (e.target.id === 'speciesModal') closeModal();
}

// Close modal with ESC key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
});

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    renderGrid(ALL_SPECIES);

    // Glitch random effect on header title
    var title = document.querySelector('.site-title');
    if (title) {
        setInterval(function () {
            if (Math.random() < 0.08) {
                title.style.textShadow = '2px 0 #ff2244, -2px 0 #00d4ff, 0 0 20px rgba(0,255,136,0.5)';
                setTimeout(function () {
                    title.style.textShadow = '';
                }, 120);
            }
        }, 800);
    }
});
