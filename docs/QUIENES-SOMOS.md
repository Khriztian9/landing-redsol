# Quiénes somos · REDSOLAR

La sección `#quienes-somos` se integra después de Proyectos, con enlaces en el
menú principal y el pie de página. En escritorio, Christian Carvajal aparece a
la izquierda, la historia compartida al centro y Katherine a la derecha.

## Fotografías incorporadas

Las cuatro fotografías fueron suministradas por el usuario y retocadas para
uniformar fondo gris claro, iluminación y encuadre. Las versiones para la web
conservan 1122 × 1402 px y se guardan en JPEG optimizado, con aproximadamente
167–218 kB por imagen. No se incorporan dependencias de procesamiento a la app.

| Archivo en `public/images/team/` | Persona | Cargo |
| --- | --- | --- |
| `christian-carvajal.jpg` | Christian Eduardo Carvajal | Director de proyectos |
| `christian-castano.jpg` | Christian Castaño | Gerente comercial |
| `katherine-polania.jpg` | Katherine Polania | Líder jurídica |
| `david-velasquez.jpg` | David Velasquez | Gerente técnico |

La asignación sigue el orden de los retratos editados indicado por el usuario.
Los nombres, cargos, descripciones y rutas se mantienen en `src/data/team.js`.
Los fundadores aparecen en la portada y Christian Castaño y David Velasquez
en el carrusel de colaboradores.

## Sustituir fotos o añadir personas

1. Guardar la imagen optimizada en `public/images/team/`.
2. Actualizar `photo` en el perfil correspondiente de `src/data/team.js`.
3. Mantener un retrato vertical 4:5, con aire sobre la cabeza y alrededor de los
   hombros. Las fotos conservan ese encuadre también en celular.
4. Ajustar `photoPosition` si hace falta, por ejemplo `'center 30%'`.

Para añadir colaboradores, usar una entrada por persona:

```js
{
  id: 'identificador-unico',
  name: 'Nombre y apellido',
  role: 'Cargo real',
  description: 'Descripción breve de su aporte al equipo.',
  photo: '/images/team/nombre-apellido.jpg',
  photoPosition: 'center',
}
```

Sin una foto válida se conserva el respaldo de iniciales. Si el arreglo de
colaboradores está vacío, el carrusel vuelve a mostrar los espacios de vista
previa; no representan el número de integrantes del equipo.

El carrusel admite controles anterior/siguiente, deslizamiento táctil y las teclas
Flecha izquierda/derecha, Inicio y Fin al enfocarlo. No avanza automáticamente y
respeta la preferencia de movimiento reducido.

## Verificación

Para verificar la compilación: `npm run build`. Revisar en la vista previa
los nombres, los cargos, el recorte de las fotografías y las versiones de
computador y celular antes de integrar el PR.
