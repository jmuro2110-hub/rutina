/* Pruebas de la rutina y del servidor de avisos. Se ejecutan en el navegador. */

const salida = document.getElementById('salida');
let total = 0, fallos = 0, grupo = null;

function seccion(nombre) {
  const h = document.createElement('h2'); h.textContent = nombre; salida.appendChild(h);
  grupo = document.createElement('ul'); salida.appendChild(grupo);
}
function prueba(nombre, cond, detalle) {
  total++;
  if (!cond) fallos++;
  const li = document.createElement('li');
  li.className = cond ? 'ok' : 'mal';
  li.textContent = (cond ? '✓ ' : '✗ ') + nombre + (!cond && detalle ? ' — ' + detalle : '');
  grupo.appendChild(li);
}

const DIAS_ES = ORDEN;
const LV = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const FINDE = ['sabado', 'domingo'];
// bloques de la línea del día (la ventana de fisio va aparte: no ocupa tiempo)
const bl = k => DIAS[k].bloques.filter(b => b.e > b.s && !b.ventana);
const buscar = (k, nombre) => bl(k).filter(b => b.a === nombre);

/* ============================================================
   1. Horarios
   ============================================================ */
seccion('Horarios de los 7 días');

DIAS_ES.forEach(k => {
  const b = bl(k);
  prueba(k + ': sin conflictos de horario', DIAS[k].avisos.length === 0, DIAS[k].avisos.join(' '));
  prueba(k + ': empieza a las 06:55', b[0].s === toMin('6:55'), fmt(b[0].s));
  let contiguo = true;
  for (let i = 1; i < b.length; i++) if (b[i].s !== b[i - 1].e) contiguo = false;
  prueba(k + ': bloques seguidos, sin huecos ni encimados', contiguo);
  const sueno = b[b.length - 1];
  prueba(k + ': dormido 23:00 → despierta 06:55', sueno.c === 'sueno' && sueno.s === 1380 && sueno.e === 1440 + 415,
         fmt(sueno.s) + '–' + fmt(sueno.e));
  let cubre = true;
  for (let m = 0; m < 1440; m++) {
    const n = b.filter(x => (m >= x.s && m < x.e) || (m + 1440 >= x.s && m + 1440 < x.e)).length;
    if (n !== 1) { cubre = false; break; }
  }
  prueba(k + ': cada minuto del día tiene exactamente una actividad', cubre);
});

seccion('Duchas, clases y fisio');
LV.forEach(k => {
  const ducha = buscar(k, 'Ducha + vestirte')[0];
  const primeraClase = bl(k).find(b => b.c === 'escuela');
  prueba(k + ': ducha antes de la primera clase', ducha && primeraClase && ducha.e <= primeraClase.s,
         ducha && primeraClase ? fmt(ducha.e) + ' vs ' + fmt(primeraClase.s) : 'falta');
  const fis = DIAS[k].bloques.filter(b => b.c === 'fisio');
  prueba(k + ': fisio = UNA actividad, horario variable 11:30–13:30',
         fis.length === 1 && fis[0].ventana && fis[0].variable && fis[0].s === 690 && fis[0].e === 810);
  prueba(k + ': sin sesiones de fisio inventadas en la línea', !bl(k).some(b => b.c === 'fisio'));
  prueba(k + ': las clases de la franja siguen en su lugar',
         bl(k).filter(b => b.c === 'escuela' && b.s < 810 && b.e > 690).every(b => b.e - b.s === 30));
  const marcables = DIAS[k].bloques.filter(b => b.c !== 'sueno' && b.c !== 'margen' && b.e > b.s);
  prueba(k + ': la fisio se marca una sola vez', marcables.filter(b => b.c === 'fisio').length === 1);
  const t = bl(k).filter(b => b.c === 'tareas');
  prueba(k + ': un bloque de tareas escolares de 60–90 min', t.length === 1 && t[0].e - t[0].s >= 60 && t[0].e - t[0].s <= 90,
         t.map(x => textoDur(x)).join());
  prueba(k + ': tareas separadas de habilidad', bl(k).filter(b => b.c === 'habilidad').every(b => !/tarea/i.test(b.a)));
  ['Preparar + desayunar', 'Preparar + comer', 'Preparar + cenar'].forEach(n =>
    prueba(k + ': ' + n, buscar(k, n).length === 1));
});
function textoDur(b) { return (b.e - b.s) + ' min'; }

