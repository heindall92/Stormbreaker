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
