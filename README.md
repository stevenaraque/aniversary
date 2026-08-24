# 2 Años — Mi Canelita 🌻🦇

> Un regalo interactivo para celebrar 2 años juntos (24.08.2024 → 24.08.2026). Una experiencia web inmersiva desplegable en Vercel con diseño **Liquid Glass**, física de movimiento y micro-interacciones.

**Repositorio:** https://github.com/stevenaraque/2-a-os-mi-canelita  
**Stack:** React 19 + Vite 8 + Tailwind 4 + Motion + Lucide  
**Paleta:** Negro profundo `#050505` / Rojo sangre `#8b0000` → `#dc143c` / Girasol `#f4a900`

---

## Flujo de la experiencia

La app es una narrativa guiada en 7 secciones con progresión bloqueada:

| # | Sección | Ruta | Descripción |
|---|---------|------|-------------|
| 1 | **Intro** | `Intro.jsx` | Presentación con Heart pulsante, título word-by-word stagger, cursor follower con `useMotionValue+useSpring`, bats flotantes. Botón glass con shimmer. |
| 2 | **Countdown** | `Countdown.jsx` | Contador vivo años/meses/días/horas/min/seg desde `2024-08-24`. Cards glass con blur entry. |
| 3 | **Puzzle 4×4** | `Puzzle.jsx` | **16 piezas** deslizantes. Board `glass-deep` con bevel interno + spotlight que sigue el mouse. Tiles con specular highlight y sombra de profundidad. Hueco frosted con shimmer. Desbloquea el resto. |
| 4 | **Paseo de recuerdos** | `MemoryLane.jsx` | Carrusel swipeable (`drag x` + threshold offset 80 / velocity 400), lightbox glass con backdrop-blur. |
| 5 | **Carta** | `Letter.jsx` | Sobre glass que rota en Y (`rotateY 90→0`) al abrir. Texto stagger por párrafo con `filter:blur`. |
| 6 | **Collage** | `Collage.jsx` | Masonry 2/3/4 columnas, tiles glass con hover lift + zoom overlay. Lightbox fullscreen. |
| 7 | **Playlist** | `Playlist.jsx` | Player glass con visualizer animado (`useAnimation`), lista con estado activo + heart. |

Navegación centralizada en `App.jsx:12` con `AnimatePresence mode="wait"`.

---

## Qué se hizo

- [x] **Vite + React** scaffolding + Tailwind 4 (`@tailwindcss/vite`) + alias `motion`/`framer-motion`
- [x] **Sistema Liquid Glass** (`src/index.css:8`) — `backdrop-filter: blur(16-40px) saturate(1.4-1.8)`, `glass`/`glass-prominent`/`glass-deep`, refracción prismática con `conic-gradient` rotando 20s, `bg-liquid` radial, sombras de profundidad, `interact-lift/glow/press`
- [x] **Motion tokens** (`src/lib/motion-tokens.js:1`) — `springs.gentle/bouncy/snappy/stiff` y `motionTokens.duration/scale/easing` centralizados (skill `motion-advanced`)
- [x] **Iconos custom** (`src/components/Icons.jsx:1`) — `BatIcon` + `FlowerIcon` SVG (Lucide no exporta `Bat`), usados en todos los headers
- [x] **Puzzle 4×4 premium** (`src/components/Puzzle.jsx:7`) — board `glass-deep` con spotlight `useMotionValue+useSpring`, tiles con specular `from-white/12`, borde `white/10`, shimmer en hueco, preview thumbnail toggle, stats glass, trophy animado
- [x] **Foto principal** (`public/puzzle-main.jpg`) — imagen de ustedes (piratas) usada como textura del puzzle, placeholder para recuerdos/collage
- [x] **Datos editables** (`src/data/memories.js`, `photos.js`, `songs.js`) — arrays simples para reemplazar contenido sin tocar componentes
- [x] **Build verificado** — `npm run build` ✓ 2219 módulos, 37kB CSS / 369kB JS gzip 113kB
- [x] **Fixes runtime** — `FlowerIcon` import restaurado en `Countdown.jsx:4`, `useInViewOnce` huérfano eliminado en `Puzzle.jsx:49`, hook custom `src/hooks/useInViewOnce.js`

## Qué se va a hacer / Pendiente (personalizable por ti)

- [ ] Reemplazar placeholder de `src/components/Letter.jsx:106` con tu carta real
- [ ] Cambiar fecha en `src/components/Countdown.jsx:8` si el aniversario es otro día
- [ ] Llenar `src/data/memories.js` con fotos/videos reales (rutas `public/` o URLs)
- [ ] Llenar `src/data/photos.js` (máx 40 recomendado) para el collage masonry
- [ ] Llenar `src/data/songs.js` con `src` de `.mp3` o URLs de YouTube/Spotify
- [ ] Ajustar `showPreview` o quitarlo si no quieres pista del puzzle
- [ ] Opcional: añadir música autoplay con interacción (navegadores bloquean sin gesto)
- [ ] Opcional: aplicar mismo nivel premium del puzzle a collage/playlist (a pedido)
- [ ] Deploy en Vercel (ver abajo) y compartir URL

---

## Estructura

```
anniversary-app/
├── public/
│   └── puzzle-main.jpg
├── src/
│   ├── components/
│   │   ├── Icons.jsx          # BatIcon + FlowerIcon
│   │   ├── Intro.jsx
│   │   ├── Countdown.jsx
│   │   ├── Puzzle.jsx         # 4×4 premium
│   │   ├── MemoryLane.jsx
│   │   ├── Letter.jsx
│   │   ├── Collage.jsx
│   │   └── Playlist.jsx
│   ├── data/
│   │   ├── memories.js
│   │   ├── photos.js
│   │   └── songs.js
│   ├── hooks/
│   │   └── useInViewOnce.js
│   ├── lib/
│   │   └── motion-tokens.js
│   ├── App.jsx
│   ├── index.css              # liquid glass system
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## Desarrollo local

```powershell
cd "C:\Users\PC_03\OneDrive\Desktop\Steven Araque Castro\agente\Template\anniversary-app"
npm install
npm run dev      # http://localhost:5173
npm run build    # build producción
npm run preview  # previsualizar build
```

## Deploy gratis (Vercel)

1. Haz push de `anniversary-app/` a este repo (ya configurado).
2. En https://vercel.com → Add New → Project → Import `stevenaraque/2-a-os-mi-canelita`
3. Framework: **Vite** (detecta automático), Build: `npm run build`, Output: `dist`
4. Deploy → URL `https://2-a-os-mi-canelita.vercel.app`

Alternativa Netlify: arrastra `dist/` o conecta el repo.

---

## Personalización rápida

| Qué | Dónde |
|-----|-------|
| Carta | `src/components/Letter.jsx:106` |
| Fecha | `src/components/Countdown.jsx:8` |
| Recuerdos | `src/data/memories.js` |
| Collage | `src/data/photos.js` |
| Canciones | `src/data/songs.js` |
| Colores | `src/index.css:3` (`@theme`) + `src/lib/motion-tokens.js` |

---

## Créditos

Hecho con amor por **Steven** para su canelita — 2 años juntos.  
Diseño: Liquid Glass (blur/refracción/profundidad) + Motion Advanced (springs, `useMotionValue`, `useTransform`, shimmer, drag).
