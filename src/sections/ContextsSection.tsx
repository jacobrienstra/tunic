import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import Section from "./Section";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";

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
  const selectCurWord = (state: RootState) => state.selection.word;
  const curWord = useSelector(selectCurWord);

  return (
    <Section title="Contexts" style={{ flex: "0 1 auto" }}>
      <div css={contextsWrapper}>
        {curWord?.ctxs.map((ctx) => (
          <div css={imgRow} key={ctx}>
            <div css={imgScrollWrapper}>
              <img
                css={contextImg}
                src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${ctx}`}
              ></img>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
