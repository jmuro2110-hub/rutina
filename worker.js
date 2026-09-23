/* ============================================================
   Rutina de JP — servidor de notificaciones (Cloudflare Worker)
   ------------------------------------------------------------
   Web Push estándar (RFC 8030 / 8291 / 8292) con VAPID, sin
   dependencias: todo el cifrado se hace con WebCrypto.

   Qué hace:
   · POST /sync         guarda la suscripción del iPhone, tu horario,
                        cuántos minutos antes avisar y lo ya marcado.
   · POST /unsubscribe  la borra.
   · POST /test         manda un aviso de prueba.
   · GET  /vapid        entrega la clave pública (no es secreta).
   · Cron cada minuto   si alguna actividad empieza dentro de
                        «lead» minutos (hora de Ciudad de México),
                        manda UN aviso. Nunca repite el mismo.

   Configuración (en Cloudflare, nunca en el repositorio):
   · KV namespace enlazado como  RUTINA_KV
   · VAPID_PUBLIC_KEY   (texto)   clave pública base64url
   · VAPID_PRIVATE_KEY  (secreto) clave privada base64url
   · VAPID_SUBJECT      (texto)   mailto:tu-correo
   · ALLOWED_ORIGINS    (texto)   https://jmuro2110-hub.github.io
   Pasos completos en NOTIFICATIONS_SETUP.md
   ============================================================ */

const TZ_DEF = 'America/Mexico_City';
const DIAS_OK = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
// solo se envía a servicios de push reales (evita usar el Worker contra otras URLs)
const HOSTS_PUSH = ['push.apple.com', 'fcm.googleapis.com', 'push.services.mozilla.com', 'notify.windows.com'];
const MAX_SUBS = 10;
const TTL = 600;   // si el aviso no se entrega en 10 min, ya no sirve

export default {
  async fetch(request, env) {
    const c = cors(request, env);
    try {
      return await rutas(request, env, c);
    } catch (e) {
      return json({ ok: false, error: 'interno' }, 500, c.headers);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(revisar(event.scheduledTime, env));
  }
};

/* ---------------- rutas ---------------- */
async function rutas(request, env, c) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: c.headers });
  if (!c.ok) return json({ ok: false, error: 'origen no permitido' }, 403, c.headers);

  if (request.method === 'GET' && url.pathname === '/') {
    return json({ ok: true, servicio: 'rutina-push', configurado: configurado(env) }, 200, c.headers);
  }
  if (request.method === 'GET' && url.pathname === '/vapid') {
    if (!configurado(env)) return json({ ok: false, error: 'faltan las claves VAPID' }, 503, c.headers);
    return json({ clave: env.VAPID_PUBLIC_KEY }, 200, c.headers);
  }
  if (request.method !== 'POST') return json({ ok: false, error: 'no encontrado' }, 404, c.headers);

  const texto = await request.text();
  if (texto.length > 100000) return json({ ok: false, error: 'demasiado grande' }, 413, c.headers);
  let o;
  try { o = JSON.parse(texto); } catch (e) { return json({ ok: false, error: 'JSON inválido' }, 400, c.headers); }

  if (url.pathname === '/sync') {
    if (!env.RUTINA_KV) return json({ ok: false, error: 'falta el KV RUTINA_KV' }, 503, c.headers);
    const rec = limpiar(o);
    if (!rec) return json({ ok: false, error: 'datos inválidos' }, 400, c.headers);
    const id = await idDe(rec.subscription.endpoint);
    const ids = await leerIndice(env);
    if (ids.indexOf(id) === -1 && ids.length >= MAX_SUBS) {
      return json({ ok: false, error: 'demasiadas suscripciones' }, 429, c.headers);
    }
    const nuevo = JSON.stringify(rec);
    if ((await env.RUTINA_KV.get('sub:' + id)) !== nuevo) await env.RUTINA_KV.put('sub:' + id, nuevo);
    if (ids.indexOf(id) === -1) { ids.push(id); await env.RUTINA_KV.put('subs', JSON.stringify(ids)); }
    return json({ ok: true }, 200, c.headers);
  }

  if (url.pathname === '/unsubscribe') {
    if (!o || typeof o.endpoint !== 'string') return json({ ok: false }, 400, c.headers);
    if (env.RUTINA_KV) await borrar(env, await idDe(o.endpoint));
    return json({ ok: true }, 200, c.headers);
  }

  if (url.pathname === '/test') {
    if (!configurado(env) || !env.RUTINA_KV) return json({ ok: false, error: 'servidor sin configurar' }, 503, c.headers);
    if (!o || typeof o.endpoint !== 'string') return json({ ok: false }, 400, c.headers);
    const id = await idDe(o.endpoint);
    const rec = await env.RUTINA_KV.get('sub:' + id, 'json');
    if (!rec) return json({ ok: false, error: 'suscripción desconocida' }, 404, c.headers);
    const r = await enviarPush(rec.subscription, {
      title: 'Rutina · prueba',
      body: 'Así se verán tus avisos. Todo listo.',
      tag: 'prueba'
    }, env);
    if (r.status === 404 || r.status === 410) await borrar(env, id);
    return json({ ok: r.ok, estado: r.status }, r.ok ? 200 : 502, c.headers);
  }

  return json({ ok: false, error: 'no encontrado' }, 404, c.headers);
}

