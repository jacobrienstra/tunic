import { memo } from "react";
import { css } from "@emotion/react";

import { getGraphemeSoundGuess } from "../glyph";
import { useGraphemes } from "../data/queries";
import { updateWord } from "../data/mutations";
import { Word as WordData } from "../data/db";

import Word from "./Word";
import InlineEdit from "./InlineEdit";

const wordRowWrapper = css`
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: min-content;

  input {
    border-bottom: 1px solid var(--cyan-700);
    color: var(--cyan-900);
    text-align: start;
    width: 100%;
    min-width: min-content;
  }
`;

const wordWrapper = css`
  margin: 0px;
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const wordGuess = css`
  color: var(--cyan-600);
`;

function WordRow({ glyphs, meaning, id }: WordData) {
  const graphemes = useGraphemes();
  return (
    <div css={wordRowWrapper}>
      <div css={wordWrapper}>
        <Word word={glyphs} />
      </div>
      <div css={wordGuess}>
        {glyphs
          .map((val) => {
            const ival = parseInt(val);
            let meaning = graphemes?.find((g) => g.id === ival)?.meaning;
            if (meaning === "" || meaning === undefined) {
              meaning = getGraphemeSoundGuess(ival, graphemes);
            }
            return meaning.replace("?", "");
          })
          .join("")}
      </div>
      <InlineEdit
        value={meaning ?? ""}
        setValue={(val: string) => {
          updateWord(id, {
            glyphs: glyphs,
            meaning: val,
          }).catch(console.error);
        }}
      />
    </div>
  );
}

export default memo(WordRow);
