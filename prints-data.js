// =============================================
//  EXPEDIENTES JURÁSICOS — prints-data.js
//  Colección de 112 Prints en 4K (33.87 x 19.07 cm)
// =============================================

var PRINTS_CATEGORIES = [
    {
        id: "jp-kenner",
        title: "Jurassic Park Kenner",
        tag: "KENNER 1993",
        badgeColor: "#00e5b0",
        startSlide: 1,
        endSlide: 12,
        count: 12,
        coverSlide: 1,
        desc: "Colección clásica de arte de empaque y figuras de acción Kenner de Jurassic Park (1993)."
    },
    {
        id: "jp-kenner-s2",
        title: "Jurassic Park Kenner Serie 2",
        tag: "KENNER SERIE 2",
        badgeColor: "#00cfff",
        startSlide: 13,
        endSlide: 24,
        count: 12,
        coverSlide: 13,
        desc: "Línea expandida de dinosaurios y vehículos Kenner Serie 2 con esquemas de color alternativos."
    },
    {
        id: "tlw-kenner",
        title: "The Lost World: Jurassic Park Kenner",
        tag: "THE LOST WORLD",
        badgeColor: "#ff3030",
        startSlide: 25,
        endSlide: 45,
        count: 21,
        coverSlide: 25,
        desc: "Ilustraciones icónicas y artes de empaque de la línea The Lost World: Jurassic Park de Kenner (1997)."
    },
    {
        id: "tlw-kenner-s2",
        title: "The Lost World: Jurassic Park Kenner Serie 2",
        tag: "TLW SERIE 2",
        badgeColor: "#ff6b00",
        startSlide: 46,
        endSlide: 48,
        count: 3,
        coverSlide: 46,
        desc: "Piezas exclusivas y raras de la segunda oleada de The Lost World Kenner."
    },
    {
        id: "warpath",
        title: "Warpath: Jurassic Park",
        tag: "WARPATH (PS1)",
        badgeColor: "#d4a017",
        startSlide: 49,
        endSlide: 64,
        count: 16,
        coverSlide: 49,
        desc: "Prints conmemorativos del legendario videojuego de combate de dinosaurios para PlayStation (1999)."
    },
    {
        id: "jpog",
        title: "Jurassic Park: Operation Genesis",
        tag: "OPERATION GENESIS",
        badgeColor: "#5dff6a",
        startSlide: 65,
        endSlide: 90,
        count: 26,
        coverSlide: 65,
        desc: "Galería completa inspirada en el simulador de gestión y construcción de parques por excelencia (2003)."
    },
    {
        id: "jp-hasbro",
        title: "Jurassic Park Hasbro",
        tag: "HASBRO",
        badgeColor: "#ff007f",
        startSlide: 91,
        endSlide: 98,
        count: 8,
        coverSlide: 91,
        desc: "Artes y diseños de la era Hasbro para las líneas Jurassic Park 3 y conmemorativas."
    },
    {
        id: "calendario-2027",
        title: "Calendario 2027",
        tag: "CALENDARIO 2027",
        badgeColor: "#c0c0ff",
        startSlide: 99,
        endSlide: 112,
        count: 14,
        coverSlide: 99,
        desc: "Edición especial completa del calendario temático de expedientes con los 12 meses y portadas exclusivas."
    }
];

// Helper para generar el listado de imágenes de una categoría
function getPrintsForCategory(cat) {
    var list = [];
    for (var s = cat.startSlide; s <= cat.endSlide; s++) {
        var numStr = String(s).padStart(3, '0');
        list.push({
            slide: s,
            numStr: numStr,
            indexInCat: s - cat.startSlide + 1,
            totalInCat: cat.count,
            title: cat.title + " #" + (s - cat.startSlide + 1),
            src: "prints/print_" + numStr + ".jpg",
            downloadName: cat.id + "_print_" + numStr + "_4K.jpg"
        });
    }
    return list;
}
