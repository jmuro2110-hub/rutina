# Notificaciones de la rutina en el iPhone

La página funciona igual sin esto. Estos pasos (una sola vez, ~20 min) activan
avisos **reales**: te llegan aunque la app esté cerrada y el iPhone bloqueado.

## Cómo funciona

```
iPhone (app instalada)  ──suscripción + horario──▶  Cloudflare Worker (gratis)
        ▲                                                   │ cada minuto revisa
        └──────────── aviso (Apple Push) ◀──────────────────┘ si toca avisar
```

- GitHub Pages solo sirve archivos: no puede mandar avisos por su cuenta.
  Por eso hace falta un servidor pequeño. Aquí es un **Cloudflare Worker**
  (plan gratuito), en `push-server/worker.js`.
- Usa **Web Push estándar con VAPID**, el sistema oficial de iOS 16.4+
  para web apps instaladas en la pantalla de inicio.
- El servidor avisa **una vez por actividad** (5 min antes, 10 min antes o
  al empezar, según elijas en la app), en hora de Ciudad de México.
  No avisa de márgenes, tiempo libre ni sueño, ni de lo que ya marcaste
  como hecho. Nunca repite el mismo aviso.
- Tu horario lo manda la propia app: si cambias `rutina.js`, el servidor
  se actualiza solo la próxima vez que abras la app.

## Qué necesitas

- iPhone con **iOS 16.4 o más nuevo**.
- La rutina **añadida a la pantalla de inicio** (Safari → Compartir →
  Añadir a pantalla de inicio) y abierta **desde ese icono**. En una pestaña
  normal de Safari, iOS no permite notificaciones web.
