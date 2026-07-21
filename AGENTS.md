# AGENTS.md

## Cursor Cloud specific instructions

Stormbreaker is a **Windows-only** desktop app: WPF + WebView2 shell (`Stormbreaker.Shell`, `net8.0-windows`, `UseWPF`) that hosts a prebuilt React/TanStack SPA (checked in under `Stormbreaker.Shell/wwwroot`). The cloud VM is Linux, which constrains what can run — details below. Standard build/run commands live in `README.md`.

### .NET SDK
- The **official Microsoft .NET 8 SDK** is installed at `/usr/share/dotnet` (symlinked to `/usr/bin/dotnet`).
- Do **not** use Ubuntu's `apt` `dotnet-sdk-8.0` package: it omits the `Microsoft.NET.Sdk.WindowsDesktop` targets, so WPF projects fail with `MSB4019 ... WindowsDesktop.targets not found`.
- Restore/build of the WPF-referencing projects requires the `-p:EnableWindowsTargeting=true` flag on Linux (allows cross-compiling Windows-targeted projects). Restore the test project (`dotnet restore Stormbreaker.Shell.Tests/Stormbreaker.Shell.Tests.csproj -p:EnableWindowsTargeting=true`) — it transitively restores the shell. There is no `.sln`.

### What works vs. does not on Linux
- **Compiles on Linux**: `dotnet build Stormbreaker.Shell.Tests/Stormbreaker.Shell.Tests.csproj -p:EnableWindowsTargeting=true` succeeds (both projects).
- **Tests do NOT run on Linux**: `dotnet test` aborts because the test host transitively depends on the `Microsoft.WindowsDesktop.App` runtime, which only exists on Windows. Run the xUnit tests (`Stormbreaker.Shell.Tests`, `SpaFallbackResolver`) on a real Windows machine/CI.
- **The WPF app does NOT run on Linux**: it needs Windows + the WebView2 runtime + a desktop. Use a Windows host for `dotnet run --project Stormbreaker.Shell`.

### Previewing the real UI on Linux
The shell's only runtime job is to serve `wwwroot` to WebView2 and apply SPA fallback (`MainWindow.xaml.cs`: `/` and unknown routes → `_shell.html`, existing files served as-is). To preview/exercise the actual console UI on Linux, serve `wwwroot` over HTTP with that same fallback and open it in Chrome (a plain static server won't work because there is no `index.html` — the SPA shell is `_shell.html`). The Reports/AI report generation demo streams **mock/demo data** and needs no real Ollama instance.
