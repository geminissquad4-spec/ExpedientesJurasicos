// ==========================================================================
//  EXPEDIENTES JURÁSICOS - MOTOR DEL GLOBO TERRÁQUEO 3D & DINO TRACKERS
//  Visualizador Satelital de Avistamientos Globales (Huellas Mundiales 1-29)
//  Vanilla Canvas 2D/3D Orthographic Engine - Pure 60 FPS Lag-free
// ==========================================================================

(function () {
  'use strict';

  // Esperar a que el DOM y los datos estén listos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGloboTrackers);
  } else {
    initGloboTrackers();
  }

  function initGloboTrackers() {
    const canvas = document.getElementById('globo-3d-canvas');
    const container = document.getElementById('globo-container');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Verificar que los datos existan
    const HUELLAS = window.HUELLAS_DATA || { countries: {}, species: [] };
    const CONTINENTS = window.WORLD_CONTINENTS || [];

    // Mapeo país -> lista de especies
    const countrySpeciesMap = {};
    Object.keys(HUELLAS.countries).forEach(function (cName) {
      countrySpeciesMap[cName] = [];
    });

    let totalSightings = 0;
    HUELLAS.species.forEach(function (sp) {
      if (Array.isArray(sp.countries)) {
        sp.countries.forEach(function (cName) {
          if (!countrySpeciesMap[cName]) {
            countrySpeciesMap[cName] = [];
          }
          countrySpeciesMap[cName].push(sp);
          totalSightings++;
        });
      }
    });

    // Actualizar contadores en la barra de telemetría (filtrando únicamente sectores con avistamientos)
    const activeCountriesList = Object.keys(HUELLAS.countries).filter(function (cName) {
      return countrySpeciesMap[cName] && countrySpeciesMap[cName].length > 0;
    });
    const statPaises = document.getElementById('globo-stat-paises');
    const statEspecies = document.getElementById('globo-stat-especies');
    const statAvist = document.getElementById('globo-stat-avistamientos');
    if (statPaises) statPaises.textContent = activeCountriesList.length;
    if (statEspecies) statEspecies.textContent = HUELLAS.species.length;
    if (statAvist) statAvist.textContent = totalSightings;

    // Estado del Render y Cámara
    const state = {
      mode: '3d', // '3d' o '2d'
      yaw: -1.2, // Longitud de rotación inicial (apuntando hacia América / Atlántico)
      pitch: 0.35, // Latitud de inclinación
      targetYaw: -1.2,
      targetPitch: 0.35,
      isAnimatingFly: false,
      zoom: 1.0,
      targetZoom: 1.0,
      panX: 0,
      panY: 0,
      targetPanX: 0,
      targetPanY: 0,
      autoRotate: true,
      userInteracting: false,
      idleTimer: null,
      lastTime: performance.now(),
      pulsePhase: 0,
      hoveredCountry: null,
      selectedCountry: null,
      width: 0,
      height: 0,
      dpr: 1
    };

    // Pre-calcular coordenadas esféricas de los continentes
    // CONTINENTS es un array de polígonos: [[ [lon, lat], ... ], ...]
    const precomputedContinents = CONTINENTS.map(function (ring) {
      return ring.map(function (pt) {
        const lon = pt[0];
        const lat = pt[1];
        const phi = (lat * Math.PI) / 180;
        const lam = (lon * Math.PI) / 180;
        return {
          lon: lon,
          lat: lat,
          cosLat: Math.cos(phi),
          sinLat: Math.sin(phi),
          lam: lam
        };
      });
    });

    // Pre-calcular datos de países (SOLO sectores con avistamientos confirmados)
    const countryNodes = Object.keys(HUELLAS.countries)
      .filter(function (cName) {
        return countrySpeciesMap[cName] && countrySpeciesMap[cName].length > 0;
      })
      .map(function (cName) {
      const c = HUELLAS.countries[cName];
      const phi = (c.lat * Math.PI) / 180;
      const lam = (c.lon * Math.PI) / 180;
      return {
        name: cName,
        lat: c.lat,
        lon: c.lon,
        flag: c.flag || '📍',
        shortLabel: c.shortLabel || null,
        countryGroup: c.countryGroup || cName,
        locationName: c.locationName || cName,
        sector: c.sector || 'SECTOR GLOBAL',
        species: countrySpeciesMap[cName] || [],
        count: (countrySpeciesMap[cName] || []).length,
        cosLat: Math.cos(phi),
        sinLat: Math.sin(phi),
        lam: lam,
        screenX: 0,
        screenY: 0,
        visible: false
      };
    });

    // Ordenar países por número de especies descendente
    countryNodes.sort(function (a, b) {
      return b.count - a.count;
    });

    // Puntos Tácticos InGen: Isla Nublar y Las Cinco Muertes
    const INGEN_ISLAND_SITES = [
      {
        name: 'Isla Nublar (Site A - Jurassic Park)',
        shortLabel: 'NUBLAR',
        badge: 'SITE A',
        lat: 9.8032,
        lon: -88.6119,
        flag: '🏝️',
        coordsText: '9°48\'11.4"N, 88°36\'42.9"W',
        distanceText: '120 MILES AL SO DE COSTA RICA',
        sector: 'SECTOR ARCHIPIÉLAGO INGEN // SITE A'
      },
      {
        name: 'Las Cinco Muertes (Site B - Isla Sorna)',
        shortLabel: '5 MUERTES',
        badge: 'SITE B',
        lat: 8.95,
        lon: -89.78,
        flag: '☠️',
        coordsText: '8°57\'00"N, 89°46\'48"W',
        distanceText: '207 MILES AL SO DE COSTA RICA (87 MI AL SO DE NUBLAR)',
        sector: 'SECTOR LAS CINCO MUERTES // SITE B'
      }
    ];

    INGEN_ISLAND_SITES.forEach(function (site) {
      const phi = (site.lat * Math.PI) / 180;
      const lam = (site.lon * Math.PI) / 180;
      site.cosLat = Math.cos(phi);
      site.sinLat = Math.sin(phi);
      site.lam = lam;
      site.screenX = 0;
      site.screenY = 0;
      site.visible = false;
    });

    // Referencia costera Costa Rica para cartas de navegación náutica
    const COSTA_RICA_REF = {
      lat: 9.98,
      lon: -84.84,
      cosLat: Math.cos((9.98 * Math.PI) / 180),
      sinLat: Math.sin((9.98 * Math.PI) / 180),
      lam: (-84.84 * Math.PI) / 180
    };

    // Redimensionar Canvas adaptativamente
    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      state.dpr = dpr;
      state.width = rect.width;
      state.height = rect.height;

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ==========================================
    //  PROYECCIONES MATEMÁTICAS (3D y 2D)
    // ==========================================

    // Proyección 3D Ortográfica
    function project3D(cosLat, sinLat, lam, cx, cy, R, yaw, pitch) {
      const dLam = lam - yaw;
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      // Coordenadas cartesianas esféricas antes de rotar inclinación
      const xSphere = cosLat * Math.sin(dLam);
      const ySphere = sinLat;
      const zSphere = cosLat * Math.cos(dLam);

      // Rotación en Pitch (inclinación del eje polar)
      const yRot = ySphere * cosPitch - zSphere * sinPitch;
      const zRot = ySphere * sinPitch + zSphere * cosPitch;

      return {
        x: cx + xSphere * R,
        y: cy - yRot * R,
        z: zRot,
        visible: zRot > 0.001
      };
    }

    // Proyección 2D Planisferio (Equirrectangular Cilíndrica)
    function project2D(lon, lat, cx, cy, w, h, zoom, panX, panY) {
      const scaleX = (w * 0.88 * zoom) / 360;
      const scaleY = (h * 0.78 * zoom) / 180;
      return {
        x: cx + lon * scaleX + panX,
        y: cy - lat * scaleY + panY,
        z: 1,
        visible: true
      };
    }

    // ==========================================
    //  BUCLE PRINCIPAL DE RENDERIZADO (60 FPS)
    // ==========================================

    function render(timestamp) {
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.1);
      state.lastTime = timestamp;
      state.pulsePhase += dt * 1.5;

      // Suavizado FlyTo
      if (state.isAnimatingFly) {
        state.yaw += (state.targetYaw - state.yaw) * 0.08;
        state.pitch += (state.targetPitch - state.pitch) * 0.08;
        state.zoom += (state.targetZoom - state.zoom) * 0.08;
        state.panX += (state.targetPanX - state.panX) * 0.08;
        state.panY += (state.targetPanY - state.panY) * 0.08;

        if (
          Math.abs(state.targetYaw - state.yaw) < 0.005 &&
          Math.abs(state.targetPitch - state.pitch) < 0.005
        ) {
          state.yaw = state.targetYaw;
          state.pitch = state.targetPitch;
          state.isAnimatingFly = false;
        }
      } else if (state.autoRotate && !state.userInteracting && state.mode === '3d') {
        state.yaw += 0.0025; // Rotación lenta y cinematográfica
      }

      ctx.save();
      ctx.scale(state.dpr, state.dpr);

      const w = state.width;
      const h = state.height;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.42 * state.zoom;

      ctx.clearRect(0, 0, w, h);

      if (state.mode === '3d') {
        renderGlobe3D(cx, cy, R);
      } else {
        renderMap2D(cx, cy, w, h);
      }

      renderMarkers(cx, cy, R, w, h);

      ctx.restore();

      requestAnimationFrame(render);
    }

    // ==========================================
    //  RENDER 3D: GLOBO TERRÁQUEO ORTOGRÁFICO
    // ==========================================

    function renderGlobe3D(cx, cy, R) {
      // 1. Halo atmosférico exterior
      const atmosGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.18);
      atmosGrad.addColorStop(0, 'rgba(0, 229, 176, 0.22)');
      atmosGrad.addColorStop(0.5, 'rgba(0, 160, 220, 0.1)');
      atmosGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmosGrad;
      ctx.fill();

      // 2. Fondo del Océano con sombreado esférico
      const oceanGrad = ctx.createRadialGradient(
        cx - R * 0.35,
        cy - R * 0.35,
        R * 0.1,
        cx,
        cy,
        R
      );
      oceanGrad.addColorStop(0, '#0a2228');
      oceanGrad.addColorStop(0.5, '#051419');
      oceanGrad.addColorStop(1, '#02070a');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Recortar todo el contenido a la esfera
      ctx.clip();

      // 3. Graticule (Paralelos y Meridianos)
      drawGraticule3D(cx, cy, R);

      // 4. Polígonos de Continentes
      drawContinents3D(cx, cy, R);

      // 5. Brillo de borde esférico interno (Limb darkening / Fresnel)
      const innerGlow = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R);
      innerGlow.addColorStop(0, 'rgba(0, 229, 176, 0)');
      innerGlow.addColorStop(0.85, 'rgba(0, 229, 176, 0.08)');
      innerGlow.addColorStop(1, 'rgba(0, 229, 176, 0.35)');

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      ctx.restore();

      // Anillo exterior nítido del globo
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 176, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Dibujar meridianos y paralelos en el globo
    function drawGraticule3D(cx, cy, R) {
      ctx.lineWidth = 0.75;

      // Paralelos (Latitud: -60, -30, 0, 30, 60)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.strokeStyle = lat === 0 ? 'rgba(0, 229, 176, 0.35)' : 'rgba(0, 229, 176, 0.1)';
        ctx.beginPath();
        let started = false;
        const phi = (lat * Math.PI) / 180;
        const cosLat = Math.cos(phi);
        const sinLat = Math.sin(phi);

        for (let lon = -180; lon <= 180; lon += 6) {
          const lam = (lon * Math.PI) / 180;
          const p = project3D(cosLat, sinLat, lam, cx, cy, R, state.yaw, state.pitch);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Meridianos (Longitud cada 45°)
      for (let lon = -180; lon < 180; lon += 45) {
        ctx.strokeStyle = lon === 0 ? 'rgba(0, 229, 176, 0.35)' : 'rgba(0, 229, 176, 0.1)';
        ctx.beginPath();
        let started = false;
        const lam = (lon * Math.PI) / 180;

        for (let lat = -85; lat <= 85; lat += 5) {
          const phi = (lat * Math.PI) / 180;
          const p = project3D(Math.cos(phi), Math.sin(phi), lam, cx, cy, R, state.yaw, state.pitch);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }
    }

    // Dibujar continentes en 3D
    function drawContinents3D(cx, cy, R) {
      ctx.fillStyle = 'rgba(2, 45, 34, 0.65)';
      ctx.strokeStyle = 'rgba(0, 229, 176, 0.7)';
      ctx.lineWidth = 1.0;

      for (let i = 0; i < precomputedContinents.length; i++) {
        const ring = precomputedContinents[i];
        if (ring.length < 3) continue;

        ctx.beginPath();
        let anyVisible = false;
        let started = false;

        for (let j = 0; j < ring.length; j++) {
          const v = ring[j];
          const p = project3D(v.cosLat, v.sinLat, v.lam, cx, cy, R, state.yaw, state.pitch);

          if (p.visible) {
            anyVisible = true;
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }

        if (anyVisible) {
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // ==========================================
    //  RENDER 2D: PLANISFERIO TÁCTICO
    // ==========================================

    function renderMap2D(cx, cy, w, h) {
      // Fondo táctico
      ctx.fillStyle = '#030a0d';
      ctx.fillRect(0, 0, w, h);

      // Rejilla de coordenadas tácticas
      ctx.strokeStyle = 'rgba(0, 229, 176, 0.12)';
      ctx.lineWidth = 0.8;

      const scaleX = (w * 0.88 * state.zoom) / 360;
      const scaleY = (h * 0.78 * state.zoom) / 180;

      for (let lon = -180; lon <= 180; lon += 30) {
        const x = cx + lon * scaleX + state.panX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let lat = -90; lat <= 90; lat += 30) {
        const y = cy - lat * scaleY + state.panY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Línea del Ecuador destacada
      const eqY = cy + state.panY;
      ctx.strokeStyle = 'rgba(0, 229, 176, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, eqY);
      ctx.lineTo(w, eqY);
      ctx.stroke();

      // Continentes en 2D
      ctx.fillStyle = 'rgba(2, 45, 34, 0.65)';
      ctx.strokeStyle = 'rgba(0, 229, 176, 0.7)';
      ctx.lineWidth = 1.0;

      for (let i = 0; i < CONTINENTS.length; i++) {
        const ring = CONTINENTS[i];
        if (ring.length < 3) continue;

        ctx.beginPath();
        for (let j = 0; j < ring.length; j++) {
          const pt = ring[j];
          const x = cx + pt[0] * scaleX + state.panX;
          const y = cy - pt[1] * scaleY + state.panY;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // ==========================================
    //  MARCADORES DE PAÍSES Y RADAR BEACONS
    // ==========================================

    function renderMarkers(cx, cy, R, w, h) {
      for (let i = 0; i < countryNodes.length; i++) {
        const node = countryNodes[i];
        let p;

        if (state.mode === '3d') {
          p = project3D(
            node.cosLat,
            node.sinLat,
            node.lam,
            cx,
            cy,
            R,
            state.yaw,
            state.pitch
          );
        } else {
          p = project2D(node.lon, node.lat, cx, cy, w, h, state.zoom, state.panX, state.panY);
        }

        node.screenX = p.x;
        node.screenY = p.y;
        node.visible = p.visible;

        if (!p.visible) continue;

        const isHovered = state.hoveredCountry === node.name;
        const isSelected = state.selectedCountry === node.name;

        // 1. Ondas de pulso de radar satelital (Sonar)
        const pulseOffsets = [0, 0.33, 0.66];
        pulseOffsets.forEach(function (off) {
          const phase = (state.pulsePhase + off) % 1.0;
          const ringR = 6 + phase * 22;
          const alpha = (1 - phase) * 0.7;

          ctx.beginPath();
          ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = isHovered || isSelected
            ? 'rgba(255, 140, 0, ' + alpha + ')'
            : 'rgba(0, 229, 176, ' + alpha + ')';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // 2. Punto central del Beacon
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isSelected ? '#ff8c00' : '#00e5b0';
        ctx.shadowColor = isHovered || isSelected ? '#ff8c00' : '#00e5b0';
        ctx.shadowBlur = isHovered ? 14 : 8;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // 3. Etiqueta con Bandera y Contador
        const badgeText = (node.shortLabel ? (node.flag + ' ' + node.shortLabel) : node.flag) + ' ' + node.count;
        ctx.font = 'bold 10px "Share Tech Mono", monospace';
        const badgeW = ctx.measureText(badgeText).width + 10;
        const badgeH = 16;
        const badgeX = p.x + 8;
        const badgeY = p.y - 18;

        // Fondo de la placa
        ctx.fillStyle = isHovered || isSelected
          ? 'rgba(255, 140, 0, 0.95)'
          : 'rgba(3, 12, 16, 0.88)';
        ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : 'rgba(0, 229, 176, 0.5)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
        ctx.fill();
        ctx.stroke();

        // Texto de la placa
        ctx.fillStyle = isHovered || isSelected ? '#060a0e' : '#00e5b0';
        ctx.fillText(badgeText, badgeX + 5, badgeY + 12);
      }

      // ==========================================
      // RUTAS NÁUTICAS Y BALIZAS INGEN (COSTA RICA)
      // ==========================================
      const pCR = state.mode === '3d'
        ? project3D(COSTA_RICA_REF.cosLat, COSTA_RICA_REF.sinLat, COSTA_RICA_REF.lam, cx, cy, R, state.yaw, state.pitch)
        : project2D(COSTA_RICA_REF.lon, COSTA_RICA_REF.lat, cx, cy, w, h, state.zoom, state.panX, state.panY);

      const pNub = INGEN_ISLAND_SITES[0];
      const pNubScreen = state.mode === '3d'
        ? project3D(pNub.cosLat, pNub.sinLat, pNub.lam, cx, cy, R, state.yaw, state.pitch)
        : project2D(pNub.lon, pNub.lat, cx, cy, w, h, state.zoom, state.panX, state.panY);

      const pSorna = INGEN_ISLAND_SITES[1];
      const pSornaScreen = state.mode === '3d'
        ? project3D(pSorna.cosLat, pSorna.sinLat, pSorna.lam, cx, cy, R, state.yaw, state.pitch)
        : project2D(pSorna.lon, pSorna.lat, cx, cy, w, h, state.zoom, state.panX, state.panY);

      // Líneas de navegación náutica tácticas
      if (pNubScreen.visible && pSornaScreen.visible) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(0, 229, 176, 0.45)';
        ctx.lineWidth = 1.1;

        // Vector Nublar <-> Sorna (87 MILES)
        ctx.beginPath();
        ctx.moveTo(pNubScreen.x, pNubScreen.y);
        ctx.lineTo(pSornaScreen.x, pSornaScreen.y);
        ctx.stroke();

        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillStyle = 'rgba(0, 255, 204, 0.9)';
        const midX1 = (pNubScreen.x + pSornaScreen.x) / 2;
        const midY1 = (pNubScreen.y + pSornaScreen.y) / 2;
        ctx.fillText('87 MI', midX1 + 6, midY1);

        if (pCR.visible) {
          // Vector Costa Rica <-> Nublar (120 MILES)
          ctx.beginPath();
          ctx.moveTo(pCR.x, pCR.y);
          ctx.lineTo(pNubScreen.x, pNubScreen.y);
          ctx.stroke();
          const midX2 = (pCR.x + pNubScreen.x) / 2;
          const midY2 = (pCR.y + pNubScreen.y) / 2;
          ctx.fillText('120 MI', midX2 + 4, midY2 - 4);

          // Vector Costa Rica <-> Las Cinco Muertes (207 MILES)
          ctx.beginPath();
          ctx.moveTo(pCR.x, pCR.y);
          ctx.lineTo(pSornaScreen.x, pSornaScreen.y);
          ctx.stroke();
          const midX3 = (pCR.x + pSornaScreen.x) / 2;
          const midY3 = (pCR.y + pSornaScreen.y) / 2;
          ctx.fillText('207 MI', midX3 - 28, midY3 + 12);
        }
        ctx.restore();
      }

      // Marcadores y Placas Baliza de Islas InGen
      for (let s = 0; s < INGEN_ISLAND_SITES.length; s++) {
        const site = INGEN_ISLAND_SITES[s];
        const sp = state.mode === '3d'
          ? project3D(site.cosLat, site.sinLat, site.lam, cx, cy, R, state.yaw, state.pitch)
          : project2D(site.lon, site.lat, cx, cy, w, h, state.zoom, state.panX, state.panY);

        site.screenX = sp.x;
        site.screenY = sp.y;
        site.visible = sp.visible;
        if (!sp.visible) continue;

        const isHovered = state.hoveredCountry === site.name;

        // Pulso satelital ámbar/dorado
        const phase = (state.pulsePhase + 0.5) % 1.0;
        const ringR = 8 + phase * 24;
        const alpha = (1 - phase) * 0.85;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 183, 0, ' + alpha + ')';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Punto central del Beacon
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, isHovered ? 6.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb700';
        ctx.shadowColor = '#ffb700';
        ctx.shadowBlur = isHovered ? 16 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Placa InGen
        const badgeText = site.flag + ' ' + site.shortLabel + ' [' + site.badge + ']';
        ctx.font = 'bold 10px "Share Tech Mono", monospace';
        const badgeW = ctx.measureText(badgeText).width + 10;
        const badgeH = 16;
        const badgeX = sp.x + 8;
        const badgeY = sp.y - 18;

        ctx.fillStyle = isHovered ? 'rgba(255, 183, 0, 0.95)' : 'rgba(15, 28, 20, 0.92)';
        ctx.strokeStyle = isHovered ? '#ffffff' : '#ffb700';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHovered ? '#050c08' : '#ffcf40';
        ctx.fillText(badgeText, badgeX + 5, badgeY + 12);
      }
    }

    // ==========================================
    //  INTERACCIÓN: RATÓN, TACTIL Y ZOOM
    // ==========================================

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startYaw = 0;
    let startPitch = 0;
    let startPanX = 0;
    let startPanY = 0;

    function resetIdleTimer() {
      state.userInteracting = true;
      if (state.idleTimer) clearTimeout(state.idleTimer);
      state.idleTimer = setTimeout(function () {
        state.userInteracting = false;
      }, 3500);
    }

    function onPointerDown(e) {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      dragStartX = e.clientX - rect.left;
      dragStartY = e.clientY - rect.top;
      startYaw = state.yaw;
      startPitch = state.pitch;
      startPanX = state.panX;
      startPanY = state.panY;
      resetIdleTimer();
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        resetIdleTimer();
        const dx = mouseX - dragStartX;
        const dy = mouseY - dragStartY;

        if (state.mode === '3d') {
          // Rotar esfera
          state.yaw = startYaw - dx * 0.007;
          state.pitch = Math.max(-1.35, Math.min(1.35, startPitch + dy * 0.007));
        } else {
          // Desplazar mapa plano
          state.panX = startPanX + dx;
          state.panY = startPanY + dy;
        }
        return;
      }

      // Hit-testing de países y balizas InGen al pasar el cursor
      let found = null;
      let isIngenSite = false;
      for (let i = 0; i < countryNodes.length; i++) {
        const node = countryNodes[i];
        if (!node.visible) continue;
        const distSq = (mouseX - node.screenX) ** 2 + (mouseY - node.screenY) ** 2;
        if (distSq < 22 * 22) {
          found = node;
          break;
        }
      }

      if (!found) {
        for (let s = 0; s < INGEN_ISLAND_SITES.length; s++) {
          const site = INGEN_ISLAND_SITES[s];
          if (!site.visible) continue;
          const distSq = (mouseX - site.screenX) ** 2 + (mouseY - site.screenY) ** 2;
          if (distSq < 25 * 25) {
            found = site;
            isIngenSite = true;
            break;
          }
        }
      }

      const tooltip = document.getElementById('globo-hover-tooltip');
      if (found) {
        canvas.style.cursor = 'pointer';
        state.hoveredCountry = found.name;

        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = found.screenX + 'px';
          tooltip.style.top = found.screenY + 'px';
          const ttCountry = tooltip.querySelector('.tt-country');
          const ttCount = tooltip.querySelector('.tt-count');
          if (ttCountry) ttCountry.innerHTML = found.flag + ' ' + found.name;
          if (ttCount) {
            if (isIngenSite) {
              ttCount.innerHTML = '<span style="color:#ffb700;font-weight:700;">INSTALACIÓN INGEN CLASIFICADA</span><br>' +
                                  '<span style="color:#80c8a0;font-size:0.75rem;">' + found.coordsText + ' &bull; ' + found.distanceText + '</span>';
            } else {
              ttCount.textContent = found.count + ' ' + (found.count === 1 ? 'avistamiento confirmado' : 'avistamientos confirmados');
            }
          }
        }
      } else {
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
        state.hoveredCountry = null;
        if (tooltip) tooltip.style.display = 'none';
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      const moved = Math.hypot(endX - dragStartX, endY - dragStartY);

      isDragging = false;

      // Si fue un click limpio (sin arrastre)
      if (moved < 5) {
        checkMarkerClick(endX, endY);
      }
    }

    function checkMarkerClick(x, y) {
      for (let i = 0; i < countryNodes.length; i++) {
        const node = countryNodes[i];
        if (!node.visible) continue;
        const distSq = (x - node.screenX) ** 2 + (y - node.screenY) ** 2;
        if (distSq < 25 * 25) {
          openCountryDossier(node.name);
          return;
        }
      }

      for (let s = 0; s < INGEN_ISLAND_SITES.length; s++) {
        const site = INGEN_ISLAND_SITES[s];
        if (!site.visible) continue;
        const distSq = (x - site.screenX) ** 2 + (y - site.screenY) ** 2;
        if (distSq < 26 * 26) {
          flyToCoords(site.lon, site.lat, 1.6);
          return;
        }
      }
    }

    function onWheel(e) {
      e.preventDefault();
      resetIdleTimer();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      state.zoom = Math.max(0.65, Math.min(2.8, state.zoom * zoomFactor));
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Soporte táctil móvil
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (e.changedTouches.length === 1) {
        onPointerUp(e.changedTouches[0]);
      }
    }, { passive: true });

    // ==========================================
    //  FLYTO: NAVEGACIÓN SUAVE HACIA UN PAÍS
    // ==========================================

    function flyToCoords(lon, lat, zoom) {
      state.isAnimatingFly = true;
      resetIdleTimer();

      const targetYaw = (lon * Math.PI) / 180;
      const targetPitch = (lat * Math.PI) / 180;

      let dy = (targetYaw - state.yaw) % (Math.PI * 2);
      if (dy > Math.PI) dy -= Math.PI * 2;
      if (dy < -Math.PI) dy += Math.PI * 2;

      state.targetYaw = state.yaw + dy;
      state.targetPitch = Math.max(-1.1, Math.min(1.1, targetPitch));
      state.targetZoom = zoom || 1.35;

      const w = state.width;
      const h = state.height;
      const scaleX = (w * 0.88 * state.targetZoom) / 360;
      const scaleY = (h * 0.78 * state.targetZoom) / 180;
      state.targetPanX = -lon * scaleX;
      state.targetPanY = lat * scaleY;
    }

    function flyToCountry(cName) {
      const country = HUELLAS.countries[cName];
      if (!country) return;

      state.selectedCountry = cName;
      flyToCoords(country.lon, country.lat, 1.15);
      highlightSideList(cName);
    }

    // ==========================================
    //  LISTA LATERAL Y FILTRO DE BÚSQUEDA
    // ==========================================

    const sideList = document.getElementById('globo-countries-list');
    const searchInput = document.getElementById('globo-search-input');

    function populateCountriesList(filterText) {
      if (!sideList) return;
      sideList.innerHTML = '';
      const filter = (filterText || '').toLowerCase().trim();

      countryNodes.forEach(function (node) {
        // Filtrar por nombre de país o por nombres de especies que viven ahí
        const matchesCountry = node.name.toLowerCase().includes(filter);
        const matchesSpecies = node.species.some(function (sp) {
          return sp.name.toLowerCase().includes(filter);
        });

        if (filter && !matchesCountry && !matchesSpecies) return;

        const card = document.createElement('div');
        card.className = 'globo-country-card' + (state.selectedCountry === node.name ? ' active' : '');
        card.setAttribute('data-country', node.name);

        card.innerHTML =
          '<div class="globo-country-info">' +
          '  <span class="globo-country-flag">' + node.flag + '</span>' +
          '  <div>' +
          '    <div class="globo-country-name">' + node.name + '</div>' +
          '    <div style="font-size:0.65rem;color:#607868;font-family:monospace;">' + node.sector + '</div>' +
          '  </div>' +
          '</div>' +
          '<span class="globo-country-badge">' + node.count + ' ' + (node.count === 1 ? 'avist.' : 'avist.') + '</span>';

        card.addEventListener('click', function () {
          flyToCountry(node.name);
          openCountryDossier(node.name);
        });

        sideList.appendChild(card);
      });
    }

    function highlightSideList(cName) {
      if (!sideList) return;
      const cards = sideList.querySelectorAll('.globo-country-card');
      cards.forEach(function (c) {
        if (c.getAttribute('data-country') === cName) {
          c.classList.add('active');
          c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          c.classList.remove('active');
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        populateCountriesList(this.value);
      });
    }

    populateCountriesList('');

    // ==========================================
    //  BOTONES DE CONTROL SUPERIOR
    // ==========================================

    const btn3D = document.getElementById('globo-btn-3d');
    const btn2D = document.getElementById('globo-btn-2d');
    const btnAuto = document.getElementById('globo-btn-autorotate');
    const btnReset = document.getElementById('globo-btn-reset');

    if (btn3D) {
      btn3D.addEventListener('click', function () {
        state.mode = '3d';
        btn3D.classList.add('active');
        if (btn2D) btn2D.classList.remove('active');
      });
    }

    if (btn2D) {
      btn2D.addEventListener('click', function () {
        state.mode = '2d';
        btn2D.classList.add('active');
        if (btn3D) btn3D.classList.remove('active');
        state.panX = 0;
        state.panY = 0;
        state.targetPanX = 0;
        state.targetPanY = 0;
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', function () {
        state.autoRotate = !state.autoRotate;
        this.innerHTML = state.autoRotate ? '⏸️ PAUSA' : '▶ ROTAR';
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.targetYaw = -1.2;
        state.targetPitch = 0.35;
        state.targetZoom = 1.0;
        state.targetPanX = 0;
        state.targetPanY = 0;
        state.isAnimatingFly = true;
        state.selectedCountry = null;
        highlightSideList(null);
      });
    }

    // ==========================================
    //  MODAL DE EXPEDIENTE DINO TRACKERS
    // ==========================================

    const modal = document.getElementById('globo-dossier-modal');
    const modalFlag = document.getElementById('globo-modal-flag');
    const modalCountry = document.getElementById('globo-modal-country');
    const modalSector = document.getElementById('globo-modal-sector');
    const modalTabs = document.getElementById('globo-modal-tabs');
    const modalBody = document.getElementById('globo-modal-body');
    const modalClose = document.getElementById('globo-modal-close');

    function openCountryDossier(cName, selectedSpeciesIndex) {
      // Soporte para alias (ej. 'México', 'Mexico', 'CDMX', 'Guerrero')
      if (!HUELLAS.countries[cName]) {
        const lower = String(cName).toLowerCase();
        for (let k in HUELLAS.countries) {
          const c = HUELLAS.countries[k];
          if (
            k.toLowerCase() === lower ||
            (c.countryGroup && c.countryGroup.toLowerCase() === lower) ||
            (c.shortLabel && c.shortLabel.toLowerCase() === lower) ||
            (c.locationName && c.locationName.toLowerCase().includes(lower))
          ) {
            cName = k;
            break;
          }
        }
      }
      const country = HUELLAS.countries[cName];
      const speciesList = countrySpeciesMap[cName] || [];
      if (!country || speciesList.length === 0) return;

      state.selectedCountry = cName;
      flyToCountry(cName);

      if (modalFlag) modalFlag.textContent = country.flag || '📍';
      if (modalCountry) modalCountry.textContent = cName.toUpperCase();
      if (modalSector) {
        modalSector.innerHTML =
          (country.sector || 'SECTOR GLOBAL') +
          ' &bull; <span style="color:#00f5ff;font-weight:700;">' +
          speciesList.length +
          '</span> ' +
          (speciesList.length === 1 ? 'AVISTAMIENTO REGISTRADO' : 'AVISTAMIENTOS REGISTRADOS');
      }

      // Renderizar pestañas horizontales de especies
      if (modalTabs) {
        modalTabs.innerHTML = '';
        speciesList.forEach(function (sp, idx) {
          const tab = document.createElement('button');
          tab.className = 'globo-species-tab' + (idx === (selectedSpeciesIndex || 0) ? ' active' : '');
          tab.textContent = sp.name;
          tab.addEventListener('click', function () {
            modalTabs.querySelectorAll('.globo-species-tab').forEach(function (t) {
              t.classList.remove('active');
            });
            tab.classList.add('active');
            renderSpeciesDossier(sp, cName);
          });
          modalTabs.appendChild(tab);
        });
      }

      // Renderizar la primera especie por defecto
      const activeIndex = selectedSpeciesIndex || 0;
      renderSpeciesDossier(speciesList[activeIndex], cName);

      if (modal) {
        modal.classList.add('open');
      }
    }

    // Renderizar cuerpo del expediente de una especie específica
    function renderSpeciesDossier(sp, currentCountry) {
      if (!modalBody) return;

      // Determinación de la empresa clonadora / estilo
      let empresaClass = 'empresa-ingen';
      const empUpper = (sp.empresa || 'InGen').toUpperCase();
      if (empUpper.includes('BIOSYN')) empresaClass = 'empresa-biosyn';
      else if (empUpper.includes('MASRANI')) empresaClass = 'empresa-masrani';
      else if (empUpper.includes('MANTAH')) empresaClass = 'empresa-mantah';
      else if (empUpper.includes('ILEGAL') || empUpper.includes('DESCONOCIDA')) empresaClass = 'empresa-ilegal';

      const cData = HUELLAS.countries[currentCountry] || {};
      let locationLabel = cData.locationName || currentCountry;
      if (sp.location_details && sp.location_details[currentCountry]) {
        locationLabel = sp.location_details[currentCountry];
      }

      // Otros países donde también se vio este dinosaurio
      let otherCountriesHtml = '';
      if (Array.isArray(sp.countries) && sp.countries.length > 1) {
        const others = sp.countries.filter(function (c) {
          return c !== currentCountry;
        });
        if (others.length > 0) {
          otherCountriesHtml =
            '<div class="globo-other-countries-box">' +
            '  <div class="globo-other-title">🌍 OTROS SECTORES CON AVISTAMIENTOS CONFIRMADOS:</div>' +
            '  <div class="globo-other-tags-list">' +
            others
              .map(function (c) {
                const otherData = HUELLAS.countries[c] || {};
                const flag = otherData.flag || '📍';
                const dispName = otherData.locationName || c;
                return (
                  '<span class="globo-other-tag" data-target-country="' +
                  c +
                  '">' +
                  flag +
                  ' ' +
                  dispName +
                  '</span>'
                );
              })
              .join('') +
            '  </div>' +
            '</div>';
        }
      }

      // Evidencia fotográfica de avistamiento DPW
      let sightingCardHtml = '';
      let sightingPhotoUrls = [];
      if (sp.sighting_photos && typeof sp.sighting_photos === 'object') {
        let rawPhotos = sp.sighting_photos[currentCountry];
        if (!rawPhotos) {
          const cLower = (currentCountry || '').toLowerCase();
          const keys = Object.keys(sp.sighting_photos);
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const kLower = k.toLowerCase();
            if (kLower === cLower || cLower.includes(kLower) || kLower.includes(cLower)) {
              rawPhotos = sp.sighting_photos[k];
              break;
            }
          }
        }
        if (rawPhotos) {
          if (Array.isArray(rawPhotos)) {
            sightingPhotoUrls = rawPhotos;
          } else {
            sightingPhotoUrls = [rawPhotos];
          }
        }
      }

      if (sightingPhotoUrls.length > 0) {
        sightingPhotoUrls.forEach(function (pUrl, idx) {
          const badgeText = sightingPhotoUrls.length > 1
            ? '📸 EVIDENCIA DE AVISTAMIENTO (' + (idx + 1) + '/' + sightingPhotoUrls.length + ')'
            : '📸 EVIDENCIA FOTOGRÁFICA DE AVISTAMIENTO';
          sightingCardHtml +=
            '    <div class="globo-sighting-card" data-full-src="' +
            pUrl +
            '" data-caption="Avistamiento de ' +
            sp.name +
            ' // ' +
            locationLabel +
            '" title="Click para ver en grande">' +
            '      <div class="globo-sighting-badge">' + badgeText + '</div>' +
            '      <img class="globo-sighting-img" src="' +
            pUrl +
            '" alt="Avistamiento de ' +
            sp.name +
            ' en ' +
            locationLabel +
            '">' +
            '      <div class="globo-media-caption">Registro de campo // ' +
            locationLabel +
            '</div>' +
            '      <div class="globo-sighting-zoom-hint"><span>🔍</span> Click para ampliar imagen</div>' +
            '    </div>';
        });
      }

      modalBody.innerHTML =
        '<div class="globo-dossier-grid">' +
        '  <!-- COLUMNA VISUAL (FOTOGRAFÍAS / RENDERS OFICIALES) -->' +
        '  <div class="globo-dossier-media">' +
        sightingCardHtml +
        '    <div class="globo-portrait-card">' +
        '      <img class="globo-portrait-img" src="' +
        sp.portrait_img +
        '" alt="' +
        sp.name +
        ' - Ficha oficial">' +
        '      <div class="globo-media-caption">Imagen proporcionada por la DPW</div>' +
        '    </div>' +
        '    <div class="globo-render-card">' +
        '      <img class="globo-render-img" src="' +
        sp.render_img +
        '" alt="' +
        sp.name +
        ' - Render anatómico">' +
        '      <div class="globo-media-caption">Registro de Tamaño // DPW Scale</div>' +
        '    </div>' +
        '  </div>' +
        '  <!-- COLUMNA DE DATOS TÉCNICOS Y PROTOCOLO DE SUPERVIVENCIA -->' +
        '  <div class="globo-dossier-details">' +
        '    <div class="globo-spec-header">' +
        '      <div class="globo-spec-name">' +
        sp.name.toUpperCase() +
        '</div>' +
        '      <span class="globo-spec-empresa-tag ' +
        empresaClass +
        '">CLONADO POR: ' +
        (sp.empresa || 'InGen') +
        '</span>' +
        '      <span class="globo-spec-empresa-tag" style="background:rgba(0,245,255,0.15);border:1px solid #00f5ff;color:#00f5ff;margin-left:6px;">DIETA: ' +
        (sp.dieta || 'Carnívora') +
        '</span>' +
        '      <div class="globo-location-badge">' +
        '        <span class="globo-loc-pin">📍</span>' +
        '        <span class="globo-loc-text">PUNTO DE AVISTAMIENTO: <strong>' + locationLabel + '</strong></span>' +
        '      </div>' +
        '    </div>' +
        '    <!-- CUADRO DE MÉTRICAS BIOLÓGICAS -->' +
        '    <div class="globo-metrics-grid">' +
        '      <div class="globo-metric-cell">' +
        '        <div class="globo-metric-label">⚖️ PESO ESTIMADO</div>' +
        '        <div class="globo-metric-value">' +
        (sp.peso || 'N/D') +
        '</div>' +
        '      </div>' +
        '      <div class="globo-metric-cell">' +
        '        <div class="globo-metric-label">📏 ALTURA ESTIMADA</div>' +
        '        <div class="globo-metric-value">' +
        (sp.altura || 'N/D') +
        '</div>' +
        '      </div>' +
        '      <div class="globo-metric-cell">' +
        '        <div class="globo-metric-label">📐 LONGITUD MÁXIMA</div>' +
        '        <div class="globo-metric-value">' +
        (sp.longitud || 'N/D') +
        '</div>' +
        '      </div>' +
        '      <div class="globo-metric-cell">' +
        '        <div class="globo-metric-label">📄 REGISTRO INGEN</div>' +
        '        <div class="globo-metric-value">HUELLA #' +
        String(sp.slide).padStart(2, '0') +
        '</div>' +
        '      </div>' +
        '    </div>' +
        '    <!-- PROTOCOLO DE CONTACTO DIRECTO -->' +
        '    <div class="globo-protocol-box">' +
        '      <div class="globo-protocol-title">⚠️ QUÉ HACER SI SE ENCUENTRA CON UNO:</div>' +
        '      <div class="globo-protocol-desc">' +
        (sp.protocolo || 'Mantenga la distancia y no realice movimientos bruscos. Busque refugio inmediato.') +
        '</div>' +
        '    </div>' +
        otherCountriesHtml +
        '  </div>' +
        '</div>';

      // Event listeners para los tags de otros países
      const otherTags = modalBody.querySelectorAll('.globo-other-tag');
      otherTags.forEach(function (tag) {
        tag.addEventListener('click', function () {
          const targetC = this.getAttribute('data-target-country');
          if (targetC) {
            openCountryDossier(targetC);
          }
        });
      });

      // Event listeners para visualización ampliada en Lightbox de alta resolución
      const sightingCards = modalBody.querySelectorAll('.globo-sighting-card');
      sightingCards.forEach(function (card) {
        card.addEventListener('click', function (e) {
          e.stopPropagation();
          const fullSrc = this.getAttribute('data-full-src');
          const caption = this.getAttribute('data-caption');
          if (fullSrc) openLightbox(fullSrc, caption);
        });
      });

      const portraitCard = modalBody.querySelector('.globo-portrait-card');
      if (portraitCard) {
        portraitCard.style.cursor = 'zoom-in';
        portraitCard.setAttribute('title', 'Click para ver en grande');
        portraitCard.addEventListener('click', function (e) {
          e.stopPropagation();
          openLightbox(sp.portrait_img, sp.name + ' // Imagen oficial proporcionada por la DPW');
        });
      }

      const renderCard = modalBody.querySelector('.globo-render-card');
      if (renderCard) {
        renderCard.style.cursor = 'zoom-in';
        renderCard.setAttribute('title', 'Click para ver en grande');
        renderCard.addEventListener('click', function (e) {
          e.stopPropagation();
          openLightbox(sp.render_img, sp.name + ' // Registro Anatómico y Escala de Tamaño DPW');
        });
      }
    }

    function closeModal() {
      if (modal) modal.classList.remove('open');
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    // Elementos del visor Lightbox en alta resolución
    const lightbox = document.getElementById('globo-lightbox');
    const lightboxBackdrop = document.getElementById('globo-lightbox-backdrop');
    const lightboxClose = document.getElementById('globo-lightbox-close');
    const lightboxImg = document.getElementById('globo-lightbox-img');
    const lightboxTitle = document.getElementById('globo-lightbox-title');

    function openLightbox(src, caption) {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = src;
      if (lightboxTitle) lightboxTitle.textContent = caption || 'Evidencia de Campo';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImg) lightboxImg.src = '';
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (lightbox && lightbox.classList.contains('open')) {
          closeLightbox();
          e.stopPropagation();
          return;
        }
        closeModal();
      }
    });

    // Exponer funciones globales
    window.openDinoTracker = openCountryDossier;
    window.openCountryDossier = openCountryDossier;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.flyToCoords = flyToCoords;

    // Iniciar loop de renderizado
    requestAnimationFrame(render);
  }
})();