function cors(request, env) {
  const origen = request.headers.get('Origin') || '';
  const permitidos = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
  const ok = !origen || !permitidos.length || permitidos.indexOf(origen) > -1;
  return {
    ok: ok,
    headers: {
      'Access-Control-Allow-Origin': ok && origen ? origen : (permitidos[0] || '*'),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    }
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers)
  });
}

const configurado = env => !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);

/* ---------------- datos ---------------- */
function endpointValido(e) {
  try {
    const u = new URL(e);
    if (u.protocol !== 'https:') return false;
    return HOSTS_PUSH.some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch (err) { return false; }
}

function zonaValida(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
}

// valida y recorta lo que manda el teléfono
function limpiar(o) {
  const s = o && o.subscription;
  if (!s || typeof s.endpoint !== 'string' || !s.keys ||
      typeof s.keys.p256dh !== 'string' || typeof s.keys.auth !== 'string') return null;
  if (!endpointValido(s.endpoint) || s.endpoint.length > 1000) return null;
  if (s.keys.p256dh.length > 200 || s.keys.auth.length > 100) return null;

  const dias = {};
  DIAS_OK.forEach(k => {
    const lista = (o.dias && Array.isArray(o.dias[k])) ? o.dias[k].slice(0, 80) : [];
    dias[k] = lista
      .filter(b => b && Number.isInteger(b.s) && b.s >= 0 && b.s < 1440 && Number.isInteger(b.k))
      .map(b => ({ s: b.s, k: b.k, a: String(b.a || '').slice(0, 80), d: String(b.d || '').slice(0, 160) }));
  });
  const porWd = {};
  for (let w = 0; w < 7; w++) {
    const v = o.porWd && o.porWd[w];
    porWd[w] = DIAS_OK.indexOf(v) > -1 ? v : DIAS_OK[(w + 6) % 7];
  }
  const h = o.hechas || {};
  return {
    subscription: { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } },
    lead: [0, 5, 10].indexOf(o.lead) > -1 ? o.lead : 5,
    tz: (typeof o.tz === 'string' && o.tz.length < 64 && zonaValida(o.tz)) ? o.tz : TZ_DEF,
    dias: dias,
    porWd: porWd,
    hechas: {
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(h.fecha) ? h.fecha : '',
      lista: Array.isArray(h.lista) ? h.lista.filter(Number.isInteger).slice(0, 120) : []
    }
  };
}

async function idDe(endpoint) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint)));
  return Array.from(h.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('');
}

async function leerIndice(env) {
  const ids = await env.RUTINA_KV.get('subs', 'json');
  return Array.isArray(ids) ? ids : [];
}

async function borrar(env, id) {
  await env.RUTINA_KV.delete('sub:' + id);
  await env.RUTINA_KV.delete('env:' + id);
  const ids = (await leerIndice(env)).filter(x => x !== id);
  await env.RUTINA_KV.put('subs', JSON.stringify(ids));
}

/* ---------------- cuándo avisar ---------------- */
// fecha, día de la semana y minuto del día de un instante, en la zona dada
function partesLocales(ms, tz) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
  let h = parseInt(p.hour, 10); if (h === 24) h = 0;
  const fecha = p.year + '-' + p.month + '-' + p.day;
  return { fecha: fecha, wd: new Date(fecha + 'T12:00:00Z').getUTCDay(), min: h * 60 + parseInt(p.minute, 10) };
}

