import { css } from "@emotion/react";

import { W, pad } from "../glyph";

import Glyph from "./Glyph";

const wordStyle = (width: number) => css`
  display: flex;
  flex-direction: row;
  padding-inline: ${(pad / W) * width}px;
  svg {
    overflow: visible;
  }
`;

interface WordProps {
  word: string[] | number[];
  width?: number;
  inline?: boolean;
}

function Word({ word, width = 20, inline = false }: WordProps) {
  return (
    <div css={wordStyle(width)} data-word={word} className="word">
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
