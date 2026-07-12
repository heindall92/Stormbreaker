using System.Collections.Generic;
using Stormbreaker.Models;

namespace Stormbreaker.Services
{
    public class SampleDataService
    {
        public CaseInfo Case { get; private set; } = default!;
        public List<EventLogItem> Events { get; private set; } = default!;
        public List<MftRecord> Mft { get; private set; } = default!;
        public List<RegistryItem> Registry { get; private set; } = default!;
        public List<IocItem> Iocs { get; private set; } = default!;
        public List<ChainNode> Chain { get; private set; } = default!;
        public Dictionary<string, string> AttackCatalog { get; private set; } = default!;
        public List<double> EvtxActivity { get; private set; } = default!;
        public List<double> MftActivity { get; private set; } = default!;
        public List<string> ActivityLabels { get; private set; } = default!;

        public SampleDataService()
        {
            SetLanguage("es"); // Default to Spanish per user request
        }

        public void SetLanguage(string lang)
        {
            bool isEs = lang == "es";

            Case = new CaseInfo
            {
                Id = "MUN-2026-0417",
                Host = "FIN-WKS-07",
                Analyst = "Yoandy R.",
                Os = "Windows 11 Pro 23H2 (22631)",
                Acquired = isEs ? "2026-04-17 15:41:02 UTC" : "2026-04-17 15:41:02 UTC",
                Tool = isEs ? "Muninn Acquire 1.4 · imagen de triaje (KAPE targets)" : "Muninn Acquire 1.4 · triage image (KAPE targets)"
            };

            Events = new List<EventLogItem>
            {
                new EventLogItem
                {
                    T = "14:02:57", Ts = "2026-04-17 14:02:57", Id = 5156, Ch = "Security", Lvl = "info", Src = "Windows Filtering Platform", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Conexión saliente permitida — svchost.exe → 185.220.101.47:443" : "Outbound connection allowed — svchost.exe → 185.220.101.47:443", 
                    Mitre = new List<string> { "T1071.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Dirección" : "Direction", isEs ? "Saliente" : "Outbound" }, 
                        { "Protocol", "TCP/443" }, 
                        { "Remote", "185.220.101.47" }, 
                        { "DNS", isEs ? "sin registro PTR / sin resolución" : "no PTR / no resolution" }, 
                        { isEs ? "Proceso" : "Process", "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe" }
                    }
                },
                new EventLogItem
                {
                    T = "14:04:11", Ts = "2026-04-17 14:04:11", Id = 4104, Ch = "PowerShell/Operational", Lvl = "critical", Src = "PowerShell", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Registro de ScriptBlock — Comando codificado en base64, 3 capas de ofuscación" : "ScriptBlock logging — base64 EncodedCommand, 3 layers of obfuscation", 
                    Mitre = new List<string> { "T1059.001", "T1027" },
                    Detail = new Dictionary<string, string>
                    {
                        { "ScriptBlockId", "a91f-…-77c2" }, 
                        { isEs ? "Longitud" : "Length", "8,142 bytes" }, 
                        { isEs ? "Decodificado" : "Decoded", "IEX (New-Object Net.WebClient).DownloadString(...)" }, 
                        { isEs ? "Firmado" : "Signed", isEs ? "falso" : "false" }
                    }
                },
                new EventLogItem
                {
                    T = "14:05:44", Ts = "2026-04-17 14:05:44", Id = 1, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4990, User = "FIN\\a.morgan",
                    Msg = isEs ? "Creación de proceso — cmd.exe iniciado por powershell.exe (padre inusual)" : "Process create — cmd.exe spawned by powershell.exe (unusual parent)", 
                    Mitre = new List<string> { "T1059.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Padre" : "Parent", "powershell.exe (4821)" }, 
                        { isEs ? "Hijo" : "Child", "cmd.exe (4990)" }, 
                        { isEs ? "LíneaComando" : "CommandLine", "cmd /c copy payload.dat svchost.exe" }, 
                        { isEs ? "NivelIntegridad" : "IntegrityLevel", isEs ? "Medio" : "Medium" }
                    }
                },
                new EventLogItem
                {
                    T = "14:08:33", Ts = "2026-04-17 14:08:33", Id = 1102, Ch = "Security", Lvl = "critical", Src = "Eventlog", Pid = 4990, User = "FIN\\a.morgan",
                    Msg = isEs ? "Registro de auditoría borrado — actividad evasiva forense" : "Audit log cleared — anti-forensic activity", 
                    Mitre = new List<string> { "T1070.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Canal" : "Channel", isEs ? "Seguridad" : "Security" }, 
                        { isEs ? "BorradoPor" : "ClearedBy", "FIN\\a.morgan" }, 
                        { "Note", isEs ? "Ocurre inmediatamente antes del borrado masivo de archivos" : "Occurs immediately before mass file deletion" }
                    }
                },
                new EventLogItem
                {
                    T = "14:10:11", Ts = "2026-04-17 14:10:11", Id = 13, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Valor de registro establecido — persistencia en Run key escrita" : "Registry value set — Run key persistence written", 
                    Mitre = new List<string> { "T1547.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Clave" : "Key", "HKCU\\...\\CurrentVersion\\Run" }, 
                        { isEs ? "Valor" : "Value", "WindowsSvc" }, 
                        { isEs ? "Datos" : "Data", "%APPDATA%\\svchost.exe" }
                    }
                },
                new EventLogItem
                {
                    T = "14:15:42", Ts = "2026-04-17 14:15:42", Id = 6416, Ch = "Security", Lvl = "info", Src = "Plug and Play", Pid = 4, User = "SYSTEM",
                    Msg = isEs ? "Nuevo dispositivo externo — USBSTOR SanDisk Cruzer (VID_0781&PID_5567)" : "New external device — USBSTOR SanDisk Cruzer (VID_0781&PID_5567)", 
                    Mitre = new List<string> { "T1200" },
                    Detail = new Dictionary<string, string>
                    {
                        { "DeviceId", "USB\\VID_0781&PID_5567" }, 
                        { "FriendlyName", "SanDisk Cruzer Blade" }, 
                        { "Serial", "4C530001…" }, 
                        { isEs ? "PrimeraVezVisto" : "FirstSeen", isEs ? "primera vez en este equipo" : "this host, first time" }
                    }
                },
                new EventLogItem
                {
                    T = "14:22:09", Ts = "2026-04-17 14:22:09", Id = 11, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Archivo creado — svchost.exe depositado en %APPDATA%\\Roaming" : "File create — svchost.exe dropped in %APPDATA%\\Roaming", 
                    Mitre = new List<string> { "T1105" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Destino" : "Target", "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe" }, 
                        { "Hash(SHA256)", "e3b0c442…1b7852b855" }, 
                        { isEs ? "Firmado" : "Signed", isEs ? "falso" : "false" }
                    }
                },
                new EventLogItem
                {
                    T = "14:26:50", Ts = "2026-04-17 14:26:50", Id = 2, Ch = "Sysmon/Operational", Lvl = "critical", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Hora de creación de archivo modificada — timestomp en svchost.exe" : "File creation time changed — timestomp on svchost.exe", 
                    Mitre = new List<string> { "T1070.006" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Destino" : "Target", "%APPDATA%\\svchost.exe" }, 
                        { isEs ? "CreacionPrevia" : "PreviousCreation", "2026-04-17 14:22:09" }, 
                        { isEs ? "EstablecidoEn" : "SetTo", "2021-01-08 09:14:00" }, 
                        { isEs ? "Tecnica" : "Technique", isEs ? "$STANDARD_INFO alterado a fecha pasada" : "$STANDARD_INFO backdated" }
                    }
                },
                new EventLogItem
                {
                    T = "14:28:05", Ts = "2026-04-17 14:28:05", Id = 1, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 5310, User = "FIN\\a.morgan",
                    Msg = isEs ? "Creación de proceso — vssadmin delete shadows /all /quiet" : "Process create — vssadmin delete shadows /all /quiet", 
                    Mitre = new List<string> { "T1490" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "LíneaComando" : "CommandLine", "vssadmin delete shadows /all /quiet" }, 
                        { isEs ? "Padre" : "Parent", "svchost.exe (4821)" }, 
                        { isEs ? "Efecto" : "Effect", isEs ? "Copias de sombra de volumen (VSS) destruidas" : "Volume Shadow Copies destroyed" }
                    }
                },
                new EventLogItem
                {
                    T = "14:32:18", Ts = "2026-04-17 14:32:18", Id = 1116, Ch = "Windows Defender", Lvl = "info", Src = "Defender", Pid = 0, User = "SYSTEM",
                    Msg = isEs ? "Amenaza detectada pero la acción falló — remanentes de Trojan:Win32/Wacatac" : "Threat detected but action failed — Trojan:Win32/Wacatac remnants", 
                    Mitre = new List<string> { "T1562.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Amenaza" : "Threat", "Trojan:Win32/Wacatac.B!ml" }, 
                        { isEs ? "Acción" : "Action", isEs ? "Cuarentena fallida (acceso denegado)" : "Quarantine failed (access denied)" }, 
                        { "RTP", isEs ? "sospecha de manipulación (tamper)" : "tamper suspected" }
                    }
                },
                new EventLogItem
                {
                    T = "14:33:40", Ts = "2026-04-17 14:33:40", Id = 104, Ch = "System", Lvl = "warning", Src = "USN/FS", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = isEs ? "Registro de USN — 847 archivos borrados en 12s bajo \\Users\\a.morgan\\Documents" : "USN Journal — 847 files deleted in 12s under \\Users\\a.morgan\\Documents", 
                    Mitre = new List<string> { "T1485" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Ruta" : "Path", "C:\\Users\\a.morgan\\Documents" }, 
                        { isEs ? "Cantidad" : "Count", isEs ? "847 archivos" : "847 files" }, 
                        { isEs ? "Ventana" : "Window", isEs ? "12 segundos" : "12 seconds" }, 
                        { isEs ? "Razón" : "Reason", "DATA_OVERWRITE|FILE_DELETE" }
                    }
                },
                new EventLogItem
                {
                    T = "14:41:55", Ts = "2026-04-17 14:41:55", Id = 4624, Ch = "Security", Lvl = "success", Src = "Security", Pid = 0, User = "FIN\\a.morgan",
                    Msg = isEs ? "Inicio de sesión Tipo 3 (red) desde estación FIN-WKS-11 — intento lateral" : "Logon Type 3 (network) from workstation FIN-WKS-11 — lateral attempt", 
                    Mitre = new List<string> { "T1021.002" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "TipoInicioSesión" : "LogonType", isEs ? "3 (Red)" : "3 (Network)" }, 
                        { isEs ? "Origen" : "Source", "FIN-WKS-11" }, 
                        { isEs ? "Recurso" : "Share", "ADMIN$" }, 
                        { isEs ? "Resultado" : "Result", isEs ? "exitoso" : "success" }
                    }
                },
                new EventLogItem
                {
                    T = "14:47:12", Ts = "2026-04-17 14:47:12", Id = 7045, Ch = "System", Lvl = "warning", Src = "Service Control Manager", Pid = 0, User = "SYSTEM",
                    Msg = isEs ? "Nuevo servicio instalado — \"WinDefendSvc\" apuntando a %APPDATA%\\svchost.exe" : "New service installed — \"WinDefendSvc\" pointing to %APPDATA%\\svchost.exe", 
                    Mitre = new List<string> { "T1543.003" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "NombreServicio" : "ServiceName", "WinDefendSvc" }, 
                        { isEs ? "RutaImagen" : "ImagePath", "%APPDATA%\\svchost.exe" }, 
                        { isEs ? "TipoInicio" : "StartType", "auto" }, 
                        { "Note", isEs ? "se enmascara como Defender" : "masquerades as Defender" }
                    }
                },
                new EventLogItem
                {
                    T = "14:52:03", Ts = "2026-04-17 14:52:03", Id = 4688, Ch = "Security", Lvl = "info", Src = "Security", Pid = 5620, User = "FIN\\a.morgan",
                    Msg = isEs ? "Nuevo proceso — rundll32.exe sin argumentos (ejecución proxy)" : "New process — rundll32.exe with no arguments (proxy exec)", 
                    Mitre = new List<string> { "T1218.011" },
                    Detail = new Dictionary<string, string>
                    {
                        { isEs ? "Proceso" : "Process", "rundll32.exe" }, 
                        { isEs ? "LíneaComando" : "CommandLine", isEs ? "rundll32.exe (sin args)" : "rundll32.exe (no args)" }, 
                        { isEs ? "Padre" : "Parent", "svchost.exe (4821)" }
                    }
                }
            };

            Mft = new List<MftRecord>
            {
                new MftRecord { Rec = 214877, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe", Size = "184 KB", Si = "2021-01-08 09:14:00", Fn = "2026-04-17 14:22:09", Flag = true, Note = isEs ? "$SI es mucho más antiguo que $FN → timestomp" : "$SI far older than $FN → timestomp" },
                new MftRecord { Rec = 214512, Path = "C:\\Users\\a.morgan\\AppData\\Local\\Temp\\payload.dat", Size = "201 KB", Si = "2026-04-17 14:04:59", Fn = "2026-04-17 14:04:59", Flag = false, Note = isEs ? "archivo temporal, eliminado tras copia" : "staging file, deleted after copy" },
                new MftRecord { Rec = 198233, Path = "C:\\Windows\\Temp\\p.ps1", Size = "8.0 KB", Si = "2019-03-12 00:00:00", Fn = "2026-04-17 14:04:12", Flag = true, Note = isEs ? "$SI alterado a 7 años atrás → timestomp" : "$SI backdated 7y → timestomp" },
                new MftRecord { Rec = 301944, Path = "D:\\tools\\mimi.exe", Size = "1.3 MB", Si = "2026-04-17 14:18:33", Fn = "2026-04-17 14:18:33", Flag = false, Note = isEs ? "entregado desde volumen USBSTOR" : "delivered from USBSTOR volume" },
                new MftRecord { Rec = 214901, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\wsc.tmp", Size = "42 KB", Si = "2011-06-02 12:00:00", Fn = "2026-04-17 14:26:44", Flag = true, Note = isEs ? "$SI = fecha de instalación de imagen OEM → alterado" : "$SI = install date of OEM image → stomped" },
                new MftRecord { Rec = 155120, Path = "C:\\Users\\a.morgan\\Documents\\Q1_forecast.xlsx", Size = "0 KB", Si = "2026-02-11 08:31:00", Fn = "2026-02-11 08:31:00", Flag = false, Note = isEs ? "0-byte tras sobreescritura de USN (destrucción de datos)" : "0-byte after USN overwrite (data destruction)" },
                new MftRecord { Rec = 155121, Path = "C:\\Users\\a.morgan\\Documents\\payroll_2026.xlsx", Size = "0 KB", Si = "2026-01-30 10:02:00", Fn = "2026-01-30 10:02:00", Flag = false, Note = isEs ? "0-byte tras sobreescritura de USN" : "0-byte after USN overwrite" },
                new MftRecord { Rec = 277650, Path = "C:\\Windows\\System32\\Tasks\\WinDefendSvc", Size = "3 KB", Si = "2026-04-17 14:47:01", Fn = "2026-04-17 14:47:01", Flag = false, Note = isEs ? "tarea programada que respalda servicio malicioso" : "scheduled task backing malicious service" },
                new MftRecord { Rec = 214880, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe:Zone.Identifier", Size = "26 B", Si = "2026-04-17 14:22:09", Fn = "2026-04-17 14:22:09", Flag = false, Note = isEs ? "ADS — MOTW: descargado de zona de Internet 3" : "ADS — MOTW: downloaded from Internet zone 3" },
                new MftRecord { Rec = 198240, Path = "C:\\Windows\\Temp\\out.log", Size = "12 KB", Si = "2026-04-17 14:33:52", Fn = "2026-04-17 14:33:52", Flag = false, Note = isEs ? "manifiesto de exfiltración de rutas eliminadas" : "exfil manifest of deleted paths" }
            };

            Registry = new List<RegistryItem>
            {
                new RegistryItem { Hive = "NTUSER.DAT", Key = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", Value = "WindowsSvc", Data = "%APPDATA%\\svchost.exe", T = "2026-04-17 14:10:11", Mitre = "T1547.001" },
                new RegistryItem { Hive = "SYSTEM", Key = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\WinDefendSvc", Value = "ImagePath", Data = "%APPDATA%\\svchost.exe", T = "2026-04-17 14:47:12", Mitre = "T1543.003" },
                new RegistryItem { Hive = "SOFTWARE", Key = "HKLM\\...\\Windows Defender\\DisableAntiSpyware", Value = "DisableAntiSpyware", Data = "0x00000001", T = "2026-04-17 14:31:59", Mitre = "T1562.001" },
                new RegistryItem { Hive = "SYSTEM", Key = "HKLM\\SYSTEM\\...\\USBSTOR\\Disk&Ven_SanDisk", Value = "FriendlyName", Data = "SanDisk Cruzer Blade", T = "2026-04-17 14:15:42", Mitre = "T1200" }
            };

            Iocs = new List<IocItem>
            {
                new IocItem { Type = "IPv4", Val = "185.220.101.47", Conf = "high", Ctx = isEs ? "C2 — TCP/443 saliente, sin DNS" : "C2 — outbound TCP/443, no DNS" },
                new IocItem { Type = "SHA256", Val = "9f2b4c7e5a1d8f3096a2b1c4d7e0f5a8b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8", Conf = "high", Ctx = "%APPDATA%\\svchost.exe" },
                new IocItem { Type = "Filename", Val = "svchost.exe (%APPDATA%\\Roaming)", Conf = "high", Ctx = isEs ? "dropper enmascarado" : "masqueraded dropper" },
                new IocItem { Type = "Registry", Val = "HKCU\\...\\Run\\WindowsSvc", Conf = "high", Ctx = isEs ? "persistencia" : "persistence" },
                new IocItem { Type = "Service", Val = "WinDefendSvc", Conf = "high", Ctx = isEs ? "servicio enmascarado" : "masquerading service" },
                new IocItem { Type = "USB Serial", Val = "4C530001220612…", Conf = "medium", Ctx = isEs ? "SanDisk Cruzer — acceso inicial" : "SanDisk Cruzer — initial access" },
                new IocItem { Type = "Domain", Val = "cdn-telemetry-sync[.]net", Conf = "medium", Ctx = isEs ? "URL de staging en script PS1 decodificado" : "staging URL in decoded PS1" }
            };

            Chain = new List<ChainNode>
            {
                new ChainNode { Phase = isEs ? "Acceso Inicial" : "Initial Access", Color = "Red", Ic = "IconUsb", Title = isEs ? "Introducción física de USB" : "Physical USB introduction", Meta = isEs ? "SanDisk Cruzer (VID_0781&PID_5567) montado como D:\\ — entregó mimi.exe" : "SanDisk Cruzer (VID_0781&PID_5567) mounted as D:\\ — mimi.exe delivered", Mitre = new List<string> { "T1200" }, Src = new List<string> { "Security 6416", "SYSTEM USBSTOR", "MFT #301944" }, T = "14:15:42" },
                new ChainNode { Phase = isEs ? "Ejecución" : "Execution", Color = "Red", Ic = "IconTerminal", Title = isEs ? "PowerShell Ofuscado" : "Obfuscated PowerShell", Meta = isEs ? "Comando codificado en base64 de 3 capas → IEX DownloadString desde cdn-telemetry-sync[.]net" : "3-layer base64 EncodedCommand → IEX DownloadString from cdn-telemetry-sync[.]net", Mitre = new List<string> { "T1059.001", "T1027" }, Src = new List<string> { "PowerShell 4104", "Sysmon 1", "MFT #198233" }, T = "14:04:11" },
                new ChainNode { Phase = isEs ? "Comando y Control" : "Command & Control", Color = "Orange", Ic = "IconNetwork", Title = isEs ? "Canal de C2 establecido" : "C2 channel established", Meta = isEs ? "svchost.exe → 185.220.101.47:443, sin registro PTR, patrón de baliza (beaconing)" : "svchost.exe → 185.220.101.47:443, no PTR record, beaconing pattern", Mitre = new List<string> { "T1071.001", "T1105" }, Src = new List<string> { "Security 5156", "Sysmon 3" }, T = "14:02:57" },
                new ChainNode { Phase = isEs ? "Persistencia" : "Persistence", Color = "Orange", Ic = "IconKey", Title = isEs ? "Clave Run + servicio malicioso" : "Run key + malicious service", Meta = isEs ? "HKCU Run \"WindowsSvc\" y servicio WinDefendSvc → %APPDATA%\\svchost.exe" : "HKCU Run \"WindowsSvc\" and service WinDefendSvc → %APPDATA%\\svchost.exe", Mitre = new List<string> { "T1547.001", "T1543.003" }, Src = new List<string> { "Sysmon 13", "SCM 7045", "NTUSER.DAT", "SYSTEM hive" }, T = "14:10:11" },
                new ChainNode { Phase = isEs ? "Evasión de Defensa" : "Defense Evasion", Color = "Purple", Ic = "IconFileSearch", Title = isEs ? "Timestomp + borrado de logs" : "Timestomp + log clearing", Meta = isEs ? "$SI alterado en 3 binarios; registro Security borrado (1102); Defender manipulado" : "$SI backdated on 3 binaries; Security log cleared (1102); Defender tampered", Mitre = new List<string> { "T1070.006", "T1070.001", "T1562.001" }, Src = new List<string> { "Sysmon 2", "Security 1102", "MFT #214877" }, T = "14:26:50" },
                new ChainNode { Phase = isEs ? "Impacto" : "Impact", Color = "Red", Ic = "IconTrash", Title = isEs ? "Destrucción de datos" : "Data destruction", Meta = isEs ? "847 archivos puestos a cero en \\Documents (USN); copias de sombra eliminadas (vssadmin)" : "847 files zeroed in \\Documents (USN); Volume Shadow Copies deleted (vssadmin)", Mitre = new List<string> { "T1485", "T1490" }, Src = new List<string> { "USN 104", "Sysmon 1", "MFT #155120/155121" }, T = "14:33:40" },
                new ChainNode { Phase = isEs ? "Movimiento Lateral" : "Lateral Movement", Color = "Blue", Ic = "IconServer", Title = isEs ? "Inicio de sesión de red a equipo par" : "Network logon to peer host", Meta = isEs ? "Inicio de sesión Tipo 3 a ADMIN$ desde FIN-WKS-11 — intento de propagación" : "Logon Type 3 to ADMIN$ from FIN-WKS-11 — spread attempt", Mitre = new List<string> { "T1021.002" }, Src = new List<string> { "Security 4624" }, T = "14:41:55" }
            };

            AttackCatalog = new Dictionary<string, string>
            {
                { "T1200", isEs ? "Adiciones de Hardware" : "Hardware Additions" },
                { "T1059.001", "PowerShell" },
                { "T1027", isEs ? "Archivos o Información Ofuscada" : "Obfuscated Files or Information" },
                { "T1071.001", isEs ? "Protocolo de Capa de Aplicación: Web" : "Application Layer Protocol: Web" },
                { "T1105", isEs ? "Transferencia de Herramientas de Entrada" : "Ingress Tool Transfer" },
                { "T1547.001", isEs ? "Claves de Ejecución del Registro / Inicio" : "Registry Run Keys / Startup" },
                { "T1543.003", isEs ? "Servicio de Windows" : "Windows Service" },
                { "T1070.006", isEs ? "Timestomp (Alteración de Tiempos)" : "Timestomp" },
                { "T1070.001", isEs ? "Borrado de Registros de Eventos de Windows" : "Clear Windows Event Logs" },
                { "T1562.001", isEs ? "Deteriorar Defensas" : "Impair Defenses" },
                { "T1485", isEs ? "Destrucción de Datos" : "Data Destruction" },
                { "T1490", isEs ? "Inhibir la Recuperación del Sistema" : "Inhibit System Recovery" },
                { "T1021.002", isEs ? "Recursos Compartidos SMB / Administrador" : "SMB / Admin Shares" },
                { "T1218.011", "Rundll32" }
            };

            EvtxActivity = new List<double> { 1200, 2100, 1600, 3400, 2800, 4700, 3100, 1900, 2500, 4200, 2200, 5100 };
            MftActivity = new List<double> { 400, 900, 600, 1500, 1100, 2200, 1600, 800, 1400, 2100, 1000, 2600 };
            ActivityLabels = new List<string> { "00", "06", "12", "18", "24", "", "", "", "", "", "", "" };
        }

        public void ClearData()
        {
            Case = new CaseInfo
            {
                Id = "MUN-EMPTY-CASE",
                Host = "UNKNOWN-HOST",
                Analyst = "Yoandy R.",
                Os = "N/A",
                Acquired = "N/A",
                Tool = "N/A"
            };
            Events = new List<EventLogItem>();
            Mft = new List<MftRecord>();
            Registry = new List<RegistryItem>();
            Iocs = new List<IocItem>();
            Chain = new List<ChainNode>();
            AttackCatalog = new Dictionary<string, string>();
            EvtxActivity = new List<double> { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
            MftActivity = new List<double> { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
            ActivityLabels = new List<string> { "00", "06", "12", "18", "24", "", "", "", "", "", "", "" };
        }

        public void LoadCustomCase(CustomCaseData data)
        {
            Case = data.Case;
            Events = data.Events ?? new List<EventLogItem>();
            Mft = data.Mft ?? new List<MftRecord>();
            Registry = data.Registry ?? new List<RegistryItem>();
            Iocs = data.Iocs ?? new List<IocItem>();
            Chain = data.Chain ?? new List<ChainNode>();
            AttackCatalog = data.AttackCatalog ?? new Dictionary<string, string>();
            
            // Build simple mock activity chart values
            EvtxActivity = new List<double> { 100, 200, 150, 300, 250, 400, 300, 200, 250, 350, 200, 450 };
            MftActivity = new List<double> { 50, 100, 80, 150, 120, 200, 150, 90, 120, 180, 100, 220 };
            ActivityLabels = new List<string> { "00", "06", "12", "18", "24", "", "", "", "", "", "", "" };
        }
    }

    public class CustomCaseData
    {
        public CaseInfo Case { get; set; } = default!;
        public List<EventLogItem>? Events { get; set; }
        public List<MftRecord>? Mft { get; set; }
        public List<RegistryItem>? Registry { get; set; }
        public List<IocItem>? Iocs { get; set; }
        public List<ChainNode>? Chain { get; set; }
        public Dictionary<string, string>? AttackCatalog { get; set; }
    }
}
