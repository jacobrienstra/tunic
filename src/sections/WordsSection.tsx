import { css } from "@emotion/react";
import Section from "./Section";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Tile from "../components/Tile";
import WordRow from "../components/WordRow";
import { isEqual } from "lodash";
import {
  selectFilteredWords,
  setSelectedWord,
} from "../redux/reducers/selection";

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

function WordsSection() {
  const dispatch = useDispatch();
  const selectSelectedWord = (state: RootState) => state.selection.selectedWord;
  const selectedWord = useSelector(selectSelectedWord);

  const filteredWords = useSelector(selectFilteredWords);

  return (
    <Section title="Words">
      <div css={wordsGrid}>
        {filteredWords.map((w) => (
          <Tile
            align="start"
            key={w.word.toString()}
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
