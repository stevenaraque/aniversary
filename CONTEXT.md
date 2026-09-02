# CONTEXT — 2 Años Mi Canelita (para retomar en otro chat)

> Lee este archivo al iniciar un nuevo chat para retomar sin perder ritmo. Proyecto de Steven para su novia — 2 años juntos (26.08.2024 → 26.08.2026).

**Repositorio:** https://github.com/stevenaraque/aniversary  
**Ramas:**
- `main` @ `b64efab` — **estable, producción en Vercel** (intro gótica UMBRA + contador 26.08 + marco prismático)
- `reflect/spacious-glass` @ `129afef` — experimental spacious (desactualizada, no usar)
- Backup físico: `anniversary-app-backup-pre-reflect/` en `Template/`

**Stack:** React 19 + Vite 8 + Tailwind 4 (`@tailwindcss/vite`) + Motion (`motion`) + Lucide  
**Node:** v24.19.0

---

## Decisiones de diseño (no revertir sin preguntar)

1. **Paleta:** Negro profundo `#050505` / Obsidian `#0a0a0f` / Rojo vino `#8b0000→#dc143c` / Dorado `#d4af37` `#f9e076` `#b8941f` (`src/index.css:3` `@theme`) + Bone `#e8dcc8`. Gold/crimson para glass, cometas, prism.
2. **Tipografía — Cormorant Garamond (delicada, fineza)** (`index.html:6`): `h1/h2` Cormorant 700 `text-gradient-blood` / `white`, `p/body` Cormorant 300. Se sustituyó Cinzel/Cinzel Decorative por Cormorant en títulos, botones, badges (look fino y coherente). Sora queda solo para micro-etiquetas/fallback. No usar Georgia, no reintroducir Cinzel sin preguntar.
3. **Liquid Glass** (`src/index.css:48`): `.glass` blur 16-40px saturate 1.4-1.8, `.glass-prominent`, `.glass-deep`, `.glass-refraction` conic 20s, `interact-lift/glow`.
4. **Fondo animado global** `src/components/CosmosBackground.jsx:1` — **Río de Cometas Dorados en cascada continua** canvas `fixed inset-0` 300 estrellas + 5 nebulosas + **26 cometas** (desktop) con estela triple halo/mid/core + 500 partículas, spawn denso `rand(2,5)` frames (cascada continua en toda la página). Móvil: estrellas 140, cometas 8, partículas 160, spawn espaciado `rand(20,32)`. **NO usa `prefers-reduced-motion` para congelar el cosmos** (el fondo debe seguir animado). `StarRainCanvas` en Intro 18/36 estrellas throttled 34ms + `FrostCanvas` 42 partículas solo desktop. Fondo transparente en secciones para ver cometas.
5. **Patrón Container/Wrapper** (`src/index.css:280`): `.main-wrapper` 100% flex center `min-h-[100dvh] h-[100dvh] overflow-hidden` → `.container` 1200 / `.container-lg` 1280 + `px 20→16` → grid. Intro usa `container-lg grid [1.05fr_0.95fr] gap-14` con foto. Sin scroll en Intro/Countdown.
6. **Motion** `src/lib/motion-tokens.js:1`: `springs.gentle/bouncy`, `motionTokens`. Intro: `StarRainCanvas` canvas, `FrostCanvas` ice crystals, `GothicButton` bat, `umbra` circles/dust/ink. Countdown: `TimeBlock` con anillo SVG progress.
7. **Iconos** `src/components/Icons.jsx:1`: `BatIcon` / `FlowerIcon` custom + Lucide `Crown/Gem/Heart/Skull`. Flaticon bat para botón Recordemos.
8. **Puzzle 4×4** `src/components/Puzzle.jsx:7` — 16 piezas, `glass-deep` + spotlight, fix `isSolvable` → `(inv+filaAbajo)%2===1`.
9. **Datos editables** `src/data/memories.js` `photos.js` `songs.js` — arrays simples, `public/puzzle-main.jpg` (reemplazar por foto real), `public/gothic/*.png` marcos.
10. **Build:** `npm run build` OK ~52kB CSS / 411kB JS. Tailwind `bg-linear-to-*`.

---

## Flujo App (`src/App.jsx:15`)

`SECTIONS = ['intro','countdown','puzzle','memories','letter','collage','playlist','final']` 8 secciones con `useState` lazy `sessionStorage` + `goNext`/`goPrev` + `resetProgress` + `AnimatePresence mode="wait"`. `CosmosBackground` fijo global + `relative z-10`. Persistencia: `sessionStorage 'aniversary:section'` sobrevive reloads, se borra al cerrar navegador/pestaña. `Playlist.jsx` `onNext`→`final`, `onReset`→`intro`. `Final.jsx:1` es scrollable con `CosmosBackground` visible.

