import { css } from "@emotion/react";
import {
  WordData,
  setMeaningSave,
  toggleWordSureSave,
} from "../redux/reducers/data";
import Word from "./Word";
import InlineEdit from "./InlineEdit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getGraphemeSoundGuess } from "../glyph";

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

const wordGuess = css`
  color: var(--cyan-600);
`;

const iconStyle = css`
  align-self: start;
  justify-self: end;
  color: var(--green);
  margin-left: 8px;
`;

function WordRow({ wordData }: WordRowProps) {
  const dispatch = useAppDispatch();
  const graphemes = useAppSelector((state) => state.data.graphemes.entities);

  return (
    <div css={wordRowWrapper}>
      <div css={wordWrapper}>
        <Word word={wordData.word} />
        {wordData.sure ? (
          <CheckCircleIcon
            css={iconStyle}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              dispatch(toggleWordSureSave({ word: wordData.word }));
            }}
          />
        ) : (
          <CircleOutlinedIcon
            css={iconStyle}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              dispatch(toggleWordSureSave({ word: wordData.word }));
            }}
          />
        )}
      </div>
      <div css={wordGuess}>
        {wordData.word.map((val) => {
          let sound = graphemes[val].sound;
          if (sound === "" || sound === undefined) {
            return getGraphemeSoundGuess(graphemes[val].id, graphemes);
          }
          return sound.replace("?", "");
        })}
      </div>
      <InlineEdit
        value={wordData.meaning}
        setValue={(val: string) =>
          dispatch(
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
