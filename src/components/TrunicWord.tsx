import { glyphSymbolId, computeGlyphLines } from "./Glyph";

import { cn } from "@/lib/utils";
import {
  W,
  H,
  pad,
  BC,
  BCK,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
} from "@/glyph";
import { wordKeyFromTruneIds } from "@/data/store";

interface TrunicWordProps {
  wordTrunes: number[];
  width?: number;
  inline?: boolean;
}

// One <svg> per word: each glyph is offset by x = i * W within a single
// viewport, rather than wrapping every glyph in its own <svg>.
function TrunicWord({ wordTrunes, inline = false }: TrunicWordProps) {
  const n = wordTrunes.length;
  return (
    <div
      data-word={wordKeyFromTruneIds(wordTrunes)}
      style={{ paddingInline: `${pad / W}%` }}
      className={cn("overflow-visible")}
    >
      {n > 0 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{ width: `calc(var(--glyph-size)*${n})` }}
          viewBox={`0 ${-pad} ${W * n} ${H + pad * 2}`}
          className={cn("overflow-visible")}
          {...(inline ? { strokeWidth, strokeLinecap, strokeLinejoin } : null)}
        >
          {wordTrunes.map((t, i) =>
            inline ? (
              <g key={`${t}_${i}`} transform={`translate(${i * W},0)`}>
                {computeGlyphLines(t).map((l, j) => (
                  <line className="stroke-black" {...l} key={j} />
                ))}
                {t & BCK ? (
                  <circle {...BC} className="[fill:transparent] stroke-black" />
                ) : null}
              </g>
            ) : (
              <use
                key={`${t}_${i}`}
                href={`#${glyphSymbolId(t)}`}
                x={i * W}
                width={W}
                height={H}
              />
            )
          )}
        </svg>
      ) : null}
    </div>
  );
}

export default TrunicWord;
