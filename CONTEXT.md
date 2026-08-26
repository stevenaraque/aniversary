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
2. **Tipografía — Cinzel + Cormorant Garamond** (`index.html:6`): `h1` Cinzel 700 0.12em `text-gradient-blood` / `white`, `p` Cormorant Garamond 300 italic, `span` Cinzel Decorative para badges. Sora solo como fallback. No usar Georgia.
3. **Liquid Glass** (`src/index.css:48`): `.glass` blur 16-40px saturate 1.4-1.8, `.glass-prominent`, `.glass-deep`, `.glass-refraction` conic 20s, `interact-lift/glow`.
4. **Fondo animado global** `src/components/CosmosBackground.jsx:1` — **Río de Cometas Dorados** canvas `fixed inset-0` 300 estrellas + 5 nebulosas + 18 cometas (sprites 4 puntas + cola gold) + 500 partículas, spawn 2-8 frames (más frecuente). `StarRainCanvas` en Intro 18/36 estrellas throttled 34ms + `FrostCanvas` 42 partículas solo desktop. Fondo transparente en secciones para ver cometas.
5. **Patrón Container/Wrapper** (`src/index.css:280`): `.main-wrapper` 100% flex center `min-h-[100dvh] h-[100dvh] overflow-hidden` → `.container` 1200 / `.container-lg` 1280 + `px 20→16` → grid. Intro usa `container-lg grid [1.05fr_0.95fr] gap-14` con foto. Sin scroll en Intro/Countdown.
6. **Motion** `src/lib/motion-tokens.js:1`: `springs.gentle/bouncy`, `motionTokens`. Intro: `StarRainCanvas` canvas, `FrostCanvas` ice crystals, `GothicButton` bat, `umbra` circles/dust/ink. Countdown: `TimeBlock` con anillo SVG progress.
7. **Iconos** `src/components/Icons.jsx:1`: `BatIcon` / `FlowerIcon` custom + Lucide `Crown/Gem/Heart/Skull`. Flaticon bat para botón Recordemos.
8. **Puzzle 4×4** `src/components/Puzzle.jsx:7` — 16 piezas, `glass-deep` + spotlight, fix `isSolvable` → `(inv+filaAbajo)%2===1`.
9. **Datos editables** `src/data/memories.js` `photos.js` `songs.js` — arrays simples, `public/puzzle-main.jpg` (reemplazar por foto real), `public/gothic/*.png` marcos.
10. **Build:** `npm run build` OK ~52kB CSS / 411kB JS. Tailwind `bg-linear-to-*`.

---

## Flujo App (`src/App.jsx:15`)

`SECTIONS = ['intro','countdown','puzzle','memories','letter','collage','playlist']` con `useState` + `goNext` + `AnimatePresence mode="wait"`. `CosmosBackground` fijo global + `relative z-10`.

| Sección | Archivo | Notas |
|---------|---------|-------|
| Intro | `Intro.jsx:99` | UMBRA hero `100dvh` static, `StarRain 18/36` + `Frost 42` + `geometric circles` + `dust/ink/fog` + `GothicButton Recordemos` bat + `gothic-prism` foto 575px `prism-border` |
| Countdown | `Countdown.jsx:7` | Fecha **26.08.2024** calendario real, `TimeBlock` 6 con anillo `gold/crimson` + watermark `II`, `pebble-button` bat, `Mi Canelita` badge |
| Puzzle | `Puzzle.jsx:64` | 4×4 premium |
| MemoryLane | `MemoryLane.jsx:17` | Swipe drag x 80/vel 400 |
| Letter | `Letter.jsx:8` | Sobre rotateY |
| Collage | `Collage.jsx:39` | Masonry |
| Playlist | `Playlist.jsx:14` | Visualizer |

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

