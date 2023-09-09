import { css } from "@emotion/react";
import {
  WordData,
  useGetGraphemesQuery,
  useUpdateWordMutation,
} from "../redux/services/data";
import Word from "./Word";
import InlineEdit from "./InlineEdit";
import { getGraphemeSoundGuess } from "../glyph";

interface WordRowProps {
  wordData: WordData;
}

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

function WordRow({ wordData }: WordRowProps) {
  const [updateWord] = useUpdateWordMutation();
  const { data: graphemes } = useGetGraphemesQuery();
  return (
    <div css={wordRowWrapper}>
      <div css={wordWrapper}>
        <Word word={wordData.word} />
      </div>
      <div css={wordGuess}>
        {wordData.word
          .map((val) => {
            const ival = parseInt(val);
            let sound = graphemes?.find((g) => g.id === ival)?.sound;
            if (sound === "" || sound === undefined) {
              sound = getGraphemeSoundGuess(ival, graphemes);
            }
            return sound.replace("?", "");
          })
          .join("")}
      </div>
      <InlineEdit
        value={wordData.meaning}
        setValue={(val: string) =>
          updateWord({
            id: wordData.id,
            word: wordData.word,
            meaning: val,
          })
        }
      />
    </div>
  );
}

export default WordRow;
