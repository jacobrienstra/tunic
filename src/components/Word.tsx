import { css } from "@emotion/react";
import Glyph from "./Glyph";

const wordStyle = css`
  display: flex;
  flex-direction: row;
  /* padding: 8px; */
  svg:not(:first-of-type) {
    /* margin-left: -1.7px; */
  }

  svg:not(:last-child) {
    border-right: 1px dotted var(--slate-300);
  }
`;

interface WordProps {
  word: number[];
  width?: number;
}

function Word({ word, width = 20 }: WordProps) {
  return (
    <div css={wordStyle}>
      {word.map((w) => (
        <Glyph val={w} width={width} key={w} />
      ))}
    </div>
  );
}

export default Word;