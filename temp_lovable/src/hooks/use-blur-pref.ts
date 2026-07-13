import { useEffect, useState } from "react";

const KEY = "sb-blur";

function apply(enabled: boolean) {
  document.documentElement.classList.toggle("no-blur", !enabled);
}

export function useBlurPref() {
  // Default: enabled on desktop, disabled on coarse/small screens
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    let initial: boolean;
    if (saved === "on") initial = true;
    else if (saved === "off") initial = false;
    else {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const small = window.matchMedia("(max-width: 768px)").matches;
      initial = !(coarse || small);
    }
    setEnabled(initial);
    apply(initial);
  }, []);

  function set(next: boolean) {
    setEnabled(next);
    apply(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
  }

  return { enabled, set, toggle: () => set(!enabled) };
}
