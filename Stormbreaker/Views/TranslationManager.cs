using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Stormbreaker.Views
{
    public class TranslationManager : INotifyPropertyChanged
    {
        private string _language = "es"; // Default to Spanish per user request

        public string Language
        {
            get => _language;
            set
            {
                if (_language != value)
                {
                    _language = value;
                    OnPropertyChanged("Language");
                    OnPropertyChanged("Item[]"); // Notifies indexer bindings in XAML
                }
            }
        }

        public string this[string key] => Translate(key);

        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private string Translate(string key)
        {
            bool isEs = _language == "es";
            switch (key)
            {
                // Sidebar & Title
                case "Title": return isEs ? "Stormbreaker — Consola Forense Avanzada" : "Stormbreaker — Advanced Forensic Console";
                case "Dashboard": return isEs ? "Panel Principal" : "Dashboard";
                case "Events": return isEs ? "Registro de Eventos" : "Event Logs";
                case "Mft": return isEs ? "Triaje de MFT" : "MFT Triage";
                case "Timeline": return isEs ? "Línea Temporal" : "Super Timeline";
                case "Correlation": return isEs ? "Mapa de Ataque" : "Attack Map";
                case "Ai": return isEs ? "Analista de IA" : "AI Analyst";
                case "Reports": return isEs ? "Informes e IOCs" : "Reports & IOCs";
                case "Settings": return isEs ? "Ajustes" : "Settings";
                case "ImportEvidence": return isEs ? "Importar Evidencia" : "Import Evidence";
                case "QuickScan": return isEs ? "Análisis Rápido" : "Quick Scan";
                case "GenerateReport": return isEs ? "Generar Informe IA" : "Generate AI Report";
                case "AnalystRole": return isEs ? "Analista DFIR" : "DFIR Analyst";
                case "AnalystTooltip": return isEs ? "Analista — Yoandy R." : "Analyst — Yoandy R.";

                // Modals
                case "ImportHeader": return isEs ? "Importar Evidencia Forense" : "Import Forensic Evidence";
                case "DragDropZone": return isEs ? "Arrastra artefactos forenses aquí" : "Drag forensic artifacts here";
                case "SupportedFormats": return isEs ? "soportado: .evtx, $MFT, colmenas del registro, logs de usn" : "supported: .evtx, $MFT, registry hives, usn logs";
                case "OrSelectFolder": return isEs ? "o selecciona una carpeta local" : "or select local folder";
                case "BrowseFiles": return isEs ? "Buscar archivos" : "Browse files";
                case "Close": return isEs ? "Cerrar" : "Close";
                case "Cancel": return isEs ? "Cancelar" : "Cancel";

                // Dashboard
                case "DashHeader": return isEs ? "Panel de Control de Incidentes" : "Incident Triage Dashboard";
                case "DashSub": return isEs ? "Resumen de KPIs, actividad en línea de tiempo y sumarios de IA de la investigación" : "Overview KPIs, live timeline activities and AI summaries of current investigation";
                case "KpiEvents": return isEs ? "TOTAL DE EVENTOS ANALIZADOS" : "TOTAL EVENTS ANALYZED";
                case "KpiAlerts": return isEs ? "ALERTAS CRÍTICAS" : "CRITICAL ALERTS";
                case "KpiMft": return isEs ? "REGISTROS MFT ESCANEADOS" : "MFT ENTRIES SCANNED";
                case "KpiIocs": return isEs ? "IPs DE INTERÉS" : "IPs OF INTEREST";
                case "DashExecSummary": return isEs ? "Resumen Ejecutivo Forense" : "Forensic Executive Summary";
                case "DashTimelineActivity": return isEs ? "Actividad en la Línea de Tiempo Forense" : "Forensic Timeline Activities";
                case "DashEventIngestion": return isEs ? "Ingesta de Registro de Eventos" : "Event Log Ingestion";
                case "DashMftRecords": return isEs ? "Registros NTFS MFT" : "NTFS MFT Records";
                case "DashSeverity": return isEs ? "Distribución de Severidad de Amenazas" : "Threat Severity Distribution";
                case "DashArtifactActivity": return isEs ? "Actividad de Artefactos (24h)" : "Artifact Activity (24h)";

                // Event Logs
                case "EventsHeader": return isEs ? "Auditoría de Registro de Eventos de Windows" : "Windows Event Log Audit";
                case "EventsSub": return isEs ? "Analiza registros EVTX consolidados para buscar comandos, payloads y anomalías" : "Audit consolidated EVTX records to hunt commands, payloads, and anomalies";
                case "SearchPlaceholder": return isEs ? "Buscar por ID, proceso, ruta, usuario o contenido..." : "Search events by ID, process, path, user or payload...";
                case "FilterSeverityLabel": return isEs ? "Filtrar severidad:" : "Filter severity:";
                case "SeverityAll": return isEs ? "Todos" : "All";
                case "SeverityCritical": return isEs ? "Crítico" : "Critical";
                case "SeverityWarning": return isEs ? "Advertencia" : "Warning";
                case "SeverityInfo": return isEs ? "Info" : "Info";
                case "SeverityNotable": return isEs ? "Notables" : "Notable";
                case "EventsCountSuffix": return isEs ? " eventos" : " events";
                case "ColTimestamp": return isEs ? "MARCA DE TIEMPO" : "TIMESTAMP";
                case "ColEventId": return isEs ? "ID DE EVENTO" : "EVENT ID";
                case "ColChannel": return isEs ? "CANAL" : "CHANNEL";
                case "ColLevel": return isEs ? "NIVEL" : "LEVEL";
                case "ColSource": return isEs ? "FUENTE" : "SOURCE";
                case "ColUser": return isEs ? "USUARIO" : "USER";
                case "ColMessage": return isEs ? "MENSAJE / DATOS FORENSES" : "FORENSIC DATA / MESSAGE";
                case "ColTime": return isEs ? "HORA" : "TIME";
                case "ColEid": return isEs ? "ID" : "EID";
                case "ColMsgMitre": return isEs ? "MENSAJE · ATT&CK" : "MESSAGE · ATT&CK";
                case "DetailTimestamp": return isEs ? "Marca de tiempo (UTC)" : "Timestamp (UTC)";
                case "DetailPid": return isEs ? "ID de proceso" : "Process ID";
                case "DetailMitre": return isEs ? "ID(s) de ATT&CK" : "ATT&CK ID(s)";
                case "DetailHeader": return isEs ? "Detalles del evento" : "Event Details";

                // MFT
                case "MftHeader": return isEs ? "Triaje de Registros NTFS $MFT" : "NTFS $MFT Record Triager";
                case "MftSub": return isEs ? "Analiza atributos estándar ($SI vs $FN) para identificar alteración de marcas de tiempo (timestomping)" : "Analyze standard info attributes vs file name attributes to identify backdating (timestomp)";
                case "MftCountSuffix": return isEs ? " registros" : " records";
                case "MftIndexed": return isEs ? "de 1.24M indexados" : "of 1.24M indexed";
                case "MftKpiTimestomp": return isEs ? "Marcas Timestomp" : "Timestomp Flags";
                case "MftSiBackdated": return isEs ? "retroactivo $SI" : "$SI backdated";
                case "MftZeroedFiles": return isEs ? "Archivos vaciados" : "Zeroed Files";
                case "MftDataDestruction": return isEs ? "destrucción de datos" : "data destruction";
                case "MftStompOnly": return isEs ? "Mostrar solo timestomped" : "Show timestomped only";
                case "ColRec": return isEs ? "REGISTRO #" : "REC #";
                case "ColFilePath": return isEs ? "RUTA DEL ARCHIVO" : "FILE PATH";
                case "ColSize": return isEs ? "TAMAÑO" : "SIZE";
                case "ColSiCreated": return isEs ? "$STANDARD_INFO CREADO" : "$STANDARD_INFO CREATED";
                case "ColFnCreated": return isEs ? "$FILE_NAME CREADO" : "$FILE_NAME CREATED";
                case "ColAssessment": return isEs ? "DIAGNÓSTICO FORENSE" : "DIAGNOSTIC ASSESSMENT";
                case "MftPanelTitle": return isEs ? "Detalles del Registro MFT" : "MFT Entry Analysis Details";
                case "MftPanelPlaceholder": return isEs ? "Selecciona un registro MFT para auditar marcas de tiempo." : "Select an MFT entry to audit dates & timestamps.";

                // Super Timeline
                case "TimelineHeader": return isEs ? "Correlación de Super-Línea de Tiempo" : "Super Timeline Correlation";
                case "TimelineSub": return isEs ? "Vista cronológica unificada de eventos del sistema, creación de archivos y registros" : "Chronological unified view of system events, file creations, and registry updates";
                case "TimelineAllSources": return isEs ? "Todas las fuentes" : "All sources";

                // Correlation Attack Map
                case "CorrelationHeader": return isEs ? "Gráfico de Correlación de Kill Chain" : "Kill Chain Correlation Graph";
                case "CorrelationSub": return isEs ? "Reconstrucción cronológica de la cadena de ataque vinculando patrones de artefactos cruzados" : "Chronological reconstruction of the attack chain by linking cross-artifact patterns";
                case "MitreTechniquesSuffix": return isEs ? " técnicas ATT&CK" : " ATT&CK techniques";
                case "CorrelationIntro1": return isEs ? "Stormbreaker vinculó " : "Stormbreaker linked ";
                case "CorrelationIntro2": return isEs ? " eventos en " : " events across ";
                case "CorrelationIntro3": return isEs ? "4 fuentes de artefactos" : "4 artifact sources";
                case "CorrelationIntro4": return isEs ? " (Logs de eventos · MFT · Registro · USN) usando el proceso de pivote " : " (Event Logs · MFT · Registry · USN) using the pivot process ";
                case "CorrelationIntro5": return isEs ? ", la ruta compartida " : ", the shared path ";
                case "CorrelationIntro6": return isEs ? " y ventanas de correlación de 90 segundos. El resultado es la siguiente cadena de ataque reconstruida." : " and 90-second correlation windows. The result is the reconstructed kill-chain below.";
                case "CorrelationChainHeader": return isEs ? "Cadena de Ataque Reconstruida" : "Reconstructed Attack Chain";
                case "CorrelationPhasesIdentified": return isEs ? "7 FASES IDENTIFICADAS" : "7 PHASES IDENTIFIED";

                // AI Analyst
                case "AiHeader": return isEs ? "Copiloto de Seguridad de IA (Ollama)" : "AI Security Copilot (Ollama)";
                case "AiSub": return isEs ? "Streaming de análisis forense en tiempo real y asistencia local sin fugas de datos" : "Real-time forensic analysis streaming and local assistance with zero data leakage";
                case "AiPromptLabel": return isEs ? "Haz una pregunta personalizada sobre este caso:" : "Ask a custom question to the LLM analyzer about this case:";
                case "AiBtnAnalyze": return isEs ? "Analizar Evidencia" : "Analyze Evidence";
                case "AiBtnAsk": return isEs ? "Preguntar a IA" : "Ask AI";
                case "AiBtnCancel": return isEs ? "Cancelar" : "Cancel";
                case "AiReportTitle": return isEs ? "Informe de Triaje del Analista de IA" : "AI Analyst Triage Report";
                case "AiStatusDemo": return isEs ? "Modo Demo Fuera de Línea" : "Offline Demo Mode";
                case "AiStatusOnline": return isEs ? "Ollama Conectado" : "Ollama Connected";
                case "AiAnalystName": return isEs ? "Analista Stormbreaker" : "Stormbreaker Analyst";
                case "AiSubtitleInfo": return isEs ? "Inferencia local Ollama · prompt estructurado DFIR · MITRE ATT&CK" : "Ollama local inference · structured DFIR prompt · MITRE ATT&CK-aware";
                case "AiLoaderBuilding": return isEs ? "Generando prompt estructurado DFIR..." : "Building structured DFIR prompt...";
                case "AiLoaderStreaming": return isEs ? "Transmitiendo inferencia local desde el daemon de Ollama" : "Streaming local inference from Ollama daemon";
                case "AiWatermarkHeader": return isEs ? "Analista de IA local listo" : "Local AI Analyst Ready";
                case "AiWatermarkDesc": return isEs ? "Presione Analizar evidencia y el modelo local razonará sobre la línea de tiempo correlacionada, las alertas de timestomp de MFT y las claves de persistencia del Registro para generar un informe DFIR senior." : "Press Analyze evidence and the local model will reason over the correlated timeline, MFT timestomp flags and Registry persistence keys to produce a senior DFIR report.";
                case "AiWatermarkWarning": return isEs ? "Asegúrese de que Ollama se esté ejecutando localmente. Si el daemon no está accesible, la consola volverá automáticamente a una demostración fuera de línea." : "Ensure Ollama is running locally. If the daemon is unreachable, the console automatically falls back to an offline demo analysis.";
                case "AiBtnDeepDive": return isEs ? "Análisis profundo — PowerShell" : "Deep dive — PowerShell";
                case "AiBtnCorrelate": return isEs ? "Correlacionar IOCs" : "Correlate IOCs";
                case "AiBtnExport": return isEs ? "Exportar informe" : "Export report";
                case "AiAskPlaceholder": return isEs ? "Hacer pregunta de seguimiento — ej. ¿por qué es sospechoso este PowerShell?" : "Ask a follow-up — e.g. why is this PowerShell suspicious?";

                // Reports
                case "ReportsHeader": return isEs ? "Informe de Auditoría y Resumen Forense" : "Audit Report & Forensics Summary";
                case "ReportsSub": return isEs ? "Informe ejecutivo listo para analistas, cobertura de técnicas de MITRE y exportación" : "Executive analyst report ready, MITRE techniques coverage, and export actions";
                case "ExportCaseSummary": return isEs ? "Exportar Resumen del Caso" : "Export Case Summary";
                case "IocHeader": return isEs ? "Indicadores de Compromiso (IOCs)" : "Indicators of Compromise (IOCs)";
                case "MitreObservedHeader": return isEs ? "Técnicas de MITRE ATT&CK Observadas" : "MITRE ATT&CK Techniques Observed";
                case "PlaybookHeader": return isEs ? "Guía de Remediación Recomendada" : "Recommended Remediation Playbook";
                case "BtnCopyAll": return isEs ? "Copiar Todos" : "Copy All";
                case "BtnCopy": return isEs ? "Copiar" : "Copy";

                // Settings
                case "SettingsHeader": return isEs ? "Ajustes y Servidores" : "Settings & Backends";
                case "SettingsSub": return isEs ? "Configura parámetros de IA local, endpoints y motores de extracción forense" : "Configure local AI parameters, endpoints, and forensic extraction engines";
                case "OllamaHeader": return isEs ? "Integración con Ollama" : "Ollama Integration";
                case "OllamaEndpoint": return isEs ? "Endpoint de la API de Ollama" : "Ollama API Endpoint";
                case "ModelName": return isEs ? "Nombre del Modelo" : "Model Name";
                case "BtnTestConn": return isEs ? "Probar Conexión" : "Test Connection";
                case "BtnSaveConfig": return isEs ? "Guardar Ajustes" : "Save configuration";
                case "BackendHeader": return isEs ? "Estado del Servidor DFIR" : "DFIR Backend Status";
                case "LangHeader": return isEs ? "Idioma y Localización" : "Language & Localization";
                case "LangSelectLabel": return isEs ? "Selecciona el idioma de interfaz:" : "Select interface language:";
                case "SettingsModeLabel": return isEs ? "Modo de ejecución:" : "Execution mode:";
                case "SettingsDemoMode": return isEs ? "Habilitar Caso Demo con Datos Simulados" : "Enable Demo Case with Simulated Data";
                case "AboutHeader": return isEs ? "Acerca de la Consola Stormbreaker" : "About Stormbreaker Console";
                case "AboutVersion": return isEs ? "Versión: v1.2.0-beta (Edición Core)" : "Version: v1.2.0-beta (Core Edition)";
                case "AboutLicense": return isEs ? "Licencia: Propietaria · Uso Autorizado del Núcleo de Respuesta a Incidentes" : "License: Proprietary · Incident Response Core Authorized Use";
                case "AboutDataDir": return isEs ? "Directorio Local de Datos" : "Local Data Directory";

                // Reports View Custom Elements
                case "ReportExecutiveCaseHeader": return isEs ? "Informe Ejecutivo · Caso MUN-2026-0417" : "Executive Report · Case MUN-2026-0417";
                case "ReportReadyHandoff": return isEs ? "LISTO PARA ENTREGA" : "READY FOR HANDOFF";
                case "ReportSummary": return isEs ? "Resumen" : "Summary";
                case "ReportImpact": return isEs ? "Impacto" : "Impact";
                case "ReportImpactText": return isEs ? "Compromiso crítico del equipo host. Exposición de credenciales de administrador local. Destrucción de 847 documentos de usuario (puestos a cero). Eliminación de copias de seguridad locales. Se requiere contención a nivel de host para evitar el movimiento lateral a través del segmento de dominio FIN." : "Critical compromise of workstation host. Exposure of local admin credentials. Destruction of 847 user documents (zeroed). Deletion of local backups. Host-level containment required to prevent lateral movement across the FIN domain segment.";
                case "ReportAction1": return isEs ? "Aislar FIN-WKS-07 de la red inmediatamente (contener movimiento lateral)." : "Isolate FIN-WKS-07 from the network immediately (contain lateral movement).";
                case "ReportAction2": return isEs ? "Capturar una imagen completa de memoria antes de apagar para preservar artefactos volátiles." : "Capture a full memory image before shutdown to preserve volatile artifacts.";
                case "ReportAction3": return isEs ? "Preservar $MFT, $LogFile y el USN Journal para una reconstrucción extendida de la línea de tiempo." : "Preserve $MFT, $LogFile and the USN Journal for extended timeline reconstruction.";
                case "ReportAction4": return isEs ? "Bloquear 185.220.101.47 y cdn-telemetry-sync[.]net en el perímetro; buscar el SHA256 en toda la red." : "Block 185.220.101.47 and cdn-telemetry-sync[.]net at the perimeter; hunt the SHA256 fleet-wide.";
                case "ReportAction5": return isEs ? "Restablecer credenciales de FIN\\a.morgan y auditar el acceso al recurso compartido ADMIN$ en FIN-WKS-11." : "Reset credentials for FIN\\a.morgan and audit access to the ADMIN$ share on FIN-WKS-11.";
                case "BackendEndpoint": return isEs ? "Endpoint de Servidor DFIR" : "DFIR Backend Endpoint";
                case "ColValue": return isEs ? "VALOR" : "VALUE";
                case "ColMetric": return isEs ? "MÉTRICA" : "METRIC";
                case "ParamHost": return isEs ? "Nombre de Host" : "Hostname";
                case "ParamOS": return isEs ? "Plataforma / SO" : "Platform / OS";
                case "ParamAgent": return isEs ? "Estado de Agente" : "Agent Status";
                case "ParamCase": return isEs ? "Referencia de Caso Activo" : "Active Case Reference";
                case "ParamActive": return isEs ? "ACTIVO" : "ACTIVE";
                case "LanguageName": return isEs ? "Idioma" : "Language";

                // Dashboard Extra Keys
                case "KpiTime": return isEs ? "TIEMPO DE RESPUESTA" : "TIME TO INSIGHT";
                case "LiveAlertChannel": return isEs ? "CANAL DE ALERTAS EN VIVO" : "LIVE ALERT CHANNEL";
                case "ViewFullChronology": return isEs ? "Ver cronología completa" : "View full chronology";
                case "SeverityWarningLol": return isEs ? "Advertencias / LOLBins" : "Warnings / LOLBins";
                case "SeverityInfoLogs": return isEs ? "Logs informativos" : "Informational logs";
                case "SeverityLogons": return isEs ? "Inicios de sesión notables" : "Notable Network logons";
                case "OpenFullAnalysis": return isEs ? "Abrir análisis completo en Analista de IA" : "Open full analysis in AI Analyst";
                case "ExecSummaryText": return isEs ? "Intrusión de alta confianza en FIN-WKS-07 comenzando a las 14:02 UTC. Cadena living-off-the-land: entrega de USB → PowerShell ofuscado → C2 a 185.220.101.47 → clave Run + persistencia de servicio → timestomp y borrado de logs → destrucción de 847 archivos. Copias de sombra eliminadas. Inicio de sesión lateral a equipo par observado. Se recomienda aislamiento inmediato y captura de memoria antes de apagar." : "High-confidence intrusion on FIN-WKS-07 beginning 14:02 UTC. Living-off-the-land chain: USB delivery → obfuscated PowerShell → C2 to 185.220.101.47 → Run-key + service persistence → timestomp & log clearing → destruction of 847 files. Shadow copies deleted. Lateral logon to a peer host observed. Recommend immediate isolation and memory capture before shutdown.";

                default: return key;
            }
        }
    }
}
