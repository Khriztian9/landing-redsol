# CRM de asesores: datos y activación

El CRM usa el inicio de sesión de Firebase que ya tiene el sitio. Cada cuenta
gestiona su propia cartera en `advisors/{uid}/crmClients/{clientId}` y el historial
en `activities/{activityId}`. La interfaz no permite asignar otro propietario.
Este alcance no incluye vista de gerencia ni reasignación entre asesores.

No se han creado datos ficticios en producción ni se han publicado reglas de Firestore.
El archivo completo `firestore.rules` conserva las políticas de cotizaciones
que proporcionó el propietario el 11 de octubre de 2026 e incorpora el CRM.
`firebase.json` apunta a ese archivo; no despliega cambios por sí solo.
**La protección por asesor debe verificarse y aplicarse en Firestore antes de
usar el CRM con datos reales.** Una ruta protegida en React no protege la base
de datos por sí sola.

## Integración de reglas

1. Comparar `firestore.rules` con las reglas activas de `redsol-8a25b` justo
   antes de publicar, por si cambiaron después de la copia proporcionada.
2. Usar el archivo completo `firestore.rules`, que incluye las políticas
   existentes de `cotizaciones`, `cotizaciones_publicas` y la denegación global.
   `docs/firestore-crm.rules.fragment` queda como referencia del bloque añadido.
3. Si se integran otros cambios, revisar los bloques que también coincidan con
   `/advisors/...`: un permiso global amplio permite acceso aunque este bloque
   lo deniegue, porque las reglas de Firestore se combinan con OR.
4. Verificar en el emulador de Firebase: un visitante no puede leer ni escribir el CRM;
   el asesor A puede gestionar su cartera; A no puede leer ni escribir clientes
   o actividades del asesor B; campos adicionales, montos negativos y cambios
   de `createdAt` se rechazan. Confirmar que las cotizaciones existentes siguen
   funcionando.
5. Publicar el archivo completo desde la consola de Firebase o con el proceso
   habitual de despliegue autorizado del sitio. No publicar el fragmento como
   archivo completo, ya que omitiría las reglas de las funciones existentes.

La validación de reglas comprueba estructura, tipos, límites, etapa y origen.
La validación de la aplicación también comprueba correos y fechas del calendario.
El acceso depende de que las cuentas existentes correspondan a asesores: este
cambio no crea usuarios ni asigna privilegios administrativos.

## Comportamiento de los datos

- Las oportunidades son los mismos clientes, clasificados en seis etapas.
- Cada cliente requiere nombre y al menos un teléfono o correo electrónico.
- El valor de cartera suma únicamente oportunidades abiertas, en COP.
- Las fechas de seguimiento se guardan como `YYYY-MM-DD`; los vencimientos se
  calculan con el día de Colombia (`America/Bogota`).
- Guardar una etapa distinta también registra su actividad en la misma
  transacción. Completar un seguimiento registra el detalle y limpia la próxima
  fecha y acción en una sola transacción, evitando completarlo dos veces. Si la
  fecha o la acción cambiaron mientras estaba abierto el formulario de cierre,
  se solicita revisarlas antes de completar el seguimiento.
- Los errores de permisos o conexión se devuelven a la interfaz; no se presentan
  como guardados exitosos. No hay borrado de clientes ni de su historial.
- `quoteId` y `quoteLabel`, si se usan, guardan una referencia informativa: no
  modifican ni dan permisos sobre la colección de cotizaciones existente.

Las suscripciones usan índices simples de Firestore (`updatedAt` y `createdAt`);
no se requieren índices compuestos nuevos. Ejecutar las pruebas de dominio con
`node --test tests/crm.test.js`. Estas pruebas no sustituyen las verificaciones
de permisos del emulador ni confirman las reglas desplegadas en producción.

## Integración en redsolarenergy.com

- Después de iniciar sesión, el asesor entra en `/crm`. La navegación conserva
  Historial, Calculadora y Cotizador. La ruta usa el mismo guard de Firebase Auth.
- Desde una cotización propia, «Llevar al CRM» abre el registro del cliente con
  nombre, municipio y valor sugeridos. El asesor completa sus datos de contacto.
  No se copia el campo `email` de la cotización porque actualmente representa
  el correo del asesor. Si ya existe un cliente con esa referencia, se abre su ficha.
- Las fichas admiten contactos, proyecto, origen, valor, etapa, una cotización
  vinculada, próxima acción y fecha. El historial guarda notas, llamadas,
  reuniones, correos registrados manualmente y cambios de etapa. No se envían
  mensajes ni notificaciones automáticamente.
- Una oportunidad corresponde a una ficha de cliente en esta primera versión.
  No hay reasignación ni vista compartida de gerencia.
- `vercel.json` permite abrir o recargar `/crm` directamente con la aplicación
  de Vite. No cambia los registros DNS ni publica el sitio por sí mismo.
- Verificación local: `npm run test:crm` y `npm run build`.

## Pruebas de permisos en emulador

Se verificaron 8 escenarios contra el archivo completo de reglas: acceso del
propietario, bloqueo de otros asesores y visitantes, validación de campos,
historial inmutable, actividades sin cliente y compatibilidad con las políticas
de cotizaciones privadas y públicas proporcionadas. Estas pruebas usaron un
proyecto de demostración local; no consultaron ni modificaron producción.

Para reproducirlas, se requieren Node.js 20+ y Java 21. Las herramientas opcionales
se instalan fuera de las dependencias de la aplicación:

```bash
mkdir -p work/crm-emulator
npm install --prefix work/crm-emulator --no-save --package-lock=false firebase-tools@15.33.0 @firebase/rules-unit-testing@6.0.0
cp firestore.rules work/crm-emulator/firestore.rules
cat > work/crm-emulator/firebase.json <<'JSON'
{
  "firestore": { "rules": "firestore.rules" },
  "emulators": {
    "firestore": { "host": "127.0.0.1", "port": 8088 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
JSON
FIREBASE_EMULATORS_PATH="$PWD/work/crm-emulator/emulator-cache" XDG_CONFIG_HOME="$PWD/work/crm-emulator/config" node work/crm-emulator/node_modules/firebase-tools/lib/bin/firebase.js emulators:exec --only firestore --project demo-redsolar-crm --config work/crm-emulator/firebase.json 'node tests/crm.rules.test.js'
```

También se probaron 10 grupos de flujos de interfaz en Chromium, con datos
simulados y las llamadas a Firebase sustituidas: registro y edición, validación,
actividades, seguimientos, filtros, tablero, vista móvil de 390 px, vinculación de
cotizaciones, rechazo de referencias ajenas y recuperación de errores. No hubo
errores de JavaScript ni peticiones a servicios externos durante esas pruebas.
Las pruebas de interfaz no reemplazan una comprobación final con las cuentas de
asesor después de publicar las reglas y la aplicación.
