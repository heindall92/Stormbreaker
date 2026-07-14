# ⚡ Stormbreaker — Consola de Análisis Forense Avanzado DFIR
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Platform: WPF + WebView2](https://img.shields.io/badge/Plataforma-WPF%20%2B%20WebView2%20%7C%20.NET%208.0--windows-blueviolet.svg)](Stormbreaker.Shell)
[![Att&ck: MITRE](https://img.shields.io/badge/ATT%26CK-MITRE%20Mapped-red.svg)](https://attack.mitre.org)

**Stormbreaker** es una consola de triaje y respuesta ante incidentes (IR / DFIR) de alto rendimiento para escritorio. Actúa como cliente nativo de Windows para la suite **Muninn DFIR Suite**, permitiendo parsear, correlacionar y visualizar registros de eventos de Windows, colmenas del Registro, USN Journal y registros NTFS MFT.

Diseñada bajo una estética oscura premium de glassmorfismo (inspirada en Aero y Mica de Windows 11), Stormbreaker integra asistencia de IA local (a través de Ollama) para transmitir análisis en tiempo real y construir líneas de tiempo de la cadena de ataque mapeadas directamente al marco de referencia **MITRE ATT&CK®**.

> **Estado actual:** la fundación nativa (ventana WPF sin marco + WebView2 alojando la UI, arrastre/resize/minimizar/maximizar/cerrar nativos, empaquetado standalone) está completa y verificada — ver [`docs/superpowers/specs/2026-07-13-native-foundation-design.md`](docs/superpowers/specs/2026-07-13-native-foundation-design.md) y [`docs/superpowers/plans/2026-07-13-native-foundation-plan.md`](docs/superpowers/plans/2026-07-13-native-foundation-plan.md). Las capacidades forenses descritas abajo (parseo real de EVTX/MFT/Registro, correlación MITRE, copiloto IA) son la visión del producto completo y **aún no están implementadas**; la consola corre hoy sobre datos de demostración.

---

## 🛡️ Capacidades Principales

*   **⚡ Super-Línea de Tiempo Forense:** Correlaciona registros de eventos (Security, Sysmon, PowerShell, Defender) junto con entradas fuera de línea de la tabla NTFS MFT.
*   **🕵️ Detector de Timestomp:** Identifica automáticamente manipulación de marcas de tiempo mediante la comparación de atributos `$STANDARD_INFORMATION` (`$SI`) y `$FILE_NAME` (`$FN`).
*   **🔀 Gráfico de Correlación de Ataque:** Reconstruye cadenas parent-child de procesos/PID para cazar LOLBins y técnicas de movimiento lateral.
*   **🤖 Copiloto de IA Local:** Generación de informes completamente fuera de línea a través de **Ollama** (ej. Llama 3.1, Mistral, Qwen 2.5), garantizando la privacidad y evitando fugas de datos forenses a la nube.
*   **📊 Mapeo MITRE ATT&CK:** Traducción directa de logs e instrucciones ejecutadas a identificadores de técnicas ofensivas.
*   **📥 Zona de Ingesta Forense:** Simulación visual de drag-and-drop de evidencias lista para la conexión con parsers reales.
*   **📁 Motor de Exportación:** Reportes listos para analistas exportables en Markdown, IOCs en formato JSON y reportes formateados en PDF.

---

## 🎨 Diseño Visual Premium

Stormbreaker implementa estilos de control nativos WPF optimizados:
*   **Superficies Glassmorphism:** Paleta de colores personalizada mediante equivalentes oklch/hex (`#BF0A0E1A` para paneles profundos y `#0AFFFFFF` para rejillas translúcidas).
*   **Menú Lateral Colapsable:** Panel de navegación izquierdo interactivo con transiciones de ancho fluidas ($70\text{px} \leftrightarrow 220\text{px}$) mediante Storyboards de WPF.
*   **Diseño Totalmente Responsivo:** Autoajuste y recorte de texto en celdas críticas (`TextTrimming="CharacterEllipsis"`) y rejillas proporcionales estrella (`*`) que evitan desbordamientos en pantallas ultra-anchas.
*   **Tipografía de Alta Legibilidad:** Inter para controles generales y `JetBrains Mono` / `Consolas` para la visualización de datos forenses crudos.

---

## 📂 Arquitectura del Proyecto

Stormbreaker es un shell nativo de Windows (WPF + WebView2) que aloja una SPA (TanStack Start + React 19 + Tailwind v4) construida como sitio estático — sin depender de ningún servidor en tiempo de ejecución:

```
Stormbreaker.Shell/            — shell nativo (.NET 8, WPF)
 ├── MainWindow.xaml(.cs)      — ventana sin marco, host del WebView2, servidor de archivos
 │                                estáticos (WebResourceRequested), drag/resize nativos
 ├── NativeBridge.cs           — puente COM: minimizar/maximizar/cerrar expuestos a JS
 ├── SpaFallbackResolver.cs    — lógica de fallback de rutas (con tests, Stormbreaker.Shell.Tests/)
 ├── WebView2RuntimeChecker.cs / ErrorWindow.xaml(.cs) — manejo de fallos de arranque
 └── wwwroot/                  — build estático de temp_lovable, copiado en cada compilación

temp_lovable/                  — UI glass (TanStack Start, Tailwind v4), origen del diseño visual
 ├── src/routes/                — 8 vistas: Dashboard, Events, MFT, Timeline, Correlation,
 │                                 AI Analyst, Reports, Settings (datos de demostración)
 └── src/hooks/use-native-shell.ts — detecta el shell nativo y expone los controles de ventana
```

Detalle completo de las decisiones de arquitectura (por qué WebView2 en vez de XAML puro, por qué se abandonó `SetVirtualHostNameToFolderMapping`, etc.) en [`docs/superpowers/specs/2026-07-13-native-foundation-design.md`](docs/superpowers/specs/2026-07-13-native-foundation-design.md) y [`docs/superpowers/plans/2026-07-13-native-foundation-plan.md`](docs/superpowers/plans/2026-07-13-native-foundation-plan.md).

---

## 🚀 Instalación y Uso

### Requisitos

*   **.NET 8.0 SDK** o superior.
*   **Node.js** (para compilar `temp_lovable`; la compilación del frontend se dispara automáticamente al hacer `dotnet build`/`dotnet run`).
*   Microsoft Windows 10/11 (64-bit).
*   *Opcional:* Una instancia local de **Ollama** activa.

### Compilación y Ejecución

1. Instala las dependencias del frontend (solo la primera vez):
   ```cmd
   cd temp_lovable
   npm install
   cd ..
   ```
2. Ejecuta el shell nativo desde la raíz del repositorio (compila el frontend y lo empaqueta automáticamente):
   ```cmd
   dotnet run --project Stormbreaker.Shell
   ```
3. Para un `.exe` standalone (sin SDK de .NET ni Node instalados en la máquina destino):
   ```cmd
   dotnet publish Stormbreaker.Shell -c Release -r win-x64 --self-contained true -o publish
   ```
   El resultado en `publish/Stormbreaker.exe` corre de forma independiente.

---

## 🤖 Configuración de la IA Local (Ollama)

Para habilitar el streaming de triaje forense sin enviar datos a internet:

1. Cierra la aplicación de bandeja (GUI) de Ollama.
2. Levanta el servicio desde terminal habilitando cabeceras CORS:
   ```cmd
   set OLLAMA_ORIGINS=*
   ollama serve
   ```
3. Descarga el modelo de análisis recomendado (ej. `llama3.1:8b` o `qwen2.5:7b`):
   ```cmd
   ollama pull llama3.1:8b
   ```
4. En Stormbreaker, ve a **Ajustes** (esquina inferior izquierda), ingresa el endpoint local (`http://localhost:11434`), selecciona tu modelo y pulsa **Probar Conexión**.
5. Navega a **Analista de IA** y haz clic en **Analizar Evidencia** para ver el informe redactándose en vivo.

---

## 📬 Contacto y Conexión

*   **Autor:** Yoandy Ramirez Delgado
*   **Email:** [yoandyramirezdelgdo@gmail.com](mailto:yoandyramirezdelgdo@gmail.com)
*   **LinkedIn:** [Yoandy Ramirez](https://www.linkedin.com/in/yoandyrd92)

---

## 📄 Licencia

Stormbreaker está publicado bajo la licencia **MIT**. Diseñado para:
*   🔴 **Red Teams y Pentesters:** Correlacionar marcas de alteración forense y verificar qué rastros dejan los LOLBins.
*   🔵 **Blue Teams y Analistas DFIR:** Acelerar el triaje de logs de Windows, analizar MFTs offline y autogenerar sumarios con IA.
*   🟣 **Purple Teams:** Mapear cadenas de intrusión con técnicas de MITRE para construir reglas de detección precisas.

_Diseñado y desarrollado como parte de la suite Muninn DFIR._
