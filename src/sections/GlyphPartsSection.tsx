import { css } from "@emotion/react";

import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setLowerFilter, setUpperFilter } from "../redux/reducers/selection";
import { getLower, getUpper } from "../glyph";
import { uniq } from "lodash";
import Glyph from "../components/Glyph";
import Tile from "../components/Tile";
import { createSelector } from "@reduxjs/toolkit";
import FilterOptions from "./FilterOptions";

const tileSize = 35;

const glyphPartsSection = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 0 50%;
  padding: 0 8px;
  border-right: 3px solid var(--slate-500);

  span,
  strong {
    user-select: none;
  }
`;

const filterGlyphsWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1 1 auto;
`;

const filterGlyphsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 0 50%;
`;

const filterGlyphsHeader = css`
  text-align: center;
  width: 100%;
  flex: 0 0 auto;
`;

const glyphsGrid = css`
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${tileSize}px, 1fr));
  grid-auto-rows: min-content;
  grid-gap: 0;
  flex: 1 1 auto;
  overflow-y: scroll;
`;

function Filters() {
  const dispatch = useDispatch();

  const upperFilter = useSelector(
    (state: RootState) => state.selection.filterUpper
  );
  const lowerFilter = useSelector(
    (state: RootState) => state.selection.filterLower
  );

  const selectGraphemes = (state: RootState) => state.data.graphemes;
  const selectUpperGlyphs = createSelector([selectGraphemes], (graphemes) => {
    return uniq(graphemes.map((g) => getUpper(g.id)));
  });
  const upperGlyphs = useSelector(selectUpperGlyphs);

  const selectLowerGlyphs = createSelector([selectGraphemes], (graphemes) => {
    return uniq(graphemes.map((g) => getLower(g.id)));
  });
  const lowerGlyphs = useSelector(selectLowerGlyphs);

  return (
    <section css={glyphPartsSection}>
      <FilterOptions />
      <div css={filterGlyphsWrapper}>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Above</h4>
          <div
            css={glyphsGrid}
            style={{ borderRight: "2px solid var(--slate-500)" }}
          >
            {upperGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={upperFilter === val}
                onClick={() => {
                  if (upperFilter !== val) {
                    dispatch(setUpperFilter(val));
                  } else dispatch(setUpperFilter(null));
                }}
              >
                <Glyph val={val} />
              </Tile>
            ))}
          </div>
        </div>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Below</h4>
          <div css={glyphsGrid}>
            {lowerGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={lowerFilter === val}
                onClick={() => {
                  if (lowerFilter !== val) {
                    dispatch(setLowerFilter(val));
                  } else dispatch(setLowerFilter(null));
                }}
              >
                <Glyph val={val} />
              </Tile>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Filters;
