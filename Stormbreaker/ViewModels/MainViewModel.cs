using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using Stormbreaker.Models;
using Stormbreaker.Services;

namespace Stormbreaker.ViewModels
{
    public class MainViewModel : ViewModelBase
    {
        private readonly SampleDataService _dataService;
        private readonly OllamaService _ollamaService;

        // Navigation
        private string _currentView = "dashboard";
        public string CurrentView
        {
            get => _currentView;
            set => SetProperty(ref _currentView, value);
        }

        // Sidebar State
        private bool _isSidebarExpanded = false;
        public bool IsSidebarExpanded
        {
            get => _isSidebarExpanded;
            set => SetProperty(ref _isSidebarExpanded, value);
        }

        // Triage Stats
        public CaseInfo Case => _dataService.Case;
        public List<EventLogItem> Events => _dataService.Events;
        public List<MftRecord> Mft => _dataService.Mft;

        // Event Filtering & Sorting
        private string _eventSearchText = "";
        public string EventSearchText
        {
            get => _eventSearchText;
            set
            {
                if (SetProperty(ref _eventSearchText, value))
                    OnPropertyChanged(nameof(FilteredEvents));
            }
        }

        private string _selectedSeverityFilter = "all";
        public string SelectedSeverityFilter
        {
            get => _selectedSeverityFilter;
            set
            {
                if (SetProperty(ref _selectedSeverityFilter, value))
                    OnPropertyChanged(nameof(FilteredEvents));
            }
        }

        private string _eventSortKey = "t";
        public string EventSortKey
        {
            get => _eventSortKey;
            set
            {
                if (SetProperty(ref _eventSortKey, value))
                    OnPropertyChanged(nameof(FilteredEvents));
            }
        }

        private string _eventSortDir = "asc";
        public string EventSortDir
        {
            get => _eventSortDir;
            set
            {
                if (SetProperty(ref _eventSortDir, value))
                    OnPropertyChanged(nameof(FilteredEvents));
            }
        }

        public IEnumerable<EventLogItem> FilteredEvents
        {
            get
            {
                var query = EventSearchText?.Trim().ToLowerInvariant();
                var list = Events.Where(e =>
                {
                    if (SelectedSeverityFilter != "all" && e.Lvl != SelectedSeverityFilter)
                        return false;

                    if (string.IsNullOrEmpty(query))
                        return true;

                    return e.Msg.ToLowerInvariant().Contains(query) ||
                           e.Src.ToLowerInvariant().Contains(query) ||
                           e.User.ToLowerInvariant().Contains(query) ||
                           e.Ch.ToLowerInvariant().Contains(query) ||
                           e.Id.ToString().Contains(query) ||
                           e.Mitre.Any(m => m.ToLowerInvariant().Contains(query));
                });

                bool asc = EventSortDir == "asc";
                list = EventSortKey switch
                {
                    "t" => asc ? list.OrderBy(e => e.T) : list.OrderByDescending(e => e.T),
                    "id" => asc ? list.OrderBy(e => e.Id) : list.OrderByDescending(e => e.Id),
                    "ch" => asc ? list.OrderBy(e => e.Ch) : list.OrderByDescending(e => e.Ch),
                    "lvl" => asc ? list.OrderBy(e => e.Lvl) : list.OrderByDescending(e => e.Lvl),
                    "src" => asc ? list.OrderBy(e => e.Src) : list.OrderByDescending(e => e.Src),
                    "user" => asc ? list.OrderBy(e => e.User) : list.OrderByDescending(e => e.User),
                    _ => list
                };

                return list.ToList();
            }
        }

        // MFT Filtering
        private string _mftSearchText = "";
        public string MftSearchText
        {
            get => _mftSearchText;
            set
            {
                if (SetProperty(ref _mftSearchText, value))
                    OnPropertyChanged(nameof(FilteredMft));
            }
        }

        private bool _mftStompOnly;
        public bool MftStompOnly
        {
            get => _mftStompOnly;
            set
            {
                if (SetProperty(ref _mftStompOnly, value))
                    OnPropertyChanged(nameof(FilteredMft));
            }
        }

