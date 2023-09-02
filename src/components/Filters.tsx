import { css } from "@emotion/react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { cx } from "@emotion/css";
import { setLeftLineFilter } from "../redux/reducers/selection";
import { getLower, getUpper } from "../glyph";
import { uniq } from "lodash";
import Glyph from "./Glyph";

const filtersColumn = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 1 50%;
  height: 100%;
  border-right: 3px solid var(--slate-500);
`;

const filterToggles = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 0 0 auto;
`;

const filterLL = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: start;
  flex-wrap: wrap;

  button {
    margin: 4px;
  }
`;

const filterGlyphs = css`
  display: flex;
  flex-direction: row;
  align-items: start;
  align-content: stretch;
  width: 100%;
  /* height: 100%; */
  flex: 1 0 auto;
`;

const filterGlyphsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 1 1 50%;
  height: 100%;
`;

const filterGlyphsHeader = css`
  text-align: center;
  width: 100%;
`;

const glyphsColumn = css`
  padding: 8px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  grid-auto-rows: min-content;
  grid-gap: 4px;
  height: 100%;
`;

function Filters() {
  const dispatch = useDispatch();
  const leftLineFilter = useSelector(
    (state: RootState) => state.selection.filterLeftLine
  );

  const upperGlyphs = useSelector((state: RootState) => {
    return uniq(state.data.graphemes.map((g) => getUpper(g.id)));
  });

  const lowerGlyphs = useSelector((state: RootState) => {
    return uniq(state.data.graphemes.map((g) => getLower(g.id)));
  });

  return (
    <section css={filtersColumn}>
      <div css={filterToggles}>
        <h4>Filter By</h4>
        <div css={filterLL}>
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
      </div>
      <div css={filterGlyphs}>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Above</h4>
          <div
            css={glyphsColumn}
            style={{ borderRight: "3px solid var(--slate-500)" }}
          >
            {upperGlyphs.map((val) => (
              <Glyph val={val} key={val} />
            ))}
          </div>
        </div>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Below</h4>
          <div css={glyphsColumn}>
            {lowerGlyphs.map((val) => (
              <Glyph val={val} key={val} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Filters;
