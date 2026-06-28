import { InnerImageZoom } from "react-inner-image-zoom";
import { isEmpty } from "lodash";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { css } from "@emotion/react";
import { cx } from "@emotion/css";

import { useSelectionStore } from "../data/state";
import { useContexts, useDbImageUrl } from "../data/queries";
import Tile from "../components/Tile";

import Section from "./Section";

const contextsWrapper = css`
  padding: 0 12px;
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

const filterDirectionSection = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  flex: 0 0 auto;
  margin: 8px 0;

  button {
    font-size: 16px;
    margin: 0 0 2px 2px;
  }
`;

function ContextImage(props: { imageId: number }) {
  const url = useDbImageUrl(props.imageId);
  if (!url) return null;
  // TODO: placeholder image box
  return <InnerImageZoom hideHint css={contextImg} zoomScale={2} src={url} />;
}

function ContextsSection() {
  const selectedWord = useSelectionStore((s) => s.selectedWord);
  const wordFilterDirection = useSelectionStore((s) => s.wordFilterDirection);
  const selectedContext = useSelectionStore((s) => s.selectedContext);
  const contextFilterDirection = useSelectionStore(
    (s) => s.contextFilterDirection
  );
  const toggleSelectedContext = useSelectionStore(
    (s) => s.toggleSelectedContext
  );
  const setContextFilterDirection = useSelectionStore(
    (s) => s.setContextFilterDirection
  );

  const allCtxs = useContexts();

  let filteredContexts = allCtxs;
  if (allCtxs && selectedWord) {
    filteredContexts = allCtxs.filter((ctx) =>
      ctx.words.includes(selectedWord)
    );
  }

  let ctxs =
    selectedWord && wordFilterDirection === "right"
      ? filteredContexts
      : allCtxs;
  if (isEmpty(ctxs) || ctxs == undefined) ctxs = [];
  ctxs = ctxs.slice().reverse();

  return (
    <Section title="Contexts">
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: contextFilterDirection === "left" })}
          onClick={() => setContextFilterDirection("left")}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={cx({ active: contextFilterDirection === "off" })}
          onClick={() => setContextFilterDirection("off")}
        >
          Off
        </button>
      </div>
      <div css={contextsWrapper}>
        {ctxs.map((ctx) => (
          <Tile
            align="start"
            key={ctx.id}
            active={selectedContext === ctx.id}
            toggleFn={toggleSelectedContext}
            val={ctx.id}
          >
            <div
              css={imgRow}
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
              <div css={imgScrollWrapper}>
                {ctx.imageId != null ? (
                  <ContextImage imageId={ctx.imageId} />
                ) : null}
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}

export default ContextsSection;