        public IEnumerable<MftRecord> FilteredMft
        {
            get
            {
                var query = MftSearchText?.Trim().ToLowerInvariant();
                var list = Mft.Where(m =>
                {
                    if (MftStompOnly && !m.Flag)
                        return false;

                    if (string.IsNullOrEmpty(query))
                        return true;

                    return m.Path.ToLowerInvariant().Contains(query) ||
                           m.Note.ToLowerInvariant().Contains(query) ||
                           m.Rec.ToString().Contains(query);
                });

                return list.ToList();
            }
        }

        // MFT Stats Helpers
        public int MftTotalCount => Mft.Count;
        public int MftTimestompCount => Mft.Count(m => m.Flag);
        public int MftAdsCount => Mft.Count(m => m.Path.Contains("Zone.Identifier"));
        public int MftZeroedCount => Mft.Count(m => m.Size == "0 KB");

        // Timeline Filtering
        private string _timelineFilterLvl = "all";
        public string TimelineFilterLvl
        {
            get => _timelineFilterLvl;
            set
            {
                if (SetProperty(ref _timelineFilterLvl, value))
                    OnPropertyChanged(nameof(TimelineEvents));
            }
        }

        public IEnumerable<EventLogItem> TimelineEvents
        {
            get
            {
                var list = Events.OrderByDescending(e => e.T);
                if (TimelineFilterLvl != "all")
                {
                    return list.Where(e => e.Lvl == TimelineFilterLvl).ToList();
                }
                return list.ToList();
            }
        }

        public List<RegistryItem> Registry => _dataService.Registry;
        public List<IocItem> Iocs => _dataService.Iocs;
        public List<ChainNode> Chain => _dataService.Chain;
        public Dictionary<string, string> AttackCatalog => _dataService.AttackCatalog;

        public List<double> EvtxActivity => _dataService.EvtxActivity;
        public List<double> MftActivity => _dataService.MftActivity;
        public List<string> ActivityLabels => _dataService.ActivityLabels;

        // Global States
        private int _notificationCount = 7;
        public int NotificationCount
        {
            get => _notificationCount;
            set => SetProperty(ref _notificationCount, value);
        }

        private bool _isScanning;
        public bool IsScanning
        {
            get => _isScanning;
            set => SetProperty(ref _isScanning, value);
        }

        private bool _isImportModalOpen;
        public bool IsImportModalOpen
        {
            get => _isImportModalOpen;
            set => SetProperty(ref _isImportModalOpen, value);
        }

        private double _scanProgress;
        public double ScanProgress
        {
            get => _scanProgress;
            set => SetProperty(ref _scanProgress, value);
        }

        private string _scanStatusText = "Idle";
        public string ScanStatusText
        {
            get => _scanStatusText;
            set => SetProperty(ref _scanStatusText, value);
        }

        // AI Engine States
        public OllamaService Ollama => _ollamaService;

        private string _aiText = "";
        public string AiText
        {
            get => _aiText;
            set => SetProperty(ref _aiText, value);
        }

        private bool _isAiBusy;
        public bool IsAiBusy
        {
            get => _isAiBusy;
            set => SetProperty(ref _isAiBusy, value);
        }

        private bool _isAiOnline;
        public bool IsAiOnline
        {
            get => _isAiOnline;
            set => SetProperty(ref _isAiOnline, value);
        }

        private ObservableCollection<string> _ollamaModels = new();
        public ObservableCollection<string> OllamaModels
        {
            get => _ollamaModels;
            set => SetProperty(ref _ollamaModels, value);
        }

        private string _selectedModel = "llama3.1:8b";
        public string SelectedModel
        {
            get => _selectedModel;
            set
            {
                if (SetProperty(ref _selectedModel, value))
                {
                    _ollamaService.Model = value;
                }
            }
        }

        private string _ollamaEndpoint = "http://localhost:11434";
        public string OllamaEndpoint
        {
            get => _ollamaEndpoint;
            set
            {
                if (SetProperty(ref _ollamaEndpoint, value))
                {
                    _ollamaService.Endpoint = value;
                }
            }
        }

        private string _backendEndpoint = "http://localhost:8000";
        public string BackendEndpoint
        {
            get => _backendEndpoint;
            set => SetProperty(ref _backendEndpoint, value);
        }

        private string _connectionStatusText = "Not tested yet";
        public string ConnectionStatusText
        {
            get => _connectionStatusText;
            set => SetProperty(ref _connectionStatusText, value);
        }

