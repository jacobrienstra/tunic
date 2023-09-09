import Section from "./Section";
import { css } from "@emotion/react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import InnerImageZoom from "react-inner-image-zoom";
import {
  useGetContextsForWordQuery,
  useGetContextsQuery,
} from "../redux/services/data";
import Tile from "../components/Tile";
import {
  selectContextFilterDirection,
  selectSelectedContext,
  selectSelectedWord,
  selectWordFilterDirection,
} from "../selectors";
import {
  setContextFilterDirection,
  setSelectedContext,
} from "../redux/reducers/selection";
import { cx } from "@emotion/css";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

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
  const wordFilterDireciton = useAppSelector(selectWordFilterDirection);
  const selectedContext = useAppSelector(selectSelectedContext);

  const { data: allCtxs } = useGetContextsQuery();
  const ctxs =
    (selectedWord && wordFilterDireciton === "right"
      ? useGetContextsForWordQuery(selectedWord.id).data
      : allCtxs) ?? [];
  // .sort((a, b) => {
  //     if (a === selectedContext) return -1;
  //     if (b === selectedContext) return 1;
  //     else return a.localeCompare(b);
  //   });

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
            active={selectedContext?.id === ctx.id}
            onClick={() => {
              if (selectedContext?.id !== ctx.id) {
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
                  src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${
                    ctx.image
                  }`}
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
