import type { SVGProps } from "react";

// SVG stroke-based icon set. NEVER use emojis anywhere in this app.
const P: Record<string, string> = {
  shield:
    "M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  scan: "M3 7V4a1 1 0 011-1h3M17 3h3a1 1 0 011 1v3M21 17v3a1 1 0 01-1 1h-3M7 21H4a1 1 0 01-1-1v-3M7 12h10",
  disk: "M4 4h13l3 3v13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zM7 4v5h9V4M12 14a3 3 0 100 6 3 3 0 000-6z",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  network:
    "M12 2v6M12 16v6M2 12h6M16 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3",
  brain:
    "M9 2a4 4 0 00-4 4v1a3 3 0 00-2 3 3 3 0 002 3 3 3 0 000 4 3 3 0 003 3 3 3 0 003 3h1V2H9zM15 2h-1v20h1a3 3 0 003-3 3 3 0 003-3 3 3 0 000-4 3 3 0 002-3 3 3 0 00-2-3V6a4 4 0 00-4-4z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M9 13h6M9 17h6",
  cog: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  play: "M5 3l14 9-14 9V3z",
  bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  usb: "M12 2l3 5h-2v9a2 2 0 002 2h1v-3l4 2-4 2v-1h-1a4 4 0 01-4-4V7H9l3-5zM7 15a2 2 0 100 4 2 2 0 000-4z",
  alert: "M12 2L2 22h20L12 2zM12 9v6M12 18v.5",
  key: "M21 2l-9.6 9.6M15 5l4 4M11.4 11.4a5 5 0 11-7.1 7.1 5 5 0 017.1-7.1z",
  chain: "M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.6 1.6M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.6-1.6",
  download: "M12 3v12M6 11l6 6 6-6M4 21h16",
  upload: "M12 21V9M6 13l6-6 6 6M4 3h16",
  copy: "M8 8h12v12H8zM4 4h12v4M4 4v12h4",
  x: "M18 6L6 18M6 6l12 12",
  check: "M4 12l6 6L20 6",
  chevron: "M9 18l6-6-6-6",
  eye: "M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  terminal: "M4 4h16v16H4zM7 8l4 4-4 4M13 16h5",
  registry: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14",
  refresh: "M3 12a9 9 0 0115.6-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.6 6.3L3 16M3 21v-5h5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8",
  bell: "M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2zM10 21a2 2 0 004 0",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  menu: "M3 6h18M3 12h18M3 18h18",
  panelLeft: "M3 4h18v16H3zM9 4v16",
  dot: "M12 12h.01",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 17a5 5 0 100-10 5 5 0 000 10z",
  moon: "M21 12.8A9 9 0 0111.2 3a7 7 0 109.8 9.8z",
};

export type IconName = keyof typeof P & string;
export const ICON_NAMES = Object.keys(P) as IconName[];

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName | string;
  size?: number;
}

export function Icon({ name, size = 18, className, ...rest }: IconProps) {
  const d = P[name as IconName];
  if (!d) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