        private string _connectionStatusState = "idle"; // ok, bad, idle
        public string ConnectionStatusState
        {
            get => _connectionStatusState;
            set => SetProperty(ref _connectionStatusState, value);
        }

        public ICommand NavigateCommand { get; }
        public ICommand QuickScanCommand { get; }
        public ICommand RunAiAnalysisCommand { get; }
        public ICommand TestOllamaCommand { get; }
        public ICommand SaveSettingsCommand { get; }
        public ICommand ToggleImportModalCommand { get; }
        public ICommand ToggleSidebarCommand { get; }
        public ICommand SortEventsCommand { get; }
        public ICommand SetSeverityFilterCommand { get; }
        public ICommand SetTimelineFilterCommand { get; }
        public ICommand ExportMarkdownCommand { get; }
        public ICommand ExportJsonCommand { get; }
        public ICommand CopyIocsCommand { get; }
        public ICommand CopySingleIocCommand { get; }

        private CancellationTokenSource? _aiCts;

        public MainViewModel()
        {
            _dataService = new SampleDataService();
            _ollamaService = new OllamaService();

            NavigateCommand = new RelayCommand(param =>
            {
                if (param is string viewId)
                {
                    CurrentView = viewId;
                }
            });

            QuickScanCommand = new RelayCommand(async _ => await ExecuteQuickScanAsync());
            RunAiAnalysisCommand = new RelayCommand(async param => await ExecuteAiAnalysisAsync(param as string ?? ""));
            TestOllamaCommand = new RelayCommand(async _ => await ExecuteTestOllamaAsync());
            SaveSettingsCommand = new RelayCommand(_ =>
            {
                _ollamaService.Endpoint = OllamaEndpoint;
                _ollamaService.Model = SelectedModel;
                // Add save confirmation / toast equivalent
            });
            ToggleImportModalCommand = new RelayCommand(_ => IsImportModalOpen = !IsImportModalOpen);
            ToggleSidebarCommand = new RelayCommand(_ => IsSidebarExpanded = !IsSidebarExpanded);
            SortEventsCommand = new RelayCommand(param =>
            {
                if (param is string key)
                {
                    if (EventSortKey == key)
                    {
                        EventSortDir = EventSortDir == "asc" ? "desc" : "asc";
                    }
                    else
                    {
                        EventSortKey = key;
                        EventSortDir = "asc";
                    }
                }
            });
            SetSeverityFilterCommand = new RelayCommand(param =>
            {
                if (param is string lvl)
                {
                    SelectedSeverityFilter = lvl;
                }
            });
            SetTimelineFilterCommand = new RelayCommand(param =>
            {
                if (param is string lvl)
                {
                    TimelineFilterLvl = lvl;
                }
            });
            ExportMarkdownCommand = new RelayCommand(_ => ExecuteExportMarkdown());
            ExportJsonCommand = new RelayCommand(_ => ExecuteExportJson());
            CopyIocsCommand = new RelayCommand(_ => ExecuteCopyIocs());
            CopySingleIocCommand = new RelayCommand(param => { if (param is string val) System.Windows.Clipboard.SetText(val); });

            // Initialize background checks
            _ = Task.Run(async () =>
            {
                var ok = await _ollamaService.TestConnectionAsync();
                IsAiOnline = ok;
            });
        }

        private async Task ExecuteQuickScanAsync()
        {
            if (IsScanning) return;

            IsScanning = true;
            ScanProgress = 0;

            var steps = new[]
            {
                (Text: "Enumerating artifacts ($MFT · USN · hives)", Prog: 25.0, Delay: 400),
                (Text: "Parsing Event Logs (Security · Sysmon · PowerShell)", Prog: 55.0, Delay: 800),
                (Text: "Correlating by PID & path (pivot pid=4821)", Prog: 85.0, Delay: 700),
                (Text: "Scan complete. 23 threats · 7 ATT&CK techniques", Prog: 100.0, Delay: 500)
            };

            foreach (var step in steps)
            {
                ScanStatusText = step.Text;
                await Task.Delay(step.Delay);
                ScanProgress = step.Prog;
            }

            await Task.Delay(600);
            IsScanning = false;
            ScanStatusText = "Idle";
            CurrentView = "dashboard";
        }

