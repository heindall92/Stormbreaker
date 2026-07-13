using Microsoft.Web.WebView2.Core;

namespace Stormbreaker.Shell;

public static class WebView2RuntimeChecker
{
    public static bool IsInstalled()
    {
        try
        {
            var version = CoreWebView2Environment.GetAvailableBrowserVersionString();
            return !string.IsNullOrEmpty(version);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            return false;
        }
    }
}
