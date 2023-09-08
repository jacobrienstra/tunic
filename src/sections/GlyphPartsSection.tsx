import { css } from "@emotion/react";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectGlyphFilterDirection,
  selectConsonantFilter,
  selectConsonantGlyphs,
  selectVowelFilter,
  selectVowelGlyphs,
  setGlyphFilterDirection,
  setConsonantFilter,
  setVowelFilter,
} from "../redux/reducers/selection";

import Glyph from "../components/Glyph";
import Tile from "../components/Tile";
import FilterOptions from "./FilterOptions";
import { cx } from "@emotion/css";
import { getGraphemeSoundGuess } from "../glyph";

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

const filterDirectionSection = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  align-content: center;
  flex-wrap: wrap;
  flex: 0 0 auto;
  margin: 4px 0;

  button {
    font-size: 16px;
    margin: 0 0 2px 2px;
  }
`;

const soundGuess = css`
  color: var(--cyan-600);
  text-align: center;
`;

function Filters() {
  const dispatch = useAppDispatch();

  const vowelFilter = useAppSelector(selectVowelFilter);
  const consonantFilter = useAppSelector(selectConsonantFilter);

  const vowelGlyphs = useAppSelector(selectVowelGlyphs);
  const consonantGlyphs = useAppSelector(selectConsonantGlyphs);

  const glyphFilterDirection = useAppSelector(selectGlyphFilterDirection);

  const graphemes = useAppSelector((state) => state.data.graphemes.entities);

  return (
    <section css={glyphPartsSection}>
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: glyphFilterDirection === "off" })}
          onClick={() => dispatch(setGlyphFilterDirection("off"))}
        >
          Off
        </button>
        <button
          className={cx({ active: glyphFilterDirection === "right" })}
          onClick={() => dispatch(setGlyphFilterDirection("right"))}
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <FilterOptions />
      <div css={filterGlyphsWrapper}>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Vowels</h4>
          <div
            css={glyphsGrid}
            style={{ borderRight: "2px solid var(--slate-500)" }}
          >
            {vowelGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={vowelFilter === val}
                onClick={() => {
                  if (vowelFilter !== val) {
                    dispatch(setVowelFilter(val));
                  } else dispatch(setVowelFilter(null));
                }}
              >
                <Glyph val={val} />
                <div css={soundGuess}>
                  {getGraphemeSoundGuess(val, graphemes)}
                </div>
              </Tile>
            ))}
          </div>
        </div>
        <div css={filterGlyphsColumn}>
          <h4 css={filterGlyphsHeader}>Consonants</h4>
          <div css={glyphsGrid}>
            {consonantGlyphs.map((val) => (
              <Tile
                size={tileSize}
                key={val}
                active={consonantFilter === val}
                onClick={() => {
                  if (consonantFilter !== val) {
                    dispatch(setConsonantFilter(val));
                  } else dispatch(setConsonantFilter(null));
                }}
              >
                <Glyph val={val} />
                <div css={soundGuess}>
                  {getGraphemeSoundGuess(val, graphemes)}
                </div>
              </Tile>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Filters;