        private async Task ExecuteTestOllamaAsync()
        {
            ConnectionStatusText = $"Testing {_ollamaService.Endpoint}...";
            ConnectionStatusState = "idle";

            var ok = await _ollamaService.TestConnectionAsync();
            IsAiOnline = ok;

            if (ok)
            {
                ConnectionStatusState = "ok";
                ConnectionStatusText = $"Connected · {_ollamaService.InstalledModels.Count} model(s) installed";
                
                OllamaModels.Clear();
                foreach (var model in _ollamaService.InstalledModels)
                {
                    OllamaModels.Add(model);
                }

                if (OllamaModels.Contains(SelectedModel))
                {
                    // keep current
                }
                else if (OllamaModels.Count > 0)
                {
                    SelectedModel = OllamaModels.First();
                }
            }
            else
            {
                ConnectionStatusState = "bad";
                ConnectionStatusText = "Could not reach the daemon — demo mode will be used";
            }
        }

        private async Task ExecuteAiAnalysisAsync(string question)
        {
            if (IsAiBusy) return;

            // Ensure we are on the AI view
            CurrentView = "ai";
            IsAiBusy = true;
            AiText = $"Building structured DFIR prompt from {Events.Count} events, {Mft.Count} MFT records, and {Iocs.Count} IOCs...\n\n";

            _aiCts?.Cancel();
            _aiCts = new CancellationTokenSource();

            var (sysPrompt, userPrompt) = BuildDfirPrompt(question);
            var isRealOnline = await _ollamaService.TestConnectionAsync();
            IsAiOnline = isRealOnline;

            try
            {
                if (isRealOnline)
                {
                    var sb = new StringBuilder();
                    await _ollamaService.StreamChatAsync(
                        sysPrompt,
                        userPrompt,
                        token =>
                        {
                            sb.Append(token);
                            AiText = sb.ToString();
                        },
                        _aiCts.Token
                    );
                }
                else
                {
                    // Fallback to offline demo stream
                    var demoText = GetDemoResponse(question);
                    var sb = new StringBuilder();
                    var tokens = demoText.Split(new[] { ' ' }, StringSplitOptions.None);

                    foreach (var token in tokens)
                    {
                        _aiCts.Token.ThrowIfCancellationRequested();
                        sb.Append(token).Append(" ");
                        AiText = sb.ToString();
                        await Task.Delay(25, _aiCts.Token); // Simulate streaming speed
                    }
                }
            }
            catch (OperationCanceledException)
            {
                AiText += "\n\n[Analysis Cancelled]";
            }
            catch (Exception ex)
            {
                AiText += $"\n\n[Error during analysis: {ex.Message}]";
            }
            finally
            {
                IsAiBusy = false;
            }
        }

        private (string SystemPrompt, string UserPrompt) BuildDfirPrompt(string question)
        {
            var topEvents = string.Join("\n", Events.Select(e => 
                $"[{e.T}] {e.Ch} EID {e.Id} ({e.Lvl}) {e.Src} — {e.Msg} {{ATT&CK {string.Join(",", e.Mitre)}}} pid={e.Pid}"));

            var stompMft = string.Join("\n", Mft.Where(m => m.Flag).Select(m => 
                $"- #{m.Rec} {m.Path} | $SI {m.Si} vs $FN {m.Fn} ({m.Note})"));

            var iocDetails = string.Join("\n", Iocs.Select(i => 
                $"- {i.Type}: {i.Val} ({i.Conf}, {i.Ctx})"));

            var dossier = $"CASE {Case.Id} | host {Case.Host} | {Case.Os} | acquired {Case.Acquired}\n\n"
                          + $"EVENT TIMELINE (UTC):\n{topEvents}\n\n"
                          + $"MFT TIMESTOMP FLAGS ($STANDARD_INFO vs $FILE_NAME):\n{stompMft}\n\n"
                          + $"INDICATORS OF COMPROMISE:\n{iocDetails}";

            var sys = "You are a senior DFIR (Digital Forensics & Incident Response) analyst embedded in the Muninn console. "
                      + "Analyse ONLY the evidence provided. Be precise, technical and concise. "
                      + "Map findings to MITRE ATT&CK technique IDs where relevant. "
                      + "Structure the answer with short Markdown sections: ## Executive Summary, ## Attack Chain, ## Indicators, ## Recommended Actions. "
                      + "Use bullet points. Do not invent artifacts that are not in the evidence. Never output more than ~350 words.";

            var user = $"Forensic evidence:\n\n{dossier}\n\n"
                       + (!string.IsNullOrWhiteSpace(question) ? $"Analyst question: {question.Trim()}" : "Task: produce the incident analysis for this case.");

            return (sys, user);
        }

