# ⚡ Stormbreaker — DFIR Advanced Analysis Console
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: WPF .NET](https://img.shields.io/badge/Platform-WPF%20%7C%20.NET%208.0--windows-blueviolet.svg)](Stormbreaker)
[![Att&ck: MITRE](https://img.shields.io/badge/ATT%26CK-MITRE%20Mapped-red.svg)](https://attack.mitre.org)

**Stormbreaker** is a professional-grade, high-performance desktop Incident Response (IR) and Digital Forensics (DFIR) triage console built on WPF and .NET 8.0. It acts as the native Windows client for the **Muninn DFIR Suite**, designed to parse, correlate, and visualize Windows event logs, Registry hives, USN Journals, and NTFS MFT records. 

Designed with a premium dark glassmorphism (Aero/Mica-inspired) aesthetic, Stormbreaker integrates local LLM assistance (via Ollama) to stream contextual analysis and build attack-chain correlation timelines, mapping indicators directly to the **MITRE ATT&CK®** framework.

---

## 🛡️ Core Capabilities

*   **⚡ Live Super-Timeline & Triage:** Correlate event logs (Security, Sysmon, PowerShell, Defender) alongside offline NTFS MFT records.
*   **🕵️ NTFS Timestomp Detector:** Automate identification of backdated timestamps by comparing `$STANDARD_INFORMATION` (`$SI`) against `$FILE_NAME` (`$FN`) attributes.
*   **🔀 Multipurpose Attack Graph:** Build PID/Process parent-child correlation chains to identify suspicious LOLBins and lateral movement patterns.
*   **🤖 Local AI Copilot:** Secure offline triage reports streaming token-by-token directly from local instances of **Ollama** (e.g., Llama 3.1, Mistral, Qwen 2.5) without leaking sensitive forensic data to cloud providers.
*   **📊 Threat Intelligence Mapping:** Direct translation of logs and command execution args into MITRE ATT&CK techniques.
*   **📥 Forensic Evidence Dropzone:** Simulated drag-and-drop ingestion of artifacts with a modular structure designed for raw parsers.
*   **📁 Export Engine:** Generate executive summaries in Markdown, structured IOC sheets in JSON, or formatted forensic reports in PDF.

---

## 🎨 Premium Design System

Stormbreaker implements a custom design system with native WPF styles:
*   **Glassmorphic Surfaces:** Curated colors in `oklch`/hex equivalents (`#BF0A0E1A` for deep panels, `#0AFFFFFF` for semi-transparent grids).
*   **Collapsible Sidebar Navigation:** Interactive left-aligned sidebar with spring-loaded width animations ($70\text{px} \leftrightarrow 220\text{px}$) powered by WPF Storyboards, using dynamic icons and conditional badges.
*   **Dynamic Responsive Grid Layouts:** Responsive viewports, text trimming, and proportional grids ensuring flawless layouts on High-DPI and ultra-wide screens.
*   **Modern Typography:** Styled using high-legibility sans-serif fonts for control panels and `JetBrains Mono`/`Consolas` for raw event details.

---

## 📂 Project Architecture

The desktop application is structured under the MVVM (Model-View-ViewModel) pattern:

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
      ├── Forensic Models
      └── Converters & Styles
```

### Key Components

1.  **MainWindow.xaml:** Root layout host containing the collapsible sidebar border, logo/header alignments, view-switching state converters, and overlay modals.
2.  **ViewModels/MainViewModel.cs:** Coordinates active view states, initiates local scanning simulators, handles Ollama communication endpoints, and processes UI toggle actions.
3.  **Views/:** Self-contained forensic user controls:
    *   `DashboardView`: Visualizes event counts, threat severity donuts, and timeline charts.
    *   `EventsView`: Live-filterable grid featuring full event details and MITRE badges.
    *   `MftView`: Interactive NTFS MFT record comparison table.
    *   `CorrelationView`: Detailed multi-stage attack timeline.
    *   `AiView`: LLM prompt config, query stream, and real-time report renderer.
4.  **Models/:** Standardized data models (`ForensicEvent`, `MftRecord`, `IocRecord`, etc.) enabling seamless binding and formatting.

---

## 🚀 Getting Started

### Prerequisites

*   **.NET 8.0 SDK** or higher.
*   Windows 10/11 (64-bit).
*   *Optional:* A local instance of **Ollama** running.

### Compilation and Launch

1. Clone or download the repository.
2. Open your terminal (PowerShell or CMD) in the project directory:
   ```cmd
   cd "E:\000Yoandy\Proyecto Stormbreaker DFIR\Stormbreaker"
   ```
3. Run the following command to build and launch the console:
   ```cmd
   dotnet run
   ```

---

## 🤖 Configuring Local AI (Ollama)

To run local LLM analysis without sending forensic data online, configure Ollama to accept requests from your desktop environment:

1. Stop any running Ollama GUI app in your system tray.
2. Launch Ollama from a command prompt with CORS origins enabled:
   ```cmd
   set OLLAMA_ORIGINS=*
   ollama serve
   ```
3. Pull your preferred analysis model (we recommend `llama3.1:8b` or `qwen2.5:7b`):
   ```cmd
   ollama pull llama3.1:8b
   ```
4. Open Stormbreaker, navigate to **Settings** (bottom left), enter your Ollama endpoint (`http://localhost:11434`), select your model, and click **Test Connection**.
5. Go to the **AI Analyst** view and click **Analyze Evidence** to watch the streaming analysis begin!

---

## 📄 License & Attribution

Stormbreaker is released under the **MIT License**. It is tailored for:
*   🔴 **Red Teams & Pentesters:** For correlating artifact trails left during simulated attacks and analyzing detection gaps.
*   🔵 **Blue Teams & DFIR Responders:** For rapid log triage, MFT artifact timelines, and automated local-AI summaries.
*   🟣 **Purple Teams:** To map attack chains side-by-side with MITRE mappings to build robust detection rules.

_Designed and developed as part of the Muninn DFIR Suite._

---

## 📬 Contact & Connect

*   **Author:** Yoandy Ramirez Delgado
*   **Email:** [yoandyramirezdelgdo@gmail.com](mailto:yoandyramirezdelgdo@gmail.com)
*   **LinkedIn:** [Yoandy Ramirez](https://www.linkedin.com/in/yoandyrd92)
