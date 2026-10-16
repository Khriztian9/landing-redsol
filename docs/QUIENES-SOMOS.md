# Quiénes somos · REDSOLAR

La sección `#quienes-somos` se integra después de Proyectos, con enlaces en el
menú principal y el pie de página. En escritorio, Christian aparece a la izquierda,
la historia compartida al centro y Katherine a la derecha. En pantallas pequeñas,
la historia precede a los perfiles para facilitar la lectura.

## Fotos de los fundadores

1. Guardar las fotos en `public/images/team/` (crear la carpeta cuando estén listas).
2. En `src/data/team.js`, completar `photo` en cada fundador, por ejemplo
   `/images/team/christian-carvajal.webp` y `/images/team/katherine-polania.webp`.
3. Ajustar `photoPosition` si hace falta, por ejemplo `'center 30%'`, para mantener
   el rostro dentro del encuadre. Una imagen vertical de 800 × 1000 px en WebP es
   una buena base. Mantener aire alrededor del rostro para el recorte en móvil.

Sin una foto válida, se muestran sus iniciales y «Retrato próximamente».
No se han usado retratos de otras personas ni imágenes generadas.

## Colaboradores

Completar el arreglo `collaborators` del mismo archivo con una entrada por persona:

```js
{
  id: 'identificador-unico',
  name: 'Nombre y apellido',
  role: 'Cargo real',
  description: 'Descripción breve de su aporte al equipo.',
  photo: '/images/team/nombre-apellido.webp',
  photoPosition: 'center',
}
```

Los cuatro espacios reservados del estado vacío son una vista previa del diseño;
no representan el número de colaboradores de REDSOLAR. Al añadir el primer perfil,
el carrusel utiliza solamente los datos reales. Cada perfil puede tener una foto
pendiente sin impedir que se muestre su información.

El carrusel admite controles anterior/siguiente, deslizamiento táctil y las teclas
Flecha izquierda/derecha, Inicio y Fin al enfocarlo. No avanza automáticamente y
respeta la preferencia de movimiento reducido.

## Archivos

- `src/components/AboutSection.jsx` y `.css`: portada, fundadores y propósito.
- `src/components/TeamCarousel.jsx` y `.css`: carrusel adaptable.
- `src/data/team.js`: datos de personas y rutas de imágenes.

Para verificar la compilación: `npm run build`.
