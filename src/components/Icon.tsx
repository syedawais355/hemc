const ICONS: Record<string, string[]> = {
  leaf: ["M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z", "M2 21c0-3 1.85-5.36 5.08-6"],
  search: ["M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", "M20 20l-3.2-3.2"],
  sun: ["M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"],
  moon: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  bag: ["M6 2 3 6v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6l-3-4Z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z"],
  star: ["m12 2 2.9 6.3 6.8.8-5 4.6 1.3 6.7L12 18l-6 3.4 1.3-6.7-5-4.6 6.8-.8Z"],
  back: ["M19 12H5", "M12 19l-7-7 7-7"],
  arrow: ["M5 12h14", "M12 5l7 7-7 7"],
  trash: ["M4 7h16", "M10 11v6M14 11v6", "M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13", "M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"],
  user: ["M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "M4 21c0-4 3.6-6 8-6s8 2 8 6"],
  menu: ["M4 6h16M4 12h16M4 18h16"],
  check: ["M20 6 9 17l-5-5"],
  shield: ["M20 13c0 5-3.5 7.5-7.7 8.95a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z", "M9 12l2 2 4-4"],
  truck: ["M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1", "M14 9h4l3 3v5a1 1 0 0 1-1 1h-1", "M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"],
  lock: ["M4 11h16v10H4z", "M8 11V7a4 4 0 0 1 8 0v4"],
  box: ["M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z", "M3.3 7l8.7 5 8.7-5", "M12 22V12"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  grid: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"],
  tag: ["M3 7v5l9 9 5-5-9-9z", "M7.5 7.5h.01"],
  dna: ["m10.5 20.5-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z", "m8.5 8.5 7 7"],
  droplet: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z"],
};

interface Props {
  name: string;
  size?: number;
  width?: number;
  fill?: string;
  className?: string;
}

export function Icon({ name, size = 20, width = 2, fill = "none", className }: Props) {
  const paths = ICONS[name] ?? [];
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
