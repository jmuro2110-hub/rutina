/* ============================================================
   Servidor de notificaciones (OPCIONAL) — ver NOTIFICATIONS_SETUP.md
   ------------------------------------------------------------
   Pega aquí la URL de tu Worker de Cloudflare, sin "/" al final.
   Ejemplo: 'https://rutina-push.tu-usuario.workers.dev'
   No es un secreto: la clave privada vive solo en Cloudflare.
   Si se queda vacío, la rutina funciona igual y los avisos
   aparecen como "Sin configurar".
   ============================================================ */
const PUSH = {
  servidor: 'https://rutina-push.jmuro2110-941.workers.dev'
};
