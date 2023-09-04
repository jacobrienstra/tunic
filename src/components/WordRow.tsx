import { css } from "@emotion/react";
import { WordData, setMeaning } from "../redux/reducers/data";
import { useDispatch } from "react-redux";
import Word from "./Word";
import InlineEdit from "./InlineEdit";
import { saveAction } from "../redux/store";

interface WordRowProps {
  wordData: WordData;
}

const wordRowWrapper = css`
  max-width: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  input {
    border-bottom: 1px solid var(--cyan-700);
    color: var(--cyan-900);
    text-align: start;
    width: 100%;
  }
`;

const wordWrapper = css`
  margin: 0px;
  flex: 1 0 auto;
`;

function WordRow({ wordData }: WordRowProps) {
  const dispatch = useDispatch();
  return (
    <div css={wordRowWrapper}>
      <div css={wordWrapper}>
        <Word word={wordData.word} />
      </div>
      <InlineEdit
        value={wordData.meaning}
        setValue={(val: string) =>
          saveAction(dispatch, setMeaning, {
            word: wordData.word,
            meaning: val,
          })
        }
      />
    </div>
  );
}

export default WordRow;
