import { memo } from "react";

import {
  glyphStrokes,
  LVK,
  ULV,
  LLV,
  BC,
  BCK,
  GlyphLine,
  Midline,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  tightViewBox,
} from "../glyph";
import { useGraphemes } from "../data/queries";

export function computeGlyphLines(val: number): GlyphLine[] {
  const lines: GlyphLine[] = [];
  for (const i of Array(10).keys()) {
    if (val & (1 << i)) lines.push(glyphStrokes[1 << i]);
  }
  if (val & LVK) {
    lines.push(ULV);
    lines.push(LLV);
  }
  lines.push(Midline);
  return lines;
}

export const glyphSymbolId = (val: number) => `glyph-${val}`;

function GlyphSymbol({ val }: { val: number }) {
  const lines = computeGlyphLines(val);
  return (
    <symbol
      id={glyphSymbolId(val)}
      viewBox={tightViewBox}
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    >
      {lines.map((l, i) => (
        <line className="stroke-black" {...l} key={i} />
      ))}
      {val & BCK ? (
        <circle {...BC} className="fill-transparent stroke-black" />
      ) : null}
    </symbol>
  );
}

const MemoGlyphSymbol = memo(GlyphSymbol);

function GlyphDefs() {
  const graphemes = useGraphemes();
  if (!graphemes) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute h-0 w-0"
      aria-hidden
    >
      <defs>
        {graphemes.map((g) => (
          <MemoGlyphSymbol key={g.id} val={g.id} />
        ))}
      </defs>
    </svg>
  );
}

export default GlyphDefs;