        private string GetDemoResponse(string question)
        {
            var q = question.ToLowerInvariant();
            if (q.Contains("powershell") || q.Contains("4104"))
            {
                return "## PowerShell activity\nEvent ID **4104** at `14:04:11` captured a `base64` **EncodedCommand** with three obfuscation layers (**T1059.001**, **T1027**). The decoded payload runs `IEX (New-Object Net.WebClient).DownloadString(...)` pulling a stage from `cdn-telemetry-sync[.]net`.\n\n## Why it is suspicious\n- Unsigned script block, parent is not a shell you would expect\n- Immediately followed by a `cmd /c copy payload.dat svchost.exe` (**T1105**)\n- Same `pid=4821` later writes the Run key and opens the C2 socket\n\n## Recommended\n- Pull the full script block by `ScriptBlockId a91f-…-77c2`\n- Hunt the decoded URL and the `svchost.exe` SHA256 across the fleet";
            }
            if (q.Contains("persist") || q.Contains("run key") || q.Contains("service"))
            {
                return "## Persistence\nTwo mechanisms, both pointing at `%APPDATA%\\svchost.exe`:\n- **Run key** `HKCU\\...\\Run\\WindowsSvc` written `14:10:11` (**T1547.001**)\n- **Service** `WinDefendSvc` installed `14:47:12`, masquerading as Defender (**T1543.003**), backed by a scheduled task (MFT #277650)\n\n## Recommended\n- Remove both, then confirm the binary is quarantined before reboot (the service auto-starts)";
            }
            if (q.Contains("ioc") || q.Contains("indicator"))
            {
                return "## Key indicators\n- **C2** `185.220.101.47:443` (no PTR) — **T1071.001**\n- **Dropper** `%APPDATA%\\svchost.exe`, SHA256 `9f2b4c7e…d5e8`\n- **Staging** `cdn-telemetry-sync[.]net`\n- **Persistence** Run\\WindowsSvc + service WinDefendSvc\n- **Initial access** SanDisk Cruzer USB serial `4C530001…`\n\nExport the full set from the Reports view (JSON/STIX-friendly).";
            }

            return $"## Executive Summary\n**High-confidence intrusion** on `{Case.Host}` beginning **14:02 UTC**. The operator used living-off-the-land tradecraft to gain execution, establish C2, persist, destroy data and move laterally — all within ~50 minutes.\n\n## Attack Chain\n- **Initial Access** — SanDisk Cruzer USB mounted as `D:\\`, delivered tooling (**T1200**)\n- **Execution** — obfuscated PowerShell `EID 4104`, 3-layer base64 (**T1059.001 / T1027**)\n- **C2** — `svchost.exe` → `185.220.101.47:443`, no DNS (**T1071.001 / T1105**)\n- **Persistence** — Run key `WindowsSvc` + service `WinDefendSvc` (**T1547.001 / T1543.003**)\n- **Defense Evasion** — `$STANDARD_INFO` timestomp on 3 binaries, Security log cleared, Defender tampered (**T1070.006 / T1070.001 / T1562.001**)\n- **Impact** — 847 files zeroed in `\\Documents`, shadow copies deleted (**T1485 / T1490**)\n- **Lateral Movement** — network logon to `ADMIN$` on `FIN-WKS-11` (**T1021.002**)\n\n## Indicators\n- `185.220.101.47` · `%APPDATA%\\svchost.exe` · `cdn-telemetry-sync[.]net` · Run\\WindowsSvc · service WinDefendSvc\n\n## Recommended Actions\n- Isolate `{Case.Host}` and **capture memory before shutdown**\n- Preserve `$MFT`, `$LogFile`, USN Journal for extended timeline work\n- Block the C2 IP + staging domain, hunt the SHA256 fleet-wide\n- Reset credentials for FIN\\a.morgan and audit access to the ADMIN$ share on FIN-WKS-11";
        }

