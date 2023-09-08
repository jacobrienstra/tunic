import { css } from "@emotion/react";
import Section from "./Section";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import Tile from "../components/Tile";
import WordRow from "../components/WordRow";
import { isEqual } from "lodash";
import {
  selectFilteredWords,
  selectSelectedWord,
  selectWordFilterDirection,
  setSelectedWord,
  setWordFilterDirection,
} from "../redux/reducers/selection";
import { getWordId } from "../redux/reducers/data";
import { cx } from "@emotion/css";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

const wordsGrid = css`
  padding: 8px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: minmax(80px, min-content);
  grid-auto-rows: min-content;
  flex: 0 1 auto;
  width: 100%;
  overflow-y: scroll;
`;

const filterDirectionSection = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  flex: 0 0 auto;
  margin: 4px 0;

  button {
    font-size: 16px;
    margin: 0 0 2px 2px;
  }
`;

function WordsSection() {
  const dispatch = useAppDispatch();
  const selectedWord = useAppSelector(selectSelectedWord);

  const filteredWords = useAppSelector(selectFilteredWords);
  const wordFilterDirection = useAppSelector(selectWordFilterDirection);

  return (
    <Section title="Words">
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: wordFilterDirection === "left" })}
          onClick={() => dispatch(setWordFilterDirection("left"))}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={cx({ active: wordFilterDirection === "off" })}
          onClick={() => dispatch(setWordFilterDirection("off"))}
        >
          Off
        </button>
        <button
          className={cx({ active: wordFilterDirection === "right" })}
          onClick={() => dispatch(setWordFilterDirection("right"))}
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <div css={wordsGrid}>
        {filteredWords.map((w) => (
          <Tile
            align="start"
            key={getWordId(w.word)}
            active={isEqual(selectedWord, w)}
            onClick={() => {
              if (!isEqual(selectedWord, w)) {
                dispatch(setSelectedWord(w));
              } else {
                dispatch(setSelectedWord(null));
              }
            }}
          >
            <WordRow wordData={w} />
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default WordsSection;
