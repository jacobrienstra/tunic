import { css } from "@emotion/react";

import Glyph from "./Glyph";

const wordStyle = css`
  display: flex;
  flex-direction: row;
  /* padding: 8px; */
  svg:not(:first-of-type) {
    margin-left: -1.7%;
  }

  svg:not(:last-child) {
    border-right: 1px dotted var(--slate-300);
  }
`;

interface WordProps {
  word: string[] | number[];
  width?: number;
}

function Word({ word, width = 20 }: WordProps) {
  return (
    <div css={wordStyle} data-word={word} className="word">
      {word.map((w, i) => (
        <Glyph val={w} width={width} key={[w, i].join("_")} />
      ))}
    </div>
  );
}

export default Word;
