# Native Foundation (Stormbreaker.Shell) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a borderless native Windows `.exe` (WPF + WebView2) that renders the existing `temp_lovable` glassmorphism UI pixel-for-pixel, with native window drag/resize/minimize/maximize/close, and no runtime server dependency.

**Architecture:** A WPF (.NET 8) window with `WindowStyle="None"` hosts a full-window `Microsoft.Web.WebView2.Wpf.WebView2` control. `temp_lovable` is built as a static SPA (TanStack Start's `spa` mode, Nitro disabled) and copied into `wwwroot`, served via `SetVirtualHostNameToFolderMapping` — no server process at runtime. Window drag uses WebView2's native `IsNonClientRegionSupportEnabled` + CSS `-webkit-app-region`, not Win32 message hooking. Resize uses WPF's `WindowChrome` with a margin trick so a thin native strip stays outside WebView2's hit-testing. A `NativeBridge` COM object exposes minimize/maximize/close to JS.

**Tech Stack:** .NET 8 WPF, `Microsoft.Web.WebView2.Wpf`, xUnit (for the one pure-logic unit), TanStack Start (`temp_lovable`), Tailwind v4.

**Prerequisites confirmed during planning (do not re-verify, just build on them):**
- `dotnet --version` → 8.0.422 is installed.
- `temp_lovable` builds successfully with `nitro: false` + `tanstackStart.spa.enabled: true`, producing `dist/client/_shell.html` — verified by serving it with a plain static file server and loading it in a browser (client-side render worked; only unknown sub-routes like `/events` 404 against a bare static server, which Task 5 fixes inside WebView2 specifically).
- The `node-server` Nitro preset also works (confirmed by running it) but was **not chosen** — the static SPA path avoids bundling a Node runtime and matches the approved design spec (`docs/superpowers/specs/2026-07-13-native-foundation-design.md`), which requires zero runtime server dependency.
- WebView2 APIs used below (`IsNonClientRegionSupportEnabled`, `-webkit-app-region`, `SetVirtualHostNameToFolderMapping`, `AddWebResourceRequestedFilter`, `CreateWebResourceResponse`) were confirmed against current Microsoft Learn docs, not assumed from memory.
- The WindowChrome-can't-resize-under-full-window-WebView2 problem is a known, documented WebView2 issue (MicrosoftEdge/WebView2Feedback #4538, #704); the fix is a margin on the WebView2 control matching `ResizeBorderThickness`, used in Task 6.

**Deviations from the approved design spec, and why:**
1. **Drag uses WebView2's `IsNonClientRegionSupportEnabled` + CSS `-webkit-app-region`, not a `NativeBridge.StartDrag()` method.** The spec sketched a bridge-driven drag; the WebView2-native mechanism does the same job with less code and no Win32 message hooking, confirmed against current Microsoft Learn docs. `Minimize`/`ToggleMaximize`/`Close` remain on the bridge as specced.
2. **Packaging produces a self-contained folder, not a literal single `.exe`.** `PublishSingleFile` has known extraction issues with the WebView2 loader; the folder still runs standalone with no separate runtime install, which is the actual requirement.
3. **One xUnit test exists (`SpaFallbackResolverTests`), despite the spec saying "manual only."** It covers a pure, easy-to-get-subtly-wrong routing decision (SPA fallback) with no UI dependency — cheap and low-risk to keep automated. Everything else stays manual per spec.
4. **The frontend build target changed from "just embed `temp_lovable`'s existing build" to "build in static SPA mode."** Discovered mid-planning: `temp_lovable`'s default build is server-rendered (Nitro/Cloudflare target) with no static `index.html`, which contradicts "no runtime server" from the spec. Task 1 fixes this at the source (`vite.config.ts`), confirmed working before writing the rest of the plan. Already discussed with and approved by the user.

---

### Task 1: Configure `temp_lovable` for a static SPA build

**Files:**
- Modify: `temp_lovable/vite.config.ts`

- [ ] **Step 1: Update the Vite config to disable Nitro and enable SPA prerender**

Replace the full contents of `temp_lovable/vite.config.ts` with:

```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Stormbreaker.Shell embeds this as a static SPA (no runtime server) — disable
  // Nitro's SSR/Workers build and let TanStack Start prerender a static shell instead.
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
});
```

- [ ] **Step 2: Build and verify static output**

Run: `npm run build --prefix temp_lovable`
Expected: build succeeds, ends with `[prerender] Prerendered 1 pages: - /`, and creates `temp_lovable/dist/client/_shell.html` plus `temp_lovable/dist/client/assets/`.

Verify the file exists:

Run: `test -f temp_lovable/dist/client/_shell.html && echo FOUND`
Expected: `FOUND`

- [ ] **Step 3: Verify it renders standalone (no dev server)**

Run: `npx serve -l 4321 temp_lovable/dist/client &` (or any static file server), then open `http://127.0.0.1:4321/_shell.html` in a browser.
Expected: the Stormbreaker Dashboard renders with the glass UI, matching `npm run dev`. Kill the static server afterward.

- [ ] **Step 4: Commit**

```bash
git add temp_lovable/vite.config.ts
git commit -m "build: switch temp_lovable to static SPA output for native embedding"
```

---

### Task 2: Stormbreaker.Shell WPF project skeleton

**Files:**
- Create: `Stormbreaker.Shell/Stormbreaker.Shell.csproj`
- Create: `Stormbreaker.Shell/App.xaml`
- Create: `Stormbreaker.Shell/App.xaml.cs`
- Create: `Stormbreaker.Shell/MainWindow.xaml`
- Create: `Stormbreaker.Shell/MainWindow.xaml.cs`
- Modify: `.gitignore`

- [ ] **Step 1: Create the project file**

```xml
<!-- Stormbreaker.Shell/Stormbreaker.Shell.csproj -->
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <RootNamespace>Stormbreaker.Shell</RootNamespace>
    <AssemblyName>Stormbreaker</AssemblyName>
  </PropertyGroup>

</Project>
```

- [ ] **Step 2: Create App.xaml / App.xaml.cs**

```xml
<!-- Stormbreaker.Shell/App.xaml -->
<Application x:Class="Stormbreaker.Shell.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
</Application>
```

```csharp
// Stormbreaker.Shell/App.xaml.cs
using System.Windows;

namespace Stormbreaker.Shell;

public partial class App : Application
{
}
```

- [ ] **Step 3: Create a minimal MainWindow**

```xml
<!-- Stormbreaker.Shell/MainWindow.xaml -->
<Window x:Class="Stormbreaker.Shell.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Stormbreaker DFIR" Height="800" Width="1280"
        Background="#020617">
    <Grid />
</Window>
```

```csharp
// Stormbreaker.Shell/MainWindow.xaml.cs
using System.Windows;

namespace Stormbreaker.Shell;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

- [ ] **Step 4: Run and verify**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: a window titled "Stormbreaker DFIR" opens with a plain dark navy (`#020617`) background, standard Windows title bar still present at this point (removed in Task 6). Close the window to end the process.

- [ ] **Step 5: Ignore generated frontend assets**

Add to `.gitignore` (append at the end):

```
# Stormbreaker.Shell — frontend assets copied in by the BuildFrontend MSBuild target
Stormbreaker.Shell/wwwroot/
publish/
```

- [ ] **Step 6: Commit**

```bash
git add Stormbreaker.Shell/Stormbreaker.Shell.csproj Stormbreaker.Shell/App.xaml Stormbreaker.Shell/App.xaml.cs Stormbreaker.Shell/MainWindow.xaml Stormbreaker.Shell/MainWindow.xaml.cs .gitignore
git commit -m "feat: scaffold Stormbreaker.Shell WPF project"
```

---

### Task 3: WebView2 integration, runtime check, error window

**Files:**
- Modify: `Stormbreaker.Shell/MainWindow.xaml`
- Modify: `Stormbreaker.Shell/MainWindow.xaml.cs`
- Create: `Stormbreaker.Shell/WebView2RuntimeChecker.cs`
- Create: `Stormbreaker.Shell/ErrorWindow.xaml`
- Create: `Stormbreaker.Shell/ErrorWindow.xaml.cs`

- [ ] **Step 1: Add the WebView2 NuGet package**

Run: `dotnet add Stormbreaker.Shell package Microsoft.Web.WebView2`
Expected: `Stormbreaker.Shell/Stormbreaker.Shell.csproj` gains a `<PackageReference Include="Microsoft.Web.WebView2" ... />` entry, command exits 0.

- [ ] **Step 2: Create the runtime checker**

```csharp
// Stormbreaker.Shell/WebView2RuntimeChecker.cs
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
```

- [ ] **Step 3: Create the native error window**

```xml
<!-- Stormbreaker.Shell/ErrorWindow.xaml -->
<Window x:Class="Stormbreaker.Shell.ErrorWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Stormbreaker DFIR — Error" Height="220" Width="480"
        WindowStartupLocation="CenterScreen"
        Background="#020617" ResizeMode="NoResize">
    <StackPanel Margin="24" VerticalAlignment="Center">
        <TextBlock x:Name="MessageText" Foreground="White" TextWrapping="Wrap" FontSize="14" Margin="0,0,0,12" />
        <TextBlock x:Name="LinkText" Foreground="#38BDF8" TextWrapping="Wrap" FontSize="12" />
    </StackPanel>
</Window>
```

```csharp
// Stormbreaker.Shell/ErrorWindow.xaml.cs
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
```

- [ ] **Step 4: Host the WebView2 control and wire the runtime check**

```xml
<!-- Stormbreaker.Shell/MainWindow.xaml -->
<Window x:Class="Stormbreaker.Shell.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"
        Title="Stormbreaker DFIR" Height="800" Width="1280"
        Background="#020617">
    <Grid>
        <wv2:WebView2 x:Name="Browser" />
    </Grid>
</Window>
```

```csharp
// Stormbreaker.Shell/MainWindow.xaml.cs
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
```

- [ ] **Step 5: Run and verify**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: window opens, no `ErrorWindow` dialog appears (WebView2 Runtime ships with Windows 11 / Edge), WebView2 initializes without throwing. The missing-runtime path itself can't be exercised without uninstalling the Evergreen runtime — verified by code review and the documented `WebView2RuntimeNotFoundException` type instead.

- [ ] **Step 6: Commit**

```bash
git add Stormbreaker.Shell/Stormbreaker.Shell.csproj Stormbreaker.Shell/MainWindow.xaml Stormbreaker.Shell/MainWindow.xaml.cs Stormbreaker.Shell/WebView2RuntimeChecker.cs Stormbreaker.Shell/ErrorWindow.xaml Stormbreaker.Shell/ErrorWindow.xaml.cs
git commit -m "feat: host WebView2 with runtime check and native error window"
```

---

### Task 4: Build the frontend into wwwroot, serve it via virtual host mapping

**Files:**
- Modify: `Stormbreaker.Shell/Stormbreaker.Shell.csproj`
- Modify: `Stormbreaker.Shell/MainWindow.xaml.cs`

- [ ] **Step 1: Add an MSBuild target that builds temp_lovable and copies it into wwwroot**

Append inside the `<Project>` element of `Stormbreaker.Shell/Stormbreaker.Shell.csproj` (after the existing `<PropertyGroup>`):

```xml
  <Target Name="BuildFrontend" BeforeTargets="Build;Publish">
    <Exec Command="npm run build" WorkingDirectory="..\temp_lovable" />
    <ItemGroup>
      <FrontendAssets Include="..\temp_lovable\dist\client\**\*.*" />
    </ItemGroup>
    <Copy SourceFiles="@(FrontendAssets)"
          DestinationFiles="@(FrontendAssets->'$(OutDir)wwwroot\%(RecursiveDir)%(Filename)%(Extension)')" />
  </Target>
```

- [ ] **Step 2: Verify the target runs and populates wwwroot**

Run: `dotnet build Stormbreaker.Shell`
Expected: build output shows `npm run build` running, ends in success, and `Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot/_shell.html` exists.

Run: `test -f "Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot/_shell.html" && echo FOUND`
Expected: `FOUND`

- [ ] **Step 3: Map the virtual host and navigate, with a missing-content guard**

Replace `MainWindow_Loaded` in `Stormbreaker.Shell/MainWindow.xaml.cs` with:

```csharp
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
```

- [ ] **Step 4: Run and verify**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: the Stormbreaker Dashboard renders inside the native window — same glass panels, blur, sidebar, topbar pill as `http://localhost:8080` — still inside the default Windows title bar (removed in Task 6).

- [ ] **Step 5: Verify the missing-content guard**

Run: `mv Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot.bak`
Run: `dotnet run --project Stormbreaker.Shell --no-build`
Expected: `ErrorWindow` appears with the "files are missing or corrupted" message instead of a blank/crashed window.
Run: `mv Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot.bak Stormbreaker.Shell/bin/Debug/net8.0-windows/wwwroot` (restore)

- [ ] **Step 6: Commit**

```bash
git add Stormbreaker.Shell/Stormbreaker.Shell.csproj Stormbreaker.Shell/MainWindow.xaml.cs
git commit -m "feat: build and embed temp_lovable via WebView2 virtual host mapping"
```

---

### Task 5: SPA fallback routing (TDD)

Deep-linking or reloading on a route other than `/` (e.g. `/events`) would otherwise 404, because `SetVirtualHostNameToFolderMapping` only serves files that physically exist. This task adds a `WebResourceRequested` interceptor that falls back to `_shell.html` for unknown paths, backed by a pure, unit-tested decision function.

**Files:**
- Create: `Stormbreaker.Shell.Tests/Stormbreaker.Shell.Tests.csproj`
- Create: `Stormbreaker.Shell.Tests/SpaFallbackResolverTests.cs`
- Create: `Stormbreaker.Shell/SpaFallbackResolver.cs`
- Modify: `Stormbreaker.Shell/MainWindow.xaml.cs`

- [ ] **Step 1: Create the test project**

```xml
<!-- Stormbreaker.Shell.Tests/Stormbreaker.Shell.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.11.1" />
    <PackageReference Include="xunit" Version="2.9.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Stormbreaker.Shell\Stormbreaker.Shell.csproj" />
  </ItemGroup>

</Project>
```

- [ ] **Step 2: Write the failing tests**

```csharp
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
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `dotnet test Stormbreaker.Shell.Tests`
Expected: FAIL — `SpaFallbackResolver` does not exist (compile error).

- [ ] **Step 4: Implement the resolver**

```csharp
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
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `dotnet test Stormbreaker.Shell.Tests`
Expected: PASS — 3 tests passed.

- [ ] **Step 6: Wire the resolver into WebView2's WebResourceRequested event**

Add to `MainWindow_Loaded` in `Stormbreaker.Shell/MainWindow.xaml.cs`, right after `SetVirtualHostNameToFolderMapping` and before `Navigate`:

```csharp
        Browser.CoreWebView2.AddWebResourceRequestedFilter(
            "https://stormbreaker.local/*", CoreWebView2WebResourceContext.All);
        Browser.CoreWebView2.WebResourceRequested += OnWebResourceRequested;
```

Add this method to the `MainWindow` class:

```csharp
    private void OnWebResourceRequested(object? sender, CoreWebView2WebResourceRequestedEventArgs e)
    {
        var requestPath = new Uri(e.Request.Uri).AbsolutePath;
        var wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");

        var fallback = SpaFallbackResolver.ShouldFallbackToShell(
            requestPath,
            p => File.Exists(Path.Combine(wwwrootPath, p.TrimStart('/'))));

        if (!fallback) return;

        var stream = File.OpenRead(Path.Combine(wwwrootPath, "_shell.html"));
        e.Response = Browser.CoreWebView2.Environment.CreateWebResourceResponse(
            stream, 200, "OK", "Content-Type: text/html");
    }
```

- [ ] **Step 7: Run and verify the integration manually**

Run: `dotnet run --project Stormbreaker.Shell`
In the app: click "Event Logs" in the sidebar (navigates client-side to `/events`), then open WebView2 DevTools (right-click → Inspect, or `F12`) and run `location.reload()` in the console.
Expected: the Events view renders again after reload instead of a blank page or 404 — confirming the fallback served `_shell.html` for the `/events` path.

- [ ] **Step 8: Commit**

```bash
git add Stormbreaker.Shell.Tests/Stormbreaker.Shell.Tests.csproj Stormbreaker.Shell.Tests/SpaFallbackResolverTests.cs Stormbreaker.Shell/SpaFallbackResolver.cs Stormbreaker.Shell/MainWindow.xaml.cs
git commit -m "feat: add SPA fallback routing for WebView2 deep links"
```

---

### Task 6: Borderless window with working resize

**Files:**
- Modify: `Stormbreaker.Shell/MainWindow.xaml`

- [ ] **Step 1: Remove the Windows title bar, add WindowChrome for resize, margin the WebView2 control**

Replace the full contents of `Stormbreaker.Shell/MainWindow.xaml` with:

```xml
<Window x:Class="Stormbreaker.Shell.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"
        xmlns:shell="clr-namespace:System.Windows.Shell;assembly=PresentationFramework"
        Title="Stormbreaker DFIR" Height="800" Width="1280" MinHeight="600" MinWidth="960"
        WindowStyle="None" ResizeMode="CanResize"
        Background="#020617">
    <shell:WindowChrome.WindowChrome>
        <shell:WindowChrome CaptionHeight="0" ResizeBorderThickness="6" GlassFrameThickness="0" CornerRadius="0" />
    </shell:WindowChrome.WindowChrome>
    <Grid>
        <wv2:WebView2 x:Name="Browser" Margin="6" />
    </Grid>
</Window>
```

This sets `CaptionHeight="0"` because dragging is delegated entirely to WebView2's non-client region support (Task 7), not to `WindowChrome`. The `Margin="6"` on the WebView2 control matches `ResizeBorderThickness="6"`, leaving a thin strip of real WPF-rendered pixels (filled with the matching `#020617` background) at the window edges — without this margin, WebView2 covers the full window and swallows the resize-border hit-testing (a documented WebView2 limitation, MicrosoftEdge/WebView2Feedback #4538).

- [ ] **Step 2: Run and verify**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: no Windows title bar or border chrome is visible; the window can still be resized by dragging from the very edge (the 6px margin strip); the dashboard fills the rest of the window seamlessly against the matching dark background.

- [ ] **Step 3: Commit**

```bash
git add Stormbreaker.Shell/MainWindow.xaml
git commit -m "feat: borderless window with WindowChrome-based resize"
```

---

### Task 7: Native drag region on the topbar

**Files:**
- Modify: `Stormbreaker.Shell/MainWindow.xaml.cs`
- Modify: `temp_lovable/src/styles.css`
- Modify: `temp_lovable/src/routes/_app.tsx`

- [ ] **Step 1: Enable non-client region support in WebView2**

Add this line in `MainWindow_Loaded` in `Stormbreaker.Shell/MainWindow.xaml.cs`, immediately after `await Browser.EnsureCoreWebView2Async();` and before `SetVirtualHostNameToFolderMapping`:

```csharp
        Browser.CoreWebView2.Settings.IsNonClientRegionSupportEnabled = true;
```

(It must be set before the next navigation, per the WebView2 docs — this satisfies that since it runs before `Navigate` is called later in the same method.)

- [ ] **Step 2: Add drag-region utility classes**

In `temp_lovable/src/styles.css`, insert immediately after the `@utility app-vignette { ... }` block (currently ends around line 232, right before the `/* Fallback for browsers without backdrop-filter */` comment):

```css
@utility app-drag-region {
  -webkit-app-region: drag;
}

@utility app-no-drag {
  -webkit-app-region: no-drag;
}
```

- [ ] **Step 3: Mark the topbar pill draggable and its two button clusters non-draggable**

In `temp_lovable/src/routes/_app.tsx`, in the `AppLayout` function's returned JSX:

Change:
```tsx
          <div className="glass-pill mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-full px-3 pl-4">
            <div className="flex min-w-0 items-center gap-3">
```
To:
```tsx
          <div className="glass-pill app-drag-region mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-full px-3 pl-4">
            <div className="app-no-drag flex min-w-0 items-center gap-3">
```

And change:
```tsx
            {/* Right cluster: Quick scan | Import | separator | Bell | Settings | Avatar */}
            <div className="flex items-center gap-2">
```
To:
```tsx
            {/* Right cluster: Quick scan | Import | separator | Bell | Settings | Avatar */}
            <div className="app-no-drag flex items-center gap-2">
```

- [ ] **Step 4: Rebuild the frontend and run**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: click-and-drag on an empty part of the topbar pill (not on a button) moves the window; clicking "Quick scan", the theme toggle, or any other button in either cluster still works normally instead of starting a drag; double-clicking an empty part of the pill maximizes/restores the window (a built-in behavior of `IsNonClientRegionSupportEnabled`).

- [ ] **Step 5: Commit**

```bash
git add Stormbreaker.Shell/MainWindow.xaml.cs temp_lovable/src/styles.css temp_lovable/src/routes/_app.tsx
git commit -m "feat: native window drag via WebView2 non-client region support"
```

---

### Task 8: Native window controls (minimize / maximize / close)

**Files:**
- Create: `Stormbreaker.Shell/NativeBridge.cs`
- Modify: `Stormbreaker.Shell/MainWindow.xaml.cs`
- Create: `temp_lovable/src/hooks/use-native-shell.ts`
- Modify: `temp_lovable/src/routes/_app.tsx`

- [ ] **Step 1: Create the native bridge**

```csharp
// Stormbreaker.Shell/NativeBridge.cs
using System.Runtime.InteropServices;
using System.Windows;

namespace Stormbreaker.Shell;

[ClassInterface(ClassInterfaceType.AutoDual)]
[ComVisible(true)]
public class NativeBridge
{
    private readonly Window _window;

    public NativeBridge(Window window)
    {
        _window = window;
    }

    public void Minimize() => _window.WindowState = WindowState.Minimized;

    public void ToggleMaximize()
    {
        _window.WindowState = _window.WindowState == WindowState.Maximized
            ? WindowState.Normal
            : WindowState.Maximized;
    }

    public void Close() => _window.Close();
}
```

- [ ] **Step 2: Register it on the WebView2 instance**

Add to `MainWindow_Loaded` in `Stormbreaker.Shell/MainWindow.xaml.cs`, right after the `IsNonClientRegionSupportEnabled` line from Task 7:

```csharp
        Browser.CoreWebView2.AddHostObjectToScript("shell", new NativeBridge(this));
```

- [ ] **Step 3: Create the frontend hook**

```ts
// temp_lovable/src/hooks/use-native-shell.ts
import { useEffect, useState } from "react";

interface ShellHostObject {
  Minimize(): Promise<void>;
  ToggleMaximize(): Promise<void>;
  Close(): Promise<void>;
}

declare global {
  interface Window {
    chrome?: {
      webview?: {
        hostObjects: {
          shell: ShellHostObject;
        };
      };
    };
  }
}

export function useNativeShell() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Boolean(window.chrome?.webview));
  }, []);

  const shell = window.chrome?.webview?.hostObjects.shell;

  return {
    isNative,
    minimize: () => shell?.Minimize(),
    toggleMaximize: () => shell?.ToggleMaximize(),
    close: () => shell?.Close(),
  };
}
```

- [ ] **Step 4: Add window control buttons to the topbar**

In `temp_lovable/src/routes/_app.tsx`, add the import near the other hook imports (after `import { useTheme } from "@/hooks/use-theme";`):

```tsx
import { useNativeShell } from "@/hooks/use-native-shell";
```

Inside `function AppLayout() {`, add this line alongside the other hook calls (after `const { theme, toggle: toggleTheme } = useTheme();`):

```tsx
  const { isNative, minimize, toggleMaximize, close: closeWindow } = useNativeShell();
```

In the right cluster `<div className="app-no-drag flex items-center gap-2">` (from Task 7), insert this block right before its closing `</div>` (i.e., immediately after the closing `</DropdownMenu>` and before the cluster `</div>` that precedes `</div>\n        </header>`):

```tsx
              {isNative && (
                <>
                  <span className="mx-1 hidden h-6 w-px bg-foreground/10 sm:block" />
                  <button
                    onClick={minimize}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Minimize"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleMaximize}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Maximize"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button
                    onClick={closeWindow}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-sev-critical/20 hover:text-sev-critical"
                    aria-label="Close"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </>
              )}
```

- [ ] **Step 5: Run and verify**

Run: `dotnet run --project Stormbreaker.Shell`
Expected: three new buttons appear at the right end of the topbar pill (only inside the native shell — they must NOT appear when running `npm run dev --prefix temp_lovable` in a plain browser tab, since `window.chrome.webview` is undefined there). Clicking minimize minimizes the window; clicking maximize toggles fullscreen/restore; clicking close exits the app. None of the three buttons trigger a window drag (they sit inside the `app-no-drag` cluster from Task 7).

- [ ] **Step 6: Commit**

```bash
git add Stormbreaker.Shell/NativeBridge.cs Stormbreaker.Shell/MainWindow.xaml.cs temp_lovable/src/hooks/use-native-shell.ts temp_lovable/src/routes/_app.tsx
git commit -m "feat: native window controls (minimize/maximize/close) via WebView2 host object"
```

---

### Task 9: Self-contained packaging and full manual verification

**Files:**
- No new files — this task publishes and verifies the existing project.

- [ ] **Step 1: Publish a self-contained build**

Run: `dotnet publish Stormbreaker.Shell -c Release -r win-x64 --self-contained true -o publish`
Expected: build succeeds (this also triggers `BuildFrontend`, so `publish/wwwroot/_shell.html` is present), producing `publish/Stormbreaker.exe` plus its dependency DLLs. This is a self-contained folder, not a single file — `PublishSingleFile` is intentionally not used here because it has known extraction issues with the WebView2 loader.

- [ ] **Step 2: Verify it runs standalone**

Run: `./publish/Stormbreaker.exe` (from a terminal that has NOT run `dotnet run`, `npm run dev`, or any other dev server — the published exe must not depend on any of that)
Expected: the app launches directly, no console window, glass dashboard renders identically to the dev build.

- [ ] **Step 3: Full manual verification checklist**

Run through each item against `./publish/Stormbreaker.exe`:

- [ ] No Windows title bar visible.
- [ ] Dragging the topbar pill (empty area) moves the window.
- [ ] Clicking Quick scan / Import / theme toggle / notifications / settings / avatar menu all still work (no accidental drag).
- [ ] Minimize button minimizes the window.
- [ ] Maximize button toggles fullscreen/restore; double-click on the pill's empty area does the same.
- [ ] Close button exits the app.
- [ ] Resizing from any of the four edges/corners works.
- [ ] Windows 11 snap (Win+Left / Win+Right / Win+Up) works on the window.
- [ ] Navigating to Events / MFT / Timeline / Correlation / AI Analyst / Reports / Settings all render with demo data, matching `http://localhost:8080` in a browser.
- [ ] Side-by-side visual comparison against `temp_lovable` running via `npm run dev --prefix temp_lovable` in a browser: same glass blur, same tokens, same layout.

- [ ] **Step 4: Commit** (only if any fixes were needed during Step 3 — otherwise this task has nothing new to commit)

```bash
git status
# If clean, this task is done — no commit needed.
# If any file changed while fixing an issue found in Step 3, commit it with a message
# describing exactly what was fixed.
```

---

## Out of scope (unchanged from the design spec)

- Real EVTX/MFT/Registry/USN Journal parsing.
- MITRE ATT&CK correlation logic, Ollama AI copilot, report export.
- Desktop Acrylic (DWM composition showing the real desktop behind the window).
- Automated UI tests beyond the one pure-logic unit in Task 5.
