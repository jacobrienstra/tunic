import {
  glyphStrokes,
  H,
  W,
  LVK,
  ULV,
  LLV,
  BC,
  BCK,
  GlyphLine,
  Midline,
} from "../glyph";

type GlyphProps = {
  val: number | string;
  width?: number;
};

function Glyph({ width, val }: GlyphProps) {
  if (typeof val === "string") val = parseInt(val);
  const lines: GlyphLine[] = [];

  for (const i of Array(10).keys()) {
    if (val & (1 << i)) {
      lines.push({ ...glyphStrokes[1 << i] });
    }
  }
  if (val & LVK) {
    lines.push({ ...ULV });
    lines.push({ ...LLV });
  }

  lines.push({ ...Midline });

  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`-5 -5 ${W + 10} ${H}`}
    >
      {lines.map((l, i) => {
        return (
          <line
            className="stroke-black stroke-10 [stroke-linecap:round] [stroke-linejoin:round]"
            {...l}
            key={i} // TODO use a better key
          />
        );
      })}

      {val & BCK ? (
        <circle {...BC} className="[fill:transparent] stroke-black stroke-10" />
      ) : null}
    </svg>
  );
}

export default Glyph;
