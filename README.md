# ✨ Viste a Luna

Juego web de vestir e interactuar con Luna, una diseñadora gráfica de 24 años.
Sin dependencias: abre `index.html` en el navegador y a jugar.

## Cómo se juega

- **👗 Ropa**: elige partes de arriba, de abajo, vestidos, zapatos y accesorios (sombreros, gafas, pendientes, collares, bolsos) y cambia el color de cada prenda.
- **💇 Estilo**: peinado, color de pelo, ojos, labios y tono de piel.
- **🏞️ Lugar**: habitación, playa, parque, ciudad de noche, fiesta, oficina o invierno.
- **💬 Interactuar**: saluda, charla, cuenta chistes, halaga su look o hazle regalos. También puedes hacer clic en su cabeza, sus manos o su ropa.
  - Cada acción sube la **afinidad** (Desconocidos → Conocidos → Amigos → Muy cercanos → Enamorados).
  - Repetir la misma acción seguida la aburre 🙄.
  - Luna tiene **prendas favoritas** y un **regalo favorito** secretos: charla con ella para descubrirlos.
- **🎯 Retos de estilo**: Luna te pide un look para una ocasión (playa, fiesta, oficina, cita…). Elige la ropa y el lugar adecuados y te puntuará de 1 a 5 estrellas.
- **🎲 Aleatorio**, **📸 Foto** (descarga un PNG) y **↺ Reiniciar**.

El progreso se guarda automáticamente en el navegador (`localStorage`).

## Archivos

- `index.html`: estructura de la página.
- `style.css`: estilos (adaptado a móvil).
- `game.js`: dibujo SVG del personaje, catálogo de ropa, diálogos y lógica del juego.

### Añadir una prenda nueva

En `game.js`, añade una entrada en `ITEMS.<categoría>` con su nombre, sus `tags` (ocasiones en las que encaja), un color por defecto y una función `draw(color)` que devuelva el SVG (lienzo de 400 × 700).