| Sección | Archivo | Notas |
|---------|---------|-------|
| Intro | `Intro.jsx:99` | UMBRA hero `100dvh` static, `StarRain 18/36` + `Frost 42` + `geometric circles` + `dust/ink/fog` + `GothicButton Recordemos` bat + `gothic-prism` foto 575px `prism-border` |
| Countdown | `Countdown.jsx:7` | Fecha **26.08.2024** calendario real, `TimeBlock` 6 con anillo `gold/crimson` + watermark `II`, `pebble-button` bat, `Mi Canelita` badge |
| Puzzle | `Puzzle.jsx:64` | 4×4 premium |
| MemoryLane | `MemoryLane.jsx:17` | Swipe drag x 80/vel 400 |
| Letter | `Letter.jsx:8` | Sobre rotateY |
| Collage | `Collage.jsx:39` | Masonry 13 fotos sin hueco |
| Playlist | `Playlist.jsx:153` | Reproductor gótico (disco + lista panel) + `onNext`→`final` |
| Final | `Final.jsx:1` | Hero Elena&Matteo + declaración + timeline 5 + gallery 5 + vow ∞ + lightbox, scroll, Marcellus |

---

## Qué está hecho / Pendiente

**Hecho 08-2026:** Intro gótica UMBRA 100dvh sin scroll, estrella lenta 35% + 575px marco prismático adaptado a foto (height auto, sin cover), cross-ring 16 cruces, candelabros quitados, esquinas quitadas, Countdown 26.08 con cálculo calendario, pebble-button optimizado sin lag, push `b64efab`.

**Pendiente del usuario (no tocar sin pedir):**
- Carta real en `Letter.jsx:106`
- Fotos `memories.js`, `photos.js` (reemplazar `puzzle-main.jpg` por foto real), canciones `songs.js`
- Ajustar intensidad cometas si quiere más sutil

**No hacer:** Cambiar estructura 7 secciones, puzzle 5×5, volver a Georgia, quitar dorado, usar emojis.

---

## Comandos

```powershell
cd "C:\Users\USER\Desktop\2 years\agente\Template\anniversary-app"
git checkout main; npm run dev          # http://localhost:5173
npm run build
git log --oneline -5
```

**Deploy:** Vercel importa `stevenaraque/aniversary` branch `main` (auto).

---

## Para el próximo chat

1. Lee este CONTEXT.md
2. Verifica rama `git branch --show-current` (debe ser `main`)
3. Pregunta antes de cambiar paleta/tipografía
4. Mantén `main` como producción


## Update 25-08-2026
- MemoryLane responsive + puzzle centrado + margenes invisibles estandarizados en todas las secciones
- Push 09bc618

## Update 28-08-2026
- **Collage fix hueco** `Collage.jsx:27` `photos.js:13` — 12 fotos daba `XXX.` 1 celda hueco al final (holes 1 frag 0). Fix inicial `3x1→2x1` + último `2x2→2x1` fragmentó grilla (`XX.X` en medio, holes 4 frag 2, se veía más grande). Revertido a SPANS orig estable. Solución: `photos.js` 12→13 fotos (agregado 1 `'/puzzle-main.jpg'`) → packing denso 4 cols `XXXX` holes 0 frag 0 perfecto sin hueco. 13 es count óptimo con SPANS orig; 12 y 15 dan hueco limpio al final inevitable.
- **Botón 3D Nuestra música** `index.css:384` `Collage.jsx:253` — pegado al borde. Aplicado CSS Uiverse `chintu_2484`: `.cover` black 64×75 white shadow, `.button` #ddd rgb(221) white border, `box-shadow rgb(116)`, `active translateY(4.5px)`. Fix borde: `.d3warpper` `margin 0.5rem auto 1.5rem` + `scale:1`, `Collage.jsx` `main-wrapper pb-10 sm:pb-14` y contenedor botón `mb-10 pb-6` para respiración y clic sin clipping (overflow visible).
- **Botón fix 28-08 v2** `Collage.jsx:64` `index.css:434` — pegado en computador + animación no se veía. `main-wrapper pb-16 sm:pb-20` + spacer `h-10 sm:h-14` (~1cm extra scroll) para que no quede pegado al borde y deje hacer scroll. Animación: `handleMusicPress` `Collage.jsx:67` con `isPressing` + `setTimeout 220ms` antes de `onNext`, botón con clase `.pressed` `index.css:434` `rotateX(13deg) translateY(4.5px)` preservando perspectiva, se ve hundirse y luego navega.
- **Navegación atrás** `App.jsx:42` `Countdown.jsx:52` `Puzzle.jsx:25` `MemoryLane.jsx:35` `Letter.jsx:7` `Collage.jsx:61` `Playlist.jsx:45` — agregado `goPrev` a todas las secciones (excepto `Intro` que es inicio). Botón glass `ArrowLeft` `absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass border-white/10 hover:border-gold/25` consistente en todas las páginas, `Letter.jsx:342` ya tenía y se mantiene. Build OK 62kB CSS / 450kB JS.
- **Persistencia sessionStorage** `App.jsx:16` `App.jsx:33` `Playlist.jsx:45` — `STORAGE_KEY='aniversary:section'`, `useState` lazy lee `sessionStorage`, `useEffect` guarda cada cambio. Reload mantiene sección. Cerrar navegador/pestaña borra → vuelve a `intro`. `Playlist.jsx` `onReset` limpia storage.
- **Página Final** `Final.jsx:1` `App.jsx:15` `index.html:11` — convertida de HTML a React con `motion` reveal `whileInView`, `HERO` Elena&Matteo `/ DECLARATION / TIMELINE 5 / GALLERY 5 + lightbox / VOW ∞ / FOOTER`, `Marcellus` agregada `index.html:11`, `SECTIONS` 7→8, `Playlist` ahora `onNext`→`final`, `Final` con `onPrev`/`onReset` + `CosmosBackground` global visible, scroll `100vh` hero + `section` 100px. Build OK 63kB CSS / 466kB JS.
- Push pendiente

