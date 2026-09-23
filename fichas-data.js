// =============================================
//  EXPEDIENTES JURÁSICOS — fichas-data.js
//  Datos de las 315 Fichas de Historia
// =============================================

// Categorías según numeración:
// 01–103:   Especie de dominio público
// 104–108:  Empresa implicada
// 109–117:  Personajes que hicieron historia
// 118–198:  De película
// 199–244:  De novela
// 245:      Tributo
// 246–315:  Juguetes

function getFichaCategoria(num) {
    if (num >= 1   && num <= 103) return { label: 'ESPECIE',    clase: 'cat-especie',    color: '#00e5b0' };
    if (num >= 104 && num <= 108) return { label: 'EMPRESA',    clase: 'cat-empresa',    color: '#ff6b00' };
    if (num >= 109 && num <= 117) return { label: 'PERSONAJE',  clase: 'cat-personaje',  color: '#d4a017' };
    if (num >= 118 && num <= 198) return { label: 'PELÍCULA',   clase: 'cat-pelicula',   color: '#ff3030' };
    if (num >= 199 && num <= 244) return { label: 'NOVELA',     clase: 'cat-novela',     color: '#b080ff' };
    if (num === 245)              return { label: 'TRIBUTO',    clase: 'cat-tributo',    color: '#ffd700' };
    if (num >= 246 && num <= 315) return { label: 'JUGUETES',   clase: 'cat-juguetes',   color: '#00cfff' };
    return { label: '???', clase: 'cat-unknown', color: '#607868' };
}

// Sonidos SOLO para fichas de Especie (001 a 103) y Personaje (109 a 117)
// Excluidas expresamente: Empresa (104-108), Película (118-198), Novela (199-244), Tributo (245) y Juguetes (246-315)
function getFichaSonido(numInt, numStr) {
    if ((numInt >= 1 && numInt <= 103) || (numInt >= 109 && numInt <= 117)) {
        return numStr + '.mp4';
    }
    return null;
}


// Narraciones de IA disponibles para todas las fichas (narracion_001.mp3 a narracion_315.mp3 en la raíz)
function getFichaNarracion(numInt, numStr) {
    if (numInt >= 1 && numInt <= 315) {
        return 'narracion_' + numStr + '.mp3';
    }
    return null;
}

// Videos para fichas de 118 a 153 (en la raíz: 118.mp4 a 153.mp4)
function getFichaVideo(numInt, numStr) {
    if (numInt >= 118 && numInt <= 153) {
        return numStr + '.mp4';
    }
    return null;
}




// Genera el array de 315 fichas
// Las imágenes: fichas/frente_XXX.jpg y fichas/reverso_XXX.jpg
var FICHAS = (function() {
    var arr = [];
    for (var i = 1; i <= 315; i++) {
        var cat = getFichaCategoria(i);
        var num = String(i).padStart(3, '0');
        arr.push({
            id: i,
            num: num,
            categoria: cat.label,
            clase: cat.clase,
            color: cat.color,
            frenteImg: 'fichas/frente_' + num + '.jpg',
            reversoImg: 'fichas/reverso_' + num + '.jpg',
            sonido: getFichaSonido(i, num),
            narracion: getFichaNarracion(i, num),
            video: getFichaVideo(i, num)
        });
    }
    return arr;
})();


