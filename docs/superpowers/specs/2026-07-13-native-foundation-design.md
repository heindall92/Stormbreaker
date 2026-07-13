# Fundación Nativa — Stormbreaker DFIR (sub-proyecto 1/5)

## Contexto

Stormbreaker es una consola de triaje DFIR de escritorio. Dos intentos previos de construirla como app WPF/XAML pura fueron descartados por el autor ("era una basura", "todo salía mal") — el punto de falla fue reimplementar a mano el efecto glassmorphism (blur, tokens oklch, bordes translúcidos) en XAML, que no tiene equivalente directo de `backdrop-filter`.

En paralelo existe `temp_lovable/`, una SPA (TanStack Start + React 19 + Vite + Tailwind v4) que ya implementa el diseño glass exacto deseado, documentado en la "biblia del blur" del autor (tokens oklch, fórmula `bg-background/10 backdrop-blur-xl border-white/20`, patrones por componente). Esta SPA corre hoy con datos demo (`case-data.ts`) y sin backend real — el propio plan de Lovable la marca explícitamente como fuera de alcance para parseo forense real o port nativo.

El producto completo (ingestión EVTX/MFT/Registro, correlación MITRE ATT&CK, copiloto IA, reportes) es demasiado grande para un solo spec. Se decidió dividirlo en 5 sub-proyectos independientes:

1. **Fundación nativa** (este documento)
2. Motor de ingestión y parsers (EVTX, MFT, Registro, USN Journal)
3. Vistas forenses conectadas a datos reales
4. Copiloto de IA (Ollama)
5. Reportes y exportación

## Objetivo de este sub-proyecto

Producir un `.exe` nativo de Windows que abra una ventana sin marco, con el look glassmorphism idéntico al de `temp_lovable`, sin lógica forense real todavía (vistas con dataset demo). Debe demostrar que el shell nativo es sólido antes de construir nada forense encima.

## Decisión de arquitectura

**WPF (.NET 8) + WebView2**, descartando WPF/XAML puro (repetiría el fallo anterior) y Tauri/Rust (obligaría a reescribir la lógica forense futura en un lenguaje nuevo sin necesidad — .NET tiene interop directo con Win32 y librerías maduras para EVTX/MFT/Registro, que es lo que se necesita en los sub-proyectos siguientes).

El WebView2 renderiza el build de producción de `temp_lovable/` tal cual — el CSS/Tailwind del glass no se toca ni se reinterpreta.

## Arquitectura

- **Shell nativo**: proyecto `Stormbreaker.Shell` (WPF, .NET 8). `MainWindow` con `WindowStyle="None"`, sin `AllowsTransparency` (evita el costo de rendimiento de ventanas transparentes reales — no se necesita, ver "Tipo de blur" abajo).
- **Chrome custom**: sin barra de título de Windows. El navbar flotante que ya existe en `temp_lovable` es la zona de arrastre (`WM_NCHITTEST` personalizado) y contiene los botones minimizar/maximizar/cerrar dibujados en HTML/CSS. Se conserva resize y snap de Windows 11 vía `WM_NCCALCSIZE`.
- **Tipo de blur**: glass autocontenido (no Acrylic de escritorio real). La app dibuja su propio fondo oscuro + canvas de partículas y los paneles hacen blur sobre ESE fondo interno — exactamente el comportamiento actual de `temp_lovable` en el navegador. No depende de la versión de Windows ni de composición DWM.
- **Contenido**: `Microsoft.Web.WebView2.Wpf.WebView2` a pantalla completa dentro del cliente de la ventana. En producción, `CoreWebView2.SetVirtualHostNameToFolderMapping` mapea un host virtual (`https://stormbreaker.local/`) a la carpeta con el build estático de Vite embebido en el `.exe` — no depende de ningún servidor corriendo en runtime.
- **Bridge nativo↔web**: `AddHostObjectToScript` expone un objeto `shell` a JS con `Minimize()`, `Maximize()`, `Close()`, `StartDrag()`. El frontend detecta `window.chrome.webview` para mostrar los botones de ventana custom (en el navegador normal, `bun run dev` / `npm run dev`, siguen ocultos).
- **Empaquetado**: `dotnet publish -r win-x64 --self-contained` genera un único `.exe`. Se verifica en el arranque que el WebView2 Runtime (Evergreen) esté presente.

## Componentes

```
Stormbreaker.Shell/
 ├── MainWindow.xaml / .cs      — ventana sin marco, host del WebView2, interop Win32
 ├── NativeBridge.cs            — objeto expuesto a JS (Minimize/Maximize/Close/StartDrag)
 ├── wwwroot/                   — build de producción de temp_lovable (vite build), embebido
 └── Stormbreaker.Shell.csproj

temp_lovable/                  — sin cambios de diseño; se agrega:
 └── src/hooks/use-native-shell.ts  — detecta window.chrome.webview y expone los controles custom
```

## Flujo de datos

1. Arranque: `MainWindow` crea el `WebView2`, mapea el host virtual a `wwwroot`, navega a `https://stormbreaker.local/index.html`.
2. Ventana↔Web: JS llama al bridge nativo únicamente para control de ventana. No hay push de datos nativo→web en este sub-proyecto.
3. Las 8 vistas (Dashboard, Events, MFT, Timeline, Correlation, AI Analyst, Reports, Settings) se cargan con el dataset demo actual (`case-data.ts`) sin cambios funcionales.
4. Conectar datos forenses reales (EVTX/MFT/Registro) queda fuera de alcance — es el sub-proyecto 2.

## Manejo de errores

- **WebView2 Runtime ausente**: diálogo WPF nativo (no HTML — es el único fallback que no depende de WebView2 funcionando) con enlace de descarga del runtime.
- **Build embebido faltante o corrupto**: pantalla de error WPF nativa mínima en vez de ventana en blanco.

## Testing

Manual únicamente en esta fase (es shell + empaquetado, no lógica forense):

- Redimensionar la ventana, arrastrar desde el navbar, minimizar/maximizar/cerrar, snap de Windows 11 (Win+flechas).
- Comparación visual lado a lado contra `temp_lovable` corriendo en `localhost:8080` (vía navegador) para confirmar que el glass es idéntico — mismos tokens oklch, mismo blur, mismos bordes.
- Verificar que el `.exe` publicado arranca sin necesitar `bun`/`npm`/servidor de desarrollo instalado.

## Fuera de alcance (explícito)

- Parseo real de EVTX/MFT/Registro/USN Journal.
- Cualquier lógica de correlación, MITRE ATT&CK, o copiloto de IA.
- Acrylic real de escritorio (composición DWM mostrando el fondo del escritorio).
- Tests automatizados de UI.
