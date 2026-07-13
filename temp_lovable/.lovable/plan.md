## Stormbreaker DFIR Console — Adaptación Web

Porto la consola DFIR de escritorio a una SPA web (TanStack Start) manteniendo la estética glass oscura de Aurelia y toda la funcionalidad demo del handoff.

### Stack
- TanStack Start + React 19 + Vite 7 (ya configurado)
- Tailwind v4 con tokens en `src/styles.css`
- Zustand (estado en memoria, sin persistencia)
- TanStack Query (ya en el proyecto)
- Radix Dialog + sonner (ya disponibles vía shadcn)

### Diseño
- Dark mode forzado en `<html class="dark">` desde `__root.tsx`
- Paleta Aurelia: fondo `oklch(0.129 0.042 264.695)`, acentos cyan/azure
- Fuentes Inter + JetBrains Mono cargadas con `<link>` en el head del root
- Fórmula glass: `bg-background/10 backdrop-blur-xl border-white/15`
- Canvas de partículas de fondo
- Iconos SVG stroke (cero emojis)

### Layout
- `src/routes/__root.tsx`: shell HTML, fuentes, canvas de partículas, providers
- `src/routes/_app.tsx`: topbar glass flotante + nav vertical glass (píldora derecha) con 8 items y atajos de teclado 1–8
- `<Outlet />` para las vistas

### 8 vistas (rutas `src/routes/_app.*.tsx`)
1. **Dashboard** — KPIs, timeline resumen, alertas top
2. **Event Logs** — tabla con filtros, expand por fila, búsqueda
3. **MFT / NTFS** — tabla de artefactos con detección de timestomp
4. **Timeline** — línea temporal correlada de los 4 sources
5. **Correlation** — grafo/mapping a técnicas MITRE ATT&CK
6. **AI Analyst** — chat con streaming Ollama (NDJSON) + fallback demo
7. **Reports** — export `.md` / `.json`
8. **Settings** — endpoint Ollama, test de conexión, modelo

### Datos y lógica
- `src/lib/types.ts` — tipos DFIR (Event, MftEntry, Alert, Case…)
- `src/lib/case-data.ts` — caso demo (USB → PowerShell → C2 185.220.101.47 → persistencia → timestomp → destrucción → lateral)
- `src/lib/store.ts` — Zustand (caso activo, filtros, settings, chat)
- `src/lib/ollama.ts` — cliente `fetch` streaming NDJSON, `buildDfirMessages()`, `demoAnalysis()` / `streamDemo()` como fallback
- `src/lib/md.ts` — markdown→HTML seguro para render del analista IA
- Import modal Radix con drag & drop (solo demo: carga el caso ejemplo)
- Animación de boot al primer arranque, toasts con sonner

### Fuera de alcance
- Backend real (FastAPI, JWT, Ollama server) — el cliente apunta a `http://localhost:11434` por defecto y cae al modo demo si no responde
- Parseo real de EVTX/MFT — solo dataset demo
- Port nativo WPF/.NET

### Detalles técnicos
- Sin `localStorage` en initializers (evita hydration mismatch); settings viven en memoria Zustand
- `head()` por ruta con title/description únicos
- Cada ruta con `errorComponent` + `notFoundComponent`
- Todo cliente puro: no requiere server functions ni Lovable Cloud
