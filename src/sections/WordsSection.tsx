import { css } from "@emotion/react";
import Section from "./Section";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Tile from "../components/Tile";
import WordRow from "../components/WordRow";
import { createSelector } from "@reduxjs/toolkit";
import { isArray, isEqual } from "lodash";
import { setWord } from "../redux/reducers/selection";

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
  const selectWords = (state: RootState) => state.data.words;
  const selectNGram = (state: RootState) => state.selection.ngram;
  const selectCurWord = (state: RootState) => state.selection.word;
  const curWord = useSelector(selectCurWord);
  const selectFilteredWords = createSelector(
    [selectWords, selectNGram, selectCurWord],
    (words, ngram, word) => {
      if (ngram) {
        if (!isArray(ngram)) {
          const newWords = words.filter((w) => w.word.includes(ngram));

          return newWords;
        }
      }
      return words;
    }
  );

  const filteredWords = useSelector(selectFilteredWords);

  return (
    <Section title="Words" style={{ flex: "0 1 auto" }}>
      <div css={wordsGrid}>
        {filteredWords.map((w) => (
          <Tile
            align="start"
            key={w.word.toString()}
            active={isEqual(curWord, w)}
            onClick={() => {
              if (!isEqual(curWord, w)) {
                dispatch(setWord(w));
              } else {
                dispatch(setWord(null));
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
