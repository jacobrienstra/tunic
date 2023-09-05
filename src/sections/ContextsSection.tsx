import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import Section from "./Section";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import InnerImageZoom from "react-inner-image-zoom";

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
  border-radius: 6px;
`;

const contextImg = css`
  max-height: 100%;
`;

function ContextsSection() {
  const selectSelectedWord = (state: RootState) => state.selection.selectedWord;
  const selectedWord = useSelector(selectSelectedWord);

  return (
    <Section title="Contexts">
      <div css={contextsWrapper}>
        {selectedWord?.ctxs.map((ctx) => (
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
