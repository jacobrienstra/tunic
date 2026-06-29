import { W, pad } from "../glyph";

import Glyph from "./Glyph";

interface WordProps {
  word: string[] | number[];
  width?: number;
  inline?: boolean;
}

function Word({ word, width = 20, inline = false }: WordProps) {
  return (
    <div
      data-word={word}
      className="word flex flex-row"
      style={{ paddingInline: `${(pad / W) * width}px` }}
    >
      {word.map((w, i) => (
        <Glyph
          val={w}
          width={width}
          inWord={true}
          inline={inline}
          key={[w, i].join("_")}
        />
      ))}
    </div>
  );
}

export default Word;
