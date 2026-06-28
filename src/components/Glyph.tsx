import { memo } from "react";

import {
  W,
  H,
  BC,
  BCK,
  paddedViewBox,
  scriptViewBox,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
} from "../glyph";

import { glyphSymbolId, computeGlyphLines } from "./GlyphDefs";

interface GlyphProps {
  val: number | string;
  width?: number;
  inWord?: boolean;
  inline?: boolean;
}

function Glyph({ width, val, inWord = false, inline = false }: GlyphProps) {
  const id = typeof val === "string" ? parseInt(val) : val;
  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={inWord ? scriptViewBox : paddedViewBox}
      {...(inline ? { strokeWidth, strokeLinecap, strokeLinejoin } : null)}
    >
      {inline ? (
        <>
          {computeGlyphLines(id).map((l, i) => (
            <line className="stroke-black" {...l} key={i} />
          ))}
          {id & BCK ? (
            <circle {...BC} className="[fill:transparent] stroke-black" />
          ) : null}
        </>
      ) : (
        <use href={`#${glyphSymbolId(id)}`} width={W} height={H} />
      )}
    </svg>
  );
}

export default memo(Glyph);
