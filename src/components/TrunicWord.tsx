import {
  W,
  H,
  pad,
  BC,
  BCK,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
} from "../glyph";

import { glyphSymbolId, computeGlyphLines } from "./GlyphDefs";

interface TrunicWordProps {
  wordTrunes: number[];
  width?: number;
  inline?: boolean;
}

// One <svg> per word: each glyph is offset by x = i * W within a single
// viewport, rather than wrapping every glyph in its own <svg>.
function TrunicWord({
  wordTrunes,
  width = 20,
  inline = false,
}: TrunicWordProps) {
  const n = wordTrunes.length;
  return (
    <div
      data-word={wordTrunes}
      className="word"
      style={{ paddingInline: `${(pad / W) * width}px` }}
    >
      {n > 0 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width={width * n}
          viewBox={`0 ${-pad} ${W * n} ${H + pad * 2}`}
          className="overflow-visible"
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
