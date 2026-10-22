// ============================================================
//  EXPEDIENTES JURÁSICOS — CONFIGURACIÓN DE MANTENIMIENTO
//  ESTADO: MANTENIMIENTO **ACTIVADO**
//  ➜  Los usuarios verán la pantalla de bloqueo con el Compy.
// ============================================================

window.MAINTENANCE_CONFIG = {
    active: true,   // ← MANTENIMIENTO ENCENDIDO

    adminPin: "1993",

    title: "SITIO WEB EN MANTENIMIENTO",
    errorCode: "ERROR 404: SITE SECURITY GRID IS TEMPORARILY DOWN",
    rebootMessage: "HOLD ONTO YOUR BUTTS! REBOOTING SYSTEMS...",

    minigame: {
        enabled: true,
        targetCatches: 3,
        compySpeedMultiplier: 1.4,
        evasionRadius: 110,
        biteDuration: 850,
        damagePerBite: 1.2
    }
};
