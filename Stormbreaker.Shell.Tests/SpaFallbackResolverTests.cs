// Stormbreaker.Shell.Tests/SpaFallbackResolverTests.cs
using Stormbreaker.Shell;
using Xunit;

namespace Stormbreaker.Shell.Tests;

public class SpaFallbackResolverTests
{
    [Fact]
    public void RootPath_DoesNotFallback()
    {
        var result = SpaFallbackResolver.ShouldFallbackToShell("/", _ => false);
        Assert.False(result);
    }

    [Fact]
    public void ExistingStaticAsset_DoesNotFallback()
    {
        var result = SpaFallbackResolver.ShouldFallbackToShell(
            "/assets/app.js", path => path == "/assets/app.js");
        Assert.False(result);
    }

    [Fact]
    public void UnknownRoute_FallsBackToShell()
    {
        var result = SpaFallbackResolver.ShouldFallbackToShell("/events", _ => false);
        Assert.True(result);
    }
}
