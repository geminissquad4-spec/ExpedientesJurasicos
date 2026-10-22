// ============================================================
//  EXPEDIENTES JURÁSICOS — PANEL DE CONTROL DE MANTENIMIENTO
// ============================================================
//  - Para poner la página EN MANTENIMIENTO: cambia active a true
//  - Para RESTAURAR la página normal:      cambia active a false
// ============================================================

window.MAINTENANCE_CONFIG = {
    // ESTADO PRINCIPAL:
    // true  = Muestra la pantalla de mantenimiento y el minijuego del Compy
    // false = La página web funciona de manera 100% normal
    active: true,

    // Código PIN para que tú como administrador puedas desbloquear
    // la vista previa en el navegador sin editar código (Atajo: Ctrl + Shift + M)
    adminPin: "1993",

    // Textos informativos oficiales
    title: "SITIO WEB EN MANTENIMIENTO",
    errorCode: "ERROR 404: SITE SECURITY GRID IS TEMPORARILY DOWN",
    rebootMessage: "HOLD ONTO YOUR BUTTS! REBOOTING SYSTEMS...",

    // Configuración del minijuego del Compy
    minigame: {
        enabled: true,
        targetCatches: 3,         // Cantidad de veces que hay que atraparlo para contenerlo
        compySpeedMultiplier: 1.4, // Velocidad del Compy (más alto = más difícil)
        evasionRadius: 110,        // Radio de detección del cursor para esquivar (px)
        biteDuration: 850,        // Tiempo que se detiene a morder cables antes de huir (ms)
        damagePerBite: 1.2        // Daño por segundo a la red eléctrica
    }
};
