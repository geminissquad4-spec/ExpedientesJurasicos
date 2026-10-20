/**
 * Expedientes Jurásicos - Comparador Táctico de Escala y Tamaño 4K
 * Módulo interactivo con Pan & Zoom, Silueta Humana Arrastrable y Hotspots Tácticos InGen
 */

(function() {
  'use strict';

  function initScaleViewer() {
    const config = window.SPECIES_SCALE_CONFIG;
    if (!config) {
      console.warn('[BioScale] SPECIES_SCALE_CONFIG no encontrado.');
      return;
    }

    const container = document.getElementById('species-scale-module');
    const viewport = document.getElementById('scale-viewport');
    const canvas = document.getElementById('scale-canvas');
    const bgImg = document.getElementById('scale-bg-img');
    const hotspotsLayer = document.getElementById('scale-hotspots-layer');
    const humanEl = document.getElementById('draggable-human');
    const tooltipCard = document.getElementById('scale-tooltip-card');
    const zoomLevelEl = document.getElementById('scale-zoom-level');
    const minimapBox = document.getElementById('minimap-viewport-box');
    const minimapPreview = document.querySelector('.scale-minimap .minimap-preview');

    // Controls
    const btnZoomIn = document.getElementById('scale-zoom-in');
    const btnZoomOut = document.getElementById('scale-zoom-out');
    const btnZoomReset = document.getElementById('scale-zoom-reset');
    const btnToggleHuman = document.getElementById('scale-toggle-human');
    const btnToggleHotspots = document.getElementById('scale-toggle-hotspots');
    const btnResetHuman = document.getElementById('scale-reset-human');
    const btnFullscreen = document.getElementById('scale-fullscreen-btn');
    const searchInput = document.getElementById('scale-species-search');
    const searchResults = document.getElementById('scale-search-results');

    // Tooltip elements
    const stCode = document.getElementById('st-code');
    const stDiet = document.getElementById('st-diet');
    const stName = document.getElementById('st-name');
    const stHeight = document.getElementById('st-height');
    const stLength = document.getElementById('st-length');
    const stWeight = document.getElementById('st-weight');
    const stBtnRoar = document.getElementById('st-btn-roar');
    const stBtnModal = document.getElementById('st-btn-modal');
    const stClose = document.getElementById('scale-tooltip-close');

    if (!viewport || !canvas || !bgImg) return;

    // Fixed coordinate space for 4K diagram (3840 x 3922)
    const CANVAS_W = 2000;
    const CANVAS_H = 2042.71;

    // Zoom & Pan state
    let fitScale = 1.0;
    let scale = 1.0;
    let minScale = 0.5;
    let maxScale = 5.0;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let startPanX = 0;
    let startPanY = 0;

    // Touch pinch state
    let initialPinchDist = null;
    let initialScale = 1.0;

    // Human position state (% of canvas)
    let humanX = config.human.initialX || 1.34;
    let humanY = config.human.initialY || 11.10;
    let isDraggingHuman = false;
    let humanDragOffsetX = 0;
    let humanDragOffsetY = 0;

    // Visibility toggles
    let showHuman = true;
    let showHotspots = true;
    let activeHotspot = null;

    // Set human initial pos & size
    function updateHumanPosition() {
      if (!humanEl) return;
      humanEl.style.left = humanX + '%';
      humanEl.style.top = humanY + '%';
      humanEl.style.width = (config.human.widthPct || 3.045) + '%';
      humanEl.style.height = (config.human.heightPct || 2.982) + '%';
    }
    updateHumanPosition();

    // Render Hotspots
    function renderHotspots() {
      if (!hotspotsLayer) return;
      hotspotsLayer.innerHTML = '';

      config.hotspots.forEach(sp => {
        const spot = document.createElement('div');
        spot.className = 'scale-hotspot';
        spot.id = sp.id;
        spot.style.left = sp.cx + '%';
        spot.style.top = sp.cy + '%';
        spot.setAttribute('data-species', sp.species);

        // Pulse beacon ring + center dot + label
        spot.innerHTML = `
          <div class="beacon-pulse"></div>
          <div class="beacon-dot"></div>
          <div class="beacon-label">${sp.species}</div>
        `;

        spot.addEventListener('click', (e) => {
          e.stopPropagation();
          showTooltipForSpecies(sp, spot);
        });

        hotspotsLayer.appendChild(spot);
      });
    }
    renderHotspots();

    // Transform Canvas
    function updateTransform(animate = false) {
      if (animate) {
        canvas.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      } else {
        canvas.style.transition = 'none';
      }

      canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      canvas.style.setProperty('--scale', scale);

      if (zoomLevelEl) {
        const pct = Math.round((scale / fitScale) * 100);
        zoomLevelEl.textContent = pct + '%';
      }

      // Show species text labels when zoomed in (>= 160% of fit)
      if (scale >= fitScale * 1.55) {
        viewport.classList.add('labels-visible');
      } else {
        viewport.classList.remove('labels-visible');
      }

      updateMinimap();
    }

    // Minimap calculation
    function updateMinimap() {
      if (!minimapBox || !viewport || !canvas) return;
      const vpRect = viewport.getBoundingClientRect();
      const cW = CANVAS_W * scale;
      const cH = CANVAS_H * scale;

      const boxW = Math.max(6, Math.min(100, (vpRect.width / cW) * 100));
      const boxH = Math.max(6, Math.min(100, (vpRect.height / cH) * 100));

      const boxL = Math.max(0, Math.min(100 - boxW, ((-panX) / cW) * 100));
      const boxT = Math.max(0, Math.min(100 - boxH, ((-panY) / cH) * 100));

      minimapBox.style.width = boxW + '%';
      minimapBox.style.height = boxH + '%';
      minimapBox.style.left = boxL + '%';
      minimapBox.style.top = boxT + '%';
    }

    // Zoom towards point (px within viewport)
    function zoomToPoint(deltaFactor, focusX, focusY) {
      const prevScale = scale;
      let newScale = scale * deltaFactor;
      newScale = Math.max(minScale, Math.min(maxScale, newScale));

      if (Math.abs(newScale - prevScale) < 0.001) return;

      const vpRect = viewport.getBoundingClientRect();
      const fx = focusX !== undefined ? (focusX - vpRect.left) : (vpRect.width / 2);
      const fy = focusY !== undefined ? (focusY - vpRect.top) : (vpRect.height / 2);

      panX = fx - (fx - panX) * (newScale / prevScale);
      panY = fy - (fy - panY) * (newScale / prevScale);
      scale = newScale;

      clampPan();
      updateTransform(false);
    }

    // Clamp pan so image does not vanish
    function clampPan() {
      const vpRect = viewport.getBoundingClientRect();
      const cW = CANVAS_W * scale;
      const cH = CANVAS_H * scale;

      const marginX = vpRect.width * 0.75;
      const marginY = vpRect.height * 0.75;

      panX = Math.max(-cW + (vpRect.width - marginX), Math.min(marginX, panX));
      panY = Math.max(-cH + (vpRect.height - marginY), Math.min(marginY, panY));
    }

    // Fit canvas initially to viewport
    function fitToViewport(animate = false) {
      const vpRect = viewport.getBoundingClientRect();
      const vpW = vpRect.width || viewport.clientWidth || 1000;
      const vpH = vpRect.height || viewport.clientHeight || 720;

      fitScale = Math.min((vpW * 0.96) / CANVAS_W, (vpH * 0.96) / CANVAS_H);
      scale = fitScale;
      minScale = fitScale * 0.6;
      maxScale = fitScale * 6.5;

      panX = (vpW - CANVAS_W * scale) / 2;
      panY = (vpH - CANVAS_H * scale) / 2;

      updateTransform(animate);
      if (tooltipCard) tooltipCard.classList.remove('active');
    }

    // Tooltip display
    function showTooltipForSpecies(sp, spotEl) {
      activeHotspot = spotEl;
      document.querySelectorAll('.scale-hotspot.active').forEach(h => h.classList.remove('active'));
      if (spotEl) spotEl.classList.add('active');

      // Look up species in global ALL_SPECIES
      const allList = window.ALL_SPECIES || [];
      const spNameClean = (sp.species || '').toLowerCase().trim();
      const fullSp = allList.find(s => {
        const sNameClean = (s.name || '').toLowerCase().trim();
        return sNameClean === spNameClean ||
               spNameClean.startsWith(sNameClean) ||
               sNameClean.startsWith(spNameClean);
      });

      stName.textContent = sp.species;
      stCode.textContent = (fullSp && fullSp.code) ? fullSp.code : (sp.code || 'IN-GEN-SPEC');
      
      const rawDiet = (fullSp && fullSp.diet) ? fullSp.diet : (sp.diet || 'CARNÍVORO');
      stDiet.textContent = rawDiet.toUpperCase();

      stHeight.textContent = sp.height || (fullSp && fullSp.height) || 'N/A';
      stLength.textContent = sp.length || (fullSp && fullSp.length) || 'N/A';
      stWeight.textContent = sp.weight || (fullSp && fullSp.weight) || 'N/A';

      // Diet badge class
      const dietLower = rawDiet.toLowerCase();
      let dietCls = 'carnivore';
      if (dietLower.includes('herb')) dietCls = 'herbivore';
      else if (dietLower.includes('pisc')) dietCls = 'piscivore';
      else if (dietLower.includes('omni')) dietCls = 'omnivore';
      stDiet.className = 'card-diet ' + dietCls;

      // Wire roar
      stBtnRoar.onclick = () => {
        let roarSrc = sp.rugido || (fullSp && fullSp.audio);
        if (!roarSrc && typeof window.getRugido === 'function') {
          roarSrc = window.getRugido(sp.species);
        }
        if (!roarSrc) {
          const cleanName = sp.species.replace(/"[^"]+"/g, '').replace(/\b(Macho|Hembra|macho|hembra|Gen 2|Estandar|estandar)\b/g, '').trim();
          if (typeof window.getRugido === 'function') roarSrc = window.getRugido(cleanName);
          if (!roarSrc) roarSrc = 'Rugidos/' + (cleanName || sp.species) + '.mp4';
        }

        // Tactile button feedback
        const origHTML = stBtnRoar.innerHTML;
        stBtnRoar.innerHTML = '🔊 Reproduciendo...';
        stBtnRoar.style.borderColor = 'var(--c-amber, #f59e0b)';
        stBtnRoar.style.color = 'var(--c-amber, #f59e0b)';

        const resetBtn = () => {
          stBtnRoar.innerHTML = origHTML;
          stBtnRoar.style.borderColor = '';
          stBtnRoar.style.color = '';
        };

        if (typeof window.playSpeciesRoar === 'function') {
          window.playSpeciesRoar(roarSrc, sp.species);
          setTimeout(resetBtn, 3000);
        } else {
          let audioEl = document.getElementById('species-roar-player');
          if (!audioEl) {
            audioEl = new Audio();
            audioEl.id = 'species-roar-player';
            document.body.appendChild(audioEl);
          }
          const fileName = roarSrc.split('/').pop();
          audioEl.src = 'Rugidos/' + fileName;
          audioEl.onended = resetBtn;
          audioEl.play().catch(() => {
            audioEl.src = fileName;
            audioEl.play().catch(err => {
              console.warn('[BioScale] Roar fallback failed:', err);
              resetBtn();
            });
          });
        }
      };

      // Wire modal
      stBtnModal.onclick = () => {
        if (typeof window.openModal === 'function') {
          window.openModal(fullSp || sp);
        } else {
          console.log('[BioScale] openModal for:', sp.species);
        }
      };

      tooltipCard.classList.add('active');
    }

    if (stClose) {
      stClose.addEventListener('click', () => {
        tooltipCard.classList.remove('active');
        if (activeHotspot) activeHotspot.classList.remove('active');
      });
    }

    // Focus on specific species by name (animated pan & zoom)
    function focusSpecies(spName) {
      const hotspot = config.hotspots.find(h => h.species.toLowerCase() === spName.toLowerCase());
      if (!hotspot) return;

      const spotEl = document.getElementById(hotspot.id);
      scale = fitScale * 2.8;

      const vpRect = viewport.getBoundingClientRect();
      const targetCanvasX = (hotspot.cx / 100) * CANVAS_W;
      const targetCanvasY = (hotspot.cy / 100) * CANVAS_H;

      panX = vpRect.width / 2 - targetCanvasX * scale;
      panY = vpRect.height / 2 - targetCanvasY * scale;

      clampPan();
      updateTransform(true);
      showTooltipForSpecies(hotspot, spotEl);
    }

    // Viewport Wheel Pan / Zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomToPoint(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Viewport Drag to Pan
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('#draggable-human') || e.target.closest('.scale-hotspot') || e.target.closest('#scale-tooltip-card') || e.target.closest('.scale-minimap')) {
        return;
      }
      isPanning = true;
      startPanX = e.clientX - panX;
      startPanY = e.clientY - panY;
      viewport.classList.add('panning');
    });

    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        clampPan();
        updateTransform(false);
      } else if (isDraggingHuman && humanEl) {
        // Human silhouette drag calculation relative to canvas
        const canvasRect = canvas.getBoundingClientRect();
        let curX = ((e.clientX - humanDragOffsetX - canvasRect.left) / canvasRect.width) * 100;
        let curY = ((e.clientY - humanDragOffsetY - canvasRect.top) / canvasRect.height) * 100;

        curX = Math.max(0, Math.min(97, curX));
        curY = Math.max(0, Math.min(97, curY));

        // Magnetic snap to baselines (within 1.3% threshold)
        const feetY = curY + (config.human.heightPct || 2.982);
        let snapped = false;
        for (const base of config.baselines) {
          if (Math.abs(feetY - base.yPct) < 1.3) {
            curY = base.yPct - (config.human.heightPct || 2.982);
            humanEl.classList.add('snagged-baseline');
            snapped = true;
            break;
          }
        }
        if (!snapped) {
          humanEl.classList.remove('snagged-baseline');
        }

        humanX = curX;
        humanY = curY;
        updateHumanPosition();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        viewport.classList.remove('panning');
      }
      if (isDraggingHuman) {
        isDraggingHuman = false;
        if (humanEl) humanEl.classList.remove('dragging');
      }
    });

    // Touch Support: Pan & Pinch Zoom
    viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('#draggable-human') || e.target.closest('.scale-hotspot') || e.target.closest('#scale-tooltip-card') || e.target.closest('.scale-minimap')) {
        return;
      }
      if (e.touches.length === 1) {
        isPanning = true;
        startPanX = e.touches[0].clientX - panX;
        startPanY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        isPanning = false;
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (isPanning && e.touches.length === 1) {
        panX = e.touches[0].clientX - startPanX;
        panY = e.touches[0].clientY - startPanY;
        clampPan();
        updateTransform(false);
      } else if (e.touches.length === 2 && initialPinchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDist;
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomToPoint(factor * (initialScale / scale), centerX, centerY);
      } else if (isDraggingHuman && humanEl && e.touches.length === 1) {
        const t = e.touches[0];
        const canvasRect = canvas.getBoundingClientRect();
        let curX = ((t.clientX - humanDragOffsetX - canvasRect.left) / canvasRect.width) * 100;
        let curY = ((t.clientY - humanDragOffsetY - canvasRect.top) / canvasRect.height) * 100;

        curX = Math.max(0, Math.min(97, curX));
        curY = Math.max(0, Math.min(97, curY));

        const feetY = curY + (config.human.heightPct || 2.982);
        let snapped = false;
        for (const base of config.baselines) {
          if (Math.abs(feetY - base.yPct) < 1.3) {
            curY = base.yPct - (config.human.heightPct || 2.982);
            humanEl.classList.add('snagged-baseline');
            snapped = true;
            break;
          }
        }
        if (!snapped) {
          humanEl.classList.remove('snagged-baseline');
        }

        humanX = curX;
        humanY = curY;
        updateHumanPosition();
      }
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        isPanning = false;
        initialPinchDist = null;
        if (isDraggingHuman) {
          isDraggingHuman = false;
          if (humanEl) humanEl.classList.remove('dragging');
        }
      }
    }, { passive: true });

    // Draggable Human mouse & touch start
    if (humanEl) {
      humanEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDraggingHuman = true;
        humanEl.classList.add('dragging');
        const hRect = humanEl.getBoundingClientRect();
        humanDragOffsetX = e.clientX - hRect.left;
        humanDragOffsetY = e.clientY - hRect.top;
      });

      humanEl.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (e.touches.length === 1) {
          isDraggingHuman = true;
          humanEl.classList.add('dragging');
          const hRect = humanEl.getBoundingClientRect();
          humanDragOffsetX = e.touches[0].clientX - hRect.left;
          humanDragOffsetY = e.touches[0].clientY - hRect.top;
        }
      }, { passive: true });
    }

    // Button controls
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => zoomToPoint(1.25));
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => zoomToPoint(0.8));
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => fitToViewport(true));
    }

    if (btnToggleHuman) {
      btnToggleHuman.addEventListener('click', () => {
        showHuman = !showHuman;
        if (humanEl) humanEl.style.display = showHuman ? 'block' : 'none';
        btnToggleHuman.classList.toggle('active', showHuman);
      });
    }

    if (btnToggleHotspots) {
      btnToggleHotspots.addEventListener('click', () => {
        showHotspots = !showHotspots;
        if (hotspotsLayer) hotspotsLayer.style.display = showHotspots ? 'block' : 'none';
        btnToggleHotspots.classList.toggle('active', showHotspots);
        if (!showHotspots && tooltipCard) tooltipCard.classList.remove('active');
      });
    }

    if (btnResetHuman) {
      btnResetHuman.addEventListener('click', () => {
        humanX = config.human.initialX || 1.34;
        humanY = config.human.initialY || 11.10;
        if (humanEl) {
          humanEl.style.transition = 'left 0.4s ease, top 0.4s ease';
          setTimeout(() => { humanEl.style.transition = 'none'; }, 400);
        }
        updateHumanPosition();
      });
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen?.().catch(err => console.error(err));
        } else {
          document.exitFullscreen?.().catch(err => console.error(err));
        }
      });
    }

    // Minimap click to pan
    if (minimapPreview) {
      minimapPreview.addEventListener('click', (e) => {
        const mRect = minimapPreview.getBoundingClientRect();
        const clickRatioX = (e.clientX - mRect.left) / mRect.width;
        const clickRatioY = (e.clientY - mRect.top) / mRect.height;

        const vpRect = viewport.getBoundingClientRect();
        const cW = CANVAS_W * scale;
        const cH = CANVAS_H * scale;

        panX = vpRect.width / 2 - clickRatioX * cW;
        panY = vpRect.height / 2 - clickRatioY * cH;

        clampPan();
        updateTransform(true);
      });
    }

    // Species Search in Diagram
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          searchResults.style.display = 'none';
          searchResults.innerHTML = '';
          return;
        }

        const matches = config.hotspots.filter(h =>
          h.species.toLowerCase().includes(query) || (h.code && h.code.toLowerCase().includes(query))
        ).slice(0, 8);

        if (matches.length === 0) {
          searchResults.innerHTML = `<div class="search-item no-match">No se encontró especie coincidente</div>`;
          searchResults.style.display = 'block';
          return;
        }

        searchResults.innerHTML = matches.map(m => `
          <div class="search-item" data-species="${m.species}">
            <div class="si-info">
              <span class="si-name">${m.species}</span>
              <span class="si-meta">${m.height} | ${m.diet}</span>
            </div>
            <span class="si-row">Fila ${m.row}</span>
          </div>
        `).join('');
        searchResults.style.display = 'block';

        searchResults.querySelectorAll('.search-item:not(.no-match)').forEach(item => {
          item.addEventListener('click', () => {
            const spName = item.getAttribute('data-species');
            searchInput.value = spName;
            searchResults.style.display = 'none';
            focusSpecies(spName);
          });
        });
      });

      // Close search results on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.scale-search-wrap')) {
          searchResults.style.display = 'none';
        }
      });
    }

    // Expose focus function globally
    window.focusScaleSpecies = focusSpecies;

    // Window resize handler
    window.addEventListener('resize', () => {
      fitToViewport(false);
    });

    // Initial fit
    bgImg.addEventListener('load', () => fitToViewport(false));
    if (bgImg.complete) {
      fitToViewport(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScaleViewer);
  } else {
    initScaleViewer();
  }
})();