FINDE.forEach(k => {
  prueba(k + ': sin fisio, sin clases, sin tareas', !bl(k).some(b => ['fisio', 'escuela', 'tareas'].indexOf(b.c) > -1));
  const entreno = buscar(k, 'Entreno (pesas)')[0], ducha = buscar(k, 'Ducha')[0];
  prueba(k + ': ducha de 20 min justo después del entreno (como antes)', entreno && ducha && ducha.s === entreno.e && ducha.e - ducha.s === 20);
  prueba(k + ': sin ducha de mañana entre semana', buscar(k, 'Ducha + vestirte').length === 0);
  prueba(k + ': preparar + comer y cenar', buscar(k, 'Preparar + comer').length === 1 && buscar(k, 'Preparar + cenar').length === 1);
});

const rob = DIAS_ES.map(k => buscar(k, 'Robótica').map(b => k + ' ' + fmt(b.s) + '–' + fmt(b.e))).flat();
prueba('Robótica solo miércoles 08:00–08:30', rob.length === 1 && rob[0] === 'miercoles 08:00–08:30', rob.join());
const tea = DIAS_ES.map(k => buscar(k, 'Teatro').map(b => k + ' ' + fmt(b.s) + '–' + fmt(b.e))).flat();
prueba('Teatro solo jueves 08:50–09:20', tea.length === 1 && tea[0] === 'jueves 08:50–09:20', tea.join());
const duchaX = buscar('miercoles', 'Ducha + vestirte')[0];
prueba('Miércoles: listo antes de las 08:00', duchaX.e <= 480 && buscar('miercoles', 'Preparar + desayunar')[0].e <= 480);

seccion('Casa, plantas y lenguaje');
DIAS_ES.forEach(k => {
  const r = buscar(k, 'Reset de casa')[0];
  prueba(k + ': reset de casa de 15–25 min', r && r.e - r.s >= 15 && r.e - r.s <= 25);
});
const plantas = DIAS_ES.filter(k => buscar(k, 'Regar plantas').length);
prueba('Regar plantas solo los lunes, 5 min', plantas.length === 1 && plantas[0] === 'lunes' &&
       buscar('lunes', 'Regar plantas')[0].e - buscar('lunes', 'Regar plantas')[0].s === 5);
const super_ = DIAS_ES.map(k => buscar(k, 'Súper + plan de comidas').map(b => k + ' ' + fmt(b.s) + '–' + fmt(b.e))).flat();
prueba('Súper + plan de comidas: domingo 11:20–12:20', super_.length === 1 && super_[0] === 'domingo 11:20–12:20', super_.join());
const textos = DIAS_ES.map(k => bl(k).map(b => b.a + ' ' + (b.sub || '') + ' ' + CAT[b.c].l).join(' ')).join(' ') +
               Object.keys(CAT).map(c => CAT[c].l).join(' ');
prueba('Ninguna acupuntura ni traslados', !/acupunt|acupunct|traslado/i.test(textos));
prueba('Sin "buffer" ni "ocio"', !/buffer|ocio/i.test(textos));
prueba('Todas las categorías usadas existen', DIAS_ES.every(k => bl(k).every(b => CAT[b.c])));

/* ============================================================
   2. Servidor de avisos (Worker) con KV y push simulados
   ============================================================ */
