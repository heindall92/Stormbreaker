using System.Collections.Generic;
using Stormbreaker.Models;

namespace Stormbreaker.Services
{
    public class SampleDataService
    {
        public CaseInfo Case { get; }
        public List<EventLogItem> Events { get; }
        public List<MftRecord> Mft { get; }
        public List<RegistryItem> Registry { get; }
        public List<IocItem> Iocs { get; }
        public List<ChainNode> Chain { get; }
        public Dictionary<string, string> AttackCatalog { get; }
        public List<double> EvtxActivity { get; }
        public List<double> MftActivity { get; }
        public List<string> ActivityLabels { get; }

        public SampleDataService()
        {
            Case = new CaseInfo
            {
                Id = "MUN-2026-0417",
                Host = "FIN-WKS-07",
                Analyst = "Yoandy R.",
                Os = "Windows 11 Pro 23H2 (22631)",
                Acquired = "2026-04-17 15:41:02 UTC",
                Tool = "Muninn Acquire 1.4 · triage image (KAPE targets)"
            };

            Events = new List<EventLogItem>
            {
                new EventLogItem
                {
                    T = "14:02:57", Ts = "2026-04-17 14:02:57", Id = 5156, Ch = "Security", Lvl = "info", Src = "Windows Filtering Platform", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "Outbound connection allowed — svchost.exe → 185.220.101.47:443", Mitre = new List<string> { "T1071.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Direction", "Outbound" }, { "Protocol", "TCP/443" }, { "Remote", "185.220.101.47" }, { "DNS", "no PTR / no resolution" }, { "Process", "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe" }
                    }
                },
                new EventLogItem
                {
                    T = "14:04:11", Ts = "2026-04-17 14:04:11", Id = 4104, Ch = "PowerShell/Operational", Lvl = "critical", Src = "PowerShell", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "ScriptBlock logging — base64 EncodedCommand, 3 layers of obfuscation", Mitre = new List<string> { "T1059.001", "T1027" },
                    Detail = new Dictionary<string, string>
                    {
                        { "ScriptBlockId", "a91f-…-77c2" }, { "Length", "8,142 bytes" }, { "Decoded", "IEX (New-Object Net.WebClient).DownloadString(...)" }, { "Signed", "false" }
                    }
                },
                new EventLogItem
                {
                    T = "14:05:44", Ts = "2026-04-17 14:05:44", Id = 1, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4990, User = "FIN\\a.morgan",
                    Msg = "Process create — cmd.exe spawned by powershell.exe (unusual parent)", Mitre = new List<string> { "T1059.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Parent", "powershell.exe (4821)" }, { "Child", "cmd.exe (4990)" }, { "CommandLine", "cmd /c copy payload.dat svchost.exe" }, { "IntegrityLevel", "Medium" }
                    }
                },
                new EventLogItem
                {
                    T = "14:08:33", Ts = "2026-04-17 14:08:33", Id = 1102, Ch = "Security", Lvl = "critical", Src = "Eventlog", Pid = 4990, User = "FIN\\a.morgan",
                    Msg = "Audit log cleared — anti-forensic activity", Mitre = new List<string> { "T1070.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Channel", "Security" }, { "ClearedBy", "FIN\\a.morgan" }, { "Note", "Occurs immediately before mass file deletion" }
                    }
                },
                new EventLogItem
                {
                    T = "14:10:11", Ts = "2026-04-17 14:10:11", Id = 13, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "Registry value set — Run key persistence written", Mitre = new List<string> { "T1547.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Key", "HKCU\\...\\CurrentVersion\\Run" }, { "Value", "WindowsSvc" }, { "Data", "%APPDATA%\\svchost.exe" }
                    }
                },
                new EventLogItem
                {
                    T = "14:15:42", Ts = "2026-04-17 14:15:42", Id = 6416, Ch = "Security", Lvl = "info", Src = "Plug and Play", Pid = 4, User = "SYSTEM",
                    Msg = "New external device — USBSTOR SanDisk Cruzer (VID_0781&PID_5567)", Mitre = new List<string> { "T1200" },
                    Detail = new Dictionary<string, string>
                    {
                        { "DeviceId", "USB\\VID_0781&PID_5567" }, { "FriendlyName", "SanDisk Cruzer Blade" }, { "Serial", "4C530001…" }, { "FirstSeen", "this host, first time" }
                    }
                },
                new EventLogItem
                {
                    T = "14:22:09", Ts = "2026-04-17 14:22:09", Id = 11, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "File create — svchost.exe dropped in %APPDATA%\\Roaming", Mitre = new List<string> { "T1105" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Target", "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe" }, { "Hash(SHA256)", "e3b0c442…1b7852b855" }, { "Signed", "false" }
                    }
                },
                new EventLogItem
                {
                    T = "14:26:50", Ts = "2026-04-17 14:26:50", Id = 2, Ch = "Sysmon/Operational", Lvl = "critical", Src = "Sysmon", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "File creation time changed — timestomp on svchost.exe", Mitre = new List<string> { "T1070.006" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Target", "%APPDATA%\\svchost.exe" }, { "PreviousCreation", "2026-04-17 14:22:09" }, { "SetTo", "2021-01-08 09:14:00" }, { "Technique", "$STANDARD_INFO backdated" }
                    }
                },
                new EventLogItem
                {
                    T = "14:28:05", Ts = "2026-04-17 14:28:05", Id = 1, Ch = "Sysmon/Operational", Lvl = "warning", Src = "Sysmon", Pid = 5310, User = "FIN\\a.morgan",
                    Msg = "Process create — vssadmin delete shadows /all /quiet", Mitre = new List<string> { "T1490" },
                    Detail = new Dictionary<string, string>
                    {
                        { "CommandLine", "vssadmin delete shadows /all /quiet" }, { "Parent", "svchost.exe (4821)" }, { "Effect", "Volume Shadow Copies destroyed" }
                    }
                },
                new EventLogItem
                {
                    T = "14:32:18", Ts = "2026-04-17 14:32:18", Id = 1116, Ch = "Windows Defender", Lvl = "info", Src = "Defender", Pid = 0, User = "SYSTEM",
                    Msg = "Threat detected but action failed — Trojan:Win32/Wacatac remnants", Mitre = new List<string> { "T1562.001" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Threat", "Trojan:Win32/Wacatac.B!ml" }, { "Action", "Quarantine failed (access denied)" }, { "RTP", "tamper suspected" }
                    }
                },
                new EventLogItem
                {
                    T = "14:33:40", Ts = "2026-04-17 14:33:40", Id = 104, Ch = "System", Lvl = "warning", Src = "USN/FS", Pid = 4821, User = "FIN\\a.morgan",
                    Msg = "USN Journal — 847 files deleted in 12s under \\Users\\a.morgan\\Documents", Mitre = new List<string> { "T1485" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Path", "C:\\Users\\a.morgan\\Documents" }, { "Count", "847 files" }, { "Window", "12 seconds" }, { "Reason", "DATA_OVERWRITE|FILE_DELETE" }
                    }
                },
                new EventLogItem
                {
                    T = "14:41:55", Ts = "2026-04-17 14:41:55", Id = 4624, Ch = "Security", Lvl = "success", Src = "Security", Pid = 0, User = "FIN\\a.morgan",
                    Msg = "Logon Type 3 (network) from workstation FIN-WKS-11 — lateral attempt", Mitre = new List<string> { "T1021.002" },
                    Detail = new Dictionary<string, string>
                    {
                        { "LogonType", "3 (Network)" }, { "Source", "FIN-WKS-11" }, { "Share", "ADMIN$" }, { "Result", "success" }
                    }
                },
                new EventLogItem
                {
                    T = "14:47:12", Ts = "2026-04-17 14:47:12", Id = 7045, Ch = "System", Lvl = "warning", Src = "Service Control Manager", Pid = 0, User = "SYSTEM",
                    Msg = "New service installed — \"WinDefendSvc\" pointing to %APPDATA%\\svchost.exe", Mitre = new List<string> { "T1543.003" },
                    Detail = new Dictionary<string, string>
                    {
                        { "ServiceName", "WinDefendSvc" }, { "ImagePath", "%APPDATA%\\svchost.exe" }, { "StartType", "auto" }, { "Note", "masquerades as Defender" }
                    }
                },
                new EventLogItem
                {
                    T = "14:52:03", Ts = "2026-04-17 14:52:03", Id = 4688, Ch = "Security", Lvl = "info", Src = "Security", Pid = 5620, User = "FIN\\a.morgan",
                    Msg = "New process — rundll32.exe with no arguments (proxy exec)", Mitre = new List<string> { "T1218.011" },
                    Detail = new Dictionary<string, string>
                    {
                        { "Process", "rundll32.exe" }, { "CommandLine", "rundll32.exe (no args)" }, { "Parent", "svchost.exe (4821)" }
                    }
                }
            };

            Mft = new List<MftRecord>
            {
                new MftRecord { Rec = 214877, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe", Size = "184 KB", Si = "2021-01-08 09:14:00", Fn = "2026-04-17 14:22:09", Flag = true, Note = "$SI far older than $FN → timestomp" },
                new MftRecord { Rec = 214512, Path = "C:\\Users\\a.morgan\\AppData\\Local\\Temp\\payload.dat", Size = "201 KB", Si = "2026-04-17 14:04:59", Fn = "2026-04-17 14:04:59", Flag = false, Note = "staging file, deleted after copy" },
                new MftRecord { Rec = 198233, Path = "C:\\Windows\\Temp\\p.ps1", Size = "8.0 KB", Si = "2019-03-12 00:00:00", Fn = "2026-04-17 14:04:12", Flag = true, Note = "$SI backdated 7y → timestomp" },
                new MftRecord { Rec = 301944, Path = "D:\\tools\\mimi.exe", Size = "1.3 MB", Si = "2026-04-17 14:18:33", Fn = "2026-04-17 14:18:33", Flag = false, Note = "delivered from USBSTOR volume" },
                new MftRecord { Rec = 214901, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\wsc.tmp", Size = "42 KB", Si = "2011-06-02 12:00:00", Fn = "2026-04-17 14:26:44", Flag = true, Note = "$SI = install date of OEM image → stomped" },
                new MftRecord { Rec = 155120, Path = "C:\\Users\\a.morgan\\Documents\\Q1_forecast.xlsx", Size = "0 KB", Si = "2026-02-11 08:31:00", Fn = "2026-02-11 08:31:00", Flag = false, Note = "0-byte after USN overwrite (data destruction)" },
                new MftRecord { Rec = 155121, Path = "C:\\Users\\a.morgan\\Documents\\payroll_2026.xlsx", Size = "0 KB", Si = "2026-01-30 10:02:00", Fn = "2026-01-30 10:02:00", Flag = false, Note = "0-byte after USN overwrite" },
                new MftRecord { Rec = 277650, Path = "C:\\Windows\\System32\\Tasks\\WinDefendSvc", Size = "3 KB", Si = "2026-04-17 14:47:01", Fn = "2026-04-17 14:47:01", Flag = false, Note = "scheduled task backing malicious service" },
                new MftRecord { Rec = 214880, Path = "C:\\Users\\a.morgan\\AppData\\Roaming\\svchost.exe:Zone.Identifier", Size = "26 B", Si = "2026-04-17 14:22:09", Fn = "2026-04-17 14:22:09", Flag = false, Note = "ADS — MOTW: downloaded from Internet zone 3" },
                new MftRecord { Rec = 198240, Path = "C:\\Windows\\Temp\\out.log", Size = "12 KB", Si = "2026-04-17 14:33:52", Fn = "2026-04-17 14:33:52", Flag = false, Note = "exfil manifest of deleted paths" }
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
                new IocItem { Type = "IPv4", Val = "185.220.101.47", Conf = "high", Ctx = "C2 — outbound TCP/443, no DNS" },
                new IocItem { Type = "SHA256", Val = "9f2b4c7e5a1d8f3096a2b1c4d7e0f5a8b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8", Conf = "high", Ctx = "%APPDATA%\\svchost.exe" },
                new IocItem { Type = "Filename", Val = "svchost.exe (%APPDATA%\\Roaming)", Conf = "high", Ctx = "masqueraded dropper" },
                new IocItem { Type = "Registry", Val = "HKCU\\...\\Run\\WindowsSvc", Conf = "high", Ctx = "persistence" },
                new IocItem { Type = "Service", Val = "WinDefendSvc", Conf = "high", Ctx = "masquerading service" },
                new IocItem { Type = "USB Serial", Val = "4C530001220612…", Conf = "medium", Ctx = "SanDisk Cruzer — initial access" },
                new IocItem { Type = "Domain", Val = "cdn-telemetry-sync[.]net", Conf = "medium", Ctx = "staging URL in decoded PS1" }
            };

            Chain = new List<ChainNode>
            {
                new ChainNode { Phase = "Initial Access", Color = "Red", Ic = "IconUsb", Title = "Physical USB introduction", Meta = "SanDisk Cruzer (VID_0781&PID_5567) mounted as D:\\ — mimi.exe delivered", Mitre = new List<string> { "T1200" }, Src = new List<string> { "Security 6416", "SYSTEM USBSTOR", "MFT #301944" }, T = "14:15:42" },
                new ChainNode { Phase = "Execution", Color = "Red", Ic = "IconTerminal", Title = "Obfuscated PowerShell", Meta = "3-layer base64 EncodedCommand → IEX DownloadString from cdn-telemetry-sync[.]net", Mitre = new List<string> { "T1059.001", "T1027" }, Src = new List<string> { "PowerShell 4104", "Sysmon 1", "MFT #198233" }, T = "14:04:11" },
                new ChainNode { Phase = "Command & Control", Color = "Orange", Ic = "IconNetwork", Title = "C2 channel established", Meta = "svchost.exe → 185.220.101.47:443, no PTR record, beaconing pattern", Mitre = new List<string> { "T1071.001", "T1105" }, Src = new List<string> { "Security 5156", "Sysmon 3" }, T = "14:02:57" },
                new ChainNode { Phase = "Persistence", Color = "Orange", Ic = "IconKey", Title = "Run key + malicious service", Meta = "HKCU Run \"WindowsSvc\" and service WinDefendSvc → %APPDATA%\\svchost.exe", Mitre = new List<string> { "T1547.001", "T1543.003" }, Src = new List<string> { "Sysmon 13", "SCM 7045", "NTUSER.DAT", "SYSTEM hive" }, T = "14:10:11" },
                new ChainNode { Phase = "Defense Evasion", Color = "Purple", Ic = "IconFileSearch", Title = "Timestomp + log clearing", Meta = "$SI backdated on 3 binaries; Security log cleared (1102); Defender tampered", Mitre = new List<string> { "T1070.006", "T1070.001", "T1562.001" }, Src = new List<string> { "Sysmon 2", "Security 1102", "MFT #214877" }, T = "14:26:50" },
                new ChainNode { Phase = "Impact", Color = "Red", Ic = "IconTrash", Title = "Data destruction", Meta = "847 files zeroed in \\Documents (USN); Volume Shadow Copies deleted (vssadmin)", Mitre = new List<string> { "T1485", "T1490" }, Src = new List<string> { "USN 104", "Sysmon 1", "MFT #155120/155121" }, T = "14:33:40" },
                new ChainNode { Phase = "Lateral Movement", Color = "Blue", Ic = "IconServer", Title = "Network logon to peer host", Meta = "Logon Type 3 to ADMIN$ from FIN-WKS-11 — spread attempt", Mitre = new List<string> { "T1021.002" }, Src = new List<string> { "Security 4624" }, T = "14:41:55" }
            };

            AttackCatalog = new Dictionary<string, string>
            {
                { "T1200", "Hardware Additions" },
                { "T1059.001", "PowerShell" },
                { "T1027", "Obfuscated Files or Information" },
                { "T1071.001", "Application Layer Protocol: Web" },
                { "T1105", "Ingress Tool Transfer" },
                { "T1547.001", "Registry Run Keys / Startup" },
                { "T1543.003", "Windows Service" },
                { "T1070.006", "Timestomp" },
                { "T1070.001", "Clear Windows Event Logs" },
                { "T1562.001", "Impair Defenses" },
                { "T1485", "Data Destruction" },
                { "T1490", "Inhibit System Recovery" },
                { "T1021.002", "SMB / Admin Shares" },
                { "T1218.011", "Rundll32" }
            };

            EvtxActivity = new List<double> { 1200, 2100, 1600, 3400, 2800, 4700, 3100, 1900, 2500, 4200, 2200, 5100 };
            MftActivity = new List<double> { 400, 900, 600, 1500, 1100, 2200, 1600, 800, 1400, 2100, 1000, 2600 };
            ActivityLabels = new List<string> { "00", "06", "12", "18", "24", "", "", "", "", "", "", "" };
        }
    }
}