- Una cuenta gratuita de Cloudflare (la creas tú en https://dash.cloudflare.com/sign-up).

## Secretos y configuración (resumen)

| Nombre              | Dónde va                         | Tipo    | Valor                                   |
|---------------------|----------------------------------|---------|-----------------------------------------|
| `VAPID_PRIVATE_KEY` | Cloudflare → Worker → Variables  | Secreto | clave privada del generador             |
| `VAPID_PUBLIC_KEY`  | Cloudflare → Worker → Variables  | Texto   | clave pública del generador             |
| `VAPID_SUBJECT`     | Cloudflare → Worker → Variables  | Texto   | `mailto:` + tu correo                   |
| `ALLOWED_ORIGINS`   | Cloudflare → Worker → Variables  | Texto   | `https://jmuro2110-hub.github.io`       |
| `RUTINA_KV`         | Cloudflare → Worker → Bindings   | KV      | un KV namespace nuevo                   |
| `servidor`          | `push-config.js` en GitHub       | Público | la URL de tu Worker                     |

**La clave privada nunca va en GitHub.** Solo en Cloudflare como *Secret*.

---

## Paso a paso

Los nombres de los botones de Cloudflare pueden variar un poco; si alguno no
coincide, busca la opción equivalente en el mismo menú.

### 1. Crear el Worker

1. Entra a https://dash.cloudflare.com
2. Menú izquierdo: **Compute (Workers)** → **Workers & Pages**.
3. **Create** → **Create Worker** (plantilla *Hello World*).
4. Nombre: `rutina-push` → **Deploy**.
5. Anota la URL que te da, algo como
   `https://rutina-push.TU-SUBDOMINIO.workers.dev`.

### 2. Pegar el código

1. En el Worker: **Edit code**.
2. Borra todo el contenido del archivo que aparece (`worker.js`).
3. Abre `push-server/worker.js` de este proyecto, copia **todo** y pégalo.
4. **Deploy**.

### 3. Crear el almacenamiento (KV)

1. Menú izquierdo: **Storage & Databases** → **Workers KV**.
2. **Create** (o *Create namespace*) → nombre: `rutina` → **Add/Create**.
3. Vuelve al Worker `rutina-push` → pestaña **Settings** → **Bindings** →
   **Add** → **KV namespace**.
4. *Variable name*: `RUTINA_KV` (exacto, en mayúsculas).
   *KV namespace*: `rutina`. → **Save/Deploy**.

### 4. Generar las claves VAPID

1. En tu Mac abre
   https://jmuro2110-hub.github.io/rutina/push-server/generar-claves.html
   (o el archivo `push-server/generar-claves.html` directamente en Safari o Chrome).
2. Toca **Generar claves**. Se crean en tu navegador; no se envían a ningún sitio.
3. Deja esa pestaña abierta para copiarlas en el siguiente paso.

### 5. Poner las claves en Cloudflare

Worker `rutina-push` → **Settings** → **Variables and Secrets** → **Add**:

1. `VAPID_PUBLIC_KEY` — tipo **Text** — pega la clave **pública**.
2. `VAPID_PRIVATE_KEY` — tipo **Secret** — pega la clave **privada**.
3. `VAPID_SUBJECT` — tipo **Text** — `mailto:tu-correo@ejemplo.com` (tu correo real;
   Apple lo exige como contacto).
4. `ALLOWED_ORIGINS` — tipo **Text** — `https://jmuro2110-hub.github.io`
5. **Deploy** (o *Save and deploy*).

### 6. Activar la revisión cada minuto

Worker `rutina-push` → **Settings** → **Trigger Events** (o *Triggers*) →
**Add** → **Cron Triggers** → elige *Every minute* o escribe `* * * * *` → **Add**.

### 7. Comprobar el servidor

Abre `https://rutina-push.TU-SUBDOMINIO.workers.dev/` en el navegador. Debe decir:

```json
{"ok":true,"servicio":"rutina-push","configurado":true}
```

Si dice `"configurado":false`, falta alguna de las tres variables VAPID.

### 8. Conectar la página con el servidor

1. En GitHub abre `push-config.js` → icono del lápiz (**Edit**).
2. Cambia `servidor: ''` por tu URL, **sin barra al final**:
   ```js
   const PUSH = {
     servidor: 'https://rutina-push.TU-SUBDOMINIO.workers.dev'
   };
   ```
3. **Commit changes**. GitHub Pages tarda 1–2 minutos en publicarlo.

### 9. Activar en el iPhone

1. Abre la rutina **desde el icono de la pantalla de inicio**.
   Ciérrala del todo (desliza hacia arriba) y ábrela otra vez para que
   cargue la versión nueva.
2. Toca la **campana** (arriba a la derecha) → elige *Al empezar*,
   *5 min antes* o *10 min antes* → **Activar notificaciones** → **Permitir**.
3. Toca **Enviar una prueba**. Debe llegarte en segundos.
4. Si no llega: Ajustes del iPhone → **Notificaciones** → **Rutina** →
   permitir, y revisa que ningún modo **Concentración** la esté silenciando.

Listo. El estado se ve en la campana y en el panel *Notificaciones*:
**Activadas**, **Desactivadas**, **Bloqueadas**, **Sin configurar** o **No disponible**.

---

## Problemas comunes

| Síntoma | Solución |
|---|---|
| Panel dice *No disponible* en el iPhone | Estás en Safari normal. Abre la app desde el icono de inicio. iOS 16.4+. |
| Panel dice *Sin configurar* | `push-config.js` sigue vacío o GitHub aún no publica el cambio. |
| *No se pudo activar: el servidor… no respondió* | URL mal escrita, o falta `ALLOWED_ORIGINS`, o el Worker no está desplegado. |
| *Bloqueadas* | Ajustes → Notificaciones → Rutina → Permitir. Luego vuelve a abrir la app. |
| La prueba llega pero los avisos no | Falta el **Cron Trigger** (paso 6). |
| Dejaron de llegar | Si borraste la app del inicio o reinstalaste, vuelve a activarlas. |

## Límites (plan gratuito de Cloudflare)

- Workers: 100 000 peticiones/día. El cron usa ~1 440/día.
- KV: 100 000 lecturas y 1 000 escrituras/día. La app solo escribe cuando
  algo cambia (marcar, cambiar minutos, horario nuevo); típico < 100/día.
- Cloudflare casi nunca omite un minuto del cron; si pasara, ese aviso
  no llega (preferible a que llegue repetido).

## Cambiar o desactivar

- **Cambiar minutos**: en el panel de la app; se aplica al instante.
- **Desactivar**: botón *Desactivar* en la app (borra la suscripción del servidor).
- **Cambiar las claves**: genera nuevas, reemplázalas en Cloudflare y vuelve a
  tocar *Activar notificaciones* en el iPhone.
- **Apagar todo**: borra el Worker en Cloudflare. La rutina sigue funcionando.

## Despliegue alternativo con terminal (opcional)

Si algún día instalas Node.js: dentro de `push-server/`, pon el ID de tu KV en
`wrangler.toml` y ejecuta `npx wrangler deploy`, luego
`npx wrangler secret put VAPID_PRIVATE_KEY` (y lo mismo para `VAPID_PUBLIC_KEY`
y `VAPID_SUBJECT`).

## Comprobar que todo sigue bien

Abre `https://jmuro2110-hub.github.io/rutina/pruebas/`: revisa los horarios de
los 7 días y ejecuta el servidor con datos simulados. Todo debe salir en verde.
