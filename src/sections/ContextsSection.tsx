import { RootState } from "../redux/store";
import Section from "./Section";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import InnerImageZoom from "react-inner-image-zoom";
import { createSelector } from "@reduxjs/toolkit";
import { selectAllWords } from "../redux/reducers/data";

const contextsWrapper = css`
  max-width: 25vw;
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
  const selectSelectedWord = (state: RootState) => state.selection.selectedWord;
  const selectedWord = useSelector(selectSelectedWord);
  const selectAllCtxs = createSelector([selectAllWords], (words) => {
    return words.reduce((acc, word) => {
      word.ctxs.forEach((ctx) => acc.add(ctx));
      return acc;
    }, new Set<string>());
  });
  const allCtxs = useSelector(selectAllCtxs);

  const ctxs = selectedWord ? selectedWord.ctxs : Array.from(allCtxs);

  return (
    <Section title="Contexts">
      <div css={contextsWrapper}>
        {ctxs.map((ctx) => (
          <div css={imgRow} key={ctx}>
            <div css={imgScrollWrapper}>
              <InnerImageZoom
                hideHint
                css={contextImg}
                zoomScale={2}
                src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${ctx}`}
              ></InnerImageZoom>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
