import { glyphStrokes, W, ULV, LLV, LBC } from "../glyph";

type GlyphProps = {
  val: number;
  width?: number;
};

function Glyph({ width, val }: GlyphProps) {
  const lines: { x1: number; x2: number; y1: number; y2: number; k: number }[] =
    [];

  // Omit 5 because that's the circle, special case
  for (const i of [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11]) {
    if (val & (1 << i)) {
      lines.push({ ...glyphStrokes[1 << i], k: 1 << i });
    }
  }
  if (val & (1 << 12)) {
    lines.push({ ...ULV, k: 1 << 12 });
    lines.push({ ...LLV, k: 1 << 12 });
  }

  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`-5 -5 ${W + 10} 280`}
    >
      {lines.map((l) => {
        return (
          <line
            key={l.k + l.x1 + l.y1}
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...l}
          />
        );
      })}

      {val & 32 ? (
        <circle stroke="black" strokeWidth="10" {...LBC} fill="transparent" />
      ) : null}

      {/* Midline */}
      <line
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="0"
        x2={W}
        y1="125"
        y2="125"
      />
    </svg>
  );
}

export default Glyph;
