import { W, pad } from "../glyph";

import Glyph from "./Glyph";

interface TrunicWordProps {
  wordTrunes: number[];
  width?: number;
  inline?: boolean;
}

function TrunicWord({
  wordTrunes,
  width = 20,
  inline = false,
}: TrunicWordProps) {
  return (
    <div
      data-word={wordTrunes}
      className="word flex flex-row"
      style={{ paddingInline: `${(pad / W) * width}px` }}
    >
      {wordTrunes.map((t) => (
        <Glyph
          val={t}
          width={width}
          inWord={true}
          inline={inline}
          key={[t].join("_")}
        />
      ))}
    </div>
  );
}

export default TrunicWord;
