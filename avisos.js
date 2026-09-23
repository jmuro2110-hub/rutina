/* ============================================================
   Rutina de JP — notificaciones (Web Push estándar con VAPID)
   ------------------------------------------------------------
   Todo aquí es opcional. Si el navegador no lo admite, si la app
   no está instalada en el iPhone o si aún no configuras el servidor,
   la rutina funciona igual y este panel solo explica por qué.

   Cómo funciona: el iPhone se suscribe al servicio de push de Apple
   y le manda al servidor (Cloudflare Worker) la suscripción, tu
   horario y lo que ya marcaste. El servidor, cada minuto, decide si
   toca avisar y manda el push; iOS lo muestra aunque la app esté cerrada.
   ============================================================ */
(function () {
  const LS = 'rutina_avisos';
  const LEADS = [0, 5, 10];
  const SIN_AVISO = { sueno: 1, margen: 1, libre: 1 };  // no se avisa de esto

  const ICON_BELL = '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2z"/><path d="M10 21a2.2 2.2 0 0 0 4 0"/>';
  const ICON_BELL_OFF = ICON_BELL + '<path d="M4 4l16 16"/>';
  const svg = p => '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';

  let prefs = leer();
  let estadoUI = 'cargando';
  let mensaje = '';
  let ocupado = false;
  let espera = null;
  let subActual = null;   // suscripción en memoria: permite sincronizar sin esperas al cerrar la app

  function leer() {
    try {
      const o = JSON.parse(localStorage.getItem(LS) || 'null');
      if (o && typeof o === 'object') {
        return { lead: LEADS.indexOf(o.lead) > -1 ? o.lead : 5, activo: !!o.activo, huella: o.huella || '' };
      }
    } catch (e) { /* ignora */ }
    return { lead: 5, activo: false, huella: '' };
  }
  function escribir() { try { localStorage.setItem(LS, JSON.stringify(prefs)); } catch (e) { } }

  const servidor = () => (typeof PUSH !== 'undefined' && PUSH && typeof PUSH.servidor === 'string')
    ? PUSH.servidor.trim().replace(/\/+$/, '') : '';
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = () => navigator.standalone === true ||
                          !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  const soporta = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  function registro() {
    return navigator.serviceWorker.getRegistration()
      .then(r => r || navigator.serviceWorker.register('sw.js'))
      .then(() => navigator.serviceWorker.ready);
  }

  /* ---------- lo que se manda al servidor ---------- */
  function detalle(b) {
    if (b.variable) return 'Horario variable · ' + VENTANA_FISIO;
    return fmt(b.s) + '–' + fmt(b.e) + (b.sub && b.sub.length <= 70 ? ' · ' + b.sub : '');
  }
  function horario() {
    const dias = {};
    ORDEN.forEach(k => {
      // el primer bloque es despertar: no tiene sentido avisarlo
      dias[k] = DIAS[k].bloques
        .filter((b, i) => i > 0 && b.e > b.s && !SIN_AVISO[b.c] && claveDe(b) === b.s)
        // la fisio no tiene hora fija: se avisa que empieza su ventana, no la cita
        .map(b => ({ s: b.s, k: claveDe(b), a: b.ventana ? 'Ventana de fisioterapia' : b.a, d: detalle(b) }));
    });
    return dias;
  }
  function armar(sub) {
    return {
      subscription: sub.toJSON(),
      lead: prefs.lead,
      tz: TZ,
      dias: horario(),
      porWd: POR_WD,
      hechas: { fecha: estado.fecha, lista: (estado.hechas && estado.hechas[diaDeHoy()]) || [] }
    };
  }
  function huella(txt) {
    let h = 5381;
    for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + ':' + txt.length;
  }
  function pedir(ruta, cuerpo) {
    // text/plain evita la petición previa de CORS; el servidor lo lee como JSON
    return fetch(servidor() + ruta, {
      method: 'POST', mode: 'cors', body: cuerpo,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      keepalive: cuerpo.length < 60000
    });
  }
  function aBytes(b64) {
    const pad = '='.repeat((4 - b64.length % 4) % 4);
    const bin = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function mismaClave(sub, bytes) {
    try {
      const k = sub.options && sub.options.applicationServerKey;
      if (!k) return true;
      const a = new Uint8Array(k);
      return a.length === bytes.length && a.every((v, i) => v === bytes[i]);
    } catch (e) { return true; }
  }

  async function sincronizar(forzar) {
    if (!prefs.activo || !servidor() || !soporta()) return false;
    try {
      let sub = subActual;
      if (!sub) { sub = await (await registro()).pushManager.getSubscription(); subActual = sub; }
      if (!sub) {
        prefs.activo = false; escribir();
        estadoUI = 'desactivadas'; pintarUI();
        return false;
      }
      const cuerpo = JSON.stringify(armar(sub));
      const h = huella(cuerpo);
      if (!forzar && h === prefs.huella) return true;
      const r = await pedir('/sync', cuerpo);
      if (!r.ok) throw new Error('El servidor respondió ' + r.status);
      prefs.huella = h; escribir();
      return true;
    } catch (e) {
      return false;   // sin internet: se reintenta en el siguiente cambio o al volver a abrir
    }
  }

  /* ---------- acciones del usuario ---------- */
  async function activar() {
    if (ocupado) return;
    ocupado = true; mensaje = ''; pintarUI();
    try {
      // iOS exige que el permiso se pida directamente desde el toque
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        estadoUI = permiso === 'denied' ? 'bloqueadas' : 'desactivadas';
        if (permiso !== 'denied') mensaje = 'No se concedió el permiso.';
        return;
      }
      const r = await fetch(servidor() + '/vapid', { mode: 'cors' });
      const j = r.ok ? await r.json() : null;
      if (!j || !j.clave) throw new Error('el servidor de avisos no respondió (revisa la URL en push-config.js).');
      const clave = aBytes(j.clave);

      const reg = await registro();
      let sub = await reg.pushManager.getSubscription();
      if (sub && !mismaClave(sub, clave)) { await sub.unsubscribe(); sub = null; }
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
      subActual = sub;

      prefs.activo = true; prefs.huella = ''; escribir();
      if (!(await sincronizar(true))) throw new Error('no se pudo guardar la suscripción en el servidor.');
      estadoUI = 'activadas';
      mensaje = '';
    } catch (e) {
      prefs.activo = false; escribir();
      estadoUI = (window.Notification && Notification.permission === 'denied') ? 'bloqueadas' : 'desactivadas';
      mensaje = 'No se pudo activar: ' + ((e && e.message) || 'error desconocido');
    } finally {
      ocupado = false; pintarUI();
    }
  }

  async function desactivar() {
    if (ocupado) return;
    ocupado = true; mensaje = ''; pintarUI();
    try {
      const reg = await registro();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        pedir('/unsubscribe', JSON.stringify({ endpoint: endpoint })).catch(() => { });
      }
    } catch (e) { /* aunque falle, localmente queda desactivado */ }
    subActual = null;
    prefs.activo = false; prefs.huella = ''; escribir();
    estadoUI = 'desactivadas';
    ocupado = false; pintarUI();
  }

  async function prueba() {
    if (ocupado) return;
    ocupado = true; mensaje = 'Enviando…'; pintarUI();
    try {
      await sincronizar(false);
      const reg = await registro();
      const sub = await reg.pushManager.getSubscription();
      if (!sub) throw new Error('no hay suscripción');
      const r = await pedir('/test', JSON.stringify({ endpoint: sub.endpoint }));
      mensaje = r.ok ? 'Prueba enviada: debería llegar en unos segundos.' : 'El servidor respondió ' + r.status + '.';
    } catch (e) {
      mensaje = 'No se pudo enviar la prueba: ' + ((e && e.message) || 'sin conexión');
    } finally {
      ocupado = false; pintarUI();
    }
  }

  /* ---------- estado y pintado ---------- */
  async function evaluar() {
    if (!soporta()) {
      estadoUI = (esIOS && !instalada()) ? 'instalar' : 'no-soportado';
      return pintarUI();
    }
    if (!servidor()) { estadoUI = 'sin-servidor'; return pintarUI(); }
    if (Notification.permission === 'denied') {
      if (prefs.activo) { prefs.activo = false; escribir(); }
      estadoUI = 'bloqueadas'; return pintarUI();
    }
    let sub = null;
    try { sub = await (await registro()).pushManager.getSubscription(); } catch (e) { }
    subActual = sub;
    if (prefs.activo && sub && Notification.permission === 'granted') {
      estadoUI = 'activadas'; pintarUI();
      sincronizar(false);
    } else {
      if (prefs.activo) { prefs.activo = false; escribir(); }
      estadoUI = 'desactivadas'; pintarUI();
    }
  }

  function textoLead(l) { return l === 0 ? 'al empezar' : l + ' min antes'; }

  function pintarUI() {
    const T = {
      cargando:       ['…', '', 'Comprobando…'],
      instalar:       ['No disponible', 'warn', 'En iPhone los avisos solo funcionan desde la app instalada (iOS 16.4 o más nuevo). En Safari toca <b>Compartir → Añadir a pantalla de inicio</b> y abre la rutina desde ese icono.'],
      'no-soportado': ['No disponible', 'warn', 'Este navegador no admite notificaciones push.'],
      'sin-servidor': ['Sin configurar', 'warn', 'Falta conectar el servidor de avisos (se hace una sola vez, ver <b>NOTIFICATIONS_SETUP.md</b>). Mientras tanto la rutina funciona igual.'],
      bloqueadas:     ['Bloqueadas', 'bad', 'Las notificaciones están bloqueadas. Actívalas en <b>Ajustes del iPhone → Notificaciones → Rutina</b> y vuelve a abrir la app.'],
      desactivadas:   ['Desactivadas', '', 'Recibe un aviso antes de cada actividad, aunque la app esté cerrada.'],
      activadas:      ['Activadas', 'ok', 'Te aviso <b>' + textoLead(prefs.lead) + '</b> de cada actividad, aunque la app esté cerrada.']
    };
    const t = T[estadoUI] || T.cargando;
    const activo = estadoUI === 'activadas';

    const pill = document.getElementById('avPill');
    pill.textContent = t[0];
    pill.className = 'pill' + (t[1] ? ' ' + t[1] : '');
    document.getElementById('avTxt').innerHTML = t[2] + (mensaje ? '<br><b>' + mensaje + '</b>' : '');

    const bell = document.getElementById('avBell');
    bell.innerHTML = svg(activo ? ICON_BELL : ICON_BELL_OFF);
    bell.classList.toggle('on', activo);
    bell.setAttribute('aria-label', 'Notificaciones: ' + t[0].toLowerCase());
    document.getElementById('avIc').innerHTML = svg(ICON_BELL);

    const boton = document.getElementById('avBoton');
    boton.textContent = activo ? 'Desactivar' : 'Activar notificaciones';
    boton.classList.toggle('off', activo);
    boton.disabled = ocupado || !(estadoUI === 'activadas' || estadoUI === 'desactivadas');
    document.getElementById('avPrueba').hidden = !activo;
    document.getElementById('avPrueba').disabled = ocupado;

    document.querySelectorAll('#avLead input').forEach(i => { i.checked = +i.value === prefs.lead; });
  }

  /* ---------- eventos ---------- */
  document.getElementById('avBoton').addEventListener('click', () => {
    if (estadoUI === 'activadas') desactivar(); else activar();
  });
  document.getElementById('avPrueba').addEventListener('click', prueba);
  document.querySelectorAll('#avLead input').forEach(i => i.addEventListener('change', () => {
    prefs.lead = +i.value; escribir(); pintarUI();
    sincronizar(false);
  }));
  document.getElementById('avBell').addEventListener('click', () => {
    const p = document.getElementById('panelAvisos');
    p.open = true;
    p.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { evaluar(); return; }
    // se está cerrando la app: manda ya lo pendiente (keepalive lo termina)
    if (espera) { clearTimeout(espera); espera = null; sincronizar(false); }
  });

  // se llama desde app.js al marcar/desmarcar: agrupa toques seguidos
  window.Avisos = {
    cambio: function () {
      if (!prefs.activo) return;
      clearTimeout(espera);
      espera = setTimeout(() => { espera = null; sincronizar(false); }, 1000);
    }
  };

  pintarUI();
  evaluar();
})();
