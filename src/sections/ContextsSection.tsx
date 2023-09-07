import Section from "./Section";
import { css } from "@emotion/react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import InnerImageZoom from "react-inner-image-zoom";
import { createSelector } from "@reduxjs/toolkit";
import { selectAllWords } from "../redux/reducers/data";
import Tile from "../components/Tile";
import { setSelectedContext } from "../redux/reducers/selection";

const contextsWrapper = css`
  padding: 12px;
  overflow-y: scroll;
`;

const imgRow = css`
  max-width: 100%;
  margin: 8px 0;
`;

const imgScrollWrapper = css`
  max-width: 100%;
  overflow-x: scroll;
  height: 100%;
`;

const contextImg = css`
  max-height: 100%;
  border-radius: 6px;
`;

function ContextsSection() {
  const dispatch = useAppDispatch();
  const selectedWord = useAppSelector((state) => state.selection.selectedWord);
  const selectAllCtxs = createSelector([selectAllWords], (words) => {
    return words.reduce((acc, word) => {
      word.ctxs.forEach((ctx) => acc.add(ctx));
      return acc;
    }, new Set<string>());
  });
  const allCtxs = useAppSelector(selectAllCtxs);
  const ctxs = selectedWord ? selectedWord.ctxs : Array.from(allCtxs);

  const selectedContext = useAppSelector(
    (state) => state.selection.selectedContext
  );

  return (
    <Section title="Contexts">
      <div css={contextsWrapper}>
        {ctxs.map((ctx) => (
          <Tile
            align="start"
            key={ctx}
            active={selectedContext === ctx}
            onClick={(event: React.MouseEvent) => {
              if (selectedContext !== ctx) {
                dispatch(setSelectedContext(ctx));
              } else {
                dispatch(setSelectedContext(null));
              }
            }}
          >
            <div
              css={imgRow}
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
              <div css={imgScrollWrapper}>
                <InnerImageZoom
                  hideHint
                  css={contextImg}
                  zoomScale={2}
                  src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${ctx}`}
                ></InnerImageZoom>
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
