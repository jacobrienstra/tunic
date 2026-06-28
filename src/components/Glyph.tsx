import { memo } from "react";

import { W, H, paddedViewBox, scriptViewBox } from "../glyph";

import { glyphSymbolId } from "./GlyphDefs";

interface GlyphProps {
  val: number | string;
  width?: number;
  inWord?: boolean;
}

function Glyph({ width, val, inWord = false }: GlyphProps) {
  const id = typeof val === "string" ? parseInt(val) : val;
  return (
    <svg
      width={width ?? "100%"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={inWord ? scriptViewBox : paddedViewBox}
    >
      <use href={`#${glyphSymbolId(id)}`} width={W} height={H} />
    </svg>
  );
}

export default memo(Glyph);
