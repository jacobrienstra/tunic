import { css } from "@emotion/react";
import { cx } from "@emotion/css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setN, setNGram } from "../redux/reducers/selection";
import { createSelector } from "@reduxjs/toolkit";
import Grapheme from "../components/Grapheme";
import Tile from "../components/Tile";
import { ULVK, getLower, getUpper } from "../glyph";

const ngramsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min-content;
  flex: 1 1 50%;
  padding: 0 8px;

  span {
    user-select: none;
  }
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

const tileSize = 60;
const ngramsGrid = css`
  padding: 4px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${tileSize}px, 100px));
  grid-auto-rows: min-content;
  flex: 0 1 auto;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`;

function NGrams() {
  const dispatch = useDispatch();

  const selectUpperFilter = (state: RootState) => state.selection.filterUpper;
  const selectLowerFilter = (state: RootState) => state.selection.filterLower;
  const selectLeftLineFilter = (state: RootState) =>
    state.selection.filterLeftLine;
  const selectPartial = (state: RootState) => state.selection.partial;
  const selectExclusive = (state: RootState) => state.selection.exclusive;

  const selectGraphemes = (state: RootState) => state.data.graphemes;
  const selectN = (state: RootState) => state.selection.n;
  const selectNGram = (state: RootState) => state.selection.ngram;
  const selectNgrams = createSelector(
    [
      selectGraphemes,
      selectN,
      selectNGram,
      selectUpperFilter,
      selectLowerFilter,
      selectLeftLineFilter,
      selectPartial,
      selectExclusive,
    ],
    (
      graphemes,
      n,
      ngram,
      upperFilter,
      lowerFilter,
      leftLineFilter,
      partial,
      exclusive
    ) => {
      if (n === 1) {
        const filteredGraphemes = graphemes.filter((gd) => {
          let matchesUpper = null;
          let matchesLower = null;
          if (upperFilter != null) {
            matchesUpper = false;
            if (partial) {
              // contains glyph (partial match)
              matchesUpper =
                (getUpper(gd.id) | upperFilter) === getUpper(gd.id);
            } else {
              // exact match
              matchesUpper = getUpper(gd.id) === upperFilter;
            }
          }
          if (lowerFilter != null) {
            matchesLower = false;
            if (partial) {
              // contains glyph (partial match)
              matchesLower =
                (getLower(gd.id) | lowerFilter) === getLower(gd.id);
            } else {
              // exact match
              matchesLower = getLower(gd.id) === upperFilter;
            }
          }
          let leftLinePass = true;
          if (leftLineFilter === "present") {
            leftLinePass = (gd.id | ULVK) === gd.id;
          } else if (leftLineFilter === "absent") {
            leftLinePass = (gd.id | ULVK) !== gd.id;
          }
          if (exclusive) {
            return (
              leftLinePass && matchesLower !== false && matchesUpper !== false
            );
          } else {
            return (
              leftLinePass &&
              ((matchesLower === true && matchesUpper === null) ||
                (matchesLower === null && matchesUpper === true) ||
                (matchesLower === null && matchesUpper === null) ||
                matchesLower === true ||
                matchesUpper === true)
            );
          }
        });
        return filteredGraphemes;
      }
      return graphemes;
    }
  );
  const curN = useSelector(selectN);
  const ngrams = useSelector(selectNgrams);
  const curNGram = useSelector(selectNGram);

  return (
    <section css={ngramsColumn}>
      <h4 css={nGramHeader}>NGrams</h4>
      <div css={nGramSize}>
        <span>Size (n)</span>
        {[1, 2, 3, 4].map((num) => {
          return (
            <button
              className={cx({ active: curN === num })}
              key={num}
              onClick={() => dispatch(setN(num))}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div css={ngramsGrid}>
        {ngrams.map((ng) => (
          <Tile
            size={tileSize}
            key={ng.id}
            active={curNGram === ng.id}
            onClick={() => {
              if (curNGram !== ng.id) {
                dispatch(setNGram(ng.id));
              } else {
                dispatch(setNGram(null));
              }
            }}
          >
            <Grapheme glyph={ng} />
          </Tile>
        ))}
      </div>
    </section>
  );
}

export default NGrams;