## Update 28-08-2026 (limpieza + rendimiento + tipografía)
- **Lint limpio (0/0)** `oxlint`: quitados imports sin usar (`Intro Heart/Unlock`, `Countdown motionTokens`, `MemoryLane var x`), eliminado hook muerto `useInViewOnce.js`, `Puzzle.jsx` `setSolved` en effect → derivado `solved = isSolved && started` (sin setState en effect).
- **Dead code eliminado** (no se importaban): `AnimatedBackground.jsx`, `App.css`, `src/assets/`, `public/gothic/*.png` (incl. `skull-vine-frame.png` 1.7MB), `public/icons.svg`, `public/favicon.svg`. `framer-motion` quitado de `package.json` (queda como dep transitiva de `motion`).
- **Rendimiento** `CosmosBackground.jsx`: responsive móvil (estrellas 300→140, cometas 18→8, partículas 500→160). Diseño en desktop intacto.

## Update 28-08-2026 (refix cosmos + cascada)
- **Fix cometas estáticos** `CosmosBackground.jsx`: revertido freeze por `prefers-reduced-motion` (dejaba las estrellas/cometas quietas) → el cosmos siempre corre `loop()`. Ver punto 4.
- **Efecto cascada continua** `CosmosBackground.jsx:159` `CosmosBackground.jsx:204`: `createComet` más rápido (speed 4-8) con `tailLen 240-420`, estela triple (halo 0.32 / mid 0.6 / core full), `MAX_COMETS` desktop 18→26 con spawn denso `rand(2,5)` frames → lluvia dorada continua en toda la página (canvas `fixed` visible en todas las secciones). Móvil: 8 cometas, spawn espaciado `rand(20,32)`, flash solo bajo 50% del máximo.
- Build OK 61.8kB CSS / 468kB JS. Push pendiente.
- **Tipografía → Cormorant Garamond (delicada/fineza)** `index.html:6` `src/index.css`: reemplazado `Cinzel`/`Cinzel Decorative` por Cormorant en títulos, botones, badges, números countdown; body y `p` ahora Cormorant 300 (antes Sora). Cargados pesos Cormorant 300-700 + italic 300. Quitados Cinzel/Cinzel Decorative de Google Fonts. Sora queda solo micro-etiquetas.
- Build OK 61.8kB CSS / 468kB JS. Push pendiente.

