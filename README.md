# 2 Años — Mi Canelita 🌻🦇

> Regalo interactivo por 2 años juntos (26.08.2024 → 26.08.2026). Web inmersiva en React con **Liquid Glass Gótico**, **Motion** y patrón **Container/Wrapper** sin scroll.

**Repo:** `stevenaraque/aniversary` (`main` estable)  
**Stack:** React 19 + Vite 8 + Tailwind 4 + Motion + Lucide  
**Paleta:** Negro `#050505` Obsidian `#0a0a0f` / Vino `#8b0000→#dc143c` / Dorado `#d4af37→#f9e076` / Bone `#e8dcc8`

> **Para retomar en otro chat:** lee `CONTEXT.md` en la raíz — contiene ramas, decisiones, stack y pendientes.

---

## Flujo (7 secciones, `App.jsx:15` con `AnimatePresence`)

| # | Sección | Ruta | Qué hace |
|---|---------|------|----------|
| 1 | **Intro** | `Intro.jsx:99` | UMBRA hero `100dvh` static sin scroll `StarRain 18/36` + `Frost 42` + `geometric circles/dust/ink/fog` + `filigree` + `GothicButton Recordemos` bat + foto `gothic-prism 575px` `prism-border` + `cross-ring 16` |
| 2 | **Countdown** | `Countdown.jsx:7` | Desde **26.08.2024** calendario real, 6 bloques `gold/crimson` con anillo SVG + watermark `II`, `pebble-button` bat, `Mi Canelita` badge |
| 3 | **Puzzle 4×4** | `Puzzle.jsx:64` | 16 piezas, board `glass-deep` + spotlight, fix `isSolvable` |
| 4 | **MemoryLane** | `MemoryLane.jsx:17` | Carrusel swipe `drag x` |
| 5 | **Letter** | `Letter.jsx:8` | Sobre `rotateY` |
| 6 | **Collage** | `Collage.jsx:39` | Masonry `columns` |
| 7 | **Playlist** | `Playlist.jsx:153` | Reproductor gótico: disco giratorio + lista panel + shuffle/repeat + visualizer |

---

## Arquitectura — Container/Wrapper sin scroll

```html
<section class="main-wrapper">  <!-- 100% flex center min-h-[100dvh] h-[100dvh] overflow-hidden bg-transparent -->
  <div class="container-lg">      <!-- 1280px grid [1.05fr_0.95fr] gap-14 px-6→8 -->
    <div class="content">...</div>
    <div class="photo gothic-prism">...</div>
  </div>
</section>
```

- `src/index.css:280` → `.main-wrapper`, `.container` 1200, `.container-lg` 1280, `.container-sm` 880, `px 20→16` móvil
- Fondo global `CosmosBackground.jsx:1` `fixed inset-0` 300★ + 18☄ `spawn 2-8` visible detrás (`bg-transparent` en secciones)
- Intro/Coundown `100dvh` sin scroll, centrado, `Cormorant Garamond` (delicada), `will-change` GPU

---

## Qué se hizo (08-2026)

- [x] Scaffold Vite+React + Tailwind 4 `@theme` `src/index.css:3`
- [x] **Liquid Glass** `src/index.css:48` `blur 16-40px`
- [x] **Intro gótica UMBRA** `Intro.jsx:99` `StarRain 18/36` lenta 35% + `Frost 42` desktop-only + `cross-ring 16` + marco `gothic-prism 575px` height auto adaptado a foto, `GothicButton` bat
- [x] **Countdown** `Countdown.jsx:7` fecha 26.08.2024 calendario real, 6 bloques con anillo, `pebble-button` optimizado
- [x] **Tokens** `src/lib/motion-tokens.js:1` `springs.gentle`
- [x] **Iconos** `Icons.jsx:1` `BatIcon`/`FlowerIcon` + `Crown/Gem`
- [x] `public/puzzle-main.jpg` + `public/gothic/*.png`
- [x] Build ✓ `52kB CSS / 401kB JS`

## Pendiente tuyo

- [ ] Carta `Letter.jsx:106`, fotos `memories.js`/`photos.js` (reemplazar `puzzle-main.jpg`), canciones `songs.js`
- [ ] Ajustar intensidad cometas si quieres

---

## Estructura

```
anniversary-app/
├── public/puzzle-main.jpg + gothic/
├── src/
│   ├── components/
│   │   ├── CosmosBackground.jsx
│   │   ├── Intro.jsx          # UMBRA hero + prism
│   │   ├── Countdown.jsx      # 26.08.2024
│   │   ├── Puzzle.jsx
│   │   ├── MemoryLane.jsx
│   │   ├── Letter.jsx
│   │   ├── Collage.jsx
│   │   └── Playlist.jsx
│   ├── data/
│   ├── lib/motion-tokens.js
│   ├── index.css
│   └── App.jsx
└── package.json
```

---

## Local

```powershell
cd "C:\Users\USER\Desktop\2 years\agente\Template\anniversary-app"
git checkout main; npm install; npm run dev   # http://localhost:5173
npm run build
```

## Deploy

Vercel → Import `stevenaraque/aniversary` (main).

---

## Personalización

| Qué | Dónde |
|-----|-------|
| Carta | `Letter.jsx:106` |
| Fecha | `Countdown.jsx:7` |
| Recuerdos | `memories.js` |
| Collage | `photos.js` |
| Canciones | `songs.js` |
| Colores | `index.css:3` |
| Foto Intro | `public/puzzle-main.jpg` |

Hecho con amor por **Steven** — 2 años juntos. Diseño: Liquid Glass Gótico + UMBRA + Prism.


> Update 25-08-2026: MemoryLane responsive + puzzle centrado + margenes invisibles

