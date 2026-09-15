# ERRORES Y LECCIONES — anniversary-app

> Bitácora de errores reales del proyecto y cómo no repetirlos.
> Última actualización: 2026-09-09 (rama `style/puzzle-modal`)

---

## 1. Reset global `*` mata las utilidades de Tailwind v4 (EL MÁS GRAVE)

- **Síntoma:** el texto del modal salía pegado a los bordes aunque el código decía `p-10`; la medalla no se centraba; `m-auto`/`mx-auto`/`px-*`/`pt-*` computaban a `0px`.
- **Causa:** `src/index.css` tiene `* { margin: 0; padding: 0 }` SIN capa. En Tailwind v4 todas las utilidades viven en `@layer utilities`, y por especificación **lo no-capado le gana a lo capado siempre**, sin importar especificidad. Solo fallaban `margin*`/`padding*` (lo único que el reset toca); el resto (colores, anchos, flex, gap) funcionaba y por eso costó verlo.
- **Solución:** componentes nuevos usan estilos propios (`<style>` con clases `.win-*`) para espaciado, como ya hace el resto del proyecto (`.bf-trail`, `.gothic-btn`, etc.).
- **Regla:** si un `m-*`/`p-*` no se aplica y la clase SÍ está en el DOM, sospecha del reset antes que del navegador. No quitar el reset global sin avisar: medio sitio se compuso visualmente sin esas utilidades y activarlo todo de golpe movería cada sección.

## 2. `transition: all` / `transition-all`

- **Síntoma:** tirones en hover de botones y tarjetas.
- **Causa:** anima propiedades caras (sombras, fondos) innecesarias.
- **Solución:** listar solo lo necesario: `transition-[transform,box-shadow,background-color,border-color]`.
- **Regla:** `all` prohibido en el proyecto (verificado con grep: 0 coincidencias).

## 3. `filter: blur()` en entradas/salidas de Motion

- **Síntoma:** transiciones de sección con micro-trabas.
- **Causa:** animar `filter` fuerza repaint por frame.
- **Solución:** entradas solo con `opacity` + `y`/`scale`. Blur solo en primera entrada del Collage.
- **Regla:** nada de `filter` en `initial/animate/exit`.

## 4. `backdrop-blur` anidados

- **Síntoma:** modales pesados (overlay con blur + tarjeta con blur).
- **Causa:** cada capa de blur remuestrea lo de atrás.
- **Solución:** blur solo en la tarjeta; overlay con fondo sólido (`bg-black/70`, modal victoria `bg-[#080304]/80` + 1 blur permitido por diseño aprobado).

## 5. CosmosBackground tragón

- **Síntoma:** el fondo global consumía CPU siempre.
- **Causa:** 31 cometas × 3 pasadas con gradiente nuevo por frame, 500 partículas con búsqueda O(n) de la más vieja, canvas a DPR nativo, halo del mouse redibujado aunque no se mueva, sin pausa en pestaña oculta.
- **Solución:** DPR con tope 1.5, 20 cometas, 260 partículas, estela en 2 pasadas, buffer circular, halo solo si el mouse se movió, `visibilitychange` + resize con debounce.
- **Regla:** ningún canvas corre en pestaña oculta (Intro ya lo hacía; Cosmos y Playlist no).

## 6. Playlist con doble intervalo

- **Síntoma:** re-render de toda la playlist ~10 veces/segundo.
- **Causa:** intervalo de 100ms (progreso+onda) + otro de 110ms (onda).
- **Solución:** onda en un solo intervalo de 180ms + filas memoizadas (`SongRow`).

## 7. Collage filtraba con blur + layout JS

- **Síntoma:** filtrar categorías trababa con 13 fotos.
- **Causa:** cada item animaba `filter: blur()` + `layout` + `popLayout` + `whileHover` + flotantes vía Motion (hilo JS).
- **Solución:** blur solo en primera entrada, hover y flotantes en CSS (compositor), `z-index` por CSS.

## 8. `will-change` permanente

- **Síntoma:** 16 usos, capas de composición vivas siempre (memoria GPU).
- **Causa:** `will-change` en decoración estática e infinita.
- **Solución:** quitarlo de todo lo que no anime por interacción real.

## 9. `MotionConfig reducedMotion="never"`

- **Síntoma:** consola advierte "Reduced Motion enabled… animations may not appear" y se ignoraba la accesibilidad del SO.
- **Solución:** `reducedMotion="user"`.
- **Regla:** si un usuario dice "no veo animaciones", pedirle que revise Efectos de animación de su SO antes de tocar código.

## 10. `@import` de fuentes dentro de `<style>`

- **Síntoma:** fuentes que tardaban o bloqueaban render.
- **Causa:** `@import` en estilos inyectados es bloqueante.
- **Solución:** todas las fuentes en el `<link>` de `index.html` (Cormorant, Sora, Marcellus, Cinzel, Philosopher, Dancing Script, Lora, Playfair Display).

## 11. Lightbox roto con video sin `src`

- **Síntoma:** abrir el visor en un recuerdo tipo video mostraba imagen rota.
- **Solución:** no abrir lightbox si no hay `src`.

## 12. Swipe que pelea con el scroll

- **Síntoma:** en móvil el carrusel trababa el scroll vertical.
- **Solución:** `dragDirectionLock` en el swipe.

## 13. Centrados frágiles (medalla del modal)

- **Síntoma:** la medalla salía a la izquierda/encima del título según el navegador.
- **Causa:** centrado con `translate` o `mx-auto` sobre posicionados que algún caso ignoraba.
- **Solución:** centrado a prueba de balas `left-0 + right-0 + mx-auto` con ancho fijo, o dentro de `flex-col items-center` (patrón del sitio).

## 14. Números feos en Cormorant

- **Síntoma:** "26", "2024" y el contador se veían horribles/pequeños en Cormorant.
- **Solución:** numerales en Cinzel (elegante y del sitio); títulos y cuerpo en Cormorant.

## 15. Metodología: PROBAR antes de decir "listo"

- **Síntoma:** varias rondas de "se sigue viendo igual" a ciegas.
- **Solución:** banco de pruebas en `C:\Users\USER\AppData\Local\Temp\opencode\shot-modal.cjs` (puppeteer-core + Chrome del sistema): navega intro → countdown → puzzle → abre el aviso y captura desktop + móvil. Ver las capturas uno mismo antes de avisar.
- **Regla:** ningún cambio visual se da por listo sin captura vista por el agente.

## 16. Leer archivos en la rama ACTUAL antes de editar

- **Síntoma:** ediciones fallidas / contenido inesperado.
- **Causa:** se leyó código estando en `refine/taste-skills` y luego se editó en `main` (versiones distintas).
- **Regla:** después de `checkout`, releer lo que se vaya a tocar.

## 17. Mesh Three.js con array de materiales no dibuja sin `groups`

- **Síntoma:** la mariposa origami se veía como alambre rojo (solo aristas) + una mancha: las caras no renderizaban.
- **Causa:** `new THREE.Mesh(geo, [matF, matB])` sin `geometry.groups` → el renderer no pinta ningún grupo.
- **Solución:** en `makeFoldPanel` (`origamiButterfly.js`): `geo.addGroup(0, N, 0)` (frentes) + `geo.addGroup(0, N, 1)` (reversos) sobre todos los vértices.
- **Regla:** todo mesh con array de materiales lleva sus `addGroup` explícitos.
