import InnerImageZoom from "react-inner-image-zoom";
import { isEmpty } from "lodash";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { css } from "@emotion/react";
import { cx } from "@emotion/css";

import {
  selectContextFilterDirection,
  selectSelectedContext,
  selectSelectedWord,
  selectWordFilterDirection,
} from "../selectors";
import {
  useGetContextWordJunctionsQuery,
  useGetContextsQuery,
} from "../redux/services/data";
import {
  setContextFilterDirection,
  setSelectedContext,
} from "../redux/reducers/selection";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
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

function ContextsSection() {
  const dispatch = useAppDispatch();
  const selectedWord = useAppSelector(selectSelectedWord);
  const wordFilterDirection = useAppSelector(selectWordFilterDirection);
  const selectedContext = useAppSelector(selectSelectedContext);

  const { data: allCtxs } = useGetContextsQuery();
  const { data: junctions } = useGetContextWordJunctionsQuery();

  let filteredContexts = allCtxs;
  if (junctions && allCtxs && selectedWord) {
    const filteredContextIds = junctions
      .filter((j) => j.words_id === selectedWord)
      .map((j) => j.contexts_id);
    filteredContexts = allCtxs.filter((ctx) =>
      filteredContextIds.includes(ctx.id)
    );
  }

  let ctxs =
    selectedWord && wordFilterDirection === "right"
      ? filteredContexts
      : allCtxs;
  if (isEmpty(ctxs) || ctxs == undefined) ctxs = [];
  ctxs = ctxs.slice().reverse();

  const contextFilterDirection = useAppSelector(selectContextFilterDirection);

  return (
    <Section title="Contexts">
      <div css={filterDirectionSection}>
        <button
          className={cx({ active: contextFilterDirection === "left" })}
          onClick={() => dispatch(setContextFilterDirection("left"))}
        >
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          className={cx({ active: contextFilterDirection === "off" })}
          onClick={() => dispatch(setContextFilterDirection("off"))}
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
            onClick={() => {
              if (selectedContext !== ctx.id) {
                dispatch(setSelectedContext(ctx.id));
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
                {ctx.image ? (
                  <InnerImageZoom
                    hideHint
                    css={contextImg}
                    zoomScale={2}
                    src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${
                      ctx.image
                    }`}
                  ></InnerImageZoom>
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
