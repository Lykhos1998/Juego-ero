# ✨ Viste a Luna 3D

Juego web en 3D de vestir e interactuar con Luna, una diseñadora gráfica de 24 años.
No necesita instalación ni servidor: abre `index.html` en el navegador y a jugar.
Usa [three.js](https://threejs.org) r159, incluido en `vendor/` (licencia MIT).

## Cómo se juega

- **👗 Ropa**: elige partes de arriba, de abajo, vestidos, zapatos y accesorios (sombreros, gafas, pendientes, collares, bolsos) y cambia el color de cada prenda.
- **💇 Cuerpo**: deslizadores de figura (altura, busto, cintura, caderas, glúteos, piernas y hombros), peinado y colores de pelo, ojos, labios y piel. Siempre lleva una capa de ropa básica debajo.
- **Cámara**: arrastra para girarla, usa la rueda para acercar, o los botones 🙂 (cara), 🧍 (cuerpo entero) y 🔄 (giro automático).
- **🏞️ Lugar**: habitación, playa, parque, ciudad de noche, fiesta, oficina o invierno.
- **💬 Interactuar**: saluda, charla, cuenta chistes, halaga su look, pídele que baile o que gire, o hazle regalos. Responde con gestos animados y expresiones. También puedes hacer clic en su cabeza, sus manos o su ropa.
  - Cada acción sube la **afinidad** (Desconocidos → Conocidos → Amigos → Muy cercanos → Enamorados).
  - Repetir la misma acción seguida la aburre 🙄.
  - Luna tiene **prendas favoritas** y un **regalo favorito** secretos: charla con ella para descubrirlos.
- **🎯 Retos de estilo**: Luna te pide un look para una ocasión (playa, fiesta, oficina, cita…). Elige la ropa y el lugar adecuados y te puntuará de 1 a 5 estrellas.
- **🎲 Aleatorio**, **📸 Foto** (descarga un PNG) y **↺ Reiniciar**.

El progreso se guarda automáticamente en el navegador (`localStorage`).

## Archivos

- `index.html`: estructura de la página.
- `style.css`: estilos (adaptado a móvil).
- `game.js`: modelo 3D procedural del personaje, ropa, escenarios, animaciones, diálogos y lógica del juego.
- `vendor/three.min.js`: motor 3D.

### Añadir una prenda nueva

1. En `game.js`, añade una entrada en `ITEMS.<categoría>` con su nombre, icono, `tags` (ocasiones en las que encaja) y color por defecto.
2. En `buildCharacter()`, dibújala en el bloque de su categoría. La ropa se construye como una "capa" ligeramente más gruesa que el cuerpo (`torsoPiece`, `breasts`, `glutes`, `limbPiece`, `skirt`), así se adapta sola a la figura elegida.
