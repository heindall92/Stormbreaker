// Stormbreaker.Shell/MainWindow.xaml.cs
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace Stormbreaker.Shell;

public partial class MainWindow : Window
{
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

        var wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        if (!File.Exists(Path.Combine(wwwrootPath, "_shell.html")))
        {
            ErrorWindow.ShowMissingContent();
            Close();
            return;
        }

        await Browser.EnsureCoreWebView2Async();

        Browser.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "stormbreaker.local", wwwrootPath, CoreWebView2HostResourceAccessKind.DenyCors);

        Browser.CoreWebView2.Navigate("https://stormbreaker.local/_shell.html");
    }
}