// avisos que tocan en el minuto T (ms). Determinista: cada actividad
// corresponde a un único minuto de disparo.
function avisosDelMinuto(rec, T) {
  const lead = rec.lead || 0;
  const minuto = Math.floor(T / 60000) * 60000;
  const obj = partesLocales(minuto + lead * 60000, rec.tz || TZ_DEF);
  const lista = (rec.dias && rec.dias[rec.porWd[obj.wd]]) || [];
  const hechas = (rec.hechas && rec.hechas.fecha === obj.fecha) ? rec.hechas.lista : [];
  return lista
    .filter(b => b.s === obj.min && hechas.indexOf(b.k) === -1)
    .map(b => ({
      title: (lead === 0 ? 'Ahora: ' : 'En ' + lead + ' min: ') + b.a,
      body: b.d,
      tag: obj.fecha + '-' + b.k,
      url: './'
    }));
}

async function revisar(T, env) {
  if (!configurado(env) || !env.RUTINA_KV) return;
  const ids = await leerIndice(env);
  for (const id of ids) {
    const rec = await env.RUTINA_KV.get('sub:' + id, 'json');
    if (!rec) continue;
    const pendientes = avisosDelMinuto(rec, T);
    if (!pendientes.length) continue;

    // registro de lo ya enviado hoy: si el cron corriera dos veces, no se repite
    const dia = pendientes[0].tag.slice(0, 10);
    let enviados = await env.RUTINA_KV.get('env:' + id, 'json');
    if (!enviados || enviados.fecha !== dia) enviados = { fecha: dia, tags: [] };

    let cambio = false;
    for (const p of pendientes) {
      if (enviados.tags.indexOf(p.tag) > -1) continue;
      const r = await enviarPush(rec.subscription, p, env);
      if (r.status === 404 || r.status === 410) { await borrar(env, id); cambio = false; break; }
      if (r.ok) { enviados.tags.push(p.tag); cambio = true; }
    }
    if (cambio) await env.RUTINA_KV.put('env:' + id, JSON.stringify(enviados), { expirationTtl: 172800 });
  }
}

/* ---------------- Web Push: VAPID + cifrado aes128gcm ---------------- */
const enc = new TextEncoder();

function b64u(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function deB64u(str) {
  const t = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - t.length % 4) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function unir() {
  let n = 0;
  for (const a of arguments) n += a.length;
  const out = new Uint8Array(n);
  let i = 0;
  for (const a of arguments) { out.set(a, i); i += a.length; }
  return out;
}

let cacheJwt = {};
async function jwtVapid(audiencia, env) {
  const ahora = Math.floor(Date.now() / 1000);
  const c = cacheJwt[audiencia];
  if (c && c.exp - ahora > 3600) return c.jwt;
  const pub = deB64u(env.VAPID_PUBLIC_KEY);
  const clave = await crypto.subtle.importKey('jwk', {
    kty: 'EC', crv: 'P-256', ext: true,
    d: env.VAPID_PRIVATE_KEY, x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65))
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const exp = ahora + 12 * 3600;
  const cab = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cue = b64u(enc.encode(JSON.stringify({ aud: audiencia, exp: exp, sub: env.VAPID_SUBJECT })));
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, clave, enc.encode(cab + '.' + cue));
  const jwt = cab + '.' + cue + '.' + b64u(firma);
  cacheJwt[audiencia] = { jwt: jwt, exp: exp };
  return jwt;
}

async function hkdf(salt, ikm, info, bytes) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: salt, info: info }, k, bytes * 8));
}

// RFC 8291: cifra el mensaje para la suscripción (un solo registro aes128gcm)
async function cifrar(sub, texto) {
  const uaPub = deB64u(sub.keys.p256dh);
  const auth = deB64u(sub.keys.auth);
  const efimera = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', efimera.publicKey));
  const uaClave = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaClave }, efimera.privateKey, 256));

  const ikm = await hkdf(auth, secreto, unir(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const plano = unir(enc.encode(texto), new Uint8Array([2]));   // 0x02 = último registro
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, plano));
  const rs = new Uint8Array([0, 0, 16, 0]);                        // tamaño de registro 4096
  return unir(salt, rs, new Uint8Array([asPub.length]), asPub, cifrado);
}

async function enviarPush(sub, datos, env) {
  const audiencia = new URL(sub.endpoint).origin;
  const jwt = await jwtVapid(audiencia, env);
  const cuerpo = await cifrar(sub, JSON.stringify(datos));
  return fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'vapid t=' + jwt + ', k=' + env.VAPID_PUBLIC_KEY,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': String(TTL),
      'Urgency': 'high'
    },
    body: cuerpo
  });
}
