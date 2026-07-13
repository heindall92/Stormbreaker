// Stormbreaker.Shell/SpaFallbackResolver.cs
namespace Stormbreaker.Shell;

public static class SpaFallbackResolver
{
    public static bool ShouldFallbackToShell(string requestPath, Func<string, bool> fileExists)
    {
        if (string.IsNullOrEmpty(requestPath) || requestPath == "/")
            return false;

        if (fileExists(requestPath))
            return false;

        return true;
    }
}