        private string GetMarkdownReport()
        {
            var sb = new StringBuilder();
            sb.AppendLine("# Stormbreaker DFIR — Incident Report");
            sb.AppendLine();
            sb.AppendLine($"- **Case:** {Case.Id}");
            sb.AppendLine($"- **Host:** {Case.Host} ({Case.Os})");
            sb.AppendLine($"- **Analyst:** {Case.Analyst}");
            sb.AppendLine($"- **Acquired:** {Case.Acquired}");
            sb.AppendLine($"- **Tooling:** {Case.Tool}");
            sb.AppendLine();
            sb.AppendLine("## Executive Summary");
            sb.AppendLine("High-confidence intrusion on FIN-WKS-07 starting 14:02 UTC. A living-off-the-land chain progressed from USB delivery through obfuscated PowerShell, established C2 to 185.220.101.47, installed Run-key and service persistence, performed timestomping and log clearing, and destroyed 847 files while deleting Volume Shadow Copies. A lateral network logon to a peer host was observed.");
            sb.AppendLine();
            sb.AppendLine("## Attack Chain (MITRE ATT&CK)");
            foreach (var node in Chain)
            {
                sb.AppendLine($"- **{node.Phase}** ({node.T}) — {node.Title}. {node.Meta} [ {string.Join(", ", node.Mitre)} ]");
            }
            sb.AppendLine();
            sb.AppendLine("## Indicators of Compromise");
            foreach (var ioc in Iocs)
            {
                sb.AppendLine($"- `{ioc.Type}` {ioc.Val} ({ioc.Conf} confidence — {ioc.Ctx})");
            }
            sb.AppendLine();
            sb.AppendLine("## Techniques Observed");
            foreach (var tech in AttackCatalog)
            {
                sb.AppendLine($"- {tech.Key} — {tech.Value}");
            }
            sb.AppendLine();
            sb.AppendLine("## Recommended Actions");
            var actions = new[]
            {
                $"Isolate {Case.Host} from the network immediately (contain lateral movement).",
                "Capture a full memory image before shutdown to preserve volatile artifacts.",
                "Preserve $MFT, $LogFile and the USN Journal for extended timeline reconstruction.",
                "Block 185.220.101.47 and cdn-telemetry-sync[.]net at the perimeter; hunt the SHA256 fleet-wide.",
                "Reset credentials for FIN\\a.morgan and audit access to the ADMIN$ share on FIN-WKS-11."
            };
            for (int i = 0; i < actions.Length; i++)
            {
                sb.AppendLine($"{i + 1}. {actions[i]}");
            }
            sb.AppendLine();
            sb.AppendLine($"_Generated by Stormbreaker DFIR Console · {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC_");
            return sb.ToString();
        }

        private string GetJsonIocs()
        {
            var data = new
            {
                @case = Case.Id,
                host = Case.Host,
                generated = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC"),
                indicators = Iocs.Select(i => new { type = i.Type, value = i.Val, confidence = i.Conf, context = i.Ctx }),
                attack = AttackCatalog.Select(a => new { id = a.Key, name = a.Value })
            };
            return System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        }

        private void ExecuteExportMarkdown()
        {
            var dialog = new Microsoft.Win32.SaveFileDialog
            {
                Filter = "Markdown Files (*.md)|*.md",
                FileName = $"Stormbreaker_{Case.Id}_report.md"
            };
            if (dialog.ShowDialog() == true)
            {
                System.IO.File.WriteAllText(dialog.FileName, GetMarkdownReport(), Encoding.UTF8);
            }
        }

        private void ExecuteExportJson()
        {
            var dialog = new Microsoft.Win32.SaveFileDialog
            {
                Filter = "JSON Files (*.json)|*.json",
                FileName = $"Stormbreaker_{Case.Id}_iocs.json"
            };
            if (dialog.ShowDialog() == true)
            {
                System.IO.File.WriteAllText(dialog.FileName, GetJsonIocs(), Encoding.UTF8);
            }
        }

        private void ExecuteCopyIocs()
        {
            var text = string.Join("\n", Iocs.Select(i => $"{i.Type}\t{i.Val}"));
            System.Windows.Clipboard.SetText(text);
        }
    }
}
