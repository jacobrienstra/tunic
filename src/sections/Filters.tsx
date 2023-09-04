import { css } from "@emotion/react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { cx } from "@emotion/css";
import {
  setLeftLineFilter,
  setLowerFilter,
  setUpperFilter,
  toggleExclusive,
  togglePartialFilter,
} from "../redux/reducers/selection";
import { getLower, getUpper } from "../glyph";
import { uniq } from "lodash";
import Glyph from "../components/Glyph";
import Tile from "../components/Tile";
import { createSelector } from "@reduxjs/toolkit";

const tileSize = 35;

const filtersColumn = css`
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

const filterToggles = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 0 auto;
`;

const filterOption = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  flex: 1 0 auto;

  button {
    margin: 0 0 2px 2px;
  }
`;

const toggleBox = css`
  cursor: pointer;
  padding: 4px;
`;

const filterGlyphs = css`
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
  const leftLineFilter = useSelector(
    (state: RootState) => state.selection.filterLeftLine
  );
  const upperFilter = useSelector(
    (state: RootState) => state.selection.filterUpper
  );
  const lowerFilter = useSelector(
    (state: RootState) => state.selection.filterLower
  );

  const partial = useSelector((state: RootState) => state.selection.partial);
  const exclusive = useSelector(
    (state: RootState) => state.selection.exclusive
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
    <section css={filtersColumn}>
      <div css={filterToggles}>
        <h4>Filter By</h4>
        <div css={filterOption}>
          <span>Left Line Present?</span>
          <button
            className={cx({ active: leftLineFilter === "present" })}
            onClick={() => dispatch(setLeftLineFilter("present"))}
          >
            Yes
            {leftLineFilter === "present" ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </button>
          <button
            className={cx({ active: leftLineFilter === "absent" })}
            onClick={() => dispatch(setLeftLineFilter("absent"))}
          >
            No
            {leftLineFilter === "absent" ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </button>
          <button
            className={cx({ active: leftLineFilter === "either" })}
            onClick={() => dispatch(setLeftLineFilter("either"))}
          >
            Either
            {leftLineFilter === "either" ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </button>
        </div>
        <div css={filterOption}>
          <span>Partial Match</span>
          {partial ? (
            <CheckBoxIcon
              fontSize="large"
              css={toggleBox}
              onClick={() => dispatch(togglePartialFilter())}
            />
          ) : (
            <CheckBoxOutlineBlankIcon
              fontSize="large"
              css={toggleBox}
              onClick={() => dispatch(togglePartialFilter())}
            />
          )}
        </div>
        <div css={filterOption}>
          <span>Logical Operator</span>
          {exclusive ? (
            <>
              <CheckBoxIcon
                fontSize="large"
                css={toggleBox}
                onClick={() => dispatch(toggleExclusive())}
              />{" "}
              <strong>AND</strong>
            </>
          ) : (
            <>
              <CheckBoxOutlineBlankIcon
                fontSize="large"
                css={toggleBox}
                onClick={() => dispatch(toggleExclusive())}
              />
              <strong>OR</strong>
            </>
          )}
        </div>
      </div>
      <div css={filterGlyphs}>
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