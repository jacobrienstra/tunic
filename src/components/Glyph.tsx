import { memo } from "react";

import { cn } from "@/lib/utils";
import {
  glyphStrokes,
  LVK,
  ULV,
  LLV,
  BC,
  BCK,
  W,
  H,
  pad,
  GlyphLine,
  Midline,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  tightViewBox,
  paddedViewBox,
} from "@/glyph";
import { useTruneIds, useTrunes } from "@/data/store";
import { useDerivedMeaning } from "@/data/ruleset";

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
      className="overflow-visible stroke-(--subset-color)"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    >
      {lines.map((l, i) => (
        <line {...l} key={i} />
      ))}
      {val & BCK ? <circle {...BC} className="fill-transparent" /> : null}
    </symbol>
  );
}

interface GlyphProps {
  val: number;
  inline?: boolean;
  withMeaning?: boolean;
  className?: string;
}

function Glyph({
  val,
  inline = false,
  withMeaning = false,
  className = "",
}: GlyphProps) {
  const derivedMeaning = useDerivedMeaning();

  return (
    <div
      data-trune={val}
      style={{
        marginInline: `calc(var(--glyph-size) * ${pad / W})`,
        minHeight: `calc(var(--glyph-size) * ${(H + pad * 2) / W})`,
      }}
      className={cn("flex flex-col items-center overflow-visible", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={paddedViewBox}
        className={cn(
          "w-(--glyph-size) overflow-visible stroke-(--subset-color)",
          className
        )}
        {...(inline ? { strokeWidth, strokeLinecap, strokeLinejoin } : null)}
      >
        {inline ? (
          <>
            {computeGlyphLines(val).map((l, i) => (
              <line {...l} key={i} />
            ))}
            {val & BCK ? <circle {...BC} className="fill-transparent" /> : null}
          </>
        ) : (
          <use href={`#${glyphSymbolId(val)}`} width={W} height={H} />
        )}
      </svg>
      {withMeaning ? (
        <span className="text-sky-500">{derivedMeaning(val)}</span>
      ) : null}
    </div>
  );
}

const MemoGlyphSymbol = memo(GlyphSymbol);

function GlyphDefs() {
  const { data: truneIds } = useTruneIds();
  if (!truneIds) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute h-0 w-0"
      aria-hidden
    >
      <defs>
        {truneIds.map((g) => (
          <MemoGlyphSymbol key={g.id} val={g.id} />
        ))}
      </defs>
    </svg>
  );
}

export { Glyph, GlyphDefs };
