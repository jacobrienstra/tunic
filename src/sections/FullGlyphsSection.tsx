import { css } from "@emotion/react";
import { cx } from "@emotion/css";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import {
  setGraphemeFilterDirection,
  setMode,
  setN,
} from "../redux/reducers/selection";
import Graphemes from "./Graphemes";
import NGrams from "./NGrams";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

const fullGlyphsSection = css`
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

const headerSwitcher = css`
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  padding: 8px;
  font-size: 12px;

  button:not(:last-child) {
    margin-right: 8px;
  }
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

function FullGlyphsSection() {
  const dispatch = useAppDispatch();

  const selectN = (state: RootState) => state.selection.n;
  const selectedN = useAppSelector(selectN);

  const mode = useAppSelector((state: RootState) => state.selection.mode);

  const graphemeFilterDirection = useAppSelector(
    (state) => state.selection.graphemeFilterDirection
  );
  const tileSize = mode === "graphemes" ? 60 : (selectedN + 1) * 20;
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

  return (
    <section css={fullGlyphsSection}>
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: graphemeFilterDirection === "left" })}
          onClick={() => dispatch(setGraphemeFilterDirection("left"))}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={cx({ active: graphemeFilterDirection === "off" })}
          onClick={() => dispatch(setGraphemeFilterDirection("off"))}
        >
          Off
        </button>
        <button
          className={cx({ active: graphemeFilterDirection === "right" })}
          onClick={() => dispatch(setGraphemeFilterDirection("right"))}
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      <div css={headerSwitcher}>
        <button
          className={cx({ active: mode === "graphemes" })}
          onClick={() => {
            dispatch(setMode("graphemes"));
          }}
        >
          Graphemes
        </button>
        <button
          className={cx({ active: mode === "ngrams" })}
          onClick={() => {
            dispatch(setMode("ngrams"));
          }}
        >
          NGrams
        </button>
      </div>
      {mode === "ngrams" ? (
        <div css={nGramSize}>
          <span>Size (n)</span>
          {[2, 3, 4].map((num) => {
            return (
              <button
                className={cx({ active: selectedN === num })}
                key={num}
                onClick={() => dispatch(setN(num))}
              >
                {num}
              </button>
            );
          })}
        </div>
      ) : null}
      <div css={ngramsGrid}>
        {mode === "graphemes" ? (
          <Graphemes tileSize={tileSize} />
        ) : (
          <NGrams tileSize={tileSize} />
        )}
      </div>
    </section>
  );
}

export default FullGlyphsSection;
