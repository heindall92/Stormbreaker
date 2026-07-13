using System.Windows;

namespace Stormbreaker.Shell;

public partial class ErrorWindow : Window
{
    public ErrorWindow(string message, string? link = null)
    {
        InitializeComponent();
        MessageText.Text = message;
        LinkText.Text = link ?? string.Empty;
    }

    public static void ShowMissingRuntime()
    {
        var window = new ErrorWindow(
            "Stormbreaker needs the Microsoft Edge WebView2 Runtime, which isn't installed on this machine.",
            "Download it from: https://developer.microsoft.com/microsoft-edge/webview2/");
        window.ShowDialog();
    }

    public static void ShowMissingContent()
    {
        var window = new ErrorWindow(
            "Stormbreaker's application files are missing or corrupted. Please reinstall the application.");
        window.ShowDialog();
    }
}
