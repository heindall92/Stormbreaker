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
