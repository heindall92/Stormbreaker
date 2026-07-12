# ⚡ Stormbreaker — Consola de Análisis Forense Avanzado DFIR
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Platform: WPF .NET](https://img.shields.io/badge/Plataforma-WPF%20%7C%20.NET%208.0--windows-blueviolet.svg)](Stormbreaker)
[![Att&ck: MITRE](https://img.shields.io/badge/ATT%26CK-MITRE%20Mapped-red.svg)](https://attack.mitre.org)

**Stormbreaker** es una consola de triaje y respuesta ante incidentes (IR / DFIR) de alto rendimiento para escritorio, desarrollada en WPF y .NET 8.0. Actúa como cliente nativo de Windows para la suite **Muninn DFIR Suite**, permitiendo parsear, correlacionar y visualizar registros de eventos de Windows, colmenas del Registro, USN Journal y registros NTFS MFT.

Diseñada bajo una estética oscura premium de glassmorfismo (inspirada en Aero y Mica de Windows 11), Stormbreaker integra asistencia de IA local (a través de Ollama) para transmitir análisis en tiempo real y construir líneas de tiempo de la cadena de ataque mapeadas directamente al marco de referencia **MITRE ATT&CK®**.

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

El desarrollo sigue el patrón de arquitectura MVVM (Model-View-ViewModel):

```
App.xaml / MainWindow.xaml
 └── MainViewModel.cs
      ├── Views
      │    ├── DashboardView.xaml
      │    ├── EventsView.xaml
      │    ├── MftView.xaml
      │    ├── TimelineView.xaml
      │    ├── CorrelationView.xaml
      │    └── AiView.xaml
      ├── Modelos Forenses
      └── Conversores y Estilos
```

### Componentes Clave

1.  **MainWindow.xaml:** Layout raíz que contiene el panel de navegación colapsable animado, la alineación dinámica del encabezado, conversores de vista y modales interactivos.
2.  **ViewModels/MainViewModel.cs:** Coordina la vista activa, gestiona el hilo de streaming de Ollama, orquesta los simuladores de escaneo rápido y expone los comandos de interfaz.
3.  **Views/:** Módulos forenses autocontenidos:
    *   `DashboardView`: Panel gráfico con KPIs, donuts de severidad y actividad de artefactos.
    *   `EventsView`: Rejilla filtrable y expandible con metadatos de eventos y técnicas MITRE.
    *   `MftView`: Tabla de auditoría NTFS MFT con alertas automáticas de timestomping.
    *   `CorrelationView`: Reconstrucción de la cadena de ataque en fases lógicas.
    *   `AiView`: Panel interactivo de Ollama con streaming de tokens en tiempo real.
4.  **Models/:** Estructuras de datos normalizadas (`ForensicEvent`, `MftRecord`, `IocRecord`, etc.) para data-binding.

---

## 🚀 Instalación y Uso

### Requisitos

*   **.NET 8.0 SDK** o superior.
*   Microsoft Windows 10/11 (64-bit).
*   *Opcional:* Una instancia local de **Ollama** activa.

### Compilación y Ejecución

1. Abre tu terminal de Windows (CMD o PowerShell) en la raíz del proyecto:
   ```cmd
   cd "E:\000Yoandy\Proyecto Stormbreaker DFIR\Stormbreaker"
   ```
2. Ejecuta el compilador y lanza el binario:
   ```cmd
   dotnet run
   ```

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
