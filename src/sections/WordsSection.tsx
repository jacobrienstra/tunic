import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { css } from "@emotion/react";
import { cx } from "@emotion/css";

import {
  selectFilteredWords,
  selectSelectedWord,
  selectWordFilterDirection,
} from "../selectors";
import {
  useGetContextWordJunctionsQuery,
  useGetWordsQuery,
} from "../redux/services/data";
import {
  setSelectedWord,
  setWordFilterDirection,
} from "../redux/reducers/selection";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import WordRow from "../components/WordRow";
import Tile from "../components/Tile";

import Section from "./Section";

const wordsGrid = css`
  padding: 8px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

  const { data: words } = useGetWordsQuery();
  const { data: junctions } = useGetContextWordJunctionsQuery();

  const filteredWords = useAppSelector(
    selectFilteredWords(
      () => words,
      () => junctions
    )
  );
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
        {filteredWords.map((w, i) => (
          <Tile
            align="start"
            key={[w.id, i].join("_")}
            active={selectedWord === w.id}
            onClick={() => {
              if (selectedWord !== w.id) {
                dispatch(setSelectedWord(w.id));
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
