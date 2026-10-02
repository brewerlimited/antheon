type IconName = "star" | "arrow-up-right" | "arrow-down" | "arrow-up" | "arrow-left" | "arrow-right" | "plus" | "close";

const paths: Record<IconName, string> = {
  star: "M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93",
  "arrow-up-right": "M5 19L19 5M5 5h14v14",
  "arrow-down": "M12 3v18M5 14l7 7 7-7",
  "arrow-up": "M12 21V3M5 10l7-7 7 7",
  "arrow-left": "M21 12H3M10 5l-7 7 7 7",
  "arrow-right": "M3 12h18M14 5l7 7-7 7",
  plus: "M12 4v16M4 12h16",
  close: "M5 5l14 14M5 19L19 5",
};

/** Decorative geometry, independent of platform fonts and emoji substitution. */
export function VectorIcon({ name }: { name: IconName }) {
  return <svg className="vector-icon" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
