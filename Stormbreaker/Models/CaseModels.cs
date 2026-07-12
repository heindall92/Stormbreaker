using System;
using System.Collections.Generic;
using Stormbreaker.ViewModels;

namespace Stormbreaker.Models
{
    public class CaseInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public string Analyst { get; set; } = string.Empty;
        public string Os { get; set; } = string.Empty;
        public string Acquired { get; set; } = string.Empty;
        public string Tool { get; set; } = string.Empty;
    }

    public class EventLogItem : ViewModelBase
    {
        private bool _isExpanded;
        public bool IsExpanded
        {
            get => _isExpanded;
            set => SetProperty(ref _isExpanded, value);
        }

        public string T { get; set; } = string.Empty;       // HH:MM:SS
        public string Ts { get; set; } = string.Empty;      // YYYY-MM-DD HH:MM:SS
        public int Id { get; set; }
        public string Ch { get; set; } = string.Empty;      // Channel (Security, Sysmon, etc.)
        public string Lvl { get; set; } = string.Empty;     // critical, warning, info, success
        public string Src { get; set; } = string.Empty;     // Source
        public int Pid { get; set; }
        public string User { get; set; } = string.Empty;
        public string Msg { get; set; } = string.Empty;
        public List<string> Mitre { get; set; } = new List<string>();
        public Dictionary<string, string> Detail { get; set; } = new Dictionary<string, string>();
    }

    public class MftRecord
    {
        public int Rec { get; set; }
        public string Path { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Si { get; set; } = string.Empty;      // $STANDARD_INFO created date
        public string Fn { get; set; } = string.Empty;      // $FILE_NAME created date
        public bool Flag { get; set; }                     // true if timestomped
        public string Note { get; set; } = string.Empty;
    }

    public class RegistryItem
    {
        public string Hive { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Data { get; set; } = string.Empty;
        public string T { get; set; } = string.Empty;
        public string Mitre { get; set; } = string.Empty;
    }

    public class IocItem
    {
        public string Type { get; set; } = string.Empty;
        public string Val { get; set; } = string.Empty;
        public string Conf { get; set; } = string.Empty;    // high, medium, low
        public string Ctx { get; set; } = string.Empty;     // Context context
    }

    public class ChainNode
    {
        public string Phase { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;   // red, orange, purple, blue, green
        public string Ic { get; set; } = string.Empty;      // Icon resource key (IconLayoutGrid, etc.)
        public string Title { get; set; } = string.Empty;
        public string Meta { get; set; } = string.Empty;
        public List<string> Mitre { get; set; } = new List<string>();
        public List<string> Src { get; set; } = new List<string>();
        public string T { get; set; } = string.Empty;       // Timestamp HH:MM:SS
    }
}
