# 2 Años — Mi Canelita 🌻🦇

> Regalo interactivo por 2 años juntos (24.08.2024 → 24.08.2026). Web inmersiva en React con **Liquid Glass**, **Motion Advanced** y patrón **Container/Wrapper** spacious.

**Repos:** `stevenaraque/aniversary` (`main` estable) + `reflect/spacious-glass` (experimental spacious)  
**Stack:** React 19 + Vite 8 + Tailwind 4 + Motion + Lucide  
**Paleta:** Negro `#050505` / Rojo `#8b0000→#dc143c` / Dorado `#d4af37→#f9e076` / Girasol `#f4a900`

---

## Flujo (7 secciones, `App.jsx:12` con `AnimatePresence`)

| # | Sección | Ruta | Qué hace |
|---|---------|------|----------|
| 1 | **Intro** | `Intro.jsx:124` | **Lluvia de estrellas** 80 puntos + orbs dorados/crimson, título `Nuestro Tiempo` word-by-word, `Heart` + `BatIcon`/`FlowerIcon` caracterizados (ojos, pétalos), cursor follower `useMotionValue+useSpring`, layout `main-wrapper→container` esparcido |
| 2 | **Countdown** | `Countdown.jsx:46` | Años/meses/días/horas/min/seg vivo desde `2024-08-24`, cards `glass-refraction` |
| 3 | **Puzzle 4×4** | `Puzzle.jsx:64` | 16 piezas, board `glass-deep` + spotlight mouse, tiles con specular, hueco frosted shimmer. Lógica `isSolvable` fija (suma impar) |
| 4 | **MemoryLane** | `MemoryLane.jsx:17` | Carrusel swipe `drag x` (offset 80/vel 400), lightbox `backdrop-blur-xl` |
| 5 | **Letter** | `Letter.jsx:8` | Sobre `rotateY 90→0`, párrafos stagger `blur(4px)` |
| 6 | **Collage** | `Collage.jsx:39` | Masonry `columns` + `glass` hover lift, lightbox |
| 7 | **Playlist** | `Playlist.jsx:14` | Player `glass-prominent` + visualizer `useAnimation`, lista activa |

---

## Arquitectura — Patrón Container/Wrapper (Reflect spacious)

Tres niveles, responsive sin perder proporción:

```html
<section class="main-wrapper">  <!-- 1. WRAPPER: 100% ancho, fondo, flex center -->
  <div class="container">        <!-- 2. CONTAINER: max-width 1200px, margin auto, padding 20→16 -->
    <div class="cards-grid">    <!-- 3. GRID: repeat(auto-fit, minmax(280px,1fr)), gap 24 -->
      <div class="card">...</div>
    </div>
  </div>
</section>
```

- `src/index.css:241` → `.main-wrapper`, `.container` (1200), `.container-lg` (1280), `.container-sm` (880), `.cards-grid`, `.section-wrapper` (py 80→48 móvil)
- Cada sección envuelta así → más aire en desktop, sin desbordar en móvil

---

## Qué se hizo

- [x] Scaffold Vite+React + Tailwind 4 (`@theme` `src/index.css:3` con 4 dorados)
- [x] **Liquid Glass** (`src/index.css:48`) — `blur 16-40px saturate 1.4-1.8`, `glass`/`prominent`/`deep`, `glass-refraction` con `conic-gradient` 20s, `interact-lift/glow`
- [x] **Fondo animado (no imagen)** `src/components/AnimatedBackground.jsx:1` — 3 orbs `blur 90-110px` drifting 18-26s (crimson 0.45, dorado 0.5, rose 0.15) + vignette + dot pattern
- [x] **Intro lluvia estrellas** `src/components/Intro.jsx` — 80 estrellas `twinkle` + `translate --transform`, `StarField` + `HeartPulse` con `FlowerIcon`/`BatIcon` caracterizados
- [x] **Tokens** `src/lib/motion-tokens.js:1` — `springs.gentle/bouncy/snappy`, `motionTokens`
- [x] **Iconos** `src/components/Icons.jsx:1` — `BatIcon` (alas amplias, ojos) + `FlowerIcon` (8 pétalos dorados, centro `gold-dark/light`)
- [x] **Puzzle 4×4 premium** con spotlight mouse + preview + fix solvabilidad `src/components/Puzzle.jsx:14`
- [x] `public/puzzle-main.jpg` como textura
- [x] Datos editables `src/data/*`
- [x] Build ✓ `pnpm build` 46kB CSS / 371kB JS
- [x] Fix `@theme` warning VS Code (`.vscode/settings.json` `css.lint.unknownAtRules: ignore`)

## Qué se va a hacer / Pendiente tuyo

- [ ] Cambiar carta en `Letter.jsx:106`, fecha `Countdown.jsx:8`, fotos `memories.js`/`photos.js`, canciones `songs.js`
- [ ] Ajustar intensidad lluvia/orbs si quieres más sutil
- [ ] Deploy Vercel ya activo (`aniversary` main) — `reflect/spacious-glass` es preview

---

## Estructura

```
anniversary-app/
├── public/puzzle-main.jpg
├── src/
│   ├── components/
│   │   ├── AnimatedBackground.jsx
│   │   ├── Icons.jsx
│   │   ├── Intro.jsx          # star rain
│   │   ├── Countdown.jsx
│   │   ├── Puzzle.jsx         # 4×4
│   │   ├── MemoryLane.jsx
│   │   ├── Letter.jsx
│   │   ├── Collage.jsx
│   │   └── Playlist.jsx
│   ├── data/memories.js photos.js songs.js
│   ├── lib/motion-tokens.js
│   ├── hooks/useInViewOnce.js
│   ├── index.css              # glass + container/wrapper + gold
│   └── App.jsx
└── package.json
```

---

## Local

```powershell
cd "C:\Users\PC_03\OneDrive\Desktop\Steven Araque Castro\agente\Template\anniversary-app"
git checkout main                      # estable
git checkout reflect/spacious-glass    # spacious con estrellas
npm install; npm run dev               # http://localhost:5173
npm run build
```

## Deploy

Vercel → Import `stevenaraque/aniversary` (main). Reflect branch preview: Vercel → Add Project → mismo repo → Branch `reflect/spacious-glass`.

---

## Personalización

| Qué | Dónde |
|-----|-------|
| Carta | `Letter.jsx:106` |
| Fecha | `Countdown.jsx:8` |
| Recuerdos | `memories.js` |
| Collage | `photos.js` |
| Canciones | `songs.js` |
| Colores | `index.css:3` + `AnimatedBackground.jsx:8` |
| Estrellas | `Intro.jsx` `StarField` count/duration |

Hecho con amor por **Steven** — 2 años juntos. Diseño: Liquid Glass + Motion + Reflect spacious.
