import { css } from "@emotion/react";
import { cx } from "@emotion/css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setN } from "../redux/reducers/selection";
import { createSelector } from "@reduxjs/toolkit";
import Grapheme from "./Grapheme";
import Tile from "./Tile";

const ngramsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min-content;
  flex: 1 1 50%;
  padding: 0 8px;
`;

const nGramHeader = css`
  flex: 0 0 auto;
`;

const nGramSize = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: start;
  flex-wrap: wrap;
  flex: 0 0 auto;

  button {
    margin: 2px;
  }
`;

const tileSize = 50;
const ngramsGrid = css`
  padding: 4px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${tileSize}px, 1fr));
  grid-auto-rows: min-content;
  flex: 0 1 auto;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`;

function NGrams() {
  const dispatch = useDispatch();

  const selectGraphemes = (state: RootState) => state.data.graphemes;
  const selectN = (state: RootState) => state.selection.n;
  const selectNgrams = createSelector(
    [selectGraphemes, selectN],
    (graphemes, n) => {
      return graphemes;
    }
  );
  const n = useSelector(selectN);
  const ngrams = useSelector(selectNgrams);

  return (
    <section css={ngramsColumn}>
      <h4 css={nGramHeader}>NGrams</h4>
      <div css={nGramSize}>
        <span>Size (n)</span>
        {[1, 2, 3, 4].map((num) => {
          return (
            <button
              className={cx({ active: n === num })}
              key={num}
              onClick={() => dispatch(setN(num))}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div css={ngramsGrid}>
        {ngrams.map((ngram) => (
          <Tile size={tileSize} key={ngram.id}>
            <Grapheme glyph={ngram} />
          </Tile>
        ))}
      </div>
    </section>
  );
}

export default NGrams;
