import { memo } from "react";
import { css } from "@emotion/react";

import { getGraphemeSoundGuess } from "../glyph";
import { useGraphemes } from "../data/queries";
import { updateGrapheme } from "../data/mutations";
import { Grapheme as GraphemeShape } from "../data/db";

import InlineEdit from "./InlineEdit";
import Glyph from "./Glyph";

const graphemeWrapper = css`
  max-width: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  input {
    border-bottom: 1px solid var(--cyan-700);
    color: var(--cyan-900);
  }
`;

const glyphWrapper = css`
  margin: 0px 17%;
  flex: 1 0 auto;
`;

const soundGuess = css`
  color: var(--cyan-600);
  text-align: center;
`;

function Grapheme({ id, meaning }: GraphemeShape) {
  const graphemes = useGraphemes();
  return (
    <div css={graphemeWrapper}>
      <div css={glyphWrapper}>
        <Glyph val={id} />
      </div>
      <div css={soundGuess}>{getGraphemeSoundGuess(id, graphemes)}</div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateGrapheme(id, { meaning: val }).catch(console.error);
        }}
      />
    </div>
  );
}

export default memo(Grapheme);
