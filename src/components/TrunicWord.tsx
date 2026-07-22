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
import { useDerivedMeaning } from "@/data/ruleset";

interface TrunicWordProps {
  wordTrunes: number[];
  inline?: boolean;
  withMeaning?: boolean;
  className?: string;
}

// One <svg> per word: each glyph is offset by x = i * W within a single
// viewport, rather than wrapping every glyph in its own <svg>.
function TrunicWord({
  wordTrunes,
  inline = false,
  withMeaning = false,
  className = "",
}: TrunicWordProps) {
  const n = wordTrunes.length;
  const derivedMeaning = useDerivedMeaning();
  return (
    <div
      data-word={wordKeyFromTruneIds(wordTrunes)}
      style={{
        marginInline: `calc(var(--glyph-size) * ${pad / W})`,
        minHeight: `calc(var(--glyph-size) * ${(H + pad * 2) / W})`,
      }}
      className={cn("flex flex-col items-center overflow-visible", className)}
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
                  <circle {...BC} className="fill-transparent stroke-black" />
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
      {withMeaning ? (
        <span className="text-sky-500">
          {wordTrunes.map((w) => derivedMeaning(w)).join("")}
        </span>
      ) : null}
    </div>
  );
}

export default TrunicWord;