## Update 28-08-2026 (reproductor gótico nuevo diseño)
- **`Playlist.jsx` reescrito** con el diseño gótico del reproductor que el usuario aportó: panel izquierdo lista (ornamentos dorados, ecualizador animado 3 barras rojas en canción activa, línea activa rojo-dorado, número/hover-play) + panel derecho tarjeta con disco giratorio + aura pulsante (vino), esquinas doradas, glow superior, título `Cinzel Decorative`, artista `Philosopher` italic, visualizador de barras, barra de progreso rojo→dorado con knob, controles play 3D con borde cónico + shuffle/prev/next/repeat, toast, partículas doradas (canvas, solo desktop), viñeta. Botón volver + footer CTA se mantienen.
- **Iconos**: Font Awesome sustituido por Lucide (`Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, ArrowLeft`).
- **Fuentes re-integradas** para el reproductor en `index.html`: `Cinzel`, `Cinzel Decorative`, `Philosopher` (además de Cormorant/Sora/Marcellus del resto de la app).
- **Reproducción**: si la canción tiene `src` usa `<audio>` real (timeupdate/ended/repeat); si `src:''` usa reproducción simulada con duración (`seconds`) del diseño original. Shuffle/repeat/prev(>3s reinicia)/next + atajos teclado (Space/←/→). `songs.js` ahora incluye `duration` y `seconds`.
- **Pendiente**: colocar canciones en `src` (`.mp3` en `/public/music/` o URLs) con `duration`/`seconds` reales en `src/data/songs.js`.
- **Ajuste desktop sin scroll** `Playlist.jsx`: compactado panel derecho (disco 200→168px, paddings/right/controls/disc-section reducidos, aura 250→200, título min-height 56→44, marginTop 56→52, left padding 40→26) → todo cabe en `100dvh` en PC sin scroll.
- **Fix scroll real** `Playlist.jsx`: causa = `.goth-layout{min-height:100vh}` + `.goth-player` con `min-h` (crecía al alto del contenido → scroll de página). Ahora: `.goth-player` `h-[100dvh] overflow-hidden` + `.goth-layout{flex:1;min-height:0}` + footer en fila (`.goth-footer` flex-shrink:0) + padding del player 56px top/12px bottom. **Verificado en Chrome headless**: `documentElement.scrollHeight == innerHeight` (pageScrollable:false) en playlist y en las 8 secciones, incluso a 673px de alto.
- **Móvil super responsive** `Playlist.jsx`: lista compactada 45vh→30vh; disco proporcional `min(30vh,34vw,128px)`; paddings/textos en escala; en ≤900px el `.goth-player` pasa a `height:auto;overflow-y:auto`. **Verificado en Chrome headless** (iPhoneSE 320, iPhone 390, Galaxy 360, Pixel 412, Tablet 768, laptop): card+playBtn+footer caben (fitsViewport:true).
- **Reescrito con metodología de encapsulación flex-wrap (sin breakpoints de layout)** `Playlist.jsx`: `.goth-layout{display:flex;flex-wrap:wrap}`, `.goth-left{flex:1 1 340px;min-width:0;max-width:100%}`, `.goth-right{flex:0 1 440px;min-width:0;max-width:100%}`. El div interno se adapta al contenedor padre: en ancho <780px los paneles **se apilan** (lista arriba, player abajo); en ≥780px quedan lado a lado. Se eliminó el `flex-direction:column` del media 900 (ya lo hace flex-wrap). `.goth-player{width:100%;max-width:100vw;overflow-x:hidden!important}`. **Verificado en Chrome headless en 9 tamaños: `scrollW==clientW` y `horizOverflow:false` en todos** (cero scroll horizontal), con apilamiento correcto en celular/tablet y lado a lado en laptop/desktop.
- Build OK. Push pendiente.


## Rama refine/taste-skills — pasada por emilkowalski/skills + taste-skill (anti-slop) — 2 commits

Aplicadas en rama nueva (NUNCA main). Las 3 skills descargadas: emilkowalski/skills (clon 2x: skills/impecable) + Leonxlnx/taste-skill. Audit del codigo mostro que ya cumplia la mayoria de reglas (sin scale(0), sin transition:all, springs tokens, sin ease-in en entradas). Cambios aplicados (todos verificados lint/build 0 errores) — 2 commits:

- **Commit 89f73bc polish(a11y) — invisible**: App.jsx `MotionConfig reducedMotion="never"→"user"`; Final.jsx `.final-hero min-height:100vh→100dvh`; index.css regla global `:focus-visible` anillo dorado + fallback `@media (prefers-reduced-transparency:reduce)` opaco para `.glass`; motion-tokens.js curvas fuertes `easeOut [0.23,1,0.32,1]` / `easeInOut [0.77,0,0.175,1]` / `drawer [0.32,0.72,0,1]` (extend don't fork).

- **Commit 6e0432c feat(motion) — visible**: transicion de pagina emilkowalski (fade+blur+scale) en wrappers raiz de 7 secciones — `Intro.jsx:113`, `Countdown.jsx:57`, `Puzzle.jsx:61`, `MemoryLane.jsx:61`, `Collage.jsx:109`, `Final.jsx:35`, `Playlist.jsx:398` — `initial={{opacity:0,scale:0.985,filter:'blur(6px)'}} animate={{opacity:1,scale:1,filter:'blur(0px)'}} exit={{opacity:0,scale:1.005,filter:'blur(5px)'}} transition={{duration:0.4,ease:motionTokens.easing.easeOut}}`. Playlist no importaba motion-tokens → agregado `import { motionTokens }`. Sin scale(0), sin transition:all. Verificado lint 0/0 + build OK (2221 modules, 59kB CSS / 488kB JS).

Pendiente en esta rama: decidir si iterar mas (typography/iconos/layout) o hacer push a origin como feature branch (no main).
