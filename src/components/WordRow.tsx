import { css } from "@emotion/react";
import {
  WordData,
  setMeaningSave,
  toggleWordSureSave,
} from "../redux/reducers/data";
import Word from "./Word";
import InlineEdit from "./InlineEdit";
import store from "../redux/store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const iconStyle = css`
  align-self: start;
  justify-self: end;
  color: var(--green);
  margin-left: 8px;
`;

function WordRow({ wordData }: WordRowProps) {
  return (
    <div css={wordRowWrapper}>
      <div css={wordWrapper}>
        <Word word={wordData.word} />
        {wordData.sure ? (
          <CheckCircleIcon
            css={iconStyle}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              store.dispatch(toggleWordSureSave({ word: wordData.word }));
            }}
          />
        ) : (
          <CircleOutlinedIcon
            css={iconStyle}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              store.dispatch(toggleWordSureSave({ word: wordData.word }));
            }}
          />
        )}
      </div>
      <InlineEdit
        value={wordData.meaning}
        setValue={(val: string) =>
          store.dispatch(
            setMeaningSave({
              word: wordData.word,
              meaning: val,
            })
          )
        }
      />
    </div>
  );
}

export default WordRow;
