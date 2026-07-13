using System.Windows;

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

        await Browser.EnsureCoreWebView2Async();
        Browser.CoreWebView2.Navigate("about:blank");
    }
}
