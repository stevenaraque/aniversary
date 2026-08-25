# CONTEXT — 2 Años Mi Canelita (para retomar en otro chat)

> Lee este archivo al iniciar un nuevo chat para retomar sin perder ritmo. Proyecto de Steven para su novia — 2 años juntos (24.08.2024 → 24.08.2026).

**Repositorio:** https://github.com/stevenaraque/aniversary  
**Ramas:**
- `main` @ `129afef` — **estable, producción en Vercel** (ya incluye todo lo de reflect, merge fast-forward)
- `reflect/spacious-glass` @ `129afef` — experimental spacious (ahora idéntica a main, mantener para pruebas futuras)
- Backup físico: `anniversary-app-backup-pre-reflect/` en `Template/`

**Stack:** React 19 + Vite 8 + Tailwind 4 (`@tailwindcss/vite`) + Motion (`motion` + `framer-motion`) + Lucide  
**Node:** v24.19.0

---

## Decisiones de diseño (no revertir sin preguntar)

1. **Paleta:** Negro profundo `#050505` / Rojo `#8b0000→#dc143c` / **Dorado** `#d4af37` `#f9e076` `#b8941f` (`src/index.css:3` `@theme`) + Girasol `#f4a900`. Gold usado en FlowerIcon, Trophy, orbs, cometas.
2. **Tipografía Combo 2 — Cormorant Garamond + Sora** (`index.html:6` Google Fonts, `src/index.css:20`): `body` Sora 200 `rgba(255,234,167,0.5)`, `h1/h2` Cormorant Garamond 300 italic `#ffd700` 0.04em, `h3` Cormorant 600 `#ffeaa7` 0.06em. No usar Georgia.
3. **Liquid Glass** (`src/index.css:48`): `.glass` blur 16-40px saturate 1.4-1.8, `.glass-prominent`, `.glass-deep`, `.glass-refraction` con `conic-gradient` prism 20s, `interact-lift/glow/press`.
4. **Fondo animado global** `src/components/CosmosBackground.jsx:1` — **Río de Cometas Dorados** canvas `fixed inset-0` con 300 estrellas flicker, 5 nebulosas, 18 cometas (sprites estrella 4 puntas + cola neon gold), 500 partículas, flashes, cursor glow. Reemplaza `AnimatedBackground` per-sección (ahora `App.jsx:3` global). No usar imagen de fondo.
5. **Patrón Container/Wrapper (Reflect spacious)** (`src/index.css:241`): `.main-wrapper` 100% flex column center → `.container` 1200px / `.container-lg` 1280px / `.container-sm` 880px + padding 20→16 móvil → `.cards-grid` `repeat(auto-fit, minmax(280px,1fr))`. Cada sección envuelta así para más aire sin romper responsive. Estructura de 7 secciones **no se rediseña**, solo más espacio.
6. **Motion** `src/lib/motion-tokens.js:1`: `springs.gentle/bouncy/snappy`, `motionTokens`. Intro tiene `CursorFollower` `useMotionValue+useSpring`, `AnimatedTitle` word-by-word stagger, `StarRain` 80 estrellas (Intro) + `FloatingBat` x6, `CharacterDuo` bat/girasol caracterizados con ojos/pétalos.
7. **Iconos** `src/components/Icons.jsx:1`: `BatIcon` alas amplias con ojos, `FlowerIcon` 8 pétalos dorados + centro gold-dark/light. Lucide no tiene Bat, por eso custom.
8. **Puzzle 4×4** `src/components/Puzzle.jsx:7` — 16 piezas, board `glass-deep` + spotlight mouse `useMotionValue`, fix solvabilidad `isSolvable` → `(inversiones + filaDesdeAbajo) %2===1` para par (antes estaba invertido y era imposible).
9. **Datos editables** `src/data/memories.js` `photos.js` `songs.js` — arrays simples, imágenes en `public/puzzle-main.jpg` (foto piratas).
10. **Build:** `npm run build` OK 47kB CSS / 378kB JS. Tailwind v4 canonical `bg-linear-to-*` (no `bg-gradient-to-*`), `w-130` etc. `@theme` warning silenciado con `.vscode/settings.json` (`css.lint.unknownAtRules: ignore`, gitignored).

---

## Flujo App (`src/App.jsx:15`)

`SECTIONS = ['intro','countdown','puzzle','memories','letter','collage','playlist']` con `useState` + `goNext` + `AnimatePresence mode="wait"`. Progresión bloqueada, cada sección `onNext` avanza. `CosmosBackground` fijo global + `relative z-10` contenido.

| Sección | Archivo | Notas |
|---------|---------|-------|
| Intro | `Intro.jsx:123` | StarRain + CharacterDuo + HeartPulse + badge |
| Countdown | `Countdown.jsx:46` | Vivo años/meses/días/horas/min/seg desde 2024-08-24 |
| Puzzle | `Puzzle.jsx:64` | 4×4 premium, preview toggle |
| MemoryLane | `MemoryLane.jsx:17` | Swipe drag x offset 80 / vel 400 |
| Letter | `Letter.jsx:8` | Sobre rotateY |
| Collage | `Collage.jsx:39` | Masonry columns |
| Playlist | `Playlist.jsx:14` | Visualizer |

---

## Qué está hecho / Pendiente

**Hecho:** Todo lo arriba + README actualizado + fixes Tailwind + solvabilidad + deploy Vercel main.

**Pendiente del usuario (no tocar sin pedir):**
- Carta real en `Letter.jsx:106`
- Fecha si cambia en `Countdown.jsx:8`
- Fotos/videos `memories.js`, `photos.js` (máx 40), canciones `songs.js`
- Ajustar intensidad cometas/estrellas si quiere más sutil

**No hacer:** Cambiar estructura de 7 secciones, cambiar puzzle a 5×5, volver a Georgia, quitar dorado, usar emojis en vez de Icons.

---

## Comandos

```powershell
cd "C:\Users\PC_03\OneDrive\Desktop\Steven Araque Castro\agente\Template\anniversary-app"
git checkout main; npm run dev          # estable http://localhost:5173
git checkout reflect/spacious-glass; npm run dev -- --port 5174  # preview spacious
npm run build
git log --oneline --all --graph -8
```

**Deploy:** Vercel importa `stevenaraque/aniversary` branch `main` (auto). `reflect/spacious-glass` genera preview si está habilitado en Vercel Settings → Git → Create preview for every branch.

---

## Para el próximo chat

1. Lee este CONTEXT.md
2. Verifica rama activa con `git branch --show-current`
3. Pregunta antes de mergear o cambiar paleta/tipografía
4. Mantén `main` como producción, experimenta en `reflect/spacious-glass` o nuevas ramas
