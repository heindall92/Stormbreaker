// Stormbreaker.Shell/MainWindow.xaml.cs
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace Stormbreaker.Shell;

public partial class MainWindow : Window
{
    // WebView2 does not fire WebResourceRequested for a hostname registered via
    // SetVirtualHostNameToFolderMapping (confirmed platform limitation, see
    // MicrosoftEdge/WebView2Feedback#4201). So instead of layering the fallback
    // interceptor on top of the virtual host mapping, this serves the whole
    // wwwroot tree through WebResourceRequested directly, which both intercepts
    // reliably and keeps the browser's URL (and therefore the SPA router's
    // location.pathname) on the originally requested deep-link path.
    private static readonly Dictionary<string, string> MimeTypesByExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        [".html"] = "text/html",
        [".js"] = "text/javascript",
        [".mjs"] = "text/javascript",
        [".css"] = "text/css",
        [".json"] = "application/json",
        [".svg"] = "image/svg+xml",
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".ico"] = "image/x-icon",
        [".woff"] = "font/woff",
        [".woff2"] = "font/woff2",
        [".webp"] = "image/webp",
        [".map"] = "application/json",
    };

    private static readonly string WwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");

    public MainWindow()
    {
        InitializeComponent();
        Loaded += MainWindow_Loaded;
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        if (!WebView2RuntimeChecker.IsInstalled())
        {
            ErrorWindow.ShowMissingRuntime();
            Close();
            return;
        }

        if (!File.Exists(Path.Combine(WwwrootPath, "_shell.html")))
        {
            ErrorWindow.ShowMissingContent();
            Close();
            return;
        }

        await Browser.EnsureCoreWebView2Async();

        Browser.CoreWebView2.AddWebResourceRequestedFilter(
            "https://stormbreaker.local/*", CoreWebView2WebResourceContext.All);
        Browser.CoreWebView2.WebResourceRequested += OnWebResourceRequested;

        Browser.CoreWebView2.Navigate("https://stormbreaker.local/");
    }

    private void OnWebResourceRequested(object? sender, CoreWebView2WebResourceRequestedEventArgs e)
    {
        try
        {
            var requestPath = new Uri(e.Request.Uri).AbsolutePath;

            // "/" has no literal file on disk (the prerendered SPA shell is named
            // _shell.html, not index.html) — treat it as a default-document alias
            // for the shell, independent of SpaFallbackResolver's unknown-route logic.
            if (requestPath == "/")
            {
                RespondWithFile(e, Path.Combine(WwwrootPath, "_shell.html"));
                return;
            }

            var relativePath = requestPath.TrimStart('/');
            var candidatePath = Path.Combine(WwwrootPath, relativePath);

            var fallback = SpaFallbackResolver.ShouldFallbackToShell(
                requestPath, _ => File.Exists(candidatePath));

            RespondWithFile(e, fallback ? Path.Combine(WwwrootPath, "_shell.html") : candidatePath);
        }
        catch
        {
            // A locked file, AV scan, or transient disk error here should degrade to a
            // single failed resource load, not crash the app on the WPF dispatcher.
            RespondNotFound(e);
        }
    }

    private void RespondWithFile(CoreWebView2WebResourceRequestedEventArgs e, string filePath)
    {
        // Manually serving files (instead of SetVirtualHostNameToFolderMapping,
        // which normalizes and contains paths itself) means path traversal must
        // be guarded explicitly here.
        var fullWwwroot = Path.GetFullPath(WwwrootPath);
        var fullFilePath = Path.GetFullPath(filePath);
        if (!fullFilePath.StartsWith(fullWwwroot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
            && !string.Equals(fullFilePath, fullWwwroot, StringComparison.OrdinalIgnoreCase))
        {
            RespondNotFound(e);
            return;
        }

        if (!File.Exists(fullFilePath))
        {
            RespondNotFound(e);
            return;
        }

        var mimeType = MimeTypesByExtension.TryGetValue(Path.GetExtension(fullFilePath), out var mapped)
            ? mapped
            : "application/octet-stream";

        var stream = File.OpenRead(fullFilePath);
        e.Response = Browser.CoreWebView2.Environment.CreateWebResourceResponse(
            stream, 200, "OK", $"Content-Type: {mimeType}");
    }

    private void RespondNotFound(CoreWebView2WebResourceRequestedEventArgs e)
    {
        e.Response = Browser.CoreWebView2.Environment.CreateWebResourceResponse(null, 404, "Not Found", "");
    }
}