const enc = new TextEncoder(), dec = new TextDecoder();
const b64u = buf => btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const b = atob(s + '='.repeat((4 - s.length % 4) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
const unir = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; a.forEach(x => { o.set(x, i); i += x.length; }); return o; };

async function hkdf(salt, ikm, info, n) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, n * 8));
}
// descifrado independiente según RFC 8291 (lo que hace el teléfono)
async function descifrar(cuerpo, uaPriv, uaPub, auth) {
  const salt = cuerpo.slice(0, 16), idlen = cuerpo[20];
  const asPub = cuerpo.slice(21, 21 + idlen), ct = cuerpo.slice(21 + idlen);
  const asKey = await crypto.subtle.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, uaPriv, 256));
  const ikm = await hkdf(auth, secreto, unir(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, aes, ct));
  let fin = pt.length - 1; while (fin >= 0 && pt[fin] === 0) fin--;
  if (pt[fin] !== 2) throw new Error('delimitador incorrecto');
  return dec.decode(pt.slice(0, fin));
}

async function servidor() {
  seccion('Cifrado Web Push (RFC 8291)');
  // vector oficial de la sección 5 del RFC 8291
  try {
    const uaPubRaw = deB64u('BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4');
    const uaPriv = await crypto.subtle.importKey('jwk', {
      kty: 'EC', crv: 'P-256', d: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
      x: b64u(uaPubRaw.slice(1, 33)), y: b64u(uaPubRaw.slice(33))
    }, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const cuerpo = deB64u('DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
    const texto = await descifrar(cuerpo, uaPriv, uaPubRaw, deB64u('BTBZMqHH6r4Tts7J_aSIgg'));
    prueba('El descifrado de prueba coincide con el vector oficial del RFC', texto === 'When I grow up, I want to be a watermelon', texto);
  } catch (e) { prueba('El descifrado de prueba coincide con el vector oficial del RFC', false, e.message); }

  const worker = (await import('../push-server/worker.js')).default;

  // claves VAPID de prueba y "teléfono" de prueba
  const vapid = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const vapidPub = b64u(await crypto.subtle.exportKey('raw', vapid.publicKey));
  const vapidPriv = (await crypto.subtle.exportKey('jwk', vapid.privateKey)).d;
  const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const uaPub = new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const endpoint = 'https://web.push.apple.com/QPRUEBA123';

  const kv = new Map();
  const env = {
    VAPID_PUBLIC_KEY: vapidPub, VAPID_PRIVATE_KEY: vapidPriv, VAPID_SUBJECT: 'mailto:prueba@example.com',
    ALLOWED_ORIGINS: 'https://jmuro2110-hub.github.io',
    RUTINA_KV: {
      get: async (k, t) => { const v = kv.has(k) ? kv.get(k) : null; return v === null ? null : (t === 'json' ? JSON.parse(v) : v); },
      put: async (k, v) => { kv.set(k, v); },
      delete: async k => { kv.delete(k); }
    }
  };

  // push simulado: captura lo que el Worker mandaría a Apple
  let enviados = [], respuestaPush = 201;
  const fetchReal = globalThis.fetch;
  globalThis.fetch = async (url, op) => {
    if (String(url).indexOf('https://web.push.apple.com/') === 0) {
      enviados.push({ url: String(url), op });
      return new Response(null, { status: respuestaPush });
    }
    return fetchReal(url, op);
  };
  const pedir = (ruta, metodo, cuerpo, origen) => worker.fetch({
    method: metodo, url: 'https://rutina-push.test' + ruta,
    headers: new Headers(origen ? { Origin: origen } : {}),
    text: async () => cuerpo || ''
  }, env);
  const ORIGEN = 'https://jmuro2110-hub.github.io';
  const correr = async isoUtc => { let p; await worker.scheduled({ scheduledTime: Date.parse(isoUtc) }, env, { waitUntil: x => { p = x; } }); await p; };
  async function leer(n) {
    const e = enviados[n];
    return JSON.parse(await descifrar(new Uint8Array(e.op.body), ua.privateKey, uaPub, auth));
  }

  // mismo horario que manda avisos.js
  const SIN = { sueno: 1, margen: 1, libre: 1 };
  const dias = {};
  ORDEN.forEach(k => {
    dias[k] = DIAS[k].bloques.filter((b, i) => i > 0 && b.e > b.s && !SIN[b.c] && claveDe(b) === b.s)
      .map(b => ({ s: b.s, k: claveDe(b), a: b.ventana ? 'Ventana de fisioterapia' : b.a,
                   d: b.variable ? 'Horario variable · ' + VENTANA_FISIO : fmt(b.s) + '–' + fmt(b.e) }));
  });
  const colacion2X = buscar('miercoles', 'Colación 2')[0].s;
  const sync = (lead, extra) => JSON.stringify(Object.assign({
    subscription: { endpoint, keys: { p256dh: b64u(uaPub), auth: b64u(auth) } },
    lead, tz: 'America/Mexico_City', dias, porWd: POR_WD,
    hechas: { fecha: '2026-09-23', lista: [colacion2X] }
  }, extra || {}));

  try {
    seccion('Servidor de avisos');
    let r = await pedir('/vapid', 'GET', null, ORIGEN);
    prueba('GET /vapid entrega la clave pública', r.status === 200 && (await r.json()).clave === vapidPub);
    r = await pedir('/sync', 'POST', sync(5), 'https://otro-sitio.example');
    prueba('Rechaza orígenes que no son tu página', r.status === 403);
    r = await pedir('/sync', 'POST', sync(5, { subscription: { endpoint: 'https://example.com/x', keys: { p256dh: 'a', auth: 'b' } } }), ORIGEN);
    prueba('Rechaza endpoints que no son de un servicio de push', r.status === 400);
    r = await pedir('/sync', 'POST', sync(5), ORIGEN);
    prueba('POST /sync guarda la suscripción', r.status === 200 && JSON.parse(kv.get('subs')).length === 1);
    prueba('CORS permite tu página', r.headers.get('Access-Control-Allow-Origin') === ORIGEN);

    // Miércoles 23 sep 2026: Francés 12:50 → aviso 12:45 CDMX = 18:45 UTC
    enviados = [];
    await correr('2026-09-23T18:44:00Z');
    prueba('Un minuto antes no avisa', enviados.length === 0);
    await correr('2026-09-23T18:45:00Z');
    prueba('5 min antes de Francés manda exactamente 1 aviso', enviados.length === 1);
    const m = enviados.length ? await leer(0) : {};
    prueba('El aviso se descifra y dice "En 5 min: Francés"', m.title === 'En 5 min: Francés', JSON.stringify(m));
    const h = enviados.length ? enviados[0].op.headers : {};
    prueba('Cabeceras Web Push correctas', h['Content-Encoding'] === 'aes128gcm' && h.TTL === '600' && /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/.test(h.Authorization));
    const jwt = (h.Authorization || '').slice(8).split(',')[0].split('.');
    const valida = jwt.length === 3 && await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, vapid.publicKey,
      deB64u(jwt[2]), enc.encode(jwt[0] + '.' + jwt[1]));
    const claims = jwt.length === 3 ? JSON.parse(dec.decode(deB64u(jwt[1]))) : {};
    prueba('Firma VAPID válida y dirigida a Apple', valida && claims.aud === 'https://web.push.apple.com' &&
           claims.exp - Date.now() / 1000 <= 86400 && claims.sub === 'mailto:prueba@example.com');
    await correr('2026-09-23T18:45:00Z');
    prueba('Si el cron corre dos veces en el mismo minuto, no repite', enviados.length === 1);

    enviados = [];
    await correr('2026-09-23T17:25:00Z');   // 11:25 → fisio 11:30
    const f = enviados.length ? await leer(0) : {};
    prueba('Fisio: un solo aviso, "En 5 min: Ventana de fisioterapia" · Horario variable 11:30–13:30',
           enviados.length === 1 && f.title === 'En 5 min: Ventana de fisioterapia' && f.body === 'Horario variable · 11:30–13:30', JSON.stringify(f));
    await correr('2026-09-23T18:25:00Z');   // 12:25 → hueco entre Física III y Francés
    prueba('Fisio: ningún otro aviso dentro de la ventana', enviados.length === 1);
    await correr('2026-09-23T16:40:00Z');   // 10:40 → tiempo libre 10:45
    prueba('No avisa de tiempo libre', enviados.length === 1);
    await correr('2026-09-23T13:50:00Z');   // 07:50 → margen 07:55
    prueba('No avisa de márgenes', enviados.length === 1);
    const t = colacion2X - 5, iso = '2026-09-23T' + String(Math.floor(t / 60) + 6).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') + ':00Z';
    await correr(iso);
    prueba('No avisa de lo que ya marcaste como hecho', enviados.length === 1);

    enviados = [];
    await correr('2026-09-24T14:45:00Z');   // jueves 08:45 → Teatro 08:50
    prueba('Jueves: aviso de Teatro a las 08:45', enviados.length === 1 && (await leer(0)).title === 'En 5 min: Teatro');

    await pedir('/sync', 'POST', sync(0), ORIGEN);
    enviados = [];
    await correr('2026-09-23T14:00:00Z');   // miércoles 08:00 → Robótica
    prueba('Con "al empezar": "Ahora: Robótica" a las 08:00', enviados.length === 1 && (await leer(0)).title === 'Ahora: Robótica');

    await pedir('/sync', 'POST', sync(10), ORIGEN);
    enviados = [];
    await correr('2026-09-28T13:10:00Z');   // lunes 07:10 → preparar + desayunar 07:20
    await correr('2026-09-28T19:20:00Z');   // lunes 13:20 → preparar + comer 13:30
    prueba('Con 10 min: avisos del lunes a las 07:10 y 13:20', enviados.length === 2 &&
           (await leer(0)).title === 'En 10 min: Preparar + desayunar' &&
           (await leer(1)).title === 'En 10 min: Preparar + comer');

    enviados = [];
    r = await pedir('/test', 'POST', JSON.stringify({ endpoint }), ORIGEN);
    prueba('POST /test manda un aviso de prueba', r.status === 200 && enviados.length === 1 && (await leer(0)).tag === 'prueba');

    respuestaPush = 410;
    await correr('2026-09-23T19:10:00Z');   // 13:20 comer con 10 min
    prueba('Si Apple dice que la suscripción caducó (410), se borra', !kv.has('sub:' + JSON.parse(kv.get('subs') || '[]')[0]) && JSON.parse(kv.get('subs')).length === 0);
    respuestaPush = 201;

    await pedir('/sync', 'POST', sync(5), ORIGEN);
    r = await pedir('/unsubscribe', 'POST', JSON.stringify({ endpoint }), ORIGEN);
    prueba('POST /unsubscribe la borra', r.status === 200 && JSON.parse(kv.get('subs')).length === 0);

    const sinClaves = Object.assign({}, env, { VAPID_PRIVATE_KEY: '' });
    r = await worker.fetch({ method: 'GET', url: 'https://x.test/vapid', headers: new Headers(), text: async () => '' }, sinClaves);
    prueba('Sin claves configuradas responde 503 (no rompe)', r.status === 503);
  } catch (e) {
    prueba('El servidor se ejecuta sin errores', false, e && (e.stack || e.message));
  } finally {
    globalThis.fetch = fetchReal;
  }
}

await servidor();
const res = document.getElementById('resumen');
res.textContent = fallos ? fallos + ' de ' + total + ' pruebas fallaron' : 'Las ' + total + ' pruebas pasaron';
res.className = fallos ? 'mal' : 'ok';
window.RESULTADO = { total, fallos };
